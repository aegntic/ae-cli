import { describe, test, expect } from "vitest"
import { nanoid } from "nanoid"
import { createHash } from "node:crypto"
import { eq } from "drizzle-orm"
import { db, schema } from "./db/client.js"
import { recordRunEvent } from "./store.js"
import {
  getReliabilityStats,
  PUBLIC_LEADERBOARD_MIN_CALLS,
} from "./reliability.js"
import { createApp } from "./app.js"
import type { ReliabilityStat } from "./reliability.js"

/**
 * Reliability aggregation + leaderboard tests. Seeds run_events rows directly
 * (via recordRunEvent, the production seam) for an isolated provider×endpoint
 * pair, then asserts the aggregate SQL produces correct counts, success rate,
 * and percentile bounds. Verifies the auth boundary: `/leaderboard` is public
 * (200 without Authorization), `/v1/reliability` is authed (401 without,
 * 200 with). Uses the isolated-workspace + cascade-cleanup pattern from
 * billing.test.ts.
 *
 * NOTE: the aggregate is GLOBAL (all workspaces), so other tests' rows may be
 * visible. We assert on a unique test provider name (`reliability-test-${id}`)
 * that only this test writes to, so the assertions are isolated even though
 * the SQL scans the whole table.
 */

function hashKey(key: string): string {
  return createHash("sha256").update(key).digest("hex")
}

async function createTestWorkspace(): Promise<{ id: string; key: string }> {
  const id = `ws_t_${nanoid(8)}`
  const key = `aegntic_test_${nanoid(24)}`
  await db
    .insert(schema.workspaces)
    .values({ id, name: `reliability-test ${id}`, currency: "USD" })
  await db.insert(schema.apiKeys).values({
    id: `ak_${nanoid(8)}`,
    workspaceId: id,
    label: "reliability-test",
    prefix: key.slice(0, 16),
    keyHash: hashKey(key),
    active: true,
  })
  return { id, key }
}

async function cleanupWorkspace(id: string) {
  // workspaces delete cascades to api_keys, runs, balance_ledger, run_events.
  await db.delete(schema.workspaces).where(eq(schema.workspaces.id, id))
}

// Seed N run_events rows for the given (provider, endpoint) with specified
// latencies and success flags. Each event needs a parent run row (FK), so we
// insert one cheap placeholder run per event. provider+endpoint are unique
// to this test run so the global aggregate can be sliced cleanly.
async function seedEvents(
  workspaceId: string,
  provider: string,
  endpoint: string,
  events: Array<{ latencyMs: number; success: boolean; itemCount?: number }>,
): Promise<void> {
  for (const ev of events) {
    const runId = `run_${nanoid(10)}`
    await db.insert(schema.runs).values({
      id: runId,
      workspaceId,
      provider,
      endpoint,
      input: {},
      status: ev.success ? "COMPLETED" : "FAILED",
    })
    await recordRunEvent({
      runId,
      workspaceId,
      provider,
      endpoint,
      latencyMs: ev.latencyMs,
      success: ev.success,
      itemCount: ev.itemCount ?? null,
    })
  }
}

async function statFor(
  provider: string,
  endpoint: string,
): Promise<ReliabilityStat | undefined> {
  const all = await getReliabilityStats(provider)
  return all.find((s) => s.endpoint === endpoint)
}

describe("reliability aggregation", () => {
  test("getReliabilityStats returns totalCalls, successRate, p50<=p95 within seeded range", async () => {
    const ws = await createTestWorkspace()
    const provider = `reltest-${nanoid(6)}`
    const endpoint = "agg"
    try {
      // 5 successes + 2 failures = 7 total, 5/7 ≈ 0.714 success rate.
      // Latencies span 50–500ms so p50 and p95 must lie in that range and
      // p50 <= p95.
      await seedEvents(ws.id, provider, endpoint, [
        { latencyMs: 50, success: true, itemCount: 3 },
        { latencyMs: 80, success: true, itemCount: 4 },
        { latencyMs: 120, success: false },
        { latencyMs: 150, success: true, itemCount: 2 },
        { latencyMs: 200, success: true, itemCount: 5 },
        { latencyMs: 300, success: false },
        { latencyMs: 500, success: true, itemCount: 1 },
      ])

      const stat = await statFor(provider, endpoint)
      expect(stat).toBeDefined()
      expect(stat!.totalCalls).toBe(7)
      expect(stat!.successCount).toBe(5)
      expect(stat!.successRate).toBeCloseTo(5 / 7, 3)
      // percentile_cont returns a float within the seeded latency range.
      expect(stat!.p50Latency).toBeGreaterThanOrEqual(50)
      expect(stat!.p50Latency).toBeLessThanOrEqual(500)
      expect(stat!.p95Latency).toBeGreaterThanOrEqual(50)
      expect(stat!.p95Latency).toBeLessThanOrEqual(500)
      // p50 must not exceed p95 — the load-bearing percentile invariant.
      expect(stat!.p50Latency!).toBeLessThanOrEqual(stat!.p95Latency!)
      // avgItemCount averages only the 4 successes that carried itemCount;
      // the 2 failures + 1 success-without-itemCount contribute NULL to avg.
      // (3+4+2+5+1)/5 = 3 — the NULLs don't reduce the denominator.
      expect(stat!.avgItemCount).toBeCloseTo((3 + 4 + 2 + 5 + 1) / 5, 4)
      expect(stat!.lastCallAt).not.toBeNull()
      expect(stat!.description).toBeNull() // no catalog row → null
      expect(stat!.verified).toBeNull()
    } finally {
      await cleanupWorkspace(ws.id)
    }
  })

  test("optional provider filter scopes the aggregate to that provider", async () => {
    const ws = await createTestWorkspace()
    const providerA = `reltest-a-${nanoid(6)}`
    const providerB = `reltest-b-${nanoid(6)}`
    try {
      await seedEvents(ws.id, providerA, "ep", [
        { latencyMs: 100, success: true },
      ])
      await seedEvents(ws.id, providerB, "ep", [
        { latencyMs: 100, success: false },
      ])

      const aOnly = await getReliabilityStats(providerA)
      const bOnly = await getReliabilityStats(providerB)
      expect(aOnly.every((s) => s.provider === providerA)).toBe(true)
      expect(bOnly.every((s) => s.provider === providerB)).toBe(true)
      expect(aOnly.find((s) => s.endpoint === "ep")!.successRate).toBe(1)
      expect(bOnly.find((s) => s.endpoint === "ep")!.successRate).toBe(0)
    } finally {
      await cleanupWorkspace(ws.id)
    }
  })
})

describe("authed GET /v1/reliability", () => {
  test("returns 401 without Authorization, 200 with", async () => {
    const ws = await createTestWorkspace()
    const app = createApp()
    try {
      const provider = `reltest-auth-${nanoid(6)}`
      await seedEvents(ws.id, provider, "ep", [
        { latencyMs: 100, success: true },
      ])

      // 401 — no Authorization header.
      const noAuth = await app.request("/v1/reliability")
      expect(noAuth.status).toBe(401)

      // 200 — valid workspace key, envelope shape correct, seeded row present.
      const authed = await app.request(`/v1/reliability?provider=${provider}`, {
        headers: { Authorization: `Bearer ${ws.key}` },
      })
      expect(authed.status).toBe(200)
      const body = await authed.json()
      expect(body.data).toBeInstanceOf(Array)
      expect(body.requestId).toEqual(expect.any(String))
      const mine = body.data.find(
        (s: ReliabilityStat) => s.endpoint === "ep",
      )
      expect(mine).toBeDefined()
      expect(mine.totalCalls).toBe(1)
      expect(mine.successRate).toBe(1)
    } finally {
      await cleanupWorkspace(ws.id)
    }
  })
})

describe("public GET /leaderboard", () => {
  test("returns 200 with NO Authorization header (public)", async () => {
    const app = createApp()
    const res = await app.request("/leaderboard")
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.generatedAt).toEqual(expect.any(String))
    expect(body.tools).toBeInstanceOf(Array)
    expect(body.disclaimer).toEqual(expect.any(String))
    expect(body.requestId).toEqual(expect.any(String))
  })

  test(`a tool with < ${PUBLIC_LEADERBOARD_MIN_CALLS} calls is omitted (threshold)`, async () => {
    const ws = await createTestWorkspace()
    const app = createApp()
    const provider = `reltest-thresh-${nanoid(6)}`
    try {
      // Seed totalCalls = MIN_CALLS - 1 for endpoint "below" → must be omitted.
      // Seed totalCalls = MIN_CALLS + 1 for endpoint "above" → must appear.
      const below = PUBLIC_LEADERBOARD_MIN_CALLS - 1
      const above = PUBLIC_LEADERBOARD_MIN_CALLS + 1
      await seedEvents(
        ws.id,
        provider,
        "below",
        Array.from({ length: below }, () => ({
          latencyMs: 100,
          success: true,
        })),
      )
      await seedEvents(
        ws.id,
        provider,
        "above",
        Array.from({ length: above }, () => ({
          latencyMs: 100,
          success: true,
        })),
      )

      const res = await app.request("/leaderboard")
      expect(res.status).toBe(200)
      const body = await res.json()
      const ours = body.tools.filter(
        (t: { provider: string }) => t.provider === provider,
      )
      const endpoints = ours.map(
        (t: { endpoint: string }) => t.endpoint,
      )
      expect(endpoints).not.toContain("below")
      expect(endpoints).toContain("above")

      // The public row carries the citable fields but NOT costMicros
      // (denormalized billing detail) — cost stays on the authed side.
      const aboveRow = ours.find(
        (t: { endpoint: string }) => t.endpoint === "above",
      )
      expect(aboveRow.totalCalls).toBe(above)
      expect(aboveRow.successRate).toBe(1)
      expect(aboveRow.description).toBeNull()
      expect(aboveRow.verified).toBeNull()
      expect(aboveRow).not.toHaveProperty("avgCostMicros")
    } finally {
      await cleanupWorkspace(ws.id)
    }
  })
})
