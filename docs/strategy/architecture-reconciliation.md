# aegntic — Architecture Reconciliation & Build Plan

Fuses: the 4-pass market research (`positioning-2026.md`), both reuse-map
audits of the aegntic GitHub estate, the `origin/main` divergence (qwen-built),
`CONSTITUTION.md`, and the reverse-engineered spec (`BUSINESS-REVERSE-
ENGINEERING.md`). This is the one plan. Everything below overrides ad-hoc
choices made earlier in the build.

## Stack decision: TypeScript. Locked.

Every load-bearing aegntic asset is TS/JS (ae-cli, cldcde, agentmint, the live
web deploy). ruvos is Rust. **Stay TS.** Port ruvos's *designs* (signature
scheme, overlay chain), not its crates. Reimplement ~600 LOC of crypto/manifest
logic in TS only if/when the signed-ledger moat is prioritized.

## Source of truth per layer (merge map)

Two efforts diverged from `caf8964`: `origin/main` (qwen) and `worktree-p2`
(me). They are complementary. Truth per layer:

| Layer | Source of truth | Why |
|---|---|---|
| Store / persistence | **worktree-p2** (real postgres + append-only ledger, verified) | main's store.ts is still in-memory; mine matches the recon spec |
| ProviderAdapter contract | **main** (`searchTools/resolveTool/startRun/pollRun/fetchResults/cancelRun`) | correct for long-running async (Apify); my `execute/estimateCost` is too thin |
| Catalog / discovery | **new build** seeded from **cldcde** schema + data, on **pgvector** | recon wants pgvector NL discovery; cldcde gives schema + seed; drop its Neo4j |
| Auth | **argon2 + better-auth** (recon spec) | worktree-p2 is sha256 test-key (deferred); upgrade |
| Async run dispatch | **Upstash QStash** (recon spec) | worktree-p2 is fire-and-forget; upgrade for durability |
| Web dashboard | **main** (4 pages, LIVE) + keep my `/app` console logic | main is deployed; fuse |
| Deploy | **main's** Cloudflare Pages/OpenNext config | LIVE at aegntic-web.pages.dev; redeploy with the real backend |
| Providers | **both**: openmeteo (mine, live) + Apify (main, scaffold) | unify under the richer adapter contract |
| Ledger trust layer | **new**, design ported from **ruvos** (signed events) | moat upgrade — see Phase R2 |
| Strategy / constitution / socials | **worktree-p2** | mine |

## Ports (from the estate, not rebuilds)

1. **cldcde → catalog schema + seed.** Lift the Extension metadata shape
   (`src/api/extensions.ts:48-56`: id/name/desc/category/platform/version/
   author/downloads/rating/installScript/repository/tags), extend with
   **pricing + cost model + auth scopes + provider driver** (cldcde has none).
   Seed from cldcde's 9 `ae-ltd-*` skills + 25 plugins + 4 MCP servers as
   initial JSON. Use its `validate_skills.py` for tool validation. Drop Neo4j.
2. **prologue → MCP server skeleton.** `@aegntic/prologue` `src/mcp/` (~180 LOC,
   zero-dep stdio) is TS-native MIT and drops straight in. Better fit than
   ruvos's Rust `mcp-brain`. This is the aegntic-as-one-MCP-server surface.
3. **ruvos → ledger trust design.** Port the **design** of `rvf-types/
   signature.rs` (SignatureAlgo + SignatureFooter: Ed25519 + post-quantum
   ML-DSA-65/SLH-DSA-128s) and `rvf-manifest/chain.rs` (OverlayChain 40-byte
   hash-pointer record). Reimplement in TS so each ledger row becomes a signed,
   chain-linked event. ~3-4 weeks of design saved; post-quantum-ready for free.
4. **main → Apify adapter + deploy config + business-recon.** Business-recon
   + security_review already pulled (`f502028`). Port Apify adapter into the
   unified providers dir. Adopt wrangler.toml/OpenNext + redeploy.

## NOT porting (decisions of exclusion)

- **agentmint** — 363-LOC scaffold, no ledger/metering/prepaid/settlement,
  stub mandate verification. Greenfield Stripe (idempotency keys + metered
  billing) directly. Keep only its `STRIPE_TOKEN_CURRENCY_MAP` reference.
- **cognitive-os** — proprietary license; code cannot port into MIT ae-cli.
  Paraphrase its cognitive-architecture vocabulary for docs voice only.
- **SOTA-suite** — broken scaffold. Skip.
- **compound-engineering** — prompt-only markdown. Borrow the `docs/solutions/`
  append-only convention as inspiration; no code.
- **ultraplan-pro** — local Python planner. Vocabulary only; ae-cli's adapter
  contract already encodes the discover→filter→validate→rank pipeline.

## Moat-critical: instrument every call (flagged independently by research C + D)

The two defensible moats are (1) outcome telemetry → reliability routing and
(2) the append-only ledger as system of record. Both depend on **per-call
instrumentation that cannot be backfilled.** Ship this before breadth.

Record per run, at the gateway, into a new `run_events`/instrumentation surface:
provider, endpoint, cost, latency, HTTP status, schema-conformance, result-hash,
and (later) an agent-rejected-result signal. This is the data asset for routing
(P6) + evals (P4) + the reliability leaderboard (positioning §build-now).

## Build phases (ordered, moat-first)

**R1 — Merge foundation (this week).**
- Reconcile gateway: keep worktree-p2's real ledger/store as truth; adopt
  main's richer `ProviderAdapter` contract (startRun/pollRun/fetchResults/
  cancelRun); port Apify adapter; keep openmeteo.
- Adopt main's deploy config; **redeploy the real backend live** (gateway needs
  a host — Fly/Railway/Workers; web stays Cloudflare Pages pointing at the real
  gateway URL).
- Fuse dashboards (main's 4 pages + my `/app`).
- Resolve CLI/SDK conflicts (prefer main's tested versions where mine is
  untested; keep my keys-lifecycle fixes).

**R2 — The moat (next).**
- Per-call outcome telemetry instrumentation (above). Non-negotiable, first.
- Signed ledger events (ruvos design → TS). Each charge becomes a signed,
  chain-linked row. This is the trust moat materializing.

**R3 — Catalog.**
- pgvector NL discovery over a real catalog. Seed from cldcde entries +
  providers (mock/openmeteo/Apify). Replaces the in-memory registry.

**R4 — Surfaces + auth.**
- aegntic-as-one-MCP-server (prologue skeleton) — highest-leverage GEO move.
- argon2 key hashing + better-auth magic-link for web.
- Upstash QStash for durable async run dispatch.

**R5 — Positioning live (when the real backend is deployed).**
- Publish socials (X thread + LinkedIn, spine-aligned, console image).
- "aegntic vs {Firecrawl/Bright Data/ScraperAPI}" comparison pages with real
  benchmarks (needs a credentialed scraping provider).
- Reddit/HN seeding at a launch moment; curated `llms.txt`; question-H1 docs.

## Immediate next action

**R1 merge.** The single highest-leverage move is fusing main + worktree-p2 so
the LIVE deploy runs the real ledger backend, then instrumenting calls (R2).
Until the merge, both branches ship half a product.

Open decisions for the user (these change the plan):
1. **Merge executor** — do I drive the R1 merge (resolve conflicts, source-of-
   truth per the table above), or do you want to review the per-file decisions
   first?
2. **Gateway host** — Cloudflare Workers (needs Hono-on-Workers refactor +
   wrangler; main used it for web only), Fly, or Railway for the persistent
   node-server gateway? (Determines deploy path.)
3. **ruvos signed-ledger now or later** — it's the trust moat but ~600 LOC TS
   reimplementation. R2 (telemetry) is more urgent than the signing layer; defer
   signing to R2-second-half?
