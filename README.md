⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠛⠷⠄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
### Hello world 👋🏻

# aegntic — @aegntic-ai/cli

**One CLI. One balance. Every data tool.**

`aegntic discover -q "scrape linkedin"` → ranked endpoints → `aegntic run <tool>` → live results → signed ledger charge.

---

## The Wedge

Agents and devs waste cycles hand-rolling scrapers, wiring auth, guessing at data APIs. Hundreds of providers exist (Apify, enrichment, search) but discovery is fragmented and execution is provider-specific glue.

**aegntic reverses the loop:** the catalog *is* the product. Agents that `discover first` never hand-roll — that habit is the business.

---

## Status: Checkpoint 2 ✅ | Checkpoint 3 🏗️ | Launch 🔒

| Checkpoint | Status | Evidence |
|---|---|---|
| **P1 Vertical Slice** | ✅ | `discover → inspect → run → poll → balance` end-to-end |
| **P2 Real Money** | ✅ | Live Open-Meteo runs, append-only ledger, failed runs free |
| **P3 Dashboard Live** | 🏗️ | `/app` console: keys, balance (4dp), run history, auto-poll |
| **P4 Launch** | 🔒 | Security gate (gitleaks + opensource-sanitizer) → public flip |

**Current HEAD:** `feat/unified-signed-persistence` — signed hash-chain ledger + 3 real providers (HackerNews, CoinGecko, Frankfurter) + honest reliability leaderboard on real telemetry.

---

## What Runs Today

```bash
# One-time setup
aegntic setup                    # writes ~/.config/aegntic/config.json
aegntic keys add --label dev     # mints aegntic_live_<nanoid>, saves locally

# Discover & run (real providers, real billing)
aegntic discover -q "weather"           # → openmeteo/weather/current
aegntic inspect openmeteo/weather/current
aegntic run openmeteo/weather/current --query '{"latitude":52.52,"longitude":13.41}'
aegntic runs get <run-id>               # poll until COMPLETED
aegntic balance                         # 4dp precision ($9.9840)
```

**Providers live:** `openmeteo`, `hackernews`, `coingecko`, `frankfurter` (18 tools, 6 providers).  
**Catalog search:** pgvector semantic + full-text fallback.  
**Billing:** Prepaid balance, per-result (`cost = items × unit × 1.25`), append-only ledger, balance derived (no mutable column), survives restart.  
**Audit:** `GET /v1/balance/audit` → Ed25519 hash-chain verification.

---

## Architecture (ADR-0004)

| Layer | Pick | Why |
|---|---|---|
| Monorepo | pnpm + Turborepo | Shared types, fast builds |
| CLI | **citty** (UnJS) | ESM-native, tiny, modern agent DX |
| Gateway | **Hono** | Edge-native, fast, great TS DX |
| SDK | Pure TS | Zero runtime deps, shared types |
| DB | **Postgres + Drizzle** | Type-safe, migrations, edge-compatible |
| Queue | DB polling (P1) → BullMQ (P2+) | Simple first |
| Web | **Next.js 15 + Tailwind + shadcn** | Best landing/dashboard DX |
| Auth | Argon2 API keys (CLI) / better-auth (web) | Keys for agents, magic-link for humans |
| Deploy | Vercel (web) + Fly.io (gateway) + Supabase (DB) | Each best-in-class, free-tier friendly |

---

## Repo Layout

```
packages/cli        # `aegntic` command (discover/inspect/run/runs/balance/keys/setup)
packages/sdk        # Typed client shared by CLI + web
services/gateway    # Hono API: provider adapters, runs, billing, auth, MCP server
apps/web            # Next.js: landing + /app console + /leaderboard (public)
docs/               # PRD, ADRs, roadmap, build-log, content (YT/LinkedIn/tweets)
```

---

## Quickstart (Dev)

```bash
# 1. Start Postgres (dedicated per worktree!)
docker run -d --name aegntic-pg \
  -e POSTGRES_USER=aegntic -e POSTGRES_PASSWORD=*** -e POSTGRES_DB=aegntic \
  -p 5435:5432 postgres:16-alpine

# 2. Install & build
pnpm install
pnpm run build

# 3. Gateway (port 3101)
cd services/gateway
cp .env.example .env   # set DATABASE_URL=postgresql://aegntic:***@localhost:5435/aegntic
pnpm run dev

# 4. CLI (separate terminal)
cd packages/cli
pnpm run dev           # or: node dist/index.js discover -q "weather"

# 5. Web (separate terminal)
cd apps/web
pnpm run dev           # http://localhost:3000 → /app for console
```

---

## The Moat (Why This Wins)

1. **Semantic discover > keyword tags** — pgvector embeddings over catalog, not hardcoded categories
2. **Per-result billing > per-call** — aligns cost with value; failed runs free
3. **Signed ledger > mutable balance** — tamper-evident audit trail, survives restarts
4. **Public reliability leaderboard** — honest telemetry agents can cite; GEO #1 surface
5. **CLI-first agent wedge** — MCP server exposes catalog; any agent (Claude Code, Cursor, Codex) calls `discover` + `run` natively

---

## Roadmap Beats

- **P4** — Security review, rate limits, idempotency, gitleaks clean → **public flip**
- **P5 (stretch)** — MCP server hardening, provider router (redundancy), cldcde external skills seed
- **Post-launch** — Stripe top-up, Apify adapter, better-auth dashboard, pgvector catalog enrichment

---

## License

MIT. Provider adapters + billing internals may move to source-available pre-launch.

---

**aegntic.ai** — Discover first. Run second. Bill last.