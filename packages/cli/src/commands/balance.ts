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
    // 4dp: per-call/per-result metering can be sub-cent (e.g. $0.001).
    // 2dp would hide the charge from a single call.
    console.log(`  Balance:   $${data.balance.toFixed(4)} ${data.currency}`)
    console.log(`  Held:      $${data.held.toFixed(4)} ${data.currency}`)
    console.log(`  Available: $${data.available.toFixed(4)} ${data.currency}`)
    console.log()
  },
})
