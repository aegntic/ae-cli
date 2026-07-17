import { defineCommand } from "citty"
import { loadConfig, saveConfig } from "../utils/config.js"
import consola from "consola"

export default defineCommand({
  meta: {
    name: "setup",
    description: "Complete Aegntic CLI setup",
  },
  args: {
    client: {
      type: "string",
      description: "Agent name",
    },
    email: {
      type: "string",
      description: "User email",
    },
  },
  run({ args }) {
    const config = loadConfig()
    saveConfig(config)
    consola.success("Aegntic setup complete! Base URL configured to: " + config.baseUrl)
    if (args.client) {
      consola.info(`Client configured as: ${args.client}`)
    }
  },
})
