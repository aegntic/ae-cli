# aegntic MCP server

The aegntic MCP server exposes the gateway as a tool an LLM calls inside
Claude Code, Cursor, or any MCP-aware client. This is the agent-native
surface: instead of recommending aegntic as a URL, the model invokes it.

The server is a thin HTTP client over the gateway API. It speaks stdio
JSON-RPC (one frame per line on stdin/stdout) and has no database
dependency — it never imports `db/client.ts`, so launching it does not
attempt to connect to postgres.

## Tools exposed

| Tool           | Purpose                                                      |
| -------------- | ------------------------------------------------------------ |
| `discover`     | Natural-language search over the endpoint catalog.           |
| `inspect`      | Fetch input schema, cost model, and example for one endpoint.|
| `run`          | Create an async run. Poll separately with `get_run`.         |
| `get_run`      | Fetch status + result + cost of a run by id.                 |
| `balance`      | Workspace balance/available/held.                            |
| `balance_audit`| Verify the tamper-evident signed ledger for the workspace.   |

## Configuration (env)

| Env var           | Default                    | Notes                          |
| ----------------- | -------------------------- | ------------------------------ |
| `AEGNTIC_BASE_URL`| `http://localhost:3101`    | Gateway HTTP base URL.         |
| `AEGNTIC_API_KEY` | _(required)_               | Workspace bearer key. Tools error clearly if unset. |

`PORT` is not used — transport is stdio.

## Claude Code config

Add to `~/.claude/settings.json` (or `.claude/settings.json` in the project):

```json
{
  "mcpServers": {
    "aegntic": {
      "command": "node",
      "args": ["/absolute/path/to/ae-cli/services/gateway/dist/mcp/server.js"],
      "env": {
        "AEGNTIC_BASE_URL": "http://localhost:3101",
        "AEGNTIC_API_KEY": "your-key-here"
      }
    }
  }
}
```

For development without a build step, swap the command for `pnpm`:

```json
{
  "mcpServers": {
    "aegntic": {
      "command": "pnpm",
      "args": ["--filter", "@aegntic/gateway", "exec", "tsx", "src/mcp/server.ts"],
      "env": {
        "AEGNTIC_BASE_URL": "http://localhost:3101",
        "AEGNTIC_API_KEY": "your-key-here"
      }
    }
  }
}
```

## Cursor config

Cursor uses the same shape under `Settings → MCP`:

```json
{
  "mcpServers": {
    "aegntic": {
      "command": "node",
      "args": ["/absolute/path/to/ae-cli/services/gateway/dist/mcp/server.js"],
      "env": {
        "AEGNTIC_BASE_URL": "http://localhost:3101",
        "AEGNTIC_API_KEY": "your-key-here"
      }
    }
  }
}
```

## Build & verify

```bash
pnpm --filter @aegntic/gateway build      # emits dist/mcp/server.js
pnpm --filter @aegntic/gateway test        # 18 existing + MCP unit tests
pnpm turbo run typecheck                   # 5/5 packages clean
```

## Why hand-rolled JSON-RPC

The MCP stdio protocol the server implements is three methods
(`initialize`, `tools/list`, `tools/call`) plus notifications. Hand-rolling
it is ~150 LOC, adds zero runtime dependencies, and avoids any chance of
the `@modelcontextprotocol/sdk` transitive deps pulling the gateway's
postgres layer into the stdio process at module load. The server stays a
pure HTTP client.
