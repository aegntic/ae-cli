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
- next: P1 phase 2 — packages/sdk typed client skeleton (shared types: Tool, Run, Balance) + first vitest test

## [2026-07-17 12:12] build | P1 vertical slice complete
- changed: packages/sdk/src/index.ts, packages/sdk/tests/index.test.ts, packages/sdk/package.json, services/gateway/src/db/schema.ts, services/gateway/src/db/index.ts, services/gateway/src/db/seed.ts, services/gateway/src/middleware/auth.ts, services/gateway/src/routes/discover.ts, services/gateway/src/routes/inspect.ts, services/gateway/src/routes/balance.ts, services/gateway/src/routes/keys.ts, services/gateway/src/routes/runs.ts, services/gateway/src/index.ts, services/gateway/drizzle.config.ts, packages/cli/src/utils/config.ts, packages/cli/src/commands/keys.ts, packages/cli/src/commands/setup.ts, packages/cli/src/commands/discover.ts, packages/cli/src/commands/inspect.ts, packages/cli/src/commands/run.ts, packages/cli/src/commands/runs.ts, packages/cli/src/commands/balance.ts, packages/cli/tests/config.test.ts, docs/spec/security_review.md
- verified: pnpm build successful across all monorepo packages. Vitest unit tests pass for both CLI and SDK. Dev server launched with seeding running correctly. CLI commands tested (setup, keys, balance, discover, inspect, run) end-to-end against live Hono gateway, executing async runs and ledger charging correctly.
- next: P2 real provider adapter integration + real billing Stripe webhook + dashboard auth hooks.

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
