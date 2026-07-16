# Architecture — aegntic

> Skeleton. Firmed by ADR-0004 (stack) after market research returns.

## System map (target)

```
            ┌─────────────┐   discover/inspect/run    ┌──────────────────┐
 agent ───▶ │ aegntic CLI │ ◀──────────────────────▶ │                  │
 (MCP)      │  (packages/  │   HTTPS + API key        │   GATEWAY        │
 dev ─────▶ │   cli)       │                          │ services/gateway │
            └──────┬──────┘                          │                  │
                   │ typed SDK                        │  ┌────────────┐  │
                   ▼                                  │  │ catalog    │  │
            ┌─────────────┐                          │  │ adapter[]  │  │──▶ Apify / providers
 dashboard  │  apps/web   │ ◀─────────────────────▶ │  │ runs/jobs  │  │
 ops ─────▶ │ (Next.js)   │                          │  │ billing    │  │
            └─────────────┘                          │  │ auth/keys  │  │
                                                     │  └────────────┘  │
                                                     │        │         │
                                                     │     Postgres     │
                                                     │   (balance,      │
                                                     │    runs, keys)   │
                                                     └──────────────────┘
```

## Core data model (draft)
- **Workspace** — owner of keys, balance, runs.
- **ApiKey** — label, hash, active. Scoped to workspace.
- **Balance** — prepaid credit (integer cents/micros). Decremented on run completion.
- **Provider** — adapter namespace (apify, …).
- **Endpoint** — `{provider, path}`; cached schema (input, cost model).
- **Run** — id, workspace, endpoint, input, status (QUEUED/RUNNING/COMPLETED/FAILED), result_uri, cost, created/updated, idempotency key.

## Core endpoints (draft)
- `POST /v1/discover?q=` → ranked endpoints
- `GET /v1/inspect?provider=&endpoint=` → schema
- `POST /v1/runs` → create run (idempotent)
- `GET /v1/runs/:id` → status + result
- `GET /v1/balance`
- `POST /v1/keys` / `GET /v1/keys` (dashboard)

## Cross-cutting
- **Idempotency:** `Idempotency-Key` header on `POST /v1/runs`.
- **Billing (ADR-0005):** append-only `balance_ledger`; reserve estimate at QUEUED; settle actual `result_count × unit_cost × 1.25` on COMPLETED; refund on FAILED. Balance never negative.
- **Security:** keys hashed (argon2), never logged; provider secrets in env/vault only; SECURITY GATE before billing endpoints ship.
- **NL discovery:** pgvector on `tools` (embed `description` + `input_schema`), hybrid with BM25 over slug/tags.
- **Observability:** every run emits structured log; build-log + run-log are the audit trail.

## Stack (ADR-0004)
Hono on Bun (gateway) · Supabase Postgres + pgvector · Upstash QStash · oclif v4 (CLI) · Next.js 15 (web) · Stripe Checkout + webhooks · OpenAI text-embedding-3-small.

## Provider adapter contract (ADR-0006)
```ts
interface ProviderAdapter {
  searchTools(q: string): ToolManifest[];      // registered at boot
  resolveTool(slug: string): ToolDefinition;
  estimateCost(tool: string, input: unknown): CostEstimate;
  startRun(tool: string, input: unknown, idemKey: string): Promise<{providerRunId, pollIntervalMs}>;
  pollRun(providerRunId: string): Promise<RunStatus>;
  fetchResults(providerRunId: string, offset, limit): Promise<ResultPage>;
  cancelRun?(providerRunId: string): Promise<void>;
}
```
