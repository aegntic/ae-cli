import type { ProviderAdapter, RunResult } from "@aegntic/sdk"

/**
 * CoinGecko — a REAL no-key provider adapter.
 *
 * Uses the free public tier of the CoinGecko API
 * (https://api.coingecko.com/api/v3/). No API key, no signup. Note: the free
 * tier is rate-limited (~10-30 req/min); callers should keep volume modest.
 * Server-side fetch — no CORS. Real market data, real ledger charge.
 *
 * Cost is nominal; the point is exercising the marketplace metering on
 * genuine traffic and the per_result cost model on a list-returning call.
 */

const CG_BASE = "https://api.coingecko.com/api/v3"

/** per_result, USD. Charged once per coin market row returned. */
const UNIT_PRICE = 0.003

const DEFAULT_LIMIT = 10
const MAX_LIMIT = 50

interface CoinMarket {
  id: string
  symbol?: string
  name?: string
  current_price?: number
  market_cap?: number
  market_cap_rank?: number
  total_volume?: number
  price_change_percentage_24h?: number
  last_updated?: string
}

export const coinGeckoProvider: ProviderAdapter = {
  name: "coingecko",
  endpoints: [
    {
      provider: "coingecko",
      path: "markets",
      description:
        "Coin market data (price, market cap, 24h change) by coin ids. Real data from CoinGecko's free tier. Rate-limited.",
      inputSchema: {
        queryParams: {
          ids: {
            type: "string",
            description:
              "Comma-separated CoinGecko coin ids (e.g. 'bitcoin,ethereum'). Omit to return top coins by market cap.",
            required: false,
          },
          limit: {
            type: "number",
            description: `Max coins to return (default ${DEFAULT_LIMIT}, capped at ${MAX_LIMIT}).`,
            required: false,
            default: DEFAULT_LIMIT,
          },
        },
      },
      costModel: { type: "per_result", unitPrice: UNIT_PRICE, currency: "USD" },
      verified: true,
    },
  ],

  async execute(endpoint: string, input): Promise<RunResult> {
    if (endpoint !== "markets") {
      throw new Error(`coingecko: unknown endpoint ${endpoint}`)
    }

    const ids = input.queryParams?.ids?.trim() || ""
    const limit = parseLimit(input.queryParams?.limit)

    const params = new URLSearchParams({
      vs_currency: "usd",
      per_page: String(limit),
      page: "1",
      sparkline: "false",
    })
    if (ids) params.set("ids", ids)

    const url = `${CG_BASE}/coins/markets?${params.toString()}`
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10_000),
    })

    if (!res.ok) {
      const body = await res.text().catch(() => "")
      throw new Error(
        `coingecko upstream ${res.status}: ${body.slice(0, 200) || res.statusText}`,
      )
    }

    const rows = (await res.json()) as CoinMarket[]
    const compact = rows.slice(0, limit).map((r) => ({
      id: r.id,
      symbol: r.symbol ?? null,
      name: r.name ?? null,
      current_price: r.current_price ?? null,
      market_cap: r.market_cap ?? null,
      market_cap_rank: r.market_cap_rank ?? null,
      total_volume: r.total_volume ?? null,
      price_change_percentage_24h: r.price_change_percentage_24h ?? null,
      last_updated: r.last_updated ?? null,
    }))

    return {
      data: { vs_currency: "usd", count: compact.length, markets: compact },
      items: compact.length,
      cost: compact.length * UNIT_PRICE,
    }
  },

  async estimateCost(endpoint: string, input): Promise<number> {
    if (endpoint !== "markets") return 0
    const limit = parseLimit(input.queryParams?.limit)
    return limit * UNIT_PRICE
  },
}

function parseLimit(raw: string | undefined): number {
  if (raw === undefined || raw === "") return DEFAULT_LIMIT
  const n = Number(raw)
  if (!Number.isFinite(n) || n <= 0) return DEFAULT_LIMIT
  return Math.min(Math.floor(n), MAX_LIMIT)
}
