import { Hono } from "hono"
import { db } from "../db/index.js"
import { apiKeys } from "../db/schema.js"
import { and, eq } from "drizzle-orm"
import argon2 from "argon2"
import { nanoid } from "nanoid"
import type { Env } from "../types.js"

export const keysRoute = new Hono<Env>()

keysRoute.get("/keys", async (c) => {
  const workspaceId = c.get("workspaceId")

  const results = await db
    .select()
    .from(apiKeys)
    .where(eq(apiKeys.workspaceId, workspaceId))

  const formatted = results.map((k) => ({
    label: k.label,
    prefix: k.prefix,
    active: k.active,
    createdAt: k.createdAt.toISOString(),
    lastUsedAt: k.lastUsedAt ? k.lastUsedAt.toISOString() : undefined,
  }))

  return c.json({
    data: formatted,
    requestId: Math.random().toString(36).substring(7),
  })
})

keysRoute.post("/keys", async (c) => {
  const workspaceId = c.get("workspaceId")
  const { label } = await c.req.json()

  if (!label) {
    return c.json({ error: "Missing label parameter" }, 400)
  }

  const existing = await db
    .select()
    .from(apiKeys)
    .where(and(eq(apiKeys.workspaceId, workspaceId), eq(apiKeys.label, label)))
    .limit(1)

  if (existing.length > 0) {
    return c.json({ error: `API key with label "${label}" already exists` }, 400)
  }

  const secret = nanoid(32)
  const rawKey = `aegntic_live_${secret}`
  const prefix = rawKey.substring(0, 20)
  const hash = await argon2.hash(rawKey)
  const keyId = `ak_${nanoid(12)}`

  await db.insert(apiKeys).values({
    id: keyId,
    keyHash: hash,
    prefix,
    label,
    workspaceId,
    active: true,
  })

  return c.json({
    data: {
      label,
      prefix,
      active: true,
      createdAt: new Date().toISOString(),
      key: rawKey,
    },
    requestId: Math.random().toString(36).substring(7),
  })
})

keysRoute.delete("/keys/:label", async (c) => {
  const workspaceId = c.get("workspaceId")
  const label = c.req.param("label")

  const activeLabel = c.get("apiKeyLabel")
  if (activeLabel === label) {
    return c.json({ error: "Cannot delete the active API key currently in use" }, 400)
  }

  const result = await db
    .delete(apiKeys)
    .where(and(eq(apiKeys.workspaceId, workspaceId), eq(apiKeys.label, label)))
    .returning()

  if (result.length === 0) {
    return c.json({ error: `API key with label "${label}" not found` }, 404)
  }

  return c.json({
    data: null,
    requestId: Math.random().toString(36).substring(7),
  })
})
