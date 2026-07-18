import { defineConfig } from "vitest/config"

// Vitest 3.x defaults its include glob to tests/ subdir, but the gateway
// lays out tests next to the source they cover (src/billing.test.ts,
// src/chain.test.ts, src/providers/openmeteo.test.ts). This config restores
// that layout as the discovery root.
export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    // Load services/gateway/.env so tests can read AEGNTIC_APIFY_TOKEN etc.
    // without the caller sourcing it. (Mirrors the gateway's dotenv boot.)
    setupFiles: ["dotenv/config"],
    // billing.test.ts and openmeteo.test.ts hit a real postgres; give them
    // generous timeouts for cold CI machines.
    testTimeout: 15_000,
  },
})
