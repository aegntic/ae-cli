import { nanoid } from "nanoid"
import { createHash } from "node:crypto"
import { eq, and, desc } from "drizzle-orm"
import type {
  Workspace,
  ApiKey,
  ApiKeyCreated,
  Run,
  RunInput,
  CostBreakdown,
} from "@aegntic/sdk"
import { db, schema, computeBalance } from "./db/client.js"
import type {
  WorkspaceRow,
  ApiKeyRow,
  RunRow,
} from "./db/schema.js"

function hashKey(key: string): string {
  return createHash("sha256").update(key).digest("hex")
}

/**
 * Persistence layer — postgres-backed via Drizzle.
 *
 * All exports are async. Billing mutations go through the append-only ledger
 * (charge/refund); the live balance is DERIVED from it (see computeBalance),
 * never stored as mutable state. v1 charges synchronously on run completion
 * (no hold/reserve): an affordability check gates run creation, and the
 * actual cost is debited only on success. Concurrent-run overdraft is a
 * known limitation — hold/release ledger entries are the documented next step.
 */

// ---------- row -> domain mappers ----------

function rowToWorkspace(r: WorkspaceRow, balance: number): Workspace {
  return {
    id: r.id,
    name: r.name,
    balance,
    currency: r.currency as Workspace["currency"],
    createdAt: r.createdAt.toISOString(),
  }
}

function rowToApiKey(r: ApiKeyRow): ApiKey {
  return {
    label: r.label,
    prefix: r.prefix,
    active: r.active,
    createdAt: r.createdAt.toISOString(),
    lastUsedAt: r.lastUsedAt ? r.lastUsedAt.toISOString() : undefined,
  }
}

function rowToRun(r: RunRow): Run {
  return {
    id: r.id,
    workspaceId: r.workspaceId,
    provider: r.provider,
    endpoint: r.endpoint,
    input: r.input as RunInput,
    status: r.status as Run["status"],
    result: (r.result ?? undefined) as Run["result"],
    resultUri: r.resultUri ?? undefined,
    cost: (r.cost ?? undefined) as CostBreakdown | undefined,
    error: r.error ?? undefined,
    stoppable: r.stoppable,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }
}

// ---------- auth ----------

export async function lookupWorkspaceByToken(
  token: string,
): Promise<Workspace | undefined> {
  const hash = hashKey(token)
  const keyRows = await db
    .select()
    .from(schema.apiKeys)
    .where(and(eq(schema.apiKeys.keyHash, hash), eq(schema.apiKeys.active, true)))
    .limit(1)
  const key = keyRows[0]
  if (!key) return undefined

  await db
    .update(schema.apiKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(schema.apiKeys.id, key.id))

  const wsRows = await db
    .select()
    .from(schema.workspaces)
    .where(eq(schema.workspaces.id, key.workspaceId))
    .limit(1)
  const ws = wsRows[0]
  if (!ws) return undefined
  const bal = await computeBalance(ws.id)
  return rowToWorkspace(ws, bal.balance)
}

export async function getWorkspace(
  id: string,
): Promise<Workspace | undefined> {
  const rows = await db
    .select()
    .from(schema.workspaces)
    .where(eq(schema.workspaces.id, id))
    .limit(1)
  if (!rows[0]) return undefined
  const bal = await computeBalance(id)
  return rowToWorkspace(rows[0], bal.balance)
}

export async function getBalance(workspaceId: string): Promise<{
  balance: number
  held: number
  currency: string
}> {
  const b = await computeBalance(workspaceId)
  // held is 0 in v1 (no hold/reserve); reserved for reserve-and-settle.
  return { balance: b.balance, held: 0, currency: b.currency }
}

// ---------- ledger ----------

export async function charge(
  workspaceId: string,
  runId: string,
  amount: number,
  reason: string,
): Promise<void> {
  await db.insert(schema.balanceLedger).values({
    workspaceId,
    runId,
    type: "charge",
    amount: amount.toFixed(4),
    currency: "USD",
    reason,
  })
}

export async function refund(
  workspaceId: string,
  runId: string,
  amount: number,
  reason: string,
): Promise<void> {
  await db.insert(schema.balanceLedger).values({
    workspaceId,
    runId,
    type: "refund",
    amount: amount.toFixed(4),
    currency: "USD",
    reason,
  })
}

// ---------- api keys ----------

export async function createApiKey(
  workspaceId: string,
  label: string,
): Promise<ApiKeyCreated> {
  const key = `aegntic_live_${nanoid(32)}`
  const id = `ak_${nanoid(12)}`
  const prefix = key.slice(0, 16)
  const now = new Date()

  await db.insert(schema.apiKeys).values({
    id,
    workspaceId,
    label,
    prefix,
    keyHash: hashKey(key),
    active: true,
  })

  return { label, prefix, active: true, createdAt: now.toISOString(), key }
}

export async function listApiKeys(workspaceId: string): Promise<ApiKey[]> {
  const rows = await db
    .select()
    .from(schema.apiKeys)
    .where(eq(schema.apiKeys.workspaceId, workspaceId))
    .orderBy(desc(schema.apiKeys.createdAt))
  return rows.map(rowToApiKey)
}

export async function deleteApiKey(
  workspaceId: string,
  label: string,
): Promise<boolean> {
  const deleted = await db
    .delete(schema.apiKeys)
    .where(
      and(
        eq(schema.apiKeys.workspaceId, workspaceId),
        eq(schema.apiKeys.label, label),
      ),
    )
    .returning({ id: schema.apiKeys.id })
  return deleted.length > 0
}

// ---------- runs ----------

export async function createRun(
  workspaceId: string,
  provider: string,
  endpoint: string,
  input: RunInput,
  idempotencyKey?: string,
): Promise<Run> {
  if (idempotencyKey) {
    const existing = await db
      .select()
      .from(schema.runs)
      .where(
        and(
          eq(schema.runs.workspaceId, workspaceId),
          eq(schema.runs.idempotencyKey, idempotencyKey),
        ),
      )
      .limit(1)
    if (existing[0]) return rowToRun(existing[0])
  }

  const id = nanoid(12)
  const now = new Date()
  await db.insert(schema.runs).values({
    id,
    workspaceId,
    provider,
    endpoint,
    input,
    status: "READY",
    stoppable: true,
    idempotencyKey,
  })

  return {
    id,
    workspaceId,
    provider,
    endpoint,
    input,
    status: "READY",
    result: undefined,
    resultUri: undefined,
    cost: undefined,
    error: undefined,
    stoppable: true,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  }
}

export async function getRun(id: string): Promise<Run | undefined> {
  const rows = await db
    .select()
    .from(schema.runs)
    .where(eq(schema.runs.id, id))
    .limit(1)
  return rows[0] ? rowToRun(rows[0]) : undefined
}

type RunPatch = Partial<
  Pick<Run, "status" | "result" | "resultUri" | "cost" | "error" | "stoppable">
>

export async function updateRun(
  id: string,
  patch: RunPatch,
): Promise<Run | undefined> {
  const set: Record<string, unknown> = { updatedAt: new Date() }
  if (patch.status !== undefined) set.status = patch.status
  if (patch.result !== undefined) set.result = patch.result
  if (patch.resultUri !== undefined) set.resultUri = patch.resultUri
  if (patch.cost !== undefined) set.cost = patch.cost
  if (patch.error !== undefined) set.error = patch.error
  if (patch.stoppable !== undefined) set.stoppable = patch.stoppable

  await db.update(schema.runs).set(set).where(eq(schema.runs.id, id))
  return getRun(id)
}

export async function listRuns(
  workspaceId: string,
  limit = 50,
): Promise<Run[]> {
  const rows = await db
    .select()
    .from(schema.runs)
    .where(eq(schema.runs.workspaceId, workspaceId))
    .orderBy(desc(schema.runs.createdAt))
    .limit(limit)
  return rows.map(rowToRun)
}
