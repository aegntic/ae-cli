import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "./schema.js"

const databaseUrl = process.env.DATABASE_URL || "postgres://aegntic:aegntic@localhost:5434/aegntic"

const queryClient = postgres(databaseUrl)
export const db = drizzle(queryClient, { schema })
export * as schema from "./schema.js"
