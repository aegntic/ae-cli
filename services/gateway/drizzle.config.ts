import { defineConfig } from "drizzle-kit"

/**
 * Drizzle Kit config — schema migrations for the gateway.
 * Generate: `pnpm --filter @aegntic/gateway db:generate`
 * Migrate:  `pnpm --filter @aegntic/gateway db:migrate`
 */
export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url:
      process.env.DATABASE_URL ??
      "postgresql://aegntic:aegntic@localhost:5434/aegntic",
  },
  strict: true,
  verbose: true,
})
