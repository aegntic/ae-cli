import { defineCommand } from "citty"
import { getClient } from "../utils/config.js"
import consola from "consola"
import { readFileSync, writeFileSync } from "fs"

export default defineCommand({
  meta: {
    name: "run",
    description: "Execute a data tool or endpoint",
  },
  args: {
    provider: {
      type: "string",
      alias: "p",
      description: "Provider name",
      required: true,
    },
    endpoint: {
      type: "string",
      alias: "e",
      description: "Endpoint path",
      required: true,
    },
    input: {
      type: "string",
      alias: "i",
      description: "Inline body input parameters as JSON string",
    },
    file: {
      type: "string",
      alias: "f",
      description: "Path to JSON file containing body input parameters",
    },
    query: {
      type: "string",
      description: "Query parameters as JSON string",
    },
    path: {
      type: "string",
      description: "Path parameters as JSON string",
    },
    wait: {
      type: "boolean",
      alias: "w",
      description: "Wait/block for run completion",
    },
    output: {
      type: "string",
      alias: "o",
      description: "Path to save output results",
    },
    json: {
      type: "boolean",
      alias: "j",
      description: "Output raw run response in JSON format",
    },
  },
  async run({ args }) {
    try {
      let bodyInput = {}
      if (args.input) {
        bodyInput = JSON.parse(args.input)
      } else if (args.file) {
        bodyInput = JSON.parse(readFileSync(args.file, "utf-8"))
      }

      const runInput = {
        body: bodyInput,
        queryParams: args.query ? JSON.parse(args.query) : undefined,
        pathParams: args.path ? JSON.parse(args.path) : undefined,
      }

      const client = getClient()
      const waitOption = args.wait ? 30 : undefined
      const response = await client.run(args.provider, args.endpoint, runInput, { wait: waitOption })

      if (args.json) {
        console.log(JSON.stringify(response, null, 2))
        return
      }

      const runResult = response.data
      consola.info(`Run created successfully. ID: ${runResult.id}`)
      console.log(`Status: ${runResult.status}`)

      if (runResult.status === "COMPLETED") {
        consola.success("Run completed!")
        if (runResult.result) {
          if (args.output) {
            writeFileSync(args.output, JSON.stringify(runResult.result, null, 2), "utf-8")
            consola.success(`Results saved to: ${args.output}`)
          } else {
            console.log("\nResults:")
            console.log(JSON.stringify(runResult.result, null, 2))
          }
        }
        if (runResult.cost) {
          console.log(`Cost: $${runResult.cost.value.toFixed(2)} USD (${runResult.cost.items} items at $${runResult.cost.unitPrice.toFixed(4)}/item)`)
        }
      } else if (runResult.status === "BLOCKED") {
        consola.warn("Run was BLOCKED by workspace controls (insufficient balance or cap limit).")
      } else {
        consola.info(`Run is still ${runResult.status}. To check progress, run:`)
        console.log(`  aegntic runs get -r ${runResult.id}`)
      }
    } catch (error: any) {
      consola.error(error.message)
    }
  },
})
