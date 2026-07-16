import { defineCommand } from "citty"
import consola from "consola"
import { writeFile } from "node:fs/promises"
import { getRun } from "../lib/client.js"
import type { Run, RunStatus } from "@aegntic/sdk"

const TERMINAL: RunStatus[] = ["COMPLETED", "FAILED", "BLOCKED", "STOPPED", "TIME_OUT"]

const list = defineCommand({
  meta: { name: "list", description: "List recent runs" },
  async run() {
    consola.info("List runs: use the API directly at GET /v1/runs")
  },
})

const get = defineCommand({
  meta: { name: "get", description: "Get a run by ID" },
  args: {
    r: { type: "string", description: "Run ID", required: true },
    w: { type: "boolean", description: "Wait for completion", default: false },
    o: { type: "string", description: "Output file path" },
  },
  async run({ args }) {
    let run = await getRun(args.r)

    if (args.w) {
      while (!TERMINAL.includes(run.status)) {
        consola.info(`Run ${run.id}: ${run.status} ...`)
        await new Promise((r) => setTimeout(r, 2000))
        run = await getRun(args.r)
      }
    }

    console.log(`\nRun: ${run.id}`)
    console.log(`  Status: ${run.status}`)
    console.log(`  Provider: ${run.provider} / ${run.endpoint}`)
    console.log(`  Created: ${run.createdAt}`)

    if (run.cost) {
      console.log(`  Cost: $${run.cost.value} ${run.cost.currency} (${run.cost.items} items)`)
    }

    if (run.error) {
      consola.error(`Error: ${run.error}`)
    }

    if (TERMINAL.includes(run.status) && run.result) {
      if (args.o) {
        await writeFile(args.o, JSON.stringify(run.result, null, 2), "utf-8")
        consola.success(`Result saved to ${args.o}`)
      } else {
        console.log("\nResult:")
        console.log(JSON.stringify(run.result, null, 2))
      }
    }
  },
})

const stop = defineCommand({
  meta: { name: "stop", description: "Stop a running run" },
  args: {
    r: { type: "string", description: "Run ID", required: true },
  },
  async run({ args }) {
    const run = await getRun(args.r)

    if (!run.stoppable) {
      consola.warn(`Run ${run.id} is not stoppable (status: ${run.status})`)
      return
    }

    consola.info(`Stopping run ${run.id}...`)
    consola.error("Stop endpoint not yet available in client. Use the API directly.")
  },
})

export default defineCommand({
  meta: {
    name: "runs",
    description: "Manage runs",
  },
  subCommands: {
    list: () => Promise.resolve(list),
    get: () => Promise.resolve(get),
    stop: () => Promise.resolve(stop),
  },
})
