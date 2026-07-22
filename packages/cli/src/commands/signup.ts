import { defineCommand } from "citty"
import consola from "consola"
import readline from "node:readline/promises"
import { stdin as input, stdout as output } from "node:process"
import { getConfig, saveConfig, DEFAULT_BASE_URL } from "../lib/config.js"

/**
 * `ae signup` — self-service account activation for a brand-new user.
 *
 * Walks the email-verified signup flow against the (public) gateway signup
 * endpoints, then writes the returned API key to the unified config as the
 * active "main" key. This is the only command that works with NO existing
 * credentials: it hits /v1/signup/request + /v1/signup/confirm, which are
 * mounted before the auth middleware.
 *
 * UX copy says "free test credit" only — never the dollar amount.
 */
export default defineCommand({
  meta: {
    name: "signup",
    description: "Create a workspace + API key with free test credit (email-verified)",
  },
  args: {
    email: {
      type: "string",
      description: "Email to verify. If omitted, you are prompted interactively.",
    },
    code: {
      type: "string",
      description:
        "6-digit verification code. If omitted, you are prompted after the " +
        "code is emailed. Useful for piping: `ae signup --email you@x.com --code 123456`.",
    },
    base: {
      type: "string",
      description: "Gateway base URL. Defaults to production.",
    },
  },
  async run({ args }) {
    const baseUrl = (args.base || DEFAULT_BASE_URL).replace(/\/+$/, "")
    const config = await getConfig()

    const email =
      args.email ??
      (await prompt("Email address:"))?.trim().toLowerCase()

    if (!email || !email.includes("@")) {
      consola.error("A valid email is required.")
      process.exit(1)
    }

    // Step 1 — request the code.
    consola.start(`Sending a verification code to ${email}...`)
    const reqRes = await post(`${baseUrl}/v1/signup/request`, { email })
    if (!reqRes.ok) {
      consola.ready("Could not request a code.")
      fail(reqRes)
    }
    consola.success("Verification code sent. Check your inbox (it expires in 10 minutes).")

    // Step 2 — confirm the code.
    const code =
      args.code ??
      (await prompt("Enter your 6-digit code:"))?.trim()

    if (!code || !/^\d{6}$/.test(code)) {
      consola.error("The code must be 6 digits.")
      process.exit(1)
    }

    consola.start("Verifying...")
    const confRes = await post<SignupConfirmBody>(`${baseUrl}/v1/signup/confirm`, {
      email,
      code,
    })
    const data =
      confRes.body && "data" in confRes.body ? confRes.body.data : undefined
    if (!confRes.ok || !data) {
      consola.ready("Verification failed.")
      fail(confRes)
    }

    const { workspaceId, apiKey } = data

    // Persist as the active "main" key and set the gateway so subsequent
    // commands work immediately. Preserves any existing multi-key store.
    await saveConfig({
      baseUrl,
      activeKey: "main",
      keys: { ...config.keys, main: apiKey },
    })

    consola.success("Workspace created and API key saved.")
    console.log()
    console.log(`  Workspace: ${workspaceId}`)
    console.log(`  API key:   ${apiKey}`)
    console.log()
    consola.warn("Store this key securely — it will not be shown again.")
    console.log()
    consola.info("You have free test credit to get started. Try:")
    console.log('  ae discover -q "weather"')
    console.log('  ae run openmeteo/weather/current --query \'{"lat":"52.52","lon":"13.41"}\' -w')
    console.log()
  },
})

// ---------- helpers ----------

interface SignupConfirmBody {
  data?: { workspaceId: string; apiKey: string }
}

async function post<T>(
  url: string,
  body: unknown,
): Promise<{ ok: boolean; status: number; body: T | { error?: string } | undefined }> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  const json = (await res.json().catch(() => undefined)) as
    | T
    | { error?: string }
    | undefined
  return { ok: res.ok, status: res.status, body: json }
}

function fail(res: { status: number; body: unknown }): never {
  const msg =
    (res.body as { error?: string } | undefined)?.error ??
    `Request failed with status ${res.status}`
  consola.error(msg)
  process.exit(1)
}

async function prompt(question: string): Promise<string | undefined> {
  const rl = readline.createInterface({ input, output })
  try {
    return await rl.question(question)
  } finally {
    rl.close()
  }
}
