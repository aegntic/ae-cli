"use client";

import { useEffect, useState, useCallback } from "react";
import { listKeys, createKey, deleteKey, type ApiKey, type ApiKeyCreated } from "@/lib/api";
import { useApiKey } from "@/components/ApiKeyContext";

export default function KeysPage() {
  const { apiKey } = useApiKey();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newLabel, setNewLabel] = useState("");
  const [creating, setCreating] = useState(false);
  const [justCreated, setJustCreated] = useState<ApiKeyCreated | null>(null);
  const [copied, setCopied] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchKeys = useCallback(async () => {
    if (!apiKey) {
      setLoading(false);
      return;
    }
    try {
      const res = await listKeys(apiKey);
      setKeys(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load keys");
    } finally {
      setLoading(false);
    }
  }, [apiKey]);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  const handleCreate = async () => {
    if (!newLabel.trim() || !apiKey) return;

    setCreating(true);
    try {
      const res = await createKey(apiKey, newLabel.trim());
      setJustCreated(res.data);
      setNewLabel("");
      await fetchKeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create key");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (label: string) => {
    if (!apiKey) return;

    try {
      await deleteKey(apiKey, label);
      setDeleteConfirm(null);
      await fetchKeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete key");
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">API Keys</h1>

      {justCreated && (
        <div className="mb-6 rounded-xl border border-green/20 bg-green/5 p-5">
          <h2 className="mb-2 text-sm font-semibold text-green">
            Key created successfully
          </h2>
          <p className="mb-3 text-xs text-text-muted">
            Copy this key now. It will not be shown again.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-lg bg-bg px-3 py-2 font-mono text-xs text-text-primary">
              {justCreated.key}
            </code>
            <button
              onClick={() => handleCopy(justCreated.key)}
              className="shrink-0 rounded-lg bg-accent/10 px-3 py-2 text-xs font-medium text-accent transition-colors hover:bg-accent/20"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      )}

      <div className="mb-6 rounded-xl border border-border bg-bg-card p-5">
        <h2 className="mb-3 text-sm font-semibold">Create new key</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            placeholder="Key label (e.g. production, dev)"
            className="flex-1 rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
          />
          <button
            onClick={handleCreate}
            disabled={!newLabel.trim() || creating}
            className="shrink-0 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-accent/50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {creating ? "Creating..." : "Create"}
          </button>
        </div>
      </div>

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

      {!loading && !error && keys.length === 0 && (
        <div className="py-16 text-center text-sm text-text-muted">
          No API keys yet. Create one above.
        </div>
      )}

      {!loading && keys.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-bg-elevated">
                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted">Label</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted">Prefix</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted">Created</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-text-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {keys.map((key) => (
                <tr
                  key={key.label}
                  className="border-b border-border-subtle last:border-0"
                >
                  <td className="px-4 py-3 font-medium text-text-primary">
                    {key.label}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-text-muted">
                    {key.prefix}...
                  </td>
                  <td className="px-4 py-3">
                    {key.active ? (
                      <span className="inline-flex items-center gap-1.5 text-xs text-green">
                        <span className="h-1.5 w-1.5 rounded-full bg-green" />
                        Active
                      </span>
                    ) : (
                      <span className="text-xs text-text-muted">Inactive</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-text-muted">
                    {new Date(key.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {deleteConfirm === key.label ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleDelete(key.label)}
                          className="rounded-md bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-500 transition-colors hover:bg-red-500/20"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="rounded-md px-2.5 py-1 text-xs text-text-muted transition-colors hover:text-text-secondary"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(key.label)}
                        className="rounded-md px-2.5 py-1 text-xs text-text-muted transition-colors hover:text-red-500"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
