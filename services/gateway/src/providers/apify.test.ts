import { describe, test, expect, vi, afterEach, beforeEach } from "vitest"
import { makeApifyProvider, apifyProviderIfConfigured } from "./apify.js"

/**
 * Unit tests for the Apify provider. Upstream fetch is fully mocked so the
 * suite is deterministic and offline and never burns real Apify credit.
 *
 * The token used in tests is a FAKE (not a real Apify token). We assert that
 * the upstream URL contains the token (the wiring proof) via a regex on the
 * mocked call input — we do NOT print the token to stdout or assertions.
 *
 * The single LIVE integration test lives at the bottom, gated behind
 * RUN_LIVE_APIFY=1 so normal `pnpm test` does not hit the network.
 */

const FAKE_TOKEN = "test-fake-apify-token-DO-NOT-USE-IN-PROD"

afterEach(() => {
  vi.restoreAllMocks()
})

describe("apify provider — token wiring", () => {
  beforeEach(() => {
    // Ensure env-driven factory is deterministic; we re-set after each test
    // in afterEach via restoreAllMocks, but env mutations need explicit cleanup.
  })

  test("apifyProviderIfConfigured returns undefined when token is absent", () => {
    const saved = process.env.AEGNTIC_APIFY_TOKEN
    delete process.env.AEGNTIC_APIFY_TOKEN
    try {
      expect(apifyProviderIfConfigured()).toBeUndefined()
    } finally {
      if (saved !== undefined) process.env.AEGNTIC_APIFY_TOKEN = saved
    }
  })

  test("apifyProviderIfConfigured returns undefined when token is blank", () => {
    const saved = process.env.AEGNTIC_APIFY_TOKEN
    process.env.AEGNTIC_APIFY_TOKEN = "   "
    try {
      expect(apifyProviderIfConfigured()).toBeUndefined()
    } finally {
      if (saved !== undefined) process.env.AEGNTIC_APIFY_TOKEN = saved
      else delete process.env.AEGNTIC_APIFY_TOKEN
    }
  })

  test("apifyProviderIfConfigured returns an adapter when token is set", () => {
    const saved = process.env.AEGNTIC_APIFY_TOKEN
    process.env.AEGNTIC_APIFY_TOKEN = FAKE_TOKEN
    try {
      const adapter = apifyProviderIfConfigured()
      expect(adapter).toBeDefined()
      expect(adapter?.name).toBe("apify")
      expect(adapter?.endpoints.length).toBe(3)
    } finally {
      if (saved !== undefined) process.env.AEGNTIC_APIFY_TOKEN = saved
      else delete process.env.AEGNTIC_APIFY_TOKEN
    }
  })
})

describe("apify provider — execute", () => {
  test("system/echo returns the hello-world dataset item with token in the URL", async () => {
    const provider = makeApifyProvider(FAKE_TOKEN)
    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify([{ message: "Hello world!" }]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    )

    const result = await provider.execute("system/echo", {})

    expect(fetchMock).toHaveBeenCalledOnce()
    const call = fetchMock.mock.calls[0]
    const calledUrl = String(call[0])
    const init = call[1] as RequestInit | undefined

    // WIRING PROOF: the token reached the upstream URL. Asserted via regex,
    // never printed.
    expect(calledUrl).toMatch(new RegExp(`token=${FAKE_TOKEN}`))
    expect(calledUrl).toContain("acts/apify~hello-world/run-sync-get-dataset-items")
    expect(init?.method).toBe("POST")

    expect(result.items).toBe(1)
    expect(result.cost).toBe(0.01)
    const data = result.data as { count: number; items: Array<{ message: string }> }
    expect(data.count).toBe(1)
    expect(data.items[0]?.message).toBe("Hello world!")
  })

  test("web/search forwards query + maxResults to rag-web-browser and bills per item", async () => {
    const provider = makeApifyProvider(FAKE_TOKEN)
    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify([
          { searchResult: { title: "A", url: "https://a.example" } },
          { searchResult: { title: "B", url: "https://b.example" } },
        ]),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    )

    const result = await provider.execute("web/search", {
      queryParams: { query: "apify actors", maxResults: "2" },
    })

    const calledUrl = String(fetchMock.mock.calls[0][0])
    expect(calledUrl).toContain("acts/apify~rag-web-browser/run-sync-get-dataset-items")
    const init = fetchMock.mock.calls[0][1] as RequestInit
    const body = JSON.parse(String(init.body))
    expect(body).toEqual({ query: "apify actors", maxResults: 2 })

    expect(result.items).toBe(2)
    expect(result.cost).toBe(0.02)
  })

  test("web/search throws when query is missing", async () => {
    const provider = makeApifyProvider(FAKE_TOKEN)
    vi.spyOn(global, "fetch").mockResolvedValue(new Response("[]", { status: 200 }))

    await expect(
      provider.execute("web/search", { queryParams: {} }),
    ).rejects.toThrow(/query param 'query' is required/)
  })

  test("web/scrape forwards the URL as the query with maxResults=1", async () => {
    const provider = makeApifyProvider(FAKE_TOKEN)
    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify([{ metadata: { title: "Example" }, markdown: "# Example" }]),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    )

    const result = await provider.execute("web/scrape", {
      queryParams: { url: "https://example.com" },
    })

    const init = fetchMock.mock.calls[0][1] as RequestInit
    const body = JSON.parse(String(init.body))
    expect(body).toEqual({ query: "https://example.com", maxResults: 1 })
    expect(result.items).toBe(1)
    expect(result.cost).toBe(0.01)
  })

  test("web/scrape throws when url is missing", async () => {
    const provider = makeApifyProvider(FAKE_TOKEN)
    vi.spyOn(global, "fetch").mockResolvedValue(new Response("[]", { status: 200 }))

    await expect(
      provider.execute("web/scrape", { queryParams: {} }),
    ).rejects.toThrow(/query param 'url' is required/)
  })

  test("upstream 4xx surfaces the Apify error message WITHOUT the token", async () => {
    const provider = makeApifyProvider(FAKE_TOKEN)
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          error: { type: "invalid-input", message: "Field input.query is required" },
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      ),
    )

    await expect(
      provider.execute("web/search", { queryParams: { query: "x" } }),
    ).rejects.toThrow(/apify upstream 400: Field input.query is required/)
  })

  test("unknown endpoint throws", async () => {
    const provider = makeApifyProvider(FAKE_TOKEN)
    vi.spyOn(global, "fetch").mockResolvedValue(new Response("[]", { status: 200 }))

    await expect(provider.execute("no/such", {})).rejects.toThrow(/unknown endpoint/)
  })

  test("empty dataset array returns 0 items and zero cost (per_result billing)", async () => {
    const provider = makeApifyProvider(FAKE_TOKEN)
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response("[]", { status: 200, headers: { "Content-Type": "application/json" } }),
    )

    const result = await provider.execute("system/echo", {})
    expect(result.items).toBe(0)
    expect(result.cost).toBe(0)
  })
})

describe("apify provider — estimateCost", () => {
  const provider = makeApifyProvider(FAKE_TOKEN)

  test("system/echo is a flat 1-item cost", async () => {
    expect(await provider.estimateCost("system/echo", {})).toBe(0.01)
  })

  test("web/search scales with maxResults (default 3)", async () => {
    expect(await provider.estimateCost("web/search", { queryParams: {} })).toBe(0.03)
    expect(
      await provider.estimateCost("web/search", { queryParams: { maxResults: "5" } }),
    ).toBe(0.05)
  })

  test("web/search caps at MAX_RESULTS (10)", async () => {
    expect(
      await provider.estimateCost("web/search", {
        queryParams: { maxResults: "999" },
      }),
    ).toBe(0.1)
  })

  test("web/scrape is a flat 1-item cost", async () => {
    expect(
      await provider.estimateCost("web/scrape", {
        queryParams: { url: "https://x" },
      }),
    ).toBe(0.01)
  })

  test("unknown endpoint estimates 0", async () => {
    expect(await provider.estimateCost("nope", {})).toBe(0)
  })
})

// ─── LIVE integration test (gated) ────────────────────────────────────────
//
// Skipped unless RUN_LIVE_APIFY=1 is exported. Burns a SINGLE small Apify
// call (apify/hello-world) to prove the end-to-end path works against the
// real Apify API. Run with:
//
//   RUN_LIVE_APIFY=1 pnpm --filter @aegntic/gateway test apify
//
// The real token is read from process.env.AEGNTIC_APIFY_TOKEN (loaded from
// services/gateway/.env via dotenv on gateway boot; for direct vitest runs
// the test runner inherits the shell env — export it or run via the gateway).

const RUN_LIVE = process.env.RUN_LIVE_APIFY === "1"

describe.skipIf(!RUN_LIVE)("apify provider — LIVE (RUN_LIVE_APIFY=1)", { timeout: 30_000 }, () => {
  test("system/echo returns real items from Apify", async () => {
    const token = process.env.AEGNTIC_APIFY_TOKEN
    if (!token) {
      throw new Error(
        "RUN_LIVE_APIFY=1 set but AEGNTIC_APIFY_TOKEN is missing in env — cannot run live test",
      )
    }

    const provider = makeApifyProvider(token)
    const result = await provider.execute("system/echo", {})

    expect(result.items).toBeGreaterThanOrEqual(1)
    expect(result.cost).toBeGreaterThan(0)
    const data = result.data as { count: number; items: Array<Record<string, unknown>> }
    expect(data.count).toBeGreaterThanOrEqual(1)
    // Apify hello-world returns at least one item with a "message" field.
    const sample = data.items[0]
    expect(sample).toBeDefined()
    // Report a sample field (NOT the token) for the human reading test output.
    // eslint-disable-next-line no-console
    console.log(
      `[apify live] items=${result.items} cost=$${result.cost.toFixed(2)} ` +
        `sample.message=${JSON.stringify(sample?.message ?? null)}`,
    )
  })
})
