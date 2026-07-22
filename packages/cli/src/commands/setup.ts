import { defineCommand } from "citty"
import consola from "consola"
import {
  getConfig,
  saveConfig,
  DEFAULT_BASE_URL,
} from "../lib/config.js"

export default defineCommand({
  meta: {
    name: "setup",
    description: "Configure the aedex CLI gateway (writes ~/.aegntic/config.json)",
  },
  args: {
    base: {
      type: "string",
      description:
        "Gateway base URL. Defaults to the production gateway. " +
        "Pass e.g. http://localhost:3101 for local development.",
    },
    client: {
      type: "string",
      description: "Optional agent name (stored for reference)",
    },
    email: {
      type: "string",
      description: "Optional user email (stored for reference)",
    },
  },
  async run({ args }) {
    const baseUrl = args.base || DEFAULT_BASE_URL
    const existing = await getConfig()

    await saveConfig({
      baseUrl,
      activeKey: existing.activeKey,
      keys: existing.keys,
    })

    consola.success("aedex setup complete.")
    console.log(`  Gateway: ${baseUrl}`)
    if (baseUrl === DEFAULT_BASE_URL) {
      console.log("  (production gateway)")
    }
    if (existing.keys && Object.keys(existing.keys).length > 0) {
      console.log(
        `  Active key label: ${existing.activeKey} (${Object.keys(existing.keys).length} key(s) preserved)`,
      )
    } else {
      console.log(
        "  No API key yet — next: `ae keys add` (mint one) or set AEGNTIC_API_KEY.",
      )
    }
    if (args.client) {
      consola.info(`Client configured as: ${args.client}`)
    }
    if (args.email) {
      consola.info(`Email configured as: ${args.email}`)
    }
  },
})
