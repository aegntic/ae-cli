import { defineCommand } from "citty"
import { getClient } from "../utils/config.js"
import consola from "consola"

export default defineCommand({
  meta: {
    name: "discover",
    description: "Search for data tools and endpoints",
  },
  args: {
    query: {
      type: "positional",
      description: "Search query",
      required: false,
    },
    q: {
      type: "string",
      alias: "q",
      description: "Search query (named option)",
    },
    limit: {
      type: "string",
      alias: "l",
      description: "Max results to return",
      default: "10",
    },
    score: {
      type: "string",
      alias: "s",
      description: "Minimum relevance score threshold",
      default: "0.1",
    },
    json: {
      type: "boolean",
      alias: "j",
      description: "Output in JSON format",
    },
  },
  async run({ args }) {
    const q = args.query || args.q
    if (!q) {
      consola.error("Missing search query. Pass a query positional argument or use -q.")
      return
    }

    try {
      const client = getClient()
      const response = await client.discover(q, parseInt(args.limit, 10), parseFloat(args.score))

      if (args.json) {
        console.log(JSON.stringify(response, null, 2))
        return
      }

      const results = response.data.results
      if (results.length === 0) {
        consola.info(`No tools found matching query "${q}"`)
        return
      }

      consola.info(`Found ${results.length} tools:`)
      for (const tool of results) {
        console.log("")
        console.log(`⚡ [${tool.provider}] ${tool.path} (Score: ${tool.relevanceScore?.toFixed(2) || "N/A"})`)
        console.log(`   Description: ${tool.description}`)
        console.log(`   Price Model: ${tool.costModel.type} (${tool.costModel.unitPrice} cents per result)`)
        if (tool.verified) {
          console.log(`   ✓ Verified`)
        }
      }
    } catch (error: any) {
      consola.error(error.message)
    }
  },
})
