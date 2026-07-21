"use client";

import { useEffect, useState } from "react";
import { listRuns, getRun, type Run } from "@/lib/api";
import { useApiKey } from "@/components/ApiKeyContext";
import StatusBadge from "@/components/ui/StatusBadge";

export default function RunsPage() {
  const { apiKey } = useApiKey();
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRun, setSelectedRun] = useState<Run | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    if (!apiKey) { setLoading(false); return; }
    listRuns(apiKey)
      .then((res) => setRuns(res.data))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load runs"))
      .finally(() => setLoading(false));
  }, [apiKey]);

  const handleSelectRun = async (run: Run) => {
    if (!apiKey) return;
    setDetailLoading(true);
    setSelectedRun(run);
    try {
      const res = await getRun(apiKey, run.id);
      setSelectedRun(res.data);
    } catch { /* keep existing */ } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Run History</h1>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-accent" />
        </div>
      )}

      {error && (
        <div className="rounded-2xl border-2 border-toy-red bg-toy-red/10 p-4 text-sm text-toy-red">
          {error}
        </div>
      )}

      {!loading && !error && runs.length === 0 && (
        <div className="py-16 text-center text-sm text-text-muted">
          No runs yet. Use Discover to find and run tools.
        </div>
      )}

      {!loading && runs.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <div className="overflow-hidden rounded-2xl border-2 border-border bg-bg-elevated toy-shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="swiss-line-b bg-bg">
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-muted">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-muted">Provider</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-muted">Endpoint</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-muted">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-text-muted">Cost</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-text-muted">Items</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-text-muted">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {runs.map((run) => (
                    <tr
                      key={run.id}
                      onClick={() => handleSelectRun(run)}
                      className={`cursor-pointer swiss-line-b transition-colors hover:bg-bg ${
                        selectedRun?.id === run.id ? "bg-bg" : ""
                      }`}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-text-muted">{run.id.slice(0, 8)}</td>
                      <td className="px-4 py-3 text-text-secondary">{run.provider}</td>
                      <td className="px-4 py-3 font-mono text-text-primary">{run.endpoint}</td>
                      <td className="px-4 py-3"><StatusBadge status={run.status} /></td>
                      <td className="px-4 py-3 text-right font-mono text-xs text-text-secondary">
                        {run.cost ? `$${run.cost.value.toFixed(4)}` : "—"}
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-text-muted">{run.cost?.items ?? "—"}</td>
                      <td className="px-4 py-3 text-right text-xs text-text-muted">
                        {new Date(run.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:col-span-2">
            {selectedRun ? (
              <div className="sticky top-6 rounded-2xl border-2 border-border bg-bg-elevated p-5 toy-shadow-sm">
                {detailLoading && (
                  <div className="flex items-center justify-center py-4">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-accent" />
                  </div>
                )}
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-sm font-semibold">Run Details</h2>
                  <StatusBadge status={selectedRun.status} />
                </div>
                <div className="space-y-3 text-xs">
                  <DetailRow label="ID" value={selectedRun.id} mono />
                  <DetailRow label="Provider" value={selectedRun.provider} />
                  <DetailRow label="Endpoint" value={selectedRun.endpoint} mono />
                  <DetailRow label="Created" value={new Date(selectedRun.createdAt).toLocaleString()} />
                  <DetailRow label="Updated" value={new Date(selectedRun.updatedAt).toLocaleString()} />
                  {selectedRun.cost && (
                    <>
                      <DetailRow label="Cost" value={`$${selectedRun.cost.value.toFixed(4)}`} mono />
                      <DetailRow label="Items" value={String(selectedRun.cost.items)} />
                      <DetailRow label="Unit Price" value={`$${selectedRun.cost.unitPrice.toFixed(4)}`} mono />
                    </>
                  )}
                  {selectedRun.error && (
                    <div className="rounded-xl border-2 border-toy-red bg-toy-red/10 p-3 text-toy-red">
                      {selectedRun.error}
                    </div>
                  )}
                  {selectedRun.input && (
                    <div>
                      <h3 className="mb-1.5 font-medium text-text-muted">Input</h3>
                      <pre className="overflow-x-auto rounded-xl bg-bg border-2 border-border p-3 text-text-secondary">
                        {JSON.stringify(selectedRun.input, null, 2)}
                      </pre>
                    </div>
                  )}
                  {selectedRun.result != null && (
                    <div>
                      <h3 className="mb-1.5 font-medium text-text-muted">Result</h3>
                      <pre className="max-h-64 overflow-x-auto rounded-xl bg-bg border-2 border-border p-3 text-text-secondary">
                        {JSON.stringify(selectedRun.result, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-border bg-bg-elevated p-8 text-center text-sm text-text-muted">
                Select a run to view details
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="shrink-0 text-text-muted">{label}</span>
      <span className={`text-right text-text-secondary ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}
