import { defineCommand } from "citty"
import consola from "consola"

/**
 * Namecheckly real-time namespace verification + an honest, deterministic
 * engine score. The full subjective agentic loop (generate → critique →
 * 7.8 elite gate) lives in namespace-intelligence/SKILL.md for the LLM.
 * This command owns the part that must be real: live availability + a
 * defensible composite derived purely from API data (no guessing).
 */

const DEFAULT_TLDS = "com,ai,io,co"
const DEFAULT_PLATFORMS = "instagram,x,github,tiktok,youtube,linkedin"
const DEMO_KEY = "namecheckly_demo_dev_key"

interface NamechecklyResponse {
  query: string
  name: string
  domains: { domain: string; available: boolean; registerUrl: string | null }[]
  socials: { platform: string; status: string; profileUrl: string | null }[]
}

function sanitize(raw: string): string {
  return raw.toLowerCase().replace(/[^a-z0-9-]/g, "")
}

/** Deterministic composite from API data only. Subjective axes are proxied. */
function score(name: string, resp: NamechecklyResponse) {
  const domainScore = (() => {
    if (resp.domains.find((d) => d.domain.endsWith(".com") && d.available)) return 1.0
    if (resp.domains.find((d) => d.domain.endsWith(".ai") && d.available)) return 0.9
    if (resp.domains.some((d) => d.available)) return 0.7
    return 0
  })()

  const socials = resp.socials
  const freeSocials = socials.filter((s) => s.status === "available").length
  const socialFree = socials.length ? freeSocials / socials.length : 0

  const availability = 0.5 * domainScore + 0.5 * socialFree

  // Quality proxy: short, no digits, no hyphens reads as more brandable.
  let quality = name.length <= 6 ? 1.0 : name.length <= 10 ? 0.7 : name.length <= 14 ? 0.5 : 0.3
  if (/\d/.test(name)) quality *= 0.6
  if (name.includes("-")) quality *= 0.7

  const composite = Math.round((0.7 * availability + 0.3 * quality) * 100) / 10

  const comFree = resp.domains.some((d) => d.domain.endsWith(".com") && d.available)
  const aiFree = resp.domains.some((d) => d.domain.endsWith(".ai") && d.available)
  const eliteCandidate = (comFree || aiFree) && freeSocials >= 3

  return { composite, freeSocials, socialTotal: socials.length, eliteCandidate }
}

export default defineCommand({
  meta: {
    name: "namespace",
    description: "Verify domain + social handle availability and score a brand name",
  },
  args: {
    name: { type: "positional", description: "Brand name to check", required: true },
    tlds: { type: "string", alias: "t", description: "Comma-separated TLDs", default: DEFAULT_TLDS },
    platforms: {
      type: "string",
      alias: "p",
      description: "Comma-separated social platforms",
      default: DEFAULT_PLATFORMS,
    },
    apiKey: { type: "string", alias: "k", description: "Namecheckly API key (else env / demo)" },
    json: { type: "boolean", alias: "j", description: "Output raw JSON" },
  },
  async run({ args }) {
    const clean = sanitize(args.name)
    if (clean !== args.name.toLowerCase()) {
      process.stderr.write(`⚠ Sanitized input to "${clean}" (alphanumerics + hyphens only).\n`)
    }

    const apiKey = args.apiKey || process.env.NAMECHECKLY_API_KEY || DEMO_KEY
    if (!args.apiKey && !process.env.NAMECHECKLY_API_KEY) {
      process.stderr.write("ℹ Using Namecheckly demo key. Set -k or NAMECHECKLY_API_KEY for higher limits.\n")
    }

    const url = new URL("https://namecheckly.com/api/check")
    url.searchParams.set("name", clean)
    url.searchParams.set("tlds", args.tlds)
    url.searchParams.set("platforms", args.platforms)

    let resp: NamechecklyResponse
    try {
      const ctrl = new AbortController()
      const timer = setTimeout(() => ctrl.abort(), 12000)
      const res = await fetch(url, {
        headers: { "x-api-key": apiKey, "Content-Type": "application/json" },
        signal: ctrl.signal,
      })
      clearTimeout(timer)
      if (!res.ok) throw new Error(`Namecheckly returned HTTP ${res.status}`)
      resp = (await res.json()) as NamechecklyResponse
    } catch (error: any) {
      consola.error(error.message || "Namecheckly request failed")
      process.exit(1)
    }

    if (args.json) {
      console.log(JSON.stringify(resp, null, 2))
      return
    }

    const s = score(clean, resp)

    console.log("")
    consola.info(`Namespace check: ${clean}`)
    console.log("")
    console.log("◆ Domains")
    for (const d of resp.domains) {
      const tag = d.available ? "AVAILABLE" : "taken"
      const url2 = d.available && d.registerUrl ? `  → ${d.registerUrl}` : ""
      console.log(`   ${d.available ? "✓" : "✗"} ${d.domain}  (${tag})${url2}`)
    }
    console.log("")
    console.log("◎ Socials")
    for (const soc of resp.socials) {
      const free = soc.status === "available"
      const url2 = !free && soc.profileUrl ? `  → ${soc.profileUrl}` : ""
      console.log(`   ${free ? "✓" : "✗"} ${soc.platform}  (${free ? "free" : "taken"})${url2}`)
    }
    console.log("")
    console.log(`⚖ Engine composite: ${s.composite}/10`)
    console.log(
      `   Free socials: ${s.freeSocials}/${s.socialTotal}` +
        (s.eliteCandidate ? "   → elite candidate (com/ai free + ≥3 socials)" : ""),
    )
  },
})
