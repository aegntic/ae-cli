// Load .env from CWD before any other import so credentials such as
// AEGNTIC_APIFY_TOKEN reach process.env before the provider registry and
// catalog seed run on boot. Must stay the first side-effecting import.
import "dotenv/config"
import { serve } from "@hono/node-server"
import { createApp } from "./app.js"
import { seedDefaults } from "./db/seed.js"
import { seedCatalog } from "./db/seed-catalog.js"
import { seedCldcdeSkills } from "./db/seed-cldcde.js"

// Start the server FIRST so health checks pass immediately, then seed in
// the background. Seeding failures must never block the HTTP listener.
const app = createApp()
const port = Number(process.env.PORT) || 3101

console.log(`aegntic gateway listening on :${port}`)
serve({ fetch: app.fetch, port })

// Seed in the background — non-blocking. Failures are logged but don't crash.
;(async () => {
  try {
    await seedDefaults()
    console.log("[seed] defaults ensured")
  } catch (err) {
    console.error("[seed] defaults failed (non-fatal):", err)
  }
  try {
    const n = await seedCatalog()
    console.log(`[catalog] seeded ${n} native tools`)
  } catch (err) {
    console.error("[catalog] seed failed (non-fatal):", err)
  }
  try {
    const result = await seedCldcdeSkills()
    console.log(`[catalog] cldcde: inserted ${result.inserted}, updated ${result.updated} external skills`)
  } catch (err) {
    console.error("[catalog] cldcde seed failed (non-fatal):", err)
  }
})()

export default app
