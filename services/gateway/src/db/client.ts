import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import { sql } from "drizzle-orm"
import * as schema from "./schema.js"

/**
 * Single shared postgres connection for the gateway process.
 * DATABASE_URL must be set (see .env.example). We default to the local
 * dockerized instance so `pnpm dev` works without ceremony.
 */
const DATABASE_URL =
  process.env.DATABASE_URL ??
  "postgresql://aegntic:aegntic@localhost:5434/aegntic"

if (!process.env.DATABASE_URL) {
  // eslint-disable-next-line no-console
  console.warn(
    `[db] DATABASE_URL unset; falling back to ${DATABASE_URL}. Set it in production.`,
  )
}

export const queryClient = postgres(DATABASE_URL, { max: 10 })

export const db = drizzle(queryClient, { schema, casing: "snake_case" })

export { schema }

/** SIGNED amount for a ledger entry, by type. Append-only ledger convention. */
export function signedAmount(type: "topup" | "charge" | "refund", amount: number): number {
  switch (type) {
    case "topup":
    case "refund":
      return amount
    case "charge":
      return -amount
  }
}

/**
 * Derive live balance from the append-only ledger.
 * balance = SUM(signed amounts). No mutable balance column exists.
 */
export async function computeBalance(workspaceId: string): Promise<{
  balance: number
  currency: string
}> {
  const rows = await db
    .select({
      total: sql`COALESCE(sum(
        CASE ${schema.balanceLedger.type}
          WHEN 'topup'  THEN ${schema.balanceLedger.amount}::numeric
          WHEN 'refund' THEN ${schema.balanceLedger.amount}::numeric
          WHEN 'charge' THEN -(${schema.balanceLedger.amount}::numeric)
        END
      ), 0)::numeric`.as("total"),
      currency: schema.balanceLedger.currency,
    })
    .from(schema.balanceLedger)
    .where(sql`${schema.balanceLedger.workspaceId} = ${workspaceId}`)
    .groupBy(schema.balanceLedger.currency)
    .limit(1)

  const row = rows[0]
  return {
    balance: row ? Number(row.total) : 0,
    currency: row?.currency ?? "USD",
  }
}
