# YouTube Script: Checkpoint 1 — "First Run"
**Title**: I Built the "OpenRouter for AI Tools" in 4 Hours (One CLI, One Wallet)
**Duration**: ~90 seconds (Short/Teaser format)

---

## [0:00 - 0:10] Cold Open
*Visual*: Screen capture of terminal. Cursor is blinking.
*Action*: Typing `aegntic discover "linkedin post search"`.
*Voiceover (Energetic)*:
> "Stop writing custom scrapers for your AI agents. Look at this: One command to discover the exact tool you need, inspect its schema, run it, and settle the cost from a single balance. We just ran a LinkedIn search and got the formatted data in 5 seconds."

---

## [0:10 - 0:25] The Problem
*Visual*: Scrolling through a text editor showing spaghetti scraper code, API keys env file.
*Voiceover*:
> "Most agent builders waste their first hour writing custom Puppeteer scripts or managing API key sprawl for 10 different providers. It’s fragile, slow, and expensive."

---

## [0:25 - 0:50] The Solution (The Vertical Slice)
*Visual*: Transition to the architecture diagram (`docs/spec/architecture.md`). Show Hono gateway receiving the request, checking the DB balance, and launching the job.
*Voiceover*:
> "Today we shipped Checkpoint 1 of aegntic. We built the core gateway in Hono, a unified SDK, and a CLI client. We seeded the Postgres registry with mock endpoints. Running `aegntic balance` shows a starting credit of $10. After running our tweet scraper, the ledger automatically debits the cents based on the items returned."

---

## [0:50 - 1:15] The Fork in the Road (ADR-0005)
*Visual*: Screen capture of `docs/decisions/0005-billing-model.md`.
*Voiceover*:
> "We had a major architectural decision to make: should we charge per-call or per-result? Competitors like monid charge per-call, which burns cash when scrapers fail. We locked in **per-result metering** with a 25% markup. If the run fails, you pay nothing. It's completely risk-free for your agents."

---

## [1:15 - 1:30] Outro / CTA
*Visual*: App dashboard landing page mock showing "Three ways to connect: Skill, MCP, CLI".
*Voiceover*:
> "All tasks for Phase 1 are closed and the gateway is live. Next up: P2, wiring real Apify and PDL provider adapters, and setting up Stripe webhooks. Subscribe to watch us take this live on the mainnet!"
