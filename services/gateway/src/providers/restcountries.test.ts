import { describe, test, expect, vi, afterEach } from "vitest"
import { restCountriesProvider } from "./restcountries.js"

/**
 * Unit tests for the REST Countries provider. Upstream fetch is mocked so
 * the suite is deterministic and offline. Real calls are exercised by the
 * seed-runs script.
 */

afterEach(() => {
  vi.restoreAllMocks()
})

const SAMPLE_COUNTRIES = [
  {
    name: { common: "France", official: "French Republic" },
    cca2: "FR",
    cca3: "FRA",
    capital: ["Paris"],
    region: "Europe",
    subregion: "Western Europe",
    population: 67391582,
    area: 551695,
    currencies: { EUR: { name: "Euro", symbol: "€" } },
    languages: { fra: "French" },
    flag: "🇫🇷",
  },
]

describe("restcountries provider", () => {
  test("execute returns compact country rows with per_call cost", async () => {
    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify(SAMPLE_COUNTRIES), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    )

    const result = await restCountriesProvider.execute("name/:name", {
      pathParams: { name: "france" },
    })

    expect(fetchMock).toHaveBeenCalledOnce()
    const calledUrl = String(fetchMock.mock.calls[0][0])
    expect(calledUrl).toContain("/v3.1/name/france")
    expect(calledUrl).toContain("fullText=false")

    const data = result.data as {
      query: string
      count: number
      countries: Array<{ cca2: string; name_common: string }>
    }
    expect(data.count).toBe(1)
    expect(data.countries[0].cca2).toBe("FR")
    expect(data.countries[0].name_common).toBe("France")
    expect(result.items).toBe(1)
    expect(result.cost).toBe(0.002)
  })

  test("execute throws when name path param missing", async () => {
    await expect(
      restCountriesProvider.execute("name/:name", { pathParams: {} }),
    ).rejects.toThrow(/'name' is required/)
  })

  test("surfaces upstream 404 (not found)", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response("not found", { status: 404 }),
    )
    await expect(
      restCountriesProvider.execute("name/:name", { pathParams: { name: "zzznotreal" } }),
    ).rejects.toThrow(/restcountries upstream 404/)
  })

  test("estimateCost returns per_call unit price for known endpoint", async () => {
    expect(
      await restCountriesProvider.estimateCost("name/:name", { pathParams: { name: "x" } }),
    ).toBe(0.002)
    expect(await restCountriesProvider.estimateCost("nope", {})).toBe(0)
  })
})
