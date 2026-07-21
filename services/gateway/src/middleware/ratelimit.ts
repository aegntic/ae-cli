import type { Context, Next } from "hono"
import type { Env } from "../types.js"

/**
 * Per-workspace fixed-window rate limiter (in-memory), as a factory so tests
 * can drive a small limit without 120 real requests.
 *
 * Runs AFTER authMiddleware on `/v1/*`, so `c.get("workspace")` is populated.
 * In-memory only — correct while the gateway runs as a single Fly machine
 * (auto_stop_machines=true, one replica). When we scale to multiple replicas,
 * move this to Redis or Fly's own rate-limit headers.
 *
 * The map is pruned opportunistically: an elapsed window is replaced on next
 * request, so idle workspaces stop consuming memory after one window.
 */

type Bucket = { count: number; resetAt: number }

export type RateLimiterOptions = {
  max?: number
  windowMs?: number
  /** Stub for tests; production uses Date.now(). */
  now?: () => number
}

export type RateLimitMiddleware = ((
  c: Context<Env>,
  next: Next,
) => Promise<Response | void>) & {
  /** Test seam: wipe all buckets. */
  __reset: () => void
}

export function createRateLimiter(
  opts: RateLimiterOptions = {},
): RateLimitMiddleware {
  const max = opts.max ?? 120
  const windowMs = opts.windowMs ?? 60_000
  const now = opts.now ?? (() => Date.now())
  const buckets = new Map<string, Bucket>()

  const middleware = async (
    c: Context<Env>,
    next: Next,
  ): Promise<Response | void> => {
    const workspace = c.get("workspace")
    // Defensive: only authed /v1/* reaches here. Unauthed -> skip.
    if (!workspace) return await next()

    const t = now()
    const bucket = buckets.get(workspace.id)

    if (!bucket || t > bucket.resetAt) {
      const resetAt = t + windowMs
      buckets.set(workspace.id, { count: 1, resetAt })
      setHeaders(c, 1, resetAt, max)
      return await next()
    }

    bucket.count += 1
    const limited = bucket.count > max
    setHeaders(c, bucket.count, bucket.resetAt, max, limited)

    if (limited) {
      const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - t) / 1000))
      c.header("Retry-After", String(retryAfter))
      return c.json({ error: "Rate limit exceeded. Try again shortly." }, 429)
    }

    return await next()
  }

  const withReset = middleware as RateLimitMiddleware
  withReset.__reset = () => buckets.clear()
  return withReset
}

function setHeaders(
  c: Context<Env>,
  count: number,
  resetAt: number,
  max: number,
  limited = false,
): void {
  const remaining = limited ? 0 : Math.max(0, max - count)
  c.header("X-RateLimit-Limit", String(max))
  c.header("X-RateLimit-Remaining", String(remaining))
  c.header("X-RateLimit-Reset", String(Math.ceil(resetAt / 1000)))
}

// Production default — 120 requests / workspace / minute.
export const rateLimitMiddleware = createRateLimiter()
