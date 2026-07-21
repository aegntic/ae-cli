⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠛⠷⠄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
### Hello world 👋🏻

# aedex — Aegntic Decentralized Exchange CLI

**One CLI. One balance. Every data tool.**

`ae discover -q "scrape linkedin"` → ranked endpoints → `ae run <tool>` → live results → signed ledger charge.

---
## Install

```bash
bun add -g @aegntic/aedex     # or: npm i -g @aegntic/aedex
ae setup                      # configure gateway + workspace
ae keys add --label dev       # mint an API key (aedex_live_…)
ae discover -q "weather"      # → ranked endpoints
```

**Live:** web → https://aedex.ing · gateway → https://aegntic-gateway.fly.dev · reliability board → https://aedex.ing/leaderboard
**Package:** [`@aegntic/aedex`](https://www.npmjs.com/package/@aegntic/aedex) on npm.

---
## The Wedge

Agents and devs waste cycles hand-rolling scrapers, wiring auth, guessing at data APIs. Hundreds of providers exist (Apify, enrichment, search) but discovery is fragmented and execution is provider-specific glue.

**aedex reverses the loop:** the catalog *is* the product. Agents that `discover first` never hand-roll — that habit is the business.

---
## Status: Checkpoint 2 ✅ | Checkpoint 3 ✅ | Launch 🔒 (deployed, pre-public-flip)

| Checkpoint | Status | Evidence |
|---|---|---|
| **P1 Vertical Slice** | ✅ | `discover → inspect → run → poll → balance` end-to-end |
| **P2 Real Money** | ✅ | Live Open-Meteo runs, append-only ledger, failed runs free |
| **P3 Console + Board** | ✅ | `/app` + `/dashboard` console, public `/leaderboard` with real telemetry |
| **P4 Launch** | 🔒 | Hardened (per-key rate limit, restricted CORS, signed ledger, secret-scan clean) + **deployed**: web on aedex.ing, gateway on Fly, `@aegntic/aedex` on npm → public flip pending |

**Current HEAD:** `feat/unified-signed-persistence` — signed Ed25519 hash-chain ledger, real providers (Open-Meteo, HackerNews, CoinGecko, Frankfurter, Apify), honest reliability leaderboard, bundled `ae` CLI, editorial-bento web on the cool-grey aegntic-toy system (`DESIGN.md`).

---

## What Runs Today

```bash
# One-time setup
ae setup                    # writes ~/.config/aedex/config.json
ae keys add --label dev     # mints aedex_live_<nanoid>, saves locally

# Discover & run (real providers, real billing)
ae discover -q "weather"           # → openmeteo/weather/current
ae inspect openmeteo/weather/current
ae run openmeteo/weather/current --query '{"latitude":52.52,"longitude":13.41}'
ae runs get <run-id>               # poll until COMPLETED
ae balance                         # 4dp precision ($9.9840)
```

**Providers live:** `openmeteo`, `hackernews`, `coingecko`, `frankfurter`, `apify` (18 tools, 6 providers).  
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
packages/cli        # `aedex` command (discover/inspect/run/runs/balance/keys/setup)
packages/sdk        # Typed client shared by CLI + web
services/gateway    # Hono API: provider adapters, runs, billing, auth, MCP server
apps/web            # Next.js: landing + /app console + /leaderboard (public)
docs/               # PRD, ADRs, roadmap, build-log, content (YT/LinkedIn/tweets)
```

---

## Quickstart (Dev)

```bash
# 1. Start Postgres (dedicated per worktree!)
docker run -d --name aedex-pg \
  -e POSTGRES_USER=aedex -e POSTGRES_PASSWORD=*** -e POSTGRES_DB=aedex \
  -p 5435:5432 postgres:16-alpine

# 2. Install & build
pnpm install
pnpm run build

# 3. Gateway (port 3101)
cd services/gateway
cp .env.example .env   # set DATABASE_URL=postgresql://aedex:***@localhost:5435/aedex
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

## Socials

**Web Live:** https://aedex.ing  
**Gateway:** https://aegntic-gateway.fly.dev  
**GitHub:** https://github.com/aegntic/ae-cli  
**npm:** @aegntic/aedex  
**Twitter/X:** @aedex_ai  
**LinkedIn:** aegntic

---

**aedex.ing** — Discover first. Run second. Bill last.