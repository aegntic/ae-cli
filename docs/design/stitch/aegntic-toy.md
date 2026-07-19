---
version: alpha
name: aedex — Aegntic Toy
description: Pixar-toy's chunky tactile structure fused with the aegntic.ai brand. Bold black ink outlines, hard offset plastic shadows, big 3rem radius, bouncy spring motion, heavy Space Grotesk display — but the palette is pure aegntic: icy paper, brand teal #00b39f, obsidian #0c1016. The toy energy comes from CHUNK and WEIGHT, not a rainbow. Mechanical bot/gear monograms carry the aegntic reach-arm aesthetic. Gradient-free.
colors:
  primary: "#0c1016"
  bg: "#f0f6f8"
  surface: "#FFFFFF"
  surface-hover: "#E7EEF0"
  surface-dark: "#0c1016"
  surface-dark-2: "#23272d"
  ink: "#0c1016"
  ink-muted: "#5a6166"
  on-ink: "#f0f6f8"
  border-ink: "#0c1016"
  hairline: "#d6dde0"
  accent: "#00b39f"
  accent-dark: "#008f7f"
  on-accent: "#0c1016"
  warn: "#e0a83b"
  bad: "#e0596b"
  good: "#00b39f"
  on-warn: "#3a2a05"
  on-bad: "#2a0a10"
typography:
  display:
    fontFamily: Space Grotesk
    fontSize: 4.5rem
    fontWeight: "700"
    lineHeight: "1.0"
    letterSpacing: "-0.035em"
  h2:
    fontFamily: Space Grotesk
    fontSize: 1.75rem
    fontWeight: "700"
    lineHeight: "1.1"
    letterSpacing: "-0.02em"
  stat-number:
    fontFamily: Space Grotesk
    fontSize: 4rem
    fontWeight: "700"
    lineHeight: "1"
    letterSpacing: "-0.03em"
  body:
    fontFamily: Inter
    fontSize: 1.0625rem
    fontWeight: "500"
    lineHeight: "1.55"
  label:
    fontFamily: Space Grotesk
    fontSize: 0.8125rem
    fontWeight: "700"
  code:
    fontFamily: JetBrains Mono
    fontSize: 0.875rem
    fontWeight: "500"
    lineHeight: "1.75"
  table-cell:
    fontFamily: JetBrains Mono
    fontSize: 0.8125rem
    fontWeight: "500"
rounded:
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
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
    rounded: "{rounded.xl}"
    padding: "14px 28px"
  button-primary-hover:
    backgroundColor: "{colors.accent-dark}"
    textColor: "{colors.on-ink}"
  button-accent:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.xl}"
    padding: "14px 28px"
  button-ghost:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: "12px 24px"
  plastic-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: "22px 24px"
  dark-panel:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.on-ink}"
    rounded: "{rounded.xl}"
    padding: "22px 24px"
  chip-good:
    backgroundColor: "{colors.good}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.pill}"
  chip-warn:
    backgroundColor: "{colors.warn}"
    textColor: "{colors.on-warn}"
    rounded: "{rounded.pill}"
  chip-bad:
    backgroundColor: "{colors.bad}"
    textColor: "{colors.on-bad}"
    rounded: "{rounded.pill}"
  provider-chip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
---

## Overview

Chunky, tactile, and confidently brand-aligned. aedex borrows pixar-toy's
physical, plastic confidence — bold ink outlines, hard offset shadows, big
rounded corners, bouncy springs — but wears the aegntic.ai palette: icy cool
paper, brand teal, obsidian dark. The "toy" feeling comes from CHUNK and
WEIGHT (thick outlines, plastic depth, heavy display type), never from a
rainbow palette. Mechanical bot/gear monograms echo the aegntic reach-arm,
claw-hand, micro-agent visual world. Friendly power-tool, in the house livery.

## Colors

The aegntic.ai brand palette, held strictly. Cool, high-contrast, with teal as
the sole chromatic accent. Saturation lives in the chunky outlines and solid
fills, not in a multi-hue toy palette.

- **Bg (#f0f6f8):** icy cool paper — the aegntic foundation, softer and cooler than grey-white.
- **Ink / surface-dark (#0c1016):** obsidian near-black — text, outlines, and dark contrast panels (code, hero accents). Brand `--surface-1`.
- **Surface (#FFFFFF):** white plastic cards that lift off the icy paper.
- **Accent (#00b39f):** brand teal — the single chromatic driver, used for the accent button, status-healthy, and live signal. Dark obsidian text on teal (passes AA, reads chunky).
- **Status (good teal / warn amber / bad red):** semantic, always with dark ink text for AA contrast and toy-stamp legibility.

## Typography

The aegntic house faces, pushed to toy weight.

- **Space Grotesk (display, h2, stat-number, labels):** the brand display face, set heavy (700) and tight — gives the chunky, engineered-but-friendly voice.
- **Inter (body):** the brand body face, comfortable and neutral.
- **JetBrains Mono (code, table-cell):** every CLI string, hash, cost, and data cell. The CLI is the hero, so mono is first-class.

## Layout

Chunky, rounded, grid-based with generous gaps. 8px base, 1140px max content.
Every card and button carries a 2px ink outline + a hard offset shadow (solid
obsidian, no blur) for plastic 3D depth — the toy signature. The catalog leads
(per README). Marble is NOT used here (this is the cool brand palette); depth
is plastic-card on icy paper. Money to 4dp.

## Elevation & Depth

Loud and physical, like pixar-toy. Hard offset shadows (solid obsidian, 4–6px
offset, no blur) give cards and buttons a pressed-plastic lift off the icy
paper. Dark panels invert: obsidian slabs with icy text. No gradients (brand
rule); depth = outlines + offset shadows + solid fills only.

## Shapes

Big and rounded — aedex inherits aegntic's 3rem-radius DNA and pushes it
toy-bigger. Corner radius 12–32px, full pills for buttons and status badges.
Nothing sharp; the roundness is the friendliness. Outlines are thick (2px ink)
so the roundness reads as deliberate toy hardware, not soft.

## Motion

Bouncy spring, inherited from aegntic's `cubic-bezier(.22,.68,0,1.5)` overshoot.
Cards depress on press, chips pop in, the accent button squashes slightly on
hover. Motion is confident and tactile, never delicate. `prefers-reduced-motion`
freezes to static.

## Components

- **Plastic card:** white surface, 2px ink outline, hard offset shadow, big radius — the default container.
- **Dark panel:** obsidian slab with icy text — for code blocks and hero contrast (the CLI lives here).
- **Buttons:** obsidian primary (icy text, teal on hover), teal accent (obsidian text), white ghost. All chunky, pill, outlined, offset-shadowed.
- **Provider chip:** white card with a teal bot/gear monogram tile + provider name — mechanical identity, toy-rendered.
- **Status badges:** pill, semantic fill, dark ink label.
- **Code block:** obsidian dark panel, mono, teal command tokens.

## Do's and Don'ts

**Do**
- Lead with discover / the catalog — it dominates the page.
- Use chunky ink outlines + hard offset shadows on every card and button — that IS the toy look.
- Keep the palette strictly aegntic: icy paper, teal, obsidian, white. No rainbow.
- Put dark obsidian text on teal/amber/red chips (AA contrast + toy-stamp legibility).
- Keep money to 4dp; show the real empty-leaderboard state.

**Don't**
- Don't introduce warm toy colors (red/yellow/lavender as decoration) — the toy energy is chunk + weight, not hue.
- Don't use gradients — depth is outlines + offset shadows only.
- Don't thin the outlines or soften the shadows — the chunk is the brand here.
- Don't fabricate stats; don't write LLM-slop copy; don't truncate money to 2dp.
