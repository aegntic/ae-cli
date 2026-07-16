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

## Competitive context (verified — market-research agent + monid.ai dig)
- **Primary analog/competitor:** monid.ai — "OpenRouter for agent tools", 1800+ tools, one wallet, pay-per-call, NL discovery. Closest existing product to aegntic's spec (ADR-0007). Disadvantages we exploit: keyword-tag discovery (vs our semantic pgvector), pay-per-call (vs our per-result), scraping-skewed catalog.
- **Incumbent:** Apify (pay-per-result Actors, $5 free) — catalog-browse, not NL discovery; single-domain.
- **Also-rans:** Composio (SDK-first, no CLI centerpiece), RapidAPI (web-only, stale), Merge.dev Agent Handler ($650/mo enterprise floor), PDL/Clearbit (single-vertical enrichment).
- **Architectural reference:** Merge Agent Handler (run/poll/per-tenant shape) + Apify (async/dataset/idempotency) — both Merge.dev's / Apify's products, used as shape references only (ADR-0006).
- **The gap nobody owns:** *semantic* NL discover-first from a CLI + one prepaid meter, per-result, across heterogeneous providers. aegntic's window.
- **Positioning line:** *"One CLI, one balance, every data tool — discover first, run second."*

## Billing model (ADR-0005)
Prepaid balance, **per-result** metering (`cost = result_count × unit_cost × 1.25`), **25% markup**, **$5 free tier / no card**, append-only ledger, dashboard splits `provider_cost` vs `aegntic_fee`.

## Stack (ADR-0004)
oclif v4 (CLI) · Hono on Bun (gateway) · Supabase Postgres + pgvector (DB + NL discovery) · Upstash QStash (queue) · Next.js 15 (web) · Stripe Checkout (billing) · OpenAI text-embedding-3-small (catalog embeddings).

## Reference implementation (ADR-0006)
`merge` CLI → `ah-api.merge.dev` ("Agent Handler"), 100+ connectors, near-identical command UX. Used as reference + catalog seed. ae-cli builds its **own** aegntic gateway (brand + billing ownership = the business).

## Demo arc (Checkpoint 1)
`ae discover "scrape a linkedin company page"` → ranked tools → `ae run <tool>` → poll → billed result → dashboard mirrors the ledger entry. Two providers in one session to prove unification.
