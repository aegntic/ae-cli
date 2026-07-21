# Tweet list

Append-only. Each tweet dated. Hook in first line, proof in thread. Capture screenshot/video at the moment, not later.

---

## [2026-07-17] tee-up
- **T1 (foundation):** "Building @aedex live. One CLI to discover + run hundreds of data tools. discover → run → billed. No more hand-rolled scrapers. Follow the build. 🧵"
- **T2 (the wedge):** "The catalog is the moat. `aedex discover -q \"linkedin posts\"` → `aedex run` → structured JSON. Agents that discover first never hand-roll. That habit is the business."
- **T3 (anti-spoiler):** "Repo + npm don't exist yet. We're building both, in public (private until the Launch flip). Every decision logged as an ADR. Every build logged."

---

## [2026-07-17] checkpoint 1 — First Run
- **T4 (the proof):** "4 hours. Zero → end-to-end. `discover` finds 2 twitter endpoints. `run` executes one. Balance debits $0.015. The whole chain works. Checkpoint 1: First Run. ✅"
- **T5 (the stack):** "TypeScript monorepo. Hono gateway. citty CLI. Drizzle ORM. Next.js landing page. Turborepo orchestrating it all. 4 packages build in 8.8 seconds. 1990 lines. 28 files. One vertical slice."
- **T6 (the hook):** "What if your AI agent could call `aedex discover -q \"amazon prices\"` and get back a ranked list of endpoints with pricing? That's what we just built. Next: real providers."
- **T7 (the demo):** "[screenshot: terminal showing discover → run → COMPLETED → balance $9.985] This is the demo. One command finds the tool. One command runs it. One balance pays for it. Agents that discover first never hand-roll."

// Future tweets land per checkpoint — see docs/content/youtube/ scripts for the matching beat.

---

## [2026-07-17] checkpoint 2 — Real Money
- **T8 (the leap):** "Yesterday it was mock data. Today `aedex run` hit a REAL external API — live Berlin weather from Open-Meteo — and billed $0.001 to a durable Postgres ledger. No mock. No key. Real data, real charge. Checkpoint 2: Real Money. ✅"
- **T9 (the invariant):** "Balance is no longer a number in memory. It's the sum of an append-only ledger. Kill the server, restart it — balance is identical. `topup 10.000 − charges 0.016 = 9.984`. Try that with a Map."
- **T10 (the bug we ate):** "Our e2e said billing worked. A paranoid second agent said 'the balance didn't move.' Both were right — we charged $0.001 and displayed 2dp. Sub-cent charge, invisible. We don't ship invisible money. Fixed: 4dp."
- **T11 (the seam):** "Zero gateway changes to add a real provider. The `ProviderAdapter` interface (execute/estimateCost) was already there from the mock. Open-Meteo dropped in via `addProvider()`. That's the whole marketplace thesis in one file."
- **T12 (the demo):** "[screenshot: aedex run openmeteo/weather/current → COMPLETED, temperature_2m 25.3°C, cost $0.0010; then ledger SQL showing charge 0.0010 run_id=8FG6oIIjxP1B] Real API. Real ledger. Real money. One CLI."
- **T13 (the ask):** "What data tool should we wire next? Apify, PDL, Browserbase are on the list — each behind the same `ProviderAdapter`. Reply with the endpoint you'd pay per-result for."

---

## [2026-07-17] checkpoint 3 — Console
- **T14 (the UI):** "The CLI had a sibling. `aedex` now has a console at /app — paste a workspace key, see live balance (9.9990 USD, 4dp) and run history with status pills. Same gateway. Now it has a face."
- **T15 (the resilience):** "First console build rendered `BALANCE —` and `No runs`. Cause: Promise.all — one failing request (runs) nuked the good one (balance). Switched to Promise.allSettled + per-section errors. Partial failure is a feature, not a crash."
- **T16 (the honesty):** "Today's bug was shared. Our dev Postgres got clobbered — a sibling worktree's migrations replaced our `runs` table with `jobs`. Our ledger survived (append-only), `runs` didn't. Lesson: one DB per worktree. We isolated, re-migrated, shipped. Operational honesty > looking clean."
- **T16 (the seam):** "The console hits the same `/v1/balance` and `/v1/runs` the CLI does. No new backend for the web. The API is the product; the surfaces (CLI, console, MCP) are thin clients over it."
- **T17 (the demo):** "[screenshot: /app — balance 9.9990 USD gradient hero, available/held, recent runs with a green COMPLETED pill on openmeteo/weather/current @ 0.0010] One balance. Every surface. The console is live."

---

## [2026-07-18] checkpoint 4 — Real Providers
- **T19 (the breakthrough):** "3 real no-key providers shipped in one batch: HackerNews (top stories), CoinGecko (markets), Frankfurter (ECB FX rates). All server-side fetch, `AbortSignal.timeout(10s)`, no API key, no signup. Live data, real billing, no mock."
- **T20 (the receipt):** "`aedex run coingecko/markets --query '{\"ids\":\"bitcoin,ethereum\",\"limit\":10}'` → 6 calls, 100% success, p50 280ms, $0.018 charged. Real market data, real per-result billing, real ledger entry."
- **T21 (the honesty):** "`aedex run frankfurter/rates/latest --query '{\"from\":\"ZZZNOTACURRENCY\"}'` → real HTTP 404 from Frankfurter. Our telemetry caught it, leaderboard shows 66.7% success. We don't hide failures. The moat is honesty."
- **T21 (the leaderboard):** "[screenshot: /leaderboard — coingecko 6/100%, openmeteo 6/100%, hackernews 4/100%, frankfurter 3/67%] Real providers, real rates, real failures. The leaderboard doesn't lie."
- **T22 (the thesis):** "Agents that discover first never hand-roll. `aedex discover` → `aedex run` → one balance. That's the product. The moat is the telemetry → reliability → routing flywheel."

---

## [2026-07-18] checkpoint 5 — Spine Complete
- **T24 (the spine):** "`discover (18 tools) → run (4 real providers) → bill (signed ledger) → trust (audit + leaderboard)` — the spine is complete. 70/70 tests, 5/5 typecheck, live web at ae-cli-web.vercel.app. 4 real providers, 1 credentialed (Apify), honest leaderboard with real 66.7% failure rate."
- **T25 (the moat):** "The moat isn't the catalog (MCP registry is free). It's the telemetry → reliability → routing flywheel. We know which provider works; competitors just list tools."
- **T26 (the console):** "[screenshot: /leaderboard — coingecko 100% @ 280ms, openmeteo 100%, hackernews 100%, frankfurter 66.7%] Real data. Real ledger. Real money. One CLI."
- **T27 (the ask):** "Next: cldcde skills (breadth), Phase 4 (audit completeness), router (needs provider redundancy). What's the next provider you'd pay per-result for?"

---

## [2026-07-18] checkpoint 6 — cldcde Skills
- **T27 (the breadth):** "8 new external skills seeded from cldcde: mcp-foundry, mutation-gate, n8n-orbit, skill-builder, visual-regression-forge, worktree-mesh, claude-template-switchboard, context7-radar. All kind=external, per-call pricing, discoverable via `aedex discover`. The catalog went from 18 to 26 tools."
- **T27 (the seam):** "Zero gateway changes to add a real provider. The `ProviderAdapter` interface (execute/estimateCost) was already there from the mock. Open-Meteo dropped in via `addProvider()`. That's the whole marketplace thesis in one file."
- **T28 (the ask):** "Which skill should an agent call first? mcp-foundry (scaffold MCP servers), mutation-gate (safe mutations), or n8n-orbit (orchestrate workflows)? Reply with your pick."