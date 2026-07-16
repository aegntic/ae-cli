import { defineCommand } from "citty"
import consola from "consola"
import { saveConfig, getConfig } from "../lib/config.js"

export default defineCommand({
  meta: {
    name: "setup",
    description: "Interactive setup wizard",
  },
  args: {
    client: {
      type: "string",
      description: "Client/workspace name",
    },
    email: {
      type: "string",
      description: "Contact email",
    },
  },
  async run({ args }) {
    const existing = await getConfig()

    const clientName = args.client
    const email = args.email

    if (!clientName) {
      consola.error("--client is required. Usage: aegntic setup --client <name> [--email <email>]")
      process.exit(1)
    }

    const updates: Record<string, string> = { clientName }
    if (email) updates.email = email

    await saveConfig(updates)
    consola.success(`Client "${clientName}" configured.`)

    if (existing.apiKey) {
      consola.info("API key already configured.")
    } else {
      consola.warn("No API key configured. Set AEGNTIC_API_KEY or run `aegntic keys add`.")
    }

    consola.info(`Base URL: ${existing.baseUrl}`)
    consola.success("Setup complete.")
  },
})
