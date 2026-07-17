import { describe, it, expect } from "vitest"
import {
  canonicalEncode,
  hashPayload,
  hashLink,
  sealEntry,
  verifyEntry,
  auditChain,
  GENESIS_HASH,
  getActiveSignerPublicKey,
  type LedgerPayload,
} from "./lib/chain.js"

function samplePayload(overrides: Partial<LedgerPayload> = {}): LedgerPayload {
  return {
    id: "1", // mirrors String(row.id) for the bigint identity PK
    workspaceId: "ws_test",
    amount: "10.0000",
    type: "topup",
    currency: "USD",
    reason: "test topup",
    runId: null,
    createdAt: "2026-07-17T10:00:00.000Z",
    ...overrides,
  }
}

describe("ledger chain", () => {
  it("canonicalEncode sorts keys deterministically", () => {
    const a = canonicalEncode({ b: 1, a: 2, c: { z: 1, y: 2 } })
    const b = canonicalEncode({ c: { y: 2, z: 1 }, a: 2, b: 1 })
    expect(a).toBe('{"a":2,"b":1,"c":{"y":2,"z":1}}')
    expect(a).toBe(b)
  })

  it("hashPayload is stable for identical payloads", () => {
    expect(hashPayload(samplePayload())).toBe(hashPayload(samplePayload()))
  })

  it("hashPayload changes when any field changes", () => {
    const base = hashPayload(samplePayload())
    expect(hashPayload(samplePayload({ amount: "9.9999" }))).not.toBe(base)
    expect(hashPayload(samplePayload({ reason: "changed" }))).not.toBe(base)
    expect(hashPayload(samplePayload({ runId: "run_x" }))).not.toBe(base)
    expect(hashPayload(samplePayload({ currency: "EUR" }))).not.toBe(base)
    expect(hashPayload(samplePayload({ id: "2" }))).not.toBe(base)
  })

  it("sealEntry + verifyEntry round-trips", async () => {
    const payload = samplePayload()
    const entry = await sealEntry(payload, GENESIS_HASH)
    expect(verifyEntry(payload, entry, GENESIS_HASH)).toBe(true)
    expect(entry.signatureAlgo).toBe("ed25519")
    expect(entry.signature.length).toBe(128) // 64 bytes hex
    expect(entry.signerPublicKey).toBe(getActiveSignerPublicKey())
  })

  it("verifyEntry fails on wrong prevHash", async () => {
    const payload = samplePayload()
    const entry = await sealEntry(payload, GENESIS_HASH)
    expect(verifyEntry(payload, entry, hashLink(GENESIS_HASH, "deadbeef"))).toBe(false)
  })

  it("verifyEntry fails on tampered payload", async () => {
    const original = samplePayload()
    const entry = await sealEntry(original, GENESIS_HASH)
    const tampered = samplePayload({ amount: "99.9999" })
    expect(verifyEntry(tampered, entry, GENESIS_HASH)).toBe(false)
  })

  it("verifyEntry fails on tampered signature", async () => {
    const payload = samplePayload()
    const entry = await sealEntry(payload, GENESIS_HASH)
    const tampered = { ...entry, signature: "ff".repeat(64) }
    expect(verifyEntry(payload, tampered, GENESIS_HASH)).toBe(false)
  })

  it("auditChain passes for a correctly linked multi-entry chain", async () => {
    const p1 = samplePayload({ id: "1", createdAt: "2026-07-17T10:00:00.000Z" })
    const e1 = await sealEntry(p1, GENESIS_HASH)
    const link1 = hashLink(GENESIS_HASH, e1.payloadHash)

    const p2 = samplePayload({ id: "2", amount: "0.5000", type: "charge", runId: "run_1", createdAt: "2026-07-17T11:00:00.000Z" })
    const e2 = await sealEntry(p2, link1)

    const result = auditChain([
      { payload: p1, entry: e1 },
      { payload: p2, entry: e2 },
    ])
    expect(result.ok).toBe(true)
  })

  it("auditChain detects retroactive mutation of a historical entry", async () => {
    const p1 = samplePayload({ id: "1", createdAt: "2026-07-17T10:00:00.000Z" })
    const e1 = await sealEntry(p1, GENESIS_HASH)
    const link1 = hashLink(GENESIS_HASH, e1.payloadHash)

    const p2 = samplePayload({ id: "2", amount: "0.5000", type: "charge", runId: "run_1", createdAt: "2026-07-17T11:00:00.000Z" })
    const e2 = await sealEntry(p2, link1)

    // Tamper with p1 *after* sealing — the audit must catch the payloadHash mismatch
    const tamperedP1 = { ...p1, amount: "99999.0000" }

    const result = auditChain([
      { payload: tamperedP1, entry: e1 },
      { payload: p2, entry: e2 },
    ])
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.brokenAt).toBe(0)
      expect(result.reason).toMatch(/payloadHash mismatch/)
    }
  })

  it("auditChain detects a broken link pointer", async () => {
    const p1 = samplePayload({ id: "1", createdAt: "2026-07-17T10:00:00.000Z" })
    const e1 = await sealEntry(p1, GENESIS_HASH)
    const correctLink = hashLink(GENESIS_HASH, e1.payloadHash)

    const p2 = samplePayload({ id: "2", createdAt: "2026-07-17T11:00:00.000Z" })
    const e2 = await sealEntry(p2, correctLink)
    // Manually corrupt the prevHash pointer of e2
    const tamperedE2 = { ...e2, prevHash: GENESIS_HASH }

    const result = auditChain([
      { payload: p1, entry: e1 },
      { payload: p2, entry: tamperedE2 },
    ])
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.brokenAt).toBe(1)
  })
})
