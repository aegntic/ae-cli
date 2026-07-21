import { describe, test, expect, vi, afterEach } from "vitest"
import { frankfurterProvider } from "./frankfurter.js"

/**
 * Unit tests for the Frankfurter provider. Upstream fetch is mocked so the
 * suite is deterministic and offline. Real network calls are exercised by
 * the seed-runs script.
 */

afterEach(() => {
  vi.restoreAllMocks()
})

const LATEST_RESPONSE = {
  amount: 1,
  base: "USD",
  date: "2026-07-17",
  rates: { EUR: 0.87451, GBP: 0.74419, JPY: 162.35 },
}

describe("frankfurter provider — rates/latest", () => {
  test("execute returns FX rates with per_call cost and correct URL", async () => {
    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify(LATEST_RESPONSE), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    )

    const result = await frankfurterProvider.execute("rates/latest", {
      queryParams: { from: "USD", to: "EUR,GBP,JPY" },
    })

    expect(fetchMock).toHaveBeenCalledOnce()
    const calledUrl = String(fetchMock.mock.calls[0][0])
    expect(calledUrl).toContain("/latest?")
    expect(calledUrl).toContain("from=USD")
    expect(calledUrl).toContain("to=EUR%2CGBP%2CJPY")

    const data = result.data as { base: string; date: string; rates: Record<string, number> }
    expect(data.base).toBe("USD")
    expect(data.date).toBe("2026-07-17")
    expect(data.rates.EUR).toBe(0.87451)
    expect(result.items).toBe(3)
    expect(result.cost).toBe(0.002)
  })

  test("execute throws when from is missing", async () => {
    await expect(
      frankfurterProvider.execute("rates/latest", { queryParams: {} }),
    ).rejects.toThrow(/'from' is required/)
  })

  test("surfaces upstream 404 (unknown currency)", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response('{"message":"not found"}', { status: 404 }),
    )
    await expect(
      frankfurterProvider.execute("rates/latest", {
        queryParams: { from: "ZZZNOTACURRENCY" },
      }),
    ).rejects.toThrow(/frankfurter upstream 404/)
  })

  test("estimateCost returns per_call unit price", async () => {
    expect(
      await frankfurterProvider.estimateCost("rates/latest", {}),
    ).toBe(0.002)
    expect(await frankfurterProvider.estimateCost("nope", {})).toBe(0)
  })
})

describe("frankfurter provider — rates/:date", () => {
  test("execute returns historical rates with date from path", async () => {
    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          amount: 1,
          base: "USD",
          date: "2026-01-06",
          rates: { EUR: 0.91, GBP: 0.78 },
        }),
        { status: 200 },
      ),
    )

    const result = await frankfurterProvider.execute("rates/2026-01-06", {
      pathParams: { date: "2026-01-06" },
      queryParams: { from: "USD", to: "EUR,GBP" },
    })

    const calledUrl = String(fetchMock.mock.calls[0][0])
    expect(calledUrl).toContain("/2026-01-06?")
    expect(calledUrl).toContain("from=USD")
    const data = result.data as { date: string; rates: Record<string, number> }
    expect(data.date).toBe("2026-01-06")
    expect(data.rates.GBP).toBe(0.78)
    expect(result.cost).toBe(0.002)
  })

  test("surfaces upstream 422 (invalid date)", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response('{"message":"invalid date"}', { status: 422 }),
    )
    await expect(
      frankfurterProvider.execute("rates/2026-99-99", {
        pathParams: { date: "2026-99-99" },
        queryParams: { from: "USD" },
      }),
    ).rejects.toThrow(/frankfurter upstream 422/)
  })
})
