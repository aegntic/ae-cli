import type { Metadata } from "next";
import Link from "next/link";

export const revalidate = 300;

const GATEWAY =
  process.env.NEXT_PUBLIC_AEGNTIC_BASE_URL ?? "https://gateway.aedex.ing";

type LeaderboardTool = {
  provider: string;
  endpoint: string;
  description: string;
  verified: boolean;
  totalCalls: number;
  successRate: number;
  p50Latency: number;
  p95Latency: number;
  avgItemCount: number;
  lastCallAt: string;
};

type Leaderboard = {
  generatedAt: string;
  tools: LeaderboardTool[];
  disclaimer: string;
  requestId: string;
};

export const metadata: Metadata = {
  title: "aegntic reliability leaderboard — data-tool success rates & latency",
  description:
    "Live success rates, p50/p95 latency, and call volume for data tools (coingecko, openmeteo, hackernews, frankfurter). Aggregated from real provider calls — no marketing claims.",
  alternates: { canonical: "https://aegntic.ai/leaderboard" },
  openGraph: {
    title: "Which data tools actually work? Live reliability scores",
    description:
      "Live success rates and latency for data tools — aggregated from real provider calls, not marketing. Tools with <3 calls omitted.",
    url: "https://aegntic.ai/leaderboard",
    siteName: "Aegntic",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "aegntic reliability leaderboard — data-tool success rates",
    description:
      "Live success rates + latency for data tools. Aggregated from real provider calls, not marketing.",
  },
};

async function fetchLeaderboard(): Promise<Leaderboard | null> {
  try {
    const res = await fetch(`${GATEWAY}/leaderboard`, {
      next: { revalidate },
    });
    if (!res.ok) return null;
    return (await res.json()) as Leaderboard;
  } catch {
    return null;
  }
}

function rateColor(rate: number): string {
  if (rate >= 0.95) return "bg-toy-green";
  if (rate >= 0.8) return "bg-toy-yellow";
  return "bg-toy-red";
}

function rateText(rate: number): string {
  if (rate >= 0.95) return "text-toy-green";
  if (rate >= 0.8) return "text-toy-yellow";
  return "text-toy-red";
}

function rateLabel(rate: number): string {
  if (rate >= 0.95) return "healthy";
  if (rate >= 0.8) return "degraded";
  return "unreliable";
}

function pct(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`;
}

function ms(latency: number): string {
  if (!Number.isFinite(latency)) return "—";
  return latency >= 1000
    ? `${(latency / 1000).toFixed(2)}s`
    : `${Math.round(latency)}ms`;
}

function timeAgo(iso: string): string {
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return "—";
  const s = Math.max(0, Math.floor((Date.now() - t) / 1000));
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

function formatGeneratedAt(iso: string): string {
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return iso;
  return d.toISOString().replace("T", " ").slice(0, 19) + " UTC";
}

export default async function LeaderboardPage() {
  const data = await fetchLeaderboard();

  return (
    <main className="min-h-screen bg-bg text-text-primary">
      {/* Nav — identical to landing */}
      <header className="sticky top-0 z-50 swiss-line-b bg-bg/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-tight">
            <div className="toy-chip flex h-7 w-7 items-center justify-center rounded-xl bg-black text-xs font-bold text-white">
              Ae
            </div>
            <span>aegntic</span>
          </Link>
          <nav className="flex items-center gap-6 text-sm text-text-secondary">
            <Link href="/leaderboard" className="text-text-primary">
              Reliability
            </Link>
            <Link href="/app" className="transition-colors hover:text-text-primary">
              Console
            </Link>
            <Link
              href="/app"
              className="toy-button bg-black px-3 py-1.5 text-xs font-medium text-white"
            >
              Get started →
            </Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-12 md:py-16">
        {/* Breadcrumb */}
        <div className="text-xs font-mono uppercase tracking-[0.2em] text-text-muted mb-4 animate-fade-in-up">
          aegntic / leaderboard
        </div>

        {/* H1 */}
        <h1 className="text-3xl font-bold leading-tight tracking-tight md:text-4xl lg:text-5xl animate-fade-in-up delay-100">
          <span className="text-accent">Which data tools actually work?</span>
          <br />
          <span className="text-text-primary">Live reliability scores.</span>
        </h1>

        <p className="mt-6 max-w-2xl text-base leading-relaxed text-text-secondary md:text-lg animate-fade-in-up delay-200">
          Live success rates and latency aggregated from{" "}
          <span className="text-text-primary font-medium">real provider calls</span> routed
          through aegntic. Tools with fewer than 3 calls are omitted.
        </p>

        <p className="mt-5 max-w-2xl text-sm leading-relaxed text-text-muted animate-fade-in-up delay-300">
          Every number is measured from actual API responses — not self-reported, not synthetic.
          The leaderboard is regenerated on each request and cached for 5 minutes.
        </p>

        {/* Table */}
        <div className="mt-10 animate-fade-in-up delay-400">
          {data ? (
            data.tools.length > 0 ? (
              <LeaderboardTable data={data} />
            ) : (
              <EmptyState />
            )
          ) : (
            <UnavailableState />
          )}
        </div>

        {/* CTA cards */}
        <section className="mt-14 grid gap-4 md:grid-cols-2">
          <Link
            href="/app"
            className="group rounded-2xl border-2 border-black bg-white p-6 toy-shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:toy-shadow"
          >
            <div className="text-xs font-semibold uppercase tracking-wider text-accent">
              For operators
            </div>
            <h2 className="mt-1 text-lg font-semibold">Open the console</h2>
            <p className="mt-2 text-sm text-text-muted">
              Inspect, run, and meter tool calls with a workspace API key.
            </p>
            <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-accent">
              Go to console <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </div>
          </Link>

          <div className="rounded-2xl border-2 border-black bg-white p-6 toy-shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              How reliability is measured
            </div>
            <h2 className="mt-1 text-lg font-semibold">Methodology</h2>
            <p className="mt-2 text-sm text-text-muted leading-relaxed">
              Each routed call is timed and recorded as success or failure (HTTP 4xx/5xx,
              network error, or malformed response). Success rate ={" "}
              <span className="font-mono text-text-secondary">successful / total</span>{" "}
              over the rolling window. p50/p95 are latency percentiles. Tools with{" "}
              <span className="font-mono text-text-secondary">&lt;3</span> calls are omitted.
            </p>
          </div>
        </section>

        {data?.disclaimer && (
          <p className="mt-12 text-xs leading-relaxed text-text-muted swiss-line pt-6">
            {data.disclaimer}
          </p>
        )}

        <div className="mt-4 flex items-center justify-between text-xs text-text-muted">
          <span>
            {data
              ? `Last updated: ${formatGeneratedAt(data.generatedAt)}`
              : "Last updated: unavailable"}
          </span>
          <span className="font-mono">cached 5m · isr</span>
        </div>
      </div>
    </main>
  );
}

function LeaderboardTable({ data }: { data: Leaderboard }) {
  const rows = [...data.tools].sort((a, b) => {
    if (b.successRate !== a.successRate) return b.successRate - a.successRate;
    return b.totalCalls - a.totalCalls;
  });

  return (
    <div className="rounded-2xl border-2 border-black bg-white overflow-hidden toy-shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs font-mono uppercase tracking-wider text-text-muted swiss-line-b">
              <th className="px-4 py-3 font-normal">provider / endpoint</th>
              <th className="px-4 py-3 font-normal">status</th>
              <th className="px-4 py-3 font-normal text-right">success</th>
              <th className="px-4 py-3 font-normal text-right">p50</th>
              <th className="px-4 py-3 font-normal text-right">p95</th>
              <th className="px-4 py-3 font-normal text-right">calls</th>
              <th className="px-4 py-3 font-normal text-right">last</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {rows.map((t) => (
              <tr
                key={`${t.provider}/${t.endpoint}`}
                className="swiss-line-b last:border-0 hover:bg-bg transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-text-primary">{t.provider}</span>
                    <span className="text-text-muted">/</span>
                    <span className="text-text-secondary">{t.endpoint}</span>
                    {t.verified && (
                      <span className="toy-chip inline-flex h-4 w-4 items-center justify-center rounded-full bg-toy-green text-[10px] text-white">
                        ✓
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 text-xs text-text-muted font-sans max-w-md truncate">
                    {t.description}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`toy-chip inline-block text-[10px] px-2 py-0.5 rounded-full text-white ${rateColor(t.successRate)}`}>
                    {rateLabel(t.successRate)}
                  </span>
                </td>
                <td className={`px-4 py-3 text-right font-semibold ${rateText(t.successRate)}`}>
                  {pct(t.successRate)}
                </td>
                <td className="px-4 py-3 text-right text-text-secondary">
                  {ms(t.p50Latency)}
                </td>
                <td className="px-4 py-3 text-right text-text-secondary">
                  {ms(t.p95Latency)}
                </td>
                <td className="px-4 py-3 text-right text-text-secondary">
                  {t.totalCalls}
                </td>
                <td className="px-4 py-3 text-right text-text-muted">
                  {timeAgo(t.lastCallAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="border-2 border-dashed border-black rounded-2xl p-12 text-center bg-white">
      <div className="text-sm text-text-secondary mb-1">No tools with enough calls yet</div>
      <div className="text-xs font-mono text-text-muted">
        tools appear here once they accumulate ≥3 real calls
      </div>
      <Link
        href="/app"
        className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-accent transition-colors hover:text-accent-dim"
      >
        Run a tool to populate the board <span>→</span>
      </Link>
    </div>
  );
}

function UnavailableState() {
  return (
    <div className="border-2 border-dashed border-black rounded-2xl p-12 text-center bg-white">
      <div className="text-sm text-text-secondary mb-1">
        Reliability data temporarily unavailable
      </div>
      <div className="text-xs font-mono text-text-muted">
        the gateway did not respond — this page rebuilds automatically every 5 minutes
      </div>
    </div>
  );
}
