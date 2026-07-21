# aedex — Frontend Design Brief (for design agents)

> **Read the repo and the live site before designing. They are the source of truth.** This brief is seeded with content pulled directly from the codebase — taglines from the README, terminology from CLI help text, data shapes from the DB schema, copy from the Constitution. Nothing here is invented. If the repo doesn't contain a number, **do not put it in the design** (see §11 Constitution rule §1: honest value over optics).

---

## Your task

You are a senior product designer with strong opinions about typography, color, and visual systems for **developer infrastructure**. I want YOUR independent direction — not a refinement of mine, not safe consensus. Be opinionated, specific, honest. Exact fonts (no defaults), exact hex values, reasoning for every choice. If my current direction is wrong, say so and propose the alternative.

Deliver:
1. **One-sentence visual thesis** (mood + material + energy).
2. **Memorable-thing** — the single impression a developer has 3 seconds after first paint.
3. **Typography stack** — display, body, data/numbers, code — specific names + why.
4. **Color system** — CSS variables (bg, surface, text, muted, border, accent, semantic status) + hex + rationale.
5. **Layout + spacing** approach, base unit.
6. **Motion** approach.
7. **Two deliberate risks** vs category norm — what each costs and buys.
8. **One thing to kill** in the current design.

Use only the real content in §6. Do not fabricate stats. The live leaderboard is currently empty (see §9) — design for that honest empty state, do not invent a "98% success" number.

---

## 1. Read these files first (source of truth)

```
README.md                                  # taglines, status, what runs today, the moat
CONSTITUTION.md                            # voice, non-negotiables, anti-principles
packages/cli/src/index.ts                  # CLI command surface + meta description
packages/cli/src/commands/*.ts             # CLI output format, terminology, error text
services/gateway/src/db/schema.ts          # the 6 tables = the product's native shapes
services/gateway/src/reliability.ts        # the leaderboard SQL (percentile_cont, FILTER)
services/gateway/src/db/seed-catalog.ts    # how the catalog is built (id = provider/path)
services/gateway/src/app.ts                # route map + public leaderboard disclaimer
apps/web/src/app/globals.css               # existing design tokens (Tailwind 4 @theme)
apps/web/src/app/{page,leaderboard,app}.tsx  # the three real surfaces
```

**Live site to look at:** `https://aedex.ing` (landing, currently a *stale dark theme* — see §9), `https://aedex.ing/leaderboard` (public, SSR), `https://gateway.aedex.ing/leaderboard` (raw JSON).

---

## 2. Product purpose (from CONSTITUTION.md + README, verbatim where quoted)

**aedex** — the Aegntic Decentralized Exchange. A marketplace + gateway where AI agents (and humans) **discover, inspect, run, and get billed for data tools** through one API.

> "Agents that need real-world data (prices, posts, people, news, documents) face a tax: every source is its own integration. … aegntic collapses the tax. One key, one prepaid balance, one interface: **discover** the right endpoint, **inspect** its schema, **run** it, get billed for what came back." — Constitution, "Why we exist"

> "We are not a scraper company. We are the layer that makes every data tool callable the same way, by a human or by an agent, with honest metering." — Constitution

**Business model:** prepaid balance (Stripe top-up) → signed-ledger credit → metered **per result** (failed runs are free). Real money moves. **This is a trust product.**

**Audience:** developers building AI agents who need reliable external data without wiring N provider SDKs. Skeptical, allergic to marketing-speak, equate "looks like a toy" with "won't trust it with money."

---

## 3. Native shapes = the organizing principle (read schema.ts, not a section template)

The DB schema (`services/gateway/src/db/schema.ts`) reveals the product's three native shapes. **Let these organize the page — do not impose a generic SaaS section grid.**

| Shape | Table | What it is | Design implication |
|---|---|---|---|
| **Catalog** | `tools` | searchable rows: `id = provider/path`, description, inputSchema, costModel, verified, tags[], kind | a ranked, filterable **list/index** — the marketplace surface |
| **Ledger** | `balance_ledger` | append-only hash-chain of signed entries: `type ∈ {topup, charge, refund}`, `amount numeric(14,4)`, Ed25519 signature | a **register/statement** — rows of signed transactions, balance *derived* not stored |
| **Measurement** | `run_events` → `reliability` | per-call telemetry → aggregated success/p50/p95 | an **instrument panel** — numbers that must read as *measured*, not marketed |

Secondary: `runs` (the execution records), `api_keys`, `workspaces`.

The page is not "hero + 3 feature cards." It is **catalog → ledger → measurement**, in that order of weight.

---

## 4. What the README leads with = the dominant feature

README opens with:
> **"One CLI. One balance. Every data tool."**
> `aedex discover -q "scrape linkedin"` → ranked endpoints → `aedex run <tool>` → live results → signed ledger charge.

And "The Wedge":
> "the catalog **is** the product. Agents that `discover first` never hand-roll — that habit is the business."

**So `discover` / the catalog dominates the page.** Establish its weight before placing anything else. The leaderboard (the moat) and the ledger (billing) follow. What matters (discover) before what measures (reliability).

---

## 5. The central design problem

A billing-grade trust product that currently looks either **forgettable** (prod) or **playful** (reskin). Both fail for a money product. The leaderboard publishes numbers that must be *believed*; the console shows a balance derived from a signed ledger; checkout moves real dollars. The design's job is to make "trustworthy, precise, accountable" the **felt experience**, not the claim. The memorable-thing must be **credibility + precision**.

---

## 6. Real content bank — use only this, nothing invented

### Taglines & voice (from README + Constitution)
- Wordmark: **`aedex`** (spoken "a-gent dex")
- Tagline: **"One CLI. One balance. Every data tool."**
- Closer: **"Discover first. Run second. Bill last."**
- Wedge: **"The catalog is the product."**
- Voice rule (Constitution anti-principle): *"We will not ship copy that sounds like an LLM wrote it. If a sentence could appear unchanged in any other company's launch tweet, we rewrite it."*

### CLI surface (from `packages/cli/src/index.ts` + commands)
- Meta description: "Aegntic Decentralized Exchange CLI — Discover and run data endpoints"
- Commands: `setup`, `keys add --label <l>`, `discover -q "<q>"`, `inspect <provider/path>`, `run <provider/path> --query '<json>'`, `runs get <id>`, `balance`
- Flags: `-q` query, `-l` limit (default 10), `-s` min-score (default 0.1), `-j` json
- **Real CLI output format** (from `discover.ts`) — design code blocks to match:
  ```
  ⚡ [openmeteo] weather/current (Score: 0.87)
     Description: Current weather for a lat/lon
     Price Model: per_result (2 cents per result)
     ✓ Verified
  ```
- API key format: `aedex_live_<nanoid>` (prefix stored, SHA-256 hashed at rest)

### Providers + catalog (from README, the real seeded set)
- **Providers live:** `openmeteo`, `hackernews`, `coingecko`, `frankfurter`, `apify` — **18 tools, 6 providers** (README's number — cite it, don't make up a new one)
- Tool id is the slug `${provider}/${path}` e.g. `openmeteo/weather/current`, `coingecko/price`, `hackernews/top`, `frankfurter/rates`
- `verified: boolean` — some tools carry `✓ Verified`
- `kind`: `native` (in-process adapter) | `external` | `mcp` (reserved for cldcde skills)

### Billing / ledger (from schema.ts — exact)
- Ledger is **append-only**. Entry `type ∈ { topup (+), charge (-), refund (+) }`. (`hold`/`release` reserved for future reserve-and-settle.)
- `amount numeric(14,4)` — **4 decimal places**. Balance shown as e.g. `$9.9840`.
- Cost model: **per result**. `cost = items × unit × 1.25`, **cents per result**. Failed runs free.
- Telemetry cost unit: `costMicros` = integer micro-USD = `round(cost × 1e4)`.
- Balance is **derived** (sum of signed amounts), never a mutable column.
- Audit: `GET /v1/balance/audit` → Ed25519 hash-chain verification.
- Signature algos (future-proof, from schema): `ed25519` now; `ml-dsa-65`, `slh-dsa-128s` (post-quantum) reserved.
- Run statuses: `COMPLETED | RUNNING | READY | FAILED | STOPPED`.

### Reliability / leaderboard (from `reliability.ts` + live `/leaderboard`)
- Real SQL: `percentile_cont(0.50)/(0.95) WITHIN GROUP (ORDER BY latency_ms)` for p50/p95; `COUNT(*) FILTER (WHERE success) / COUNT(*)` for success rate.
- Per-row fields: `provider, endpoint, description, verified, totalCalls, successCount, successRate, p50Latency, p95Latency, avgItemCount, avgCostMicros, lastCallAt`.
- **Public min-calls threshold = 3** (tools with fewer calls are omitted — low-sample rates aren't meaningful). Authed `/v1/reliability` has no threshold.
- **Real disclaimer text** (from `app.ts`, use verbatim): *"Reliability stats are aggregated from live provider calls. Tools with fewer than 3 calls are omitted as low-sample rates are not statistically meaningful. Rates are not a guarantee."*

---

## 7. Surface inventory (what exists — Next.js 15 App Router, React 19, Tailwind 4)

| Route | Type | Job |
|---|---|---|
| `/` | marketing landing | first impression; **lead with discover/catalog**; show the discover→run→bill loop |
| `/leaderboard` | SSR, public | credibility centerpiece; reliability table; **design the honest empty state** (currently 0 published tools) |
| `/app` | client, auth-gated | paste `aedex_live_…` key → balance (4dp), recent runs table, auto-poll while runs active |
| `/dashboard` + `/dashboard/{balance,discover,keys,runs}` | dashboard shell, sidebar + 4 pages | deeper operator surface |

**Real data shapes to design for (from schema.ts, real field names):**
```ts
// balance (derived) — 4dp money
{ balance: 9.9840, held: 0, available: 9.9840, currency: "USD" }

// run row
{ id, provider, endpoint, status: "COMPLETED"|"RUNNING"|"READY"|"FAILED"|"STOPPED",
  cost: { value, currency, items }, createdAt }

// leaderboard row
{ provider, endpoint, description, verified, totalCalls, successRate,
  p50Latency, p95Latency, avgItemCount, lastCallAt }

// catalog/discover row
{ provider, path, description, inputSchema, costModel: { type: "per_result", unitPrice /* cents */ },
  verified, relevanceScore, tags: [] }
```
Code snippets appear on every surface — the CLI is the hero, so **monospace is first-class, not an afterthought**.

---

## 8. Existing design system (committed reskin tokens, `apps/web/src/app/globals.css`)

```css
/* light editorial system */
--color-bg:            #E8EBEC   /* paper */
--color-bg-elevated:   #FFFFFF
--color-bg-card-hover: #F5F5F4
--color-border:        #000000   /* ink — 3px Swiss divider motif */
--color-border-subtle: #D4D5D6   /* hairline */
--color-text-primary:  #000000
--color-text-secondary:#5C5C5C
--color-text-muted:    #8A8A8A
--color-accent:        #E67E22   /* blumenkopf orange */
--color-accent-dim:    #C0651D
--color-olive:         #7D8A74
--color-clay:          #C75D4B
/* "toy" palette — currently used for status chips + provider badges */
--color-toy-red:      #E63946
--color-toy-yellow:   #F4D35E
--color-toy-green:    #06A77D
--color-toy-blue:     #4361EE
--color-toy-lavender: #9D4EDD
/* status */
--color-green:#06A77D  --color-amber:#F4D35E  --color-red:#E63946
/* type */
--font-sans: "Inter Tight", system-ui, sans-serif
--font-serif:"Newsreader", Georgia, serif
--font-mono: "JetBrains Mono", ui-monospace, monospace
```
Declared brand rules already in code: **GRADIENT-FREE by construction** (no gradient utilities exist); 3px solid-black Swiss dividers as structure; depth via solid rgba overlays + soft shadows (never `linear-gradient`).

---

## 9. Current state (important — two half-shipped designs, both flawed)

- **Live in production** (`aedex.ing`): an **older dark theme** — charcoal `#0D0D12`, a **purple gradient CTA button**. Generic AI-dev-SaaS. Forgettable. Purple gradient = textbook AI-slop marker.
- **Stranded in preview** (committed, never promoted): the **reskin** with right bones — "blumenkopf editorial × pixar-toy" — paper/ink, Swiss lines, serif type. But the "toy" saturated palette tips playful at moments that undercut billing credibility.
- **No Vercel↔GitHub integration** — every deploy is a manual `vercel --prod`. (Explains why prod is stale.)
- **The live leaderboard currently publishes 0 tools** (none have ≥3 calls yet). Design the honest empty state. **Do not invent a success-rate stat** — that breaks Constitution §1.

Mockups of three directions exist at `docs/design/mockups/{editorial-ledger,pixar-toy,refined-dark}.html` (note: an earlier draft of those mockups fabricated a "98.7%" stat — disregard that number, it's not real).

---

## 10. Three candidate directions (my lean — push back freely)

**A) Editorial-Ledger (my lean)** — refine the reskin. Keep paper `#E8EBEC` + ink + 3px Swiss lines + Newsreader serif + Inter Tight + JetBrains Mono + orange `#E67E22`. Three changes: demote toy palette to *strict semantic status* (red/yellow/green = fail/warn/pass, kill decorative blue + lavender); provider marks go monochrome ink (a ledger doesn't use crayon); promote serif onto key numbers (balance, success rate) for gravitas. **Thesis: the medium (editorial paper) is the message (trustworthy accounting).**

**B) Commit full Pixar-Toy** — own "friendly power-tool" (Notion-meets-Linear, warmer). Saturated toy palette across chrome, rounded everything, chunky 3D shadows, bouncy motion. Distinctive; fights billing credibility on the exact surface where it's most expensive.

**C) Refined-Dark-Infra** — Stripe/Vercel/Linear-literate dark, opinionated: kill purple gradients, single cold accent (viridian `#10B981`), geometric grotesque, mono for all data, precision grid, sharp 6px corners. Safe + credible; least distinctive.

---

## 11. Hard constraints (non-negotiable)

**From the Constitution (these override aesthetics):**
- **§1 Honest value over optics** — "We do not ship a mock as a product. We do not call something 'live' that is not. … If we can't do a thing for real yet, we say so." → no fabricated stats; design real empty states.
- **§2 Billing is sacred** — "settled to the fraction of a cent … A sub-cent charge that the UI hides is a bug, full stop." → always show 4dp money; never round in our favor invisibly.
- **§4 Discover honestly** — ranking is never pay-to-win; the integrity of `discover` output is a trust contract.
- **Anti-principle** — "We will not ship copy that sounds like an LLM wrote it." → human, specific voice; no "Built for X" / "Designed for Y" patterns.

**Design-specific:**
- **AI-slop blacklist — never use:** purple/violet gradients as accent, 3-column feature grid with icons-in-circles, centered-everything uniform spacing, uniform bubbly radius, gradient buttons as primary CTA, generic stock-photo hero, system-ui / Inter as the headline face, "Built for X" copy.
- **Gradient-free** is a brand rule. Depth = solid overlays, borders, shadows. Never `linear-gradient` / `radial-gradient`.
- **Blacklisted fonts:** Papyrus, Comic Sans, Lobster, Impact, etc. **Overused (not as primary):** Inter, Roboto, Arial, Helvetica, Open Sans, Lato, Montserrat, Poppins, Space Grotesk.
- **Accessibility non-optional:** WCAG AA contrast everywhere, keyboard nav, visible focus, `prefers-reduced-motion`.
- **4dp money legible** (`0.0004 USD`) — don't truncate to 2dp.
- **Stack:** Tailwind 4 `@theme`, Next.js 15 App Router, React 19. No UI library currently — bespoke components.
- Peers = **Stripe, Vercel, Linear, Resend**. Must feel as credible; must NOT look like them (don't dissolve into the dark-dashboard sea).

---

## 12. Specific questions I want your take on

1. **Which direction (A/B/C, or your own D) ships, and why?** Propose D if all three are wrong.
2. **Organizing principle**: does "catalog → ledger → measurement" (§3) actually structure the landing, or is there a better native spine?
3. **Does light-editorial-paper work for dev-infra**, or do devs unconsciously distrust non-dark tooling? How do we make light read as *serious*, not *documentary*?
4. **Serif-on-numbers** (Newsreader on balance / success-rate): gravitas or gimmick? Where does it earn its keep and where does it stop?
5. **Status color system**: toy palette currently doubles as decoration (provider badges) AND semantics (pass/warn/fail). Should color be *rare + meaningful* (semantic only) or *structural* (categorization too)? Propose the rule.
6. **The leaderboard's credibility**: what makes a reliability table *believed* vs *dismissed as marketing*? Type treatment, the verbatim disclaimer, sample-size signaling, provenance, the empty state?
7. **The honest empty leaderboard** (0 published tools today): how do we make "no data yet — run a tool to populate it" feel like integrity rather than an unfinished product?
8. **The 3px Swiss black divider motif**: distinctive spine or heavy-handed? Keep, lighten, or kill?
9. **One thing to kill** in the current design that's holding the product back.

---

## 13. What "great" looks like

A skeptical developer lands on `/`, sees the catalog lead (because the README leads with it), and within 3 seconds thinks *"this looks like the kind of tool I'd trust to sit between my agent and my money."* The `/leaderboard` reads as a measurement instrument with an honest empty state, not a marketing page. Distinctive enough not to be mistaken for Stripe or Vercel; credible enough to belong in their company. And every number on screen is real — because the Constitution says so.
