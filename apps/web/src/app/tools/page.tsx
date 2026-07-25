import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/Logo";

export const revalidate = 300;

const GATEWAY =
  process.env.NEXT_PUBLIC_AEGNTIC_BASE_URL ?? "https://gateway.aedex.ing";

export const metadata: Metadata = {
  title: "aedex tool catalog — runnable data tools, live prices & reliability",
  description:
    "Every tool your agent can call through one balance. Runnable, verified adapters (coingecko, openmeteo, hackernews, frankfurter) with live per-result pricing and real reliability. No per-vendor keys.",
  alternates: { canonical: "https://aedex.ing/tools" },
  openGraph: {
    title: "Every tool. One balance. — aedex catalog",
    description:
      "Runnable data tools with live per-result pricing and real reliability scores. One balance across every provider.",
    url: "https://aedex.ing/tools",
    siteName: "aedex",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "aedex tool catalog — runnable tools, live prices",
    description:
      "Runnable data tools with live per-result pricing and real reliability. One balance across every provider.",
  },
};

/* Verified, runnable adapters. Only endpoints actually exercised through the
 * gateway are listed with a price — never invent untested breadth. `reliKey`
 * matches the provider/endpoint shape the public /leaderboard reports, so live
 * reliability merges in when telemetry exists. */
type CatalogTool = {
  provider: string;
  endpoint: string;
  category: string;
  color: string;
  description: string;
  cost: string;
  runCmd: string;
  reliKey: string;
};

const TOOLS: CatalogTool[] = [
  {
    provider: "openmeteo",
    endpoint: "weather/current",
    category: "weather",
    color: "#E67E22",
    description: "Current weather by latitude / longitude. Temperature, wind, precipitation.",
    cost: "$0.001",
    runCmd: 'ae run openmeteo/weather/current --input \'{"lat":"52.52","lon":"13.41"}\'',
    reliKey: "openmeteo/weather",
  },
  {
    provider: "coingecko",
    endpoint: "markets",
    category: "finance · crypto",
    color: "#06A77D",
    description: "Coin market data — price, market cap, 24h change across listed assets.",
    cost: "$0.001",
    runCmd: "ae run coingecko/markets --input '{}'",
    reliKey: "coingecko/markets",
  },
  {
    provider: "hackernews",
    endpoint: "stories/top",
    category: "news",
    color: "#4361EE",
    description: "Top Hacker News stories with score, author, and link.",
    cost: "$0.002",
    runCmd: "ae run hackernews/stories/top --input '{}'",
    reliKey: "hackernews/stories/top",
  },
  {
    provider: "frankfurter",
    endpoint: "rates/latest",
    category: "finance · fx",
    color: "#8E44AD",
    description: "Latest FX rates from ECB data. Base currency → target.",
    cost: "$0.001",
    runCmd: 'ae run frankfurter/rates/latest --input \'{"base":"USD","target":"EUR"}\'',
    reliKey: "frankfurter/rates/latest",
  },
];

// Providers the router reaches beyond the verified set. Listed by capability,
// not as fabricated verified endpoints — discover returns these at runtime.
const PROVIDER_REACH = [
  { name: "Apify", cap: "web scraping · actors" },
  { name: "Browserbase", cap: "headless browser automation" },
  { name: "People Data Labs", cap: "people / company enrichment" },
  { name: "Exa", cap: "semantic web search" },
  { name: "Reddit", cap: "social scraping" },
  { name: "X / Twitter", cap: "social scraping" },
];

type ReliabilityMap = Record<string, { successRate: number; p50: number; calls: number }>;

async function fetchReliability(): Promise<ReliabilityMap> {
  try {
    const res = await fetch(`${GATEWAY}/leaderboard`, { next: { revalidate } });
    if (!res.ok) return {};
    const json = (await res.json()) as {
      tools: { provider: string; endpoint: string; successRate: number; p50Latency: number; totalCalls: number }[];
    };
    const map: ReliabilityMap = {};
    for (const t of json.tools ?? []) {
      map[`${t.provider}/${t.endpoint}`] = {
        successRate: t.successRate,
        p50: t.p50Latency,
        calls: t.totalCalls,
      };
    }
    return map;
  } catch {
    return {};
  }
}

function rateText(rate: number): string {
  if (rate >= 0.95) return "text-toy-green";
  if (rate >= 0.8) return "text-toy-yellow";
  return "text-toy-red";
}

function pct(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`;
}

function ms(latency: number): string {
  if (!Number.isFinite(latency)) return "—";
  return latency >= 1000 ? `${(latency / 1000).toFixed(2)}s` : `${Math.round(latency)}ms`;
}

export default async function ToolsPage() {
  const reliability = await fetchReliability();

  return (
    <main className="min-h-screen bg-bg text-text-primary">
      <header className="sticky top-0 z-50 swiss-line-b bg-bg/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-tight">
            <Logo height={24} />
          </Link>
          <nav className="flex items-center gap-6 text-sm text-text-secondary">
            <Link href="/tools" className="text-text-primary">
              Tools
            </Link>
            <Link href="/leaderboard" className="transition-colors hover:text-text-primary">
              Reliability
            </Link>
            <Link
              href="/signup"
              className="toy-button bg-accent px-3 py-1.5 text-xs font-medium text-white"
            >
              Get free credit →
            </Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-12 md:py-16">
        <div className="text-xs font-mono uppercase tracking-[0.2em] text-text-muted mb-4 animate-fade-in-up">
          aedex / tools
        </div>

        <h1 className="text-3xl font-bold leading-tight tracking-tight md:text-4xl lg:text-5xl animate-fade-in-up delay-100">
          <span className="text-accent">Every tool.</span> One balance.
        </h1>

        <p className="mt-6 max-w-2xl text-base leading-relaxed text-text-secondary md:text-lg animate-fade-in-up delay-200">
          The tools your agent calls, live and metered against one prepaid balance. No vendor
          portal, no subscription cliff — and no invented breadth. Every endpoint below is
          runnable; its reliability is measured from real calls.
        </p>

        {/* Verified tools */}
        <section className="mt-12 animate-fade-in-up delay-300">
          <div className="flex items-baseline justify-between swiss-line-b pb-3 mb-5">
            <h2 className="text-sm font-mono uppercase tracking-[0.18em] text-text-secondary">
              verified · runnable
            </h2>
            <span className="font-mono text-[11px] text-text-muted">{TOOLS.length} adapters</span>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {TOOLS.map((t) => {
              const r = reliability[t.reliKey];
              return (
                <article
                  key={`${t.provider}/${t.endpoint}`}
                  className="group flex flex-col rounded-2xl border-2 border-border bg-bg-elevated p-5 toy-shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:toy-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: t.color }}
                        aria-hidden
                      />
                      <span className="font-mono text-sm text-text-primary">
                        {t.provider}
                        <span className="text-text-muted">/{t.endpoint}</span>
                      </span>
                    </div>
                    <span className="toy-chip rounded-full bg-bg px-2 py-0.5 text-[10px] font-mono uppercase tracking-wide text-text-muted">
                      {t.category}
                    </span>
                  </div>

                  <p className="mt-3 text-sm leading-relaxed text-text-muted">{t.description}</p>

                  <div className="mt-4 flex items-center justify-between swiss-line-b pb-3">
                    <span className="text-xs text-text-muted">from</span>
                    <span className="font-mono text-sm font-semibold text-text-primary">
                      {t.cost}
                      <span className="text-text-muted font-normal"> / result</span>
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-text-muted">reliability</span>
                    {r ? (
                      <span className={`font-mono font-semibold ${rateText(r.successRate)}`}>
                        {pct(r.successRate)} · p50 {ms(r.p50)}
                      </span>
                    ) : (
                      <span className="font-mono text-text-muted">— · warming up</span>
                    )}
                  </div>

                  <code className="mt-4 block truncate rounded-lg border-2 border-border bg-bg px-3 py-2 font-mono text-[11px] text-text-secondary transition-colors group-hover:text-text-primary">
                    <span className="text-text-muted">$</span> {t.runCmd}
                  </code>
                </article>
              );
            })}
          </div>
        </section>

        {/* Provider reach */}
        <section className="mt-16 animate-fade-in-up delay-400">
          <div className="flex items-baseline justify-between swiss-line-b pb-3 mb-5">
            <h2 className="text-sm font-mono uppercase tracking-[0.18em] text-text-secondary">
              routed catalog
            </h2>
            <span className="font-mono text-[11px] text-text-muted">discover at runtime</span>
          </div>
          <p className="mb-5 max-w-2xl text-sm leading-relaxed text-text-muted">
            Beyond the verified set, the router reaches these providers by intent. They are
            returned by <span className="font-mono text-text-secondary">ae discover</span> — not
            hand-listed as fake verified endpoints.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PROVIDER_REACH.map((p) => (
              <div
                key={p.name}
                className="rounded-xl border-2 border-border bg-bg-elevated px-4 py-3 toy-shadow-sm"
              >
                <div className="text-sm font-semibold text-text-primary">{p.name}</div>
                <div className="mt-0.5 font-mono text-[11px] text-text-muted">{p.cap}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mt-16 rounded-2xl border-2 border-border bg-bg-elevated p-8 toy-shadow animate-fade-in-up delay-500">
          <h2 className="text-xl font-semibold tracking-tight">
            Run any of these from one balance.
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-text-muted">
            Install the skill, mint a key, and your agent discovers + runs these tools itself.
            Billed per result — failed runs are free.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/signup"
              className="toy-button bg-accent px-5 py-2.5 text-sm font-bold text-white"
            >
              Get free test credit →
            </Link>
            <Link
              href="/aedex.md"
              className="rounded-2xl border-2 border-border bg-bg px-5 py-2.5 font-mono text-xs text-text-secondary transition-colors hover:text-accent"
            >
              set up https://aedex.ing/aedex.md
            </Link>
          </div>
        </section>

        <div className="mt-10 text-xs font-mono text-text-muted">
          pricing is per result · reliability aggregated from real calls · cached 5m · isr
        </div>
      </div>
    </main>
  );
}
