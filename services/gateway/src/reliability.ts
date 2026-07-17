import { sql } from "drizzle-orm"
import { db } from "./db/client.js"

/**
 * Reliability aggregation layer — the data asset that makes the moat visible.
 *
 * Aggregates per-call `run_events` telemetry into per-(provider,endpoint) stats
 * using Postgres-native `percentile_cont` + `COUNT(*) FILTER (WHERE ...)`. This
 * is the SIGNAL layer only: it does NOT pick providers (that's the router,
 * a later phase needing provider redundancy). Outputs:
 *   - authed `/v1/reliability`    → workspace dashboards + future router
 *   - public  `/leaderboard`      → citable GEO asset (min-calls threshold)
 *
 * The SQL is a global aggregate — no user-controlled parameters are ever
 * interpolated into the query. The optional `provider` filter is passed via
 * drizzle's parameterized `sql` placeholder, never string-concatenated.
 */

export interface ReliabilityStat {
  provider: string
  endpoint: string
  description: string | null
  verified: boolean | null
  totalCalls: number
  successCount: number
  successRate: number
  p50Latency: number | null
  p95Latency: number | null
  avgItemCount: number | null
  avgCostMicros: number | null
  lastCallAt: string | null
}

// drizzle's db.execute<T> requires T satisfies Record<string, unknown>. Raw
// SQL bypasses schema decoding, so postgres-js returns types as the wire form:
// bigint/numeric aggregates arrive as strings, timestamps as ISO strings
// (NOT Date instances). We type accordingly and coerce via Number()/Date in
// the mapper. The index signature satisfies drizzle's execute constraint.
interface ReliabilityRow {
  provider: string
  endpoint: string
  description: string | null
  verified: boolean | null
  total_calls: string
  success_count: string
  success_rate: string
  p50_latency: number | null
  p95_latency: number | null
  avg_item_count: string | null
  avg_cost_micros: string | null
  last_call_at: string | null
  [key: string]: unknown
}

/**
 * Minimum-calls threshold for the public leaderboard. Tools with fewer calls
 * than this are omitted from `/leaderboard` so low-sample tools don't publish
 * misleading 100% success rates. The authed `/v1/reliability` endpoint does
 * NOT apply this threshold — workspaces see their own raw stats regardless.
 */
export const PUBLIC_LEADERBOARD_MIN_CALLS = 3

function rowToStat(r: ReliabilityRow): ReliabilityStat {
  const totalCalls = Number(r.total_calls)
  const successCount = Number(r.success_count)
  return {
    provider: r.provider,
    endpoint: r.endpoint,
    description: r.description,
    verified: r.verified,
    totalCalls,
    successCount,
    successRate: totalCalls > 0 ? Number(r.success_rate) : 0,
    p50Latency: r.p50_latency,
    p95Latency: r.p95_latency,
    avgItemCount: r.avg_item_count === null ? null : Number(r.avg_item_count),
    avgCostMicros:
      r.avg_cost_micros === null ? null : Number(r.avg_cost_micros),
    // postgres-js returns timestamps from raw SQL as ISO strings, not Date
    // instances (drizzle's schema decoder is bypassed in db.execute). Normalize
    // both forms to an ISO string — the wire form is already ISO, Date we
    // convert defensively in case a future driver change decodes it.
    lastCallAt: r.last_call_at
      ? typeof r.last_call_at === "string"
        ? r.last_call_at
        : new Date(r.last_call_at as unknown as string).toISOString()
      : null,
  }
}

/**
 * Aggregate per-(provider,endpoint) reliability from `run_events`, LEFT JOINed
 * to the `tools` catalog for description + verified. A tool may have telemetry
 * before/without a catalog row, or vice versa, so the JOIN must not drop rows
 * on either side.
 *
 * Uses raw SQL via `db.execute` because drizzle's builder has no first-class
 * support for `percentile_cont(...) WITHIN GROUP (ORDER BY ...)` or
 * `COUNT(*) FILTER (WHERE ...)` — both are load-bearing for accurate p50/p95
 * and success-rate-by-group computations.
 *
 * Counts come back as postgres `bigint` -> string (drizzle does not decode
 * bigint aggregates to number by default); `avg_*` come back as `numeric` ->
 * string. We coerce via Number() in the mapper.
 */
export async function getReliabilityStats(
  provider?: string,
): Promise<ReliabilityStat[]> {
  const providerPredicate = provider
    ? sql`AND re.provider = ${provider}`
    : sql``

  const rows = await db.execute<ReliabilityRow>(sql`
    SELECT
      re.provider,
      re.endpoint,
      t.description   AS description,
      t.verified      AS verified,
      COUNT(*)                                          AS total_calls,
      COUNT(*) FILTER (WHERE re.success)                AS success_count,
      CASE WHEN COUNT(*) > 0
           THEN COUNT(*) FILTER (WHERE re.success)::float8 / COUNT(*)::float8
           ELSE 0
      END                                              AS success_rate,
      percentile_cont(0.50) WITHIN GROUP (ORDER BY re.latency_ms) AS p50_latency,
      percentile_cont(0.95) WITHIN GROUP (ORDER BY re.latency_ms) AS p95_latency,
      avg(re.item_count)                               AS avg_item_count,
      avg(re.cost_micros)                              AS avg_cost_micros,
      max(re.created_at)                               AS last_call_at
    FROM run_events re
    LEFT JOIN tools t
      ON t.provider = re.provider
     AND t.path = re.endpoint
    WHERE 1=1 ${providerPredicate}
    GROUP BY re.provider, re.endpoint, t.description, t.verified
    ORDER BY total_calls DESC, re.provider, re.endpoint
  `)

  return rows.map((r) => rowToStat(r as ReliabilityRow))
}
