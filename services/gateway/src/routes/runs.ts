import { Hono } from "hono"
import { db } from "../db/index.js"
import { jobs, tools, balanceLedger } from "../db/schema.js"
import { eq, and, sum, desc } from "drizzle-orm"
import { nanoid } from "nanoid"
import type { Env } from "../types.js"
import { registry } from "../adapters/index.js"

export const runsRoute = new Hono<Env>()

function estimateCost(tool: any, input: any): number {
  const costModel = tool.costModel as any
  const body = input?.body || {}
  const limit = body.maxItems || body.maxResults || body.limit || 10
  
  if (costModel.type === "per_result") {
    return Math.ceil(limit * costModel.unitPrice * 1.25)
  }
  return 100
}

const activeTasks = new Map<string, { timer: NodeJS.Timeout; promise: Promise<void>; resolve: () => void }>()

runsRoute.post("/runs", async (c) => {
  const workspaceId = c.get("workspaceId")
  const { provider, endpoint, input } = await c.req.json()
  const idempotencyKey = c.req.header("Idempotency-Key")

  if (!provider || !endpoint) {
    return c.json({ error: "Missing provider or endpoint" }, 400)
  }

  if (idempotencyKey) {
    const existing = await db
      .select()
      .from(jobs)
      .where(and(eq(jobs.workspaceId, workspaceId), eq(jobs.idempotencyKey, idempotencyKey)))
      .limit(1)

    if (existing.length > 0) {
      return c.json({
        data: {
          ...existing[0],
          input: existing[0].input as any,
          cost: existing[0].cost as any,
          result: existing[0].result as any,
        },
        requestId: Math.random().toString(36).substring(7),
      })
    }
  }

  const toolResults = await db
    .select()
    .from(tools)
    .where(and(eq(tools.provider, provider), eq(tools.path, endpoint)))
    .limit(1)

  if (toolResults.length === 0) {
    return c.json({ error: `Tool not found: ${provider}${endpoint}` }, 404)
  }

  const tool = toolResults[0]

  const ledgerSum = await db
    .select({ total: sum(balanceLedger.deltaCents) })
    .from(balanceLedger)
    .where(eq(balanceLedger.workspaceId, workspaceId))

  const balance = ledgerSum[0]?.total ? parseInt(ledgerSum[0].total, 10) : 0
  const estimatedCostCents = estimateCost(tool, input)

  if (balance < estimatedCostCents) {
    const jobId = `run_${nanoid(16)}`
    const blockedJob = {
      id: jobId,
      workspaceId,
      provider,
      endpoint,
      input: input || {},
      status: "BLOCKED" as const,
      cost: {
        value: 0,
        currency: "USD" as const,
        items: 0,
        unitPrice: (tool.costModel as any).unitPrice,
      },
      stoppable: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await db.insert(jobs).values({
      ...blockedJob,
      idempotencyKey: idempotencyKey || null,
    })

    return c.json({
      data: blockedJob,
      requestId: Math.random().toString(36).substring(7),
    })
  }

  const jobId = `run_${nanoid(16)}`
  const newJob = {
    id: jobId,
    workspaceId,
    provider,
    endpoint,
    input: input || {},
    status: "RUNNING" as const,
    stoppable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  await db.insert(jobs).values({
    ...newJob,
    idempotencyKey: idempotencyKey || null,
  })

  let resolveTask: () => void = () => {}
  const taskPromise = new Promise<void>((resolve) => {
    resolveTask = resolve
  })

  const runTask = async () => {
    try {
      const adapter = registry.getAdapter(provider)
      const executeResult = await adapter.execute(endpoint, input)

      const checkJob = await db.select().from(jobs).where(eq(jobs.id, jobId)).limit(1)
      if (checkJob.length === 0 || checkJob[0].status === "STOPPED") {
        activeTasks.delete(jobId)
        return
      }

      const actualCostCents = estimateCost(tool, { ...input, body: { ...((input as any)?.body || {}), maxItems: executeResult.items } })

      const ledgerId = `ledger_${nanoid(16)}`
      await db.insert(balanceLedger).values({
        id: ledgerId,
        workspaceId,
        deltaCents: -actualCostCents,
        type: "charge",
        description: `Charge for run ${jobId} against ${provider}${endpoint}`,
        jobId,
      })

      await db
        .update(jobs)
        .set({
          status: "COMPLETED",
          result: executeResult.data as any,
          resultUri: `https://api.aegntic.ai/v1/runs/${jobId}/results.json`,
          cost: {
            value: actualCostCents / 100,
            currency: "USD",
            items: executeResult.items,
            unitPrice: (tool.costModel as any).unitPrice / 100,
          } as any,
          stoppable: false,
          updatedAt: new Date(),
        })
        .where(eq(jobs.id, jobId))
    } catch (err: any) {
      const checkJob = await db.select().from(jobs).where(eq(jobs.id, jobId)).limit(1)
      if (checkJob.length > 0 && checkJob[0].status === "STOPPED") {
        activeTasks.delete(jobId)
        return
      }

      await db
        .update(jobs)
        .set({
          status: "FAILED",
          error: err.message || "Execution failed",
          stoppable: false,
          updatedAt: new Date(),
        })
        .where(eq(jobs.id, jobId))
    }

    activeTasks.delete(jobId)
  }

  const timer = setTimeout(() => {
    runTask().then(() => resolveTask())
  }, 10)

  activeTasks.set(jobId, { timer, promise: taskPromise, resolve: resolveTask })

  const waitParam = c.req.query("wait")
  if (waitParam !== undefined) {
    const waitTime = parseInt(waitParam, 10) || 30
    await Promise.race([
      taskPromise,
      new Promise((resolve) => setTimeout(resolve, Math.min(waitTime, 30) * 1000)),
    ])

    const updatedJob = await db.select().from(jobs).where(eq(jobs.id, jobId)).limit(1)
    return c.json({
      data: {
        ...updatedJob[0],
        input: updatedJob[0].input as any,
        cost: updatedJob[0].cost as any,
        result: updatedJob[0].result as any,
      },
      requestId: Math.random().toString(36).substring(7),
    })
  }

  return c.json({
    data: {
      id: jobId,
      workspaceId,
      provider,
      endpoint,
      input: input || {},
      status: "RUNNING",
      stoppable: true,
      createdAt: newJob.createdAt,
      updatedAt: newJob.updatedAt,
    },
    requestId: Math.random().toString(36).substring(7),
  })
})

runsRoute.get("/runs", async (c) => {
  const workspaceId = c.get("workspaceId")
  const limitStr = c.req.query("limit")
  const limit = limitStr ? Math.max(1, parseInt(limitStr, 10)) : 20

  const results = await db
    .select()
    .from(jobs)
    .where(eq(jobs.workspaceId, workspaceId))
    .orderBy(desc(jobs.createdAt))
    .limit(limit)

  const formatted = results.map((job) => ({
    ...job,
    input: job.input as any,
    cost: job.cost as any,
    result: job.result as any,
  }))

  return c.json({
    data: formatted,
    requestId: Math.random().toString(36).substring(7),
  })
})

runsRoute.get("/runs/:id", async (c) => {
  const workspaceId = c.get("workspaceId")
  const id = c.req.param("id")
  const waitParam = c.req.query("wait")

  const results = await db
    .select()
    .from(jobs)
    .where(and(eq(jobs.id, id), eq(jobs.workspaceId, workspaceId)))
    .limit(1)

  if (results.length === 0) {
    return c.json({ error: "Run not found" }, 404)
  }

  let job = results[0]

  if (job.status === "RUNNING" && waitParam !== undefined) {
    const waitTime = parseInt(waitParam, 10) || 30
    const task = activeTasks.get(id)
    if (task) {
      await Promise.race([
        task.promise,
        new Promise((resolve) => setTimeout(resolve, Math.min(waitTime, 30) * 1000)),
      ])
      const refreshed = await db
        .select()
        .from(jobs)
        .where(and(eq(jobs.id, id), eq(jobs.workspaceId, workspaceId)))
        .limit(1)
      if (refreshed.length > 0) {
        job = refreshed[0]
      }
    }
  }

  return c.json({
    data: {
      ...job,
      input: job.input as any,
      cost: job.cost as any,
      result: job.result as any,
    },
    requestId: Math.random().toString(36).substring(7),
  })
})

runsRoute.post("/runs/:id/stop", async (c) => {
  const workspaceId = c.get("workspaceId")
  const id = c.req.param("id")

  const results = await db
    .select()
    .from(jobs)
    .where(and(eq(jobs.id, id), eq(jobs.workspaceId, workspaceId)))
    .limit(1)

  if (results.length === 0) {
    return c.json({ error: "Run not found" }, 404)
  }

  const job = results[0]

  if (job.status !== "RUNNING" && job.status !== "READY") {
    return c.json({ error: "Run is already in a terminal state" }, 409)
  }

  if (!job.stoppable) {
    return c.json({ error: "Run is not stoppable" }, 409)
  }

  const task = activeTasks.get(id)
  if (task) {
    clearTimeout(task.timer)
    task.resolve()
    activeTasks.delete(id)
  }

  await db
    .update(jobs)
    .set({
      status: "STOPPED",
      stoppable: false,
      updatedAt: new Date(),
    })
    .where(eq(jobs.id, id))

  const refreshed = await db
    .select()
    .from(jobs)
    .where(eq(jobs.id, id))
    .limit(1)

  return c.json({
    data: {
      ...refreshed[0],
      input: refreshed[0].input as any,
      cost: refreshed[0].cost as any,
      result: refreshed[0].result as any,
    },
    requestId: Math.random().toString(36).substring(7),
  })
})
