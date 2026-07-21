import { Hono } from "hono"
import { nanoid } from "nanoid"
import { asc, eq } from "drizzle-orm"
import { getBalance } from "../store.js"
import { db, schema } from "../db/client.js"
import {
  auditChain,
  type ChainEntry,
  type LedgerPayload,
  type SignatureAlgo,
} from "../lib/chain.js"
import type { Env } from "../types.js"
import type { BalanceResponse, ApiResponse } from "@aegntic/sdk"

export const balanceRoute = new Hono<Env>()

balanceRoute.get("/balance", async (c) => {
  const workspace = c.get("workspace")
  const record = await getBalance(workspace.id)

  const data: BalanceResponse = {
    balance: record.balance,
    currency: "USD",
    held: record.held,
    available: record.balance - record.held,
  }

  const response: ApiResponse<BalanceResponse> = {
    data,
    requestId: nanoid(8),
  }

  return c.json(response)
})

/**
 * GET /v1/balance/audit — verify the tamper-evident chain for the calling
 * workspace. Returns the full walk result plus chain metadata. Anyone with an
 * API key for the workspace can prove no signed entry was mutated
 * retroactively. Pre-migration rows (NULL chain fields) are skipped — they
 * belong to the unsigned genesis epoch and are reported separately.
 *
 * Payload reconstruction: the signed `id` field is `String(row.id)` (the
 * bigint PK), re-derived here deterministically. See ledger.ts header.
 */
balanceRoute.get("/balance/audit", async (c) => {
  const workspace = c.get("workspace")
  const workspaceId = workspace.id

  const rows = await db
    .select()
    .from(schema.balanceLedger)
    .where(eq(schema.balanceLedger.workspaceId, workspaceId))
    .orderBy(asc(schema.balanceLedger.id))

  if (rows.length === 0) {
    return c.json({
      data: {
        ok: true,
        entries: 0,
        unsignedLegacyEntries: 0,
        headHash: null,
        signerPublicKey: null,
      },
      requestId: nanoid(8),
    } satisfies ApiResponse<unknown>)
  }

  // Split signed rows (post-migration) from unsigned legacy rows. Only the
  // signed subset participates in the chain walk; legacy rows are reported
  // as a count so callers know the chain's genesis epoch boundary.
  const signed = rows.filter((r) => r.payloadHash !== null && r.signature !== null)
  const unsignedLegacy = rows.length - signed.length

  if (signed.length === 0) {
    return c.json({
      data: {
        ok: true,
        entries: 0,
        unsignedLegacyEntries: unsignedLegacy,
        headHash: null,
        signerPublicKey: null,
      },
      requestId: nanoid(8),
    } satisfies ApiResponse<unknown>)
  }

  const auditable = signed.map((r) => ({
    payload: {
      id: String(r.id),
      workspaceId: r.workspaceId,
      amount: r.amount,
      type: r.type,
      currency: r.currency,
      reason: r.reason,
      runId: r.runId,
      createdAt: r.createdAt.toISOString(),
    } satisfies LedgerPayload,
    entry: {
      prevHash: r.prevHash!,
      payloadHash: r.payloadHash!,
      signatureAlgo: r.signatureAlgo as SignatureAlgo,
      signature: r.signature!,
      signerPublicKey: r.signerPublicKey!,
    } satisfies ChainEntry,
  }))

  const result = auditChain(auditable)
  const last = signed[signed.length - 1]

  return c.json({
    data: {
      ...result,
      entries: signed.length,
      unsignedLegacyEntries: unsignedLegacy,
      headHash: last.payloadHash,
      signerPublicKey: last.signerPublicKey,
    },
    requestId: nanoid(8),
  } satisfies ApiResponse<unknown>)
})
