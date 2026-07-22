import { describe, test, expect, beforeEach } from "vitest"
import { nanoid } from "nanoid"
import { createHash } from "node:crypto"
import postgres from "postgres"
import { eq } from "drizzle-orm"
import { drizzle } from "drizzle-orm/postgres-js"
import { db, schema } from "../db/client.js"
import { createApp } from "../app.js"
import { getBalance, lookupWorkspaceByToken } from "../store.js"
import { __testResetLimiters } from "./signup.js"

/**
 * Signup flow tests. Requires the dockerized postgres (aegntic-pg :5435) or
 * DATABASE_URL pointing at a live DB with the 0004 signup_otps migration applied.
 *
 * The OTP is hashed server-side and never returned, so confirm-path tests
 * insert a known OTP row directly (hashCode(KNOWN)) rather than depending on
 * mail delivery.
 *
 * Read-back NOTE: the gateway's shared `postgres` pool (`max: 10`) can hand a
 * read to a pooled connection serving a momentarily-stale snapshot right after
 * a write committed on a different pooled connection (a known porsager/postgres
 * quirk under rapid read-after-write). Writes are durable (verified by id);
 * to assert on them deterministically we read back through a throwaway
 * `postgres` connection (`freshDb`) which always sees committed state. Writes
 * (seed inserts, cleanups) still go through the shared `db`. Each test uses a
 * unique email and cleans up the workspace it creates (workspaces delete
 * cascades to api_keys + balance_ledger).
 */

function hashCode(code: string): string {
  return createHash("sha256").update(code).digest("hex")
}

const KNOWN_CODE = "123456"
const DB_URL =
  process.env.DATABASE_URL ?? "postgresql://aegntic:aegntic@localhost:5435/aegntic"

function freshDb() {
  // A single-connection client closed by the caller; guarantees read-committed
  // visibility of writes committed elsewhere in the pool.
  return drizzle(postgres(DB_URL), { schema, casing: "snake_case" })
}

/**
 * Lowercase-only test email. The route normalizes (lowercases) the address on
 * BOTH request-store and confirm-lookup, so test emails MUST be lowercase to
 * round-trip — nanoid's default mixed-case alphabet would otherwise seed an
 * uppercase row the lowercased confirm query never matches.
 */
function uniqueEmail(): string {
  return `signup-test-${nanoid(8).toLowerCase()}@example.com`
}

async function otpRow(email: string) {
  const f = freshDb()
  try {
    return await f
      .select()
      .from(schema.signupOtps)
      .where(eq(schema.signupOtps.email, email))
  } finally {
    await f.$client.end()
  }
}

async function otpRowById(id: number) {
  const f = freshDb()
  try {
    return await f
      .select()
      .from(schema.signupOtps)
      .where(eq(schema.signupOtps.id, id))
  } finally {
    await f.$client.end()
  }
}

/** Insert (or replace) a known OTP row for an email, returning its row id. */
async function seedOtp(
  email: string,
  opts: { code?: string; ttlMinutes?: number; attempts?: number } = {},
): Promise<number> {
  const code = opts.code ?? KNOWN_CODE
  const ttl = opts.ttlMinutes ?? 10
  const inserted = await db
    .insert(schema.signupOtps)
    .values({
      email,
      codeHash: hashCode(code),
      expiresAt: new Date(Date.now() + ttl * 60_000),
      attempts: opts.attempts ?? 0,
    })
    .returning({ id: schema.signupOtps.id })
  return inserted[0]!.id
}

async function cleanupEmailOtps(email: string) {
  await db.delete(schema.signupOtps).where(eq(schema.signupOtps.email, email))
}

async function cleanupWorkspace(id: string) {
  await db.delete(schema.workspaces).where(eq(schema.workspaces.id, id))
}

const app = createApp()

async function signupConfirm(
  email: string,
  code: string,
  ipSuffix = 1,
): Promise<Response> {
  return app.request("/v1/signup/confirm", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Forwarded-For": `10.0.${Math.floor(ipSuffix / 256) % 256}.${ipSuffix % 256}`,
    },
    body: JSON.stringify({ email, code }),
  })
}

beforeEach(() => {
  // In-memory IP/email limiters are module-global; reset between cases so the
  // per-IP cap (5/min) and per-email cooldown (1/min) don't bleed across tests.
  __testResetLimiters()
})

describe("POST /v1/signup/request", () => {
  test("accepts a valid email and returns { sent: true }", async () => {
    const email = uniqueEmail()
    try {
      const res = await app.request("/v1/signup/request", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Forwarded-For": "10.0.0.1" },
        body: JSON.stringify({ email }),
      })
      expect(res.status).toBe(200)
      expect(await res.json()).toEqual({ sent: true })

      // A hashed OTP row was stored (code is never plaintext in the DB).
      const rows = await otpRow(email)
      expect(rows).toHaveLength(1)
      expect(rows[0]!.codeHash).toHaveLength(64) // sha256 hex
      expect(rows[0]!.consumedAt).toBeNull()
      expect(rows[0]!.attempts).toBe(0)
    } finally {
      await cleanupEmailOtps(email)
    }
  })

  test("rejects an invalid email with 400", async () => {
    const res = await app.request("/v1/signup/request", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Forwarded-For": "10.0.0.2" },
      body: JSON.stringify({ email: "not-an-email" }),
    })
    expect(res.status).toBe(400)
  })

  test("honeypot field silently succeeds without storing an OTP", async () => {
    const email = uniqueEmail()
    try {
      const res = await app.request("/v1/signup/request", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Forwarded-For": "10.0.0.3" },
        body: JSON.stringify({ email, _company: "Acme Corp" }),
      })
      // Looks successful to a bot...
      expect(res.status).toBe(200)
      expect(await res.json()).toEqual({ sent: true })

      // ...but performed no work: no OTP row (poll, but it should stay empty).
      const rows = await otpRow(email)
      expect(rows).toHaveLength(0)
    } finally {
      await cleanupEmailOtps(email)
    }
  })

  test("per-email resend cooldown returns 429", async () => {
    const email = uniqueEmail()
    try {
      const first = await app.request("/v1/signup/request", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Forwarded-For": "10.0.0.4" },
        body: JSON.stringify({ email }),
      })
      expect(first.status).toBe(200)

      const second = await app.request("/v1/signup/request", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Forwarded-For": "10.0.0.4" },
        body: JSON.stringify({ email }),
      })
      expect(second.status).toBe(429)
    } finally {
      await cleanupEmailOtps(email)
    }
  })
})

describe("POST /v1/signup/confirm", () => {
  test("happy path: creates workspace + key + free test credit", async () => {
    const email = uniqueEmail()
    await seedOtp(email)
    let workspaceId = ""
    try {
      const res = await signupConfirm(email, KNOWN_CODE)
      expect(res.status).toBe(201)

      const json = (await res.json()) as { data: { workspaceId: string; apiKey: string } }
      expect(json.data.apiKey).toMatch(/^aegntic_live_/)
      workspaceId = json.data.workspaceId
      expect(workspaceId).toMatch(/^ws_/)

      // The returned key authenticates and resolves to this workspace.
      const ws = await lookupWorkspaceByToken(json.data.apiKey)
      expect(ws?.id).toBe(workspaceId)

      // Free test credit landed as a (signed, chain-sealed) topup row.
      const bal = await getBalance(workspaceId)
      expect(bal.balance).toBeGreaterThan(0)

      // The OTP was consumed (single-use).
      const rows = await otpRow(email)
      expect(rows[0]!.consumedAt).not.toBeNull()
    } finally {
      await cleanupEmailOtps(email)
      if (workspaceId) await cleanupWorkspace(workspaceId)
    }
  })

  test("double-confirm with a consumed code does not double-provision", async () => {
    const email = uniqueEmail()
    await seedOtp(email)
    let workspaceId = ""
    try {
      const first = await signupConfirm(email, KNOWN_CODE)
      expect(first.status).toBe(201)
      workspaceId = ((await first.json()) as { data: { workspaceId: string } }).data.workspaceId

      // Same code again — the OTP is consumed, so latestOtp() finds nothing and
      // the (now enumeration-resistant) no-active-code path returns 400 with the
      // generic wrong-code message. No second workspace is created.
      const second = await signupConfirm(email, KNOWN_CODE, 2)
      expect(second.status).toBe(400)
    } finally {
      await cleanupEmailOtps(email)
      if (workspaceId) await cleanupWorkspace(workspaceId)
    }
  })

  test("wrong code returns 400 and does not consume the OTP", async () => {
    const email = uniqueEmail()
    const otpId = await seedOtp(email)
    try {
      const res = await signupConfirm(email, "000000")
      expect(res.status).toBe(400)

      const rows = await otpRowById(otpId)
      expect(rows[0]!.consumedAt).toBeNull()
      expect(rows[0]!.attempts).toBe(1)
    } finally {
      await cleanupEmailOtps(email)
    }
  })

  test("brute-force cap burns the code after MAX_OTP_ATTEMPTS wrong tries", async () => {
    const email = uniqueEmail()
    const otpId = await seedOtp(email)
    try {
      // Attempts 1-4: 400, still live. Each from a distinct IP so the per-IP
      // limiter (5/min) doesn't itself 429 before the OTP cap is reached.
      for (let i = 0; i < 4; i++) {
        const res = await signupConfirm(email, "000000", 10 + i)
        expect(res.status).toBe(400)
      }
      // 5th wrong attempt burns the code -> 429.
      const fifth = await signupConfirm(email, "000000", 20)
      expect(fifth.status).toBe(429)

      const rows = await otpRowById(otpId)
      expect(rows[0]!.consumedAt).not.toBeNull()

      // Even the correct code can no longer provision (OTP consumed -> the
      // generic no-active-code path, indistinguishable from a wrong code).
      const correct = await signupConfirm(email, KNOWN_CODE, 21)
      expect(correct.status).toBe(400)
    } finally {
      await cleanupEmailOtps(email)
    }
  })

  test("expired code returns 410 and is consumed", async () => {
    const email = uniqueEmail()
    const otpId = await seedOtp(email, { ttlMinutes: -1 }) // already expired
    try {
      const res = await signupConfirm(email, KNOWN_CODE)
      expect(res.status).toBe(410)

      const rows = await otpRowById(otpId)
      expect(rows[0]!.consumedAt).not.toBeNull()
    } finally {
      await cleanupEmailOtps(email)
    }
  })

  test("malformed code (not 6 digits) returns 400", async () => {
    const email = uniqueEmail()
    await seedOtp(email)
    try {
      const res = await signupConfirm(email, "abc")
      expect(res.status).toBe(400)
    } finally {
      await cleanupEmailOtps(email)
    }
  })
})
