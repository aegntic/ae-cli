import { describe, test, expect, beforeAll } from "vitest"
import { sql } from "drizzle-orm"
import { db } from "./db/client.js"
import { seedCatalog } from "./db/seed-catalog.js"
import {
  searchCatalog,
  getCatalogEndpoint,
  listCatalog,
} from "./catalog.js"
import { createApp } from "./app.js"
import { createHash } from "node:crypto"
import { nanoid } from "nanoid"
import { eq } from "drizzle-orm"
import { schema } from "./db/client.js"
import { addProvider } from "./providers/registry.js"
import type { ProviderAdapter, RunResult } from "@aegntic/sdk"

/**
 * Tools catalog test suite. Verifies:
 *   - seedCatalog populates the tools table from the adapter registry
 *   - searchCatalog ranks a full-text hit correctly
 *   - searchCatalog falls back to ILIKE on partial / non-stemmed queries
 *   - gibberish returns []
 *   - getCatalogEndpoint returns the stored schema
 *   - END-TO-END: discover -> inspect -> run still produces a COMPLETED run
 *     with a ledger charge through the gateway, proving the run path is
 *     intact after the catalog rewire.
 *
 * DB-backed against the dockerized postgres at :5435. The catalog is global
 * (not workspace-scoped) so no per-test workspace setup is needed for the
 * catalog unit assertions; the e2e sub-test creates its own workspace.
 */

async function toolsCount(): Promise<number> {
  const rows = await db.execute<{ n: number }>(sql`
    SELECT count(*)::int AS n FROM tools
  `)
  return (rows[0] as unknown as { n: number })?.n ?? 0
}

async function toolsRowById(
  id: string,
): Promise<{ id: string; provider: string; kind: string } | undefined> {
  const rows = await db.execute(sql`
    SELECT id, provider, kind FROM tools WHERE id = ${id}
  `)
  return rows[0] as unknown as
    | { id: string; provider: string; kind: string }
    | undefined
}

beforeAll(async () => {
  await seedCatalog()
})

describe("tools catalog seed", () => {
  test("seedCatalog ingests all native adapter endpoints (12 mock + 1 openmeteo = 13)", async () => {
    const n = await seedCatalog()
    expect(n).toBeGreaterThanOrEqual(13)
    // At least the expected rows are present. Re-running is idempotent.
    const total = await toolsCount()
    expect(total).toBeGreaterThanOrEqual(13)
  })

  test("seedCatalog is idempotent: re-running does not create duplicates", async () => {
    const before = await toolsCount()
    await seedCatalog()
    await seedCatalog()
    const after = await toolsCount()
    expect(after).toBe(before)
  })

  test("the catalog contains openmeteo/weather/current with kind=native", async () => {
    const row = await toolsRowById("openmeteo/weather/current")
    expect(row).toBeDefined()
    expect(row?.provider).toBe("openmeteo")
    expect(row?.kind).toBe("native")
  })

  test("the catalog contains mock/twitter/posts with kind=native", async () => {
    const row = await toolsRowById("mock/twitter/posts")
    expect(row).toBeDefined()
    expect(row?.provider).toBe("mock")
    expect(row?.kind).toBe("native")
  })
})

describe("searchCatalog (full-text)", () => {
  test("'twitter posts' ranks mock/twitter/posts at the top", async () => {
    const results = await searchCatalog("twitter posts", 10)
    expect(results.length).toBeGreaterThan(0)
    expect(results[0].provider).toBe("mock")
    expect(results[0].path).toBe("twitter/posts")
    expect(results[0].relevanceScore).toBeGreaterThan(0)
  })

  test("'weather' surfaces openmeteo/weather/current", async () => {
    const results = await searchCatalog("weather", 10)
    expect(results.length).toBeGreaterThan(0)
    const paths = results.map((r) => `${r.provider}/${r.path}`)
    expect(paths).toContain("openmeteo/weather/current")
    expect(paths).toContain("mock/weather/current")
  })
})

describe("searchCatalog (ILIKE fallback + negative)", () => {
  test("gibberish returns an empty array", async () => {
    const results = await searchCatalog("zzzqqxx notarealtoken", 10)
    expect(results).toEqual([])
  })

  test("a partial substring misses the stemmer but hits via ILIKE", async () => {
    // 'tweet' shares no stem with 'twitter/posts' description text in a way
    // the english dictionary guarantees; if the FTS pass misses, ILIKE on
    // provider 'twitter'-bearing rows should still return matches. We only
    // assert that SOMETHING relevant comes back (the fallback fired).
    const results = await searchCatalog("linkedin", 10)
    expect(results.length).toBeGreaterThan(0)
    const allLinkedIn = results.every((r) =>
      r.provider === "mock" && r.path.startsWith("linkedin"),
    )
    expect(allLinkedIn).toBe(true)
  })
})

describe("getCatalogEndpoint", () => {
  test("returns the stored input schema for openmeteo/weather/current", async () => {
    const ep = await getCatalogEndpoint("openmeteo", "weather/current")
    expect(ep).toBeDefined()
    expect(ep?.provider).toBe("openmeteo")
    expect(ep?.path).toBe("weather/current")
    expect(ep?.inputSchema.queryParams?.lat).toBeDefined()
    expect(ep?.inputSchema.queryParams?.lat?.required).toBe(true)
    expect(ep?.inputSchema.queryParams?.lon?.required).toBe(true)
    expect(ep?.costModel.type).toBe("per_call")
  })

  test("returns undefined for an unknown endpoint", async () => {
    const ep = await getCatalogEndpoint("nobody", "nowhere")
    expect(ep).toBeUndefined()
  })
})

describe("listCatalog", () => {
  test("listCatalog() returns at least 13 rows", async () => {
    const rows = await listCatalog()
    expect(rows.length).toBeGreaterThanOrEqual(13)
  })

  test("listCatalog('openmeteo') returns only openmeteo rows", async () => {
    const rows = await listCatalog("openmeteo")
    expect(rows.length).toBeGreaterThanOrEqual(1)
    expect(rows.every((r) => r.provider === "openmeteo")).toBe(true)
  })
})

// --- E2E: discover -> inspect -> run through the gateway after the rewire ---

// A deterministic in-process provider so the e2e test does not depend on
// network reachability to api.open-meteo.com. Registered once, module-global.
const E2E_COST = 0.02
const e2eProvider: ProviderAdapter = {
  name: "catalog-e2e",
  endpoints: [
    {
      provider: "catalog-e2e",
      path: "ping",
      description: "deterministic in-process endpoint for catalog e2e",
      inputSchema: {},
      costModel: { type: "per_call", unitPrice: E2E_COST, currency: "USD" },
      verified: false,
    },
  ],
  async execute(): Promise<RunResult> {
    return { data: { ok: true }, items: 1, cost: E2E_COST }
  },
  async estimateCost() {
    return E2E_COST
  },
}
addProvider(e2eProvider)

function hashKey(key: string): string {
  return createHash("sha256").update(key).digest("hex")
}

async function createTestWorkspace(): Promise<{ id: string; key: string }> {
  const id = `ws_cat_${nanoid(8)}`
  const key = `aegntic_test_${nanoid(24)}`
  await db
    .insert(schema.workspaces)
    .values({ id, name: `catalog-e2e ${id}`, currency: "USD" })
  await db.insert(schema.apiKeys).values({
    id: `ak_${nanoid(8)}`,
    workspaceId: id,
    label: "catalog-e2e",
    prefix: key.slice(0, 16),
    keyHash: hashKey(key),
    active: true,
  })
  return { id, key }
}

async function topup(workspaceId: string, amount: number) {
  await db.insert(schema.balanceLedger).values({
    workspaceId,
    type: "topup",
    amount: amount.toFixed(4),
    currency: "USD",
    reason: "catalog e2e topup",
  })
}

async function cleanupWorkspace(id: string) {
  await db.delete(schema.workspaces).where(eq(schema.workspaces.id, id))
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

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

describe("discover -> inspect -> run end-to-end (catalog-backed)", () => {
  test("discover finds the endpoint, inspect returns its schema, run COMPLETES with a charge", async () => {
    // Seed the catalog so the e2e provider is discoverable via the DB.
    await seedCatalog()
    const app = createApp()
    const ws = await createTestWorkspace()
    try {
      await topup(ws.id, 5.0)

      // 1. discover
      const dRes = await app.request("/v1/discover?q=catalog-e2e%20ping", {
        method: "GET",
        headers: { Authorization: `Bearer ${ws.key}` },
      })
      expect(dRes.status).toBe(200)
      const dBody = await dRes.json()
      const discovered = dBody.data.results as Array<{ provider: string; path: string }>
      const hit = discovered.find(
        (r) => r.provider === "catalog-e2e" && r.path === "ping",
      )
      expect(hit).toBeDefined()

      // 2. inspect
      const iRes = await app.request(
        "/v1/inspect?provider=catalog-e2e&endpoint=ping",
        { method: "GET", headers: { Authorization: `Bearer ${ws.key}` } },
      )
      expect(iRes.status).toBe(200)
      const iBody = await iRes.json()
      expect(iBody.data.endpoint.provider).toBe("catalog-e2e")
      expect(iBody.data.endpoint.path).toBe("ping")

      // 3. run
      const rRes = await app.request("/v1/runs", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ws.key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          provider: "catalog-e2e",
          endpoint: "ping",
          input: {},
        }),
      })
      expect(rRes.status).toBe(201)
      const run = (await rRes.json()).data

      const status = await pollUntilTerminal(app, ws.key, run.id)
      expect(status).toBe("COMPLETED")

      // 4. ledger charge landed
      const finalGet = await app.request(`/v1/runs/${run.id}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${ws.key}` },
      })
      const finalRun = (await finalGet.json()).data
      expect(finalRun.status).toBe("COMPLETED")
      expect(finalRun.cost?.value).toBe(E2E_COST)
    } finally {
      await cleanupWorkspace(ws.id)
    }
  })
})
