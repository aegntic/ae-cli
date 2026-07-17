"use client";

import { useEffect, useState } from "react";
import { getBalance, listRuns, type BalanceResponse, type Run } from "@/lib/api";
import { useApiKey } from "@/components/ApiKeyContext";

export default function BalancePage() {
  const { apiKey } = useApiKey();
  const [balance, setBalance] = useState<BalanceResponse | null>(null);
  const [recentRuns, setRecentRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!apiKey) {
      setLoading(false);
      return;
    }

    Promise.all([
      getBalance(apiKey),
      listRuns(apiKey, 20),
    ])
      .then(([balRes, runsRes]) => {
        setBalance(balRes.data);
        setRecentRuns(
          runsRes.data.filter((r) => r.status === "COMPLETED" && r.cost)
        );
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load data")
      )
      .finally(() => setLoading(false));
  }, [apiKey]);

  const totalSpent = recentRuns.reduce(
    (sum, r) => sum + (r.cost?.value ?? 0),
    0
  );

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Balance & Billing</h1>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-accent" />
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-500">
          {error}
        </div>
      )}

      {!loading && !error && balance && (
        <>
          <div className="mb-6 rounded-2xl border border-border bg-bg-card p-8 text-center">
            <p className="mb-2 text-sm text-text-muted">Current Balance</p>
            <p className="text-5xl font-bold tracking-tight text-text-primary">
              ${balance.balance.toFixed(2)}
            </p>
            <div className="mx-auto mt-6 grid max-w-sm grid-cols-3 gap-4">
              <div className="rounded-lg bg-bg p-3">
                <p className="text-xs text-text-muted">Balance</p>
                <p className="mt-1 font-mono text-sm font-medium text-text-primary">
                  ${balance.balance.toFixed(2)}
                </p>
              </div>
              <div className="rounded-lg bg-bg p-3">
                <p className="text-xs text-text-muted">Held</p>
                <p className="mt-1 font-mono text-sm font-medium text-amber">
                  ${balance.held.toFixed(2)}
                </p>
              </div>
              <div className="rounded-lg bg-bg p-3">
                <p className="text-xs text-text-muted">Available</p>
                <p className="mt-1 font-mono text-sm font-medium text-green">
                  ${balance.available.toFixed(2)}
                </p>
              </div>
            </div>
            <button
              className="mt-6 rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-accent/50"
              onClick={() => alert("Stripe integration coming soon.")}
            >
              Top up balance
            </button>
          </div>

          <div className="rounded-xl border border-border bg-bg-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Recent Cost History</h2>
              <span className="text-xs text-text-muted">
                Total: ${totalSpent.toFixed(4)}
              </span>
            </div>

            {recentRuns.length === 0 ? (
              <p className="py-8 text-center text-sm text-text-muted">
                No completed runs yet.
              </p>
            ) : (
              <div className="space-y-2">
                {recentRuns.slice(0, 10).map((run) => (
                  <div
                    key={run.id}
                    className="flex items-center justify-between rounded-lg border border-border-subtle bg-bg px-4 py-2.5 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-text-primary">
                        {run.provider}/{run.endpoint}
                      </span>
                      <span className="text-text-muted">
                        {run.cost?.items ?? 0} items
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-text-secondary">
                        ${run.cost?.value.toFixed(4)}
                      </span>
                      <span className="text-text-muted">
                        {new Date(run.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
