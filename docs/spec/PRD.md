# PRD — aegntic (tool-discovery + execution marketplace)

> High-level. Detail deepens per phase. Sections marked ⟦TBD⟧ firm up as research lands.

## Problem
Agents and devs waste time hand-rolling scrapers, wiring auth, and guessing at data APIs. Hundreds of providers (Apify, enrichment, search) exist but discovery is fragmented and execution is provider-specific glue.

## Vision
One catalog, one CLI, one balance. `aegntic discover -q "<intent>"` finds the right endpoint; `aegntic inspect` reveals its schema; `aegntic run` executes it; results poll back; cost meters against prepaid balance. Same surface from terminal, from any agent (MCP), from the dashboard.

## Who
- **Primary:** AI agents (Claude Code, Cursor, Codex) that need data. The skill doc already targets this — agents are the user.
- **Secondary:** Developers scraping/enriching at low volume who don't want provider sprawl.

## Wedge (what wins the demo)
`discover` → `run` in two commands, live, billed. The catalog *is* the moat. Agents that "discover first" never hand-roll — that habit is the business.

## Core capabilities (MVP = P1+P2)
1. **Catalog discovery** — natural-language search over provider endpoints, relevance score, verified badge.
2. **Schema inspect** — `pathParams` / `queryParams` / `body` / `bodyType` per endpoint.
3. **Async run** — fire → run ID → poll → COMPLETED with structured output.
4. **Balance + metering** — prepaid balance, per-result cost, passthrough markup, run-level cost record.
5. **Auth** — workspaces, labeled API keys, hashed at rest.
6. **Dashboard** — keys, balance, run history, discover browser.

## Non-goals (for hackathon)
- Building our own scrapers — we aggregate, not replace providers.
- Multi-tenant enterprise SSO / SOC2 — post-launch.
- Mobile app.

## Success metrics (demo-grade)
- End-to-end `discover → run → result` under 60s on a real provider.
- Zero secrets in repo at public flip.
- ≥1 real billed run against balance before Launch checkpoint.

## Open questions ⟦TBD — research agent⟧
- CLI framework: oclif vs citty vs commander?
- Backend: Hono/Bun vs Fastify vs Next route handlers?
- DB: Postgres/Supabase vs SQLite/Turso?
- Queue: Redis/BullMQ vs QStash vs simple DB-poll?
- First real provider + markup %.
