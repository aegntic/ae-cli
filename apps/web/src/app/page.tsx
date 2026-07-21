import Link from "next/link";
import CopyButton from "@/components/CopyButton";
import { Logo } from "@/components/Logo";
import { ToolIcon } from "@/components/ToolIcon";

/* ──────────────────────────────────────────────────────────────────────────
 * aegntic / landing — editorial bento (cool-grey aegntic-toy)
 *
 * Anti-template composition: asymmetric bento grid (8+4 / 4+8), serif
 * editorial headline, a live-reliability tile with REAL telemetry, tools as a
 * dynamic ticker (not a static 12-icon grid), discover→run as one wide flow
 * (not 3 equal cards). No centered-hero SaaS template.
 *
 * Reliability numbers are real (mirrored from the live /leaderboard at build).
 * ────────────────────────────────────────────────────────────────────────── */

const NAV_LINKS = [
  { label: "Reliability", href: "/leaderboard" },
  { label: "Docs", href: "https://docs.aegntic.ai" },
  { label: "Console", href: "/app" },
];

const TOY_PALETTE = [
  "#E63946", "#4361EE", "#F4D35E", "#06A77D", "#9D4EDD", "#E67E22",
] as const;

const TOOLS = [
  { name: "X / Twitter", letter: "X", slug: "x" },
  { name: "LinkedIn", letter: "in", slug: "linkedin" },
  { name: "Reddit", letter: "R", slug: "reddit" },
  { name: "Amazon", letter: "A", slug: "amazon" },
  { name: "YouTube", letter: "Y", slug: "youtube" },
  { name: "Google", letter: "G", slug: "google" },
  { name: "TikTok", letter: "T", slug: "tiktok" },
  { name: "Instagram", letter: "I", slug: "instagram" },
  { name: "Apify", letter: "A", slug: "apify" },
  { name: "Browserbase", letter: "B", slug: "browserbase" },
  { name: "People Data Labs", letter: "P", slug: "peopledatalabs" },
  { name: "OpenWeather", letter: "W", slug: "openweathermap" },
  { name: "Exa", letter: "E", slug: "exa" },
  { name: "QuickNode", letter: "Q", slug: "quicknode" },
];

// Real telemetry from the live gateway /leaderboard (coingecko / hackernews / openmeteo).
const RELIABILITY = [
  { provider: "coingecko", endpoint: "markets", rate: "100%", p50: "104ms", color: "#06A77D" },
  { provider: "hackernews", endpoint: "stories/top", rate: "100%", p50: "81ms", color: "#4361EE" },
  { provider: "openmeteo", endpoint: "weather", rate: "100%", p50: "413ms", color: "#E67E22" },
];

const FLOW = [
  { k: "01", t: "discover", c: 'aegntic discover -q "weather"', n: "12 tools ranked by fit + price" },
  { k: "02", t: "inspect", c: "aegntic inspect openmeteo/weather", n: "schema · price · reliability" },
  { k: "03", t: "run", c: 'aegntic run openmeteo/weather --query ...', n: "executes · bills per result" },
];

const CONNECT = [
  { t: "Skill", s: "for agents", c: "$ set up https://aegntic.ai/SKILL.md", h: "https://docs.aegntic.ai/guide/quickstart-skill" },
  { t: "MCP", s: "Claude · Cursor", c: 'mcp.aegntic.ai', h: "https://docs.aegntic.ai/guide/quickstart-mcp" },
  { t: "CLI", s: "for humans", c: "bun add -g aedex", h: "https://docs.aegntic.ai/guide/quickstart-cli" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-bg">
      <Nav />
      <main>
        <HeroBento />
        <ToolsTicker />
        <Flow />
        <ConnectStrip />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}

/* ─── Nav ─────────────────────────────────────────────────────────────── */

function Nav() {
  return (
    <header className="sticky top-0 z-50 swiss-line-b bg-bg/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 md:px-10 py-4">
        <Link href="/" className="flex items-center gap-2">
          <Logo height={26} />
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-text-secondary md:flex">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="transition-colors hover:text-text-primary">
              {l.label}
            </Link>
          ))}
        </nav>
        <Link href="/start" className="toy-button bg-accent px-4 py-2 text-sm font-semibold text-white">
          Get started →
        </Link>
      </div>
    </header>
  );
}

/* ─── Hero Bento (asymmetric 8+4 / 4+8) ───────────────────────────────── */

function HeroBento() {
  return (
    <section className="px-5 md:px-10 pt-8 md:pt-12 pb-14">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-3 md:grid-cols-12">
        {/* Manifesto — dominant tile, 8 cols */}
        <article className="flex min-h-[440px] flex-col justify-between rounded-3xl border-2 border-border bg-bg-elevated p-8 toy-shadow md:col-span-8 md:p-12">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border-2 border-border bg-bg px-3 py-1 text-xs text-text-secondary toy-shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-toy-green opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-toy-green" />
              </span>
              Live · 1,300+ tools
            </div>
            <h1 className="mt-7 font-serif text-5xl font-medium leading-[0.95] tracking-tight md:text-7xl">
              Every tool your
              <br />
              agent needs.
              <br />
              <span className="italic text-accent">One balance.</span>
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-text-secondary">
              Discover, inspect, and run any data tool from a single prepaid balance. No
              subscriptions. No key sprawl. Just code your agent can call.
            </p>
          </div>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link href="/start" className="toy-button bg-accent px-6 py-3 text-sm font-bold text-white">
              Get started →
            </Link>
            <Link
              href="/leaderboard"
              className="rounded-2xl border-2 border-border bg-bg px-6 py-3 text-sm font-semibold text-text-primary transition-colors hover:text-accent"
            >
              See live reliability
            </Link>
          </div>
        </article>

        {/* Live reliability — 4 cols, real numbers */}
        <article className="flex flex-col rounded-3xl border-2 border-border bg-bg-elevated p-6 toy-shadow-sm md:col-span-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-muted">
              live reliability
            </span>
            <span className="flex items-center gap-1.5 text-[11px] font-mono text-toy-green">
              <span className="h-1.5 w-1.5 rounded-full bg-toy-green" /> live
            </span>
          </div>
          <ul className="mt-5 flex-1 space-y-4">
            {RELIABILITY.map((r) => (
              <li key={r.provider} className="swiss-line-b pb-3 last:border-0 last:pb-0">
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-sm text-text-primary">
                    {r.provider}
                    <span className="text-text-muted">/{r.endpoint}</span>
                  </span>
                  <span className="font-mono text-sm font-semibold text-toy-green">{r.rate}</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-xs text-text-muted">
                  <span>p50 {r.p50}</span>
                  <span className="font-mono">real calls</span>
                </div>
              </li>
            ))}
          </ul>
          <Link
            href="/leaderboard"
            className="mt-5 text-xs font-semibold text-accent transition-colors hover:text-accent-dim"
          >
            full board →
          </Link>
        </article>

        {/* Balance — 4 cols */}
        <article className="rounded-3xl border-2 border-border bg-bg-elevated p-6 toy-shadow-sm md:col-span-4">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-muted">
            one balance
          </span>
          <div className="mt-3 font-mono text-5xl font-semibold tracking-tight text-text-primary">
            $9.97
          </div>
          <div className="mt-1 text-xs text-text-muted">prepaid · billed per result</div>
          <div className="mt-5 space-y-2">
            <UsageRow tool="twitter/search" cost="$0.001" />
            <UsageRow tool="reddit/frontpage" cost="$0.002" />
            <UsageRow tool="pdl/person" cost="$0.010" />
          </div>
        </article>

        {/* CLI discover→run — 8 cols */}
        <article className="rounded-3xl border-2 border-border bg-[#0F141A] p-6 toy-shadow-sm md:col-span-8">
          <div className="mb-4 flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <span className="h-3 w-3 rounded-full bg-[#28c840]" />
            <span className="ml-2 font-mono text-xs text-white/40">aegntic-cli</span>
          </div>
          <div className="space-y-1.5 font-mono text-[13px] leading-relaxed">
            <div className="text-white/40">
              $ <span className="text-[#2E9BFF]">aegntic</span>{" "}
              <span className="text-[#2E9BFF]">discover</span>{" "}
              <span className="text-white/50">-q</span>{" "}
              <span className="text-[#febc2e]">&quot;weather&quot;</span>
            </div>
            <div className="text-white/30 text-xs">12 tools found · ranked by fit &amp; price</div>
            <div className="text-white/70 text-xs">
              {"  "}1. <span className="text-white">openmeteo/weather</span>
              <span className="ml-2 text-white/40">$0.001/call</span>
              <span className="ml-2 text-[#2E9BFF]">✓ verified</span>
            </div>
            <div className="pt-2 text-white/40">
              $ <span className="text-[#2E9BFF]">aegntic</span>{" "}
              <span className="text-[#2E9BFF]">run</span>{" "}
              <span className="text-[#febc2e]">openmeteo/weather</span>{" "}
              <span className="text-white/50">--query lat=52.52,lon=13.41</span>
            </div>
            <div className="text-white/30 text-xs">COMPLETED · +$0.001 · 1 result</div>
          </div>
        </article>
      </div>
    </section>
  );
}

function UsageRow({ tool, cost }: { tool: string; cost: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border-2 border-border bg-bg px-3 py-2 text-xs">
      <span className="font-mono text-text-muted">{tool}</span>
      <span className="font-mono text-text-secondary">{cost}</span>
    </div>
  );
}

/* ─── Tools Ticker (dynamic, replaces static icon grid) ───────────────── */

function ToolsTicker() {
  const loop = [...TOOLS, ...TOOLS];
  return (
    <section className="swiss-line border-y-2 border-border py-6 overflow-hidden">
      <div className="marquee-track animate-marquee-x">
        {loop.map((t, i) => {
          const color = TOY_PALETTE[i % TOY_PALETTE.length];
          return (
            <div key={i} className="flex items-center gap-3 px-3">
              <div
                className="toy-chip flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-bold text-white"
                style={{ backgroundColor: color }}
              >
                <ToolIcon slug={t.slug} letter={t.letter} />
              </div>
              <span className="whitespace-nowrap text-sm font-medium text-text-secondary">
                {t.name}
              </span>
              <span className="px-2 text-text-muted">·</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ─── Flow (discover→inspect→run as one wide editorial tile) ──────────── */

function Flow() {
  return (
    <section className="px-5 md:px-10 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-end justify-between gap-6 swiss-line pb-6">
          <h2 className="max-w-xl font-serif text-3xl font-medium leading-tight tracking-tight md:text-5xl">
            Tell your agent what to do. It picks the tools itself.
          </h2>
          <span className="hidden shrink-0 font-mono text-[11px] uppercase tracking-[0.18em] text-text-muted md:block">
            3 calls
          </span>
        </div>

        <div className="mt-2 grid gap-3 md:grid-cols-3">
          {FLOW.map((s) => (
            <div
              key={s.k}
              className="flex flex-col rounded-3xl border-2 border-border bg-bg-elevated p-6 toy-shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-3xl font-bold text-text-muted">{s.k}</span>
                <span className="font-serif text-2xl italic text-accent">{s.t}</span>
              </div>
              <code className="mt-5 block rounded-xl border-2 border-border bg-bg px-4 py-3 font-mono text-xs text-text-secondary">
                {s.c}
              </code>
              <span className="mt-3 text-xs text-text-muted">{s.n}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Connect (compact horizontal strip) ──────────────────────────────── */

function ConnectStrip() {
  return (
    <section className="px-5 md:px-10 pb-20 md:pb-28 swiss-line">
      <div className="mx-auto max-w-6xl pt-16">
        <div className="grid divide-y-2 divide-border overflow-hidden rounded-3xl border-2 border-border bg-bg-elevated toy-shadow md:grid-cols-3 md:divide-y-0 md:divide-x-2">
          {CONNECT.map((m) => (
            <Link
              key={m.t}
              href={m.h}
              className="group flex flex-col gap-3 p-6 transition-colors hover:bg-bg-card-hover"
            >
              <div className="flex items-center justify-between">
                <span className="font-serif text-2xl italic">{m.t}</span>
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-text-muted">
                  {m.s}
                </span>
              </div>
              <code className="block rounded-lg border-2 border-border bg-bg px-3 py-2 font-mono text-xs text-text-secondary">
                {m.c}
              </code>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Final CTA ───────────────────────────────────────────────────────── */

function FinalCTA() {
  return (
    <section className="px-5 md:px-10 pb-24">
      <div className="mx-auto max-w-3xl rounded-3xl border-2 border-border bg-accent p-10 text-center toy-shadow md:p-14">
        <h2 className="font-serif text-3xl font-medium leading-tight tracking-tight text-white md:text-5xl">
          Give your agent the keys.
        </h2>
        <p className="mt-3 text-white/80">One skill. One balance. Every tool. Start free.</p>
        <div className="mx-auto mt-8 flex max-w-lg items-center gap-2 rounded-2xl border-2 border-black/20 bg-white p-1">
          <code className="flex-1 px-4 py-3 text-left font-mono text-xs text-text-secondary">
            <span className="text-text-muted">$</span> set up https://aegntic.ai/SKILL.md
          </code>
          <CopyButton text="set up https://aegntic.ai/SKILL.md" />
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ──────────────────────────────────────────────────────────── */

function Footer() {
  return (
    <footer className="swiss-line px-5 md:px-10 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <Logo height={24} />
            </Link>
            <p className="mt-3 max-w-xs text-sm text-text-muted">
              The agent-native router for tool calls. One skill, one balance, every tool your agent
              needs.
            </p>
          </div>
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
              Product
            </h4>
            <div className="flex flex-col gap-2 text-sm text-text-secondary">
              <Link href="/" className="transition-colors hover:text-text-primary">Home</Link>
              <Link href="/leaderboard" className="transition-colors hover:text-text-primary">Reliability</Link>
              <Link href="/app" className="transition-colors hover:text-text-primary">Console</Link>
              <Link href="https://docs.aegntic.ai" className="transition-colors hover:text-text-primary">Docs</Link>
            </div>
          </div>
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
              Company
            </h4>
            <div className="flex flex-col gap-2 text-sm text-text-secondary">
              <a href="https://x.com/aegntic" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-text-primary">X</a>
              <a href="https://github.com/aegntic" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-text-primary">GitHub</a>
              <a href="mailto:support@aegntic.ai" className="transition-colors hover:text-text-primary">Support</a>
            </div>
          </div>
        </div>
        <div className="mt-10 flex items-center justify-between swiss-line pt-6 text-xs text-text-muted">
          <span>© {new Date().getFullYear()} Aegntic Inc</span>
          <span className="font-mono">v0.1.0</span>
        </div>
      </div>
    </footer>
  );
}
