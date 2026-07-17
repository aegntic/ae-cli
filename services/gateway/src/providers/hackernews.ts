import type { ProviderAdapter, RunResult } from "@aegntic/sdk"

/**
 * Hacker News — a REAL no-key provider adapter.
 *
 * Backed by the public Firebase HN API
 * (https://hacker-news.firebaseio.com/v0/). Free, no API key, no signup,
 * server-side fetch (no CORS). Real external data, real ledger charge —
 * exercises the marketplace metering on genuine traffic.
 *
 * Cost is nominal (upstream is free); the unit price exists to drive real
 * billing/telemetry rows, not to model provider economics.
 */

const HN_BASE = "https://hacker-news.firebaseio.com/v0"

/** per_result, USD. Charged once per story item returned. */
const UNIT_PRICE = 0.002

/** Hard upper bound on stories fetched in one call to bound latency + cost. */
const DEFAULT_LIMIT = 10
const MAX_LIMIT = 30

interface HNItem {
  id: number
  title?: string
  url?: string
  score?: number
  by?: string
  time?: number
  type?: string
  descendants?: number
}

export const hackerNewsProvider: ProviderAdapter = {
  name: "hackernews",
  endpoints: [
    {
      provider: "hackernews",
      path: "stories/top",
      description:
        "Top Hacker News stories (real data from the Firebase HN API). Fetches story ids then each item; limit caps the count.",
      inputSchema: {
        queryParams: {
          limit: {
            type: "number",
            description: `Max stories to return (default ${DEFAULT_LIMIT}, capped at ${MAX_LIMIT}).`,
            required: false,
            default: DEFAULT_LIMIT,
          },
        },
      },
      costModel: { type: "per_result", unitPrice: UNIT_PRICE, currency: "USD" },
      verified: true,
    },
    {
      provider: "hackernews",
      path: "user/:id",
      description:
        "Hacker News user profile by id (karma, about, created). Path param `id` is the HN username.",
      inputSchema: {
        pathParams: {
          id: {
            type: "string",
            description: "HN username (e.g. 'pg', 'dang').",
            required: true,
          },
        },
      },
      costModel: { type: "per_call", unitPrice: UNIT_PRICE, currency: "USD" },
      verified: true,
    },
  ],

  async execute(endpoint: string, input): Promise<RunResult> {
    if (endpoint === "stories/top") return executeTopStories(input)
    if (endpoint === "user/:id" || endpoint === "user/") return executeUser(input)
    throw new Error(`hackernews: unknown endpoint ${endpoint}`)
  },

  async estimateCost(endpoint: string, input): Promise<number> {
    if (endpoint === "stories/top") {
      const limit = parseLimit(input.queryParams?.limit)
      return limit * UNIT_PRICE
    }
    if (endpoint === "user/:id" || endpoint === "user/") return UNIT_PRICE
    return 0
  },
}

async function executeTopStories(input: {
  queryParams?: Record<string, string>
}): Promise<RunResult> {
  const limit = parseLimit(input.queryParams?.limit)

  const idsUrl = `${HN_BASE}/topstories.json`
  const idsRes = await fetch(idsUrl, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(10_000),
  })
  if (!idsRes.ok) {
    const body = await idsRes.text().catch(() => "")
    throw new Error(
      `hackernews upstream ${idsRes.status}: ${body.slice(0, 200) || idsRes.statusText}`,
    )
  }
  const ids = (await idsRes.json()) as number[]
  const selected = ids.slice(0, limit)

  const items = await Promise.all(selected.map((id) => fetchItem(id)))
  const compact = items
    .filter((it): it is HNItem => it !== null)
    .map((it) => ({
      id: it.id,
      title: it.title ?? null,
      url: it.url ?? null,
      score: it.score ?? null,
      by: it.by ?? null,
      time: it.time ?? null,
      descendants: it.descendants ?? null,
    }))

  return {
    data: { count: compact.length, items: compact },
    items: compact.length,
    cost: compact.length * UNIT_PRICE,
  }
}

async function executeUser(input: {
  pathParams?: Record<string, string>
}): Promise<RunResult> {
  const id = input.pathParams?.id
  if (!id) throw new Error("hackernews: path param 'id' is required")

  const url = `${HN_BASE}/user/${encodeURIComponent(id)}.json`
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(10_000),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new Error(
      `hackernews upstream ${res.status}: ${body.slice(0, 200) || res.statusText}`,
    )
  }
  const data = (await res.json()) as {
    id?: string
    karma?: number
    about?: string
    created?: number
    submitted?: number[]
  } | null

  if (!data) {
    return { data: { id, found: false }, items: 0, cost: UNIT_PRICE }
  }

  return {
    data: {
      id: data.id ?? id,
      karma: data.karma ?? null,
      about: data.about ?? null,
      created: data.created ?? null,
      submittedCount: Array.isArray(data.submitted) ? data.submitted.length : 0,
      found: true,
    },
    items: 1,
    cost: UNIT_PRICE,
  }
}

async function fetchItem(id: number): Promise<HNItem | null> {
  try {
    const res = await fetch(`${HN_BASE}/item/${id}.json`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10_000),
    })
    if (!res.ok) return null
    return (await res.json()) as HNItem
  } catch {
    // Per-item failure must not fail the whole call — return null and filter.
    return null
  }
}

function parseLimit(raw: string | undefined): number {
  if (raw === undefined || raw === "") return DEFAULT_LIMIT
  const n = Number(raw)
  if (!Number.isFinite(n) || n <= 0) return DEFAULT_LIMIT
  return Math.min(Math.floor(n), MAX_LIMIT)
}
