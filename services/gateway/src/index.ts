import { Hono } from "hono"
import { cors } from "hono/cors"
import { logger } from "hono/middleware"
import { serve } from "@hono/node-server"
import { discoverRoute } from "./routes/discover.js"
import { inspectRoute } from "./routes/inspect.js"
import { runsRoute } from "./routes/runs.js"
import { balanceRoute } from "./routes/balance.js"
import { keysRoute } from "./routes/keys.js"
import { authMiddleware } from "./middleware/auth.js"

const app = new Hono()

app.use("*", cors())
app.use("*", logger())

app.get("/health", (c) => c.json({ status: "ok", version: "0.1.0" }))

app.use("/v1/*", authMiddleware)
app.route("/v1", discoverRoute)
app.route("/v1", inspectRoute)
app.route("/v1", runsRoute)
app.route("/v1", balanceRoute)
app.route("/v1", keysRoute)

const port = Number(process.env.PORT) || 3100

console.log(`aegntic gateway listening on :${port}`)

serve({ fetch: app.fetch, port })

export default app
