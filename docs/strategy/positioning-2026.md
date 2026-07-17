# aegntic — Positioning & Strategy (2026)

Synthesis of four parallel research passes (market, moat, pivots, LLM-SEO),
cross-checked, inheriting `CONSTITUTION.md`. This is the working thesis every
product, copy, and provider decision answers to. Where evidence was thin, the
source digest flagged it; this doc marks claims that are correlation-only.

## The thesis (one paragraph)

Agents that need real-world data face a tax: every source is its own key,
billing, schema, and pagination. A human tolerates a few; an agent cannot
feasibly wire fifty, so it hardcodes two and the long tail stays out of reach.
**aegntic collapses the tax** — one key, one prepaid balance, one interface
across heterogeneous async data providers, billed per result. Discovery is
already a commodity (MCP registry is a free public good); **the moat is not
listing tools, it is metering them honestly and routing to the ones that
actually work.** We are the agent-billed billing-and-routing layer, and the
append-only ledger is the system of record for agent spend.

## What the market actually says (research A)

- **The "OpenRouter for tools" thesis is real and hot.** OpenRouter proved the
  pattern on models: $113M Series B, ~$50M ARR, $1.3B valuation, 67% enterprise
  routing adoption. Investors are pattern-matching onto tools.
- **MCP won the wire, not the wallet.** ~9,400–10,000 servers, official registry
  live. But the MCP spec has zero for billing, metering, async execution,
  runtime discovery, or result quality. Protocol commoditized; gateway + billing
  + execution did not. (Same shape as OpenRouter over HTTP/JSON.)
- **The empty cell is prepaid per-result metering sold to agents.** Every
  incumbent bills humans (subscription) or enterprise procurement. Only monid.ai
  plays agent-billed, with no disclosed traction. That is the open lane.
- **Funded field:** Composio ($25M A, wrong pricing — sub-to-devs), Merge
  (enterprise contract), Pipedream→Workday, RapidAPI→Nokia, Smithery
  (monetizes vendors, not calls), registries free/discovery-only. Anthropic +
  GCP marketplaces are captive walled gardens.
- **Biggest threat:** OpenRouter lateraling models→tools. Mitigated by owning
  trust + routing, not discovery.

## The moat (research C — brutal version)

Most candidates are **features, not moats**: catalog breadth, NL search, the
MCP surface, per-call metering — all copyable in a sprint by funded incumbents
already doing it. Two things compound and resist copying:

1. **Outcome telemetry → reliability-weighted routing.** Instrument every call
   (latency, success, payload-validity, agent-rejected). Score per provider ×
   tool × time × payload-shape. Route on score. This is proprietary data no one
   can backfill; better routing → more traffic → more telemetry → better routing.
   The OpenRouter + Cloudflare play, but for variable-quality data tools (a
   harder, richer problem than LLM routing, because data outputs are not
   interchangeable).
2. **The append-only ledger as system of record for agent spend.** A trust moat.
   Enterprises wire agent-spend audit, compliance, and procurement to the ledger
   format; ripping it out means re-asserting every historical bill. Wins the
   finance/compliance buyer, not the dev. (Nevermined is the only competitor
   articulating this; early.)

**Wrong moats to chase:** breadth race (Monid is already 1,800+), NL-search-as-
moat (Composio Tool Router exists), MCP-as-moat (it's plumbing), provider
exclusives (providers hate them, ~5 names only), naked network effects (providers
multi-home; devs route direct at volume), brand-only (OpenRouter's mindshare is
already thin per Braintrust).

**Honest positioning spine (true today, uncopyable without a rebuild):**
> We don't route calls — we route outcomes. Every provider result is scored,
> every bill is append-only, every agent dollar is auditable. Others list what
> tools exist; we route to the one that works and stand behind it with a ledger.

## Pivot map (research D — keep options cheap)

Threats by ~2027: MCP commoditizes discovery (HIGH, already here), hyperscaler
marketplaces (HIGH, shipping), big-scraper consolidation (HIGH — Bright Data
~$300M ARR, Oxylabs $3.6B), browser-use eats long tail (MED), OSS registries
collapse take-rate (HIGH). **Discover is already gone; run is defensible only as
an instrumentation position; bill-per-result is the unsolved moat.**

Easy pivots (both reuse every architectural component built so far):
- **P6 cost-router** — same query, N providers, cheapest fresh result. The
  adapter contract is literally the abstraction; the ledger already records
  per-call cost. Nearly additive.
- **P1 settlement layer** — agent-pays-provider, agent-pays-agent, provider
  revenue-share. The ledger is the primitive. Stripe/Orb/Metronome solve
  vendor-bills-customer; none solve cross-provider settlement with an agent
  in the middle.

Next-best: **P4 evals/reliability** (gateway = free instrumentation), **P5
vertical depth** (own one category — the insurance policy vs cross-vertical
commoditization).

## LLM-SEO / GEO playbook (research B — the copy mechanics)

Goal: when a dev asks an LLM "how do I let my agent scrape X / call data tool
Y," aegntic is the answer. Ranked by leverage:

1. **Ship a well-documented MCP server + list it in registries.** Highest-
   leverage 2026 dev-tool move: bypasses the citation game — aegntic becomes a
   tool the LLM calls, not a URL it recommends. (aegntic = one MCP server
   hiding N upstreams behind a normalized interface.)
2. **Reddit / HN / dev.to seeding** — 3–5 genuine threads where aegntic is the
   answer. Perplexity's #1 source is Reddit (~47%); Grok ~16%. Free.
3. **Comparison pages with real benchmark numbers** — "aegntic vs Firecrawl /
   Bright Data / ScraperAPI" with latency/success/cost. LLMs extract numbers
   verbatim; original data is the highest-impact on-page GEO tactic (~40% lift,
   Aggarwal et al.).
4. **Question-shaped H1s + FAQ + front-loaded definitions** — 7x citation impact
   for small domains. 44% of citations come from the first third of a page.
5. **"Best X APIs in 2026" listicles** that include aegntic, ranked honestly.
6. **Monthly freshness** — 30-day content earns ~3.2x ChatGPT citations, 82%
   Perplexity citation rate.
7. **Integration recipes** — LangChain, CrewAI, AutoGen, Claude Code, Cursor,
   n8n. Makes aegntic the default when LLMs compose agent stacks.
8. **Curated `llms.txt`** (100–150 lines, use-case framed, Netlify-style) —
   table-stakes hygiene (75% of dev-tool companies have one). NOT a citation
   strategy (300k-domain study found no link).
9. **Wikidata entity** + consistent naming across G2/npm/PyPI/GitHub.

**Engine notes:** Perplexity/Grok reward Reddit + freshness; Claude reads your
actual docs via fetch/MCP (canonical first-party matters most); Gemini wants
chunkable 40–60 word passages; ChatGPT rewards Wikipedia-depth definitions.

**Anti-patterns (do not do):** llms.txt as a citation strategy, programmatic /
AI-slop pages, keyword stuffing, self-citation-only publishing, 25k-line
llms.txt dumps, burying definitions below marketing, stale content,
schema-as-a-lever (correlation only), GEO-hack rewrites (Google says ignore;
LLMs filter as slop), Wikipedia without genuine notability.

## Build implications — architectural decisions NOW

Two of the four research passes (C + D) independently flagged the same urgent
item: **instrument every call at the gateway, starting now.** Telemetry cannot
be reconstructed later; skipping it for months forfeits the moat.

Ordered by urgency / leverage:

1. **Per-call instrumentation at the gateway.** Record provider, endpoint,
   cost, latency, HTTP status, schema-conformance, result-hash, and (later) an
   agent-rejected-result signal. Additive to the existing `runs` + `ledger`
   schema. **Cannot backfill.**
2. **Keep the adapter seam first-class.** Provider-agnostic; carries normalized
   result schema AND raw passthrough; reports cost+latency+success per call.
   Never let one provider's schema leak into core. (This seam is what makes P1,
   P4, P6 cheap.)
3. **Ledger → multi-directional from day one.** Today it records
   user-pays-aegntic. Design for aegntic-pays-provider, agent-pays-agent, and
   provider revenue-share. This is the settlement moat.
4. **Primary surface = CLI + one aegntic MCP server.** aegntic-as-one-MCP-server
   hiding N upstreams behind a normalized interface — the marketplace-resistant,
   model-agnostic, LLM-callable wedge. Do NOT build a marketplace UI as the
   primary surface (hyperscalers outspend us there).
5. **Own catalog metadata, not the catalog.** Ingest the public MCP registry +
   first-party provider MCP servers; add value on top (reliability, freshness,
   last-known-cost, data-residency). Be the metadata-enrichment layer, not a
   competing registry.
6. **Results-cache with a freshness contract.** Half of the cost-router pivot;
   permanent unit-economics advantage.
7. **Pick a vertical by Q4 2026** and own its quality signal (deepest adapters,
   normalized schema, result SLAs). Run catalog analytics to find the vertical
   with most calls × highest willingness-to-pay × weakest incumbent.

## Copy + voice rules (inherits constitution §"honest value" + anti-slop)

- Lead with the **problem and the buyer's tax**, never the mechanics.
- One concrete number per claim. Original benchmarks beat adjectives.
- The honest spine above is the elevator pitch; everything else is support.
- Human voice, not LLM voice: no em-dashes, no triple-parallel lists, no
  "not just X but Y", admits mistakes, lowercase/fragments OK.
- Comparison pages are honest and number-laden, not promotional — being the
  most verifiable low-risk answer beats being the loudest.
- Never claim breadth we haven't tested. Listed endpoints must be runnable
  (constitution). The leaderboard is the credible version of "we have tools."

## Next actions (ranked)

1. Per-call instrumentation schema + gateway wiring (this week — moat-critical).
2. MCP server (aegntic-as-one-server) + registry listings (highest GEO leverage).
3. "aegntic vs {Firecrawl,Bright Data,ScraperAPI}" comparison pages with real
   benchmarks (needs a credentialed scraping provider — ties to the Apify task).
4. Reddit/HN launch seeding plan (when there's a launch moment + real provider).
5. Curated `llms.txt` + question-H1 doc restructure.
6. Pick the vertical (data-driven, by Q4).
7. Ledger multi-directional design (settlement-ready).

## Confidence notes

- High confidence: OpenRouter metrics, Composio funding, MCP adoption counts,
  Pipedream→Workday, the "discover is commoditized" structural claim.
- Correlation-only (flagged honestly): brand-mention density → citations,
  freshness multipliers, ChatGPT's 40/35/25 weighting (reverse-engineered, not
  OpenAI-confirmed).
- Signal unclear: monid.ai traction/funding, the MCP-server-as-citation-bypass
  thesis (2026 consensus, academic literature not caught up yet).
