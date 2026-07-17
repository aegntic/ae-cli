"use client"

import { useEffect, useState } from "react"
import { api, ApiError, type ApiKey, type ApiKeyCreated } from "@/lib/api"
import { useApiKey } from "@/components/ApiKeyContext"
import CopyButton from "@/components/CopyButton"

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export default function KeysPage() {
  const { apiKey } = useApiKey()
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [label, setLabel] = useState("")
  const [creating, setCreating] = useState(false)
  const [created, setCreated] = useState<ApiKeyCreated | null>(null)
  const [confirming, setConfirming] = useState<string | null>(null)

  async function load() {
    if (!apiKey) {
      setError("Enter your API key in the sidebar first.")
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await api.listKeys(apiKey)
      setKeys(data)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load keys.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = label.trim()
    if (!trimmed || !apiKey) return
    setCreating(true)
    setError(null)
    setCreated(null)
    try {
      const createdKey = await api.createKey(trimmed, apiKey)
      setCreated(createdKey)
      setLabel("")
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create key.")
    } finally {
      setCreating(false)
    }
  }

  async function handleDelete(target: string) {
    if (!apiKey) return
    setError(null)
    try {
      await api.deleteKey(target, apiKey)
      setConfirming(null)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete key.")
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold tracking-tight">API Keys</h1>
      <p className="mt-1 text-sm text-text-secondary">
        Manage keys that authenticate requests to the gateway.
      </p>

      {error && (
        <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <form
        onSubmit={handleCreate}
        className="mt-6 flex flex-col gap-3 rounded-xl border border-border bg-bg-card p-5 sm:flex-row"
      >
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Key label (e.g. production)"
          className="flex-1 rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-accent"
        />
        <button
          type="submit"
          disabled={creating || !label.trim()}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {creating ? "Creating..." : "Create new key"}
        </button>
      </form>

      {created && (
        <div className="mt-4 rounded-xl border border-green/20 bg-green/10 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green">Key created — copy it now.</p>
              <p className="mt-1 break-all font-mono text-xs text-text-secondary">
                {created.key}
              </p>
            </div>
            <CopyButton text={created.key} />
          </div>
          <p className="mt-3 text-xs text-text-muted">
            For your security, this key is shown only once.
          </p>
        </div>
      )}

      <div className="mt-6 space-y-3">
        {loading && (
          <div className="animate-pulse space-y-3">
            {[0, 1].map((i) => (
              <div key={i} className="h-16 rounded-xl border border-border bg-bg-card" />
            ))}
          </div>
        )}

        {!loading && keys.length === 0 && (
          <div className="rounded-xl border border-border bg-bg-card px-4 py-10 text-center text-sm text-text-muted">
            No API keys yet.
          </div>
        )}

        {keys.map((k) => (
          <div
            key={k.label}
            className="flex items-center justify-between gap-4 rounded-xl border border-border bg-bg-card px-5 py-4"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-text-primary">{k.label}</span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium ${
                    k.active
                      ? "border-green/20 bg-green/10 text-green"
                      : "border-zinc-500/20 bg-zinc-500/10 text-zinc-400"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${k.active ? "bg-green" : "bg-zinc-400"}`}
                  />
                  {k.active ? "Active" : "Inactive"}
                </span>
              </div>
              <p className="mt-1 font-mono text-xs text-text-muted">
                {k.prefix.slice(0, 8)}…
                <span className="ml-3 text-text-muted/70">{formatDate(k.createdAt)}</span>
              </p>
            </div>

            {confirming === k.label ? (
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDelete(k.label)}
                  className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/20"
                >
                  Confirm
                </button>
                <button
                  type="button"
                  onClick={() => setConfirming(null)}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs text-text-secondary transition-colors hover:text-text-primary"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirming(k.label)}
                className="shrink-0 rounded-lg border border-border px-3 py-1.5 text-xs text-text-secondary transition-colors hover:border-red-500/30 hover:text-red-400"
              >
                Delete
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
