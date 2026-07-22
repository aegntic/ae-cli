import { Resend } from "resend"

/**
 * Email delivery for the self-service signup flow.
 *
 * Mirrors the lazy-client + env-guard pattern in routes/stripe.ts: constructing
 * `new Resend("")` would make a no-op client that throws on first send, so the
 * client is only built (and used) when RESEND_API_KEY is set. Call sites guard
 * with `isMailConfigured()` before calling sendOtp(); when mail is not
 * configured the OTP is still stored (so local dev + tests can read/confirm it
 * directly) — delivery simply no-ops.
 */

let _resend: Resend | null = null

function resend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY ?? "")
  }
  return _resend
}

/** True when email delivery can actually send (RESEND_API_KEY present). */
export function isMailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY)
}

/**
 * Verified "from" address. Prod should set MAIL_FROM to an address on a
 * verified Resend sending domain (e.g. noreply@aedex.ing). Dev/test fallback
 * is Resend's sandbox sender, which only delivers to the account owner.
 */
function mailFrom(): string {
  return process.env.MAIL_FROM ?? "onboarding@resend.dev"
}

/**
 * Send the signup OTP email. NEVER raises into the signup flow: if delivery
 * fails we log and swallow — the OTP row is already persisted, and surfacing
 * a transient Resend error to an anonymous caller would leak infrastructure
 * detail. The caller treats a successful request uniformly as { sent: true }.
 *
 * The code is the only dynamic value and it is a 6-digit string; it is placed
 * in the text body, never concatenated into a header or address, so there is
 * no email-header-injection surface.
 */
export async function sendOtp(email: string, code: string): Promise<void> {
  if (!isMailConfigured()) {
    // Local dev / tests: no-op. The stored OTP row is still verifiable.
    return
  }

  try {
    await resend().emails.send({
      from: mailFrom(),
      to: email,
      subject: `Your aedex verification code is ${code}`,
      html: otpEmailHtml(code),
      text: otpEmailText(code),
    })
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[mail] OTP delivery failed:", err)
  }
}

// Plain text + minimal HTML. Copy says "free test credit" only — NEVER the
// dollar amount (FREE_SIGNUP_CREDIT_USD is an internal cost knob).
function otpEmailText(code: string): string {
  return [
    "Welcome to aedex.",
    "",
    `Your verification code is ${code}.`,
    "",
    "It expires in 10 minutes. Enter it to create your workspace and get free",
    "test credit to run your first data tools.",
    "",
    "If you didn't request this, you can safely ignore this email.",
    "",
    "— The aedex team",
  ].join("\n")
}

function otpEmailHtml(code: string): string {
  return [
    "<div style=\"font-family:ui-sans-serif,system-ui,Arial,sans-serif;max-width:480px;margin:0 auto;color:#0A0A0B;\">",
    "<h1 style=\"font-size:20px;margin:0 0 16px;\">Welcome to aedex</h1>",
    `<p style=\"font-size:16px;line-height:1.5;margin:0 0 24px;\">Your verification code is</p>`,
    `<div style=\"font-family:ui-monospace,monospace;font-size:32px;font-weight:700;letter-spacing:8px;background:#E2E5E8;border:1px solid #0A0A0B;padding:16px 24px;text-align:center;margin:0 0 24px;\">${code}</div>`,
    "<p style=\"font-size:14px;line-height:1.5;color:#565B62;margin:0 0 8px;\">It expires in 10 minutes. Enter it to create your workspace and get free test credit to run your first data tools.</p>",
    "<p style=\"font-size:13px;line-height:1.5;color:#888E96;margin:24px 0 0;\">If you didn't request this, you can safely ignore this email.</p>",
    "<p style=\"font-size:13px;margin:24px 0 0;\">— The aedex team</p>",
    "</div>",
  ].join("")
}
