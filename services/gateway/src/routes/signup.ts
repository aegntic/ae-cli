import { Hono } from "hono"
import { nanoid } from "nanoid"
import { createHash, randomInt } from "node:crypto"
import { and, eq, isNull, desc } from "drizzle-orm"
import type { Env } from "../types.js"
import type { ApiResponse } from "@aegntic/sdk"
import { db, schema } from "../db/client.js"
import type { SignupOtpRow } from "../db/schema.js"
import { createWorkspace, createApiKey } from "../store.js"
import { appendLedgerEntry } from "../lib/ledger.js"
import { sendOtp } from "../lib/mail.js"

/**
 * Self-service signup — the only way a cold user (no workspace, no key) can
 * activate aedex. Two-step email verification:
 *
 *   POST /v1/signup/request  { email, _company? }  -> { sent: true }
 *   POST /v1/signup/confirm  { email, code, label? } -> { workspaceId, apiKey }
 *
 * MUST be mounted in app.ts BEFORE authMiddleware (public, like the Stripe
 * webhook). Grants a small spend credit, so abuse controls are load-bearing:
 * honeypot, hashed OTP, 10m expiry, single-use (consumedAt), brute-force cap,
 * per-IP + per-email rate limiting, and uniform {sent:true} so the request
 * endpoint never leaks whether an address exists.
 *
 * UX copy says "free test credit" only — NEVER the FREE_SIGNUP_CREDIT_USD
 * dollar amount (that is an internal cost knob, default $1.00).
 */
export const signupRoute = new Hono<Env>()

// ---------- tunables ----------

/** Per-signup credit amount (USD). Internal only — never surfaced in UI/email. */
const FREE_SIGNUP_CREDIT_USD = Number(process.env.FREE_SIGNUP_CREDIT_USD ?? 1)

/** OTP validity window. */
const OTP_TTL_MS = 10 * 60 * 1000
/** Wrong-code attempts before the OTP is burned and must be re-requested. */
const MAX_OTP_ATTEMPTS = 5

/** Per-IP request limit (applies to BOTH endpoints). */
const IP_RATE_MAX = 5
const IP_RATE_WINDOW_MS = 60_000
/** Per-email resend cooldown on /request. */
const EMAIL_RATE_MAX = 1
const EMAIL_RATE_WINDOW_MS = 60_000

// ---------- in-memory rate limiters ----------
//
// In-memory fixed-window, same shape as middleware/ratelimit.ts. Correct while
// the gateway is a single Fly machine (one replica). When we scale out, move
// these to Redis alongside the per-workspace limiter. Each has a test seam
// (`__reset`) so the suite can drive small windows deterministically.

type Bucket = { count: number; resetAt: number }

function makeLimiter(
  max: number,
  windowMs: number,
  now: () => number = Date.now,
) {
  const buckets = new Map<string, Bucket>()
  function take(key: string): boolean {
    const t = now()
    const b = buckets.get(key)
    if (!b || t > b.resetAt) {
      buckets.set(key, { count: 1, resetAt: t + windowMs })
      return true
    }
    b.count += 1
    return b.count <= max
  }
  take.__reset = () => buckets.clear()
  return take
}

const ipLimiter = makeLimiter(IP_RATE_MAX, IP_RATE_WINDOW_MS)
const emailLimiter = makeLimiter(EMAIL_RATE_MAX, EMAIL_RATE_WINDOW_MS)

// Exported for tests so the suite can wipe state between cases without
// restarting the module. Not part of the HTTP surface.
export const __testResetLimiters = () => {
  ipLimiter.__reset()
  emailLimiter.__reset()
}

// ---------- helpers ----------

function hashCode(code: string): string {
  return createHash("sha256").update(code).digest("hex")
}

/** Strict, conservative email validation. No display names, no quoted locals. */
const EMAIL_RE = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/

function normalizeEmail(raw: string): string | null {
  const email = raw.trim().toLowerCase()
  if (email.length === 0 || email.length > 320) return null
  return EMAIL_RE.test(email) ? email : null
}

/** Anonymous IP for rate-limiting. Falls back to a stable "anon" bucket. */
function clientIp(c: import("hono").Context<Env>): string {
  const fwd = c.req.header("x-forwarded-for")
  if (fwd) return fwd.split(",")[0]!.trim()
  const real = c.req.header("x-real-ip")
  return real ?? "anon"
}

function generateCode(): string {
  // randomInt(0, 1e6) is crypto-strong and uniformly distributed; pad to 6.
  return String(randomInt(0, 1_000_000)).padStart(6, "0")
}

/**
 * Latest unconsumed OTP row for an email. CreatedAt is monotonic via the
 * identity PK, so DESC ordering gives the most recent issued code.
 */
async function latestOtp(
  email: string,
): Promise<SignupOtpRow | undefined> {
  const rows = await db
    .select()
    .from(schema.signupOtps)
    .where(
      and(eq(schema.signupOtps.email, email), isNull(schema.signupOtps.consumedAt)),
    )
    .orderBy(desc(schema.signupOtps.id))
    .limit(1)
  return rows[0]
}

// ---------- request ----------

signupRoute.post("/signup/request", async (c) => {
  const ip = clientIp(c)
  if (!ipLimiter(ip)) {
    return c.json({ error: "Too many requests. Try again shortly." }, 429)
  }

  const body = await c.req
    .json<{ email?: string; _company?: unknown }>()
    .catch(() => ({}) as { email?: string; _company?: unknown })

  // Honeypot: any value means a bot filled the hidden field. Respond as if
  // successful so the bot cannot tell it was rejected — do no work, no OTP.
  if (body._company !== undefined && body._company !== null && body._company !== "") {
    return c.json({ sent: true })
  }

  const email = body.email !== undefined ? normalizeEmail(body.email) : null
  if (!email) {
    return c.json({ error: "A valid email is required." }, 400)
  }

  // Per-email resend cooldown.
  if (!emailLimiter(email)) {
    return c.json(
      { error: "We just sent a code to that address. Wait a minute and retry." },
      429,
    )
  }

  const code = generateCode()

  // Latest-code-wins: clear any prior unconsumed rows for this email so the
  // stored OTP is always the one we just mailed. Done before insert to avoid a
  // window where two live codes exist.
  await db
    .delete(schema.signupOtps)
    .where(
      and(
        eq(schema.signupOtps.email, email),
        isNull(schema.signupOtps.consumedAt),
      ),
    )

  await db.insert(schema.signupOtps).values({
    email,
    codeHash: hashCode(code),
    expiresAt: new Date(Date.now() + OTP_TTL_MS),
    attempts: 0,
  })

  // Best-effort delivery. sendOtp swallows transport errors so a transient
  // Resend outage degrades to "no email" rather than a 500; the stored row is
  // still verifiable. Uniform {sent:true} — do NOT vary on delivery success.
  await sendOtp(email, code)

  return c.json({ sent: true })
})

// ---------- confirm ----------

/**
 * Atomically mark an OTP consumed. Uses a conditional UPDATE that only fires
 * when the row is still unconsumed — the returned row count proves we won the
 * race against a concurrent confirm, preventing double-provisioning.
 */
async function consumeOtp(id: number): Promise<boolean> {
  const updated = await db
    .update(schema.signupOtps)
    .set({ consumedAt: new Date() })
    .where(
      and(eq(schema.signupOtps.id, id), isNull(schema.signupOtps.consumedAt)),
    )
    .returning({ id: schema.signupOtps.id })
  return updated.length > 0
}

signupRoute.post("/signup/confirm", async (c) => {
  const ip = clientIp(c)
  if (!ipLimiter(ip)) {
    return c.json({ error: "Too many requests. Try again shortly." }, 429)
  }

  const body = await c.req
    .json<{ email?: string; code?: string; label?: string }>()
    .catch(() => ({}) as { email?: string; code?: string; label?: string })

  const email = body.email !== undefined ? normalizeEmail(body.email) : null
  const code = typeof body.code === "string" ? body.code.trim() : ""
  if (!email) {
    return c.json({ error: "A valid email is required." }, 400)
  }
  if (!/^\d{6}$/.test(code)) {
    return c.json({ error: "Code must be 6 digits." }, 400)
  }

  const otp = await latestOtp(email)
  if (!otp) {
    // No issued/expired/consumed code. Return the SAME status + message as a
    // wrong code so an attacker cannot enumerate "did a code get issued for
    // this email" via response inspection.
    return c.json({ error: "That code is incorrect or no longer valid." }, 400)
  }

  // Expiry check: an expired code is Gone regardless of attempts left. This
  // only fires AFTER a code was issued, so it reveals no account information;
  // a legitimate user benefits from the explicit "request a new one" nudge.
  if (otp.expiresAt.getTime() < Date.now()) {
    await consumeOtp(otp.id)
    return c.json({ error: "That code has expired. Request a new one." }, 410)
  }

  // Correct code — provision. Verify BEFORE consume so a mismatch never burns
  // the valid code; the race-safe consumeOtp ensures single-use on success.
  if (hashCode(code) === otp.codeHash) {
    const provisioned = await consumeOtp(otp.id)
    if (!provisioned) {
      // A concurrent confirm already consumed it; do not double-provision.
      return c.json(
        { error: "That code was already used. Request a new one." },
        409,
      )
    }

    const label =
      typeof body.label === "string" && body.label.trim()
        ? body.label.trim().slice(0, 64)
        : "main"

    // Provisioning touches 3 stores (workspace, key, ledger). Wrap so an
    // internal failure never surfaces a raw stack/error to an anonymous caller.
    try {
      const workspace = await createWorkspace()
      const created = await createApiKey(workspace.id, label)

      if (FREE_SIGNUP_CREDIT_USD > 0) {
        // Workspace ledger is empty -> this becomes the genesis row (signed,
        // hash-chained). reason never reveals the amount to end users.
        await appendLedgerEntry({
          workspaceId: workspace.id,
          type: "topup",
          amount: FREE_SIGNUP_CREDIT_USD,
          currency: "USD",
          reason: "free test credit",
        })
      }

      const response: ApiResponse<{ workspaceId: string; apiKey: string }> = {
        data: { workspaceId: workspace.id, apiKey: created.key },
        hints: {
          caveats: ["Store this API key securely. It will not be shown again."],
        },
        requestId: nanoid(8),
      }
      return c.json(response, 201)
    } catch (err) {
      console.error("[signup] provisioning failed:", err)
      return c.json({ error: "Could not create your workspace. Please retry." }, 500)
    }
  }

  // Wrong code: increment attempts; burn the code at the cap.
  const nextAttempts = otp.attempts + 1
  if (nextAttempts >= MAX_OTP_ATTEMPTS) {
    await consumeOtp(otp.id)
    return c.json(
      { error: "Too many wrong attempts. Request a new code." },
      429,
    )
  }

  await db
    .update(schema.signupOtps)
    .set({ attempts: nextAttempts })
    .where(eq(schema.signupOtps.id, otp.id))

  // Matches the no-active-code message above, so the wrong-code and no-code
  // paths are indistinguishable to a prober.
  return c.json({ error: "That code is incorrect or no longer valid." }, 400)
})
