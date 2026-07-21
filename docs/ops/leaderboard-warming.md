# Leaderboard warming

> Keeps the public reliability leaderboard fresh and honest 24/7.

## What it is

The reliability leaderboard at <https://aedex.ing/leaderboard> (backed by the
production gateway at <https://aegntic-gateway.fly.dev>) is the product's top
selling asset. It is only believable if it is demonstrably **alive** — real
tools being exercised on real traffic around the clock, with fresh success
rates and latencies.

This automation runs a small, fixed set of cheap, real data tools through the
production gateway on a schedule. Every successful (or failed) run lands on the
gateway ledger and telemetry, so the board reflects continuous live activity.

## How it runs

- **Schedule:** every 6 hours via GitHub Actions cron
  (`.github/workflows/leaderboard-warm.yml`, `17 */6 * * *` — off the :00 mark
  to dodge GitHub's cron-load spikes). Also runnable on demand via
  `workflow_dispatch`.
- **Script:** `scripts/warm-leaderboard.mjs` — plain Node ESM, **zero runtime
  deps** (uses global `fetch`). Runs without `pnpm install`.
- **Tools exercised (1 result each):**

  | provider / endpoint | data | worst-case cost |
  | --- | --- | --- |
  | `openmeteo/weather/current` | current weather (NYC) | $0.001 |
  | `hackernews/stories/top` | top HN story | $0.002 |
  | `coingecko/markets` | BTC market data | $0.003 |
  | `frankfurter/rates/latest` | USD FX rates | $0.002 |

  **Estimated cost per run: ≤ $0.008** (failed runs cost nothing — the gateway
  only charges on success). At 4 runs/day that is ≲ $0.10/month.

## Exit-code policy

The script is designed not to flap:

- Exits **non-zero** only when env is missing or the gateway is entirely
  unreachable (so a human gets paged on real breakage).
- Exits **0** even when individual tools fail — one upstream provider outage
  (e.g. CoinGecko rate-limit) must not turn the cron red and generate noise.

## Required secrets

Add these under **Settings → Secrets and variables → Actions** in the
`aegntic/ae-cli` repo before the first scheduled run:

| Secret | Value |
| --- | --- |
| `AEDX_BASE_URL` | Gateway origin, e.g. `https://aegntic-gateway.fly.dev` |
| `AEDX_API_KEY` | A **funded** workspace API key (Bearer token) |

If either secret is missing, the script fails fast with exit code 1 and a clear
message rather than a confusing downstream error.

## Local run

```bash
AEDX_BASE_URL=https://aegntic-gateway.fly.dev \
AEDX_API_KEY=<funded-workspace-key> \
node scripts/warm-leaderboard.mjs
```

Output is one line per tool (`OK`/`FAIL` with status, latency, items, cost) and
a final summary line.
