"use client"

import { useEffect, useState } from "react"
import { api, ApiError, type Run } from "@/lib/api"
import { useApiKey } from "@/components/ApiKeyContext"
import StatusBadge from "@/components/ui/StatusBadge"

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function truncate(id: string, head = 8, tail = 4): string {
  if (id.length <= head + tail) return id
  return `${id.slice(0, head)}…${id.slice(-tail)}`
}

export default function RunsPage() {
  const { apiKey } = useApiKey()
  const [runs, setRuns] = useState<Run[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<Run | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  async function load() {
    if (!apiKey) {
      setError("Enter your API key in the sidebar first.")
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await api.listRuns(50, apiKey)
      setRuns(data)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load runs.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey])

  async function openRun(run: Run) {
    setSelected(run)
    if (run.status === "RUNNING" || run.status === "READY" || run.status === "BLOCKED") {
      setDetailLoading(true)
      try {
        const fresh = await api.getRun(run.id, apiKey)
        setSelected(fresh)
      } catch {
        /* keep original */
      } finally {
        setDetailLoading(false)
      }
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Runs</h1>
          <p className="mt-1 text-sm text-text-secondary">History of tool executions.</p>
        </div>
        <button
          type="button"
          onClick={load}
          className="rounded-lg border border-border px-3 py-1.5 text-sm text-text-secondary transition-colors hover:text-text-primary"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="mt-6 overflow-hidden rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-bg-elevated text-xs uppercase tracking-wider text-text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Provider</th>
              <th className="px-4 py-3 font-medium">Endpoint</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Cost</th>
              <th className="px-4 py-3 font-medium">Items</th>
              <th className="px-4 py-3 font-medium">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {loading && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-text-muted">
                  Loading...
                </td>
              </tr>
            )}
            {!loading && runs.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-text-muted">
                  No runs yet.
                </td>
              </tr>
            )}
            {runs.map((run) => (
              <tr
                key={run.id}
                onClick={() => openRun(run)}
                className="cursor-pointer bg-bg-card transition-colors hover:bg-bg-card-hover"
              >
                <td className="px-4 py-3 font-mono text-xs text-text-secondary">
                  {truncate(run.id)}
                </td>
                <td className="px-4 py-3 text-text-primary">{run.provider}</td>
                <td className="px-4 py-3 font-mono text-xs text-text-secondary">
                  {run.endpoint}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={run.status} />
                </td>
                <td className="px-4 py-3 text-text-secondary">
                  {run.cost ? `$${run.cost.value.toFixed(2)}` : "—"}
                </td>
                <td className="px-4 py-3 text-text-secondary">
                  {run.cost ? run.cost.items : "—"}
                </td>
                <td className="px-4 py-3 text-text-muted">{formatDate(run.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-border bg-bg-elevated p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-mono text-sm font-semibold text-text-primary">
                  {selected.provider}
                  <span className="text-text-muted">{selected.endpoint}</span>
                </h2>
                <p className="mt-1 font-mono text-xs text-text-muted">
                  {selected.id}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-lg border border-border p-1.5 text-text-secondary transition-colors hover:text-text-primary"
                aria-label="Close"
              >
                <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
                  <path d="m5 5 10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <StatusBadge status={selected.status} />
              {detailLoading && <span className="text-xs text-text-muted">Refreshing...</span>}
            </div>

            <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-xs text-text-muted">Cost</dt>
                <dd className="mt-0.5 text-text-primary">
                  {selected.cost ? `$${selected.cost.value.toFixed(2)}` : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-text-muted">Items</dt>
                <dd className="mt-0.5 text-text-primary">
                  {selected.cost ? selected.cost.items : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-text-muted">Created</dt>
                <dd className="mt-0.5 text-text-primary">{formatDate(selected.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-xs text-text-muted">Updated</dt>
                <dd className="mt-0.5 text-text-primary">{formatDate(selected.updatedAt)}</dd>
              </div>
            </dl>

            <div className="mt-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                Input
              </h3>
              <pre className="mt-2 overflow-x-auto rounded-lg border border-border bg-bg p-3 text-xs text-text-secondary">
                {JSON.stringify(selected.input, null, 2)}
              </pre>
            </div>

            <div className="mt-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                Result
              </h3>
              {selected.error ? (
                <p className="mt-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
                  {selected.error}
                </p>
              ) : selected.result ? (
                <pre className="mt-2 max-h-64 overflow-x-auto rounded-lg border border-border bg-bg p-3 text-xs text-text-secondary">
                  {JSON.stringify(selected.result, null, 2)}
                </pre>
              ) : (
                <p className="mt-2 text-sm text-text-muted">No result yet.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
