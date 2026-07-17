import { nanoid } from "nanoid"
import { sql } from "drizzle-orm"
import { db } from "./client.js"
import {
  createRun,
  updateRun,
  recordRunEvent,
  type NewRunEventInput,
} from "../store.js"
import { openMeteoProvider } from "../providers/openmeteo.js"
import { hackerNewsProvider } from "../providers/hackernews.js"
import { coinGeckoProvider } from "../providers/coingecko.js"
import { frankfurterProvider } from "../providers/frankfurter.js"
import { sha256 } from "@noble/hashes/sha256"

/**
 * Seed run_events with HONEST telemetry by calling real provider adapters
 * against live upstream APIs. Each call makes genuine network requests
 * (no mocking) and writes the outcome to run_events via recordRunEvent.
 *
 * This populates the reliability leaderboard with real data so the moat
 * thesis (observable per-provider reliability) is demonstrable: real
 * latencies, real success/failure rates, real result hashes.
 *
 * Makes REAL external calls. Network required; rate limits apply
 * (especially CoinGecko ~10-30/min — calls are modest and spaced).
 *
 * Includes ONE deliberate failure (restcountries with a name that returns
 * upstream 404) so the leaderboard is not artificially 100% — there is a
 * non-trivial success rate to make the reliability stat meaningful.
 *
 * Run once against :5435:
 *   pnpm --filter @aegntic/gateway exec tsx src/db/seed-runs.ts
 *
 * Idempotent in shape: re-running appends additional genuine events. Does
 * NOT fabricate rows — every event below corresponds to a real call.
 */

const WORKSPACE_ID = "ws_default"

interface CallSpec {
  provider: string
  endpoint: string
  /** RunInput passed to createRun + execute. */
  input: Record<string, unknown>
  /** Direct adapter invocation; may throw on upstream error. */
  run: () => Promise<{ data: unknown; items: number; cost: number }>
}

const SPACING_MS = 600

function hashResult(data: unknown): string {
  const canonical = JSON.stringify(data)
  return Buffer.from(sha256(Buffer.from(canonical, "utf8"))).toString("hex")
}

async function runOne(spec: CallSpec): Promise<"ok" | "err"> {
  // run_events.run_id has an FK to runs.id, so we must create the parent
  // run row first. Mirror the runs route: insert with RUNNING, then update
  // to COMPLETED/FAILED after the adapter returns.
  const run = await createRun(
    WORKSPACE_ID,
    spec.provider,
    spec.endpoint,
    spec.input as never,
  )
  const runId = run.id
  await updateRun(runId, { status: "RUNNING" })

  const t0 = Date.now()
  try {
    const result = await spec.run()
    const latencyMs = Date.now() - t0
    await updateRun(runId, {
      status: "COMPLETED",
      result: result.data,
      stoppable: false,
    })
    const event: NewRunEventInput = {
      runId,
      workspaceId: WORKSPACE_ID,
      provider: spec.provider,
      endpoint: spec.endpoint,
      latencyMs,
      success: true,
      itemCount: result.items,
      resultHash: hashResult(result.data),
      costMicros: Math.round(result.cost * 1e4),
    }
    await recordRunEvent(event)
    // eslint-disable-next-line no-console
    console.log(
      `[seed-runs] OK  ${spec.provider}/${spec.endpoint}  ${latencyMs}ms  items=${result.items}  cost=$${result.cost.toFixed(4)}`,
    )
    return "ok"
  } catch (err) {
    const latencyMs = Date.now() - t0
    const errorMessage = err instanceof Error ? err.message : "Unknown error"
    await updateRun(runId, {
      status: "FAILED",
      error: errorMessage,
      stoppable: false,
    })
    const event: NewRunEventInput = {
      runId,
      workspaceId: WORKSPACE_ID,
      provider: spec.provider,
      endpoint: spec.endpoint,
      latencyMs,
      success: false,
      httpStatus: extractStatus(errorMessage),
      errorMessage,
    }
    await recordRunEvent(event)
    // eslint-disable-next-line no-console
    console.log(
      `[seed-runs] ERR ${spec.provider}/${spec.endpoint}  ${latencyMs}ms  ${errorMessage.slice(0, 140)}`,
    )
    return "err"
  }
}

function extractStatus(msg: string): number | null {
  const m = msg.match(/upstream (\d{3})/)
  return m ? Number(m[1]) : null
}

async function sleep(ms: number): Promise<void> {
  await new Promise((r) => setTimeout(r, ms))
}

/**
 * Builds the call list. Mix of providers; CoinGecko calls are kept to 3 and
 * spaced to avoid tripping the rate limit. The final restcountries call
 * uses a deliberately-bogus name that the upstream will 404 — a REAL
 * failure, not a fabricated row.
 */
function buildCallSpecs(): CallSpec[] {
  const specs: CallSpec[] = []

  // Open-Meteo (already-shipped provider; adds comparative telemetry)
  specs.push(
    openmeteoSpec({ lat: "52.52", lon: "13.405" }),
    openmeteoSpec({ lat: "40.7128", lon: "-74.0060" }),
    openmeteoSpec({ lat: "35.6762", lon: "139.6503" }),
  )

  // Hacker News
  specs.push({
    provider: "hackernews",
    endpoint: "stories/top",
    input: { queryParams: { limit: "5" } },
    run: () =>
      hackerNewsProvider.execute("stories/top", { queryParams: { limit: "5" } }),
  })
  specs.push({
    provider: "hackernews",
    endpoint: "stories/top",
    input: { queryParams: { limit: "3" } },
    run: () =>
      hackerNewsProvider.execute("stories/top", { queryParams: { limit: "3" } }),
  })
  specs.push({
    provider: "hackernews",
    endpoint: "user/:id",
    input: { pathParams: { id: "pg" } },
    run: () => hackerNewsProvider.execute("user/:id", { pathParams: { id: "pg" } }),
  })

  // CoinGecko — modest count, spaced in the runner to dodge 429
  for (const id of ["bitcoin", "ethereum", "solana"]) {
    specs.push({
      provider: "coingecko",
      endpoint: "markets",
      input: { queryParams: { ids: id, limit: "1" } },
      run: () =>
        coinGeckoProvider.execute("markets", {
          queryParams: { ids: id, limit: "1" },
        }),
    })
  }

  // Frankfurter — success cases
  specs.push({
    provider: "frankfurter",
    endpoint: "rates/latest",
    input: { queryParams: { from: "USD", to: "EUR,GBP,JPY" } },
    run: () =>
      frankfurterProvider.execute("rates/latest", {
        queryParams: { from: "USD", to: "EUR,GBP,JPY" },
      }),
  })
  specs.push({
    provider: "frankfurter",
    endpoint: "rates/latest",
    input: { queryParams: { from: "EUR", to: "USD" } },
    run: () =>
      frankfurterProvider.execute("rates/latest", {
        queryParams: { from: "EUR", to: "USD" },
      }),
  })
  specs.push({
    provider: "frankfurter",
    endpoint: "rates/2026-01-06",
    input: { pathParams: { date: "2026-01-06" }, queryParams: { from: "USD", to: "EUR,GBP" } },
    run: () =>
      frankfurterProvider.execute("rates/2026-01-06", {
        pathParams: { date: "2026-01-06" },
        queryParams: { from: "USD", to: "EUR,GBP" },
      }),
  })

  // DELIBERATE FAILURE — Frankfurter rejects unknown currency codes with
  // HTTP 404. This is a REAL failed call (genuine 404 from the upstream),
  // not a fabricated row — keeps the leaderboard's success rate < 100%.
  specs.push({
    provider: "frankfurter",
    endpoint: "rates/latest",
    input: { queryParams: { from: "ZZZNOTACURRENCY" } },
    run: () =>
      frankfurterProvider.execute("rates/latest", {
        queryParams: { from: "ZZZNOTACURRENCY" },
      }),
  })

  return specs
}

function openmeteoSpec(q: { lat: string; lon: string }): CallSpec {
  return {
    provider: "openmeteo",
    endpoint: "weather/current",
    input: { queryParams: q },
    run: () => openMeteoProvider.execute("weather/current", { queryParams: q }),
  }
}

async function main(): Promise<void> {
  const specs = buildCallSpecs()
  let runOk = 0
  let runErr = 0

  for (const spec of specs) {
    const outcome = await runOne(spec)
    if (outcome === "ok") runOk++
    else runErr++
    await sleep(SPACING_MS)
  }

  // Pull the all-time tally from the DB so the summary reflects reality,
  // not memory. Includes events from prior runs of this script too.
  const rows = await db.execute<{
    provider: string
    endpoint: string
    n: number
    ok: number
  }>(sql`
    SELECT
      provider,
      endpoint,
      count(*)::int AS n,
      sum(CASE WHEN success THEN 1 ELSE 0 END)::int AS ok
    FROM run_events
    WHERE workspace_id = ${WORKSPACE_ID}
    GROUP BY provider, endpoint
    ORDER BY provider, endpoint
  `)

  // eslint-disable-next-line no-console
  console.log("\n[seed-runs] run_events summary (this workspace, all runs):")
  let totalOk = 0
  let totalErr = 0
  for (const r of rows) {
    // eslint-disable-next-line no-console
    console.log(`  ${r.provider}/${r.endpoint}  total=${r.n}  success=${r.ok}`)
    totalOk += r.ok
    totalErr += r.n - r.ok
  }
  // eslint-disable-next-line no-console
  console.log(
    `[seed-runs] wrote ${specs.length} events this run (success=${runOk}  fail=${runErr}); ` +
      `workspace all-time totals: success=${totalOk}  fail=${totalErr}`,
  )
}

if (import.meta.main) {
  main()
    .then(() => process.exit(0))
    .catch((e) => {
      // eslint-disable-next-line no-console
      console.error("[seed-runs] fatal:", e)
      process.exit(1)
    })
}
