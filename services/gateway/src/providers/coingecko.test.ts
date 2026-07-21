import { describe, test, expect, vi, afterEach } from "vitest"
import { coinGeckoProvider } from "./coingecko.js"

/**
 * Unit tests for the CoinGecko provider. Upstream fetch is mocked so the
 * suite is deterministic and offline. The real (network) path is exercised
 * by the seed-runs script.
 */

afterEach(() => {
  vi.restoreAllMocks()
})

const SAMPLE_MARKETS = [
  {
    id: "bitcoin",
    symbol: "btc",
    name: "Bitcoin",
    current_price: 67000.5,
    market_cap: 1300000000000,
    market_cap_rank: 1,
    total_volume: 25000000000,
    price_change_percentage_24h: 1.23,
    last_updated: "2026-07-18T00:00:00.000Z",
  },
  {
    id: "ethereum",
    symbol: "eth",
    name: "Ethereum",
    current_price: 3500.1,
    market_cap: 420000000000,
    market_cap_rank: 2,
    total_volume: 12000000000,
    price_change_percentage_24h: -0.42,
    last_updated: "2026-07-18T00:00:00.000Z",
  },
]

describe("coingecko provider", () => {
  test("execute returns market rows with per_result cost and correct URL", async () => {
    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify(SAMPLE_MARKETS), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    )

    const result = await coinGeckoProvider.execute("markets", {
      queryParams: { ids: "bitcoin,ethereum", limit: "2" },
    })

    expect(fetchMock).toHaveBeenCalledOnce()
    const calledUrl = String(fetchMock.mock.calls[0][0])
    expect(calledUrl).toContain("/coins/markets?")
    expect(calledUrl).toContain("vs_currency=usd")
    expect(calledUrl).toContain("ids=bitcoin%2Cethereum")
    expect(calledUrl).toContain("per_page=2")

    const data = result.data as { count: number; markets: Array<{ id: string }> }
    expect(data.count).toBe(2)
    expect(data.markets[0].id).toBe("bitcoin")
    expect(result.items).toBe(2)
    expect(result.cost).toBe(2 * 0.003)
  })

  test("omits ids param when not provided (returns top coins)", async () => {
    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify(SAMPLE_MARKETS), { status: 200 }),
    )
    await coinGeckoProvider.execute("markets", { queryParams: {} })
    const calledUrl = String(fetchMock.mock.calls[0][0])
    expect(calledUrl).not.toContain("ids=")
  })

  test("surfaces upstream 429 rate limit", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response("rate limited", { status: 429 }),
    )
    await expect(
      coinGeckoProvider.execute("markets", { queryParams: { ids: "bitcoin" } }),
    ).rejects.toThrow(/coingecko upstream 429/)
  })

  test("estimateCost respects limit and cap", async () => {
    // default
    expect(
      await coinGeckoProvider.estimateCost("markets", { queryParams: {} }),
    ).toBe(10 * 0.003)
    // explicit
    expect(
      await coinGeckoProvider.estimateCost("markets", { queryParams: { limit: "3" } }),
    ).toBe(3 * 0.003)
    // over MAX_LIMIT -> capped at 50
    expect(
      await coinGeckoProvider.estimateCost("markets", { queryParams: { limit: "999" } }),
    ).toBe(50 * 0.003)
    // unknown endpoint
    expect(
      await coinGeckoProvider.estimateCost("nope", { queryParams: {} }),
    ).toBe(0)
  })
})
