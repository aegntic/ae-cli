import { Hono } from "hono"
import { db } from "../db/index.js"
import { balanceLedger } from "../db/schema.js"
import { eq, sum } from "drizzle-orm"
import type { Env } from "../types.js"

export const balanceRoute = new Hono<Env>()

balanceRoute.get("/balance", async (c) => {
  const workspaceId = c.get("workspaceId")

  const ledgerSum = await db
    .select({ total: sum(balanceLedger.deltaCents) })
    .from(balanceLedger)
    .where(eq(balanceLedger.workspaceId, workspaceId))

  const balance = ledgerSum[0]?.total ? parseInt(ledgerSum[0].total, 10) : 0

  const held = 0
  const available = balance - held

  return c.json({
    data: {
      balance,
      currency: "USD",
      held,
      available,
    },
    requestId: Math.random().toString(36).substring(7),
  })
})
