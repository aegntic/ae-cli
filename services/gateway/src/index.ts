import { serve } from "@hono/node-server"
import { createApp } from "./app.js"
import { seedDefaults } from "./db/seed.js"
import { seedCatalog } from "./db/seed-catalog.js"

// Ensure the dev workspace + test key + free credit exist (idempotent).
await seedDefaults()

// Persist the in-memory adapter registry into the tools catalog so discover
// and inspect serve from the database, not hardcoded endpoints. Idempotent
// upsert; safe on every boot. Failures are logged but do not block startup
// (the routes fall back to the registry if the catalog is empty).
try {
  const n = await seedCatalog()
  // eslint-disable-next-line no-console
  console.log(`[catalog] seeded ${n} native tools`)
} catch (err) {
  // eslint-disable-next-line no-console
  console.error("[catalog] seed failed; routes will serve from registry:", err)
}

const app = createApp()
const port = Number(process.env.PORT) || 3101

console.log(`aegntic gateway listening on :${port}`)

serve({ fetch: app.fetch, port })

export default app
