import { Hono } from "hono"
import { db } from "../db/index.js"
import { tools } from "../db/schema.js"
import { and, eq } from "drizzle-orm"

export const inspectRoute = new Hono()

inspectRoute.get("/inspect", async (c) => {
  const provider = c.req.query("provider")
  const endpoint = c.req.query("endpoint")

  if (!provider || !endpoint) {
    return c.json({ error: "Missing provider or endpoint parameter" }, 400)
  }

  const results = await db
    .select()
    .from(tools)
    .where(and(eq(tools.provider, provider), eq(tools.path, endpoint)))
    .limit(1)

  if (results.length === 0) {
    return c.json({ error: `Tool not found: ${provider}${endpoint}` }, 404)
  }

  const tool = results[0]

  const examples = []
  if (provider === "apify" && endpoint === "/apidojo/tweet-scraper") {
    examples.push({
      body: { searchTerms: ["AI agents"], maxItems: 5 }
    })
  } else if (provider === "apify" && endpoint === "/harvestapi/linkedin-post-search") {
    examples.push({
      body: { keywords: "nextjs", maxResults: 5 }
    })
  } else {
    examples.push({
      body: {}
    })
  }

  return c.json({
    data: {
      endpoint: {
        provider: tool.provider,
        path: tool.path,
        description: tool.description,
        inputSchema: tool.inputSchema as any,
        costModel: tool.costModel as any,
        verified: tool.verified,
      },
      examples,
    },
    requestId: Math.random().toString(36).substring(7),
  })
})
