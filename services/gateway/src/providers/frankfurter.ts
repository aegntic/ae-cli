import type { ProviderAdapter, RunResult } from "@aegntic/sdk"

/**
 * Frankfurter — a REAL no-key provider adapter.
 *
 * Uses the public Frankfurter API (https://www.frankfurter.app/docs/) which
 * serves daily foreign-exchange rates published by the European Central
 * Bank. Free, no API key, no signup, server-side fetch — no CORS. Real FX
 * data, real ledger charge.
 *
 * Cost is nominal; the unit price drives a real billing row so the
 * marketplace executes a live charge on genuine traffic and demonstrates
 * the per_call cost model on a query-param endpoint.
 */

const FF_BASE = "https://api.frankfurter.app"

/** per_call, USD. */
const UNIT_PRICE = 0.002

interface FrankfurterResponse {
  amount?: number
  base?: string
  date?: string
  rates?: Record<string, number>
  message?: string
}

export const frankfurterProvider: ProviderAdapter = {
  name: "frankfurter",
  endpoints: [
    {
      provider: "frankfurter",
      path: "rates/latest",
      description:
        "Latest FX rates from a base currency to one or more target currencies (ECB data). Real data from Frankfurter, no key.",
      inputSchema: {
        queryParams: {
          from: {
            type: "string",
            description: "Base ISO 4217 currency code (e.g. 'USD', 'EUR').",
            required: true,
          },
          to: {
            type: "string",
            description:
              "Comma-separated target currency codes (e.g. 'EUR,GBP,JPY'). Omit for all ECB rates.",
            required: false,
          },
        },
      },
      costModel: { type: "per_call", unitPrice: UNIT_PRICE, currency: "USD" },
      verified: true,
    },
    {
      provider: "frankfurter",
      path: "rates/:date",
      description:
        "Historical FX rates for a given date (YYYY-MM-DD, ECB data). Path param `date`. Real data from Frankfurter.",
      inputSchema: {
        pathParams: {
          date: {
            type: "string",
            description: "ISO date YYYY-MM-DD (e.g. '2026-01-06'). Must be a business day.",
            required: true,
          },
        },
        queryParams: {
          from: {
            type: "string",
            description: "Base ISO 4217 currency code (e.g. 'USD').",
            required: true,
          },
          to: {
            type: "string",
            description: "Comma-separated target codes. Omit for all.",
            required: false,
          },
        },
      },
      costModel: { type: "per_call", unitPrice: UNIT_PRICE, currency: "USD" },
      verified: true,
    },
  ],

  async execute(endpoint: string, input): Promise<RunResult> {
    if (endpoint === "rates/latest") return executeLatest(input)
    if (endpoint.startsWith("rates/")) return executeHistorical(endpoint, input)
    throw new Error(`frankfurter: unknown endpoint ${endpoint}`)
  },

  async estimateCost(endpoint: string): Promise<number> {
    if (endpoint === "rates/latest" || endpoint.startsWith("rates/")) return UNIT_PRICE
    return 0
  },
}

async function executeLatest(input: {
  queryParams?: Record<string, string>
}): Promise<RunResult> {
  const from = input.queryParams?.from?.trim()
  if (!from) throw new Error("frankfurter: query param 'from' is required")
  const to = input.queryParams?.to?.trim()

  const url = buildUrl("/latest", { from, to })
  const payload = await fetchJson(url)

  return {
    data: {
      base: payload.base ?? from,
      date: payload.date ?? null,
      rates: payload.rates ?? {},
    },
    items: Object.keys(payload.rates ?? {}).length,
    cost: UNIT_PRICE,
  }
}

async function executeHistorical(
  endpoint: string,
  input: {
    pathParams?: Record<string, string>
    queryParams?: Record<string, string>
  },
): Promise<RunResult> {
  // Endpoint shape: rates/:date — extract the date segment.
  const date = endpoint.split("/")[1] ?? input.pathParams?.date
  if (!date) throw new Error("frankfurter: path param 'date' is required")

  const from = input.queryParams?.from?.trim()
  if (!from) throw new Error("frankfurter: query param 'from' is required")
  const to = input.queryParams?.to?.trim()

  const url = buildUrl(`/${encodeURIComponent(date)}`, { from, to })
  const payload = await fetchJson(url)

  return {
    data: {
      date: payload.date ?? date,
      base: payload.base ?? from,
      rates: payload.rates ?? {},
    },
    items: Object.keys(payload.rates ?? {}).length,
    cost: UNIT_PRICE,
  }
}

function buildUrl(path: string, q: { from: string; to?: string }): string {
  const params = new URLSearchParams({ from: q.from })
  if (q.to) params.set("to", q.to)
  return `${FF_BASE}${path}?${params.toString()}`
}

async function fetchJson(url: string): Promise<FrankfurterResponse> {
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(10_000),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new Error(
      `frankfurter upstream ${res.status}: ${body.slice(0, 200) || res.statusText}`,
    )
  }
  return (await res.json()) as FrankfurterResponse
}
