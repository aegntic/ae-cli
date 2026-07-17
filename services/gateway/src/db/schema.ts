import { pgTable, text, integer, boolean, timestamp, jsonb, primaryKey } from "drizzle-orm/pg-core"

export const workspaces = pgTable("workspaces", {
  id: text("id").primaryKey(), // nanoid
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const apiKeys = pgTable("api_keys", {
  id: text("id").primaryKey(), // nanoid
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  prefix: text("prefix").notNull(),
  keyHash: text("key_hash").notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastUsedAt: timestamp("last_used_at"),
})

export const balanceLedger = pgTable("balance_ledger", {
  id: text("id").primaryKey(), // nanoid
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  deltaCents: integer("delta_cents").notNull(), // positive for deposit, negative for charge/refund
  type: text("type").notNull(), // "deposit", "charge", "refund"
  description: text("description"),
  jobId: text("job_id"), // if associated with a job run
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const tools = pgTable("tools", {
  provider: text("provider").notNull(),
  path: text("path").notNull(),
  description: text("description").notNull(),
  inputSchema: jsonb("input_schema").notNull(), // InputSchema typed
  costModel: jsonb("cost_model").notNull(), // CostModel typed
  verified: boolean("verified").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  primaryKey({ columns: [table.provider, table.path] })
])

export const jobs = pgTable("jobs", {
  id: text("id").primaryKey(), // nanoid or uuid
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  provider: text("provider").notNull(),
  endpoint: text("endpoint").notNull(),
  input: jsonb("input").notNull(), // RunInput typed
  status: text("status").notNull(), // RunStatus
  result: jsonb("result"),
  resultUri: text("result_uri"),
  cost: jsonb("cost"), // CostBreakdown typed
  error: text("error"),
  stoppable: boolean("stoppable").default(false).notNull(),
  idempotencyKey: text("idempotency_key"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})
