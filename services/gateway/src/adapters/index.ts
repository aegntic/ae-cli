import type { RunInput, RunResult } from "@aegntic/sdk"
import { ApifyAdapter } from "./apify.js"
import { MockAdapter } from "./mock.js"

export interface ProviderAdapter {
  name: string
  execute(endpoint: string, input: RunInput): Promise<RunResult>
  estimateCost(endpoint: string, input: RunInput): Promise<number>
}

class AdapterRegistry {
  private adapters = new Map<string, ProviderAdapter>()

  constructor() {
    const apifyToken = process.env.APIFY_TOKEN
    if (apifyToken) {
      this.adapters.set("apify", new ApifyAdapter(apifyToken))
    } else {
      console.warn("APIFY_TOKEN not set. Apify adapter will fall back to MockAdapter.")
      this.adapters.set("apify", new MockAdapter("apify"))
    }
    this.adapters.set("mock", new MockAdapter("mock"))
  }

  getAdapter(provider: string): ProviderAdapter {
    const adapter = this.adapters.get(provider)
    if (!adapter) {
      return this.adapters.get("mock") || new MockAdapter(provider)
    }
    return adapter
  }
}

export const registry = new AdapterRegistry()
