import type { ProviderAdapter, RunResult } from "@aegntic/sdk"

/**
 * REST Countries — a REAL no-key provider adapter.
 *
 * Uses the public REST Countries API (https://restcountries.com/v3.1/). No
 * API key, no signup. Server-side fetch — no CORS. Real country data, real
 * ledger charge. Demonstrates the per_call cost model on a path-param
 * endpoint.
 *
 * Cost is nominal (upstream is free); the unit price drives a real billing
 * row so the marketplace executes a live charge on genuine traffic.
 */

const RC_BASE = "https://restcountries.com/v3.1"

/** per_call, USD. */
const UNIT_PRICE = 0.002

interface CountryRecord {
  name?: { common?: string; official?: string }
  cca2?: string
  cca3?: string
  capital?: string[]
  region?: string
  subregion?: string
  population?: number
  latlng?: number[]
  area?: number
  currencies?: Record<string, { name?: string; symbol?: string }>
  languages?: Record<string, string>
  flag?: string
  maps?: { googleMaps?: string }
}

export const restCountriesProvider: ProviderAdapter = {
  name: "restcountries",
  endpoints: [
    {
      provider: "restcountries",
      path: "name/:name",
      description:
        "Country info by name (official, common, or partial). Path param `name` is the country name. Real data from REST Countries.",
      inputSchema: {
        pathParams: {
          name: {
            type: "string",
            description: "Country name (e.g. 'france', 'united').",
            required: true,
          },
        },
      },
      costModel: { type: "per_call", unitPrice: UNIT_PRICE, currency: "USD" },
      verified: true,
    },
  ],

  async execute(endpoint: string, input): Promise<RunResult> {
    if (endpoint !== "name/:name" && endpoint !== "name/") {
      throw new Error(`restcountries: unknown endpoint ${endpoint}`)
    }

    const name = input.pathParams?.name
    if (!name) {
      throw new Error("restcountries: path param 'name' is required")
    }

    const url = `${RC_BASE}/name/${encodeURIComponent(name)}?fullText=false`
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10_000),
    })

    if (!res.ok) {
      const body = await res.text().catch(() => "")
      throw new Error(
        `restcountries upstream ${res.status}: ${body.slice(0, 200) || res.statusText}`,
      )
    }

    const data = (await res.json()) as CountryRecord[]
    const compact = (Array.isArray(data) ? data : []).map((c) => ({
      name_common: c.name?.common ?? null,
      name_official: c.name?.official ?? null,
      cca2: c.cca2 ?? null,
      cca3: c.cca3 ?? null,
      capital: Array.isArray(c.capital) ? c.capital : null,
      region: c.region ?? null,
      subregion: c.subregion ?? null,
      population: c.population ?? null,
      area: c.area ?? null,
      currencies: c.currencies ?? null,
      languages: c.languages ?? null,
      flag: c.flag ?? null,
    }))

    return {
      data: { query: name, count: compact.length, countries: compact },
      items: compact.length,
      cost: UNIT_PRICE,
    }
  },

  async estimateCost(endpoint: string): Promise<number> {
    if (endpoint !== "name/:name" && endpoint !== "name/") return 0
    return UNIT_PRICE
  },
}
