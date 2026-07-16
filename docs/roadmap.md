# Roadmap — aegntic business to live

North star: a judge (or agent) runs `aegntic discover -q "..."` → `aegntic run ...` → gets structured data billed against balance, end-to-end, live. Everything else serves that moment.

## Phases

### P0 — Foundation (now)
- Repo, schema, ADRs, roadmap, build-log, content skeleton. ✅ in progress
- Stack ADR (CLI framework, backend, DB, queue).
- Workspace tooling wired (pnpm + turbo).

### P1 — Vertical slice: discover → run → poll
- Gateway: unified provider/run schema, 1 adapter (mock provider), async run + poll, prepaid balance stub.
- CLI: `discover`, `inspect`, `run`, `runs get`, `balance`, `keys add/list`.
- SDK: typed client used by both.
- Demo: scrape-shaped mock returns real structured JSON through the full chain.
- **Checkpoint 1 — "First Run"** (YouTube script drafted).

### P2 — Real provider
- Apify adapter (or equivalent). Per-result metering + cost passthrough markup.
- Real billing: balance decrements, run cost recorded.
- Workspaces + API keys (hashed, labeled).
- **Checkpoint 2 — "Real Money"** (first billed real run).

### P3 — Dashboard
- apps/web: keys, balance/top-up, run history, discover browser.
- Auth (magic link or passphrase for hackathon; Stripe-test for top-up).
- **Checkpoint 3 — "Dashboard Live"**.

### P4 — Harden + launch
- security-reviewer pass, rate limiting, idempotency, retries.
- gitleaks clean → **flip repo public** (ADR-0002 trigger).
- **Checkpoint 4 — "Launch"** = the public flip + content drop.

### P5 (stretch) — Agent wedge
- MCP server exposing the catalog so any Claude Code / Cursor can `discover`+`run` natively. This is the durable moat.

## Checkpoints = content beats
Each checkpoint ships a YouTube script (`docs/content/youtube/NN-*.md`), a tweet (`docs/content/tweets.md`), and a LinkedIn update (`docs/content/linkedin.md`). Screenshots + motion video captured at the checkpoint, not retrofitted.
