// Canonical gateway origin for all web surfaces (console + leaderboard).
// Vercel: set NEXT_PUBLIC_AEGNTIC_BASE_URL to the gateway Fly URL in project env.
const BASE = process.env.NEXT_PUBLIC_AEGNTIC_BASE_URL ?? "http://localhost:3101";

export interface Endpoint {
  provider: string;
  path: string;
  description: string;
  inputSchema: InputSchema;
  costModel: CostModel;
  verified: boolean;
  relevanceScore?: number;
}

export interface InputSchema {
  body?: Record<string, SchemaField>;
  bodyType?: "json" | "form" | "multipart";
  queryParams?: Record<string, SchemaField>;
  pathParams?: Record<string, SchemaField>;
}

export interface SchemaField {
  type: "string" | "number" | "boolean" | "array" | "object";
  description?: string;
  required?: boolean;
  default?: unknown;
}

export interface CostModel {
  type: "per_result" | "per_call" | "flat";
  unitPrice: number;
  currency: "USD";
}

export type RunStatus =
  | "READY"
  | "RUNNING"
  | "COMPLETED"
  | "FAILED"
  | "BLOCKED"
  | "STOPPED"
  | "TIME_OUT";

export interface Run {
  id: string;
  workspaceId: string;
  provider: string;
  endpoint: string;
  input: RunInput;
  status: RunStatus;
  result?: unknown;
  resultUri?: string;
  cost?: CostBreakdown;
  error?: string;
  stoppable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RunInput {
  body?: Record<string, unknown>;
  queryParams?: Record<string, string>;
  pathParams?: Record<string, string>;
}

export interface CostBreakdown {
  value: number;
  currency: "USD";
  items: number;
  unitPrice: number;
}

export interface ApiKey {
  label: string;
  prefix: string;
  active: boolean;
  createdAt: string;
  lastUsedAt?: string;
}

export interface ApiKeyCreated extends ApiKey {
  key: string;
}

export interface BalanceResponse {
  balance: number;
  currency: "USD";
  held: number;
  available: number;
}

export interface DiscoverResponse {
  results: Endpoint[];
  total: number;
  query: string;
}

export interface InspectResponse {
  endpoint: Endpoint;
  examples?: RunInput[];
}

export interface HintsBlock {
  nextCommands?: string[];
  relatedEndpoints?: string[];
  caveats?: string[];
}

export interface ApiResponse<T> {
  data: T;
  hints?: HintsBlock;
  requestId: string;
}

async function request<T>(
  path: string,
  apiKey: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? `Request failed: ${res.status}`);
  }
  return res.json();
}

export async function discover(apiKey: string, q: string) {
  return request<ApiResponse<DiscoverResponse>>(
    `/discover?q=${encodeURIComponent(q)}`,
    apiKey
  );
}

export async function inspect(
  apiKey: string,
  provider: string,
  endpoint: string
) {
  return request<ApiResponse<InspectResponse>>(
    `/inspect?provider=${encodeURIComponent(provider)}&endpoint=${encodeURIComponent(endpoint)}`,
    apiKey
  );
}

export async function listRuns(apiKey: string, limit = 50) {
  return request<ApiResponse<Run[]>>(`/runs?limit=${limit}`, apiKey);
}

export async function getRun(apiKey: string, id: string) {
  return request<ApiResponse<Run>>(`/runs/${id}`, apiKey);
}

export async function getBalance(apiKey: string) {
  return request<ApiResponse<BalanceResponse>>("/balance", apiKey);
}

export async function listKeys(apiKey: string) {
  return request<ApiResponse<ApiKey[]>>("/keys", apiKey);
}

export async function createKey(apiKey: string, label: string) {
  return request<ApiResponse<ApiKeyCreated>>("/keys", apiKey, {
    method: "POST",
    body: JSON.stringify({ label }),
  });
}

export async function deleteKey(apiKey: string, label: string) {
  return request<{ deleted: boolean; label: string }>(
    `/keys/${encodeURIComponent(label)}`,
    apiKey,
    { method: "DELETE" }
  );
}
