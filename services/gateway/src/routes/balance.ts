import { Hono } from "hono"
import { nanoid } from "nanoid"
import { getBalance } from "../store.js"
import type { Env } from "../types.js"
import type { BalanceResponse, ApiResponse } from "@aegntic/sdk"

export const balanceRoute = new Hono<Env>()

balanceRoute.get("/balance", async (c) => {
  const workspace = c.get("workspace")
  const record = await getBalance(workspace.id)

  const data: BalanceResponse = {
    balance: record.balance,
    currency: "USD",
    held: record.held,
    available: record.balance - record.held,
  }

  const response: ApiResponse<BalanceResponse> = {
    data,
    requestId: nanoid(8),
  }

  return c.json(response)
})
