import { db } from "./index.js"
import { workspaces, apiKeys, balanceLedger, tools } from "./schema.js"
import argon2 from "argon2"

export async function seed() {
  const existing = await db.select().from(workspaces).limit(1)
  if (existing.length > 0) {
    return
  }

  console.log("Seeding database with default workspace and test API key...")

  const wsId = "ws_default"
  await db.insert(workspaces).values({
    id: wsId,
    name: "Default Workspace",
  })

  // Default API key: aegntic_live_testkey123
  const rawKey = "aegntic_live_testkey123"
  const hash = await argon2.hash(rawKey)
  await db.insert(apiKeys).values({
    id: "ak_test",
    keyHash: hash,
    prefix: "aegntic_live_testkey",
    label: "default",
    workspaceId: wsId,
    active: true,
  })

  // Deposit $10.00
  await db.insert(balanceLedger).values({
    id: "bal_init",
    workspaceId: wsId,
    deltaCents: 1000,
    type: "deposit",
    description: "Welcome credit + test deposit",
  })

  // Seed some mock tools
  await db.insert(tools).values([
    {
      provider: "apify",
      path: "/apidojo/tweet-scraper",
      description: "Scrape tweets matching search terms or hashtags",
      verified: true,
      inputSchema: {
        body: {
          searchTerms: { type: "array", description: "Query terms", required: true },
          maxItems: { type: "number", description: "Max results", default: 10 },
        },
        bodyType: "json",
      },
      costModel: {
        type: "per_result",
        unitPrice: 2, // 2 cents per result
        currency: "USD",
      },
    },
    {
      provider: "apify",
      path: "/harvestapi/linkedin-post-search",
      description: "Search posts on LinkedIn by keywords",
      verified: true,
      inputSchema: {
        body: {
          keywords: { type: "string", description: "Search query", required: true },
          maxResults: { type: "number", description: "Max posts", default: 10 },
        },
        bodyType: "json",
      },
      costModel: {
        type: "per_result",
        unitPrice: 5, // 5 cents per result
        currency: "USD",
      },
    }
  ])

  console.log("Database seeded successfully. API Key: aegntic_live_testkey123")
}
