---
version: alpha
name: aedex — Editorial Ledger
description: Light editorial paper system for aedex, a signed-ledger data-tool marketplace. The medium (printed receipt / accounting ledger) is the message (trustworthy accounting). Gradient-free, ink-on-paper, serif gravitas on measured numbers.
colors:
  primary: "#000000"
  paper: "#E8EBEC"
  surface: "#FFFFFF"
  surface-hover: "#F5F5F4"
  ink: "#000000"
  ink-secondary: "#5C5C5C"
  ink-muted: "#8A8A8A"
  hairline: "#D4D5D6"
  accent: "#E67E22"
  accent-dim: "#C0651D"
  on-accent: "#FFFFFF"
  olive: "#7D8A74"
  clay: "#C75D4B"
  good: "#06794E"
  warn: "#8A6300"
  bad: "#B5302A"
typography:
  display:
    fontFamily: Newsreader
    fontSize: 4.25rem
    fontWeight: "500"
    lineHeight: "1.02"
    letterSpacing: "-0.025em"
  h2:
    fontFamily: Newsreader
    fontSize: 2rem
    fontWeight: "500"
    lineHeight: "1.1"
    letterSpacing: "-0.02em"
  stat-number:
    fontFamily: Newsreader
    fontSize: 4rem
    fontWeight: "500"
    lineHeight: "1"
    letterSpacing: "-0.03em"
  body:
    fontFamily: Inter Tight
    fontSize: 1.125rem
    fontWeight: "400"
    lineHeight: "1.55"
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 0.75rem
    fontWeight: "500"
    letterSpacing: "0.18em"
  code:
    fontFamily: JetBrains Mono
    fontSize: 0.875rem
    fontWeight: "400"
    lineHeight: "1.7"
  table-cell:
    fontFamily: JetBrains Mono
    fontSize: 0.8125rem
    fontWeight: "400"
rounded:
  none: 0px
  sm: 2px
  md: 4px
  lg: 6px
spacing:
  xs: 4
  sm: 8
  md: 16
  lg: 24
  xl: 32
  2xl: 48
  3xl: 64
components:
  swiss-rule:
    height: 3px
    backgroundColor: "{colors.ink}"
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "10px 18px"
  button-primary-hover:
    backgroundColor: "#7D3A0E"
    textColor: "{colors.on-accent}"
  button-ghost:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "8px 14px"
  chip-status:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "4px 10px"
  chip-good:
    backgroundColor: "{colors.good}"
    textColor: "{colors.surface}"
  chip-warn:
    backgroundColor: "{colors.warn}"
    textColor: "{colors.surface}"
  chip-bad:
    backgroundColor: "{colors.bad}"
    textColor: "{colors.surface}"
  stat-card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "24px 26px"
  code-block:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "24px 26px"
  ledger-row:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    padding: "12px 16px"
---

## Overview

Architectural editorialism meets accounting gravitas. The UI evokes a typeset
broadsheet crossed with a financial document of record — paper, ink, signed
entries, Swiss-precision rules. aedex moves real money through a signed ledger,
so the surface borrows the visual language of the thing it protects: a receipt
you can audit. Warm but serious; never decorative for its own sake.

## Colors

A restrained, high-contrast palette rooted in paper and ink with a single
confident accent. Color is rare and meaningful — semantic status only.

- **Paper (#E8EBEC):** the foundation — softer than pure white, reads as a document surface.
- **Ink (#000000):** headlines, body, and the 3px Swiss rules that structure the page.
- **Ink-secondary (#5C5C5C) / Ink-muted (#8A8A8A):** metadata, captions, table secondary text.
- **Accent (#E67E22):** the sole interaction driver — used sparingly on one element per view. Never decorative.
- **Hairline (#D4D5D6):** subtle dividers inside dense data.
- **Status (good #06794E / warn #8A6300 / bad #B5302A):** semantic only — pass/warn/fail. Shifted darker than the raw toy palette to hold WCAG AA on paper. No decorative blue or lavender.

## Typography

A three-family stack where each face has a job. The serif carries gravitas; the
sans carries prose; the mono carries data and code.

- **Newsreader (display, h2, stat-number):** the editorial voice. Used on headlines and on **measured numbers** (balance, success rate) so figures read as *typeset record*, not marketing. Italic for emphasis.
- **Inter Tight (body):** clean, dense, modern grotesk for body and UI labels.
- **JetBrains Mono (code, label-caps, table-cell):** every CLI snippet, every ledger hash, every table cell. Monospace is first-class because the CLI is the hero.

## Layout

Grid-disciplined, composition-first. Content sits on an 8px base with a 1080px
max content width. The page is structured by **3px solid black Swiss horizontal
rules**, not by card shadows. Density is comfortable on marketing surfaces and
tightens to data-density on the leaderboard and console. Money is always shown
to 4 decimal places (`$0.0002`); never truncated to 2dp.

## Elevation & Depth

Depth is restrained and paper-like. Soft, low-spread drop shadows give cards a
slight lift off the paper — never the floating-glass look. Primary structure
comes from ink borders and Swiss rules, not from elevation. No gradients of any
kind (brand rule); highlights are solid rgba overlays.

## Shapes

Sharp and architectural. Corner radius is minimal (2–6px) and hierarchical.
Status chips and code blocks read as cut paper, not pills. Buttons get just
enough radius (4px) to feel intentional without softening the editorial edge.

## Components

- **Swiss rule (3px ink):** the structural motif — separates nav, hero, sections.
- **Stat card:** paper surface, the number in Newsreader, provenance footnote in mono.
- **Code block:** mono on paper, ink border, real CLI output format (`⚡ [openmeteo] weather/current (Score: 0.87)`).
- **Status chips:** square, semantic color only (good/warn/bad), mono label.
- **Ledger row:** white surface, hairline dividers between rows, mono amounts, signed-hash column.
- **Buttons:** ink primary (paper text), accent on hover; ghost variant for secondary actions.

## Do's and Don'ts

**Do**
- Lead with discover / the catalog — the README leads with it, so it dominates the page.
- Show money to 4dp. A sub-cent charge the UI hides is a bug.
- Put measured numbers (balance, success rate, p50) in Newsreader serif.
- Design the honest empty leaderboard (0 published tools today) as integrity, not unfinished work.
- Use the real CLI output format verbatim in code blocks.

**Don't**
- Don't fabricate stats. The live leaderboard publishes nothing yet — show the real empty state.
- Don't use gradients of any kind. Depth = borders + solid overlays + soft shadows.
- Don't use decorative color (blue/lavender) — only semantic status.
- Don't write copy that sounds like an LLM wrote it (Constitution anti-principle). No "Built for X".
- Don't truncate money to 2dp, and never round in our favor invisibly.
