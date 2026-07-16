import { Hono } from "hono"
import { nanoid } from "nanoid"
import type { Run, RunInput, CostBreakdown, ApiResponse, HintsBlock } from "@aegntic/sdk"
import type { Env } from "../types.js"
import { createRun, getRun, updateRun, listRuns, getBalance, holdBalance, deductBalance } from "../store.js"
import { getEndpoint, getProvider } from "../providers/registry.js"

export const runsRoute = new Hono<Env>()

runsRoute.post("/runs", async (c) => {
  const workspace = c.get("workspace")
  const idempotencyKey = c.req.header("Idempotency-Key")

  const body = await c.req.json<{ provider: string; endpoint: string; input: RunInput }>()
  const { provider, endpoint, input } = body

  if (!provider || !endpoint) {
    return c.json({ error: "Fields 'provider' and 'endpoint' are required" }, 400)
  }

  const ep = getEndpoint(provider, endpoint)
  if (!ep) {
    return c.json({ error: `Endpoint ${provider}/${endpoint} not found` }, 404)
  }

  const validationError = validateInput(ep.inputSchema, input)
  if (validationError) {
    return c.json({ error: validationError }, 400)
  }

  const balance = getBalance(workspace.id)
  const adapter = getProvider(provider)
  const estimatedCost = adapter ? await adapter.estimateCost(endpoint, input) : 0.01

  if (balance.balance - balance.held < estimatedCost) {
    return c.json({ error: "Insufficient balance", estimatedCost, available: balance.balance - balance.held }, 402)
  }

  holdBalance(workspace.id, estimatedCost)

  const run = createRun(workspace.id, provider, endpoint, input, idempotencyKey)
  updateRun(run.id, { status: "RUNNING" })

  executeAsync(run.id, provider, endpoint, input, estimatedCost)

  const response: ApiResponse<Run> = {
    data: run,
    requestId: nanoid(8),
  }
  return c.json(response, 201)
})

runsRoute.get("/runs", (c) => {
  const workspace = c.get("workspace")
  const limit = Math.min(Number(c.req.query("limit")) || 50, 200)
  const runs = listRuns(workspace.id, limit)

  const response: ApiResponse<Run[]> = {
    data: runs,
    requestId: nanoid(8),
  }

  return c.json(response)
})

runsRoute.get("/runs/:id", (c) => {
  const workspace = c.get("workspace")
  const id = c.req.param("id")
  const run = getRun(id)

  if (!run || run.workspaceId !== workspace.id) {
    return c.json({ error: "Run not found" }, 404)
  }

  const response: ApiResponse<Run> = {
    data: run,
    requestId: nanoid(8),
  }

  return c.json(response)
})

runsRoute.post("/runs/:id/stop", (c) => {
  const workspace = c.get("workspace")
  const id = c.req.param("id")
  const run = getRun(id)

  if (!run || run.workspaceId !== workspace.id) {
    return c.json({ error: "Run not found" }, 404)
  }

  if (!run.stoppable || run.status === "COMPLETED" || run.status === "FAILED") {
    return c.json({ error: "Run cannot be stopped" }, 409)
  }

  updateRun(id, { status: "STOPPED", stoppable: false })

  const hints: HintsBlock = {
    nextCommands: [`aegntic run ${run.provider}/${run.endpoint} --input '${JSON.stringify(run.input)}'`],
  }

  return c.json({ ...getRun(id), hints })
})

async function executeAsync(
  runId: string,
  providerName: string,
  endpointPath: string,
  input: RunInput,
  estimatedCost: number,
): Promise<void> {
  const workspace = getRun(runId)?.workspaceId
  if (!workspace) return

  try {
    const adapter = getProvider(providerName)
    if (!adapter) throw new Error(`Provider ${providerName} not found`)

    const result = await adapter.execute(endpointPath, input)

    const cost: CostBreakdown = {
      value: result.cost,
      currency: "USD",
      items: result.items,
      unitPrice: result.items > 0 ? result.cost / result.items : result.cost,
    }

    deductBalance(workspace, estimatedCost)
    updateRun(runId, { status: "COMPLETED", result: result.data, cost, stoppable: false })
  } catch (err) {
    deductBalance(workspace, estimatedCost)
    updateRun(runId, {
      status: "FAILED",
      error: err instanceof Error ? err.message : "Unknown error",
      stoppable: false,
    })
  }
}

function validateInput(
  schema: { queryParams?: Record<string, { required?: boolean }>; pathParams?: Record<string, { required?: boolean }>; body?: Record<string, { required?: boolean }> },
  input?: RunInput,
): string | null {
  if (schema.queryParams) {
    for (const [key, field] of Object.entries(schema.queryParams)) {
      if (field.required && !input?.queryParams?.[key]) {
        return `Missing required query param: ${key}`
      }
    }
  }
  if (schema.pathParams) {
    for (const [key, field] of Object.entries(schema.pathParams)) {
      if (field.required && !input?.pathParams?.[key]) {
        return `Missing required path param: ${key}`
      }
    }
  }
  if (schema.body) {
    for (const [key, field] of Object.entries(schema.body)) {
      if (field.required && (input?.body?.[key] === undefined || input?.body?.[key] === null)) {
        return `Missing required body field: ${key}`
      }
    }
  }
  return null
}
