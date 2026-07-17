import { describe, it, expect, vi, beforeEach } from "vitest"
import { AegnticClient } from "../src/index"

describe("AegnticClient", () => {
  const client = new AegnticClient({
    baseUrl: "http://localhost:3100",
    apiKey: "test_key",
  })

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it("should perform discover requests", async () => {
    const mockResponse = { data: { results: [], total: 0, query: "test" } }
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response)
    )

    const res = await client.discover("test", 10, 0.5)
    expect(res).toEqual(mockResponse)
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3100/v1/discover?q=test&limit=10&minScore=0.5",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          "Authorization": "Bearer test_key",
        }),
      })
    )
  })
})
