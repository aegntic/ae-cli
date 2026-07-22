import {
  pgTable,
  text,
  numeric,
  timestamp,
  jsonb,
  boolean,
  bigint,
  integer,
  uniqueIndex,
  index,
  customType,
} from "drizzle-orm/pg-core"

// tsvector — Postgres native full-text-search type. Drizzle has no first-class
// helper, so we declare a thin customType. The tools.search_tsv column is
// maintained by a BEFORE INSERT/UPDATE trigger (see 0003_tools_catalog.sql);
// it cannot be GENERATED ALWAYS AS because array_to_string is STABLE, not
// IMMUTABLE. This type just lets selects/inserts type-check on the TS side.
const tsvector = customType<{ data: string }>({
  dataType() {
    return "tsvector"
  },
})

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
    // SHA-256 of canonical(result) — binds the signed charge entry to the
    // exact bytes returned by the provider. Nullable; populated when the
    // charge is signed (Phase 4 binds this into LedgerPayload).
    resultHash: text("result_hash"),
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
    // --- tamper-evident chain (ruvos port, additive; nullable for backfill) ---
    // SHA-256 hash-link to previous row: hashLink(prevHash, payloadHash).
    // GENESIS_HASH (64 zeros) for the first row in the workspace.
    prevHash: text("prev_hash"),
    // SHA-256 of the canonical JSON payload (all signed fields).
    payloadHash: text("payload_hash"),
    // Ed25519 signature over payloadHash. Algo tag + signature hex.
    signatureAlgo: text("signature_algo"), // "ed25519" | "ml-dsa-65" | "slh-dsa-128s"
    signature: text("signature"), // hex (64 bytes for ed25519)
    // Public key that signed this entry (hex). Workspace-level rotating key.
    signerPublicKey: text("signer_public_key"),
  },
  (t) => ({
    workspaceIdx: index("ledger_workspace_idx").on(t.workspaceId),
    runIdx: index("ledger_run_idx").on(t.runId),
  }),
)

/**
 * Per-call OUTCOME TELEMETRY — the reliability data asset.
 *
 * One row per provider execution attempt inside executeAsync(). Captures
 * wall-clock latency, success/failure, item count, and a SHA-256 of the
 * canonical result payload — the exact fields reliability-weighted routing
 * needs and CANNOT be backfilled later. Writes are ADDITIVE and purely
 * observational: they never alter the charge/refund lifecycle or the signed
 * ledger. run_events is its own table for now; Phase 4 binds resultHash +
 * itemCount into the signed LedgerPayload.
 *
 * costMicros convention: integer micro-USD = round(result.cost * 1e4). This
 * matches the ledger's numeric(14,4) "value * 1e4" representation (4 decimal
 * places of USD = 1/10th of a micro-USD cent). Storing the unit-adjusted
 * integer here keeps aggregations JOIN-free and avoids numeric/float drift
 * in the analytics path. The authoritative cost lives in balance_ledger;
 * costMicros on run_events is a denormalized copy for fast reporting.
 */
export const runEvents = pgTable(
  "run_events",
  {
    id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
    runId: text("run_id")
      .notNull()
      .references(() => runs.id, { onDelete: "cascade" }),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    // Denormalized for fast provider/endpoint aggregation without joins.
    provider: text("provider").notNull(),
    endpoint: text("endpoint").notNull(),
    // Wall time from execute start to resolve/reject.
    latencyMs: integer("latency_ms").notNull(),
    // Upstream HTTP status if known (null when not surfaced by the adapter).
    httpStatus: integer("http_status"),
    // true = provider returned without throwing.
    success: boolean("success").notNull(),
    // result.items on success.
    itemCount: integer("item_count"),
    // SHA-256 of canonical(result.data) on success — binds the outcome.
    resultHash: text("result_hash"),
    // micro-USD (cost * 1e4); null on failure. Denormalized copy of the
    // ledger charge amount; authoritative value is in balance_ledger.amount.
    costMicros: integer("cost_micros"),
    errorMessage: text("error_message"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    runIdx: index("run_events_run_idx").on(t.runId),
    providerEndpointIdx: index("run_events_provider_endpoint_idx").on(t.provider, t.endpoint),
    workspaceIdx: index("run_events_workspace_idx").on(t.workspaceId),
  }),
)

/**
 * SIGNUP OTPs — email-verified self-service signup.
 *
 * One row per issued OTP, keyed by email + createdAt. The latest unconsumed,
 * unexpired row for an email is the live code. Stored values are derived/
 * hashed — NEVER the plaintext code. Lifecycle:
 *   - request: upsert the latest row {email, codeHash, expiresAt, attempts:0}
 *   - confirm:  hash the submitted code; on mismatch increment `attempts`;
 *     at >= MAX_OTP_ATTEMPTS consume it (consumedAt set) so the code is dead
 *     and the caller must re-request. On match, consume + provision.
 *   - expiry:   `expiresAt` (now + 10m); expired rows are 410 Gone.
 *
 * `email` is the user-supplied address; we store it to look the OTP up at
 * confirm time. The OTP code itself is SHA-256 hashed like api keys — never
 * recoverable from the DB.
 */
export const signupOtps = pgTable(
  "signup_otps",
  {
    id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
    // Lowercased, trimmed at write time. Latest row wins; the route deletes any
    // prior unconsumed rows for the email before inserting the new code.
    email: text("email").notNull(),
    // SHA-256 hex of the 6-digit code, same hasher as api_keys.
    codeHash: text("code_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    attempts: integer("attempts").notNull().default(0),
    consumedAt: timestamp("consumed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    emailIdx: index("signup_otps_email_idx").on(t.email),
  }),
)

/**
 * TOOLS CATALOG — persisted, growable marketplace surface.
 *
 * Replaces the in-memory provider registry as the source of truth for
 * discover/inspect. v1 = Postgres full-text search over provider+path+
 * description+tags (the search_tsv column). v2 will add pgvector semantic
 * search over an embedding column; that needs an embedding API and is out of
 * scope here.
 *
 * Row shape mirrors the SDK Endpoint contract so the catalog is a drop-in
 * metadata source for discover/inspect. EXECUTION still goes through the
 * in-memory adapter registry (registry.getProvider(name).execute()) — the
 * catalog row is metadata only. kind=native means the adapter is registered
 * in-process; kind=external|reserved for future cldcde-backed skills.
 *
 * id is the canonical slug `${provider}/${path}`. Idempotent seed upserts on
 * id so descriptions/schemas refresh on every boot without manual migration.
 */
export const tools = pgTable(
  "tools",
  {
    id: text("id").primaryKey(),
    provider: text("provider").notNull(),
    path: text("path").notNull(),
    description: text("description").notNull(),
    inputSchema: jsonb("input_schema").notNull(),
    costModel: jsonb("cost_model").notNull(),
    verified: boolean("verified").notNull().default(false),
    tags: text("tags").array().notNull().default([]),
    kind: text("kind").notNull().default("native"),
    // Full-text indexable tsvector over provider+path+description+tags.
    // Maintained by tools_search_tsv_trigger (BEFORE INSERT/UPDATE) declared
    // in 0003_tools_catalog.sql — NOT GENERATED ALWAYS AS because
    // array_to_string is STABLE, not IMMUTABLE, which Postgres rejects for
    // STORED generated columns. Selects use raw SQL; inserts NEVER set this
    // column (the trigger computes it).
    searchTsv: tsvector("search_tsv"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    providerPathIdx: uniqueIndex("tools_provider_path_idx").on(t.provider, t.path),
    // GIN over search_tsv is declared in the hand-written migration (drizzle
    // cannot emit GIN-on-tsvector cleanly across versions and the column is
    // maintained by a trigger, not by drizzle's column model).
  }),
)

export type WorkspaceRow = typeof workspaces.$inferSelect
export type ApiKeyRow = typeof apiKeys.$inferSelect
export type RunRow = typeof runs.$inferSelect
export type LedgerRow = typeof balanceLedger.$inferSelect
export type RunEventRow = typeof runEvents.$inferSelect
export type SignupOtpRow = typeof signupOtps.$inferSelect
export type ToolRow = typeof tools.$inferSelect
