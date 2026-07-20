"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { API_KEY_STORAGE } from "@/lib/api";

const GATEWAY =
  process.env.NEXT_PUBLIC_AEGNTIC_BASE_URL ?? "https://gateway.aedex.ing";

const KEY_STORAGE = API_KEY_STORAGE;

type Balance = {
  balance: number;
  held: number;
  available: number;
  currency: string;
};

type Run = {
  id: string;
  provider: string;
  endpoint: string;
  status: string;
  cost?: { value: number; currency: string; items: number };
  createdAt: string;
};

const STATUS_STYLE: Record<string, string> = {
  COMPLETED: "bg-toy-green text-white",
  RUNNING: "bg-toy-yellow text-black",
  READY: "bg-bg-elevated text-text-secondary border-2 border-black",
  FAILED: "bg-toy-red text-white",
  STOPPED: "bg-bg-elevated text-text-muted border-2 border-black",
};

function money(n: number, currency: string) {
  return `${n.toFixed(4)} ${currency}`;
}

function timeAgo(iso: string) {
  const s = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

export default function ConsolePage() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [draftKey, setDraftKey] = useState("");
  const [balance, setBalance] = useState<Balance | null>(null);
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(false);
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const [runsError, setRunsError] = useState<string | null>(null);

  useEffect(() => {
    const k = localStorage.getItem(KEY_STORAGE);
    if (k) setApiKey(k);
  }, []);

  const authedFetch = useCallback(
    async (path: string) => {
      const res = await fetch(`${GATEWAY}${path}`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (res.status === 401) {
        localStorage.removeItem(KEY_STORAGE);
        setApiKey(null);
        throw new Error("Invalid API key");
      }
      if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
      return res.json();
    },
    [apiKey],
  );

  const refresh = useCallback(async () => {
    if (!apiKey) return;
    setLoading(true);
    setBalanceError(null);
    setRunsError(null);
    const [bRes, rRes] = await Promise.allSettled([
      authedFetch("/v1/balance"),
      authedFetch("/v1/runs?limit=25"),
    ]);
    if (bRes.status === "fulfilled") {
      setBalance(bRes.value.data);
    } else {
      setBalance(null);
      setBalanceError(bRes.reason instanceof Error ? bRes.reason.message : "balance unavailable");
    }
    if (rRes.status === "fulfilled") {
      setRuns(rRes.value.data);
    } else {
      setRuns([]);
      setRunsError(rRes.reason instanceof Error ? rRes.reason.message : "runs unavailable");
    }
    setLoading(false);
  }, [apiKey, authedFetch]);

  useEffect(() => {
    if (apiKey) void refresh();
  }, [apiKey, refresh]);

  const hasActive = useMemo(
    () => runs.some((r) => r.status === "RUNNING" || r.status === "READY"),
    [runs],
  );
  useEffect(() => {
    if (!apiKey || !hasActive) return;
    const t = setInterval(() => void refresh(), 2500);
    return () => clearInterval(t);
  }, [apiKey, hasActive, refresh]);

  function saveKey() {
    const k = draftKey.trim();
    if (!k) return;
    localStorage.setItem(KEY_STORAGE, k);
    setApiKey(k);
    setDraftKey("");
  }

  function clearKey() {
    localStorage.removeItem(KEY_STORAGE);
    setApiKey(null);
    setBalance(null);
    setRuns([]);
  }

  // ---- Auth gate ----
  if (!apiKey) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 bg-bg">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="rounded-2xl border-2 border-black bg-white p-8 toy-shadow">
            <div className="text-xs font-mono uppercase tracking-[0.2em] text-text-muted mb-3">
              aegntic / console
            </div>
            <h1 className="text-3xl font-semibold tracking-tight mb-2">
              Connect a workspace
            </h1>
            <p className="text-sm text-text-secondary mb-8 leading-relaxed">
              Paste a workspace API key. It stays in your browser and calls the gateway
              directly — mint one with{" "}
              <code className="font-mono text-accent">aegntic keys add</code>.
            </p>
            <div className="flex gap-2">
              <input
                autoFocus
                type="password"
                value={draftKey}
                onChange={(e) => setDraftKey(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveKey()}
                placeholder="aegntic_live_…"
                className="flex-1 bg-bg border-2 border-black rounded-xl px-4 py-3 text-sm font-mono outline-none focus:border-accent transition-colors"
              />
              <button
                onClick={saveKey}
                className="toy-button px-5 py-3 bg-black text-white text-sm font-medium"
              >
                Connect
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ---- Console ----
  return (
    <main className="min-h-screen px-6 py-10 max-w-5xl mx-auto bg-bg">
      {/* Header */}
      <header className="flex items-center justify-between mb-10">
        <div>
          <div className="text-xs font-mono uppercase tracking-[0.2em] text-text-muted">
            aegntic / console
          </div>
          <h1 className="text-xl font-semibold tracking-tight mt-1">Workspace</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => void refresh()}
            disabled={loading}
            className="text-xs font-mono px-3 py-2 rounded-xl border-2 border-black text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50 bg-white"
          >
            {loading ? "refreshing…" : "refresh"}
          </button>
          <button
            onClick={clearKey}
            className="text-xs font-mono px-3 py-2 rounded-xl text-text-muted hover:text-toy-red transition-colors"
          >
            disconnect
          </button>
        </div>
      </header>

      {/* Balance hero */}
      <section className="mb-12 animate-fade-in">
        <div className="text-xs font-mono uppercase tracking-[0.2em] text-text-muted mb-3">
          balance
        </div>
        {balance ? (
          <div className="flex items-baseline gap-6 flex-wrap">
            <div className="font-mono text-6xl font-semibold tracking-tight text-accent">
              {money(balance.balance, balance.currency)}
            </div>
            <div className="flex gap-6 text-sm">
              <Stat label="available" value={money(balance.available, balance.currency)} />
              <Stat label="held" value={money(balance.held, balance.currency)} />
            </div>
          </div>
        ) : (
          <div>
            <div className="font-mono text-6xl text-text-muted">—</div>
            {balanceError && (
              <div className="mt-3 text-xs font-mono text-toy-red">{balanceError}</div>
            )}
          </div>
        )}
      </section>

      {/* Runs */}
      <section className="animate-fade-in delay-100">
        <div className="flex items-center justify-between mb-4">
          <div className="text-xs font-mono uppercase tracking-[0.2em] text-text-muted">
            recent runs
          </div>
          <div className="text-xs font-mono text-text-muted">
            {runs.length}
          </div>
        </div>
        {runsError && (
          <div className="mb-4 border-2 border-toy-red bg-toy-red/10 rounded-2xl px-4 py-2 text-xs text-toy-red font-mono">
            runs: {runsError}
          </div>
        )}
        {runs.length === 0 ? (
          <div className="border-2 border-dashed border-black rounded-2xl p-10 text-center bg-white">
            <div className="text-sm text-text-secondary mb-1">No runs yet</div>
            <div className="text-xs font-mono text-text-muted">
              try <span className="text-accent">aegntic run openmeteo/weather/current --query &#123;&quot;lat&quot;:&quot;52.52&quot;,&quot;lon&quot;:&quot;13.405&quot;&#125;</span>
            </div>
          </div>
        ) : (
          <div className="border-2 border-black rounded-2xl overflow-hidden bg-white toy-shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-mono uppercase tracking-wider text-text-muted swiss-line-b">
                  <th className="px-4 py-3 font-normal">provider / endpoint</th>
                  <th className="px-4 py-3 font-normal">status</th>
                  <th className="px-4 py-3 font-normal text-right">cost</th>
                  <th className="px-4 py-3 font-normal text-right">when</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                {runs.map((r) => (
                  <tr
                    key={r.id}
                    className="swiss-line-b last:border-0 hover:bg-bg transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="text-text-primary">{r.provider}</span>
                      <span className="text-text-muted"> / </span>
                      <span className="text-text-secondary">{r.endpoint}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`toy-chip inline-block text-[10px] px-2 py-0.5 rounded-full ${
                          STATUS_STYLE[r.status] ?? STATUS_STYLE.READY
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-text-secondary">
                      {r.cost ? money(r.cost.value, r.cost.currency) : "—"}
                    </td>
                    <td className="px-4 py-3 text-right text-text-muted">
                      {timeAgo(r.createdAt)} ago
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-mono uppercase tracking-wider text-text-muted mb-0.5">
        {label}
      </div>
      <div className="font-mono text-text-secondary">{value}</div>
    </div>
  );
}
