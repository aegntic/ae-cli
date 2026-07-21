import type { ProviderAdapter, Endpoint } from "@aegntic/sdk"
import { mockProvider } from "./mock.js"
import { openMeteoProvider } from "./openmeteo.js"
import { hackerNewsProvider } from "./hackernews.js"
import { coinGeckoProvider } from "./coingecko.js"
import { frankfurterProvider } from "./frankfurter.js"
import { apifyProviderIfConfigured } from "./apify.js"

const providers = new Map<string, ProviderAdapter>()

providers.set(mockProvider.name, mockProvider)
providers.set(openMeteoProvider.name, openMeteoProvider)
providers.set(hackerNewsProvider.name, hackerNewsProvider)
providers.set(coinGeckoProvider.name, coinGeckoProvider)
providers.set(frankfurterProvider.name, frankfurterProvider)

// Apify is the first CREDENTIALED provider. Register only if the token is
// configured in the env; otherwise log a generic message (never the token
// value) and skip. Catalog seed auto-ingests its endpoints when registered.
const apifyProvider = apifyProviderIfConfigured()
if (apifyProvider) {
  providers.set(apifyProvider.name, apifyProvider)
} else {
  // eslint-disable-next-line no-console
  console.log("[apify] token not configured — adapter disabled")
}

export function addProvider(adapter: ProviderAdapter): void {
  providers.set(adapter.name, adapter)
}

export function getEndpoint(provider: string, path: string): Endpoint | undefined {
  const adapter = providers.get(provider)
  if (!adapter) return undefined
  const normalized = path.replace(/^\/+/, "")
  return adapter.endpoints.find((e) => e.path === normalized || e.path === path)
}

export function listEndpoints(): Endpoint[] {
  const all: Endpoint[] = []
  for (const adapter of providers.values()) {
    all.push(...adapter.endpoints)
  }
  return all
}

export function searchProviders(query: string): Endpoint[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean)
  const results: Array<{ endpoint: Endpoint; score: number }> = []

  for (const adapter of providers.values()) {
    for (const ep of adapter.endpoints) {
      const haystack = `${ep.path} ${ep.description}`.toLowerCase()
      let score = 0
      for (const term of terms) {
        if (haystack.includes(term)) score++
      }
      if (score > 0) {
        results.push({ endpoint: { ...ep, relevanceScore: score / terms.length }, score })
      }
    }
  }

  results.sort((a, b) => b.score - a.score)
  return results.map((r) => r.endpoint)
}

export function getProvider(name: string): ProviderAdapter | undefined {
  return providers.get(name)
}
