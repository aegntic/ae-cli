---
version: alpha
name: aedex — Refined Dark Infra
description: Serious developer-infrastructure dark system for aedex. Near-black surfaces, single cold viridian accent, geometric grotesque + mono for all data. Stripe/Vercel/Linear credibility — cold, precise, engineered. Gradient-free, flat, data-weighty.
colors:
  primary: "#10B981"
  bg: "#0A0A0B"
  surface: "#111113"
  surface-2: "#161619"
  border: "#1F1F23"
  border-2: "#2A2A30"
  text: "#FAFAFA"
  text-2: "#A1A1A9"
  text-3: "#6B6B73"
  on-primary: "#03130D"
  accent: "#10B981"
  accent-dim: "#0E9A6E"
  good: "#10B981"
  warn: "#EAB308"
  bad: "#EF4444"
typography:
  display:
    fontFamily: Geist
    fontSize: 3.75rem
    fontWeight: "600"
    lineHeight: "1.05"
    letterSpacing: "-0.03em"
  h2:
    fontFamily: Geist
    fontSize: 1.5rem
    fontWeight: "600"
    lineHeight: "1.15"
    letterSpacing: "-0.02em"
  stat-number:
    fontFamily: Geist Mono
    fontSize: 3.5rem
    fontWeight: "500"
    lineHeight: "1.1"
    letterSpacing: "-0.02em"
  body:
    fontFamily: Geist
    fontSize: 1.0625rem
    fontWeight: "400"
    lineHeight: "1.6"
  label-caps:
    fontFamily: Geist Mono
    fontSize: 0.75rem
    fontWeight: "400"
    letterSpacing: "0.04em"
  code:
    fontFamily: Geist Mono
    fontSize: 0.8125rem
    fontWeight: "400"
    lineHeight: "1.8"
  table-cell:
    fontFamily: Geist Mono
    fontSize: 0.8125rem
    fontWeight: "400"
rounded:
  none: 0px
  sm: 4px
  md: 6px
  lg: 8px
  pill: 9999px
spacing:
  xs: 4
  sm: 8
  md: 16
  lg: 24
  xl: 32
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "12px 22px"
  button-primary-hover:
    backgroundColor: "{colors.accent-dim}"
    textColor: "{colors.on-primary}"
  button-ghost:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.text-2}"
    rounded: "{rounded.md}"
    padding: "11px 20px"
  panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
    padding: "24px 26px"
  stat-panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
    padding: "24px 26px"
  code-panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
  chip-good:
    backgroundColor: "{colors.good}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.pill}"
  chip-warn:
    backgroundColor: "{colors.warn}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.pill}"
  chip-bad:
    backgroundColor: "{colors.bad}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.pill}"
---

## Overview

Cold, precise, engineered. The UI reads as instrumentation — the kind of
surface a developer trusts to sit between their agent and their money.
Near-black surfaces, a single cold viridian accent, monospace numerals
everywhere data lives. No decoration, no warmth for its own sake. Credibility
through restraint and precision.

## Colors

A disciplined dark palette with one cold accent. Color is rare and meaningful.

- **Bg (#0A0A0B) / Surface (#111113):** the dark stack — never pure black, lifted just enough to read as layered surfaces.
- **Text (#FAFAFA) / Text-2 (#A1A1A9) / Text-3 (#6B6B73):** the type hierarchy.
- **Border (#1F1F23 / #2A2A30):** hairlines that structure panels without weight.
- **Accent / Primary (#10B981):** viridian — the single cold interaction driver. Never purple, never gradient.
- **Status:** viridian good, amber warn, red bad — semantic only.

## Typography

Geist (geometric grotesque) for structure, Geist Mono for all data. Numerals
live in mono so every figure aligns, scans, and reads as *measured*.

- **Geist (display, h2, body):** precise, modern, credible.
- **Geist Mono (stat-number, code, table-cell, labels):** every number, hash, cost, and CLI string. Mono is the dominant data face.

## Layout

Precision grid, tight disciplined spacing, 8px base, 1080px max content. Panels
sit on hairline borders, not elevation. Density tightens on the leaderboard and
console to data-density. Money to 4dp. The catalog leads, per the README.

## Elevation & Depth

Depth is minimal and structural. Panels are flat surfaces separated by hairline
borders — almost no shadow. The coldness is the point: nothing floats, nothing
glows (except the single accent pip on live status). No gradients (brand rule).

## Shapes

Sharp and geometric. Radius 4–8px, hierarchical, never soft. Status pills are
the only fully-round element. Everything else reads as engineered precision.

## Components

- **Panel:** surface bg, hairline border, 6px radius — the default container (code, stat, form).
- **Button:** viridian primary (dark text), dim on hover; ghost variant for secondary.
- **Code panel:** terminal-styled, mono, viridian command tokens.
- **Stat panel:** mono key, viridian number, hairline-divided sub-grid.
- **Status pills:** full-round, semantic color, mono label.

## Do's and Don'ts

**Do**
- Lead with discover / the catalog — it dominates the page.
- Put all numbers in mono — figures must align and scan as measured.
- Keep money to 4dp.
- Use the single viridian accent sparingly — one accent, used rarely.
- Show the real empty-leaderboard state; never fabricate a success rate.

**Don't**
- Don't use purple or any gradient — viridian is the only accent, flat only.
- Don't add glow/shadow decoration — panels are flat on hairlines.
- Don't warm it up — the coldness is the credibility signal.
- Don't write LLM-slop copy. Voice is precise and human.
- Don't truncate money to 2dp.
