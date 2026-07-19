# aedex — Frontend Design Brief (for design agents)

> Copy this entire document into any design agent (Codex, Claude, Gemini, v0, Figma AI, Lovart) to get an independent take. It is self-contained: product, surfaces, current state, design-system inventory, the three candidate directions, hard constraints, and the specific questions to answer.

---

## Your task

You are a senior product designer with strong opinions about typography, color, and visual systems for **developer infrastructure** products. I want YOUR independent design direction for the product below — not a refinement of mine, not a safe consensus. Be opinionated, specific, and honest. Name exact fonts (no defaults), exact hex values, and the reasoning behind every choice. If you think my current direction is wrong, say so and propose the alternative.

Deliver, in order:
1. **One-sentence visual thesis** (mood + material + energy).
2. **Memorable-thing**: the single impression a developer should have 3 seconds after first paint.
3. **Typography stack**: display, body, data/numbers, code — specific font names + why.
4. **Color system**: CSS variables (bg, surface, text, muted, border, accent, semantic status) + hex + rationale.
5. **Layout + spacing** approach and base unit.
6. **Motion** approach.
7. **Two deliberate risks** (where this product gets its own face vs category norm) — what each costs and buys.
8. **One thing you'd kill** in the current design that's holding the product back.

---

## 1. What the product is

**aedex** (wordmark `aedex`, spoken "a-gent dex") — the Aegntic Decentralized Exchange.

A **marketplace + gateway** where AI agents discover, run, and meter **data tools** through a single API. Think "Stripe for data-tool calls" or "a programmable Zapier for agents."

- **Discover**: `aedex discover "btc price"` → ranked tool catalog (full-text search).
- **Run**: `aedex run coingecko/price --query '{"symbol":"BTC"}'` → the gateway proxies the call, times it, records telemetry.
- **Bill**: every call is metered to the cent and written to a **tamper-evident signed ledger** (Ed25519 hash-chain). Balance is *derived* from the ledger, not stored. Failed runs are free.
- **Trust**: a public **reliability leaderboard** (`/leaderboard`) shows live success rate, p50/p95 latency, and call volume per tool — measured from real calls, never self-reported. Tools with <3 calls are omitted.

**Business model**: prepaid balance top-ups via Stripe → signed ledger credit → metered per call. Real money moves. The product is a **trust product**.

## 2. Who it's for

- **Primary**: developers building AI agents / LLM apps who need reliable access to external data tools (weather, finance, news, search, scraping) without wiring N provider SDKs.
- **Secondary**: agent platform builders who want metered, auditable tool calls.
- **Tertiary**: the curious developer who lands on the leaderboard.

They are skeptical, allergic to marketing-speak, and they equate "looks like a toy" with "won't trust it with money."

## 3. The central design problem

**This is a billing-grade trust product that currently looks either forgettable or playful.** Those are both failure modes for a money product.

The leaderboard publishes numbers that have to be *believed*. The console shows a balance derived from a signed ledger. Checkout moves real dollars. The design's job is to make "trustworthy, precise, accountable" the felt experience — not the claim.

The memorable-thing must be **credibility + precision**, not friendliness. (Though warmth-without-slop is welcome.)

## 4. Current state (important — there are two half-shipped designs)

- **Live in production** (`https://aedex.ing`): an **older dark theme** — charcoal `#0D0D12`, purple/blue accents, a **purple gradient CTA button**. Generic AI-dev-SaaS. Forgettable. The purple gradient is a textbook AI-slop marker.
- **Stranded in preview** (committed but never promoted to prod): a **reskin** with the right bones — "blumenkopf editorial × pixar-toy" — paper/ink, Swiss lines, serif type. But the "toy" saturated palette tips playful at moments that undercut billing credibility.
- **No Vercel↔GitHub integration.** Every deploy is a manual `vercel --prod` upload. (Operational note, not a design note, but it explains why prod is stale.)

So: don't assume what's live is the intended design. Judge the system from the token inventory in §6, not from a screenshot of prod.

## 5. Surface inventory (what actually exists)

Next.js 15 App Router + React 19 + Tailwind 4. Routes:

| Route | Type | Job |
|---|---|---|
| `/` | marketing landing | first impression, win trust, show the reliability stat + code snippet |
| `/leaderboard` | SSR, public | the credibility centerpiece — sortable reliability table (success %, p50, p95, calls, last-seen) |
| `/app` | client, auth-gated console | paste API key → see balance (big number), recent runs table (provider/endpoint, status chip, cost, time-ago), auto-refresh |
| `/dashboard` + `/dashboard/{balance,discover,keys,runs}` | full dashboard shell (sidebar + 4 pages) | deeper operator surface |

Data shapes to design for:
- **Balance**: `{ balance, held, available, currency }` — sub-cent charges, so 4-decimal precision matters (`0.0004 USD`).
- **Run**: `{ id, provider, endpoint, status, cost:{value,currency,items}, createdAt }` — status ∈ `COMPLETED | RUNNING | READY | FAILED | STOPPED`.
- **Leaderboard row**: `{ provider, endpoint, description, verified, totalCalls, successRate, p50Latency, p95Latency, avgItemCount, lastCallAt }`.
- **Code snippets** appear on every surface (the CLI is the hero). Monospace must be first-class, not an afterthought.

## 6. Existing design-system inventory (the reskin's tokens)

These are the committed-but-not-deployed tokens (`apps/web/src/app/globals.css`, Tailwind 4 `@theme`). The brand vocabulary already here:

```
/* light editorial system */
--color-bg:           #E8EBEC   /* paper */
--color-bg-elevated:  #FFFFFF   /* card */
--color-bg-card:      #FFFFFF
--color-bg-card-hover:#F5F5F4
--color-border:       #000000   /* ink — 3px Swiss divider motif */
--color-border-subtle:#D4D5D6   /* hairline */
--color-text-primary: #000000   /* ink */
--color-text-secondary:#5C5C5C
--color-text-muted:   #8A8A8A
--color-accent:       #E67E22   /* blumenkopf orange */
--color-accent-dim:   #C0651D
--color-olive:        #7D8A74
--color-clay:         #C75D4B

/* "toy" saturated palette — currently used for status chips + provider badges */
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

Declared principles already in code:
- **GRADIENT-FREE by construction** — no `gradient-*` utilities exist.
- 3px solid black Swiss horizontal dividers as the structural motif.
- Soft drop shadows for chunky-but-restrained depth.
- iOS-gloss plastic highlights via **solid rgba overlays**, never `linear-gradient`.

## 7. The three candidate directions (my current thinking — push back freely)

Three mockup HTML files exist to look at if you can read local files:
`docs/design/mockups/{editorial-ledger,pixar-toy,refined-dark}.html`

**A) Editorial-Ledger (my lean)** — refine the reskin. Keep paper `#E8EBEC` + ink black + 3px Swiss lines + Newsreader serif + Inter Tight + JetBrains Mono + orange `#E67E22` accent. Three changes: demote toy palette to *strict semantic status only* (red/yellow/green = pass/warn/fail, kill decorative blue + lavender); provider icons go monochrome ink monograms (a ledger doesn't use crayon); promote serif onto key numbers (balance, success rate) for gravitas. **Thesis: the medium (editorial paper) is the message (trustworthy accounting).**

**B) Commit full Pixar-Toy** — own "the friendly power-tool" lane (Notion-meets-Linear, warmer). Saturated toy palette across chrome, rounded everything, chunky 3D shadows, bouncy motion. Distinctive and approachable; fights billing credibility on the exact surface where it's most expensive.

**C) Refined-Dark-Infra** — Stripe/Vercel/Linear-literate dark, but opinionated: kill purple gradients, single cold accent (viridian `#10B981`), geometric grotesque, mono for all data, precision grid, sharp 6px corners. Safe + credible; least distinctive.

## 8. Hard constraints (non-negotiable)

- **AI-slop blacklist — never use**: purple/violet gradients as accent, 3-column feature grid with icons-in-circles, centered-everything with uniform spacing, uniform bubbly radius on all elements, gradient buttons as primary CTA, generic stock-photo hero, system-ui/Inter-as-primary-display (Inter is fine for body, not as the headline face), "Built for X" / "Designed for Y" copy.
- **Gradient-free** is a brand rule. Depth comes from solid overlays, borders, and shadows — never `linear-gradient` / `radial-gradient`.
- **No blacklisted fonts as primary**: Papyrus, Comic Sans, Lobster, Impact, etc. **No overused fonts as primary**: Inter, Roboto, Arial, Helvetica, Open Sans, Lato, Montserrat, Poppins, Space Grotesk.
- **Accessibility is not optional**: WCAG AA contrast on every text/surface pair, keyboard nav, visible focus, `prefers-reduced-motion` respected. Numbers in tables must be readable, not decorative.
- **Sub-cent money must be legible**: balance can be `0.0004 USD`. Don't truncate to 2dp; design for 4dp.
- **Stack**: Tailwind 4 (`@theme` tokens), Next.js 15 App Router, React 19. Server components for SSR leaderboard; client components for the auth-gated console. No UI library is currently in use — bespoke components.
- The product must feel as credible as **Stripe, Vercel, Linear, Resend** — those are the peers. It must NOT look like them (dissolve into the dark-dashboard sea).

## 9. The specific questions I want your take on

1. **Which direction (A/B/C, or your own D) should we ship, and why?** Be willing to propose D if all three are wrong.
2. **Does "light editorial paper" work for a developer-infra audience**, or do devs unconsciously distrust non-dark tooling? How do we make light read as *serious* rather than *documentary*?
3. **The serif-on-numbers move** (Newsreader on balance/success-rate): gravitas or gimmick? If gravitas, where exactly does it earn its keep and where does it stop?
4. **Status color system**: the toy palette currently doubles as decoration (provider badges) AND semantics (pass/warn/fail). Should color be *rare and meaningful* (semantic only) or *structural* (used for categorization too)? Propose the rule.
5. **The leaderboard specifically**: what makes a reliability table *believed* vs *dismissed as marketing*? Type treatment, disclaimers, sample-size signaling, provenance?
6. **The 3px Swiss black divider motif**: distinctive spine or heavy-handed? Keep, lighten, or kill?
7. **One thing to kill** in the current design that's holding the product back.

## 10. What "great" looks like

A direction where a skeptical developer lands on `/` and within 3 seconds thinks *"this looks like the kind of tool I'd trust to sit between my agent and my money"* — and where the `/leaderboard` reads as a measurement instrument, not a marketing page. Distinctive enough that it couldn't be mistaken for Stripe or Vercel, credible enough that it belongs in their company.
