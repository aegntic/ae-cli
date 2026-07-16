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
- **Billing:** reserve estimated cost at QUEUED; settle actual on COMPLETED; refund diff on FAILED.
- **Security:** keys hashed (argon2), never logged; provider secrets in env/vault only.
- **Observability:** every run emits structured log; build-log + run-log are the audit trail.

⟦Stack ADR pending — see PRD open questions.⟧
