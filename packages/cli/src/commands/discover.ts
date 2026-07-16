import { defineCommand } from "citty"
import consola from "consola"
import { discover } from "../lib/client.js"

export default defineCommand({
  meta: {
    name: "discover",
    description: "Search the endpoint catalog",
  },
  args: {
    q: {
      type: "string",
      description: "Search query",
      required: true,
    },
    l: {
      type: "string",
      description: "Max results (default: 10)",
      default: "10",
    },
    s: {
      type: "string",
      description: "Minimum relevance score (default: 0)",
      default: "0",
    },
    json: {
      type: "boolean",
      description: "Output raw JSON",
      alias: ["j"],
      default: false,
    },
  },
  async run({ args }) {
    const limit = Number(args.l) || 10
    const minScore = Number(args.s) || 0

    const data = await discover(args.q, { limit, minScore })

    if (args.json) {
      console.log(JSON.stringify(data, null, 2))
      return
    }

    if (!data.results.length) {
      consola.info("No endpoints found matching your query.")
      return
    }

    consola.success(`Found ${data.total} result(s) for "${data.query}"\n`)

    const rows = data.results.map((ep) => ({
      provider: ep.provider,
      endpoint: ep.path,
      score: ep.relevanceScore?.toFixed(2) ?? "-",
      verified: ep.verified ? "Yes" : "No",
      description:
        ep.description.length > 60
          ? ep.description.slice(0, 57) + "..."
          : ep.description,
    }))

    console.table(rows)
  },
})
