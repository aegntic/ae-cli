---
title: "Aegntic gateway — parallel persistence systems caused 404 on discover and 401 on auth"
date: 2026-07-18
category: integration-issues
problem_type: integration-issues
component: gateway
severity: critical
symptoms:
  - "/v1/discover returns 404 — routes query empty Postgres `tools` table, not provider registry"
  - "Auth middleware returns 401 on every key — argon2 vs sha256 mismatch across stores"
  - "/v1/runs fails — tool lookup cannot resolve provider-scoped tools"
  - "/v1/balance fails — no key resolution path consistent between stores"
  - "/v1/keys admin paths split between Drizzle and JSON store"
root_cause_summary: "Two parallel persistence systems (Drizzle/Postgres with argon2 + legacy JSON store with sha256) were introduced without reconciliation. Auth middleware and routes were rewritten to Postgres, but the provider registry remained the source of truth for tool discovery. Keys existed in both stores, hashed with different algorithms, so every request hit a different persistence layer than the route or middleware expected. Discover queried the empty `tools` table instead of the registry, and auth verified against the wrong hash store, producing 404 and 401 on every request."
tags:
  - aegntic
  - gateway
  - drizzle
  - postgres
  - argon2
  - sha256
  - persistence
  - provider-registry
  - tool-discovery
  - auth
  - dual-store
  - reconciliation
  - integration-issue
  - 404
  - 401
---

# P2 Dual-System Conflict — Gateway Persistence Reconciliation

## Problem

The Aegntic gateway (`services/gateway/`) shipped Checkpoint 1 with a JSON-file store + provider registry. During P2 (real provider + real billing), a subagent introduced a parallel Drizzle/Postgres system (with `db/schema.ts`, `db/seed.ts`, `db/index.ts` and argon2 key hashing) **alongside** the existing JSON store, then rewrote the auth middleware and route handlers to use Postgres. The new and old systems were never reconciled:

- The `tools` table in Postgres had only 2 seeded rows with Apify paths (`/apidojo/tweet-scraper`), while the provider registry had 18 endpoints (mock + apify) with paths like `twitter/posts` and `linkedin/posts`.
- The auth middleware verified keys against `argon2` hashes in `apiKeys` table, while the JSON store still hashed with `sha256`. Same key, two different hashes, two stores.
- The runs route looked up tools in the empty `tools` table instead of the provider registry, so every `/v1/runs` call returned 404.

### Symptoms observed

```bash
# Every request failed with 401 or 404
POST /v1/discover?q=twitter   → 404
GET  /v1/balance             → 401
POST /v1/runs                → 404 (tool not found)
```

The gateway log showed:
```
APIFY_TOKEN not set. Apify adapter will fall back to MockAdapter.
aegntic gateway listening on :3100
Database seed check complete.
```

…but the routes were querying the wrong data source for every request.

## Root Cause

Two persistence systems tried to be the source of truth at the same time:

| Concern | Old (JSON store) | New (Drizzle/Postgres) | Which one was used? |
|---|---|---|---|
| API key storage | JSON file, sha256 | `apiKeys` table, argon2 | Auth middleware used Postgres; keys still lived in both |
| Tool catalog | `providers/registry.ts` (18 endpoints) | `tools` table (2 rows) | Routes used Postgres; registry was correct but unreachable |
| Run records | `runs` in JSON | `jobs` in Drizzle | Mixed — runs route used Postgres for everything |
| Balance | `BalanceRecord` in JSON | `balanceLedger` table | Routes used Postgres; JSON balance was stale |

The architectural rule — "one source of truth per concern" — was violated. When the P2 subagent introduced Drizzle, it should have either (a) replaced the JSON store entirely, or (b) drawn a clear interface boundary between what lives where. It did neither.

## Working Solution

Three files changed. The pattern: **registry for tools, Drizzle for durable state, no JSON store anywhere.**

### Change 1: `middleware/auth.ts` — Postgres + argon2 (one source of truth for keys)

```ts
// services/gateway/src/middleware/auth.ts:29-46
const keys = await db
  .select()
  .from(apiKeys)
  .where(eq(apiKeys.prefix, prefix))

let matchedKey = null
for (const key of keys) {
  if (!key.active) continue
  const isMatch = await argon2.verify(key.keyHash, rawKey)
  if (isMatch) {
    matchedKey = key
    break
  }
}
```

Look up by `prefix` (first 20 chars) — narrow scan, then `argon2.verify` against the stored `keyHash`. `lastUsedAt` is updated fire-and-forget so the request isn't blocked on the write.

### Change 2: `routes/discover.ts` + `routes/inspect.ts` — Registry is the source of truth for tools

```ts
// routes/discover.ts:11-13
const results = searchProviders(q)
  .filter((e) => (e.relevanceScore ?? 0) >= minScore)
  .slice(0, limit)
```

```ts
// routes/inspect.ts:15-18
const ep = getEndpoint(provider, endpoint)
if (!ep) {
  return c.json({ error: `Endpoint ${provider}/${endpoint} not found` }, 404)
}
```

The `tools` Postgres table is gone from the read path. `searchProviders` and `getEndpoint` from `providers/registry.js` are the only functions the discover/inspect routes use to interact with the tool surface.

### Change 3: `routes/runs.ts` — Registry for execution, Drizzle for persistence

```ts
// routes/runs.ts:37-44  — registry for tool lookup + cost estimate
const ep = getEndpoint(provider, endpoint)
if (!ep) {
  return c.json({ error: `Tool not found: ${provider}/${endpoint}` }, 404)
}
const adapter = getProvider(provider)
const estimatedCost = adapter ? await adapter.estimateCost(endpoint, input || {}) : 0.01
```

```ts
// routes/runs.ts:48-52  — Drizzle for balance (sum of ledger deltas)
const ledgerSum = await db
  .select({ total: sum(balanceLedger.deltaCents) })
  .from(balanceLedger)
  .where(eq(balanceLedger.workspaceId, workspaceId))
const balanceCents = ledgerSum[0]?.total ? parseInt(ledgerSum[0].total, 10) : 0
```

```ts
// routes/runs.ts:81-90  — Drizzle for run record
await db.insert(jobs).values({
  id: jobId,
  workspaceId, provider, endpoint,
  input: input || {},
  status: "RUNNING",
  idempotencyKey: idempotencyKey || null,
  stoppable: true,
  createdAt: now,
  updatedAt: now,
})
// then: executeAsync(...)  // uses registry adapter
```

### Why the fix works

| Concern | Source of truth |
|---|---|
| What tools exist + how to call them | `providers/registry.ts` (in-process) |
| Durable state: keys, runs, balances | Drizzle/Postgres |

`getEndpoint`, `getProvider`, `searchProviders` are the only entry points routes use to interact with the tool surface. `db.select/insert/update` is the only persistence entry point. No route reads or writes the old JSON store. The two systems don't fight because their responsibilities don't overlap.

### Interface boundary

```
            ┌──────────────────────┐
            │  providers/registry  │   source of truth: TOOLS
            │  ──────────────────  │
            │  searchProviders(q)  │
            │  getEndpoint(p,e)    │
            │  getProvider(p)      │
            └──────────┬───────────┘
                       │  tool lookup + execute()
                       │
   ┌───────────────────┴────────────────────┐
   │                                        │
┌──┴──────────────┐              ┌──────────┴────────┐
│ discover /      │              │  routes/runs.ts   │
│ inspect routes  │              │  ─────────────    │
│ (read-only on   │              │  registry → exec  │
│  registry)      │              │  Drizzle → jobs   │
└─────────────────┘              │  Drizzle → ledger │
                                 └──────────┬────────┘
                                            │
                                  ┌─────────┴────────┐
                                  │  Drizzle/Postgres│   source of truth: STATE
                                  │  apiKeys (argon2)│
                                  │  jobs (runs)     │
                                  │  balanceLedger   │
                                  └──────────────────┘
```

## Prevention

### Architectural rule

**One source of truth per concern.** Tools live in the provider registry. Durable state (keys, runs, balances) lives in the database. Never both. When introducing a new persistence layer, retire the old one in the same change.

### Code review checklist

When adding a new persistence layer or rewriting a route:
1. `grep -r "old_layer_import" src/routes/` — must return zero results in the new code
2. `grep -r "new_layer_import" src/` — must cover every route that touches the concern
3. The old layer's data should be migrated or its API should return `undefined` everywhere
4. Every route that reads or writes the concern must use exactly one import

### Integration test (would have caught this immediately)

```ts
// tests/integration/gateway.test.ts
test("full chain: discover → inspect → run → poll → balance", async () => {
  const auth = { Authorization: `Bearer ${TEST_KEY}` }
  const baseUrl = process.env.GATEWAY_URL || "http://localhost:3200"

  const d = await fetch(`${baseUrl}/v1/discover?q=twitter`, {
    method: "POST", headers: auth,
  })
  expect(d.status).toBe(200)
  const { results } = (await d.json()).data
  expect(results.length).toBeGreaterThan(0)

  const i = await fetch(`${baseUrl}/v1/inspect?provider=${results[0].provider}&endpoint=${results[0].path}`, { headers: auth })
  expect(i.status).toBe(200)

  const r = await fetch(`${baseUrl}/v1/runs`, {
    method: "POST", headers: { ...auth, "Content-Type": "application/json" },
    body: JSON.stringify({ provider: results[0].provider, endpoint: results[0].path, input: { queryParams: { q: "test", limit: "3" } } }),
  })
  expect(r.status).toBe(201)
  const runId = (await r.json()).data.id

  await new Promise((resolve) => setTimeout(resolve, 2000))
  const p = await fetch(`${baseUrl}/v1/runs/${runId}`, { headers: auth })
  expect(p.status).toBe(200)
  expect((await p.json()).data.status).toBe("COMPLETED")

  const b = await fetch(`${baseUrl}/v1/balance`, { headers: auth })
  expect(b.status).toBe(200)
})
```

### Agent prompt discipline

When dispatching a subagent to build a new persistence layer or rewrite routes, the prompt must include:

1. **Inventory first**: "List every existing persistence layer, every route that touches it, and every import of the old store. Do not write code until this is done."
2. **One source of truth**: "You will introduce exactly one persistence layer for [concern]. The old layer's routes and middleware must be updated in the same change. The old layer's data must be migrated or marked dead."
3. **Reconciliation commit**: "Your final commit must include: (a) the new layer, (b) every route migrated, (c) the old layer's imports removed, (d) an integration test that exercises the full chain."

A subagent that adds a new system without retiring the old one is producing tech debt, not progress.

## Related

- **ADRs**:
  - [`docs/decisions/0004-stack-typescript-hono-citty-drizzle.md`](../../decisions/0004-stack-typescript-hono-citty-drizzle.md) — the stack that was actually built (Hono + Drizzle + Postgres + DB-polling)
  - [`docs/decisions/0005-provider-adapter-pattern.md`](../../decisions/0005-provider-adapter-pattern.md) — registry as the source of truth for tool adapters
  - [`docs/decisions/0005-billing-model.md`](../../decisions/0005-billing-model.md) — append-only `balance_ledger` model
- **Specs**:
  - [`docs/spec/architecture.md`](../../spec/architecture.md) — system map
  - [`docs/spec/PRD.md`](../../spec/PRD.md) — core capabilities
- **Build log**:
  - [`docs/build-log.md`](../../build-log.md) — Checkpoint 1 entry, P2 forward-pointer
- **Roadmap**:
  - [`docs/roadmap.md`](../../roadmap.md) — P2 definition (this fix unblocks P2)
- **Beads**:
  - `ae-cli-ht3` — Gateway: Apify provider adapter (closed)
  - `ae-cli-mvs` — Gateway: Stripe Checkout + Webhook integration (closed)
  - `ae-cli-udt` — Supabase schema: workspaces, api_keys, balance_ledger, tools, jobs (closed)
  - `ae-cli-dtp` — Checkpoint 2: "Real Money" content updates (closed)

## Execution Context

The conflict was introduced during P2 (real provider + real billing), which was implemented by a subagent on 2026-07-17 between 12:25 (beads creation) and 15:43 (P2 closure). The P2 work landed in beads as `ae-cli-ht3` (Apify adapter) and `ae-cli-mvs` (Stripe webhook), but the conflict itself was never logged in `docs/build-log.md` — the build-log's last entry is the 12:12 Checkpoint 1 close. The first time anyone saw the 404/401 was during the post-P2 end-to-end verification on 2026-07-18.

The fix required:
1. Diagnosing that `tools` table was empty while `providers/registry.ts` had 18 endpoints (one `docker exec psql` query away)
2. Checking `auth.ts` import to see which hash store the middleware was checking
3. Rewriting three route files to use the registry for tool lookup, keeping Drizzle for persistence only
4. Rebuilding and restarting the gateway, then verifying the full chain end-to-end

Time-to-diagnose: ~15 minutes once the 404/401 pattern was clear. Time-to-fix: ~5 minutes. The fix itself was small; the diagnosis was the hard part because the symptoms (404, 401) looked like missing routes and bad keys, not a parallel-system conflict.

Session reference: `docs/execution-sessions/work-2026-07-18-p2-gateway-reconciliation/`
