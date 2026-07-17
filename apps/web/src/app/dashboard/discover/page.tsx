"use client"

import { useState } from "react"
import { api, ApiError, type Endpoint } from "@/lib/api"
import { useApiKey } from "@/components/ApiKeyContext"

function formatCost(endpoint: Endpoint): string {
  const { unitPrice, type } = endpoint.costModel
  const dollars = unitPrice / 100
  const per = type === "per_result" ? "per result" : type === "per_call" ? "per call" : "flat"
  return `$${dollars.toFixed(dollars % 1 === 0 ? 2 : 3)} ${per}`
}

export default function DiscoverPage() {
  const { apiKey } = useApiKey()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Endpoint[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [running, setRunning] = useState<string | null>(null)
  const [runMessage, setRunMessage] = useState<string | null>(null)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!apiKey) {
      setError("Enter your API key in the sidebar first.")
      return
    }
    setLoading(true)
    setError(null)
    setRunMessage(null)
    try {
      const res = await api.discover(query, apiKey)
      setResults(res.results)
      setSearched(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to discover tools.")
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  async function handleRun(endpoint: Endpoint) {
    if (!apiKey) {
      setError("Enter your API key in the sidebar first.")
      return
    }
    setRunning(`${endpoint.provider}${endpoint.path}`)
    setRunMessage(null)
    try {
      const run = await api.run(endpoint.provider, endpoint.path, {}, apiKey)
      setRunMessage(`Run started: ${run.id} — view it under Runs.`)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to start run.")
    } finally {
      setRunning(null)
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-bold tracking-tight">Discover</h1>
      <p className="mt-1 text-sm text-text-secondary">
        Search the catalog of tools your agent can run.
      </p>

      <form onSubmit={handleSearch} className="mt-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <svg
              viewBox="0 0 20 20"
              fill="none"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
            >
              <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.6" />
              <path d="m14 14 3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tools..."
              className="w-full rounded-lg border border-border bg-bg-elevated py-2.5 pl-10 pr-3 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-accent"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {runMessage && (
        <div className="mt-4 rounded-lg border border-green/20 bg-green/10 px-4 py-3 text-sm text-green">
          {runMessage}
        </div>
      )}

      <div className="mt-6 space-y-3">
        {loading && (
          <div className="animate-pulse space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-24 rounded-xl border border-border bg-bg-card" />
            ))}
          </div>
        )}

        {searched && !loading && results.length === 0 && (
          <div className="rounded-xl border border-border bg-bg-card px-4 py-10 text-center text-sm text-text-muted">
            No tools found for &ldquo;{query}&rdquo;.
          </div>
        )}

        {results.map((endpoint) => {
          const key = `${endpoint.provider}${endpoint.path}`
          const isOpen = expanded === key
          return (
            <div
              key={key}
              className="overflow-hidden rounded-xl border border-border bg-bg-card transition-colors hover:border-border-subtle"
            >
              <button
                type="button"
                onClick={() => setExpanded(isOpen ? null : key)}
                className="flex w-full items-start gap-4 px-5 py-4 text-left"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-medium text-text-primary">
                      {endpoint.provider}
                      <span className="text-text-muted">{endpoint.path}</span>
                    </span>
                    {endpoint.verified && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-green/20 bg-green/10 px-2 py-0.5 text-xs font-medium text-green">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                  <p className="mt-1 truncate text-sm text-text-secondary">
                    {endpoint.description}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-text-muted">
                    <span className="font-mono text-accent">{formatCost(endpoint)}</span>
                    {typeof endpoint.relevanceScore === "number" && (
                      <span>
                        Relevance {Math.round(endpoint.relevanceScore * 100)}%
                      </span>
                    )}
                  </div>
                </div>
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  className={`h-5 w-5 shrink-0 text-text-muted transition-transform ${isOpen ? "rotate-180" : ""}`}
                >
                  <path d="m5 7 5 5 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {isOpen && (
                <div className="border-t border-border px-5 py-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                      Input Schema
                    </h3>
                    <button
                      type="button"
                      onClick={() => handleRun(endpoint)}
                      disabled={running === key}
                      className="rounded-lg bg-accent px-4 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                      {running === key ? "Running..." : "Run this"}
                    </button>
                  </div>

                  {endpoint.inputSchema.body ? (
                    <div className="space-y-2">
                      {Object.entries(endpoint.inputSchema.body).map(([name, field]) => (
                        <div
                          key={name}
                          className="flex items-center justify-between rounded-lg border border-border-subtle bg-bg-elevated px-3 py-2 text-sm"
                        >
                          <div className="min-w-0">
                            <span className="font-mono text-text-primary">{name}</span>
                            {field.required && (
                              <span className="ml-2 text-xs text-red-400">required</span>
                            )}
                            {field.description && (
                              <p className="truncate text-xs text-text-muted">
                                {field.description}
                              </p>
                            )}
                          </div>
                          <span className="ml-3 shrink-0 rounded border border-border px-2 py-0.5 font-mono text-xs text-text-secondary">
                            {field.type}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-text-muted">No input parameters required.</p>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
