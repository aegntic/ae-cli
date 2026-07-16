import type { Context, Next } from "hono"
import type { Env } from "../types.js"
import { lookupWorkspaceByToken } from "../store.js"

export async function authMiddleware(c: Context<Env>, next: Next) {
  const header = c.req.header("Authorization")

  if (!header?.startsWith("Bearer ")) {
    return c.json({ error: "Missing or malformed Authorization header" }, 401)
  }

  const token = header.slice(7)
  const workspace = lookupWorkspaceByToken(token)

  if (!workspace) {
    return c.json({ error: "Invalid API key" }, 401)
  }

  c.set("workspace", workspace)
  await next()
}
