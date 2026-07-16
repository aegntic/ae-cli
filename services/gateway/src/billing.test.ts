import { describe, test, expect } from "vitest"
import { nanoid } from "nanoid"
import { createHash } from "node:crypto"
import { eq, and } from "drizzle-orm"
import { db, schema } from "./db/client.js"
import { charge, refund, getBalance } from "./store.js"
import { createApp } from "./app.js"
import { addProvider } from "./providers/registry.js"
import type { ProviderAdapter } from "@aegntic/sdk"

/**
 * Billing test suite. Requires the dockerized postgres (aegntic-pg :5434) or
 * DATABASE_URL pointing at a live DB. Each test provisions an isolated
 * workspace and cascades its deletion on cleanup.
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
    .values({ id, name: `test ${id}`, currency: "USD" })
  await db.insert(schema.apiKeys).values({
    id: `ak_${nanoid(8)}`,
    workspaceId: id,
    label: "test",
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
  // workspaces delete cascades to api_keys, runs, balance_ledger.
  await db.delete(schema.workspaces).where(eq(schema.workspaces.id, id))
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

// A provider whose execute() always rejects. Registered once, module-global.
const failingProvider: ProviderAdapter = {
  name: "fail-test",
  endpoints: [
    {
      provider: "fail-test",
      path: "boom",
      description: "always throws — for billing-failure-path tests",
      inputSchema: {},
      costModel: { type: "per_call", unitPrice: 0.01, currency: "USD" },
      verified: false,
    },
  ],
  async execute() {
    throw new Error("intentional test failure")
  },
  async estimateCost() {
    return 0.01
  },
}
addProvider(failingProvider)

describe("append-only ledger invariants", () => {
  test("balance is derived: topup +, charge -, refund +", async () => {
    const ws = await createTestWorkspace()
    try {
      await topup(ws.id, 5.0, "test topup")
      expect((await getBalance(ws.id)).balance).toBeCloseTo(5.0, 4)

      await charge(ws.id, "run_a", 1.5, "test charge")
      expect((await getBalance(ws.id)).balance).toBeCloseTo(3.5, 4)

      await refund(ws.id, "run_a", 0.5, "test refund")
      expect((await getBalance(ws.id)).balance).toBeCloseTo(4.0, 4)
    } finally {
      await cleanupWorkspace(ws.id)
    }
  })
})

describe("failed run billing", () => {
  test("a run that fails is marked FAILED and writes NO charge row", async () => {
    const ws = await createTestWorkspace()
    const app = createApp()
    try {
      await topup(ws.id, 1.0, "test topup")
      const before = (await getBalance(ws.id)).balance

      const res = await app.request("/v1/runs", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ws.key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          provider: "fail-test",
          endpoint: "boom",
          input: {},
        }),
      })
      expect(res.status).toBe(201)
      const run = (await res.json()).data

      // executeAsync is fire-and-forget; poll until terminal.
      let status = run.status
      for (let i = 0; i < 30 && status !== "FAILED" && status !== "COMPLETED"; i++) {
        await sleep(100)
        const g = await app.request(`/v1/runs/${run.id}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${ws.key}` },
        })
        status = (await g.json()).data.status
      }

      expect(status).toBe("FAILED")

      const after = (await getBalance(ws.id)).balance
      expect(after).toBeCloseTo(before, 4) // unchanged

      const charges = await chargeRowsFor(ws.id, run.id)
      expect(charges).toHaveLength(0)
    } finally {
      await cleanupWorkspace(ws.id)
    }
  })
})
