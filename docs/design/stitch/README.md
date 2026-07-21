# aedex × Stitch (DESIGN.md)

Google [DESIGN.md](https://github.com/google-labs-code/design.md)-compliant design systems for [Stitch](https://stitch.withgoogle.com), one per direction. All validated: **0 errors, 0 WCAG contrast warnings**.

| File | Direction | Thesis |
|---|---|---|
| `aegntic-toy.md` | **Aegntic Toy (chosen — fusion)** | Pixar-toy's chunky structure (bold ink outlines, hard offset plastic shadows, 3rem radius, heavy Space Grotesk, spring) wearing the aegntic.ai brand palette (icy paper `#f0f6f8`, teal `#00b39f`, obsidian `#0c1016`, white cards). Toy energy = chunk + weight, not a rainbow. |
| `obsidian-network.md` | Obsidian Network | Polished obsidian + marble buttons + bronze + a living bot→tool network graph. Sleek futuristic industrial (dark). |
| `editorial-ledger.md` | Editorial Ledger | Paper + ink + Swiss rules + serif numbers. Trustworthy-accounting metaphor. |
| `pixar-toy.md` | Pixar Toy | Warm cream + rainbow toy palette. Friendly power-tool (pre-brand-alignment). |
| `refined-dark.md` | Refined Dark Infra | Near-black + viridian + mono. Cold/precise. |

**Chosen direction: Aegntic Toy** — pixar-toy's chunk the user liked, aligned to the real aegntic.ai brand (tokens pulled from the live site's CSS). Mockup: `docs/design/mockups/aegntic-toy.html`. Vision-verified 9/10.

Brand tokens inherited from aegntic.ai: accent `#00b39f` (teal), surfaces `#0c1016` (obsidian) + ramp, bg `#f0f6f8` (icy paper), Space Grotesk display + Inter body, 3rem radius, spring eases.

## How to use in Stitch

1. Open [stitch.withgoogle.com](https://stitch.withgoogle.com), create or open a project.
2. Open the project's **DESIGN.md** file.
3. Paste the *entire contents* of one of the files above (YAML front matter + markdown body).
4. Prompt Stitch to generate screens, e.g.:
   - *"Generate the marketing landing for aedex. Lead with discover/search of the data-tool catalog. Hero shows the discover→run→bill loop with a real CLI code block and a catalog stat (18 tools, 6 providers)."*
   - *"Generate the public reliability leaderboard. It's currently empty (0 tools have ≥3 calls) — design the honest empty state, plus the populated table state with success %, p50, p95, calls."*
   - *"Generate the auth-gated console: paste an `aedex_live_` API key, see balance to 4 decimals ($9.9840), recent runs table with provider/endpoint/status/cost, auto-refresh while runs are active."*

Repeat per direction to compare generated UIs.

## Validate locally

```bash
npx @google/design.md lint docs/design/stitch/editorial-ledger.md
npx @google/design.md diff docs/design/stitch/editorial-ledger.md docs/design/stitch/refined-dark.md
```

## Source of truth

All tokens + copy are pulled from the repo (see `../aedex-frontend-design-brief.md`):
- Colors/type from `apps/web/src/app/globals.css`
- Provider set (6 providers / 18 tools) + taglines from `README.md`
- CLI output format from `packages/cli/src/commands/discover.ts`
- Ledger semantics from `services/gateway/src/db/schema.ts`
- Leaderboard fields + disclaimer from `services/gateway/src/reliability.ts` + `app.ts`

Nothing invented. The live leaderboard currently publishes 0 tools — designs show the real empty state, never a fabricated success rate (Constitution §1).
