import { defineCommand } from "citty"
import { getClient } from "../utils/config.js"
import consola from "consola"

export default defineCommand({
  meta: {
    name: "inspect",
    description: "Get input schema and details for a specific tool",
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
    json: {
      type: "boolean",
      alias: "j",
      description: "Output in JSON format",
    },
  },
  async run({ args }) {
    try {
      const client = getClient()
      const response = await client.inspect(args.provider, args.endpoint)

      if (args.json) {
        console.log(JSON.stringify(response, null, 2))
        return
      }

      const { endpoint, examples } = response.data
      consola.info(`Tool Details: [${endpoint.provider}] ${endpoint.path}`)
      console.log(`Description: ${endpoint.description}`)
      console.log(`Price Model: ${endpoint.costModel.type} (${endpoint.costModel.unitPrice} cents per result)`)
      
      console.log("\nInput Schema:")
      const schema = endpoint.inputSchema
      if (schema.body) {
        console.log("  Body:")
        for (const [key, field] of Object.entries(schema.body)) {
          console.log(`    - ${key} (${field.type})${field.required ? " *required" : ""}`)
          if (field.description) {
            console.log(`      Description: ${field.description}`)
          }
          if (field.default !== undefined) {
            console.log(`      Default: ${JSON.stringify(field.default)}`)
          }
        }
      } else {
        console.log("  No body input required.")
      }

      if (examples && examples.length > 0) {
        console.log("\nExamples:")
        console.log(JSON.stringify(examples, null, 2))
      }
    } catch (error: any) {
      consola.error(error.message)
    }
  },
})
