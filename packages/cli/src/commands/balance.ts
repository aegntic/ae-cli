import { defineCommand } from "citty"
import consola from "consola"
import { getBalance } from "../lib/client.js"

export default defineCommand({
  meta: {
    name: "balance",
    description: "Check workspace balance",
  },
  async run() {
    const data = await getBalance()

    console.log()
    consola.info("Workspace Balance")
    console.log(`  Balance:   $${data.balance.toFixed(2)} ${data.currency}`)
    console.log(`  Held:      $${data.held.toFixed(2)} ${data.currency}`)
    console.log(`  Available: $${data.available.toFixed(2)} ${data.currency}`)
    console.log()
  },
})
