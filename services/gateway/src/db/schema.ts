import {
  pgTable,
  text,
  numeric,
  timestamp,
  jsonb,
  boolean,
  bigint,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core"

/**
 * Canonical persistence schema for the aegntic gateway.
 *
 * Billing invariant (ADR-0005): `balanceLedger` is append-only. The live
 * workspace balance is DERIVED from it (sum of signed amounts), never stored
 * as mutable state. Entry types:
 *   - topup  (+amount)  credit added to balance
 *   - charge (-amount)  final cost debited on run completion
 *   - refund (+amount)  credit returned (e.g. partial over-estimate)
 * `hold`/`release` are reserved for future reserve-and-settle; v1 charges
 * synchronously on completion, so they are unused here.
 */

export const workspaces = pgTable("workspaces", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  currency: text("currency").notNull().default("USD"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

export const apiKeys = pgTable(
  "api_keys",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    // First 16 chars of the plaintext key, for display ("aegntic_live_...").
    prefix: text("prefix").notNull(),
    // SHA-256 of the plaintext key. Lookup is by hash, never by secret.
    keyHash: text("key_hash").notNull(),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
  },
  (t) => ({
    keyHashIdx: uniqueIndex("api_keys_key_hash_idx").on(t.keyHash),
    workspaceIdx: index("api_keys_workspace_idx").on(t.workspaceId),
  }),
)

export const runs = pgTable(
  "runs",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(),
    endpoint: text("endpoint").notNull(),
    input: jsonb("input").notNull(),
    status: text("status").notNull(),
    result: jsonb("result"),
    resultUri: text("result_uri"),
    cost: jsonb("cost"),
    error: text("error"),
    stoppable: boolean("stoppable").notNull().default(true),
    idempotencyKey: text("idempotency_key"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    workspaceIdx: index("runs_workspace_idx").on(t.workspaceId),
    idemIdx: uniqueIndex("runs_idem_idx").on(t.workspaceId, t.idempotencyKey),
  }),
)

export const balanceLedger = pgTable(
  "balance_ledger",
  {
    id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    runId: text("run_id"),
    // topup | charge | refund  (hold/release reserved, see file header)
    type: text("type").notNull(),
    amount: numeric("amount", { precision: 14, scale: 4 }).notNull(),
    currency: text("currency").notNull().default("USD"),
    reason: text("reason"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    workspaceIdx: index("ledger_workspace_idx").on(t.workspaceId),
    runIdx: index("ledger_run_idx").on(t.runId),
  }),
)

export type WorkspaceRow = typeof workspaces.$inferSelect
export type ApiKeyRow = typeof apiKeys.$inferSelect
export type RunRow = typeof runs.$inferSelect
export type LedgerRow = typeof balanceLedger.$inferSelect
