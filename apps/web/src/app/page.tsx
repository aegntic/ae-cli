import Link from "next/link";
import CopyButton from "@/components/CopyButton";

/* ──────────────────────────────────────────────────────────────────────────
 * aegntic / landing page — pixar-ios-toy reskin (blumenkopf DNA)
 *
 * • ZERO gradients — all color is solid, all highlight is solid rgba
 * • 3D plastic chips via `.toy-chip` (solid color + white overlay + shadow)
 * • Swiss-line 3px black dividers between sections
 * • Orange marquee ticker at CTA
 * • Mask-reveal wordmark
 * ────────────────────────────────────────────────────────────────────────── */

const NAV_LINKS = [
  { label: "Reliability", href: "/leaderboard" },
  { label: "Docs", href: "https://docs.aegntic.ai" },
  { label: "Console", href: "/app" },
];

// Pixar-toy solid palette — rotated across tools, NO gradients ever
const TOY_PALETTE = [
  "#E63946", // red
  "#4361EE", // blue
  "#F4D35E", // yellow
  "#06A77D", // green
  "#9D4EDD", // lavender
  "#E67E22", // orange
] as const;

const TOOLS = [
  { name: "X / Twitter", category: "scraping", letter: "X" },
  { name: "LinkedIn", category: "scraping", letter: "in" },
  { name: "Reddit", category: "scraping", letter: "R" },
  { name: "Amazon", category: "scraping", letter: "A" },
  { name: "YouTube", category: "scraping", letter: "Y" },
  { name: "Google", category: "scraping", letter: "G" },
  { name: "TikTok", category: "scraping", letter: "T" },
  { name: "Instagram", category: "scraping", letter: "I" },
  { name: "Apify", category: "web scraping", letter: "A" },
  { name: "Browserbase", category: "automation", letter: "B" },
  { name: "People Data Labs", category: "people search", letter: "P" },
  { name: "OpenWeather", category: "weather", letter: "W" },
  { name: "QuickNode", category: "blockchain RPC", letter: "Q" },
  { name: "Exa", category: "web search", letter: "E" },
  { name: "Heurist", category: "AI tools", letter: "H" },
  { name: "BlockRun", category: "on-chain data", letter: "B" },
  { name: "Wokelo", category: "private markets", letter: "W" },
  { name: "Saperly", category: "agent phone", letter: "S" },
];

const STEPS = [
  {
    num: "01",
    title: "Discover",
    code: 'aegntic.discover({ q: "twitter posts" })',
    desc: "12 candidates, ranked by fit and price",
  },
  {
    num: "02",
    title: "Inspect",
    code: "aegntic.inspect(tool)",
    desc: "Full schema, pricing, and reliability score",
  },
  {
    num: "03",
    title: "Run",
    code: 'aegntic.run("twitter.search", params)',
    desc: "Execute instantly. Pay per call. No sign-ups.",
  },
];

const CONNECT_METHODS = [
  {
    title: "Skill",
    subtitle: "For agents",
    desc: "One line into your agent's chat.",
    code: "$ set up https://aegntic.ai/SKILL.md",
    link: "https://docs.aegntic.ai/guide/quickstart-skill",
  },
  {
    title: "MCP",
    subtitle: "For Claude & Cursor",
    desc: "Add the remote MCP server.",
    code: 'mcp: { "aegntic": { url: "https://mcp.aegntic.ai" } }',
    link: "https://docs.aegntic.ai/guide/quickstart-mcp",
  },
  {
    title: "CLI",
    subtitle: "For humans",
    desc: "Install and run from your terminal.",
    code: "npm i -g @aegntic-ai/cli\naegntic discover -q \"amazon prices\"",
    link: "https://docs.aegntic.ai/guide/quickstart-cli",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-bg relative">
      <Nav />
      <main className="relative z-10">
        <Hero />
        <ToolGrid />
        <HowItWorks />
        <OneBalance />
        <ConnectMethods />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}

/* ─── Nav ─────────────────────────────────────────────────────────────── */

function Nav() {
  return (
    <header className="sticky top-0 z-50 swiss-line-b bg-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 md:px-10 py-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <div className="toy-chip flex h-9 w-9 items-center justify-center bg-black text-sm font-bold text-white">
            Ae
          </div>
          <span>aegntic</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-text-secondary md:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="transition-colors hover:text-text-primary"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/app"
          className="toy-button bg-black px-4 py-2 text-sm font-semibold text-white"
        >
          Get started →
        </Link>
      </div>
    </header>
  );
}

/* ─── Hero ────────────────────────────────────────────────────────────── */

function Hero() {
  return (
    <section className="relative overflow-hidden px-5 md:px-10 pt-24 pb-16 md:pt-32 md:pb-24">
      <div className="max-w-4xl mx-auto text-center">

        {/* Live badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border-2 border-black bg-white px-4 py-1.5 text-xs text-text-secondary animate-fade-in-up toy-shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-toy-green opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-toy-green" />
          </span>
          Live · 1,300+ tools
        </div>

        {/* Oversized wordmark (blumenkopf style) */}
        <div className="mt-8 overflow-hidden animate-fade-in-up delay-100">
          <h1 className="font-sans font-semibold tracking-tightest lowercase leading-[0.82] text-[clamp(3rem,14vw,9rem)]">
            aegntic
          </h1>
        </div>

        {/* Tagline + scroll cue (Swiss-line top) */}
        <div className="mt-8 flex items-end justify-between gap-6 swiss-line pt-6 animate-fade-in-up delay-200">
          <p className="text-left font-sans text-base md:text-lg font-light max-w-md">
            Connect your agent to every tool it needs.
            <br />
            <span className="text-text-secondary">
              No subscriptions. No API key sprawl. Just code.
            </span>
          </p>
          <p className="text-[10px] uppercase tracking-[0.18em] text-text-muted shrink-0">
            ( scroll )
          </p>
        </div>

        {/* Code preview window */}
        <div className="mt-12 animate-fade-in-up delay-300">
          <div className="mx-auto max-w-xl rounded-2xl border-2 border-black bg-white toy-shadow">
            <div className="rounded-t-2xl border-b-2 border-black px-5 py-3 flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-toy-red" />
              <div className="h-3 w-3 rounded-full bg-toy-yellow" />
              <div className="h-3 w-3 rounded-full bg-toy-green" />
              <span className="ml-2 text-xs text-text-muted font-mono">aegntic-cli</span>
            </div>
            <div className="px-5 py-5 text-left space-y-1.5">
              <div>
                <span className="text-text-muted">$</span>{" "}
                <span className="text-toy-green font-semibold">aegntic</span>{" "}
                <span className="text-accent font-semibold">discover</span>{" "}
                <span className="text-text-muted">-q</span>{" "}
                <span className="text-toy-yellow font-semibold">&quot;twitter posts&quot;</span>
              </div>
              <div className="text-text-muted text-xs mt-1">
                12 tools found · ranked by fit &amp; price
              </div>
              <div className="text-xs text-text-secondary">
                &nbsp; 1. <span className="text-text-primary font-medium">twitter/search</span>
                <span className="text-text-muted ml-2">$0.001/call</span>
                <span className="ml-2 text-toy-green">✓</span>
              </div>
              <div className="text-xs text-text-secondary">
                &nbsp; 2. <span className="text-text-primary font-medium">twitter/timeline</span>
                <span className="text-text-muted ml-2">$0.002/call</span>
                <span className="ml-2 text-toy-green">✓</span>
              </div>
              <div className="text-xs text-text-secondary">
                &nbsp; 3. <span className="text-text-primary font-medium">twitter/user-tweets</span>
                <span className="text-text-muted ml-2">$0.001/call</span>
                <span className="ml-2 text-toy-green">✓</span>
              </div>
              <div className="mt-2">
                <span className="text-text-muted">$</span>{" "}
                <span className="text-toy-green font-semibold">aegntic</span>{" "}
                <span className="text-accent font-semibold">run</span>{" "}
                <span className="text-toy-yellow font-semibold">&quot;twitter/search&quot;</span>{" "}
                <span className="text-text-muted">--param q=&quot;AI agents&quot;</span>
                <span className="inline-block h-4 w-2 animate-pulse bg-accent align-middle ml-1" />
              </div>
            </div>
          </div>
        </div>

        {/* Skill link */}
        <p className="mt-8 text-sm text-text-muted animate-fade-in-up delay-400">
          Give this to your agent —{" "}
          <code className="rounded border-2 border-black bg-white px-2 py-0.5 font-mono text-xs text-text-secondary">
            $ set up https://aegntic.ai/SKILL.md
          </code>{" "}
          — and let it take it from there.
        </p>
      </div>
    </section>
  );
}

/* ─── Tool Grid ───────────────────────────────────────────────────────── */

function ToolGrid() {
  return (
    <section className="px-5 md:px-10 py-16 swiss-line">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {TOOLS.map((tool, i) => {
            const color = TOY_PALETTE[i % TOY_PALETTE.length];
            return (
              <div
                key={tool.name}
                className="group relative flex flex-col items-center gap-3 rounded-2xl border-2 border-black bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 toy-shadow-sm hover:toy-shadow"
              >
                {/* 3D plastic chip */}
                <div
                  className="toy-chip flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-bold text-white transition-transform duration-200 group-hover:scale-105"
                  style={{ backgroundColor: color }}
                >
                  {tool.letter}
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-text-primary">{tool.name}</div>
                  <div className="mt-0.5 text-xs text-text-muted">{tool.category}</div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-10 text-center">
          <Link
            href="/leaderboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-accent transition-colors hover:text-accent-dim"
          >
            See all 1,300+ tools <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─── How It Works ────────────────────────────────────────────────────── */

function HowItWorks() {
  return (
    <section className="px-5 md:px-10 py-20 md:py-28 swiss-line">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-3xl font-semibold tracking-tight md:text-4xl">
          Tell your agent what to do.
        </h2>
        <p className="mt-3 text-center text-xl font-light text-text-secondary">
          It picks the tools itself.
        </p>

        <div className="mt-16 grid gap-5 md:grid-cols-3">
          {STEPS.map((step) => (
            <div
              key={step.num}
              className="relative rounded-2xl border-2 border-black bg-white p-6 toy-shadow-sm"
            >
              <div className="mb-4 flex items-center gap-3">
                <span className="toy-chip flex h-10 w-10 items-center justify-center rounded-2xl bg-toy-yellow text-sm font-bold text-black">
                  {step.num}
                </span>
                <h3 className="text-lg font-semibold">{step.title}</h3>
              </div>
              <div className="rounded-xl border-2 border-black bg-bg p-4">
                <code className="code-block text-text-secondary">{step.code}</code>
              </div>
              <p className="mt-3 text-sm text-text-muted">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── One Balance ─────────────────────────────────────────────────────── */

function OneBalance() {
  return (
    <section className="px-5 md:px-10 py-20 md:py-28 swiss-line">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-2xl border-2 border-black bg-white p-8 md:p-14 toy-shadow-lg">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
                We killed the
                <br />
                <span className="text-accent">subscriptions.</span>
              </h2>
              <p className="mt-4 text-base leading-relaxed text-text-secondary md:text-lg">
                Your agent has <span className="text-text-primary font-medium">one balance</span> to
                use all the tools. Pay only for the calls your agent makes.
              </p>
              <div className="mt-8 grid grid-cols-3 gap-6">
                <Stat value="1,300+" label="Tools" />
                <Stat value="13+" label="Providers" />
                <Stat value="1" label="Balance" />
              </div>
            </div>
            <div className="rounded-2xl border-2 border-black bg-bg p-6">
              <div className="mb-4 flex items-center gap-3 text-sm text-text-muted">
                <div className="toy-chip flex h-8 w-8 items-center justify-center rounded-xl bg-accent">
                  <svg viewBox="0 0 20 20" className="h-4 w-4 fill-white">
                    <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z" />
                  </svg>
                </div>
                <span className="font-mono text-xs">~/agents/research-bot</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-xl border-2 border-black bg-white p-3">
                  <span className="text-sm text-text-secondary">Balance</span>
                  <span className="font-mono text-lg font-semibold text-text-primary">$3.00</span>
                </div>
                <div className="space-y-2">
                  <UsageRow tool="twitter/search" cost="$0.001" />
                  <UsageRow tool="reddit/frontpage" cost="$0.002" />
                  <UsageRow tool="pdl/person" cost="$0.010" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-2xl font-bold text-text-primary">{value}</div>
      <div className="mt-1 text-sm text-text-muted">{label}</div>
    </div>
  );
}

function UsageRow({ tool, cost }: { tool: string; cost: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border-2 border-black bg-white px-3 py-2 text-xs">
      <span className="font-mono text-text-muted">{tool}</span>
      <span className="text-text-muted">{cost}</span>
    </div>
  );
}

/* ─── Connect Methods ─────────────────────────────────────────────────── */

function ConnectMethods() {
  return (
    <section className="px-5 md:px-10 py-20 md:py-28 swiss-line">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Three ways to connect.
          </h2>
          <p className="mt-3 text-text-secondary">
            Same registry, same balance, whichever your agent speaks.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {CONNECT_METHODS.map((method) => (
            <Link
              key={method.title}
              href={method.link}
              className="group relative rounded-2xl border-2 border-black bg-white p-6 transition-all duration-200 hover:-translate-y-0.5 toy-shadow-sm hover:toy-shadow"
            >
              <div className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                {method.subtitle}
              </div>
              <h3 className="mt-1 text-xl font-semibold">{method.title}</h3>
              <p className="mt-2 text-sm text-text-muted">{method.desc}</p>
              <div className="mt-5 rounded-xl border-2 border-black bg-bg p-3">
                <code className="code-block whitespace-pre text-xs text-text-secondary">
                  {method.code}
                </code>
              </div>
              <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-accent opacity-0 transition-opacity group-hover:opacity-100">
                Learn more <span>→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Final CTA + Orange Marquee ──────────────────────────────────────── */

function FinalCTA() {
  const marqueeText = "ONE BALANCE · EVERY TOOL · YOUR AGENT · NO SUBSCRIPTIONS · ";
  const marqueeTextDoubled = marqueeText + marqueeText;

  return (
    <section className="px-5 md:px-10 py-20 md:py-28">
      <div className="mx-auto max-w-2xl text-center">

        {/* Orange marquee ticker (blumenkopf DNA) */}
        <div className="mb-12 overflow-hidden rounded-xl bg-accent py-3 toy-shadow-sm">
          <div className="marquee-track animate-marquee-x">
            <span className="px-2 text-sm font-bold tracking-wider uppercase text-white">
              {marqueeTextDoubled}
            </span>
          </div>
        </div>

        <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
          Let your agent find the tools for you.
        </h2>
        <p className="mt-3 text-text-secondary">Start with $1 in free credit.</p>

        {/* Copy command */}
        <div className="mx-auto mt-8 max-w-lg rounded-2xl border-2 border-black bg-white p-1 toy-shadow-sm">
          <div className="flex items-center gap-2 rounded-xl bg-bg px-4 py-3">
            <code className="code-block flex-1 text-left text-text-secondary">
              <span className="text-text-muted">$</span>{" "}
              <span className="text-toy-green font-semibold">set up</span>{" "}
              <span className="text-accent font-semibold">https://aegntic.ai/skill.md</span>
            </code>
            <CopyButton text="set up https://aegntic.ai/skill.md" />
          </div>
        </div>

        {/* Chunky toy CTA button */}
        <div className="mt-8">
          <Link
            href="/app"
            className="toy-button inline-flex items-center gap-2 bg-black px-8 py-4 text-sm font-bold text-white"
          >
            Get started <span>→</span>
          </Link>
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
            <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
              <div className="toy-chip flex h-8 w-8 items-center justify-center rounded-xl bg-black text-xs font-bold text-white">
                Ae
              </div>
              <span>aegntic</span>
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
              <a href="https://x.com/aegntic" target="_blank" rel="noopener" className="transition-colors hover:text-text-primary">X</a>
              <a href="https://github.com/aegntic" target="_blank" rel="noopener" className="transition-colors hover:text-text-primary">GitHub</a>
              <a href="mailto:support@aegntic.ai" className="transition-colors hover:text-text-primary">Support</a>
            </div>
          </div>
        </div>
        <div className="mt-10 swiss-line pt-6 flex items-center justify-between text-xs text-text-muted">
          <span>© {new Date().getFullYear()} Aegntic Inc</span>
          <span className="font-mono">v0.1.0</span>
        </div>
      </div>
    </footer>
  );
}
