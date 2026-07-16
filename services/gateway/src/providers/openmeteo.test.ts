import { describe, test, expect, vi, afterEach } from "vitest"
import { openMeteoProvider } from "./openmeteo.js"

/**
 * Unit test for the Open-Meteo provider. Upstream fetch is mocked so the test
 * is deterministic and offline. The live e2e (real network call) is exercised
 * through the CLI in the Checkpoint 2 demo, not here.
 */

afterEach(() => {
  vi.restoreAllMocks()
})

const SAMPLE_RESPONSE = {
  latitude: 52.52,
  longitude: 13.405,
  timezone: "Europe/Berlin",
  current: {
    temperature_2m: 18.4,
    relative_humidity_2m: 66,
    apparent_temperature: 17.5,
    wind_speed_10m: 12.3,
    wind_direction_10m: 250,
  },
  current_units: {
    temperature_2m: "°C",
    relative_humidity_2m: "%",
    wind_speed_10m: "km/h",
  },
}

describe("openmeteo provider", () => {
  test("execute returns parsed current weather with per_call cost", async () => {
    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify(SAMPLE_RESPONSE), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    )

    const result = await openMeteoProvider.execute("weather/current", {
      queryParams: { lat: "52.52", lon: "13.405" },
    })

    expect(fetchMock).toHaveBeenCalledOnce()
    const calledUrl = String(fetchMock.mock.calls[0][0])
    expect(calledUrl).toContain("latitude=52.52")
    expect(calledUrl).toContain("longitude=13.405")

    expect(result.items).toBe(1)
    expect(result.cost).toBe(0.001)
    const data = result.data as {
      current: Record<string, number>
      location: { timezone: string }
      units: Record<string, string>
    }
    expect(data.current.temperature_2m).toBe(18.4)
    expect(data.location.timezone).toBe("Europe/Berlin")
    expect(data.units.temperature_2m).toBe("°C")
  })

  test("execute throws when lat/lon missing", async () => {
    await expect(
      openMeteoProvider.execute("weather/current", { queryParams: {} }),
    ).rejects.toThrow(/lat and lon/)
  })

  test("execute surfaces upstream errors", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response("bad request", { status: 400 }),
    )
    await expect(
      openMeteoProvider.execute("weather/current", {
        queryParams: { lat: "999", lon: "0" },
      }),
    ).rejects.toThrow(/openmeteo upstream 400/)
  })

  test("estimateCost matches the per_call unit price", async () => {
    const input = { queryParams: { lat: "52.52", lon: "13.405" } }
    expect(await openMeteoProvider.estimateCost("weather/current", input)).toBe(0.001)
    expect(await openMeteoProvider.estimateCost("nope", input)).toBe(0)
  })
})
