import { describe, it, expect } from "vitest"
import app from "../src/index"

describe("Gateway API", () => {
  it("should return ok on health check", async () => {
    const res = await app.request("/health")
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json).toEqual({ status: "ok", version: "0.1.0" })
  })

  it("should return 401 on protected endpoint without auth header", async () => {
    const res = await app.request("/v1/balance")
    expect(res.status).toBe(401)
  })
})
