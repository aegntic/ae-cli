import { Hono } from "hono"
import { db } from "../db/index.js"
import { tools } from "../db/schema.js"

export const discoverRoute = new Hono()

discoverRoute.get("/discover", async (c) => {
  const q = c.req.query("q") || ""
  const limitStr = c.req.query("limit")
  const minScoreStr = c.req.query("minScore")

  const limit = limitStr ? parseInt(limitStr, 10) : 10
  const minScore = minScoreStr ? parseFloat(minScoreStr) : 0.1

  // Fetch all tools
  let results = await db.select().from(tools)

  let formattedResults = results.map((tool) => {
    let score = 0.9 // Default score if no query
    if (q) {
      score = 0
      const searchTerms = q.toLowerCase().split(/\s+/)
      const provider = tool.provider.toLowerCase()
      const path = tool.path.toLowerCase()
      const desc = tool.description.toLowerCase()

      for (const term of searchTerms) {
        if (provider.includes(term) || path.includes(term)) {
          score += 0.5
        }
        if (desc.includes(term)) {
          score += 0.3
        }
      }
      score = Math.min(score, 1.0)
    }
    return {
      provider: tool.provider,
      path: tool.path,
      description: tool.description,
      inputSchema: tool.inputSchema as any,
      costModel: tool.costModel as any,
      verified: tool.verified,
      relevanceScore: score,
    }
  })

  if (q) {
    formattedResults = formattedResults
      .filter((t) => (t.relevanceScore || 0) >= minScore)
      .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
  }

  const slicedResults = formattedResults.slice(0, limit)

  return c.json({
    data: {
      results: slicedResults,
      total: slicedResults.length,
      query: q,
    },
    requestId: Math.random().toString(36).substring(7),
  })
})
