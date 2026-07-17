import { defineCommand } from "citty"
import { getClient } from "../utils/config.js"
import consola from "consola"

export default defineCommand({
  meta: {
    name: "balance",
    description: "Show current workspace balance",
  },
  args: {
    json: {
      type: "boolean",
      alias: "j",
      description: "Output in JSON format",
    },
  },
  async run({ args }) {
    try {
      const client = getClient()
      const response = await client.getBalance()

      if (args.json) {
        console.log(JSON.stringify(response, null, 2))
        return
      }

      const bal = response.data
      consola.info("Current Workspace Balance:")
      console.log(`Total Credit: $${(bal.balance / 100).toFixed(2)} USD`)
      console.log(`Held (pending runs): $${(bal.held / 100).toFixed(2)} USD`)
      console.log(`Available: $${(bal.available / 100).toFixed(2)} USD`)
    } catch (error: any) {
      consola.error(error.message)
    }
  },
})
