# Tweet list

Append-only. Each tweet dated. Hook in first line, proof in thread. Capture screenshot/video at the moment, not later.

---

## [2026-07-17] tee-up
- **T1 (foundation):** "Building @aegntic live. One CLI to discover + run hundreds of data tools. discover → run → billed. No more hand-rolled scrapers. Follow the build. 🧵"
- **T2 (the wedge):** "The catalog is the moat. `aegntic discover -q \"linkedin posts\"` → `aegntic run` → structured JSON. Agents that discover first never hand-roll. That habit is the business."
- **T3 (anti-spoiler):** "Repo + npm don't exist yet. We're building both, in public (private until the Launch flip). Every decision logged as an ADR. Every build logged."

## [2026-07-17] checkpoint 1 — First Run
- **T4 (the proof):** "4 hours. Zero → end-to-end. `discover` finds 2 twitter endpoints. `run` executes one. Balance debits $0.015. The whole chain works. Checkpoint 1: First Run. ✅"
- **T5 (the stack):** "TypeScript monorepo. Hono gateway. citty CLI. Drizzle ORM. Next.js landing page. Turborepo orchestrating it all. 4 packages build in 8.8 seconds. 1990 lines. 28 files. One vertical slice."
- **T6 (the hook):** "What if your AI agent could call `aegntic discover -q \"amazon prices\"` and get back a ranked list of endpoints with pricing? That's what we just built. Next: real providers."
- **T7 (the demo):** "[screenshot: terminal showing discover → run → COMPLETED → balance $9.985] This is the demo. One command finds the tool. One command runs it. One balance pays for it. Agents that discover first never hand-roll."

// Future tweets land per checkpoint — see docs/content/youtube/ scripts for the matching beat.

## [2026-07-17] checkpoint 2 — Real Money
- **T8 (the leap):** "Yesterday it was mock data. Today `aegntic run` hit a REAL external API — live Berlin weather from Open-Meteo — and billed $0.001 to a durable Postgres ledger. No mock. No key. Real data, real charge. Checkpoint 2: Real Money. ✅"
- **T9 (the invariant):** "Balance is no longer a number in memory. It's the sum of an append-only ledger. Kill the server, restart it — balance is identical. `topup 10.000 − charges 0.016 = 9.984`. Try that with a Map."
- **T10 (the bug we ate):** "Our e2e said billing worked. A paranoid second agent said 'the balance didn't move.' Both were right — we charged $0.001 and displayed 2dp. Sub-cent charge, invisible. We don't ship invisible money. Fixed: 4dp."
- **T11 (the seam):** "Zero gateway changes to add a real provider. The `ProviderAdapter` interface (execute/estimateCost) was already there from the mock. Open-Meteo dropped in via `addProvider()`. That's the whole marketplace thesis in one file."
- **T12 (the demo):** "[screenshot: aegntic run openmeteo/weather/current → COMPLETED, temperature_2m 25.3°C, cost $0.0010; then ledger SQL showing charge 0.0010 run_id=8FG6oIIjxP1B] Real API. Real ledger. Real money. One CLI."
- **T13 (the ask):** "What data tool should we wire next? Apify, PDL, Browserbase are on the list — each behind the same `ProviderAdapter`. Reply with the endpoint you'd pay per-result for."

## [2026-07-17] checkpoint 3 — Console
- **T14 (the UI):** "The CLI had a sibling. `aegntic` now has a console at /app — paste a workspace key, see live balance (9.9990 USD, 4dp) and run history with status pills. Same gateway. Now it has a face."
- **T15 (the resilience):** "First console build rendered `BALANCE —` and `No runs`. Cause: Promise.all — one failing request (runs) nuked the good one (balance). Switched to Promise.allSettled + per-section errors. Partial failure is a feature, not a crash."
- **T16 (the honesty):** "Today's bug was shared. Our dev Postgres got clobbered — a sibling worktree's migrations replaced our `runs` table with `jobs`. Our ledger survived (append-only), `runs` didn't. Lesson: one DB per worktree. We isolated, re-migrated, shipped. Operational honesty > looking clean."
- **T17 (the seam):** "The console hits the same `/v1/balance` and `/v1/runs` the CLI does. No new backend for the web. The API is the product; the surfaces (CLI, console, MCP) are thin clients over it."
- **T18 (the demo):** "[screenshot: /app — balance 9.9990 USD gradient hero, available/held, recent runs with a green COMPLETED pill on openmeteo/weather/current @ 0.0010] One balance. Every surface. The console is live."
