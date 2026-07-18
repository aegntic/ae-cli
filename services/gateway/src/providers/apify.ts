import type { ProviderAdapter, RunResult } from "@aegntic/sdk"

/**
 * Apify — the first CREDENTIALED provider adapter.
 *
 * Apify (https://apify.com) is a marketplace of web scraping/automation actors
 * (google search, twitter/x posts, instagram, rag-web-browser, …) billed per
 * result. This is the real marketplace primitive: callers pay per scraped
 * item through the exact same ProviderAdapter contract used by every other
 * provider, and the gateway writes real telemetry rows for each call.
 *
 * SECURITY: the token is read ONLY from `process.env.AEGNTIC_APIFY_TOKEN`. It
 * is never hardcoded, never logged, never echoed in error messages, never
 * serialized into test fixtures. If the env var is unset, this module exports
 * `undefined` via `apifyProviderIfConfigured` and the registry skips it; a
 * generic log line ("Apify token not configured — adapter disabled") is
 * emitted by the registry wiring, never the token value.
 *
 * Upstream contract: Apify API v2, sync run endpoint.
 *   POST https://api.apify.com/v2/acts/{username~actorName}/run-sync-get-dataset-items?token=${TOKEN}&timeout=60
 * Body = the actor input. Response = a JSON array of dataset items. We treat
 * the array length as the items count and bill per_result.
 *
 * Actors chosen here are all free-tier-callable without manual permission
 * approval on a fresh Apify account (verified against the store):
 *   - apify/hello-world        — sample actor, returns [{message}]. Smoke/echo.
 *   - apify/rag-web-browser    — search + content fetch. Powering web/search
 *                                 and web/scrape (URL accepted as query).
 */

const APIFY_BASE = "https://api.apify.com/v2/acts"

/** Per-result USD. Apify charges per scraped item; nominal unit price here. */
const UNIT_PRICE = 0.01

/** Sync-run upstream timeout (seconds, forwarded to Apify as ?timeout=). */
const UPSTREAM_TIMEOUT_SEC = 60

/** Hard local cap (ms) so a hung actor can't hold a run forever. */
const LOCAL_TIMEOUT_MS = 65_000

/** Default + cap on result count to bound cost on any single call. */
const DEFAULT_RESULTS = 3
const MAX_RESULTS = 10

interface ApifyDatasetItem {
  [key: string]: unknown
}

interface RunInputInternal {
  queryParams?: Record<string, string>
  body?: Record<string, unknown>
}

function getToken(): string | undefined {
  return process.env.AEGNTIC_APIFY_TOKEN
}

/**
 * Build the Apify adapter, bound to a specific token. Exported for tests
 * (which inject a fake token without touching process.env). The registry
 * uses `apifyProviderIfConfigured`, which reads the env.
 */
export function makeApifyProvider(token: string): ProviderAdapter {
  return {
    name: "apify",
    endpoints: [
      {
        provider: "apify",
        path: "system/echo",
        description:
          "Apify health probe via the apify/hello-world actor. Returns a single greeting item. Use to verify credentials and end-to-end metering without burning scrape credit.",
        inputSchema: {
          queryParams: {},
        },
        costModel: {
          type: "per_result",
          unitPrice: UNIT_PRICE,
          currency: "USD",
        },
        verified: true,
      },
      {
        provider: "apify",
        path: "web/search",
        description:
          "Web search via the apify/rag-web-browser actor. Pass `query` and optional `maxResults` (default 3, capped at 10). Returns search results with title, url, description, and page markdown content.",
        inputSchema: {
          queryParams: {
            query: {
              type: "string",
              description: "Search query (e.g. 'apify free tier actors').",
              required: true,
            },
            maxResults: {
              type: "number",
              description: `Max results to return (default ${DEFAULT_RESULTS}, capped at ${MAX_RESULTS}).`,
              required: false,
              default: DEFAULT_RESULTS,
            },
          },
        },
        costModel: {
          type: "per_result",
          unitPrice: UNIT_PRICE,
          currency: "USD",
        },
        verified: true,
      },
      {
        provider: "apify",
        path: "web/scrape",
        description:
          "Scrape a single URL via the apify/rag-web-browser actor. Pass `url`. Returns the page metadata (title, description) and full markdown content.",
        inputSchema: {
          queryParams: {
            url: {
              type: "string",
              description: "Absolute URL to scrape (e.g. 'https://example.com').",
              required: true,
            },
          },
        },
        costModel: {
          type: "per_result",
          unitPrice: UNIT_PRICE,
          currency: "USD",
        },
        verified: true,
      },
    ],

    async execute(endpoint, input): Promise<RunResult> {
      if (endpoint === "system/echo") {
        return runActor(token, "apify~hello-world", {})
      }
      if (endpoint === "web/search") {
        const query = input.queryParams?.query
        if (!query) {
          throw new Error("apify: query param 'query' is required for web/search")
        }
        const maxResults = parseMaxResults(input.queryParams?.maxResults)
        return runActor(token, "apify~rag-web-browser", {
          query,
          maxResults,
        })
      }
      if (endpoint === "web/scrape") {
        const url = input.queryParams?.url
        if (!url) {
          throw new Error("apify: query param 'url' is required for web/scrape")
        }
        return runActor(token, "apify~rag-web-browser", {
          query: url,
          maxResults: 1,
        })
      }
      throw new Error(`apify: unknown endpoint ${endpoint}`)
    },

    async estimateCost(endpoint, input): Promise<number> {
      if (endpoint === "system/echo") {
        // Hello world always returns exactly 1 item.
        return UNIT_PRICE
      }
      if (endpoint === "web/search") {
        return parseMaxResults(input.queryParams?.maxResults) * UNIT_PRICE
      }
      if (endpoint === "web/scrape") {
        // Always maxResults=1 internally.
        return UNIT_PRICE
      }
      return 0
    },
  }
}

/**
 * Returns the Apify provider iff the token is configured in the env. The
 * registry calls this at boot; if it returns undefined the adapter is simply
 * not registered (and the catalog seed sees nothing to ingest). No token
 * value is ever surfaced here — presence is a boolean check.
 */
export function apifyProviderIfConfigured(): ProviderAdapter | undefined {
  const token = getToken()
  if (!token || token.trim() === "") return undefined
  return makeApifyProvider(token)
}

/**
 * Run an Apify actor synchronously and return the dataset items as a
 * RunResult. Centralizes upstream error handling so no caller can leak the
 * token into a thrown message: the URL is constructed locally and only the
 * Apify-provided error body is forwarded.
 */
async function runActor(
  token: string,
  actorId: string,
  body: Record<string, unknown>,
): Promise<RunResult> {
  const url =
    `${APIFY_BASE}/${actorId}/run-sync-get-dataset-items` +
    `?token=${encodeURIComponent(token)}&timeout=${UPSTREAM_TIMEOUT_SEC}`

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
    // Local hard cap slightly above the upstream timeout so the Apify side
    // gets to return its own error envelope when it can.
    signal: AbortSignal.timeout(LOCAL_TIMEOUT_MS),
  })

  if (!res.ok) {
    // Forward ONLY the Apify error message body. The token is in the URL
    // (query string), never in the body — strip nothing extra, just do not
    // append the request URL.
    const errBody = await res.text().catch(() => "")
    const parsed = safeParseJson(errBody)
    const apifyMessage =
      parsed &&
      typeof parsed === "object" &&
      "error" in parsed &&
      parsed.error &&
      typeof parsed.error === "object" &&
      "message" in parsed.error &&
      typeof parsed.error.message === "string"
        ? parsed.error.message
        : errBody.slice(0, 200) || res.statusText
    throw new Error(`apify upstream ${res.status}: ${apifyMessage}`)
  }

  // The sync endpoint returns the dataset items directly as a JSON array.
  // An empty 200 is valid (zero results); treat as 0 items.
  const items = (await res.json()) as ApifyDatasetItem[] | ApifyDatasetItem
  const arr = Array.isArray(items) ? items : [items]

  return {
    data: { count: arr.length, items: arr },
    items: arr.length,
    cost: arr.length * UNIT_PRICE,
  }
}

function parseMaxResults(raw: string | undefined): number {
  if (raw === undefined || raw === "") return DEFAULT_RESULTS
  const n = Number(raw)
  if (!Number.isFinite(n) || n <= 0) return DEFAULT_RESULTS
  return Math.min(Math.floor(n), MAX_RESULTS)
}

function safeParseJson(s: string): unknown {
  try {
    return JSON.parse(s)
  } catch {
    return undefined
  }
}
