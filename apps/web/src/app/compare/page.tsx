import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { AEDEX, COMPETITORS } from "@/lib/comparisons";

export const metadata: Metadata = {
  title: "aedex vs the alternatives — agent tool routers, scrapers & integrations compared",
  description:
    "How aedex compares to Monid, Firecrawl, Bright Data, ScraperAPI, Apify, and Composio. Per-result billing, reliability routing, one balance, and a signed ledger — honest side-by-side.",
  alternates: { canonical: "https://aedex.ing/compare" },
  openGraph: {
    title: "aedex vs the alternatives",
    description:
      "Side-by-side: aedex vs Monid, Firecrawl, Bright Data, ScraperAPI, Apify, Composio. Per-result billing, reliability routing, one balance.",
    url: "https://aedex.ing/compare",
    siteName: "aedex",
    type: "website",
  },
};

export default function CompareHub() {
  return (
    <main className="min-h-screen bg-bg text-text-primary">
      <header className="sticky top-0 z-50 swiss-line-b bg-bg/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-tight">
            <Logo height={24} />
          </Link>
          <nav className="flex items-center gap-6 text-sm text-text-secondary">
            <Link href="/tools" className="transition-colors hover:text-text-primary">
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
          aedex / compare
        </div>

        <h1 className="text-3xl font-bold leading-tight tracking-tight md:text-4xl lg:text-5xl animate-fade-in-up delay-100">
          <span className="text-accent">aedex</span> vs the alternatives.
        </h1>

        <p className="mt-6 max-w-2xl text-base leading-relaxed text-text-secondary md:text-lg animate-fade-in-up delay-200">
          One balance across every tool, billed <span className="text-text-primary font-medium">per result</span>,
          routed by <span className="text-text-primary font-medium">live reliability</span>, recorded to a
          <span className="text-text-primary font-medium"> signed ledger</span>. Here is how that stacks up against
          the tools you are probably evaluating — honestly.
        </p>

        {/* Comparison cards */}
        <section className="mt-12 grid gap-3 animate-fade-in-up delay-300">
          {COMPETITORS.map((c, i) => (
            <Link
              key={c.slug}
              href={`/compare/${c.slug}`}
              className="group flex flex-col gap-2 rounded-2xl border-2 border-border bg-bg-elevated p-5 toy-shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:toy-shadow md:flex-row md:items-center md:justify-between"
            >
              <div className="flex items-start gap-4">
                <span className="mt-0.5 font-mono text-xs text-text-muted">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-lg font-semibold">
                      {AEDEX.name} <span className="text-text-muted">vs</span> {c.name}
                    </span>
                    <span className="toy-chip rounded-full bg-bg px-2 py-0.5 text-[10px] font-mono uppercase tracking-wide text-text-muted">
                      {c.category}
                    </span>
                  </div>
                  <p className="mt-1 max-w-2xl text-sm leading-relaxed text-text-muted">{c.blurb}</p>
                </div>
              </div>
              <span className="shrink-0 text-sm font-semibold text-accent transition-transform group-hover:translate-x-0.5">
                Compare →
              </span>
            </Link>
          ))}
        </section>

        {/* Why aedex */}
        <section className="mt-14 rounded-2xl border-2 border-border bg-bg-elevated p-6 toy-shadow-sm animate-fade-in-up delay-400">
          <h2 className="text-sm font-mono uppercase tracking-[0.18em] text-text-secondary">
            where aedex wins
          </h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {[
              { t: "Billed per result", d: "Failed or empty runs are free. You pay for value delivered, not attempts." },
              { t: "Reliability routing", d: "Every call is instrumented; tools route by live success rate and latency." },
              { t: "Signed ledger", d: "Every debit is auditable — agent spend has a tamper-evident record." },
            ].map((x) => (
              <div key={x.t}>
                <div className="text-sm font-semibold text-text-primary">{x.t}</div>
                <p className="mt-1 text-sm leading-relaxed text-text-muted">{x.d}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-12 rounded-2xl border-2 border-accent bg-bg-elevated p-8 toy-shadow animate-fade-in-up delay-500">
          <h2 className="text-xl font-semibold tracking-tight">Try it with free test credit.</h2>
          <p className="mt-2 text-sm leading-relaxed text-text-muted">
            Install the skill, mint a key, and let your agent discover and run tools itself.
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
        </div>
      </div>
    </main>
  );
}
