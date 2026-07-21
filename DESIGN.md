# Design System — aedex (aegntic)

> Source of truth for all visual + UI decisions. Supersedes `docs/design/aedex-frontend-design-brief.md`
> (the prior light "Aegntic Toy" system — deprecated). This file matches the live site on aedex.ing.

## Product Context
- **What this is:** aedex — the Aegntic Decentralized Exchange. One CLI + one balance to discover, inspect, and run any data tool. Agent-native tool router.
- **Who it's for:** AI agents (via CLI/MCP) and the builders/operators who wire them. Technical, fast-moving, allergic to fluff.
- **Space/industry:** developer infrastructure / agent tooling. Peers: Apify, browser automation providers, tool-routing layers.
- **Project type:** marketing site + operator console + public reliability leaderboard (Next.js 15 App Router).

## Aesthetic Direction
- **Direction:** Dark editorial infrastructure — charcoal surfaces, electric-azure signal, type-led. Matches the aegntic.ai brand identity (dark charcoal + teal/coral, robot-arm glow).
- **Decoration level:** intentional — subtle layered shadows for depth, plastic-gloss sheen on chips, no gradients (solid overlays only), no decorative blobs.
- **Mood:** serious infrastructure that still feels electric and alive. Reads as "real systems, not a demo." The blue is signal, not decoration.
- **Memorable thing (draft — confirm):** *electric precision* — the blue that feels like live signal running through dark infrastructure. Every number is real.
- **Reference:** aegntic.ai (dark sections, `#00b39f`/coral, robot skeleton motif), aegntic.ai/audits (robot-arm electric-blue glow).

## Typography
- **Display/Hero:** **Space Grotesk** — geometric, modern, the aegntic.ai signature. Used for headings site-wide.
- **Body:** **Inter** — high-legibility for dense tables/console. Loaded as `--font-body`.
- **UI/Labels:** Space Grotesk (same as display) for nav/labels; monospace for data labels.
- **Data/Tables:** **JetBrains Mono** (`--font-mono`) — tabular, for the leaderboard table, balance figures, run rows.
- **Code:** JetBrains Mono.
- **Loading:** next/font/google (`Space_Grotesk`, `Inter`, `JetBrains_Mono`) in `apps/web/src/app/layout.tsx`.
- **Scale:** fluid — hero uses `clamp(3rem, 14vw, 9rem)`; sections `text-3xl/4xl`; body `text-sm/base`. Mono data `0.8125rem`.
- **Note:** Space Grotesk is on the gstack "overused" list (AI convergence trap). Used here deliberately to match the established aegntic.ai brand — not as a default fallback.

## Color
- **Approach:** restrained — one electric accent (signal), coral as rare secondary, semantic status colors. Color is meaningful, never decorative.
- **Primary accent:** `#2E9BFF` electric azure — buttons, links, active states, logo glow, focus rings, balance figure.
- **Accent dim:** `#1A6FBF` — hover/pressed, scrollbar.
- **Accent glow:** `rgba(46, 155, 255, 0.22)` — button hover shadow, focus halos.
- **Coral (secondary):** `#E28A87` — rare, for sparing emphasis/contrast only.
- **Neutrals (dark charcoal):**
  - `--color-bg` `#0C1016` (page)
  - `--color-bg-elevated` `#11181C` (raised panel)
  - `--color-bg-card` `#141B21` (card)
  - `--color-bg-card-hover` `#1A232A`
  - `--color-border` `#232C34` (ink line on dark)
  - `--color-border-subtle` `#1A222A`
- **Text:** primary `#E7EEF0`, secondary `#A5ABAD`, muted `#6F767C`.
- **Semantic / status (work on dark):** success `#1FBF9F` (toy-green), warning `#F2C94C` (toy-yellow), error `#EF6B6B` (toy-red), info `#4EA8FF`.
- **Dark mode:** this IS the dark mode. No light variant shipping. Selection bg = accent, text = `#04141A`.

## Spacing
- **Base unit:** 4px (Tailwind default).
- **Density:** comfortable — generous section padding (`py-16`/`py-20 md:py-28`), tight within cards.
- **Scale:** 2xs(2) xs(4) sm(8) md(16) lg(24) xl(32) 2xl(48) 3xl(64). Section rhythm uses `swiss-line` (1px `--color-border`) dividers.

## Layout
- **Approach:** grid-disciplined for console/dashboard (sidebar + content), editorial for marketing (max-w containers, swiss-line section breaks).
- **Grid:** max-w-5xl/6xl containers, `px-5 md:px-10`.
- **Border radius:** hierarchical — chips `1.25rem`, buttons/cards `1rem`, inputs `0.75rem`, pills `full`.
- **Depth:** `toy-shadow` / `toy-shadow-sm` layered dark shadows (soft, low-opacity) for floating cards/buttons.

## Motion
- **Approach:** intentional — entrance fades (`fade-in-up` staggered delays), hover lift on buttons (`translateY(-1px)` + glow), reduced-motion respected (durations → 0.01ms).
- **Easing:** enter `cubic-bezier(0.33, 1, 0.68, 1)` / `cubic-bezier(0.16, 1, 0.3, 1)`.
- **Duration:** micro 120ms (button), short 500-600ms (entrance fades).

## Component conventions
- **Logo:** official `ae-logo.webp` wordmark (black source), CSS-inverted to white on dark via `<Logo>` (`apps/web/src/components/Logo.tsx`). Never render the black wordmark directly on dark — always invert.
- **Buttons:** `.toy-button` + `bg-accent text-white` for primary CTA; `border-border` outline for secondary.
- **Cards:** `bg-bg-elevated` + `border-border` + `toy-shadow-sm`. Never `bg-white` (legacy light token — removed).
- **Status badges:** toy-green/yellow/red chips via `.toy-chip`.
- **Tables:** JetBrains Mono, `swiss-line-b` row dividers, right-aligned numerics.

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-07-21 | Initial design system (dark editorial + electric azure) | Match aegntic.ai brand; replace deprecated light "Aegntic Toy" system. Accent `#2E9BFF` chosen over `#1FB6FF` per user: bluer, less green, more electric (robot-arm glow). |
| 2026-07-21 | Logo: black wordmark + CSS invert | aegntic.ai ships only the black `ae-logo.webp`; invert renders white on dark (no light asset exists). |
