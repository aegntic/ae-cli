import { serve } from "@hono/node-server"
import { createApp } from "./app.js"
import { seedDefaults } from "./db/seed.js"

// Ensure the dev workspace + test key + free credit exist (idempotent).
await seedDefaults()

const app = createApp()
const port = Number(process.env.PORT) || 3100

console.log(`aegntic gateway listening on :${port}`)

serve({ fetch: app.fetch, port })

export default app
