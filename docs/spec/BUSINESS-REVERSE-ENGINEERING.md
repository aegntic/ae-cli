# Business Reverse Engineering — Aegntic

> **Date:** 2026-07-17
> **Classification:** Internal — Investor-ready analysis
> **Status:** Living document. Updated per checkpoint.

---

## 1. Product Architecture (Reverse Engineered)

### 1.1 System Components

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                           AEGNTIC PLATFORM                                      │
│                                                                                 │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────────────────────┐    │
│  │   CLI        │     │   SDK        │     │   Dashboard (Next.js 15)     │    │
│  │  (citty)     │     │ (TS types +  │     │   keys, balance, run         │    │
│  │              │     │  fetch       │     │   history, discover          │    │
│  │  discover    │     │  wrapper)    │     │   browser, top-up            │    │
│  │  inspect     │     │              │     │                              │    │
│  │  run         │     │              │     │   Auth: magic-link           │    │
│  │  runs list   │     │              │     │   (better-auth)              │    │
│  │  runs get    │     │              │     │                              │    │
│  │  runs stop   │     │              │     │   Deploy: Vercel             │    │
│  │  balance     │     │              │     │                              │    │
│  │  keys *      │     │              │     │                              │    │
│  │  setup       │     │              │     │                              │    │
│  └──────┬───────┘     └──────┬───────┘     └──────────────┬───────────────┘    │
│         │                    │                             │                    │
│         └────────────────────┼─────────────────────────────┘                    │
│                              │ HTTPS + API key                                  │
│                              ▼                                                  │
│  ┌───────────────────────────────────────────────────────────────────────┐      │
│  │                        GATEWAY (Hono on Bun)                          │      │
│  │                                                                       │      │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌───────────────┐  │      │
│  │  │  Auth      │  │  Catalog   │  │  Runs      │  │  Billing      │  │      │
│  │  │  Middleware│  │  Routes    │  │  Engine    │  │  Ledger       │  │      │
│  │  │            │  │            │  │            │  │               │  │      │
│  │  │ argon2     │  │ /v1/       │  │ POST /v1/  │  │ append-only   │  │      │
│  │  │ key hash   │  │  discover  │  │  runs      │  │ balance_ledger│  │      │
│  │  │ workspace  │  │ GET /v1/   │  │ GET /v1/   │  │ reserve +     │  │      │
│  │  │  scoping   │  │  inspect   │  │  runs/:id  │  │  settle       │  │      │
│  │  │            │  │            │  │ POST /v1/  │  │ refund on     │  │      │
│  │  │            │  │            │  │  runs/:id/ │  │  FAILED       │  │      │
│  │  │            │  │            │  │  stop      │  │               │  │      │
│  │  └────────────┘  └────────────┘  └────────────┘  └───────────────┘  │      │
│  │                                                                       │      │
│  │  ┌───────────────────────────────────────────────────────────────┐   │      │
│  │  │                    Provider Adapter Registry                    │   │      │
│  │  │                                                                 │   │      │
│  │  │  interface ProviderAdapter {                                    │   │      │
│  │  │    searchTools(q) → ToolManifest[]                              │   │      │
│  │  │    resolveTool(slug) → ToolDefinition                           │   │      │
│  │  │    estimateCost(tool, input) → CostEstimate                     │   │      │
│  │  │    startRun(tool, input, idemKey) → {providerRunId, pollMs}    │   │      │
│  │  │    pollRun(providerRunId) → RunStatus                           │   │      │
│  │  │    fetchResults(providerRunId, offset, limit) → ResultPage      │   │      │
│  │  │    cancelRun?(providerRunId) → void                             │   │      │
│  │  │  }                                                              │   │      │
│  │  │                                                                 │   │      │
│  │  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │   │      │
│  │  │  │  Mock    │  │  Apify   │  │  PDL     │  │  Browserbase │   │   │      │
│  │  │  │  (12     │  │  (P2)    │  │  (P3+)   │  │  (P3+)       │   │   │      │
│  │  │  │  tools)  │  │          │  │          │  │              │   │   │      │
│  │  │  │  ✅ live │  │          │  │          │  │              │   │   │      │
│  │  │  └──────────┘  └──────────┘  └──────────┘  └──────────────┘   │   │      │
│  │  └───────────────────────────────────────────────────────────────┘   │      │
│  │                              │                                        │      │
│  └──────────────────────────────┼────────────────────────────────────────┘      │
│                                 │                                                │
└─────────────────────────────────┼────────────────────────────────────────────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    ▼             ▼              ▼
              ┌──────────┐ ┌──────────┐  ┌──────────────┐
              │ Postgres │ │ Upstash  │  │ External     │
              │(Supabase)│ │ QStash   │  │ Providers    │
              │          │ │ (queue)  │  │              │
              │ balance  │ │          │  │ Apify API    │
              │ runs     │ │ async    │  │ PDL API      │
              │ keys     │ │ run      │  │ Exa API      │
              │ ledger   │ │ dispatch │  │ Firecrawl    │
              │ catalog  │ │          │  │ Apollo.io    │
              │ pgvector │ │          │  │ ...          │
              └──────────┘ └──────────┘  └──────────────┘
```

### 1.2 Monorepo Structure

| Package | Path | Purpose | Status |
|---------|------|---------|--------|
| **SDK** | `packages/sdk` | Shared TypeScript types (Provider, Endpoint, Run, Balance, ApiKey), HTTP client | ✅ Shipped (130+ types) |
| **CLI** | `packages/cli` | 11 commands via citty (discover, inspect, run, runs, balance, keys, setup) | ✅ Shipped (9 commands live) |
| **Gateway** | `services/gateway` | Hono API server, provider adapters, billing, auth | ✅ Shipped (mock provider, 5 route files) |
| **Dashboard** | `apps/web` | Next.js 15 landing page + future dashboard | ✅ Landing page (18 tool cards, dark theme) |

### 1.3 Data Flow: discover → inspect → run → poll → bill

```
Agent/Dev                  CLI                     Gateway                Provider
    │                       │                          │                      │
    │ aegntic discover      │                          │                      │
    │  -q "linkedin posts"  │                          │                      │
    │──────────────────────▶│                          │                      │
    │                       │ POST /v1/discover?q=...  │                      │
    │                       │─────────────────────────▶│                      │
    │                       │                          │ pgvector + BM25      │
    │                       │                          │ hybrid search        │
    │                       │                          │ over catalog         │
    │                       │                          │                      │
    │                       │◀─────────────────────────│ ranked endpoints     │
    │◀──────────────────────│ scored results           │                      │
    │                       │                          │                      │
    │ aegntic inspect       │                          │                      │
    │  -p apify -e /...     │                          │                      │
    │──────────────────────▶│ GET /v1/inspect?...      │                      │
    │                       │─────────────────────────▶│                      │
    │                       │◀─────────────────────────│ schema + cost model  │
    │◀──────────────────────│ inputSchema              │                      │
    │                       │                          │                      │
    │ aegntic run           │                          │                      │
    │  -p apify -e /... -i  │                          │                      │
    │──────────────────────▶│ POST /v1/runs            │                      │
    │                       │─────────────────────────▶│ reserve balance      │
    │                       │                          │ startRun()           │
    │                       │                          │─────────────────────▶│
    │                       │◀─────────────────────────│ { runId, RUNNING }   │
    │◀──────────────────────│ run ID                   │                      │
    │                       │                          │  pollRun()           │
    │                       │                          │─────────────────────▶│
    │ aegntic runs get      │                          │                      │
    │  -r <runId>           │                          │                      │
    │──────────────────────▶│ GET /v1/runs/:id         │                      │
    │                       │─────────────────────────▶│                      │
    │                       │◀─────────────────────────│ COMPLETED + results  │
    │                       │                          │ settle: results ×    │
    │                       │                          │  unit_cost × 1.25    │
    │◀──────────────────────│ structured data + cost   │ append ledger        │
    │                       │                          │                      │
    │ aegntic balance       │                          │                      │
    │──────────────────────▶│ GET /v1/balance          │                      │
    │                       │─────────────────────────▶│                      │
    │◀──────────────────────│◀─────────────────────────│ remaining balance    │
    │                       │                          │                      │
```

### 1.4 Core Data Model

| Entity | Fields | Notes |
|--------|--------|-------|
| **Workspace** | id, name, balance_cents, created_at | Owner of keys, runs, balance |
| **ApiKey** | id, workspace_id, label, hash (argon2), active, created_at | Scoped to workspace; never logged in plaintext |
| **Balance** | workspace_id, balance_cents (integer) | Prepaid credit. Never negative. |
| **balance_ledger** | id, workspace_id, job_id, delta_cents, type (charge/refund/topup), provider, units, unit_cost_cents, created_at | Append-only. Balance = SUM(delta_cents). |
| **Provider** | id, name, adapter_config | Apify, PDL, Browserbase, etc. |
| **Endpoint** | provider, path, description, input_schema, cost_model, verified, embedding (pgvector) | Cached schema; embedding for NL discovery |
| **Run** | id, workspace_id, provider, endpoint, input, status, result_uri, cost, idempotency_key, created_at, updated_at | Statuses: READY → RUNNING → COMPLETED/FAILED/BLOCKED/STOPPED/TIME_OUT |

### 1.5 Technology Stack (ADR-0004)

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Monorepo | pnpm workspaces + Turborepo | Fastest builds, native workspace support |
| CLI | citty (UnJS) | ESM-native, zero-dep, tiny bundle |
| Gateway | Hono on Bun | Edge-native, fastest HTTP framework |
| SDK | Pure TypeScript | Shared types, zero runtime deps |
| Database | PostgreSQL (Supabase) + pgvector | Type-safe via Drizzle; pgvector for NL discovery |
| ORM | Drizzle | Lean runtime, type-safe migrations |
| Queue | DB polling (P1) → BullMQ (P2+) | Simple first |
| Web | Next.js 15 + Tailwind + shadcn/ui | Best landing + dashboard DX |
| Auth | argon2 (CLI keys); better-auth (web) | Keys for agents, magic-link for humans |
| Billing | Stripe Checkout + webhooks | Industry standard |
| Embeddings | OpenAI text-embedding-3-small | Catalog NL search |
| Deploy | Vercel (web) + Fly.io (gateway) + Supabase (DB) | Free-tier friendly |

---

## 2. Business Model

### 2.1 Revenue Model

**Pay-per-result with 25% markup on provider costs.**

The core transaction: a developer or agent runs `aegntic run`, which executes a tool against a third-party provider (Apify, PDL, etc.). Aegntic charges the provider's cost plus a 25% markup, debited from a prepaid balance.

```
Revenue = Σ (result_count × provider_unit_cost × 1.25)
```

Per ADR-0005:
- **Per-result metering** (primary): `cost = result_count × unit_cost × 1.25`
- **Per-call fallback** for non-countable tools (fixed fee per execution)
- **Prepaid balance** (integer cents), topped up via Stripe Checkout
- **Free tier:** $5 credit on signup, no card required
- **Append-only ledger:** balance = SUM(delta_cents); auditable, replay-safe

### 2.2 Unit Economics

| Scenario | Provider Cost | Aegntic Charge | Aegntic Margin |
|----------|--------------|----------------|----------------|
| LinkedIn scrape (10 results) | $0.010 | $0.0125 | 20% ($0.0025) |
| Twitter search (100 results) | $0.050 | $0.0625 | 20% ($0.0125) |
| Company enrichment (1 match) | $0.100 | $0.125 | 20% ($0.025) |
| Google Maps (50 results) | $0.025 | $0.0313 | 20% ($0.0063) |
| **Blended average** | **$0.005/result** | **$0.00625/result** | **20% ($0.00125/result)** |

**Note:** The 25% markup yields a 20% gross margin on each transaction (markup ≠ margin). At scale, margin improves through:
- Volume discounts from providers (Apify drops 30-50% at enterprise tiers)
- Self-built high-margin endpoints for popular categories
- Premium/verified endpoint surcharges

### 2.3 Revenue Projections

**Conservative (per-result model, blended $0.00625/result):**

| Stage | Users | Avg Runs/Mo | Avg Results/Run | Monthly Revenue | ARR |
|-------|-------|-------------|-----------------|-----------------|-----|
| Seed (Q1-Q2) | 100 | 200 | 15 | $1,875 | $22.5K |
| Growth (Q3-Q4) | 1,000 | 500 | 20 | $62,500 | $750K |
| Scale (Y2) | 10,000 | 800 | 25 | $1,250,000 | $15M |
| Maturity (Y3) | 100,000 | 1,000 | 30 | $18,750,000 | $225M |

**Floor case (per-call fallback at $0.01/call, conservative usage):**

| Stage | Users | Calls/Mo | Monthly Revenue | ARR |
|-------|-------|----------|-----------------|-----|
| Seed | 100 | 500 | $500 | $6K |
| Growth | 1,000 | 2,000 | $20,000 | $240K |
| Scale | 10,000 | 5,000 | $500,000 | $6M |

### 2.4 Additional Revenue Streams

| Stream | Description | Timeline | Revenue Potential |
|--------|-------------|----------|-------------------|
| **Premium endpoints** | Verified, high-quality tools with surcharge (1.5-2× base) | P3+ | 10-30% uplift on premium runs |
| **Featured listings** | Providers pay for top placement in discover results | P4+ | $500-5K/mo per provider |
| **Enterprise plans** | Custom pricing, SLA, dedicated support, SSO, SOC2 | Y2+ | $10-100K/yr per enterprise |
| **Provider commission** | Reverse marketplace: providers pay Aegntic for distribution | Y2+ | 5-15% of provider revenue through Aegntic |
| **MCP server access** | Premium tier for native agent integration (Claude Code, Cursor) | P5 | Bundled with usage; conversion driver |
| **Data products** | Aggregated, anonymized usage analytics for providers | Y3+ | TBD |
| **Self-built scrapers** | High-demand endpoints built in-house (100% margin) | Y2+ | 60-80% margin on owned tools |

---

## 3. Target Market & TAM/SAM/SOM

### 3.1 Total Addressable Market (TAM): ~$50B

The global data API and web scraping market:

| Segment | Size | Source |
|---------|------|--------|
| Data API marketplace (RapidAPI, Apify, etc.) | $8B | Industry estimates, 2025 |
| Web scraping services & tools | $7B | Grand View Research, 2025 |
| Data enrichment (B2B) | $15B | Markets and Markets, 2025 |
| AI/ML data pipeline tooling | $12B | Gartner, 2025 |
| Enterprise data integration | $8B | IDC, 2025 |
| **Total** | **~$50B** | |

### 3.2 Serviceable Addressable Market (SAM): ~$2B

The intersection of AI agent developers and data tool consumers:

| Segment | Users | Est. Spend/User/Mo | SAM |
|---------|-------|-------------------|-----|
| AI coding agent users (Claude Code, Cursor, Codex, Windsurf) | 2M | $20-50 | $480M-1.2B |
| Indie hackers / solopreneurs building data products | 500K | $10-30 | $60M-180M |
| Startup data teams (< 50 employees) | 100K companies | $100-500 | $120M-600M |
| AI startup founders building agent products | 50K | $50-200 | $30M-120M |
| **Total SAM** | | | **~$2B** |

### 3.3 Serviceable Obtainable Market (SOM): ~$50M (Year 1-2)

Realistic capture in the first 12-24 months:

| Channel | Users (Y1) | ARPU | Revenue |
|---------|-----------|------|---------|
| AI agent skill installs (Claude Code, Cursor MCP) | 5,000 | $3/mo | $180K |
| Developer community (HN, Reddit, Twitter) | 2,000 | $5/mo | $120K |
| Hackathon / conference exposure | 500 | $10/mo | $60K |
| Referral / organic growth | 3,000 | $4/mo | $144K |
| **Y1 SOM** | **10,500** | **blended $4/mo** | **$504K** |

| Channel | Users (Y2) | ARPU | Revenue |
|---------|-----------|------|---------|
| Agent ecosystem (expanded) | 50,000 | $8/mo | $4.8M |
| Enterprise (early) | 100 | $500/mo | $600K |
| Self-serve growth | 100,000 | $5/mo | $6M |
| **Y2 SOM** | **150,100** | | **~$11.4M** |

### 3.4 Market Timing

**Why now:**
1. **AI agent explosion:** Claude Code, Cursor, Codex, Windsurf, and dozens of agent frameworks have created a new class of users — autonomous coding agents that need data but can't hand-roll scrapers.
2. **MCP (Model Context Protocol) standardization:** Anthropic's MCP creates a universal integration surface. Aegntic as MCP server = zero-friction distribution to every MCP-compatible agent.
3. **Fragmentation pain:** Developers currently manage 5-15 different API accounts (Apify, PDL, Clearbit, Exa, SerpApi, etc.) with different auth, billing, and data formats. Aegntic unifies this.
4. **Agent-native UX gap:** Existing API marketplaces (RapidAPI, Apify Store) are designed for human browsing. None optimize for agent-driven discovery via CLI.

---

## 4. Competitive Landscape

### 4.1 Direct Competitors

| Competitor | Description | Tools | Pricing | Strengths | Weaknesses vs Aegntic |
|-----------|-------------|-------|---------|-----------|----------------------|
| **Monid.ai** | "OpenRouter for agent tools" — one wallet, pay-per-call, NL discovery | 1,800+ | Pay-per-call, one balance | Largest catalog, Claude Code integration, established brand | Keyword-tag discovery (not semantic); per-call pricing (no margin cushion); scraping-skewed catalog; no per-result metering |
| **Apify Store** | Marketplace for web scraping "Actors" | 3,000+ | Pay-per-result, $5 free | Largest scraping catalog, mature platform, SDK | Single-domain (scraping only); no NL discovery; browse-first, not CLI-first; no cross-provider unification |
| **RapidAPI** | API marketplace hub | 40,000+ | Freemium, subscription tiers | Largest raw API count, brand recognition | Stale UX, no agent integration, no CLI, subscription-heavy, inconsistent quality, no per-result billing |
| **Composio** | SDK-first agent tool platform | 250+ | Per-action pricing | Good SDK, agent framework integrations | No CLI centerpiece, smaller catalog, SDK lock-in, no discover-first paradigm |

### 4.2 Indirect Competitors

| Competitor | Category | Why Agents Use Them | Aegntic Advantage |
|-----------|----------|-------------------|-------------------|
| **Custom scrapers** | DIY | Full control, no third-party dependency | Discover-first eliminates 80% of custom scraper needs; maintenance-free |
| **Zapier / Make** | No-code automation | Visual workflow builders | Agent-native (CLI, not GUI); per-result, not per-task; no workflow design overhead |
| **Direct API calls** | Point solutions | Known APIs, existing integrations | One key, one balance, one schema format vs managing N providers |
| **Merge.dev Agent Handler** | Enterprise connectors | 100+ pre-built connectors, $650/mo floor | Aegntic is accessible ($5 free), per-result (not flat enterprise fee), CLI-first |

### 4.3 Positioning Map

```
                    Agent-Native UX
                         ▲
                         │
              AEGNTIC ●  │  ● Monid.ai
           (CLI-first,   │  (wallet-first,
            semantic      │   keyword-tag
            discover,     │   discovery)
            per-result)   │
                         │
   ──────────────────────┼──────────────────────▶
                         │           Catalog Breadth
   Custom scrapers ●     │     ● RapidAPI
   (zero catalog,        │     (40K APIs,
    zero discovery)      │      no agent UX)
                         │
                    ● Apify
                    (scraping-only,
                     browse-first)
```

### 4.4 Competitive Moats

| Moat | Aegntic | Monid | Apify | RapidAPI |
|------|---------|-------|-------|----------|
| Semantic NL discovery (pgvector) | ✅ | ❌ (keyword) | ❌ (browse) | ❌ (browse) |
| Per-result metering | ✅ | ❌ (per-call) | ✅ (own tools) | ❌ |
| CLI-first (agent-native) | ✅ | ⚠️ (partial) | ❌ | ❌ |
| Cross-provider unification | ✅ | ✅ | ❌ (single) | ⚠️ (inconsistent) |
| Cost transparency (provider_cost + fee) | ✅ | ❌ | ⚠️ (own only) | ❌ |
| MCP server (native agent integration) | 🔜 (P5) | ✅ | ❌ | ❌ |

---

## 5. Go-to-Market Strategy

### 5.1 Phase 1: Developer Community (Months 1-3)

**Objective:** 1,000 active users. $500 MRR.

| Channel | Tactic | Expected Reach |
|---------|--------|---------------|
| **Hacker News** | "Show HN: One CLI to discover + run 100s of data tools" + live demo | 10-50K impressions, 500-2K signups |
| **Twitter/X** | Build-in-public thread series (one per checkpoint) | 5-20K impressions per thread |
| **Reddit** | r/programming, r/webdev, r/LocalLLaMA, r/ClaudeAI posts | 5-10K impressions |
| **Discord** | AI agent developer communities (Claude, Cursor, LangChain) | 1-5K targeted reach |
| **YouTube** | "Building a Tool Marketplace from Scratch" series | 5-20K views per video |
| **Dev.to / Hashnode** | Technical deep-dives (stack, architecture, ADRs) | 2-5K reads |

**Content calendar aligned with checkpoints:**
- Checkpoint 1 (First Run) → "Zero to end-to-end in 4 hours" ✅ drafted
- Checkpoint 2 (Real Money) → "First real billed run against Apify"
- Checkpoint 3 (Dashboard) → "The full platform is live"
- Checkpoint 4 (Launch) → Public repo flip + coordinated content drop

### 5.2 Phase 2: Agent Ecosystem Integration (Months 3-6)

**Objective:** 10,000 users. $5K MRR.

| Integration | Distribution | Expected Installs |
|-------------|-------------|-------------------|
| **Claude Code Skill** | Anthropic skill registry, SKILL.md already written (v0.1.4) | 5,000-20,000 |
| **Cursor MCP** | MCP server in Cursor registry | 3,000-10,000 |
| **Codex Plugin** | OpenAI Codex skill directory | 1,000-5,000 |
| **OpenClaw / Hermes** | Agent-native distribution | 500-2,000 |
| **Windsurf / Bolt** | Emerging agent IDE integrations | 1,000-5,000 |

**Viral mechanic:** Every agent that installs the Aegntic skill generates revenue on every data call. The skill doc (`aegntic-cli-SKILL.md`, 365 lines) is already production-grade with 10 agent rules, 4 example flows, troubleshooting, and cost management guidance.

### 5.3 Phase 3: Enterprise Sales (Months 6-12)

**Objective:** 100 enterprise accounts. $50K MRR.

| Target | Pain Point | Aegntic Solution |
|--------|-----------|-----------------|
| Mid-market data teams (50-500 employees) | Managing 10+ API vendors, inconsistent auth/billing | One contract, one balance, unified schema |
| AI-first startups | Agent infrastructure costs scaling unpredictably | Per-result pricing, budget controls, cost transparency |
| Consulting firms | Building data pipelines for clients | White-label or partner tier, bulk pricing |

### 5.4 Viral Loop

```
Agent discovers tools via aegntic
        │
        ▼
Agent runs tools → generates revenue per result
        │
        ▼
Agent recommends aegntic to developer (via skill doc)
        │
        ▼
Developer installs aegntic for other projects
        │
        ▼
More usage → more revenue → attracts more tool providers
        │
        ▼
More tools → better discover results → more agent adoption
```

**Key insight:** The user is not a human — it's an AI agent. Agents don't comparison shop. Once `aegntic discover` is in the agent's skill doc, the agent reaches for it reflexively. The habit of "discover first, build never" is installed at the agent level, not the human level. This is a fundamentally different distribution channel than traditional developer tools.

---

## 6. Growth Flywheel

### 6.1 The Catalog Flywheel

```
   More tools in catalog
         │
         ▼
   Better discover results
         │
         ▼
   More agents use aegntic
         │
         ▼
   More revenue per run
         │
         ▼
   More providers want distribution ──▶ More tools in catalog
```

### 6.2 Network Effects

| Effect | Description | Strength |
|--------|-------------|----------|
| **Provider-side** | Providers list on Aegntic for distribution. More users → more attractive platform → more providers list. | Medium (providers multi-home) |
| **Agent-side** | Agents learn `aegntic discover` as habit. More tools → better results → stronger habit. | Strong (habit is sticky) |
| **Data-side** | Usage data improves discover ranking (collaborative filtering). More runs → better relevance. | Strong (compounds with usage) |
| **Content-side** | Build-in-public generates organic developer interest. Each checkpoint is a content beat. | Medium (decays without cadence) |

### 6.3 Compounding Advantages

1. **Catalog grows with usage, not headcount.** Adding a new provider is an adapter implementation (days), not a sales process (months). Each adapter unlocks hundreds of endpoints.

2. **Discover quality improves with every query.** pgvector embeddings + usage signals = collaborative filtering. The 10,000th discover query returns better results than the 1st.

3. **Agent habit is irreversible.** Once an agent's skill doc says "run `aegntic discover` before hand-rolling," that agent never hand-rolls. The skill doc is the distribution moat.

4. **Revenue per user grows with catalog.** More tools → more use cases → more runs per user per month. ARPU is a function of catalog breadth.

---

## 7. Pricing Strategy

### 7.1 Tier Structure

| Tier | Price | What You Get | Target |
|------|-------|-------------|--------|
| **Free** | $0 | $5 credit on signup, no card required | Trial, evaluation |
| **Pay-as-you-go** | Per-result (provider_cost × 1.25) | Full catalog access, all features | Individual devs, agents |
| **Volume** | Automatic discount at spend thresholds | 10% off at $100/mo, 20% at $1K/mo, 30% at $10K/mo | Power users, teams |
| **Enterprise** | Custom | SLA, SSO, SOC2, dedicated support, custom adapters | Data teams, AI startups |

### 7.2 Pricing Rationale

**Why per-result, not per-call:**
- **Value-aligned:** A failed run (0 results) costs nothing. A run returning 100 results costs proportionally.
- **Agent-friendly:** Agents can estimate cost before running (via `inspect` cost model).
- **Defensible:** Most competitors charge per-call. Per-result is harder to implement (requires result counting at settlement) but more honest.
- **Margin cushion:** Per-result allows absorbing partial failures without margin erosion.

**Why prepaid balance, not postpaid:**
- **No credit risk:** Balance never goes negative (reserve-and-settle pattern, ADR-0005).
- **No collections:** Users top up before using. Failed payments = no access, not debt.
- **Agent-safe:** Agents can check balance before running (`aegntic balance`). Budget controls prevent runaway spend.
- **Workspace controls:** Budget caps and per-run caps (BLOCKED status) give admins control.

**Why $5 free (not $0 or $10):**
- **Apify gives $5 free** on signup. Matching removes the switching cost argument.
- **$5 funds ~500-1000 results** at typical pricing. Enough to evaluate, not enough to freeride.
- **No card required** removes friction. Card collection at top-up (Stripe Checkout).

### 7.3 Pricing Examples

| Use Case | Tool | Results | Provider Cost | Aegntic Cost | User Pays |
|----------|------|---------|--------------|-------------|-----------|
| Scrape 10 LinkedIn profiles | LinkedIn scraper | 10 | $0.050 | $0.063 | $0.063 |
| Search Twitter for "AI" (50 tweets) | Tweet scraper | 50 | $0.025 | $0.031 | $0.031 |
| Enrich 100 companies | Company API | 100 | $1.000 | $1.250 | $1.250 |
| Google Maps (20 restaurants) | Maps scraper | 20 | $0.010 | $0.013 | $0.013 |
| **Monthly (100 runs, avg 25 results)** | | **2,500** | **$12.50** | | **$15.63** |

### 7.4 Transparency as Differentiator

Per ADR-0005: the dashboard shows `provider_cost` and `aegntic_fee` separately on every run. This is the wedge against opaque competitors. Developers trust platforms that show the math.

```
Run: ru_abc123
  Provider cost:    $0.0100  (Apify)
  Aegntic fee:      $0.0025  (25%)
  Total charged:    $0.0125
  Results returned: 10
  Cost per result:  $0.00125
```

---

## 8. Risk Analysis

### 8.1 Provider Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| **Provider outage** (Apify down = runs fail) | Medium | High | Multi-provider redundancy: every popular category has 2+ providers. Adapter registry pattern makes failover trivial. |
| **Provider price increase** | Medium | Medium | Long-term volume contracts at scale. Build high-demand scrapers in-house (100% margin). Transparent pricing means users see the increase too — shared pain. |
| **Provider TOS change** (blocks aggregation) | Low | High | Legal review of each provider's terms. Maintain direct relationships with provider partnership teams. Diversification across 5+ providers. |
| **Provider launches competing product** | Low | Medium | Speed to market + agent-native moat. By the time Apify builds CLI discovery, Aegntic has 10K agents habituated. |

### 8.2 Market Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| **RapidAPI adds agent features** | Medium | Medium | Agent-native UX is the moat. RapidAPI's 40K API catalog is browse-first — rearchitecting for CLI + NL discovery is a multi-year effort. |
| **Monid.ai raises and scales** | High | High | Compete on (1) semantic discovery quality, (2) per-result metering, (3) cost transparency. Speed of execution is the primary defense. |
| **Anthropic/OpenAI build native tool markets** | Low | Very High | Position as the neutral, cross-platform marketplace. If Anthropic builds Claude-only tool discovery, Aegntic still serves Cursor, Codex, and every other agent. |
| **Agent adoption slower than expected** | Medium | High | Developer (human) market is the fallback. Same product, different distribution. |

### 8.3 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| **Balance/billing bugs** (double-charge, negative balance) | Low | Very High | Append-only ledger (ADR-0005). Reserve-and-settle pattern. Balance never negative. TDD on all billing logic. |
| **Catalog quality** (stale/broken endpoints) | Medium | Medium | Verified badge system. Automated endpoint health checks. Community reporting. |
| **Discovery relevance** (NL search returns bad results) | Medium | High | pgvector hybrid search (semantic + BM25). Continuous embedding updates. Usage-based re-ranking. |
| **Security breach** (API keys, provider secrets) | Low | Very High | argon2 key hashing. Provider secrets in env/vault only. Security gate before billing endpoints ship (PRD non-goal). Gitleaks clean before public flip. |

### 8.4 Business Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| **Margin compression** (race to zero on markup) | Medium | Medium | Value-add services (verified endpoints, SLA, enterprise features). Self-built high-margin tools. Catalog completeness as switching cost. |
| **User concentration** (top 10 users = 80% revenue) | Medium | Medium | Volume discounts retain whales. Self-serve growth diversifies base. |
| **Regulatory** (data privacy, scraping legality) | Low | Medium | Provider-of-record model: providers are responsible for data legality. Aegntic is the pipe, not the source. Legal review of each provider category. |

---

## 9. Financial Projections (Year 1-3)

### 9.1 P&L Summary

| Metric | Year 1 | Year 2 | Year 3 |
|--------|--------|--------|--------|
| **Active Users** | 1,000 | 10,000 | 100,000 |
| **Avg Runs/User/Month** | 100 | 300 | 500 |
| **Avg Results/Run** | 15 | 25 | 30 |
| **Blended Revenue/Result** | $0.0063 | $0.0058 | $0.0055 |
| **Gross Revenue** | $113,400 | $5,220,000 | $99,000,000 |
| **Provider Costs (80%)** | $90,720 | $4,176,000 | $79,200,000 |
| **Gross Profit** | $22,680 | $1,044,000 | $19,800,000 |
| **Gross Margin** | 20% | 20% | 20% |
| **Operating Expenses** | $180,000 | $800,000 | $4,000,000 |
| **Net Income** | ($157,320) | $244,000 | $15,800,000 |

### 9.2 Operating Expense Breakdown

| Category | Year 1 | Year 2 | Year 3 |
|----------|--------|--------|--------|
| Infrastructure (Supabase, Vercel, Fly.io, Upstash) | $12,000 | $60,000 | $300,000 |
| Provider API costs (self-built tools) | $24,000 | $200,000 | $1,000,000 |
| Team (2 → 8 → 25 people) | $120,000 | $480,000 | $2,400,000 |
| Marketing & content | $12,000 | $40,000 | $200,000 |
| Legal & compliance | $12,000 | $20,000 | $100,000 |
| **Total OpEx** | **$180,000** | **$800,000** | **$4,000,000** |

### 9.3 Funding Requirements

| Stage | Amount | Use | Timeline |
|-------|--------|-----|----------|
| **Pre-seed / Bootstrapped** | $0-50K | Hackathon build, first 100 users | Months 1-3 |
| **Seed** | $500K-1M | Real providers, dashboard, first 1K users, 2-person team | Months 3-9 |
| **Series A** | $3-5M | Scale to 10K users, enterprise sales, 8-person team | Months 9-18 |
| **Series B** | $10-20M | 100K users, international, self-built tools, 25-person team | Months 18-36 |

### 9.4 Key Metrics (Investor Dashboard)

| Metric | Month 3 | Month 6 | Month 12 | Month 24 | Month 36 |
|--------|---------|---------|----------|----------|----------|
| MAU | 100 | 1,000 | 10,000 | 100,000 | 500,000 |
| MRR | $500 | $5,000 | $50,000 | $500,000 | $5,000,000 |
| Catalog Size | 100 | 500 | 2,000 | 10,000 | 50,000 |
| Providers | 1 (mock) | 3 | 10 | 30 | 100 |
| Avg Runs/User/Mo | 50 | 100 | 300 | 500 | 800 |
| CAC | $0 (organic) | $5 | $15 | $25 | $30 |
| LTV | $20 | $60 | $180 | $400 | $800 |
| LTV:CAC | ∞ | 12:1 | 12:1 | 16:1 | 27:1 |
| NRR (Net Revenue Retention) | — | 110% | 120% | 130% | 140% |

### 9.5 Conservative vs Bull Case

| Scenario | Y1 Revenue | Y2 Revenue | Y3 Revenue |
|----------|-----------|-----------|-----------|
| **Bear** (50% of base) | $57K | $2.6M | $50M |
| **Base** | $113K | $5.2M | $99M |
| **Bull** (2× base, enterprise wins) | $227K | $10.4M | $198M |

**Bear case drivers:** Slower agent adoption, Monid.ai captures market, provider margin compression.
**Bull case drivers:** MCP becomes standard, enterprise contracts, self-built high-margin tools, international expansion.

---

## 10. The Moat

### 10.1 Four-Layer Moat

```
Layer 4: HABIT (strongest)
┌─────────────────────────────────────────────────────────────┐
│  Agents that "discover first" never hand-roll.              │
│  The skill doc IS the distribution channel.                  │
│  Once installed, switching cost = rewriting the agent.      │
└─────────────────────────────────────────────────────────────┘

Layer 3: NETWORK EFFECTS
┌─────────────────────────────────────────────────────────────┐
│  More tools → more agents → more revenue → more providers.  │
│  Catalog grows with usage, not headcount.                   │
│  Usage data improves discover quality (collaborative filter).│
└─────────────────────────────────────────────────────────────┘

Layer 2: AGENT-NATIVE UX
┌─────────────────────────────────────────────────────────────┐
│  CLI-first. Schema-driven. Discover → run in two commands.  │
│  Not a web portal ported to CLI — built CLI-first.          │
│  pgvector semantic search, not keyword tags.                │
└─────────────────────────────────────────────────────────────┘

Layer 1: CATALOG COMPLETENESS
┌─────────────────────────────────────────────────────────────┐
│  Most tools in one place.                                   │
│  Cross-provider unification (one key, one balance).         │
│  Adapter pattern makes adding providers fast (days, not mo).│
└─────────────────────────────────────────────────────────────┘
```

### 10.2 Why Incumbents Can't Easily Replicate

| Incumbent | Why They Can't Copy |
|-----------|-------------------|
| **RapidAPI** | 40K APIs but browse-first UX. Rebuilding for CLI + NL discovery requires re-architecting discovery (pgvector, embeddings, schema normalization) across 40K inconsistent APIs. Multi-year effort. |
| **Apify** | 3K+ Actors but single-domain (scraping). Expanding to enrichment, search, CRM means competing with their own providers. Business model conflict. |
| **Monid.ai** | 1,800+ tools but keyword-tag discovery and per-call pricing. Switching to semantic search + per-result metering requires catalog re-embedding and billing system rewrite. First-mover in agent tools but not in CLI-native UX. |
| **Anthropic / OpenAI** | Could build native tool markets, but platform-lock (Claude-only or GPT-only) limits appeal. Aegntic is the neutral cross-platform option. |

### 10.3 The Habit Moat (Deepest Analysis)

The most durable moat is not technology — it's **installed habit at the agent level**.

When a developer installs the Aegntic skill in Claude Code, the skill doc (`aegntic-cli-SKILL.md`) instructs the agent:

> *"Discover first, always. Before writing a scraper, calling a third-party API directly, or telling the user you can't access something — run `aegntic discover`."*

This is not a suggestion. It's a **rule** (Rule #1 of 10). The agent internalizes it. Every subsequent session, every data need, the agent reaches for `aegntic discover` before anything else. The developer never sees the decision — it happens inside the agent.

**This is a new kind of distribution.** Traditional developer tools compete for human attention (docs, blog posts, conference talks). Aegntic competes for agent attention — a 365-line SKILL.md that becomes the agent's reflex.

**Switching cost:** To leave Aegntic, a developer must (1) uninstall the skill, (2) rewrite the agent's data-fetching behavior, (3) find a competitor with equivalent catalog breadth and agent-native UX. Nobody does this for a $5/mo tool. The habit persists.

### 10.4 Defensibility Timeline

| Phase | Primary Moat | Vulnerability |
|-------|-------------|--------------|
| **P1-P2 (now)** | First-mover in agent-native CLI discovery | Low catalog, mock provider only |
| **P3-P4 (months 3-6)** | Real providers, dashboard, public launch | Monid.ai has larger catalog |
| **P5+ (months 6-12)** | MCP server = native agent integration | Platform risk if Anthropic builds native |
| **Year 2** | Network effects + habit + catalog breadth | Enterprise sales execution risk |
| **Year 3** | Self-built tools + data products + ecosystem | Margin compression at scale |

---

## Appendix A: Checkpoint Status

| Checkpoint | Name | Status | Key Metric |
|-----------|------|--------|-----------|
| P0 | Foundation | ✅ Complete | Repo, ADRs, stack locked |
| P1 | First Run | ✅ Complete | discover → run → poll → balance debit (mock, 12 tools) |
| P2 | Real Money | 🔜 Next | First real billed run against Apify |
| P3 | Dashboard Live | 📋 Planned | Web dashboard with keys, balance, runs |
| P4 | Launch | 📋 Planned | Public repo flip + content drop |
| P5 | Agent Wedge | 📋 Planned | MCP server for native agent integration |

## Appendix B: Key ADRs

| ADR | Title | Status |
|-----|-------|--------|
| ADR-0001 | Monorepo: the whole business in one repo | Accepted |
| ADR-0002 | Repo visibility: private-first, public at launch | Accepted |
| ADR-0003 | Nested independent repo (not a workspace subdir) | Accepted |
| ADR-0004 | Stack: TypeScript, Hono, citty, Drizzle, Postgres | Accepted |
| ADR-0005 | Billing: prepaid, per-result, 25% markup, append-only | Accepted |
| ADR-0005b | Provider adapter pattern: interface + mock-first | Accepted |
| ADR-0006 | Merge Agent Handler = reference only, not an asset | Accepted |
| ADR-0007 | Monid.ai is primary analog; differentiation plan | Accepted |

## Appendix C: The One-Liner

> **"One CLI, one balance, every data tool — discover first, run second."**

---

*Report generated from live codebase analysis (commit c83acf9), ADRs, PRD, architecture docs, build log, SKILL.md (v0.1.4), and competitive research. All projections are estimates based on comparable marketplace models and should be validated against actual user data as checkpoints progress.*
