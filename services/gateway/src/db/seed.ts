import { createHash } from "node:crypto"
import { sql } from "drizzle-orm"
import { db, schema } from "./client.js"
import { appendLedgerEntry } from "../lib/ledger.js"

/**
 * Idempotent dev seed.
 *   - default workspace
 *   - test API key (aegntic_test_key_123) hashed with SHA-256
 *   - $10.00 free credit as an append-only ledger topup
 *
 * Safe to run on every boot: all writes are ON CONFLICT DO NOTHING, and the
 * topup is gated on the ledger being empty for the default workspace so we
 * never double-credit.
 */
const DEFAULT_WORKSPACE_ID = "ws_default"
const TEST_KEY = "aegntic_test_key_123"

function hashKey(key: string): string {
  return createHash("sha256").update(key).digest("hex")
}

export async function seedDefaults(): Promise<void> {
  await db
    .insert(schema.workspaces)
    .values({
      id: DEFAULT_WORKSPACE_ID,
      name: "Default Workspace",
      currency: "USD",
    })
    .onConflictDoNothing({ target: schema.workspaces.id })

  await db
    .insert(schema.apiKeys)
    .values({
      id: "ak_test",
      workspaceId: DEFAULT_WORKSPACE_ID,
      label: "test",
      prefix: TEST_KEY.slice(0, 16),
      keyHash: hashKey(TEST_KEY),
      active: true,
    })
    .onConflictDoNothing({ target: schema.apiKeys.id })

  // Top up $10 only if the default workspace has no ledger activity yet.
  const existing = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(schema.balanceLedger)
    .where(sql`${schema.balanceLedger.workspaceId} = ${DEFAULT_WORKSPACE_ID}`)
  if ((existing[0]?.n ?? 0) === 0) {
    // Genesis topup: first row for the workspace, so appendLedgerEntry seals
    // it with prev_hash = GENESIS_HASH (no prior row exists).
    await appendLedgerEntry({
      workspaceId: DEFAULT_WORKSPACE_ID,
      type: "topup",
      amount: 10.0,
      currency: "USD",
      reason: "initial free credit",
    })
  }
}

// CLI runner: `pnpm --filter @aegntic/gateway db:seed`
if (import.meta.main) {
  await seedDefaults()
  // eslint-disable-next-line no-console
  console.log("[seed] default workspace + test key + $10 credit ensured")
  process.exit(0)
}
