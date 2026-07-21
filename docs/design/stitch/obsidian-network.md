---
version: alpha
name: aedex — Obsidian Network
description: Sleek futuristic-minimal industrial system for aedex. Polished obsidian surfaces, heavy veined-marble buttons, and a living network graph of agent-bots and tool-nodes wired together. Pixar-toy's chunky tactile confidence, re-cast in volcanic glass and stone. The product IS a network (agents→tools→ledger→telemetry), so the wire-and-node graph is the page's native spine, not decoration. Gradient-free; depth via solid sheen overlays, hairline circuit borders, and heavy stone shadows.
colors:
  primary: "#0B0E14"
  obsidian: "#0B0E14"
  obsidian-raised: "#11151D"
  obsidian-sheen: "#171C26"
  hairline: "#232A36"
  hairline-circuit: "#2E3645"
  marble: "#EDEAE3"
  marble-vein: "#C9C5BC"
  on-marble: "#14171F"
  on-obsidian: "#E8E6DF"
  on-obsidian-muted: "#9AA0AD"
  bronze: "#C08457"
  bronze-dim: "#9A6A43"
  on-bronze: "#1A1208"
  signal: "#34D3B8"
  signal-dim: "#27A993"
  good: "#34D3B8"
  warn: "#E0A83B"
  bad: "#E0596B"
typography:
  display:
    fontFamily: Satoshi
    fontSize: 4.25rem
    fontWeight: "700"
    lineHeight: "1.02"
    letterSpacing: "-0.03em"
  h2:
    fontFamily: Satoshi
    fontSize: 1.75rem
    fontWeight: "600"
    lineHeight: "1.15"
    letterSpacing: "-0.02em"
  stat-number:
    fontFamily: JetBrains Mono
    fontSize: 3.75rem
    fontWeight: "500"
    lineHeight: "1"
    letterSpacing: "-0.02em"
  body:
    fontFamily: General Sans
    fontSize: 1.0625rem
    fontWeight: "400"
    lineHeight: "1.6"
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 0.6875rem
    fontWeight: "500"
    letterSpacing: "0.22em"
  code:
    fontFamily: JetBrains Mono
    fontSize: 0.8125rem
    fontWeight: "400"
    lineHeight: "1.8"
  table-cell:
    fontFamily: JetBrains Mono
    fontSize: 0.8125rem
    fontWeight: "400"
rounded:
  none: 0px
  sm: 3px
  md: 6px
  lg: 10px
  pill: 9999px
spacing:
  xs: 4
  sm: 8
  md: 16
  lg: 24
  xl: 32
  2xl: 48
  3xl: 64
components:
  marble-button:
    backgroundColor: "{colors.marble}"
    textColor: "{colors.on-marble}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: "14px 26px"
  marble-button-hover:
    backgroundColor: "{colors.marble-vein}"
    textColor: "{colors.on-marble}"
  bronze-button:
    backgroundColor: "{colors.bronze}"
    textColor: "{colors.on-bronze}"
    rounded: "{rounded.lg}"
    padding: "14px 26px"
  button-ghost:
    backgroundColor: "{colors.obsidian-raised}"
    textColor: "{colors.on-obsidian}"
    rounded: "{rounded.md}"
    padding: "12px 22px"
  obsidian-panel:
    backgroundColor: "{colors.obsidian-raised}"
    textColor: "{colors.on-obsidian}"
    rounded: "{rounded.lg}"
    padding: "26px 28px"
  code-panel:
    backgroundColor: "{colors.obsidian-raised}"
    textColor: "{colors.on-obsidian}"
    rounded: "{rounded.lg}"
  stat-panel:
    backgroundColor: "{colors.obsidian-raised}"
    textColor: "{colors.on-obsidian}"
    rounded: "{rounded.lg}"
    padding: "26px 28px"
  network-wire:
    backgroundColor: "{colors.hairline-circuit}"
    height: "1px"
  network-wire-active:
    backgroundColor: "{colors.signal}"
  network-node:
    backgroundColor: "{colors.obsidian-sheen}"
    textColor: "{colors.on-obsidian}"
    rounded: "{rounded.pill}"
  network-node-bot:
    backgroundColor: "{colors.bronze}"
    textColor: "{colors.on-bronze}"
  chip-good:
    backgroundColor: "{colors.signal-dim}"
    textColor: "{colors.on-marble}"
    rounded: "{rounded.pill}"
  chip-warn:
    backgroundColor: "{colors.warn}"
    textColor: "{colors.on-bronze}"
    rounded: "{rounded.pill}"
  chip-bad:
    backgroundColor: "{colors.bad}"
    textColor: "{colors.on-marble}"
    rounded: "{rounded.pill}"
---

## Overview

Sleek, futuristic, industrial. Polished obsidian surfaces meet heavy veined
marble controls, joined by a living network of agent-bots and tool-nodes wired
together. The UI feels like a piece of precision hardware — volcanic glass,
cut stone, circuits. aedex connects agents to tools and routes every call
through a signed ledger, so the surface renders that topology literally: bots
and tools as nodes, runs and charges as wires between them. Confident and
chunky like a power-tool, but dark, luxe, and engineered.

## Colors

A deep industrial palette: obsidian as the foundation, marble as the tactile
control surface, bronze as the luxe interaction metal, and a cool signal teal
that marks anything "alive" on the network.

- **Obsidian (#0B0E14 / raised #11151D):** polished volcanic glass — never pure black, carries a faint blue undertone and a solid sheen overlay (not a gradient).
- **Marble (#EDEAE3 / vein #C9C5BC):** warm veined stone for primary controls — buttons read as pressed stone, not plastic.
- **Bronze (#C08457):** the luxe interaction metal — primary CTAs and premium accents. Warm, industrial.
- **Signal (#34D3B8):** cool teal marking live network activity — a wire carrying a run, an active node, a healthy status. The "electric" futuristic note against the warm stone.
- **Hairline / circuit (#232A36 / #2E3645):** the circuit-trace borders that structure panels and wires.
- **Status (good/warn/bad):** semantic, teal/amber/red.

## Typography

Satoshi leads — a geometric grotesk with a futuristic-minimal character.
General Sans carries body for family cohesion. JetBrains Mono carries all
data: every CLI string, every ledger hash, every wire label, every number.
Mono dominates the data layer because the network is made of data.

- **Satoshi (display, h2):** sleek, geometric, a little techy — the futuristic voice.
- **General Sans (body):** clean, readable companion.
- **JetBrains Mono (stat-number, code, table-cell, labels):** the connective tissue of the network — figures, hashes, node labels.

## Layout

Network-composition, not section-template. The hero is a network graph:
agent-bot nodes on the left wired to tool-nodes on the right, with the
headline set into the graph. 8px base, 1140px max content. Panels are obsidian
slabs on hairline circuit borders. The catalog leads (per README) — rendered
as the cluster of tool-nodes. Marble buttons are heavy and centered on action.
Money to 4dp, always.

## Elevation & Depth

Chunky and physical, like pixar-toy, but luxe-restrained. Obsidian panels lift
on soft, wide ambient shadows (not hard offsets). Marble buttons carry heavy,
crisp drop shadows so they read as real stone — pressed, weighted, premium.
Sheen comes from solid rgba overlays, never gradients. The depth says
"hardware," not "floating glass."

## Shapes

Heavy and architectural. Marble buttons get generous radius (10px) and
physical weight. Obsidian panels are slightly softer (6–10px). Network nodes
are full circles/pills. Circuit traces are 1px hairlines. Nothing is bubbly;
the roundness is substantial, like cut stone and machined metal.

## Components

- **Marble button:** the signature primary control — veined stone, obsidian text, heavy shadow. Bronze variant for secondary premium action.
- **Obsidian panel:** the default container (code, stat, form) — raised obsidian, circuit hairline border, soft ambient shadow.
- **Network graph:** the hero motif — bot nodes (bronze) and tool nodes (obsidian) wired together; a wire pulses signal-teal when a run flows across it.
- **Code panel:** obsidian, mono, bronze command tokens + signal string tokens — matches the real CLI output.
- **Stat panel:** obsidian slab, signal-teal mono number, provenance in mono-muted.
- **Status pills:** semantic (good/warn/bad), pill, mono label.

## Motion

Sleek and futuristic. Wires carry a signal-teal pulse when data flows (a run
fires); nodes brighten on interaction; marble buttons depress physically on
press. Easing is smooth cubic-bezier; durations are confident, not snappy.
`prefers-reduced-motion` freezes the network to a static graph — the static
composition still reads as a network.

## Do's and Don'ts

**Do**
- Render the product topology as the page spine: bots → wires → tool-nodes, with the catalog (discover) as the dominant cluster.
- Make primary CTAs heavy marble; use bronze for premium secondary actions.
- Pulse the signal-teal along a wire to show a run/charge flowing — motion as meaning.
- Put every number and hash in mono.
- Keep money to 4dp; show the real empty-leaderboard state.

**Don't**
- Don't use gradients — sheen is solid rgba overlays; depth is shadows + circuit hairlines.
- Don't over-decorate the network — it's the product's real topology, not garnish. Every node maps to a real agent/tool/ledger entity.
- Don't warm the obsidian or cool the marble — the warm-stone + cool-signal tension is the system.
- Don't fabricate stats; don't write LLM-slop copy; don't truncate money to 2dp.
