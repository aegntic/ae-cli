# 01_Laboratory Project Inventory
**Generated:** 2026-07-18  
**Path:** `/home/ae/AE/01_Laboratory/`  
**Focus:** Core experimental projects showing clear trajectory

---

## 🎯 PRIMARY PROJECTS (Deep Dive)

---

### 1. Vibe-Trading
**Path:** `/home/ae/AE/01_Laboratory/Vibe-Trading/`  
**Type:** Production-grade open-source trading agent platform  
**Timeline:** Active since **Apr 2026** (v0.1.4) → **v0.1.10** (Jul 2026)  
**Status:** **PRODUCTION / OPEN SOURCE** — Published to PyPI as `vibe-trading-ai`

#### Description
"Your Personal Trading Agent" — One-command CLI + Web UI + MCP server that turns natural language into runnable financial research, backtests, multi-agent swarms, and broker execution. Built by **HKUDS** (HKU Data Science).

#### Tech Stack
| Layer | Stack |
|-------|-------|
| **Language** | Python 3.11+ |
| **Agent Framework** | LangChain 1.x, LangGraph, langchain-openai |
| **API** | FastAPI, Uvicorn, WebSockets, SSE |
| **Frontend** | React 19, Vite, TanStack Router/Query, ECharts |
| **Data** | 18 market sources (Tushare, Yahoo, OKX, CCXT, mootdx, Eastmoney, Baostock, Finnhub, Alpha Vantage, Tiingo, FMP, Sina, Stooq, Futu, SEC EDGAR, local CSV/Parquet/DuckDB) |
| **Backtest** | Custom engines: Equity, ChinaFutures, GlobalFutures, Forex, Options v2 + Monte Carlo, Bootstrap CI, Walk-Forward |
| **Brokers** | 10 connectors: IBKR, Robinhood, Tiger, Longbridge, Alpaca, OKX, Binance, Futu, Dhan, Shoonya |
| **MCP** | 68+ tools over stdio/HTTP |
| **Infra** | Docker, uv, pytest-socket, Ruff, PyPI/ClawHub |

#### Key Achievements
- **10 broker connectors** (paper + bounded live behind mandate gates)
- **456 pre-built alphas** across 4 zoos (Qlib158, Alpha101, GTJA191, Academic)
- **29 swarm presets** (investment committee, quant desk, risk committee, crypto desk, macro desk, earnings desk, technical panel, global allocation)
- **Shadow Account** — broker journal → behavior diagnostics → rule extraction → counterfactual backtest → HTML/PDF audit report
- **Research Autopilot** — Hypothesis → Signal Engine → Backtest end-to-end (68 tools)
- **IM Channel Runtime** — 16 adapters (Telegram, Slack, Discord, Matrix, WhatsApp, Signal, QQ, WeChat, Feishu, DingTalk, Teams, Email, Mochat)
- **Alpha Compare** — head-to-head benchmarking across CLI, Web, REST, Agent
- **Multi-language docs** (EN, ZH, JA, KO, AR) + live wiki at vibetrading.wiki
- **Trendshift featured** — active community, regular releases

#### Trajectory Connection
**This is the flagship product.** Everything else in the laboratory feeds into or learns from Vibe-Trading:
- Agent orchestration patterns → ClawReform / Cognitive OS
- Multi-agent swarm architecture → aegntic-services / auto-sov-ops
- Economic routing & tiered complexity → Cognitive OS "Insane Mode"
- Shadow Account (behavior extraction) → roadmap-builder-core decision logging
- MCP tool surface → cldcde / hermes-agent plugins

---

### 2. roadmap-builder-core
**Path:** `/home/ae/AE/01_Laboratory/roadmap-builder-core/`  
**Type:** Reusable product strategy framework  
**Timeline:** **Jul 2026** (active development)  
**Status:** **CORE INFRASTRUCTURE** — Used by Insidher & other ventures

#### Description
"Reusable **%brainstorm → $billions** pathway + interactive decision board." A standalone Python module that encodes a universal 8-stage venture progression with XP/quest mechanics, plus an interactive MCQ decision server that writes Obsidian vault notes with wikilinks and emits 3D graph data.

#### Tech Stack
| Layer | Stack |
|-------|-------|
| **Language** | Python 3.11+ (stdlib only — `http.server`, `json`, `argparse`) |
| **Frontend** | Self-contained HTML/JS (Three.js via CDN for 3D graph) |
| **Storage** | JSON + Markdown (Obsidian-compatible vault) |
| **Architecture** | Two files: `pathway.py` (spine + renderers), `decide.py` (MCQ server + graph + vault) |

#### Key Achievements
- **8-stage fixed spine**: `%brainstorm → $signal → $wedge → $mvp → $pmf → $engine → $scale → $billions`
- **XP/quest system** per stage with unlock criteria
- **Interactive MCQ server** (A–D top options + E freeform) with:
  - Distance-to-core coloring (CORE/NEAR/MID/FAR)
  - Impact preview on prior decisions + stages
  - Auto-generated Obsidian vault with `[[wikilinks]]`
  - 3D force-directed graph (stages + decisions + impact edges)
- **Path templates**: Path A (Professional/Play Store), Path B (Restricted/Private)
- **Self-check** on import (validates spine length + renderers)

#### Trajectory Connection
**The meta-tool for venture building.** Used to steer Insidher (adult industry SaaS) and designed for reuse across every autonomous business spawned by `auto-sov-ops`. The decision log → vault → graph pipeline mirrors the Cognitive OS memory architecture (Episodic → Semantic → Procedural).

---

### 3. auto-sov-ops
**Path:** `/home/ae/AE/01_Laboratory/auto-sov-ops/`  
**Type:** Autonomous business operating system  
**Timeline:** **May 2026** (foundations) → **Active**  
**Status:** **OPERATING SYSTEM LAYER** — "Clone it, run `lfg`"

#### Description
"One-person autonomous business OS. Systems over labor. Margin over funding. Repeatability over scale. 24-48 hours is the new 90 days. Every change must make the next change easier. Technical debt is not allowed."

#### Core Capabilities
- Fully autonomous company creation & operation
- Real-time pain discovery via Reddit + X subagents
- X posting & distribution as first-class capability
- Human-feeling output on pure AI leverage
- **Cash in 24-48 hours or deleted**

#### Structure
```
auto-sov-ops/
├── companies/        # Generated autonomous businesses
├── systems/          # Reusable leverage systems
├── docs/solutions/   # Compound engineering learnings
├── skills/           # Custom caveman + factory integration skills
```

#### Systems Subfolder
- `cash-droid-core.py` — Core revenue automation
- `stripe-integration/` — Payment processing

#### Tech Stack
- **Orchestration**: Compound-engineering, Factory droids, caveman token efficiency
- **MCP Surface**: gitnexus, notebooklm, context7, shadcn, github
- **Skills**: ce-* (compound engineering), lfg autonomous pipeline

#### Trajectory Connection
**The execution layer for the roadmap-builder-core strategy.** Takes a roadmap decision output and spins up a real company in `companies/`. The "First Principle" — *if it doesn't print money in 24-48h with zero ongoing labor, delete it* — is the operationalization of the `$signal → $wedge` stages.

---

### 4. Cognitive OS (aegntic.ai)
**Path:** `/home/ae/AE/01_Laboratory/aegntic-services/cognitive-os.html` (spec) + `/home/ae/AE/01_Laboratory/cognitive-os/` (deployed)  
**Type:** Cognitive architecture specification for autonomous agents  
**Timeline:** **Jun 2026** (v3.0 spec published)  
**Status:** **SPECIFICATION RUNNING IN PRODUCTION** across 5 AI harnesses

#### Description
"A 16-section specification that turns any AI coding agent into a self-healing, economically-aware, adversarially-secure cognitive engine. Multi-model routing. Four-layer persistent memory. Swarm coordination with DAG execution. All running in production today."

#### Architecture: 10-Layer Cognitive Stack
| Layer | Function | Key Mechanism |
|-------|----------|---------------|
| 01 | Intake & Triage | T0–T4 complexity classification |
| 02 | Reasoning Mode Selection | System-1 (fast) vs System-2 (deep CoT) |
| 03 | Context Budget Management | Real-time token economics, compaction |
| 04 | Diff-Aware Context | Re-read files before edit, verify after |
| 05 | Tool Result Blindness Detection | Detect truncated/suspicious output |
| 06 | Semantic Search Verification | 8-vector rename protocol |
| 07 | Generated File Guard | Modify source, never output |
| 08 | Phased Execution | ≤5 files/phase, verify between |
| 09 | Rollback Planning | Commit hash recorded, git reset on catastrophe |
| 10 | Dependency Discipline | Lockfile detection, no mixed package managers |

#### 4-Layer Memory
| Layer | Name | Backend | TTL |
|-------|------|---------|-----|
| L1 | Working (Session) | Context window | Session |
| L2 | Episodic (Experience) | gbrain PGLite | Cross-session |
| L3 | Semantic (Knowledge) | Docs + gbrain | Permanent |
| L4 | Procedural (Instinct) | Skills/hooks/droids | Permanent |

#### "Insane Mode" (Production Patterns Nobody Else Does)
1. **Ensemble Verification** — Dual-model cross-check, third breaks tie
2. **Adversarial Self-Red-Team** — Agent attacks own code before completion
3. **Instinct Evolution** — Observation → Hypothesis → Instinct → Skill → Hook → Automation
4. **Economic Routing** — ROI-aware: skip verification if cost > bug value
5. **DAG Swarm Execution** — Parallel sub-agents in isolated git worktrees
6. **Forgetting Curve** — Memory confidence decays exponentially after 30 days

#### Economic Intelligence (Tiered Model Routing)
| Tier | Complexity | Budget | Model |
|------|------------|--------|-------|
| T0 | Typo fix, format | ~$0.01 | Haiku / Flash |
| T1 | Single component | ~$0.05 | Sonnet / GLM-5.2 |
| T2 | Architecture, multi-system | ~$0.25 | Opus / Gemini Pro |
| T3 | Security review, formal verify | ~$1.00 | Ensemble (dual-model) |
| T4 | Novel algorithm, 20+ files | ~$5.00 | Dual heavy + human gate |

#### Multi-Harness Adapters
- Droid (Factory)
- Claude Code
- Cursor
- Codex
- Gemini

#### Trajectory Connection
**The cognitive substrate.** Vibe-Trading's agent loop, ClawReform's agent genome, auto-sov-ops' droids, and cldcde's context monitor all instantiate patterns from this spec. The 10-layer stack = Vibe-Trading's agent harness hardened. The 4-layer memory = gbrain integration. The swarm DAG = Factory droid coordination. The economic routing = compound-engineering token efficiency (caveman mode).

---

### 5. ClawReform (clawREFORM)
**Path:** `/home/ae/AE/01_Laboratory/ClawReform/` + `/home/ae/AE/01_Laboratory/clawREFORM-ecosystem/`  
**Type:** Governed multi-agent runtime / Agent OS  
**Timeline:** **Feb–Apr 2026** (design) → **Apr 2026** (blueprint PDFs) → **Active**  
**Status:** **ARCHITECTURAL BLUEPRINT** — PDFs + blueprint docs + genesis pipeline

#### Description
"Built as a governed multi-agent runtime, not a monolithic 'main agent.' The winning pattern is a narrow, visible, infrastructure-first system where responsibilities are separated cleanly. Conceptually a city: institutions operate independently under shared infrastructure, time, rules, records."

#### Runtime Topology
```
Human → Operator → Genesis → Registry
                    ↓            ↓
              Planner ↔ Dispatcher ↔ Scheduler
                    ↓            ↓
            Agents/Workers ↔ Event Bus/Mailboxes ↔ Artifacts/Memory/Logs
                    ↓
         Evaluator / Repair Loop / Policy Engine / Lifecycle Manager
```

#### Four Planes
| Plane | Components |
|-------|------------|
| **Control** | Operator, Genesis, Registry, Lifecycle Manager, Policy Engine |
| **Execution** | Dispatcher, Scheduler, Agents/Workers, Event Bus/Mailboxes |
| **Knowledge** | Artifact Store, Memory Layers, Logs/Traces, World-State Summaries |
| **Governance** | Evaluator, Repair Loop, Audit Trails, Health Reporting, Lifecycle Transitions |

#### Key Components (from blueprint docs)
- **Genesis** — Birth pipeline: SpecParser → RoleArchitect → ConstraintBinder → TemplateForge → ContractSmith → CapabilityBinder → TrialRunner → BirthRegistrar → Activator
- **Registry** — Source of truth: identity, capability, schedule, lifecycle, health, dependencies, addressing
- **Scheduler** — Owns time, emits recurring triggers, wakes dormant specialists
- **Dispatcher** — Owns routing, chooses target via Registry + Policy Engine
- **Evaluator** — Quality inspection
- **Repair Loop** — Failure classification (transient/contract/capability/dependency/policy) → retry/reroute/fallback/escalate/quarantine
- **Agent Templates** — sentinel-worker, transform-worker, executor-worker, scheduler-task, project-agent, router-agent, evaluator-agent, repair-agent

#### Genesis Pipeline (GENESIS.md)
```
Request → SpecParser → RoleArchitect → ConstraintBinder → TemplateForge
→ ContractSmith → CapabilityBinder → TrialRunner → BirthRegistrar → Activator
```
**Birth Validation Gates:** Contract acceptance, output schema, policy boundary, scope, failure format, logging/trace

#### Roadmap (ROADMAP.md)
1. **Constitution** — AGENT_CARD, CONTRACT, CAPABILITIES, constitutional prompts
2. **Registry** — Source of truth + query surface
3. **Time & Routing** — Scheduler + Dispatcher
4. **Execution Substrate** — Worker runner, Event Bus, Artifact Store, trace logging
5. **Governance** — Evaluator, Repair Loop, lifecycle transitions
6. **Genesis** — Birth pipeline + validation harness
7. **Evolution** — Shadow agents, template revision, controlled upgrade channels

#### Trajectory Connection
**The institutionalization of Cognitive OS patterns.** Where Cognitive OS is the *cognitive spec for a single agent*, ClawReform is the *runtime for a society of agents*. The Genesis birth pipeline = instinct evolution (L4 memory) made operational. The Repair Loop = self-healing pipeline made institutional. The four planes = the 10-layer stack scaled horizontally.

---

### 6. aegntic-services
**Path:** `/home/ae/AE/01_Laboratory/aegntic-services/`  
**Type:** Service ecosystem / aegntic.ai production backend  
**Timeline:** **Apr–May 2026** (asset generation) → **Jun 2026** (Cognitive OS v3)  
**Status:** **ASSET HUB + SPEC HOST**

#### Contents
- **Design Assets** — 20+ high-res ClawReform design renders (z-axis, debossed, negspace, layering metals, mattae void, specular, lightspill)
- **PDF Blueprints** — `clawREFORM_Agent_OS.pdf` (25MB), `clawREFORM_Architectural_Blueprint.pdf` (16MB)
- **Agent OS Pages** — 5-page design specification (agent_os_page_1–5.png)
- **Blueprint Pages** — 5-page architectural blueprint (blueprint_page_1–5.png)
- **Cognitive OS Spec** — `cognitive-os.html` (the v3.0 spec, 43KB)
- **Skill/agent templates** — coding-agent, blog-writer, stock-analysis-skill, ui-ux-pro-max, etc.
- **MCP servers** — aminer-academic-search, aminer-daily-paper, ai-news-collectors, web-search, web-reader, etc.

#### Trajectory Connection
**The design & specification foundry.** All visual identity for ClawReform, Cognitive OS, and aegntic.ai brand lives here. The Cognitive OS spec *is* the cognitive-os.html file in this repo. This is where "ideas become assets become specs become running systems."

---

### 7. aiAURA
**Path:** `/home/ae/AE/01_Laboratory/aiAURA/`  
**Type:** AI capabilities platform / skill registry  
**Timeline:** **Apr–May 2026** (asset generation)  
**Status:** **CAPABILITY CATALOG**

#### Description
Massive repository of AI skill modules, agent templates, and capability components. Appears to be the "skills marketplace" layer for the aegntic ecosystem.

#### Key Directories (capability modules)
| Category | Modules |
|----------|---------|
| **Sensory** | ASR, TTS, VLM, agent-browser |
| **Cognitive** | coding-agent, interview-designer, dream-interpreter, mindfulness-meditation, storyboard-manager |
| **Creative** | image-edit, image-generation, image-understand, video-generation, video-understand, podcast-generate, ppt, web-shader-extractor |
| **Research** | aminer-academic-search, aminer-daily-paper, ai-news-collectors, qingyan-research, multi-search-engine, web-search, web-reader, market-research-reports |
| **Finance** | finance, stock-analysis-skill, get-fortune-analysis, gift-evaluator |
| **Productivity** | blog-writer, seo-content-writer, content-strategy, contentanalysis, docx, pdf, xlsx, writing-plans, skill-creator, skill-finder-cn, skill-vetter |
| **Technical** | auto-target-tracker, fullstack-dev, components, lib, hooks, websocket, ws-service, app, visual-design-foundations, ui-ux-pro-max |
| **Build** | build.sh, dev.sh, start.sh, mini-services-*.sh |

#### Major Assets
- `clawREFORM_Agent_OS.pdf` (25MB) — duplicated from aegntic-services
- `clawREFORM_Architectural_Blueprint.pdf` (16MB)
- 5 agent OS design pages + 5 blueprint pages (PNG, 4–7MB each)

#### Trajectory Connection
**The capability library** that Genesis (ClawReform) draws from when spawning new agents. The skill-creator/skill-finder/skill-vetter trio = the "instinct evolution" pipeline (L4 procedural memory) made toolable.

---

### 8. clawreform-waitlist
**Path:** `/home/ae/AE/01_Laboratory/clawreform-waitlist/`  
**Type:** Modern fullstack waitlist application  
**Timeline:** **Apr 2026** (created with Better Fullstack template)  
**Status:** **PRODUCT MARKETING LAYER**

#### Tech Stack
| Layer | Stack |
|-------|-------|
| **Runtime** | Bun |
| **Framework** | React + TanStack Router (file-based, type-safe) |
| **Styling** | TailwindCSS + shadcn/ui |
| **Server** | Hono (lightweight, performant) |
| **API** | tRPC (end-to-end type-safe) |
| **Database** | Drizzle ORM + SQLite/Turso |
| **Auth** | Better Auth |
| **Monorepo** | Turborepo |
| **Quality** | Oxlint + Biome, Husky git hooks |
| **Docs** | Starlight (Astro) |
| **Native** | Tauri (desktop), PWA support |
| **Testing** | Storybook, MSW (API mocking) |
| **Data** | TanStack Query, Table, Virtual, DB, Pacer |

#### Trajectory Connection
**The public-facing lead capture for ClawReform.** Demonstrates the "professional productivity" (Path A) stack choices that the roadmap-builder-core would recommend for a Play Store distribution path. Dogfoods the aegntic stack (TanStack, Hono, Drizzle, Turborepo).

---

### 9. cldcde
**Path:** `/home/ae/AE/01_Laboratory/cldcde/`  
**Type:** Claude Code developer experience platform  
**Timeline:** **Dec 2025** (initial) → **Jun 2026** (major refresh)  
**Status:** **COMMUNITY PLATFORM + NPM PACKAGES**

#### Description
"Boost your AI development workflow with battle-tested tools used by thousands of developers worldwide." Platform at cldcde.cc + two NPM packages.

#### Core Components
| Package | Purpose |
|---------|---------|
| `@aegntic/cldcde-cli-shortcuts` | Shell aliases & functions for Claude Code |
| `@aegntic/cldcde-context-tracker` | Token estimation, context visualization, session monitoring |

#### Platform Features (cldcde.cc)
- MCP server registry & discovery
- Extension/tool marketplace
- Documentation hub
- Newsletter
- Community (GitHub issues/discussions/wiki)

#### Key Files
- `CLAUDE.md` — Project instructions for Claude Code
- `context-monitor.js` — Real-time token tracking
- `context-tracker-package.json` — Package config
- `server.ts` — Hono backend
- `wrangler*.toml` — Cloudflare Workers config
- `skills/` — Platform skills
- `frontend/`, `website/`, `showcase-site/` — Web properties
- `aegntic-hive-mcp/` — MCP integration
- `context-tracker/` — Context monitoring core
- `mcp-servers/`, `plugins/`, `projects/` — Extensibility

#### Trajectory Connection
**The developer experience layer.** The context-tracker = Cognitive OS Layer 3 (Context Budget Management) + Layer 5 (Tool Result Blindness Detection) made into a CLI tool. The MCP registry = Registry plane (ClawReform) exposed to community. The shortcuts = Procedural memory (L4) encoded as shell aliases.

---

## 📦 SUPPORTING PROJECTS (Clear Progression Signals)

| Project | Path | Signal |
|---------|------|--------|
| **clawREFORM-ecosystem** | `/clawREFORM-ecosystem/` | Ecosystem coordination layer (README only, 34 bytes) |
| **polymarket-auto** | `/polymarket-auto/` | Prediction market automation (Jul 2026 active) |
| **memecoin-automation-swarm** | `/memecoin-automation-swarm/` | Crypto trading swarm (Jun 2026) |
| **sleepmoney** | `/sleepmoney/` | Autonomous YouTube pipeline (May 2026) |
| **yt-autonomous** | `/yt-autonomous/` | Video automation (Jul 2026) |
| **aegntic-portfolio** | Skill: `aegntic-portfolio` | Single-file portfolio generator |
| **gstack-dashboard** | `/gstack-dashboard/` | Operator dashboard (Apr 2026) |
| **prologue / prologue-openclaw / prologue-site** | Multiple | Landing page iterations |
| **openclaw-site** | `/openclaw-site/` | OpenClaw marketing site (Mar 2026) |
| **FPEF-website** | `/FPEF-website/` | FPEF site (Apr 2026) |

---

## 🧬 TRAJECTORY MAP: How It All Connects

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        AE TRAJECTORY: COGNITIVE SOVEREIGNTY                   │
└─────────────────────────────────────────────────────────────────────────────┘

TIME ────────────────────────────────────────────────────────────────────────►

2025 Q4                    2026 Q1                    2026 Q2                    2026 Q3
├──────────────────────────┼──────────────────────────┼──────────────────────────┤
                           │                          │                          │
       ┌──────────────────┐ │   ┌──────────────────┐  │   ┌──────────────────┐  │
       │  cldcde (DX)     │ │   │  Vibe-Trading    │  │   │  Cognitive OS    │  │
       │  Context tracker │ │   │  v0.1.4→v0.1.10  │  │   │  v3.0 Spec       │  │
       │  MCP registry    │ │   │  10 brokers      │  │   │  10-layer stack  │  │
       │  Shortcuts       │ │   │  456 alphas      │  │   │  4-layer memory  │  │
       └────────┬─────────┘ │   │  29 swarms       │  │   │  Insane Mode     │  │
                │          │   │  Shadow Account  │  │   └────────┬─────────┘  │
                │          │   └────────┬─────────┘  │            │            │
                ▼          │            │            │            ▼            │
       ┌──────────────────┐ │   ┌──────────────────┐  │   ┌──────────────────┐  │
       │  aegntic-        │ │   │  aegntic-        │  │   │  ClawReform      │  │
       │  services        │ │   │  services        │  │   │  (Agent OS       │  │
       │  (Asset foundry) │ │   │  (Cognitive OS   │  │   │   Blueprint)    │  │
       │  Design assets   │ │   │   hosted here)   │  │   │  4 planes        │  │
       │  PDF blueprints  │ │   │                  │  │   │  Genesis birth   │  │
       └────────┬─────────┘ │   └────────┬─────────┘  │   │  Repair Loop     │  │
                │          │            │            │   └────────┬─────────┘  │
                ▼          │            ▼            │            │            │
       ┌──────────────────┐ │   ┌──────────────────┐  │   ┌──────────────────┐  │
       │  aiAURA          │ │   │  roadmap-        │  │   │  auto-sov-ops    │  │
       │  (Skill library) │ │   │  builder-core    │  │   │  (OS for $)      │  │
       │  50+ modules     │ │   │  (Strategy      │  │   │  Companies/      │  │
       │  Skill evolution │ │   │   framework)     │  │   │  Systems/        │  │
       └────────┬─────────┘ │   │  %brainstorm→$B  │  │   │  Skills          │  │
                │          │   │  MCQ decisions   │  │   │  lfg pipeline    │  │
                │          │   │  Obsidian vault  │  │   └────────┬─────────┘  │
                ▼          │   │  3D graph        │  │            │            │
       ┌──────────────────┐ │   └────────┬─────────┘  │            ▼            │
       │  ClawReform      │ │            │            │   ┌──────────────────┐   │
       │  Waitlist        │ │            ▼            │   │  polymarket-auto │   │
       │  (Path A demo)   │ │   ┌──────────────────┐  │   │  memecoin-swarm  │   │
       │  TanStack/Hono   │ │   │  Insidher        │  │   │  sleepmoney/yt   │   │
       └──────────────────┘ │   │  (Adult SaaS)    │  │   │  (Revenue labs)  │   │
                            │   │  Roadmap-driven  │  │   └──────────────────┘   │
                            │   └──────────────────┘  │                          │
                            │                         │                          │
                            └─────────────────────────┘                          │
                                          │                                      │
                              ┌───────────┴───────────┐                          │
                              │   COMPOUND ENGINEERING │                         │
                              │   (ce-* skills, lfg,   │                         │
                              │    caveman, factory)   │                         │
                              └───────────────────────┘                          │
```

---

## 🔄 KEY PATTERNS ACROSS PROJECTS

| Pattern | Vibe-Trading | Cognitive OS | ClawReform | roadmap-builder | auto-sov-ops | cldcde |
|---------|--------------|--------------|------------|-----------------|--------------|--------|
| **Tiered Complexity** | T0–T4 task tiers | T0–T4 model routing | — | Stage unlocks | 24-48h cash gate | — |
| **Persistent Memory** | gbrain sessions | 4-layer (L1–L4) | Knowledge plane | Obsidian vault | docs/solutions/ | Context tracker |
| **Self-Healing** | Tool blindness detection | 5-step heal pipeline | Repair Loop | Decision impact graph | "Delete if no cash" | — |
| **Swarm/Parallel** | 29 presets, DAG | DAG worktree isolation | Dispatcher + workers | — | Factory droids | — |
| **Economic Routing** | Provider doctor, cache | Tier budgets ($0.01–$5) | — | XP/cost tradeoffs | Margin over funding | Token efficiency |
| **Instinct Evolution** | Skills (79) | L4 Procedural → Hooks | Genesis templates | Decision → Skill | caveman skills | Shortcuts |
| **Governance** | Mandate gates, kill switch | Adversarial red-team | Policy Engine, Evaluator | Decision impacts | First principle | — |
| **Birth/Genesis** | Shadow Account → Strategy | — | Genesis pipeline | Roadmap → Company | lfg "build my biz" | — |

---

## 🎯 STRATEGIC THROUGHLINE

**Every project is a layer in the same stack:**

1. **cldcde** → Developer experience (L1 Working Memory tooling)
2. **aiAURA** → Capability library (L4 Procedural Memory components)
3. **Vibe-Trading** → Production agent (full 10-layer stack + swarm)
4. **Cognitive OS** → Cognitive specification (the "why" and "how")
5. **ClawReform** → Multi-agent runtime (the "city" running the spec)
6. **roadmap-builder-core** → Strategy framework (decision → vault → graph)
7. **auto-sov-ops** → Execution OS (roadmap → company → cash)
8. **Revenue labs** (polymarket, memecoin, sleepmoney, yt) → Cash validation

**The endgame:** A self-improving cognitive economy where agents build agents that build businesses that fund more agents. The laboratory *is* the product.

---

## 📊 QUICK REFERENCE TABLE

| Project | Status | Primary Role | Key Innovation |
|---------|--------|--------------|----------------|
| **Vibe-Trading** | Production OSS | Flagship agent | 10 brokers + 456 alphas + Shadow Account |
| **Cognitive OS** | Spec v3 running | Cognitive architecture | 10-layer stack + 4-layer memory + Insane Mode |
| **ClawReform** | Blueprint | Agent OS runtime | 4-plane topology + Genesis birth pipeline |
| **roadmap-builder-core** | Active infra | Strategy framework | %brainstorm→$B + MCQ + Obsidian + 3D graph |
| **auto-sov-ops** | Foundations | Autonomous biz OS | 24-48h cash or delete + compound engineering |
| **aegntic-services** | Asset hub | Design/spec foundry | Cognitive OS spec + ClawReform blueprints |
| **aiAURA** | Capability catalog | Skill registry | 50+ modules + instinct evolution pipeline |
| **clawreform-waitlist** | Marketing | Path A demo | Modern fullstack (Bun/Hono/TanStack/Drizzle) |
| **cldcde** | Community | DX platform | Context tracker + MCP registry + shortcuts |

---

*Generated by Hermes Agent · Ponytail Mode: lite · Focus: Outcomes over process*