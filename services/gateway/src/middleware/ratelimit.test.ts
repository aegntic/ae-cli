import { describe, test, expect } from "vitest"
import type { Context, Next } from "hono"
import { createRateLimiter } from "./ratelimit.js"
import type { Env } from "../types.js"

/**
 * Pure unit tests for the per-workspace rate limiter — no DB, no HTTP.
 * Drives the factory with a small limit (max=3) and a controllable clock so we
 * can assert the fixed-window allow/deny boundary, the X-RateLimit-* headers,
 * and that a new window resets the counter.
 */

type JsonResp = { __json: true; status: number; body: unknown }

function makeContext(ws: { id: string } | null) {
  const headers: Record<string, string> = {}
  return {
    get: () => ws,
    header: (k: string, v: string) => {
      headers[k] = v
    },
    json: (body: unknown, status: number): JsonResp => ({
      __json: true,
      status,
      body,
    }),
    _headers: headers,
  }
}

async function call(
  limiter: ReturnType<typeof createRateLimiter>,
  ws: { id: string } | null,
): Promise<{ passed: boolean; resp?: JsonResp; headers: Record<string, string> }> {
  const ctx = makeContext(ws)
  let nextCount = 0
  const next: Next = async () => {
    nextCount++
  }
  const resp = (await limiter(ctx as unknown as Context<Env>, next)) as
    | JsonResp
    | undefined
  return { passed: nextCount === 1, resp, headers: ctx._headers }
}

describe("rate limiter", () => {
  test("allows up to max within a window, then 429s", async () => {
    let t = 1_000_000
    const limiter = createRateLimiter({ max: 3, windowMs: 60_000, now: () => t })
    const ws = { id: "ws-allow" }

    const r1 = await call(limiter, ws)
    expect(r1.passed).toBe(true)
    expect(r1.headers["X-RateLimit-Limit"]).toBe("3")
    expect(r1.headers["X-RateLimit-Remaining"]).toBe("2")

    t += 1
    const r2 = await call(limiter, ws)
    expect(r2.passed).toBe(true)
    expect(r2.headers["X-RateLimit-Remaining"]).toBe("1")

    t += 1
    const r3 = await call(limiter, ws)
    expect(r3.passed).toBe(true)
    expect(r3.headers["X-RateLimit-Remaining"]).toBe("0")

    // 4th call in the same window -> denied.
    t += 1
    const r4 = await call(limiter, ws)
    expect(r4.passed).toBe(false)
    expect(r4.resp?.status).toBe(429)
    expect(r4.headers["X-RateLimit-Remaining"]).toBe("0")
    expect(Number(r4.headers["Retry-After"])).toBeGreaterThan(0)
  })

  test("new window resets the counter", async () => {
    let t = 5_000_000
    const limiter = createRateLimiter({ max: 2, windowMs: 60_000, now: () => t })
    const ws = { id: "ws-reset" }

    await call(limiter, ws)
    t += 1
    await call(limiter, ws)
    t += 1
    const denied = await call(limiter, ws)
    expect(denied.resp?.status).toBe(429)

    // Advance past the window boundary -> allowed again, fresh bucket.
    t += 60_000
    const after = await call(limiter, ws)
    expect(after.passed).toBe(true)
    expect(after.headers["X-RateLimit-Remaining"]).toBe("1")
  })

  test("buckets are isolated per workspace", async () => {
    let t = 9_000_000
    const limiter = createRateLimiter({ max: 1, windowMs: 60_000, now: () => t })
    const a = await call(limiter, { id: "ws-a" })
    expect(a.passed).toBe(true)
    const b = await call(limiter, { id: "ws-b" })
    expect(b.passed).toBe(true)
    // ws-a's bucket is exhausted independently.
    t += 1
    const a2 = await call(limiter, { id: "ws-a" })
    expect(a2.resp?.status).toBe(429)
  })

  test("passes through when no workspace is set", async () => {
    let t = 1
    const limiter = createRateLimiter({ max: 1, windowMs: 60_000, now: () => t })
    const r = await call(limiter, null)
    expect(r.passed).toBe(true)
  })
})
