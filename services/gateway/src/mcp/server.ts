#!/usr/bin/env node
/**
 * aegntic MCP server — stdio JSON-RPC surface for the gateway.
 *
 * Hand-rolled JSON-RPC over stdin/stdout: reading the @modelcontextprotocol/sdk
 * would add a runtime dep to a stdio server whose protocol is three methods
 * (initialize, tools/list, tools/call). The hand-roll is ~150 LOC, has zero
 * module-load side effects, and cannot accidentally pull the gateway's DB
 * layer into the stdio process. Pure HTTP client — no DB at module load.
 *
 * Protocol:
 *   - initialize          → protocolVersion + capabilities:{ tools }
 *   - notifications/*     → no response (notifications are one-way)
 *   - tools/list          → tool definitions
 *   - tools/call          → dispatch by name
 *
 * Logs → stderr. NEVER write anything but JSON-RPC responses to stdout.
 */

import { createInterface, type Interface } from "node:readline"
import { TOOL_DEFS, dispatch, defaultDeps, type McpToolResult } from "./tools.js"

const PROTOCOL_VERSION = "2025-06-18"
const SERVER_NAME = "aegntic-mcp"
const SERVER_VERSION = "0.1.0"

interface JsonRpcRequest {
  jsonrpc: "2.0"
  id?: string | number | null
  method: string
  params?: unknown
}

interface JsonRpcResponse {
  jsonrpc: "2.0"
  id: string | number | null
  result?: unknown
  error?: { code: number; message: string; data?: unknown }
}

function logErr(...parts: unknown[]): void {
  // stderr only — stdout is reserved for JSON-RPC frames.
  process.stderr.write(`[${SERVER_NAME}] ${parts.join(" ")}\n`)
}

function writeResponse(res: JsonRpcResponse): void {
  process.stdout.write(JSON.stringify(res) + "\n")
}

function ok(id: string | number | null, result: unknown): void {
  writeResponse({ jsonrpc: "2.0", id, result })
}

function err(
  id: string | number | null,
  code: number,
  message: string,
  data?: unknown,
): void {
  writeResponse({ jsonrpc: "2.0", id, error: { code, message, data } })
}

// ─── Method handlers ───

function handleInitialize(): unknown {
  return {
    protocolVersion: PROTOCOL_VERSION,
    capabilities: { tools: {} },
    serverInfo: { name: SERVER_NAME, version: SERVER_VERSION },
  }
}

function handleToolsList(): unknown {
  return { tools: TOOL_DEFS }
}

async function handleToolsCall(
  params: unknown,
): Promise<{ result: McpToolResult } | { error: { code: number; message: string } }> {
  if (!params || typeof params !== "object") {
    return { error: { code: -32602, message: "Invalid params for tools/call" } }
  }
  const { name, arguments: args } = params as {
    name?: string
    arguments?: Record<string, unknown>
  }
  if (typeof name !== "string") {
    return { error: { code: -32602, message: "tools/call requires 'name'" } }
  }
  const result = await dispatch(defaultDeps(), name, args)
  return { result }
}

// ─── Stdio loop ───

async function handleMessage(req: JsonRpcRequest): Promise<void> {
  // Notifications carry no id and expect no response.
  const isNotification =
    req.id === undefined || req.method.startsWith("notifications/")
  if (isNotification && req.id === undefined) return

  const id = req.id ?? null

  try {
    switch (req.method) {
      case "initialize":
        return ok(id, handleInitialize())
      case "tools/list":
        return ok(id, handleToolsList())
      case "tools/call": {
        const out = await handleToolsCall(req.params)
        if ("error" in out) return err(id, out.error.code, out.error.message)
        return ok(id, out.result)
      }
      case "ping":
        return ok(id, {})
      default:
        return err(id, -32601, `Method not found: ${req.method}`)
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    logErr("handler threw:", msg)
    return err(id, -32603, `Internal error: ${msg}`)
  }
}

function isJsonRpcRequest(line: string): line is string {
  return line.length > 0
}

export function serve(input: NodeJS.ReadableStream, output?: Interface): void {
  const rl = createInterface({ input, crlfDelay: Infinity })
  rl.on("line", async (line: string) => {
    if (!isJsonRpcRequest(line)) return
    let parsed: JsonRpcRequest
    try {
      parsed = JSON.parse(line)
    } catch {
      logErr("malformed JSON line (ignored)")
      return
    }
    if (parsed.jsonrpc !== "2.0" || typeof parsed.method !== "string") {
      // Spec: respond with error if it has an id, else ignore.
      if (parsed.id !== undefined) {
        err(parsed.id ?? null, -32600, "Invalid Request")
      }
      return
    }
    await handleMessage(parsed)
  })
  rl.on("close", () => process.exit(0))
}

// Entry: only run the stdio loop when invoked as a script, never on import.
// This makes the server importable from tests without binding stdin.
const isMain =
  process.argv[1] &&
  (process.argv[1].endsWith("server.js") || process.argv[1].endsWith("server.ts"))
if (isMain) {
  serve(process.stdin)
  logErr(`${SERVER_NAME} v${SERVER_VERSION} on stdio (protocol ${PROTOCOL_VERSION})`)
}
