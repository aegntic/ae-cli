import { defineCommand } from "citty"
import { getClient } from "../lib/client.js"
import consola from "consola"

export default defineCommand({
  meta: {
    name: "inspect",
    description: "Get input schema and details for a specific tool",
  },
  args: {
    target: {
      type: "positional",
      description: "Provider/endpoint, e.g. openmeteo/weather/current",
      required: false,
    },
    provider: {
      type: "string",
      alias: "p",
      description: "Provider name (alternative to the positional target)",
      required: false,
    },
    endpoint: {
      type: "string",
      alias: "e",
      description: "Endpoint path (alternative to the positional target)",
      required: false,
    },
    json: {
      type: "boolean",
      alias: "j",
      description: "Output in JSON format",
    },
  },
  async run({ args }) {
    try {
      let provider = args.provider
      let endpoint = args.endpoint
      if ((!provider || !endpoint) && args.target) {
        const sep = args.target.indexOf("/")
        if (sep < 0) {
          consola.error(
            `Positional target "${args.target}" must be <provider>/<endpoint>.`,
          )
          return
        }
        provider = args.target.slice(0, sep)
        endpoint = args.target.slice(sep + 1)
      }
      if (!provider || !endpoint) {
        consola.error(
          "Provide a provider/endpoint, e.g. `aegntic inspect openmeteo/weather/current` or use -p/-e.",
        )
        return
      }

      const client = await getClient()
      const response = await client.inspect(provider, endpoint)

      if (args.json) {
        console.log(JSON.stringify(response, null, 2))
        return
      }

      const { endpoint: tool, examples } = response.data
      consola.info(`Tool Details: [${tool.provider}] ${tool.path}`)
      console.log(`Description: ${tool.description}`)
      console.log(`Price Model: ${tool.costModel.type} (${tool.costModel.unitPrice} cents per result)`)

      console.log("\nInput Schema:")
      const schema = tool.inputSchema
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
