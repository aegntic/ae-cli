import { describe, test, expect, vi, afterEach } from "vitest"
import { hackerNewsProvider } from "./hackernews.js"

/**
 * Unit tests for the Hacker News provider. Upstream fetch is mocked so the
 * suite is deterministic and offline. Real network calls are exercised by
 * the seed-runs script, not here.
 */

afterEach(() => {
  vi.restoreAllMocks()
})

const TOP_IDS = [1, 2, 3, 4, 5]
const ITEM_1 = {
  id: 1,
  title: "Show HN: aegntic",
  url: "https://example.com/aegntic",
  score: 999,
  by: "ae",
  time: 1700000000,
  type: "story",
  descendants: 42,
}
const ITEM_2 = { id: 2, title: "Ask HN: best CLI?", by: "dang", time: 1700000100, score: 50 }

describe("hackernews provider — stories/top", () => {
  test("execute returns compact stories with per_result cost", async () => {
    const fetchMock = vi.spyOn(global, "fetch").mockImplementation(
      async (input) => {
        const url = String(input)
        if (url.endsWith("/topstories.json")) {
          return new Response(JSON.stringify(TOP_IDS), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          })
        }
        if (url.includes("/item/1.json")) {
          return new Response(JSON.stringify(ITEM_1), { status: 200 })
        }
        if (url.includes("/item/2.json")) {
          return new Response(JSON.stringify(ITEM_2), { status: 200 })
        }
        // Remaining items (3,4,5) simulate per-item failure -> null filter
        return new Response("not found", { status: 404 })
      },
    )

    const result = await hackerNewsProvider.execute("stories/top", {
      queryParams: { limit: "5" },
    })

    expect(fetchMock).toHaveBeenCalled()
    const topCall = String(fetchMock.mock.calls[0][0])
    expect(topCall).toContain("topstories.json")

    const data = result.data as { count: number; items: Array<{ id: number }> }
    expect(data.count).toBe(2)
    expect(result.items).toBe(2)
    // 2 successful items * 0.002
    expect(result.cost).toBe(0.004)
  })

  test("applies default and capped limits", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify([10, 20, 30]), { status: 200 }),
    )
    // No limit param -> default 10
    const estDefault = await hackerNewsProvider.estimateCost("stories/top", { queryParams: {} })
    expect(estDefault).toBe(10 * 0.002)
    // limit larger than MAX_LIMIT -> capped at 30
    const estCap = await hackerNewsProvider.estimateCost("stories/top", {
      queryParams: { limit: "999" },
    })
    expect(estCap).toBe(30 * 0.002)
    // garbage -> default
    const estBad = await hackerNewsProvider.estimateCost("stories/top", {
      queryParams: { limit: "NaN" },
    })
    expect(estBad).toBe(10 * 0.002)
  })

  test("surfaces upstream errors on topstories", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response("server error", { status: 500 }),
    )
    await expect(
      hackerNewsProvider.execute("stories/top", { queryParams: { limit: "3" } }),
    ).rejects.toThrow(/hackernews upstream 500/)
  })
})

describe("hackernews provider — user/:id", () => {
  test("execute returns user profile with per_call cost", async () => {
    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          id: "pg",
          karma: 155000,
          about: "hacker",
          created: 1160418111,
          submitted: [1, 2, 3, 4],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    )

    const result = await hackerNewsProvider.execute("user/:id", {
      pathParams: { id: "pg" },
    })

    const calledUrl = String(fetchMock.mock.calls[0][0])
    expect(calledUrl).toContain("/user/pg.json")

    const data = result.data as { karma: number; found: boolean; submittedCount: number }
    expect(data.karma).toBe(155000)
    expect(data.found).toBe(true)
    expect(data.submittedCount).toBe(4)
    expect(result.items).toBe(1)
    expect(result.cost).toBe(0.002)
  })

  test("execute throws when id missing", async () => {
    await expect(
      hackerNewsProvider.execute("user/:id", { pathParams: {} }),
    ).rejects.toThrow(/'id' is required/)
  })

  test("returns found:false for a null user payload", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify(null), { status: 200 }),
    )
    const result = await hackerNewsProvider.execute("user/:id", {
      pathParams: { id: "nobody" },
    })
    const data = result.data as { found: boolean }
    expect(data.found).toBe(false)
    expect(result.cost).toBe(0.002)
  })
})
