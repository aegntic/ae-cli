# YouTube Script — Checkpoint 1: "First Run"

**Title:** "I Built an AI Tool Marketplace in 4 Hours — Here's the First Run"
**Duration:** 3-4 minutes
**Mood:** Excitement + credibility. This is real, it works, and we're just getting started.

---

## COLD OPEN (0:00–0:08)

*[Screen capture: terminal, dark theme]*

> "One command. That's all it takes."

*[Types: `aegntic discover -q "twitter posts"`]*
*[Results appear: 2 endpoints, relevance scores, verified badges]*

> "Discover. Inspect. Run. Billed."

*[Quick-cut: run fires, result comes back, balance decrements from $10.00 to $9.985]*

> "That just cost three-tenths of a cent. And it took 4 hours to build from nothing."

---

## SETUP (0:08–0:30)

*[Face-to-camera or voiceover over repo]*

> "This is Aegntic. One CLI that gives any AI agent access to hundreds of data tools — scrapers, APIs, enrichment, search — through a single interface and a single balance."

> "The problem? Every developer and every AI agent wastes their first hour on a data task hand-rolling scrapers or guessing at API parameters. We fix that. Discover first. Build never."

> "Four hours ago, this repo was empty. Let me show you what we built."

---

## THE BUILD (0:30–2:00)

*[Screen share: VS Code / terminal, scrolling through the monorepo]*

> "This is a TypeScript monorepo. Four packages, one Turborepo pipeline."

*[Points at packages/]*

> "The SDK — shared types that every other package imports. Endpoints, runs, balances, the provider adapter interface. This is the contract."

*[Points at packages/cli]*

> "The CLI — nine commands. Discover, inspect, run, runs (list/get/stop), balance, keys, setup. Built on citty from the UnJS team — fast, ESM-native, perfect for agent tooling."

*[Points at services/gateway]*

> "The gateway — a Hono server. Auth middleware, a mock provider with twelve endpoints (twitter, linkedin, reddit, google, amazon, youtube...), async run execution with cost tracking, and an in-memory store we'll swap for Postgres in the next phase."

*[Points at apps/web]*

> "And the landing page — Next.js 15, dark theme, eighteen tool cards, responsive, production-ready. This ships to Vercel."

> "All of it builds in under nine seconds."

*[Runs `pnpm run build` — shows 4/4 successful]*

---

## THE DEMO (2:00–3:00)

*[Terminal, full screen]*

> "Now the moment. Start the gateway."

*[Runs gateway, shows 'listening on :3100']*

> "Step one: discover. What tools exist for Twitter data?"

*[`curl POST /v1/discover?q=twitter`]*

> "Two endpoints. Twitter posts — $0.005 per result — and Twitter user profiles. Each comes with a full input schema and suggested next commands in the hints block."

> "Step two: inspect. What parameters does this endpoint need?"

*[`curl GET /v1/inspect?provider=mock&endpoint=twitter/posts`]*

> "Query params: q (required), limit (optional, default 10), since (optional). Cost model: per result. I know exactly what to send."

> "Step three: run. Fire it."

*[`curl POST /v1/runs` with body]*

> "Run created. Status: RUNNING. I get a run ID back immediately — this is async."

> "Step four: poll."

*[`curl GET /v1/runs/:id`]*

> "COMPLETED. Three items returned. Cost: $0.015."

> "Step five: check the balance."

*[`curl GET /v1/balance`]*

> "$9.985. Started at $10. The system debited exactly what the run cost. That's the billing loop."

---

## THE FORK IN THE ROAD (3:00–3:20)

*[Voiceover over ADR files]*

> "Every decision is logged as an ADR. The big one today was ADR-0004: the stack."

> "We chose Hono over Fastify because it runs on edge. Citty over Commander because it's ESM-native. Drizzle over Prisma because it's leaner. And we went mock-first for the provider adapter — ship the demo, plug in real providers next."

> "That decision meant we could go from zero to end-to-end in four hours instead of four days."

---

## CTA (3:20–3:40)

*[Face-to-camera]*

> "This is Checkpoint 1. The vertical slice works. Next up: we plug in a real provider — probably Apify — wire up real billing with Postgres, and build the dashboard where you can manage keys, top up balance, and browse the catalog."

> "The repo is private until the Launch checkpoint. Follow along."

*[End card: aegntic logo, "Follow the build" tagline]*

---

## ASSETS TO CAPTURE

- [ ] Terminal recording of full discover → inspect → run → poll → balance flow
- [ ] Screenshot of `turbo run build` output (4/4 successful)
- [ ] Screenshot of landing page hero section
- [ ] Screenshot of monorepo file tree in VS Code
- [ ] Screenshot of ADR-0004 (stack decision)
- [ ] Short clip of cold open for Twitter/LinkedIn (vertical crop)
