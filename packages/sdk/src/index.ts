// ─── Provider & Endpoint Types ───

export interface Endpoint {
  provider: string
  path: string
  description: string
  inputSchema: InputSchema
  costModel: CostModel
  verified: boolean
  relevanceScore?: number
}

export interface InputSchema {
  body?: Record<string, SchemaField>
  bodyType?: "json" | "form" | "multipart"
  queryParams?: Record<string, SchemaField>
  pathParams?: Record<string, SchemaField>
}

export interface SchemaField {
  type: "string" | "number" | "boolean" | "array" | "object"
  description?: string
  required?: boolean
  default?: unknown
}

export interface CostModel {
  type: "per_result" | "per_call" | "flat"
  unitPrice: number
  currency: "USD"
}

// ─── Run Types ───

export type RunStatus =
  | "READY"
  | "RUNNING"
  | "COMPLETED"
  | "FAILED"
  | "BLOCKED"
  | "STOPPED"
  | "TIME_OUT"

export interface Run {
  id: string
  workspaceId: string
  provider: string
  endpoint: string
  input: RunInput
  status: RunStatus
  result?: unknown
  resultUri?: string
  cost?: CostBreakdown
  error?: string
  stoppable: boolean
  createdAt: string
  updatedAt: string
}

export interface RunInput {
  body?: Record<string, unknown>
  queryParams?: Record<string, string>
  pathParams?: Record<string, string>
}

export interface CostBreakdown {
  value: number
  currency: "USD"
  items: number
  unitPrice: number
}

// ─── Workspace & Auth Types ───

export interface Workspace {
  id: string
  name: string
  balance: number
  currency: "USD"
  createdAt: string
}

export interface ApiKey {
  label: string
  prefix: string
  active: boolean
  createdAt: string
  lastUsedAt?: string
}

export interface ApiKeyCreated extends ApiKey {
  key: string
}

// ─── API Response Types ───

export interface DiscoverResponse {
  results: Endpoint[]
  total: number
  query: string
}

export interface InspectResponse {
  endpoint: Endpoint
  examples?: RunInput[]
}

export interface BalanceResponse {
  balance: number
  currency: "USD"
  held: number
  available: number
}

export interface HintsBlock {
  nextCommands?: string[]
  relatedEndpoints?: string[]
  caveats?: string[]
}

export interface ApiResponse<T> {
  data: T
  hints?: HintsBlock
  requestId: string
}

// ─── Provider Adapter Interface ───

export interface ProviderAdapter {
  name: string
  endpoints: Endpoint[]
  execute(endpoint: string, input: RunInput): Promise<RunResult>
  estimateCost(endpoint: string, input: RunInput): Promise<number>
}

export interface RunResult {
  data: unknown
  items: number
  cost: number
}

// ─── Client Configuration ───

export interface ClientConfig {
  baseUrl: string
  apiKey: string
  timeout?: number
}

// ─── Client Class Implementation ───

class AegnticClient {
  private baseUrl: string
  private apiKey: string
  private timeout: number

  constructor(config: ClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/+$/, "")
    this.apiKey = config.apiKey
    this.timeout = config.timeout || 30000
  }

  private async request<T>(
    path: string,
    method: "GET" | "POST" | "DELETE",
    body?: unknown,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${path}`
    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), this.timeout)

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      })

      clearTimeout(id)

      if (!response.ok) {
        let errorMsg = `API request failed with status ${response.status}`
        try {
          const errBody = await response.json()
          if (errBody && (errBody as any).error) {
            errorMsg = (errBody as any).error
          }
        } catch {}
        throw new Error(errorMsg)
      }

      return (await response.json()) as ApiResponse<T>
    } catch (error) {
      clearTimeout(id)
      throw error
    }
  }

  async discover(query: string, limit?: number, minScore?: number): Promise<ApiResponse<DiscoverResponse>> {
    const params = new URLSearchParams()
    params.append("q", query)
    if (limit !== undefined) params.append("limit", String(limit))
    if (minScore !== undefined) params.append("minScore", String(minScore))
    return this.request<DiscoverResponse>(`/v1/discover?${params.toString()}`, "GET")
  }

  async inspect(provider: string, endpoint: string): Promise<ApiResponse<InspectResponse>> {
    const params = new URLSearchParams()
    params.append("provider", provider)
    params.append("endpoint", endpoint)
    return this.request<InspectResponse>(`/v1/inspect?${params.toString()}`, "GET")
  }

  async run(
    provider: string,
    endpoint: string,
    input: RunInput,
    options?: { wait?: number; idempotencyKey?: string }
  ): Promise<ApiResponse<Run>> {
    const headers: Record<string, string> = {}
    if (options?.idempotencyKey) {
      headers["Idempotency-Key"] = options.idempotencyKey
    }
    const params = new URLSearchParams()
    if (options?.wait !== undefined) {
      params.append("wait", String(options.wait))
    }
    const queryString = params.toString() ? `?${params.toString()}` : ""
    return this.request<Run>(
      `/v1/runs${queryString}`,
      "POST",
      { provider, endpoint, input },
      headers
    )
  }

  async getRun(runId: string, options?: { wait?: number }): Promise<ApiResponse<Run>> {
    const params = new URLSearchParams()
    if (options?.wait !== undefined) {
      params.append("wait", String(options.wait))
    }
    const queryString = params.toString() ? `?${params.toString()}` : ""
    return this.request<Run>(`/v1/runs/${runId}${queryString}`, "GET")
  }

  async stopRun(runId: string): Promise<ApiResponse<Run>> {
    return this.request<Run>(`/v1/runs/${runId}/stop`, "POST")
  }

  async getBalance(): Promise<ApiResponse<BalanceResponse>> {
    return this.request<BalanceResponse>("/v1/balance", "GET")
  }

  async listKeys(): Promise<ApiResponse<ApiKey[]>> {
    return this.request<ApiKey[]>("/v1/keys", "GET")
  }

  async addKey(label: string, key?: string): Promise<ApiResponse<ApiKeyCreated>> {
    return this.request<ApiKeyCreated>("/v1/keys", "POST", { label, key })
  }

  async removeKey(label: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/v1/keys/${label}`, "DELETE")
  }
}

export { AegnticClient }

