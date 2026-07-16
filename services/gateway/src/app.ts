import { Hono } from "hono"
import { cors } from "hono/cors"
import { logger } from "hono/logger"
import { discoverRoute } from "./routes/discover.js"
import { inspectRoute } from "./routes/inspect.js"
import { runsRoute } from "./routes/runs.js"
import { balanceRoute } from "./routes/balance.js"
import { keysRoute } from "./routes/keys.js"
import { authMiddleware } from "./middleware/auth.js"
import type { Env } from "./types.js"

/**
 * Build the Hono app. Extracted from index.ts so tests can drive it via
 * app.request() without binding a port. index.ts calls this + serve().
 */
export function createApp(): Hono<Env> {
  const app = new Hono<Env>()

  app.use("*", cors())
  app.use("*", logger())

  app.get("/health", (c) => c.json({ status: "ok", version: "0.1.0" }))

  app.use("/v1/*", authMiddleware)
  app.route("/v1", discoverRoute)
  app.route("/v1", inspectRoute)
  app.route("/v1", runsRoute)
  app.route("/v1", balanceRoute)
  app.route("/v1", keysRoute)

  return app
}
