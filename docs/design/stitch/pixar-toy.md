---
version: alpha
name: aedex — Pixar Toy
description: Friendly power-tool aesthetic for aedex. Warm cream paper, chunky plastic depth, saturated toy palette as the categorization + status language. Notion-meets-Linear but warmer. Rounded everything, bouncy, approachable — infrastructure that feels human.
colors:
  primary: "#1A1A1A"
  cream: "#F4F1EA"
  surface: "#FFFFFF"
  surface-hover: "#ECE7DC"
  ink: "#1A1A1A"
  ink-soft: "#5A5550"
  on-ink: "#F4F1EA"
  toy-red: "#E63946"
  toy-yellow: "#F4D35E"
  toy-green: "#06A77D"
  toy-blue: "#1E4FD0"
  toy-lavender: "#7B2CBF"
  on-yellow: "#1A1A1A"
  good: "#06794E"
  warn: "#8A6300"
  bad: "#B5302A"
typography:
  display:
    fontFamily: Inter Tight
    fontSize: 4.5rem
    fontWeight: "800"
    lineHeight: "1.0"
    letterSpacing: "-0.035em"
  h2:
    fontFamily: Inter Tight
    fontSize: 1.75rem
    fontWeight: "700"
    lineHeight: "1.15"
    letterSpacing: "-0.02em"
  stat-number:
    fontFamily: Inter Tight
    fontSize: 4rem
    fontWeight: "800"
    lineHeight: "1"
    letterSpacing: "-0.04em"
  body:
    fontFamily: Inter Tight
    fontSize: 1.125rem
    fontWeight: "500"
    lineHeight: "1.55"
  label:
    fontFamily: Inter Tight
    fontSize: 0.8125rem
    fontWeight: "700"
  code:
    fontFamily: JetBrains Mono
    fontSize: 0.875rem
    fontWeight: "500"
    lineHeight: "1.75"
rounded:
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  pill: 9999px
spacing:
  xs: 4
  sm: 8
  md: 16
  lg: 24
  xl: 32
  2xl: 48
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "12px 22px"
  button-primary-hover:
    backgroundColor: "{colors.toy-blue}"
    textColor: "{colors.on-ink}"
  button-accent:
    backgroundColor: "{colors.toy-yellow}"
    textColor: "{colors.on-yellow}"
    rounded: "{rounded.md}"
    padding: "12px 22px"
  plastic-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "22px 24px"
  chip-status:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "8px 14px"
  chip-good:
    backgroundColor: "{colors.good}"
    textColor: "{colors.surface}"
    rounded: "{rounded.pill}"
  chip-warn:
    backgroundColor: "{colors.warn}"
    textColor: "{colors.surface}"
    rounded: "{rounded.pill}"
  chip-bad:
    backgroundColor: "{colors.bad}"
    textColor: "{colors.surface}"
    rounded: "{rounded.pill}"
  provider-chip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
---

## Overview

Friendly power-tool. A capable, approachable dashboard that lowers the
cognitive cost of a complex marketplace. Chunky plastic surfaces with crisp
offset shadows give every element a toy-like physicality — tactile, confident,
unafraid to be warm. aedex is serious infrastructure, but it doesn't have to
feel cold to be trusted.

## Colors

Warm cream foundation with a saturated "toy" palette used as the categorization
and status language. Color is structural here — it sorts providers and signals
state, not just pass/fail.

- **Cream (#F4F1EA):** warm paper foundation, friendlier than grey-white.
- **Ink (#1A1A1A):** text and the primary button — near-black, softened from pure.
- **Toy palette:** red #E63946, yellow #F4D35E, green #06A77D, blue #1E4FD0, lavender #7B2CBF — used as provider identity chips and status dots. (Blue/lavender shifted darker than the raw palette to hold WCAG AA as text.)
- **Status (good/warn/bad):** semantic, slightly darkened for AA contrast.

## Typography

Inter Tight does almost everything — it has the rounded, confident weight the
direction needs, from 800-weight display down to 500-weight body. JetBrains Mono
carries code and the CLI output, because the CLI is the hero.

- **Inter Tight (display, h2, stat, body, label):** single-family simplicity, heavy weights for punch.
- **JetBrains Mono (code):** every CLI snippet, every hash, every cost figure.

## Layout

Rounded, chunky, grid-based with generous gaps. 8px base, 1080px max content.
Cards lift off the cream with hard offset shadows (4–6px ink offset) for
plastic 3D depth. Density is comfortable; whitespace is generous. Money still
shown to 4dp — playfulness never compromises billing legibility.

## Elevation & Depth

Depth is loud and physical. Hard offset shadows (solid ink, no blur) give cards
and buttons a toy-like lift off the page — like pressed plastic. This is the
direction's signature; depth is a feature, not subtlety. No gradients (brand
rule); the 3D feel comes entirely from offset shadows and solid fills.

## Shapes

Rounded everything. Radius is generous and hierarchical (8–24px), with full
pills for buttons and status badges. Shapes feel soft, tactile, and intentional.
Cards never have sharp corners — the roundness is the warmth.

## Components

- **Plastic card:** white surface, 16px radius, hard offset shadow — the default container.
- **Pill button:** ink primary (cream text), blue on hover; yellow accent variant.
- **Provider chip:** white card with a colored monogram tile + name — identity via the toy palette.
- **Status badges:** pill, semantic color, bold label.
- **Code block:** white plastic card with a tilted "try it" tab, mono inside.

## Do's and Don'ts

**Do**
- Lead with discover / the catalog — it dominates the page (per the README).
- Use the toy palette for provider identity and status — color is structural here.
- Keep money to 4dp; playfulness never hides a charge.
- Use real CLI output in code blocks; show real provider names.
- Give every interactive element the hard offset shadow — it's the signature.

**Don't**
- Don't fabricate stats — the live leaderboard is empty; show the real state.
- Don't use gradients — depth comes from offset shadows and solid fills only.
- Don't let the warmth undercut the billing surfaces — checkout and ledger stay legible and precise.
- Don't write LLM-slop copy ("Built for X"). Voice is human and specific.
- Don't truncate money to 2dp.
