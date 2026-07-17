"use client"

import { useEffect, useState } from "react"
import { api, ApiError, type BalanceResponse, type Run } from "@/lib/api"
import { useApiKey } from "@/components/ApiKeyContext"
import StatusBadge from "@/components/ui/StatusBadge"

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function BalancePage() {
  const { apiKey } = useApiKey()
  const [balance, setBalance] = useState<BalanceResponse | null>(null)
  const [runs, setRuns] = useState<Run[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    if (!apiKey) {
      setError("Enter your API key in the sidebar first.")
      return
    }
    setLoading(true)
    setError(null)
    try {
      const [bal, runData] = await Promise.all([
        api.getBalance(apiKey),
        api.listRuns(10, apiKey).catch(() => [] as Run[]),
      ])
      setBalance(bal)
      setRuns(runData)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load balance.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey])

  const costHistory = runs.filter((r) => r.cost && r.cost.value > 0)

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold tracking-tight">Balance</h1>
      <p className="mt-1 text-sm text-text-secondary">Your workspace balance and usage.</p>

      {error && (
        <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-border bg-bg-elevated p-8">
        <p className="text-sm text-text-muted">Available balance</p>
        <div className="mt-2 flex items-end gap-3">
          <span className="text-5xl font-bold tracking-tight text-text-primary">
            {balance ? `$${balance.available.toFixed(2)}` : "—"}
          </span>
          <span className="mb-1 text-sm text-text-muted">
            {balance?.currency ?? "USD"}
          </span>
        </div>

        <button
          type="button"
          className="mt-6 inline-flex items-center gap-2 rounded-lg gradient-accent px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent/20 transition-all hover:shadow-xl hover:shadow-accent/30"
        >
          Top up
        </button>
      </div>

      {balance && (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Stat label="Balance" value={`$${balance.balance.toFixed(2)}`} />
          <Stat label="Held" value={`$${balance.held.toFixed(2)}`} />
          <Stat label="Available" value={`$${balance.available.toFixed(2)}`} />
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-sm font-semibold text-text-primary">Recent cost history</h2>
        <div className="mt-3 divide-y divide-border-subtle overflow-hidden rounded-xl border border-border">
          {loading && (
            <div className="px-4 py-10 text-center text-sm text-text-muted">Loading...</div>
          )}
          {!loading && costHistory.length === 0 && (
            <div className="px-4 py-10 text-center text-sm text-text-muted">
              No recent charges.
            </div>
          )}
          {costHistory.map((run) => (
            <div
              key={run.id}
              className="flex items-center justify-between gap-4 bg-bg-card px-4 py-3"
            >
              <div className="min-w-0">
                <div className="truncate font-mono text-sm text-text-primary">
                  {run.provider}
                  <span className="text-text-muted">{run.endpoint}</span>
                </div>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-text-muted">
                  <span>{formatDate(run.createdAt)}</span>
                  <StatusBadge status={run.status} />
                </div>
              </div>
              <span className="shrink-0 font-mono text-sm text-text-secondary">
                ${run.cost!.value.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-bg-card px-4 py-4">
      <div className="text-xs text-text-muted">{label}</div>
      <div className="mt-1 font-mono text-lg font-semibold text-text-primary">{value}</div>
    </div>
  )
}
