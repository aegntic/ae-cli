import type { ProviderAdapter, RunResult } from "@aegntic/sdk"

/**
 * Open-Meteo — a REAL provider adapter.
 *
 * Open-Meteo (https://open-meteo.com) is free, no API key, no signup. This is
 * the first non-mock provider: real external data, real ledger charge. It
 * proves the marketplace executes live requests and bills against the balance
 * through the exact same ProviderAdapter contract the mock uses.
 *
 * Cost is nominal (the upstream data is free); the point is to exercise the
 * billing path on real traffic. Adjust unitPrice when real provider economics
 * apply.
 */

const OPEN_METEO_BASE = "https://api.open-meteo.com/v1"

const UNIT_PRICE = 0.001 // per_call, USD

export const openMeteoProvider: ProviderAdapter = {
  name: "openmeteo",
  endpoints: [
    {
      provider: "openmeteo",
      path: "weather/current",
      description:
        "Current weather for a location by latitude/longitude (real data from Open-Meteo).",
      inputSchema: {
        queryParams: {
          lat: {
            type: "number",
            description: "Latitude (-90..90)",
            required: true,
          },
          lon: {
            type: "number",
            description: "Longitude (-180..180)",
            required: true,
          },
        },
      },
      costModel: { type: "per_call", unitPrice: UNIT_PRICE, currency: "USD" },
      verified: true,
    },
  ],

  async execute(endpoint: string, input): Promise<RunResult> {
    if (endpoint !== "weather/current") {
      throw new Error(`openmeteo: unknown endpoint ${endpoint}`)
    }

    const lat = input.queryParams?.lat
    const lon = input.queryParams?.lon
    if (lat === undefined || lon === undefined) {
      throw new Error("openmeteo: lat and lon query params are required")
    }

    const url =
      `${OPEN_METEO_BASE}/forecast?latitude=${encodeURIComponent(String(lat))}` +
      `&longitude=${encodeURIComponent(String(lon))}` +
      `&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,wind_direction_10m`

    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      // Bound upstream latency so a hung provider can't hold a run forever.
      signal: AbortSignal.timeout(10_000),
    })

    if (!res.ok) {
      const body = await res.text().catch(() => "")
      throw new Error(
        `openmeteo upstream ${res.status}: ${body.slice(0, 200) || res.statusText}`,
      )
    }

    const data = (await res.json()) as {
      current?: Record<string, number>
      current_units?: Record<string, string>
      latitude?: number
      longitude?: number
      timezone?: string
    }

    return {
      data: {
        location: { lat: data.latitude, lon: data.longitude, timezone: data.timezone },
        current: data.current ?? {},
        units: data.current_units ?? {},
      },
      items: 1,
      cost: UNIT_PRICE,
    }
  },

  async estimateCost(endpoint: string): Promise<number> {
    if (endpoint !== "weather/current") return 0
    return UNIT_PRICE
  },
}
