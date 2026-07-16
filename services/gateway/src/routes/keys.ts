import { Hono } from "hono"
import { nanoid } from "nanoid"
import { createApiKey, listApiKeys, deleteApiKey } from "../store.js"
import type { Env } from "../types.js"
import type { ApiKey, ApiKeyCreated, ApiResponse } from "@aegntic/sdk"

export const keysRoute = new Hono<Env>()

keysRoute.post("/keys", async (c) => {
  const workspace = c.get("workspace")
  const body = await c.req.json<{ label: string }>().catch(() => ({})) as { label?: string }
  const label = body.label ?? `key-${nanoid(4)}`

  const created = await createApiKey(workspace.id, label)

  const response: ApiResponse<ApiKeyCreated> = {
    data: created,
    hints: {
      caveats: ["Store this key securely. It will not be shown again."],
    },
    requestId: nanoid(8),
  }

  return c.json(response, 201)
})

keysRoute.get("/keys", async (c) => {
  const workspace = c.get("workspace")
  const keys = await listApiKeys(workspace.id)

  const response: ApiResponse<ApiKey[]> = {
    data: keys,
    requestId: nanoid(8),
  }

  return c.json(response)
})

keysRoute.delete("/keys/:label", async (c) => {
  const workspace = c.get("workspace")
  const label = c.req.param("label")

  const deleted = await deleteApiKey(workspace.id, label)
  if (!deleted) {
    return c.json({ error: `Key with label '${label}' not found` }, 404)
  }

  return c.json({ deleted: true, label })
})
