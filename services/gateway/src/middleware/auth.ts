import { MiddlewareHandler } from "hono"
import { db } from "../db/index.js"
import { apiKeys } from "../db/schema.js"
import { eq } from "drizzle-orm"
import argon2 from "argon2"

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const authHeader = c.req.header("Authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "Missing or invalid Authorization header" }, 401)
  }

  const rawKey = authHeader.substring(7).trim()
  if (!rawKey) {
    return c.json({ error: "API key is empty" }, 401)
  }

  // Extract prefix: first 20 characters
  const prefix = rawKey.substring(0, 20)

  // Find all active API keys with the same prefix
  const keys = await db
    .select()
    .from(apiKeys)
    .where(eq(apiKeys.prefix, prefix))

  let matchedKey = null
  for (const key of keys) {
    if (!key.active) continue
    const isMatch = await argon2.verify(key.keyHash, rawKey)
    if (isMatch) {
      matchedKey = key
      break
    }
  }

  if (!matchedKey) {
    return c.json({ error: "Invalid API key" }, 401)
  }

  // Set workspaceId and key info in context
  c.set("workspaceId", matchedKey.workspaceId)
  c.set("apiKeyLabel", matchedKey.label)

  // Update lastUsedAt asynchronously
  db.update(apiKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(apiKeys.keyHash, matchedKey.keyHash))
    .execute()
    .catch((err) => console.error("Failed to update lastUsedAt:", err))

  await next()
}
