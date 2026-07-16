import { defineCommand } from "citty"
import consola from "consola"
import { readFile, writeFile } from "node:fs/promises"
import { createRun, getRun } from "../lib/client.js"
import type { Run, RunInput, RunStatus } from "@aegntic/sdk"

const TERMINAL: RunStatus[] = ["COMPLETED", "FAILED", "BLOCKED", "STOPPED", "TIME_OUT"]

function parseJSON(raw: string, flag: string): Record<string, unknown> {
  try {
    return JSON.parse(raw)
  } catch {
    consola.error(`Invalid JSON for ${flag}`)
    return process.exit(1)
  }
}

async function pollUntilDone(runId: string): Promise<Run> {
  let run = await getRun(runId)
  while (!TERMINAL.includes(run.status)) {
    consola.info(`Run ${runId}: ${run.status} ...`)
    await new Promise((r) => setTimeout(r, 2000))
    run = await getRun(runId)
  }
  return run
}

export default defineCommand({
  meta: {
    name: "run",
    description: "Execute an endpoint",
  },
  args: {
    p: { type: "string", description: "Provider name", required: true },
    e: { type: "string", description: "Endpoint path", required: true },
    i: { type: "string", description: "Body input (JSON string)" },
    f: { type: "string", description: "Body input from file path" },
    query: { type: "string", description: "Query params (JSON string)" },
    path: { type: "string", description: "Path params (JSON string)" },
    w: { type: "boolean", description: "Wait for completion", default: false },
    o: { type: "string", description: "Output file path" },
  },
  async run({ args }) {
    const input: RunInput = {}

    if (args.f) {
      const raw = await readFile(args.f, "utf-8")
      input.body = JSON.parse(raw)
    } else if (args.i) {
      input.body = parseJSON(args.i, "-i")
    }

    if (args.query) input.queryParams = parseJSON(args.query, "--query") as Record<string, string>
    if (args.path) input.pathParams = parseJSON(args.path, "--path") as Record<string, string>

    const run = await createRun(args.p, args.e, input)
    consola.success(`Run created: ${run.id}`)

    if (!args.w) {
      console.log(`\nPoll with: aegntic runs get -r ${run.id} -w`)
      return
    }

    const final = await pollUntilDone(run.id)

    if (final.status === "COMPLETED") {
      consola.success(`Run completed`)
      if (final.cost) {
        consola.info(`Cost: $${final.cost.value} ${final.cost.currency} (${final.cost.items} items @ $${final.cost.unitPrice})`)
      }
      if (args.o && final.result) {
        await writeFile(args.o, JSON.stringify(final.result, null, 2), "utf-8")
        consola.success(`Result saved to ${args.o}`)
      } else if (final.result) {
        console.log(JSON.stringify(final.result, null, 2))
      }
    } else {
      consola.error(`Run ${final.status}${final.error ? `: ${final.error}` : ""}`)
      process.exit(1)
    }
  },
})
