import { Hono } from "hono"
import { nanoid } from "nanoid"
import { getCatalogEndpoint } from "../catalog.js"
import type { Env } from "../types.js"
import type { InspectResponse, RunInput, HintsBlock, ApiResponse } from "@aegntic/sdk"

export const inspectRoute = new Hono<Env>()

inspectRoute.get("/inspect", async (c) => {
  const provider = c.req.query("provider")
  const endpoint = c.req.query("endpoint")

  if (!provider || !endpoint) {
    return c.json({ error: "Query parameters 'provider' and 'endpoint' are required" }, 400)
  }

  const ep = await getCatalogEndpoint(provider, endpoint)
  if (!ep) {
    return c.json({ error: `Endpoint ${provider}/${endpoint} not found` }, 404)
  }

  const examples: RunInput[] = [buildExampleInput(ep.inputSchema)]

  const hints: HintsBlock = {
    nextCommands: [
      `aegntic run ${provider}/${endpoint} --input '${JSON.stringify(examples[0])}'`,
      `aegntic discover?q=${encodeURIComponent(ep.description.split(" ").slice(0, 3).join(" "))}`,
    ],
  }

  const response: ApiResponse<InspectResponse> = {
    data: { endpoint: ep, examples },
    hints,
    requestId: nanoid(8),
  }

  return c.json(response)
})

function buildExampleInput(schema: InspectResponse["endpoint"]["inputSchema"]): RunInput {
  const example: RunInput = {}

  if (schema.queryParams) {
    example.queryParams = {}
    for (const [key, field] of Object.entries(schema.queryParams)) {
      if (field.required || field.default !== undefined) {
        example.queryParams[key] = field.default !== undefined
          ? String(field.default)
          : field.type === "number" ? "10" : `example_${key}`
      }
    }
  }

  if (schema.pathParams) {
    example.pathParams = {}
    for (const [key, field] of Object.entries(schema.pathParams)) {
      example.pathParams[key] = field.type === "number" ? "1" : `example_${key}`
    }
  }

  if (schema.body) {
    example.body = {}
    for (const [key, field] of Object.entries(schema.body)) {
      if (field.required) {
        example.body[key] = field.type === "number" ? 42
          : field.type === "boolean" ? true
          : field.type === "array" ? []
          : `example_${key}`
      }
    }
  }

  return example
}
