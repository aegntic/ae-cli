import { Hono } from "hono"
import type { Context } from "hono"
import { nanoid } from "nanoid"
import { searchCatalog } from "../catalog.js"
import type { Env } from "../types.js"
import type { DiscoverResponse, HintsBlock, ApiResponse } from "@aegntic/sdk"

export const discoverRoute = new Hono<Env>()

// Discovery is an idempotent read; accept both GET (CLI default) and POST
// (agents/SDKs that prefer not to encode a query body in the URL). Backed by
// the persisted tools catalog (Postgres full-text search with ILIKE fallback)
// — replaces the in-memory registry search.
const handleDiscover = async (c: Context) => {
  const q = c.req.query("q") ?? ""
  const limit = Math.min(Number(c.req.query("limit")) || 10, 50)
  const minScore = Number(c.req.query("minScore")) || 0

  if (!q.trim()) {
    return c.json({ error: "Query parameter 'q' is required" }, 400)
  }

  const results = (await searchCatalog(q, limit, minScore))
    .filter((e) => (e.relevanceScore ?? 0) >= minScore)
    .slice(0, limit)

  const hints: HintsBlock = {
    nextCommands: results.length > 0
      ? [
          `aegntic inspect --provider ${results[0].provider} --endpoint ${results[0].path}`,
          `aegntic run ${results[0].provider}/${results[0].path} --input '{}'`,
        ]
      : ["Try a broader search term"],
    relatedEndpoints: results.slice(0, 3).map((e) => `${e.provider}/${e.path}`),
    caveats: results.length === 0 ? ["No matching endpoints found. Try different keywords."] : undefined,
  }

  const response: ApiResponse<DiscoverResponse> = {
    data: { results, total: results.length, query: q },
    hints,
    requestId: nanoid(8),
  }

  return c.json(response)
}

discoverRoute.get("/discover", handleDiscover)
discoverRoute.post("/discover", handleDiscover)
