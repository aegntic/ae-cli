import { defineCommand } from "citty"
import { getClient } from "../lib/client.js"
import consola from "consola"
import { writeFileSync } from "fs"

const getCommand = defineCommand({
  meta: {
    name: "get",
    description: "Get status and results of a run",
  },
  args: {
    runId: {
      type: "string",
      alias: "r",
      description: "Run ID to fetch",
      required: true,
    },
    wait: {
      type: "boolean",
      alias: "w",
      description: "Wait/block for run completion",
    },
    output: {
      type: "string",
      alias: "o",
      description: "Path to save results if completed",
    },
    json: {
      type: "boolean",
      alias: "j",
      description: "Output raw run response in JSON format",
    },
  },
  async run({ args }) {
    try {
      const client = await getClient()
      const waitOption = args.wait ? 30 : undefined
      const response = await client.getRun(args.runId, { wait: waitOption })

      if (args.json) {
        console.log(JSON.stringify(response, null, 2))
        return
      }

      const run = response.data
      consola.info(`Run Details: ${run.id}`)
      console.log(`Status: ${run.status}`)
      console.log(`Tool: [${run.provider}] ${run.endpoint}`)
      console.log(`Created: ${run.createdAt}`)

      if (run.status === "COMPLETED") {
        consola.success("Run completed!")
        if (run.result) {
          if (args.output) {
            writeFileSync(args.output, JSON.stringify(run.result, null, 2), "utf-8")
            consola.success(`Results saved to: ${args.output}`)
          } else {
            console.log("\nResults:")
            console.log(JSON.stringify(run.result, null, 2))
          }
        }
        if (run.cost) {
          console.log(`Cost: $${run.cost.value.toFixed(2)} USD (${run.cost.items} items at $${run.cost.unitPrice.toFixed(4)}/item)`)
        }
      } else if (run.status === "FAILED") {
        consola.error(`Run failed: ${run.error || "Unknown error"}`)
      } else if (run.status === "BLOCKED") {
        consola.warn("Run was BLOCKED by workspace controls.")
      } else if (run.status === "STOPPED") {
        consola.info("Run was manually STOPPED.")
      } else {
        consola.info(`Run is still ${run.status}.`)
        if (run.stoppable) {
          console.log(`This run is stoppable. Stop it with: aegntic runs stop -r ${run.id}`)
        }
      }
    } catch (error: any) {
      consola.error(error.message)
    }
  },
})

const stopCommand = defineCommand({
  meta: {
    name: "stop",
    description: "Request to stop a running run",
  },
  args: {
    runId: {
      type: "string",
      alias: "r",
      description: "Run ID to stop",
      required: true,
    },
    json: {
      type: "boolean",
      alias: "j",
      description: "Output raw response in JSON format",
    },
  },
  async run({ args }) {
    try {
      const client = await getClient()
      const response = await client.stopRun(args.runId)

      if (args.json) {
        console.log(JSON.stringify(response, null, 2))
        return
      }

      const run = response.data
      consola.success(`Stop request accepted for run: ${run.id}`)
      console.log(`Status: ${run.status}`)
    } catch (error: any) {
      consola.error(error.message)
    }
  },
})

export default defineCommand({
  meta: {
    name: "runs",
    description: "Inspect and manage tool runs",
  },
  subCommands: {
    get: getCommand,
    stop: stopCommand,
  },
})
