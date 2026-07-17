import { describe, test, expect } from "vitest"
import { nanoid } from "nanoid"
import { createHash } from "node:crypto"
import { eq, and } from "drizzle-orm"
import { db, schema } from "./db/client.js"
import { getBalance } from "./store.js"
import { createApp } from "./app.js"
import { addProvider } from "./providers/registry.js"
import type { ProviderAdapter, RunResult } from "@aegntic/sdk"
import { canonicalEncode } from "./lib/chain.js"
import { sha256 } from "@noble/hashes/sha256"

/**
 * Per-call telemetry test suite. Verifies that executeAsync writes one
 * run_events row per attempt with the expected fields, on both the success
 * and failure branches. Uses the same isolated-workspace + cascade-cleanup
 * pattern as billing.test.ts. DB-backed against the dockerized postgres.
 *
 * The failed-run-no-charge invariant is re-asserted here from the telemetry
 * side: a failed run writes a run_events row with success=false AND zero
 * charge rows on balance_ledger.
 */

function hashKey(key: string): string {
  return createHash("sha256").update(key).digest("hex")
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function createTestWorkspace(): Promise<{ id: string; key: string }> {
  const id = `ws_t_${nanoid(8)}`
  const key = `aegntic_test_${nanoid(24)}`
  await db
    .insert(schema.workspaces)
    .values({ id, name: `telemetry-test ${id}`, currency: "USD" })
  await db.insert(schema.apiKeys).values({
    id: `ak_${nanoid(8)}`,
    workspaceId: id,
    label: "telemetry-test",
    prefix: key.slice(0, 16),
    keyHash: hashKey(key),
    active: true,
  })
  return { id, key }
}

async function topup(workspaceId: string, amount: number, reason: string) {
  await db.insert(schema.balanceLedger).values({
    workspaceId,
    type: "topup",
    amount: amount.toFixed(4),
    currency: "USD",
    reason,
  })
}

async function cleanupWorkspace(id: string) {
  // workspaces delete cascades to api_keys, runs, balance_ledger, run_events.
  await db.delete(schema.workspaces).where(eq(schema.workspaces.id, id))
}

async function runEventsFor(
  workspaceId: string,
  runId: string,
): Promise<typeof schema.runEvents.$inferSelect[]> {
  return db
    .select()
    .from(schema.runEvents)
    .where(
      and(
        eq(schema.runEvents.workspaceId, workspaceId),
        eq(schema.runEvents.runId, runId),
      ),
    )
}

async function chargeRowsFor(
  workspaceId: string,
  runId: string,
): Promise<typeof schema.balanceLedger.$inferSelect[]> {
  return db
    .select()
    .from(schema.balanceLedger)
    .where(
      and(
        eq(schema.balanceLedger.workspaceId, workspaceId),
        eq(schema.balanceLedger.type, "charge"),
        eq(schema.balanceLedger.runId, runId),
      ),
    )
}

// A provider whose execute() always succeeds with a deterministic payload.
// Registered once, module-global. The result.data shape is fixed so the
// expected SHA-256 can be computed independently in the test.
const TELEMETRY_PAYLOAD = { ok: true, items: [{ id: "a" }, { id: "b" }, { id: "c" }] }
const TELEMETRY_ITEMS = 3
const TELEMETRY_COST = 0.03

const successProvider: ProviderAdapter = {
  name: "telemetry-ok",
  endpoints: [
    {
      provider: "telemetry-ok",
      path: "echo",
      description: "always succeeds with a fixed payload — for telemetry success-path tests",
      inputSchema: {},
      costModel: { type: "per_call", unitPrice: TELEMETRY_COST, currency: "USD" },
      verified: false,
    },
  ],
  async execute(): Promise<RunResult> {
    return { data: TELEMETRY_PAYLOAD, items: TELEMETRY_ITEMS, cost: TELEMETRY_COST }
  },
  async estimateCost() {
    return TELEMETRY_COST
  },
}
addProvider(successProvider)

// A provider whose execute() always rejects. Registered once, module-global.
const failingProvider: ProviderAdapter = {
  name: "telemetry-fail",
  endpoints: [
    {
      provider: "telemetry-fail",
      path: "boom",
      description: "always throws — for telemetry failure-path tests",
      inputSchema: {},
      costModel: { type: "per_call", unitPrice: 0.01, currency: "USD" },
      verified: false,
    },
  ],
  async execute() {
    throw new Error("intentional telemetry-test failure")
  },
  async estimateCost() {
    return 0.01
  },
}
addProvider(failingProvider)

async function pollUntilTerminal(
  app: ReturnType<typeof createApp>,
  key: string,
  runId: string,
): Promise<"COMPLETED" | "FAILED"> {
  let status = "RUNNING"
  for (let i = 0; i < 30 && status !== "FAILED" && status !== "COMPLETED"; i++) {
    await sleep(100)
    const g = await app.request(`/v1/runs/${runId}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${key}` },
    })
    status = (await g.json()).data.status
  }
  return status as "COMPLETED" | "FAILED"
}

describe("run outcome telemetry", () => {
  test("a successful run writes a run_events row with success=true, itemCount, and a 64-hex resultHash", async () => {
    const ws = await createTestWorkspace()
    const app = createApp()
    try {
      await topup(ws.id, 5.0, "telemetry test topup")

      const res = await app.request("/v1/runs", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ws.key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          provider: "telemetry-ok",
          endpoint: "echo",
          input: {},
        }),
      })
      expect(res.status).toBe(201)
      const run = (await res.json()).data

      const status = await pollUntilTerminal(app, ws.key, run.id)
      expect(status).toBe("COMPLETED")

      const events = await runEventsFor(ws.id, run.id)
      expect(events).toHaveLength(1)
      const ev = events[0]
      expect(ev.success).toBe(true)
      expect(ev.itemCount).toBe(TELEMETRY_ITEMS)
      expect(ev.errorMessage).toBeNull()
      expect(ev.latencyMs).toBeGreaterThan(0)
      // resultHash: 64 lowercase hex chars, and matches an independent
      // SHA-256 of the canonical result payload.
      expect(ev.resultHash).toMatch(/^[0-9a-f]{64}$/)
      const expectedHash = Buffer.from(
        sha256(Buffer.from(canonicalEncode(TELEMETRY_PAYLOAD), "utf8")),
      ).toString("hex")
      expect(ev.resultHash).toBe(expectedHash)
      // costMicros: micro-USD (cost * 1e4), rounded.
      expect(ev.costMicros).toBe(Math.round(TELEMETRY_COST * 1e4))
      // Denormalized routing fields.
      expect(ev.provider).toBe("telemetry-ok")
      expect(ev.endpoint).toBe("echo")
      expect(ev.workspaceId).toBe(ws.id)
    } finally {
      await cleanupWorkspace(ws.id)
    }
  })

  test("a failed run writes a run_events row with success=false and errorMessage, itemCount null", async () => {
    const ws = await createTestWorkspace()
    const app = createApp()
    try {
      await topup(ws.id, 1.0, "telemetry test topup")

      const res = await app.request("/v1/runs", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ws.key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          provider: "telemetry-fail",
          endpoint: "boom",
          input: {},
        }),
      })
      expect(res.status).toBe(201)
      const run = (await res.json()).data

      const status = await pollUntilTerminal(app, ws.key, run.id)
      expect(status).toBe("FAILED")

      const events = await runEventsFor(ws.id, run.id)
      expect(events).toHaveLength(1)
      const ev = events[0]
      expect(ev.success).toBe(false)
      expect(ev.errorMessage).toBe("intentional telemetry-test failure")
      expect(ev.itemCount).toBeNull()
      expect(ev.resultHash).toBeNull()
      expect(ev.costMicros).toBeNull()
      expect(ev.latencyMs).toBeGreaterThan(0)
      expect(ev.provider).toBe("telemetry-fail")
      expect(ev.endpoint).toBe("boom")

      // FAILED-RUN-NO-CHARGE invariant (re-asserted from the telemetry side):
      // the failed run wrote a telemetry row AND zero charge rows on the
      // signed ledger. The telemetry write is observational only — it does
      // not alter the charge lifecycle.
      const before = (await getBalance(ws.id)).balance
      const charges = await chargeRowsFor(ws.id, run.id)
      expect(charges).toHaveLength(0)
      const after = (await getBalance(ws.id)).balance
      expect(after).toBeCloseTo(before, 4)
    } finally {
      await cleanupWorkspace(ws.id)
    }
  })
})
