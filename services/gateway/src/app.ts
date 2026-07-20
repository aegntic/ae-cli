import { Hono } from "hono"
import { cors } from "hono/cors"
import { logger } from "hono/logger"
import { nanoid } from "nanoid"
import { discoverRoute } from "./routes/discover.js"
import { inspectRoute } from "./routes/inspect.js"
import { runsRoute } from "./routes/runs.js"
import { balanceRoute } from "./routes/balance.js"
import { keysRoute } from "./routes/keys.js"
import { reliabilityRoute } from "./routes/reliability.js"
import { stripeRoute, handleStripeWebhook } from "./routes/stripe.js"
import { authMiddleware } from "./middleware/auth.js"
import { rateLimitMiddleware } from "./middleware/ratelimit.js"
import {
  getReliabilityStats,
  PUBLIC_LEADERBOARD_MIN_CALLS,
} from "./reliability.js"
import type { Env } from "./types.js"

export function createApp(): Hono<Env> {
  const app = new Hono<Env>()

  // Restrict CORS to the configured web origin (default = local dev server).
  // Prod sets CORS_ORIGIN to the Vercel web URL. Bearer-token auth means a wide
  // origin is low-risk, but we still narrow it to the known frontend.
  const allowedOrigin = process.env.CORS_ORIGIN ?? "http://localhost:3000"
  app.use("*", cors({ origin: allowedOrigin }))
  app.use("*", logger())

  app.get("/health", (c) => c.json({ status: "ok", version: "0.1.0" }))

  // PUBLIC (no auth) — mounted before the /v1/* authMiddleware.
  app.get("/leaderboard", async (c) => {
    const all = await getReliabilityStats()
    const tools = all
      .filter((s) => s.totalCalls >= PUBLIC_LEADERBOARD_MIN_CALLS)
      .map((s) => ({
        provider: s.provider,
        endpoint: s.endpoint,
        description: s.description,
        verified: s.verified,
        totalCalls: s.totalCalls,
        successRate: s.successRate,
        p50Latency: s.p50Latency,
        p95Latency: s.p95Latency,
        avgItemCount: s.avgItemCount,
        lastCallAt: s.lastCallAt,
      }))

    return c.json({
      generatedAt: new Date().toISOString(),
      tools,
      disclaimer:
        "Reliability stats are aggregated from live provider calls. " +
        `Tools with fewer than ${PUBLIC_LEADERBOARD_MIN_CALLS} calls are omitted ` +
        "as low-sample rates are not statistically meaningful. Rates are not a guarantee.",
      requestId: nanoid(8),
    })
  })

  // Stripe webhook — PUBLIC (no auth), Stripe sends its own signature.
  app.post("/v1/stripe/webhook", handleStripeWebhook)

  app.use("/v1/*", authMiddleware)
  // Rate limit runs AFTER auth so it buckets per workspace.id. The Stripe
  // webhook is registered above as a terminal route, so it is NOT subject to
  // auth or rate limiting (Stripe authenticates via signature).
  app.use("/v1/*", rateLimitMiddleware)
  app.route("/v1", discoverRoute)
  app.route("/v1", inspectRoute)
  app.route("/v1", runsRoute)
  app.route("/v1", balanceRoute)
  app.route("/v1", keysRoute)
  app.route("/v1", reliabilityRoute)
  app.route("/v1", stripeRoute)

  return app
}
