import { nanoid } from "nanoid"
import { createHash } from "node:crypto"
import type { Workspace, ApiKey, ApiKeyCreated, Run, RunStatus, CostBreakdown } from "@aegntic/sdk"

function hashKey(key: string): string {
  return createHash("sha256").update(key).digest("hex")
}

interface BalanceRecord {
  balance: number
  held: number
}

interface StoredApiKey {
  label: string
  prefix: string
  keyHash: string
  workspaceId: string
  active: boolean
  createdAt: string
  lastUsedAt?: string
}

const DEFAULT_WORKSPACE_ID = "ws_default"

const workspaces = new Map<string, Workspace>([
  [DEFAULT_WORKSPACE_ID, {
    id: DEFAULT_WORKSPACE_ID,
    name: "Default Workspace",
    balance: 10.0,
    currency: "USD",
    createdAt: new Date().toISOString(),
  }],
])

const balances = new Map<string, BalanceRecord>([
  [DEFAULT_WORKSPACE_ID, { balance: 10.0, held: 0 }],
])

const TEST_KEY = "aegntic_test_key_123"
const TEST_KEY_HASH = hashKey(TEST_KEY)

const apiKeys = new Map<string, StoredApiKey>([
  [TEST_KEY_HASH, {
    label: "test",
    prefix: TEST_KEY.slice(0, 16),
    keyHash: TEST_KEY_HASH,
    workspaceId: DEFAULT_WORKSPACE_ID,
    active: true,
    createdAt: new Date().toISOString(),
  }],
])

const runs = new Map<string, Run>()

export function lookupWorkspaceByToken(token: string): Workspace | undefined {
  const hash = hashKey(token)
  const key = apiKeys.get(hash)
  if (!key || !key.active) return undefined
  key.lastUsedAt = new Date().toISOString()
  return workspaces.get(key.workspaceId)
}

export function getWorkspace(id: string): Workspace | undefined {
  return workspaces.get(id)
}

export function getBalance(workspaceId: string): BalanceRecord {
  return balances.get(workspaceId) ?? { balance: 0, held: 0 }
}

export function deductBalance(workspaceId: string, amount: number): void {
  const b = balances.get(workspaceId)
  if (!b) return
  b.balance -= amount
  b.held = Math.max(0, b.held - amount)
}

export function holdBalance(workspaceId: string, amount: number): void {
  const b = balances.get(workspaceId)
  if (!b) return
  b.held += amount
}

export function createApiKey(workspaceId: string, label: string): ApiKeyCreated {
  const key = `aegntic_live_${nanoid(32)}`
  const kHash = hashKey(key)
  const prefix = key.slice(0, 16)
  const now = new Date().toISOString()

  apiKeys.set(kHash, {
    label,
    prefix,
    keyHash: kHash,
    workspaceId,
    active: true,
    createdAt: now,
  })

  return { label, prefix, active: true, createdAt: now, key }
}

export function listApiKeys(workspaceId: string): ApiKey[] {
  const result: ApiKey[] = []
  for (const k of apiKeys.values()) {
    if (k.workspaceId === workspaceId) {
      result.push({
        label: k.label,
        prefix: k.prefix,
        active: k.active,
        createdAt: k.createdAt,
        lastUsedAt: k.lastUsedAt,
      })
    }
  }
  return result
}

export function deleteApiKey(workspaceId: string, label: string): boolean {
  for (const [hash, k] of apiKeys.entries()) {
    if (k.workspaceId === workspaceId && k.label === label) {
      apiKeys.delete(hash)
      return true
    }
  }
  return false
}

export function createRun(
  workspaceId: string,
  provider: string,
  endpoint: string,
  input: Run["input"],
  idempotencyKey?: string,
): Run {
  if (idempotencyKey) {
    for (const r of runs.values()) {
      if (r.workspaceId === workspaceId && (r as Run & { idempotencyKey?: string }).idempotencyKey === idempotencyKey) {
        return r
      }
    }
  }

  const run: Run & { idempotencyKey?: string } = {
    id: nanoid(12),
    workspaceId,
    provider,
    endpoint,
    input,
    status: "READY",
    stoppable: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    idempotencyKey,
  }
  runs.set(run.id, run)
  return run
}

export function getRun(id: string): Run | undefined {
  return runs.get(id)
}

export function updateRun(id: string, patch: Partial<Pick<Run, "status" | "result" | "cost" | "error" | "stoppable">>): Run | undefined {
  const run = runs.get(id)
  if (!run) return undefined
  Object.assign(run, patch, { updatedAt: new Date().toISOString() })
  return run
}

export function listRuns(workspaceId: string, limit = 50): Run[] {
  const result: Run[] = []
  for (const r of runs.values()) {
    if (r.workspaceId === workspaceId) result.push(r)
  }
  result.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  return result.slice(0, limit)
}
