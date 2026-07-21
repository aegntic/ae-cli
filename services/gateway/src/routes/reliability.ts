import { Hono } from "hono"
import { nanoid } from "nanoid"
import { getReliabilityStats } from "../reliability.js"
import type { Env } from "../types.js"
import type { ApiResponse } from "@aegntic/sdk"
import type { ReliabilityStat } from "../reliability.js"

/**
 * Authed reliability route — mounted UNDER /v1 so it sits behind authMiddleware.
 * Returns the full set of per-(provider,endpoint) reliability stats for the
 * calling workspace's dashboard and the (future) reliability-weighted router.
 *
 * Unlike the public /leaderboard, this endpoint does NOT apply a minimum-calls
 * threshold: authenticated callers see the raw aggregate, including low-sample
 * tools, because they need accurate signal on their own usage regardless of
 * statistical significance.
 */
export const reliabilityRoute = new Hono<Env>()

reliabilityRoute.get("/reliability", async (c) => {
  const provider = c.req.query("provider")
  const stats = await getReliabilityStats(provider)

  const response: ApiResponse<ReliabilityStat[]> = {
    data: stats,
    requestId: nanoid(8),
  }

  return c.json(response)
})
