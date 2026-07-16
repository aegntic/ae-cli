import consola from "consola"
import { getConfig } from "./config.js"
import type {
  ApiResponse,
  BalanceResponse,
  DiscoverResponse,
  InspectResponse,
  Run,
  RunInput,
  ApiKey,
} from "@aegntic/sdk"

interface DiscoverOpts {
  limit?: number
  minScore?: number
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const { baseUrl, apiKey } = await getConfig()

  if (!apiKey) {
    consola.error("No API key configured. Run `aegntic setup` or set AEGNTIC_API_KEY.")
    process.exit(1)
  }

  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const text = await res.text().catch(() => "Unknown error")
    consola.error(`API ${method} ${path} failed (${res.status}): ${text}`)
    process.exit(1)
  }

  return res.json() as Promise<T>
}

export async function discover(
  query: string,
  opts: DiscoverOpts = {},
): Promise<DiscoverResponse> {
  const params = new URLSearchParams({ q: query })
  if (opts.limit !== undefined) params.set("limit", String(opts.limit))
  if (opts.minScore !== undefined) params.set("minScore", String(opts.minScore))

  const res = await request<ApiResponse<DiscoverResponse>>(
    "GET",
    `/v1/discover?${params}`,
  )
  return res.data
}

export async function inspect(
  provider: string,
  endpoint: string,
): Promise<InspectResponse> {
  const params = new URLSearchParams({ provider, endpoint })
  const res = await request<ApiResponse<InspectResponse>>(
    "GET",
    `/v1/inspect?${params}`,
  )
  return res.data
}

export async function createRun(
  provider: string,
  endpoint: string,
  input: RunInput,
): Promise<Run> {
  const res = await request<ApiResponse<Run>>(
    "POST",
    `/v1/runs`,
    { provider, endpoint, input },
  )
  return res.data
}

export async function getRun(runId: string): Promise<Run> {
  const res = await request<ApiResponse<Run>>("GET", `/v1/runs/${runId}`)
  return res.data
}

export async function getBalance(): Promise<BalanceResponse> {
  const res = await request<ApiResponse<BalanceResponse>>("GET", "/v1/balance")
  return res.data
}

export async function listKeys(): Promise<ApiKey[]> {
  const res = await request<ApiResponse<ApiKey[]>>("GET", "/v1/keys")
  return res.data
}

export async function addKey(
  key: string,
  label: string,
): Promise<ApiKey> {
  const res = await request<ApiResponse<ApiKey>>(
    "POST",
    "/v1/keys",
    { key, label },
  )
  return res.data
}
