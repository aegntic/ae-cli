# Build Log

Append-only chronological record. One entry per build/commit batch. Format:

```
## [YYYY-MM-DD HH:MM] build | <subject>
- changed: <paths>
- verified: <how>
- next: <step>
```

---

## [2026-07-17 07:23] build | workspace bootstrap
- changed: README.md, AGENTS.md, docs/{roadmap,build-log,decisions/0001-0003}, docs/spec/PRD, docs/content/*, .gitignore, LICENSE
- verified: cognitive-os suite green (116/116); recon confirmed ae-cli + @aegntic-ai/cli do not yet exist (build target is real)
- next: ADR-0004 stack pick (await market-research agent), pnpm/turbo wiring, first vertical slice scaffold

## [2026-07-17 07:28] build | decisions locked + repo live + work tracked
- changed: docs/decisions/0004-stack.md, 0005-billing-model.md, 0006-merge-agent-handler-reference.md; docs/spec/PRD.md (competitive ctx + billing + stack + demo arc); docs/spec/architecture.md (stack + adapter contract)
- repo: github.com/aegntic/ae-cli created PRIVATE (ADR-0002), main pushed (commit 4c81112)
- discovery: `merge` CLI (pipx merge-api 0.3.5) → backend `https://ah-api.merge.dev` ("Agent Handler"), 100+ connectors, near-identical UX → reference impl + catalog seed (ADR-0006)
- tracker: bd (beads) initialized; P1 epic + 8 tasks seeded
- verified: bd stats OK; market-research brief sources cited; no secrets in tree
- next: P1 phase 1 — pnpm/turbo monorepo init + tsconfig/eslint/vitest base (≤5 files)

## [2026-07-17 07:33] build | P1 phase 1 — monorepo tooling
- changed: package.json (vitest + @types/node + engines/desc/license + turbo bump), tsconfig.base.json, .npmrc, pnpm-lock.yaml; bd scaffold already contributed pnpm-workspace.yaml + turbo.json
- verified: `pnpm install` exit 0 across 5 workspace projects; turbo 2.10.5, vitest 2.1.9, tsc 5.9.3 resolve
- next: ~~P1 phase 2 — packages/sdk typed client skeleton (shared types: Tool, Run, Balance) + first vitest test~~ (superceded by full scaffold below)

## [2026-07-17 07:45] build | FULL MONOREPO SCAFFOLD + CHECKPOINT 1: FIRST RUN
- changed: 28 files, 1990 insertions
  - packages/sdk/src/index.ts — 130+ lines of shared types (Provider, Endpoint, Run, Balance, ApiKey, ProviderAdapter, ClientConfig)
  - packages/cli/ — 9 citty commands (discover, inspect, run, runs, balance, keys, setup) + HTTP client + config manager
  - services/gateway/ — Hono server with auth middleware, mock provider (12 endpoints), 5 route files (discover, inspect, runs, balance, keys), in-memory store
  - apps/web/ — Next.js 15 landing page: dark theme, 18 tool cards, hero with terminal animation, 3-step flow, one-balance section, 3 connection methods
  - docs/decisions/ — ADR-0004 (stack: Hono + citty + Drizzle + Postgres + Turborepo), ADR-0005 (provider adapter pattern)
  - Root: pnpm-workspace.yaml, turbo.json, tsconfig.json, .env.example
- verified: `pnpm install` (315 packages), `turbo run build` (4/4 packages successful, 8.8s), gateway e2e test
- **CHECKPOINT 1 VERIFIED** — full vertical slice end-to-end:
  1. POST /v1/discover?q=twitter → 2 endpoints found (twitter/posts, twitter/user)
  2. GET /v1/inspect?provider=mock&endpoint=twitter/posts → schema with $0.005/result
  3. POST /v1/runs → run created (ru9FeVxi8pnW), status RUNNING
  4. GET /v1/runs/ru9FeVxi8pnW → COMPLETED, 3 items, cost $0.015
  5. GET /v1/balance → $9.985 (debited from $10.00)
- fix: normalized endpoint path lookup (strip leading slash) — commit c83acf9
- pushed: github.com/aegntic/ae-cli main (7a357b6..c83acf9)
- next: P2 — real provider adapter (Apify), real billing, workspaces + API keys, deploy gateway

## [2026-07-17 08:15] build | P2 Phase 1 — e2e contract unblock (worktree-p2)
- branch: worktree-p2 (off caf8964)
- changed: packages/cli/src/lib/client.ts, services/gateway/src/routes/{discover,runs}.ts
- fixed: (1) client inspect/createRun paths aligned to real routes; (2) POST /v1/runs now returns ApiResponse envelope (client reads .data.id); (3) discover accepts GET (was POST-only, CLI 404'd)
- verified: bg e2e agent — discover→inspect→run(JEjdiF6Z0EwS, 3 items, $0.015)→runs get→balance $9.98. All 5 steps green.
- commit: 0799dc5
- next: Phase 2a — postgres persistence

## [2026-07-17 08:40] build | P2 Phase 2a — postgres + append-only ledger schema
- changed: services/gateway/src/db/{schema,client,seed}.ts (new), drizzle.config.ts (new), migrations/0000_init.sql (generated), services/gateway/package.json (db scripts), .env.example
- schema: workspaces, api_keys (sha256 hash, unique), runs (jsonb, idempotency unique), balance_ledger (append-only, bigint identity pk). balance DERIVED from ledger via computeBalance() — no mutable balance column.
- seed: idempotent (ws_default + test key hash + $10 topup), guarded by import.meta.main
- verified: drizzle-kit migrate applied (4 tables), seed idempotent across runs, ledger shows topup 10.0000, test key present
- infra: dockerized postgres `aegntic-pg` (postgres:16-alpine) on localhost:5434
- commit: 2522b03
- next: Phase 2b — async store wiring + billing correctness (charge actual, no-charge-on-fail)

## [2026-07-17 09:05] build | P2 Phase 2b — async DB-backed store + ledger billing
- changed: services/gateway/src/{store.ts (rewrite), middleware/auth.ts, routes/{balance,keys,runs}.ts, index.ts}
- store.ts: all exports async, postgres-backed via drizzle. charge()/refund() write append-only ledger rows. balance DERIVED via computeBalance(). dropped in-memory Maps + holdBalance/deductBalance.
- billing fix: executeAsync charges ACTUAL cost (result.cost) on success, NOTHING on failure (was: estimate on both paths). Failed runs are free.
- consumers awaited (auth, balance, keys×3, runs×4). index.ts boot-calls seedDefaults().
- verified: bg e2e+ledger agent — boot ok, balance $10→$9.98 (delta -$0.015 exact), ledger shows topup 10.0000 + charge 0.0150 (run_id+amount match), RESTART persistence (balance stays $9.98, not reset — proves DB-derived). typecheck 5/5.
- known limitation: no hold/reserve → concurrent runs can overdraw (single-user demo safe; hold/release ledger entries = hardening step).
- untested branch: failed-run-no-charge (no CLI path triggers FAILED post-creation) — unit test to follow.
- commit: (this commit)
- next: Phase 2c — billing unit tests (failure path + ledger invariants), then Apify adapter
