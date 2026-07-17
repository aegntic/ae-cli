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

## [2026-07-17] Checkpoint 1 complete — First Run
- **T4 (proof):** "Checkpoint 1 is LIVE. 🚀
  Our unified tool CLI is running end-to-end.
  `aegntic discover \"tweet\"` -> matches -> `aegntic run` -> returns results and debits dynamic cost from the workspace balance.
  $10.00 init balance -> $9.62 available.
  Check the demo 🧵"
- **T5 (decision):** "Why per-result pricing?
  ADR-0005: We rejected per-call models. If a scraper fails or returns empty, the user shouldn't pay. aegntic charges strictly per-result + 25% markup.
  Value-aligned billing is the wedge."
- **T6 (next):** "Next checkpoint: replacing the mock provider with real Apify/PDL execution adapters, API keys hashing, and Stripe checkouts. We are going straight to live."

