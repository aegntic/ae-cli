import { defineCommand } from "citty"
import consola from "consola"
import { inspect } from "../lib/client.js"
import type { SchemaField } from "@aegntic/sdk"

function printFields(
  label: string,
  fields: Record<string, SchemaField> | undefined,
): void {
  if (!fields || !Object.keys(fields).length) return

  consola.info(`${label}:`)
  for (const [name, field] of Object.entries(fields)) {
    const req = field.required ? " (required)" : ""
    const def = field.default !== undefined ? ` [default: ${JSON.stringify(field.default)}]` : ""
    console.log(`  ${name}: ${field.type}${req}${def}`)
    if (field.description) console.log(`    ${field.description}`)
  }
}

export default defineCommand({
  meta: {
    name: "inspect",
    description: "Inspect an endpoint's schema and cost model",
  },
  args: {
    p: {
      type: "string",
      description: "Provider name",
      required: true,
    },
    e: {
      type: "string",
      description: "Endpoint path",
      required: true,
    },
  },
  async run({ args }) {
    const data = await inspect(args.p, args.e)
    const { endpoint } = data

    console.log()
    consola.info(`${endpoint.provider} / ${endpoint.path}`)
    console.log(`  ${endpoint.description}`)
    console.log()

    if (endpoint.verified) {
      consola.success("Verified endpoint")
    } else {
      consola.warn("Unverified endpoint")
    }

    console.log()
    consola.info("Cost model:")
    console.log(`  Type: ${endpoint.costModel.type}`)
    console.log(`  Unit price: $${endpoint.costModel.unitPrice} ${endpoint.costModel.currency}`)

    console.log()
    printFields("Body", endpoint.inputSchema.body)
    printFields("Query params", endpoint.inputSchema.queryParams)
    printFields("Path params", endpoint.inputSchema.pathParams)

    if (endpoint.inputSchema.bodyType) {
      console.log(`\n  Body type: ${endpoint.inputSchema.bodyType}`)
    }

    if (data.examples?.length) {
      console.log()
      consola.info("Example usage:")
      console.log(JSON.stringify(data.examples[0], null, 2))
    }
  },
})
