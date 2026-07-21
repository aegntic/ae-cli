import consola from "consola"
import { AegnticClient } from "@aegntic/sdk"
import { getResolvedConfig } from "./config.js"

/**
 * Build an authenticated SDK client from the unified config.
 *
 * Resolves baseUrl + the active API key (env > keys[activeKey] > keys["main"]
 * > legacy apiKey). Throws a user-actionable error when no key is configured
 * so commands print a single clear message instead of a 401 from the gateway.
 */
export async function getClient(): Promise<AegnticClient> {
  const { baseUrl, apiKey } = await getResolvedConfig()

  if (!apiKey) {
    consola.error(
      "No API key configured. Run `aegntic setup` then set one with " +
        "`aegntic keys add` (or `aegntic keys add --label <l>`), " +
        "or export AEGNTIC_API_KEY.",
    )
    process.exit(1)
  }

  return new AegnticClient({ baseUrl, apiKey })
}
