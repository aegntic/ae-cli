/**
 * Unit tests for the aegntic MCP server tool handlers.
 *
 * Mocks fetch via vi.spyOn(globalThis, "fetch") so no real HTTP is performed.
 * Tests rely on dispatch() defaulting to the real client functions, which hit
 * the mocked fetch — the gateway contract (URL, method, body) is asserted at
 * the fetch boundary. Error cases confirm the handler returns isError and
 * does NOT throw.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { TOOL_DEFS, dispatch } from "./tools.js"
import type { BalanceAuditResponse } from "./client.js"

// All tests go through defaultDeps(), which reads env. Set a dummy key so the
// client's auth guard passes; fetch itself is mocked per-test.
beforeEach(() => {
  vi.stubEnv("AEGNTIC_API_KEY", "test-key")
  vi.stubEnv("AEGNTIC_BASE_URL", "http://localhost:3101")
})
afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

function jsonOk(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })
}

function mockFetch(body: unknown, status = 200): ReturnType<typeof vi.fn> {
  const m = vi.fn() as unknown as ReturnType<typeof vi.fn>
  if (status >= 400) {
    m.mockResolvedValue(
      new Response(typeof body === "string" ? body : JSON.stringify(body), {
        status,
      }),
    )
  } else {
    m.mockResolvedValue(jsonOk(body))
  }
  // Replace globalThis.fetch entirely so the client's `await fetch(...)` lands
  // on the mock. Cast through unknown to satisfy the overloaded fetch type.
  ;(globalThis as { fetch: unknown }).fetch = m
  return m
}

describe("MCP tool definitions", () => {
  it("exposes exactly six tools with stable names", () => {
    const names = TOOL_DEFS.map((t) => t.name).sort()
    expect(names).toEqual([
      "balance",
      "balance_audit",
      "discover",
      "get_run",
      "inspect",
      "run",
    ])
  })

  it.each(TOOL_DEFS.map((t) => [t.name, t]))(
    "%s has description + inputSchema",
    (_name, tool) => {
      expect(tool.description.length).toBeGreaterThan(10)
      expect(tool.inputSchema.type).toBe("object")
    },
  )
})

describe("dispatch: discover", () => {

  it("returns parsed results from the gateway", async () => {
    const m = mockFetch({
      data: {
        results: [
          { provider: "openmeteo", path: "/forecast", relevanceScore: 0.9 },
        ],
        total: 1,
        query: "weather",
      },
      requestId: "r1",
    })
    const res = await dispatch(undefined as never, "discover", {
      query: "weather",
      limit: 5,
    })
    expect(res.isError).toBeUndefined()
    const payload = JSON.parse(res.content[0].text)
    expect(payload.results[0].provider).toBe("openmeteo")
    expect(payload.total).toBe(1)
    // Verify the URL carries query + limit
    const url = String(m.mock.calls[0]?.[0])
    expect(url).toContain("/v1/discover?")
    expect(url).toContain("q=weather")
    expect(url).toContain("limit=5")
  })
})

describe("dispatch: inspect", () => {

  it("calls /v1/inspect with provider + endpoint and unwraps", async () => {
    const m = mockFetch({
      data: {
        endpoint: {
          provider: "p",
          path: "/e",
          description: "d",
          inputSchema: {},
          costModel: { type: "per_call", unitPrice: 0.01, currency: "USD" },
          verified: true,
        },
        examples: [],
      },
      requestId: "r",
    })
    const res = await dispatch(undefined as never, "inspect", {
      provider: "p",
      endpoint: "/e",
    })
    const payload = JSON.parse(res.content[0].text)
    expect(payload.endpoint.provider).toBe("p")
    const url = String(m.mock.calls[0]?.[0])
    expect(url).toContain("/v1/inspect?")
    expect(url).toContain("provider=p")
    expect(url).toContain("endpoint=%2Fe")
  })
})

describe("dispatch: run", () => {

  it("POSTs correct body and returns created run", async () => {
    const m = mockFetch({
      data: { id: "run_123", status: "RUNNING", provider: "p", endpoint: "/e" },
      requestId: "r",
    })
    const res = await dispatch(undefined as never, "run", {
      provider: "p",
      endpoint: "/e",
      input: { body: { lat: 52 } },
    })
    expect(res.isError).toBeUndefined()
    const payload = JSON.parse(res.content[0].text)
    expect(payload.id).toBe("run_123")

    const init = m.mock.calls[0]?.[1] as RequestInit
    expect(init.method).toBe("POST")
    const url = String(m.mock.calls[0]?.[0])
    expect(url).toContain("/v1/runs")
    expect(JSON.parse(init.body as string)).toEqual({
      provider: "p",
      endpoint: "/e",
      input: { body: { lat: 52 } },
    })
  })

  it("returns isError when input is missing", async () => {
    const res = await dispatch(undefined as never, "run", {
      provider: "p",
      endpoint: "/e",
    })
    expect(res.isError).toBe(true)
    expect(res.content[0].text).toMatch(/input/)
  })
})

describe("dispatch: get_run", () => {

  it("fetches the run by id", async () => {
    mockFetch({
      data: { id: "run_1", status: "COMPLETED", result: { ok: 1 } },
      requestId: "r",
    })
    const res = await dispatch(undefined as never, "get_run", { runId: "run_1" })
    const payload = JSON.parse(res.content[0].text)
    expect(payload.id).toBe("run_1")
    expect(payload.status).toBe("COMPLETED")
  })
})

describe("dispatch: balance", () => {

  it("unwraps the envelope", async () => {
    mockFetch({
      data: { balance: 10, currency: "USD", held: 1, available: 9 },
      requestId: "r",
    })
    const res = await dispatch(undefined as never, "balance", {})
    const payload = JSON.parse(res.content[0].text)
    expect(payload.balance).toBe(10)
    expect(payload.available).toBe(9)
  })
})

describe("dispatch: balance_audit", () => {

  it("returns the signed-chain audit result", async () => {
    const audit: BalanceAuditResponse = {
      ok: true,
      entries: 3,
      unsignedLegacyEntries: 0,
      headHash: "abc123",
      signerPublicKey: "pk",
    }
    mockFetch({ data: audit, requestId: "r" })
    const res = await dispatch(undefined as never, "balance_audit", {})
    const payload = JSON.parse(res.content[0].text)
    expect(payload.ok).toBe(true)
    expect(payload.entries).toBe(3)
    expect(payload.headHash).toBe("abc123")
  })
})

describe("dispatch: error handling", () => {

  it("returns isError on API 4xx (does not throw)", async () => {
    mockFetch("Insufficient balance", 402)
    const res = await dispatch(undefined as never, "run", {
      provider: "p",
      endpoint: "/e",
      input: {},
    })
    expect(res.isError).toBe(true)
    expect(res.content[0].text).toMatch(/Gateway error/)
    expect(res.content[0].text).toMatch(/402/)
  })

  it("returns isError on API 5xx (does not throw)", async () => {
    mockFetch("boom", 500)
    const res = await dispatch(undefined as never, "discover", { query: "x" })
    expect(res.isError).toBe(true)
    expect(res.content[0].text).toMatch(/500/)
  })

  it("returns isError on fetch network failure", async () => {
    const m = vi.fn().mockRejectedValue(new Error("ECONNREFUSED"))
    ;(globalThis as { fetch: unknown }).fetch = m
    const res = await dispatch(undefined as never, "balance", {})
    expect(res.isError).toBe(true)
    expect(res.content[0].text).toMatch(/ECONNREFUSED/)
  })

  it("returns isError for unknown tool name", async () => {
    const res = await dispatch(undefined as never, "bogus_tool", {})
    expect(res.isError).toBe(true)
    expect(res.content[0].text).toMatch(/Unknown tool/)
  })
})
