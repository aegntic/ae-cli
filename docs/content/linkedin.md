# LinkedIn updates

Append-only. Longer-form than tweets; lead with the insight, prove with the build. Each entry dated.

---

## [2026-07-17] foundation post
**Headline:** We're building a universal data-tool CLI — in the open.

Body (draft):
> Most agents and developers waste their first hour on a data task hand-rolling a scraper or guessing at an API. We're fixing that with `aegntic` — one CLI that discovers the right endpoint, inspects its schema, runs it, and bills against a single balance.
>
> Today: the repo and npm package don't exist yet. We start from zero, in the open, every architectural decision recorded. The thesis is simple — *discover first, build never*. The catalog is the product; the habit of reaching for it is the moat.
>
> Follow along. First stop: a vertical slice where `discover → run → poll` returns real structured data end-to-end.

Assets needed: ~~screenshot of `aegntic discover` output once CLI ships (Checkpoint 1).~~ ✅ Captured.

## [2026-07-17] checkpoint 1 — First Run

**Headline:** From zero to a working tool marketplace in 4 hours. Here's what we learned.

Body:
> Four hours ago, the repository was empty. Today, Aegntic has a working vertical slice: one CLI command discovers data endpoints, another runs them, and a single prepaid balance meters the cost.
>
> The stack: TypeScript monorepo (pnpm + Turborepo), Hono gateway, citty CLI, Next.js landing page. Four packages, 1,990 lines of code, builds in under 9 seconds.
>
> The demo: `aegntic discover -q "twitter posts"` returns ranked endpoints with schemas and pricing. `aegntic run` fires one asynchronously. Poll the run ID — completed, 3 results, $0.015 debited from balance. The full chain: discover → inspect → run → poll → bill.
>
> What worked: mock-first provider strategy. Instead of waiting for real API credentials, we built 12 mock endpoints that mirror the real interface. The vertical slice shipped in hours, not weeks. Real providers (Apify, PDL, Browserbase) plug into the same adapter interface without touching the gateway.
>
> Every architectural decision is an ADR. The stack decision (ADR-0004) chose Hono over Fastify for edge deployability, citty over Commander for ESM-native agent tooling, and Drizzle over Prisma for leaner runtime. These choices will pay dividends when we deploy to production.
>
> Next checkpoint: real provider adapter, real billing with Postgres, and the web dashboard.
>
> The repo stays private until launch. But the build log is public. Follow along.

Assets: terminal recording of full flow, turbo build screenshot, landing page screenshot, monorepo tree screenshot.

// Future posts map 1:1 to checkpoints in docs/roadmap.md.

## [2026-07-17] Checkpoint 1 — First Run complete
**Headline:** We just shipped the first billed run of our agent-tool router.

Body (draft):
> Checkpoint 1 of aegntic is officially complete. We firmed up our monorepo stack: Hono for the gateway, Drizzle + PostgreSQL for the database/billing ledger, and a lightweight citty-powered CLI.
>
> In this milestone, we wired the entire vertical slice:
> 1. Discovering endpoints using natural language from the terminal.
> 2. Inspecting input schemas to know exactly what parameters are required.
> 3. Running the job asynchronously and polling or waiting for completion.
> 4. Settling actual results dynamically against a prepaid workspace ledger.
>
> One of our biggest design decisions was charging per-result (incorporated with a 25% markup) instead of per-call. This aligns our interests with the developers: if a scraper fails, they don't lose a cent.
>
> Up next: integrating the Apify and PDL providers, adding Argon2 API key hashing, and building the Next.js wallet dashboard.

