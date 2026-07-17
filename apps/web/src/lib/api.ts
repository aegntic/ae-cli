import type {
  Endpoint,
  DiscoverResponse,
  InspectResponse,
  Run,
  RunInput,
  BalanceResponse,
  ApiKey,
  ApiKeyCreated,
} from "@aegntic/sdk"

export type {
  Endpoint,
  DiscoverResponse,
  InspectResponse,
  Run,
  RunInput,
  BalanceResponse,
  ApiKey,
  ApiKeyCreated,
} from "@aegntic/sdk"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3100"

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

async function request<T>(
  path: string,
  apiKey: string,
  options: { method?: "GET" | "POST" | "DELETE"; body?: unknown } = {}
): Promise<T> {
  const { method = "GET", body } = options
  const url = `${API_URL}${path}`

  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
  })

  if (!res.ok) {
    let message = `Request failed (${res.status})`
    try {
      const err = await res.json()
      if (err && typeof err.error === "string") message = err.error
    } catch {
      /* ignore parse errors */
    }
    throw new ApiError(message, res.status)
  }

  const json = await res.json()
  return json.data as T
}

export const api = {
  discover(q: string, apiKey: string): Promise<DiscoverResponse> {
    const params = new URLSearchParams({ q })
    return request<DiscoverResponse>(`/v1/discover?${params.toString()}`, apiKey)
  },

  inspect(provider: string, endpoint: string, apiKey: string): Promise<InspectResponse> {
    const params = new URLSearchParams({ provider, endpoint })
    return request<InspectResponse>(`/v1/inspect?${params.toString()}`, apiKey)
  },

  listRuns(limit = 20, apiKey: string): Promise<Run[]> {
    const params = new URLSearchParams({ limit: String(limit) })
    return request<Run[]>(`/v1/runs?${params.toString()}`, apiKey)
  },

  getRun(id: string, apiKey: string): Promise<Run> {
    return request<Run>(`/v1/runs/${encodeURIComponent(id)}`, apiKey)
  },

  getBalance(apiKey: string): Promise<BalanceResponse> {
    return request<BalanceResponse>("/v1/balance", apiKey)
  },

  listKeys(apiKey: string): Promise<ApiKey[]> {
    return request<ApiKey[]>("/v1/keys", apiKey)
  },

  createKey(label: string, apiKey: string): Promise<ApiKeyCreated> {
    return request<ApiKeyCreated>("/v1/keys", apiKey, {
      method: "POST",
      body: { label },
    })
  },

  deleteKey(label: string, apiKey: string): Promise<void> {
    return request<void>(`/v1/keys/${encodeURIComponent(label)}`, apiKey, {
      method: "DELETE",
    })
  },

  run(provider: string, endpoint: string, input: RunInput, apiKey: string): Promise<Run> {
    return request<Run>("/v1/runs", apiKey, {
      method: "POST",
      body: { provider, endpoint, input },
    })
  },
}
