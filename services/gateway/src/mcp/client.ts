/**
 * Thin HTTP client for the aegntic gateway. Mirrors packages/cli/src/lib/client.ts
 * but synchronous-config (no consola, no process.exit) — this runs inside a
 * stdio MCP server so it must never write to stdout or kill the process.
 *
 * Pure HTTP client: imports NOTHING from db/. No DB connection at module load.
 */

import type {
  ApiResponse,
  BalanceResponse,
  DiscoverResponse,
  InspectResponse,
  Run,
  RunInput,
} from "@aegntic/sdk"

export class GatewayError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = "GatewayError"
  }
}

export interface GatewayClientConfig {
  baseUrl: string
  apiKey: string
}

export function resolveConfig(): GatewayClientConfig {
  const baseUrl = (
    process.env.AEGNTIC_BASE_URL ?? "http://localhost:3101"
  ).replace(/\/+$/, "")
  const apiKey = process.env.AEGNTIC_API_KEY ?? ""
  return { baseUrl, apiKey }
}

async function request<T>(
  cfg: GatewayClientConfig,
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  if (!cfg.apiKey) {
    throw new GatewayError(
      401,
      "AEGNTIC_API_KEY is not set. The MCP server requires a gateway API key.",
    )
  }

  const res = await fetch(`${cfg.baseUrl}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${cfg.apiKey}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const text = await res.text().catch(() => "Unknown error")
    throw new GatewayError(res.status, `${res.status} ${method} ${path}: ${text}`)
  }

  return res.json() as Promise<T>
}

export function discover(
  cfg: GatewayClientConfig,
  query: string,
  opts: { limit?: number; minScore?: number } = {},
): Promise<DiscoverResponse> {
  const params = new URLSearchParams({ q: query })
  if (opts.limit !== undefined) params.set("limit", String(opts.limit))
  if (opts.minScore !== undefined) params.set("minScore", String(opts.minScore))
  return request<ApiResponse<DiscoverResponse>>(cfg, "GET", `/v1/discover?${params}`).then(
    (r) => r.data,
  )
}

export function inspect(
  cfg: GatewayClientConfig,
  provider: string,
  endpoint: string,
): Promise<InspectResponse> {
  const params = new URLSearchParams({ provider, endpoint })
  return request<ApiResponse<InspectResponse>>(cfg, "GET", `/v1/inspect?${params}`).then(
    (r) => r.data,
  )
}

export function createRun(
  cfg: GatewayClientConfig,
  provider: string,
  endpoint: string,
  input: RunInput,
): Promise<Run> {
  return request<ApiResponse<Run>>(cfg, "POST", "/v1/runs", {
    provider,
    endpoint,
    input,
  }).then((r) => r.data)
}

export function getRun(cfg: GatewayClientConfig, runId: string): Promise<Run> {
  return request<ApiResponse<Run>>(cfg, "GET", `/v1/runs/${runId}`).then((r) => r.data)
}

export function getBalance(cfg: GatewayClientConfig): Promise<BalanceResponse> {
  return request<ApiResponse<BalanceResponse>>(cfg, "GET", "/v1/balance").then(
    (r) => r.data,
  )
}

export interface BalanceAuditResponse {
  ok: boolean
  entries: number
  unsignedLegacyEntries: number
  headHash: string | null
  signerPublicKey: string | null
  // auditChain returns more fields (firstBreak, mismatches); pass through.
  [k: string]: unknown
}

export function getBalanceAudit(
  cfg: GatewayClientConfig,
): Promise<BalanceAuditResponse> {
  return request<ApiResponse<BalanceAuditResponse>>(
    cfg,
    "GET",
    "/v1/balance/audit",
  ).then((r) => r.data)
}
