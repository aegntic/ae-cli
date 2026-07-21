/**
 * Tamper-evident append-only ledger chain.
 *
 * Ports the ruvos signed-audit design (aegntic contributor relationship; MIT):
 *   - substrate/rvf-types/src/signature.rs  → SignatureAlgo enum + SignatureFooter
 *   - substrate/rvf-manifest/src/chain.rs   → OverlayChain hash-pointer record
 *   - substrate/rvf-crypto/src/{sign,witness}.rs → Ed25519 signing + verification
 *
 * One ledger entry == one row. Each row carries:
 *   prevHash      = hash of the previous row's (prevHash || payloadHash)
 *   payloadHash   = SHA-256 of the canonical JSON payload (all fields except chain meta)
 *   signature     = Ed25519(payloadHash) by a workspace-owned signing key
 *
 * Tamper-evidence: changing any historical row breaks its payloadHash, which
 * breaks the next row's prevHash, cascading to head. Verification walks the
 * chain once and checks every signature.
 *
 * Post-quantum algos (ML-DSA-65, SLH-DSA-128s) are declared in the enum for
 * forward-compat — current implementation signs with Ed25519 only.
 */

import { sha256 } from "@noble/hashes/sha256"
import { sha512 } from "@noble/hashes/sha512"
import * as ed25519lib from "@noble/ed25519"
import { randomBytes } from "node:crypto"

// @noble/ed25519 v2 is modular — wire SHA-512 sync method once at import.
// noble/hashes sha512 expects a single Uint8Array; concatenate the chunks.
ed25519lib.etc.sha512Sync = (...msgs: Uint8Array[]) => {
  const total = msgs.reduce((n, m) => n + m.length, 0)
  const merged = new Uint8Array(total)
  let off = 0
  for (const m of msgs) {
    merged.set(m, off)
    off += m.length
  }
  return sha512(merged)
}

const { getPublicKey, signAsync, verify } = ed25519lib

export type SignatureAlgo = "ed25519" | "ml-dsa-65" | "slh-dsa-128s"

export const GENESIS_HASH = "0".repeat(64)

/**
 * Fields that get hashed+signed. Keep stable & sorted.
 * Adapted to worktree-p2's ledger schema (numeric amount + reason + runId +
 * currency); the source feat/aegntic-live branch used integer deltaCents +
 * description + jobId. The crypto layer is payload-shape-agnostic — only the
 * field set is canonicalized.
 */
export interface LedgerPayload {
  id: string
  workspaceId: string
  amount: string // numeric(14,4) serialized as string for canonical stability
  type: string // "topup" | "charge" | "refund"
  currency: string
  reason: string | null
  runId: string | null
  createdAt: string // ISO
}

export interface ChainEntry {
  prevHash: string
  payloadHash: string
  signatureAlgo: SignatureAlgo
  signature: string // hex
  signerPublicKey: string // hex
}

/** Deterministic JSON canonicalization — keys sorted, no whitespace. */
export function canonicalEncode(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value)
  if (Array.isArray(value)) return `[${value.map(canonicalEncode).join(",")}]`
  const obj = value as Record<string, unknown>
  const keys = Object.keys(obj).sort()
  return `{${keys.map((k) => `"${k}":${canonicalEncode(obj[k])}`).join(",")}}`
}

export function hashPayload(payload: LedgerPayload): string {
  return Buffer.from(sha256(Buffer.from(canonicalEncode(payload), "utf8"))).toString("hex")
}

export function hashLink(prevHash: string, payloadHash: string): string {
  return Buffer.from(sha256(Buffer.from(prevHash + payloadHash, "utf8"))).toString("hex")
}

// --- key management -------------------------------------------------------

/**
 * Persistent signing key for a workspace. Single key per workspace is the
 * current model; rotation writes a "rotation" ledger entry signed by the old
 * key and referencing the new pubkey. Loaded from env (workspace-key map) or
 * from the keystore table (future). For now: process-level key derived from
 * AEGNTIC_LEDGER_SIGNING_SEED — sufficient until per-workspace keys land.
 */

let processKeyPair: { secretKey: Uint8Array; publicKey: Uint8Array } | null = null

function getProcessKeyPair(): { secretKey: Uint8Array; publicKey: Uint8Array } {
  if (processKeyPair) return processKeyPair
  const seedHex = process.env.AEGNTIC_LEDGER_SIGNING_SEED
  if (!seedHex || seedHex.length !== 64) {
    // Generate an ephemeral key (chains minted under this key are verifiable
    // within this process lifetime; fine for dev, must be set in prod).
    const seed = randomBytes(32)
    processKeyPair = { secretKey: seed, publicKey: getPublicKey(seed) }
    // eslint-disable-next-line no-console
    console.warn(
      "[chain] AEGNTIC_LEDGER_SIGNING_SEED not set; generated ephemeral key " +
        Buffer.from(processKeyPair.publicKey).toString("hex").slice(0, 16) +
        "… — ledger entries will not be verifiable after restart.",
    )
    return processKeyPair
  }
  const seed = Buffer.from(seedHex, "hex")
  processKeyPair = { secretKey: seed, publicKey: getPublicKey(seed) }
  return processKeyPair
}

export function getActiveSignerPublicKey(): string {
  return Buffer.from(getProcessKeyPair().publicKey).toString("hex")
}

// --- chain operations -----------------------------------------------------

export async function sealEntry(
  payload: LedgerPayload,
  prevHash: string,
): Promise<ChainEntry> {
  const payloadHash = hashPayload(payload)
  const { secretKey, publicKey } = getProcessKeyPair()
  const signature = await signAsync(Buffer.from(payloadHash, "hex"), secretKey)
  return {
    prevHash,
    payloadHash,
    signatureAlgo: "ed25519",
    signature: Buffer.from(signature).toString("hex"),
    signerPublicKey: Buffer.from(publicKey).toString("hex"),
  }
}

export function verifyEntry(
  payload: LedgerPayload,
  entry: ChainEntry,
  expectedPrevHash: string,
): boolean {
  if (entry.prevHash !== expectedPrevHash) return false
  const payloadHash = hashPayload(payload)
  if (entry.payloadHash !== payloadHash) return false
  if (entry.signatureAlgo !== "ed25519") {
    // PQ algos declared but not yet implemented — verification fails closed.
    return false
  }
  const sigBytes = Buffer.from(entry.signature, "hex")
  const pubBytes = Buffer.from(entry.signerPublicKey, "hex")
  if (sigBytes.length !== 64 || pubBytes.length !== 32) return false
  // noble/ed25519 v2 signature: verify(sig, msg, pub). Coerce Buffer→Uint8Array.
  return verify(
    Uint8Array.from(sigBytes),
    Uint8Array.from(Buffer.from(payloadHash, "hex")),
    Uint8Array.from(pubBytes),
  )
}

/**
 * Walk the chain. Returns the first broken index (or null if intact).
 * O(n) in chain length — fine for thousands of entries per workspace.
 */
export function auditChain(
  rows: Array<{ payload: LedgerPayload; entry: ChainEntry }>,
): { ok: true } | { ok: false; brokenAt: number; reason: string } {
  let prev = GENESIS_HASH
  for (let i = 0; i < rows.length; i++) {
    const { payload, entry } = rows[i]
    const payloadHash = hashPayload(payload)
    if (entry.prevHash !== prev) {
      return { ok: false, brokenAt: i, reason: `prevHash mismatch at index ${i}` }
    }
    if (entry.payloadHash !== payloadHash) {
      return { ok: false, brokenAt: i, reason: `payloadHash mismatch at index ${i}` }
    }
    if (!verify(
      Uint8Array.from(Buffer.from(entry.signature, "hex")),
      Uint8Array.from(Buffer.from(payloadHash, "hex")),
      Uint8Array.from(Buffer.from(entry.signerPublicKey, "hex")),
    )) {
      return { ok: false, brokenAt: i, reason: `signature invalid at index ${i}` }
    }
    prev = hashLink(prev, payloadHash)
  }
  return { ok: true }
}
