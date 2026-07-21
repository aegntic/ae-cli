# Obsidian Network — Stitch generation prompts

Paste `obsidian-network.md` into the Stitch project's DESIGN.md first, then use these prompts. Each is tuned to the network-graph motif + real aedex content. Nothing invented.

## Setup (once)
1. [stitch.withgoogle.com](https://stitch.withgoogle.com) → new project (web).
2. Open the project **DESIGN.md** → paste the full contents of `obsidian-network.md`.
3. Use the prompts below, one screen at a time.

---

## Screen 1 — Marketing landing (`/`)

```
Generate the aedex marketing landing, desktop, using the project DESIGN.md.

LAYOUT — network-composition, not a section grid:
- Sticky header: wordmark "aedex" (bronze square "ae" tile + Satoshi wordmark),
  nav (Network / Catalog / Reliability / Docs), and a MARBLE primary button "Get an API key →".
- Hero, two columns:
  LEFT — eyebrow "v1.0 · signed-ledger data-tool network" (mono, bronze, tracked);
  H1 "Connect your agent to every tool it needs." (Satoshi 700, "every tool" in signal-teal);
  subhead "Agents discover, call, and meter data tools across one signed-ledger network.
  Every run a wire, every charge a signed entry, every reliability number measured — not marketed.";
  CTA row = marble "Start building" + bronze "View the network" + mono caption "no card · metered to the cent".
  RIGHT — a LIVING NETWORK GRAPH (SVG): 3 bronze agent-bot nodes on the left wired to 4 obsidian
  tool-node cards on the right (coingecko/price, openmeteo/weather, hackernews/top, frankfurter/rates).
  Most wires are bronze hairlines; TWO wires pulse signal-teal (a run flowing) and their target tool
  nodes glow teal. Label the pulsing path "▸ run · signed" in mono teal.

- Below hero, a two-panel row:
  CODE PANEL (obsidian) titled "~ / aedex terminal" showing real output:
    $ aedex discover -q "weather"
    ⚡ [openmeteo] weather/current  Score: 0.87  ✓ Verified
    $ aedex run openmeteo/weather/current --query '{"latitude":52.52,"longitude":13.41}'
    → charge $0.0002 · ed25519 · sig 9f3a…c1e2
    (command tokens bronze, strings teal, output muted)
  STAT PANEL (obsidian): mono key "CATALOG / indexed", big signal-teal mono "18 tools",
  sub-grid "providers 6 / billing per-result", footnote "Public reliability leaderboard is live —
  tool rows publish as calls accrue (min 3 / tool). Failed runs are free."

- Provider rail: "/ tool nodes on the network — 6 providers · 18 tools" then obsidian node-chips
  with a teal status dot: openmeteo, coingecko, hackernews, frankfurter, apify, cldcde.

RULES: obsidian background, marble only on primary CTAs, bronze for bots/wires/premium accents,
signal-teal only for live/healthy state. Mono for every number, hash, CLI string, node label.
No gradients. No fabricated success-rate stat.
```

## Screen 2 — Public reliability leaderboard (`/leaderboard`)

```
Generate the aedex public reliability leaderboard, desktop, using DESIGN.md. This page must read
as a MEASUREMENT INSTRUMENT, not marketing.

- Same sticky header (marble "Get an API key").
- Eyebrow "aedex / reliability", H1 "Which data tools actually work?" with "actually work" in signal-teal.
- Subhead: "Live success rate, p50/p95 latency, and call volume — aggregated from real provider calls
  routed through aedex. Tools with fewer than 3 calls are omitted."
- Then show BOTH states:

  STATE A — EMPTY (the real current state, design this prominently):
  An obsidian panel, mono label "NETWORK / warming up", a quiet network graph with dim nodes and
  no pulsing wires, headline "No tools have crossed 3 calls yet", sub "Run a tool — the moment it
  accrues 3 real calls, its row publishes here. Honest telemetry, not a fabricated 100%."
  A marble button "Run a tool to populate the board".

  STATE B — POPULATED (show the table design for when data exists):
  An obsidian table, circuit-hairline row dividers, mono cells. Columns: provider / endpoint,
  status pill (teal healthy / amber degraded / red unreliable), success %, p50, p95, calls, last.
  Rows: openmeteo/weather/current, coingecko/price, hackernews/top, frankfurter/rates — with
  PLAUSIBLE placeholder numbers clearly marked as illustrative, NOT real. Numbers in mono.

- Methodology card: how success rate, p50/p95 are computed (percentile_cont; success = provider
  returned without throwing; <3 calls omitted as statistically meaningless).
- Verbatim disclaimer footer: "Reliability stats are aggregated from live provider calls. Tools
  with fewer than 3 calls are omitted as low-sample rates are not statistically meaningful. Rates
  are not a guarantee."

RULES: never present a success rate as real — the live board is empty today. Mono for all numbers.
```

## Screen 3 — Auth-gated console (`/app`)

```
Generate the aedex console, desktop, using DESIGN.md. Auth-gated; user pastes an aedex_live_ API key.

- AUTH GATE (no key yet): centered obsidian panel, "Connect a workspace", instructs to mint a key
  with `aedex keys add`; a mono password input "aedex_live_…"; marble "Connect" button.

- AUTHENTICATED console:
  Header row: "aedex / console · Workspace" + refresh + disconnect.
  BALANCE HERO: mono label "balance", a huge mono number "$9.9840" (signal-teal) — 4 DECIMAL places,
  with "available $9.9840 / held $0.0000" beside it. Marble "Top up" button (opens Stripe).
  RECENT RUNS table: obsidian, circuit hairlines, mono. Columns: provider / endpoint, status pill
  (COMPLETED teal / RUNNING amber-pulse / FAILED red), cost to 4dp ($0.0002), time-ago.
  Rows: openmeteo/weather/current COMPLETED $0.0002, coingecko/price COMPLETED $0.0004,
  hackernews/top RUNNING —, apify/serp FAILED $0.0000 (free).
  Footnote: "Failed runs are free. Balance is derived from the signed ledger — GET /v1/balance/audit."

RULES: money always 4dp (a hidden sub-cent charge is a bug). Mono for all numbers, costs, statuses.
While a run is RUNNING, show a small pulsing teal wire-dot beside it.
```

## After generation
- Export the 3 screens, compare to `docs/design/mockups/obsidian-network.html`.
- Hand the chosen screens back to implement → port tokens into `apps/web/src/app/globals.css`.
