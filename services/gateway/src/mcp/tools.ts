/**
 * MCP tool definitions and handlers for the aegntic gateway.
 *
 * Each handler returns MCP-compliant tool result content. On API error the
 * handler returns an `isError: true` result rather than throwing — the stdio
 * server must stay alive across calls.
 */

import type {
  BalanceResponse,
  DiscoverResponse,
  InspectResponse,
  Run,
} from "@aegntic/sdk"
import {
  type GatewayClientConfig,
  type BalanceAuditResponse,
  GatewayError,
  resolveConfig,
  discover as apiDiscover,
  inspect as apiInspect,
  createRun,
  getRun,
  getBalance,
  getBalanceAudit,
} from "./client.js"

// ─── MCP result shape (subset of the spec we emit) ───

export interface McpTextContent {
  type: "text"
  text: string
}

export interface McpToolResult {
  content: McpTextContent[]
  isError?: boolean
}

export interface McpToolDef {
  name: string
  description: string
  inputSchema: Record<string, unknown>
}

// ─── Tool definitions ───

export const TOOL_DEFS: McpToolDef[] = [
  {
    name: "discover",
    description:
      "Search the aegntic endpoint catalog by natural-language query. Returns ranked provider endpoints with cost models and relevance scores.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Natural-language search (e.g. 'weather forecast', 'IP geolocation').",
        },
        limit: {
          type: "number",
          description: "Max results (default 10, cap 50).",
        },
      },
      required: ["query"],
      additionalProperties: false,
    },
  },
  {
    name: "inspect",
    description:
      "Get the full input schema, cost model, and example input for a specific provider endpoint. Call this before `run` to learn required fields.",
    inputSchema: {
      type: "object",
      properties: {
        provider: { type: "string", description: "Provider slug (e.g. 'openmeteo')." },
        endpoint: { type: "string", description: "Endpoint path (e.g. '/forecast')." },
      },
      required: ["provider", "endpoint"],
      additionalProperties: false,
    },
  },
  {
    name: "run",
    description:
      "Create a new async run on a provider endpoint. Returns the run object (status READY/RUNNING). Poll with `get_run` to fetch the result and cost. Charges land on the workspace balance on completion.",
    inputSchema: {
      type: "object",
      properties: {
        provider: { type: "string" },
        endpoint: { type: "string" },
        input: {
          type: "object",
          description:
            "RunInput: { body?, queryParams?, pathParams? }. Use `inspect` to learn the schema.",
        },
      },
      required: ["provider", "endpoint", "input"],
      additionalProperties: false,
    },
  },
  {
    name: "get_run",
    description:
      "Fetch the current status, result, and cost of a run by id. Returns COMPLETED/FAILED with the final payload once finished.",
    inputSchema: {
      type: "object",
      properties: {
        runId: { type: "string", description: "Run id returned by `run`." },
      },
      required: ["runId"],
      additionalProperties: false,
    },
  },
  {
    name: "balance",
    description:
      "Return the workspace balance: total balance, held (in-flight runs), and available (balance - held).",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "balance_audit",
    description:
      "Verify the tamper-evident signed ledger for the workspace. Returns chain integrity (ok/mismatches), entry count, head hash, and signer public key. This is the aegntic trust surface — distinct from other tool hubs.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
]

const TEXT = (text: string): McpTextContent => ({ type: "text", text })

const OK = (payload: unknown): McpToolResult => ({
  content: [TEXT(JSON.stringify(payload, null, 2))],
})

const ERR = (message: string): McpToolResult => ({
  content: [TEXT(message)],
  isError: true,
})

// ─── Dispatch ───

export interface DispatchDeps {
  cfg: GatewayClientConfig
  // injectable so tests can stub; production uses the real client fns
  calls: {
    discover: typeof apiDiscover
    inspect: typeof apiInspect
    createRun: typeof createRun
    getRun: typeof getRun
    getBalance: typeof getBalance
    getBalanceAudit: typeof getBalanceAudit
  }
}

export function defaultDeps(): DispatchDeps {
  return {
    cfg: resolveConfig(),
    calls: {
      discover: apiDiscover,
      inspect: apiInspect,
      createRun,
      getRun,
      getBalance,
      getBalanceAudit,
    },
  }
}

type Args = Record<string, unknown>

function asString(v: unknown, field: string): string {
  if (typeof v !== "string" || v.length === 0) {
    throw new UserInputError(`'${field}' must be a non-empty string`)
  }
  return v
}

class UserInputError extends Error {}

export async function dispatch(
  deps: DispatchDeps | undefined,
  name: string,
  args: Args | undefined,
): Promise<McpToolResult> {
  const d = deps ?? defaultDeps()
  const a = args ?? {}
  try {
    switch (name) {
      case "discover": {
        const query = asString(a.query, "query")
        const limit =
          typeof a.limit === "number" ? a.limit : typeof a.limit === "string" ? Number(a.limit) : undefined
        const out: DiscoverResponse = await d.calls.discover(d.cfg, query, {
          limit: limit && Number.isFinite(limit) ? limit : undefined,
        })
        return OK(out)
      }
      case "inspect": {
        const provider = asString(a.provider, "provider")
        const endpoint = asString(a.endpoint, "endpoint")
        const out: InspectResponse = await d.calls.inspect(d.cfg, provider, endpoint)
        return OK(out)
      }
      case "run": {
        const provider = asString(a.provider, "provider")
        const endpoint = asString(a.endpoint, "endpoint")
        if (!a.input || typeof a.input !== "object") {
          throw new UserInputError("'input' must be an object")
        }
        const input = a.input as Run["input"]
        const out: Run = await d.calls.createRun(d.cfg, provider, endpoint, input)
        return OK(out)
      }
      case "get_run": {
        const runId = asString(a.runId, "runId")
        const out: Run = await d.calls.getRun(d.cfg, runId)
        return OK(out)
      }
      case "balance": {
        const out: BalanceResponse = await d.calls.getBalance(d.cfg)
        return OK(out)
      }
      case "balance_audit": {
        const out: BalanceAuditResponse = await d.calls.getBalanceAudit(d.cfg)
        return OK(out)
      }
      default:
        return ERR(`Unknown tool: ${name}`)
    }
  } catch (e) {
    if (e instanceof UserInputError) return ERR(e.message)
    if (e instanceof GatewayError) return ERR(`Gateway error: ${e.message}`)
    const msg = e instanceof Error ? e.message : String(e)
    return ERR(`Unexpected error: ${msg}`)
  }
}
