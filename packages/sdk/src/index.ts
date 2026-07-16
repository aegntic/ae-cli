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
