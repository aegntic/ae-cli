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

## [2026-07-17] checkpoint 2 — Real Money

**Headline:** We stopped pretending. The CLI now hits a real external API and bills real (fractional) money against a durable ledger.

Body:
> Checkpoint 1 ran on mock data — a fake provider returning fake tweets, debiting a number that lived in a JavaScript Map. That was fine for proving the loop. It was not fine for proving the business.
>
> Checkpoint 2 is the real thing. Three things changed, and each is a discipline worth naming.
>
> **1. Persistence is append-only.** There is no `balance` column. Balance is derived: `SELECT` the signed sum of a `balance_ledger` table (`topup`/`refund` add, `charge` subtracts). Kill the gateway process, restart it — the balance is identical, because it was never state, it was history. An append-only ledger is the only design that survives audit.
>
> **2. Billing is correct, and we proved the failure path.** A run that succeeds charges its *actual* cost, not the estimate. A run that fails charges *nothing*. We could not trigger a failed run through the CLI, so we wrote a unit test that injects a provider which throws and asserts zero charge rows. "It probably works" is not a billing strategy.
>
> **3. The first real provider is live.** Open-Meteo — free, no API key, no signup — behind the exact same `ProviderAdapter` interface the mock used. One `addProvider()` call, zero gateway changes. `aegntic run openmeteo/weather/current` returns genuine current weather for Berlin (25.3°C this morning) and appends a `$0.0010` charge to the ledger.
>
> The honest moment: our end-to-end test first reported the billing worked. A second, paranoid pass reported the balance "didn't move." Both were right. We charge a tenth of a cent, and the balance command rounded to cents. Sub-cent charges were invisible. We don't ship invisible money — the display now shows four decimals.
>
> Six commits, six unit tests green, one live external call billed to a durable ledger. Next: deploy, a credentialed provider (Apify), and the dashboard.
>
> The repo stays private until Launch. The build log is public. Follow along.

Assets: terminal recording of `aegntic run openmeteo/weather/current → COMPLETED` returning real Berlin weather; screenshot of the `balance_ledger` SQL showing the `charge 0.0010` row; screenshot of balance at 4dp before/after.
