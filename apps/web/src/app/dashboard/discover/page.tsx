"use client";

import { useEffect, useState, useCallback } from "react";
import { discover, type Endpoint } from "@/lib/api";
import { useApiKey } from "@/components/ApiKeyContext";

export default function DiscoverPage() {
  const { apiKey } = useApiKey();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Endpoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!query.trim() || !apiKey) return;

    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const res = await discover(apiKey, query);
      setResults(res.data.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [query, apiKey]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (query.trim()) handleSearch();
    }, 400);
    return () => clearTimeout(debounce);
  }, [query, handleSearch]);

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Discover Tools</h1>

      <div className="relative mb-8">
        <svg
          viewBox="0 0 24 24"
          className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <circle cx="11" cy="11" r="8" />
          <path strokeLinecap="round" d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tools..."
          className="w-full rounded-xl border border-border bg-bg-card py-3.5 pl-12 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
        />
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

      {!loading && !error && searched && results.length === 0 && (
        <div className="py-16 text-center text-sm text-text-muted">
          No tools found for &ldquo;{query}&rdquo;
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="space-y-3">
          {results.map((ep) => {
            const key = `${ep.provider}/${ep.path}`;
            const isExpanded = expanded === key;

            return (
              <div
                key={key}
                className="rounded-xl border border-border bg-bg-card transition-colors hover:border-border"
              >
                <button
                  onClick={() => setExpanded(isExpanded ? null : key)}
                  className="flex w-full items-start gap-4 p-5 text-left"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-sm font-bold text-accent">
                    {ep.provider[0].toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-medium text-text-primary">
                        {ep.provider}/{ep.path}
                      </span>
                      {ep.verified && (
                        <span className="inline-flex items-center rounded-full bg-green/10 px-1.5 py-0.5 text-[10px] font-medium text-green">
                          verified
                        </span>
                      )}
                      {ep.relevanceScore != null && (
                        <span className="text-xs text-text-muted">
                          {Math.round(ep.relevanceScore * 100)}%
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-text-secondary line-clamp-2">
                      {ep.description}
                    </p>
                    <div className="mt-2 flex items-center gap-3 text-xs text-text-muted">
                      <span className="rounded-md bg-bg px-2 py-0.5 font-mono">
                        ${ep.costModel.unitPrice.toFixed(4)}/{ep.costModel.type === "per_result" ? "result" : "call"}
                      </span>
                      <span>{ep.costModel.type}</span>
                    </div>
                  </div>
                  <svg
                    viewBox="0 0 24 24"
                    className={`mt-1 h-4 w-4 shrink-0 text-text-muted transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
                  </svg>
                </button>

                {isExpanded && (
                  <div className="border-t border-border-subtle p-5">
                    <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
                      Input Schema
                    </h3>
                    <SchemaBlock ep={ep} />
                    <div className="mt-4 flex gap-2">
                      <button className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-accent/50">
                        Run this
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SchemaBlock({ ep }: { ep: Endpoint }) {
  const { inputSchema } = ep;
  const hasParams =
    inputSchema.queryParams || inputSchema.pathParams || inputSchema.body;

  if (!hasParams) {
    return (
      <p className="text-sm text-text-muted">No input parameters required.</p>
    );
  }

  return (
    <div className="space-y-3">
      {inputSchema.queryParams && (
        <ParamTable title="Query Parameters" fields={inputSchema.queryParams} />
      )}
      {inputSchema.pathParams && (
        <ParamTable title="Path Parameters" fields={inputSchema.pathParams} />
      )}
      {inputSchema.body && (
        <ParamTable title={`Body${inputSchema.bodyType ? ` (${inputSchema.bodyType})` : ""}`} fields={inputSchema.body} />
      )}
    </div>
  );
}

function ParamTable({
  title,
  fields,
}: {
  title: string;
  fields: Record<string, { type: string; description?: string; required?: boolean; default?: unknown }>;
}) {
  return (
    <div>
      <h4 className="mb-1.5 text-xs font-medium text-text-secondary">{title}</h4>
      <div className="rounded-lg border border-border-subtle overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border-subtle bg-bg">
              <th className="px-3 py-2 text-left font-medium text-text-muted">Name</th>
              <th className="px-3 py-2 text-left font-medium text-text-muted">Type</th>
              <th className="px-3 py-2 text-left font-medium text-text-muted">Required</th>
              <th className="px-3 py-2 text-left font-medium text-text-muted">Description</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(fields).map(([name, field]) => (
              <tr key={name} className="border-b border-border-subtle last:border-0">
                <td className="px-3 py-2 font-mono text-text-primary">{name}</td>
                <td className="px-3 py-2 text-text-secondary">{field.type}</td>
                <td className="px-3 py-2 text-text-secondary">
                  {field.required ? (
                    <span className="text-amber">yes</span>
                  ) : (
                    "no"
                  )}
                </td>
                <td className="px-3 py-2 text-text-muted">
                  {field.description ?? "\u2014"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
