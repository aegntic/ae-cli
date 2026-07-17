import Link from "next/link";
import CopyButton from "@/components/CopyButton";

const NAV_LINKS = [
  { label: "Reliability", href: "/leaderboard" },
  { label: "Tools", href: "/tools" },
  { label: "Docs", href: "https://docs.aegntic.ai" },
];

const TOOLS = [
  { name: "X / Twitter", category: "scraping", letter: "X", color: "#1d9bf0" },
  { name: "LinkedIn", category: "scraping", letter: "in", color: "#0a66c2" },
  { name: "Reddit", category: "scraping", letter: "R", color: "#ff4500" },
  { name: "Amazon", category: "scraping", letter: "A", color: "#ff9900" },
  { name: "YouTube", category: "scraping", letter: "Y", color: "#ff0000" },
  { name: "Google", category: "scraping", letter: "G", color: "#4285f4" },
  { name: "TikTok", category: "scraping", letter: "T", color: "#ee1d52" },
  { name: "Instagram", category: "scraping", letter: "I", color: "#e4405f" },
  { name: "Apify", category: "web scraping", letter: "A", color: "#1abc9c" },
  { name: "Browserbase", category: "automation", letter: "B", color: "#f59e0b" },
  { name: "People Data Labs", category: "people search", letter: "P", color: "#6366f1" },
  { name: "OpenWeather", category: "weather", letter: "W", color: "#eb6e4b" },
  { name: "QuickNode", category: "blockchain RPC", letter: "Q", color: "#00c853" },
  { name: "Exa", category: "web search", letter: "E", color: "#8b5cf6" },
  { name: "Heurist", category: "AI tools", letter: "H", color: "#06b6d4" },
  { name: "BlockRun", category: "on-chain data", letter: "B", color: "#f97316" },
  { name: "Wokelo", category: "private markets", letter: "W", color: "#14b8a6" },
  { name: "Saperly", category: "agent phone", letter: "S", color: "#a855f7" },
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
    desc: "One line into your agent\u2019s chat.",
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
    <div className="min-h-screen bg-bg noise-bg relative">
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

function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border-subtle bg-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-accent text-sm font-bold text-white">
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
          <a
            href="https://x.com/aegntic"
            target="_blank"
            rel="noopener"
            className="transition-colors hover:text-text-primary"
            aria-label="X / Twitter"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
        </nav>
        <Link
          href="/app"
          className="rounded-lg bg-text-primary px-4 py-2 text-sm font-medium text-bg transition-opacity hover:opacity-90"
        >
          Get started &rarr;
        </Link>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pt-24 pb-20 md:pt-32 md:pb-28">
      <div className="pointer-events-none absolute inset-0 -top-40 mx-auto h-[600px] w-[800px] rounded-full bg-accent/5 blur-3xl" />
      <div className="relative mx-auto max-w-4xl text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-bg-elevated px-4 py-1.5 text-xs text-text-secondary animate-fade-in-up">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green" />
          </span>
          Live &middot; 1,300+ tools
        </div>

        <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl animate-fade-in-up delay-100">
          <span className="gradient-text">Connect your agent</span>
          <br />
          <span className="text-text-primary">to every tool it needs.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-text-secondary md:text-lg animate-fade-in-up delay-200">
          Discover, inspect, and execute any tool with one balance.
          No subscriptions. No API key sprawl. Just code.
        </p>

        <div className="mt-10 animate-fade-in-up delay-300">
          <div className="mx-auto max-w-xl rounded-xl border border-border bg-bg-elevated p-1 shadow-2xl shadow-accent/5">
            <div className="rounded-lg bg-bg-card p-5">
              <div className="mb-3 flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                <div className="h-3 w-3 rounded-full bg-[#febc2e]" />
                <div className="h-3 w-3 rounded-full bg-[#28c840]" />
                <span className="ml-2 text-xs text-text-muted">aegntic-cli</span>
              </div>
              <div className="code-block space-y-1 text-left">
                <div>
                  <span className="text-text-muted">$</span>{" "}
                  <span className="text-green">aegntic</span>{" "}
                  <span className="text-accent">discover</span>{" "}
                  <span className="text-text-muted">-q</span>{" "}
                  <span className="text-amber">&quot;twitter posts&quot;</span>
                </div>
                <div className="mt-2 text-text-muted">
                  <span className="text-text-secondary">12 tools found</span>
                  <span className="text-text-muted"> &middot; ranked by fit &amp; price</span>
                </div>
                <div className="mt-1 text-text-muted">
                  &nbsp; 1. <span className="text-text-primary">twitter/search</span>
                  <span className="text-text-muted ml-2">$0.001/call</span>
                  <span className="ml-2 text-green">&#x2713;</span>
                </div>
                <div className="text-text-muted">
                  &nbsp; 2. <span className="text-text-primary">twitter/timeline</span>
                  <span className="text-text-muted ml-2">$0.002/call</span>
                  <span className="ml-2 text-green">&#x2713;</span>
                </div>
                <div className="text-text-muted">
                  &nbsp; 3. <span className="text-text-primary">twitter/user-tweets</span>
                  <span className="text-text-muted ml-2">$0.001/call</span>
                  <span className="ml-2 text-green">&#x2713;</span>
                </div>
                <div className="mt-1">
                  <span className="text-text-muted">$</span>{" "}
                  <span className="text-green">aegntic</span>{" "}
                  <span className="text-accent">run</span>{" "}
                  <span className="text-amber">&quot;twitter/search&quot;</span>{" "}
                  <span className="text-text-muted">--param q=&quot;AI agents&quot;</span>
                  <span className="inline-block h-4 w-2 animate-pulse bg-accent align-middle" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-8 text-sm text-text-muted animate-fade-in-up delay-400">
          Give this to your agent &mdash;{" "}
          <code className="rounded border border-border bg-bg-card px-2 py-0.5 font-mono text-xs text-text-secondary">
            $ set up https://aegntic.ai/SKILL.md
          </code>{" "}
          &mdash; and let it take it from there.
        </p>
      </div>
    </section>
  );
}

function ToolGrid() {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {TOOLS.map((tool, i) => (
            <div
              key={tool.name}
              className="group relative flex flex-col items-center gap-3 rounded-xl border border-border-subtle bg-bg-card p-5 transition-all duration-200 hover:border-border hover:bg-bg-card-hover"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div
                className="flex h-11 w-11 items-center justify-center rounded-xl text-sm font-bold text-white transition-transform duration-200 group-hover:scale-110"
                style={{ backgroundColor: tool.color }}
              >
                {tool.letter}
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-text-primary">{tool.name}</div>
                <div className="mt-0.5 text-xs text-text-muted">{tool.category}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            href="/tools"
            className="inline-flex items-center gap-2 text-sm text-accent transition-colors hover:text-accent-dim"
          >
            See all 1,300+ tools
            <span>&rarr;</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="px-6 py-20 md:py-28">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-3xl font-bold tracking-tight md:text-4xl">
          <span className="gradient-text">Tell your agent what to do.</span>
          <br />
          <span className="text-text-secondary text-xl font-normal md:text-2xl">
            It picks the tools itself.
          </span>
        </h2>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <div key={step.num} className="relative">
              <div className="rounded-xl border border-border bg-bg-card p-6 transition-colors hover:border-accent/30">
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 font-mono text-xs font-semibold text-accent">
                    {step.num}
                  </span>
                  <h3 className="text-lg font-semibold">{step.title}</h3>
                </div>
                <div className="rounded-lg bg-bg p-4">
                  <code className="code-block text-text-secondary">{step.code}</code>
                </div>
                <p className="mt-3 text-sm text-text-muted">{step.desc}</p>
              </div>
              {i < STEPS.length - 1 && (
                <div className="absolute top-1/2 -right-3 hidden h-px w-6 bg-border md:block" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function OneBalance() {
  return (
    <section className="px-6 py-20 md:py-28">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-2xl border border-border bg-bg-elevated p-8 md:p-14">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                We killed the
                <br />
                <span className="gradient-accent bg-clip-text text-transparent">subscriptions.</span>
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
            <div className="rounded-xl border border-border bg-bg-card p-6">
              <div className="mb-4 flex items-center gap-3 text-sm text-text-muted">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
                  <svg viewBox="0 0 20 20" className="h-4 w-4 fill-accent">
                    <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z" />
                  </svg>
                </div>
                <span className="font-mono text-xs">~/agents/research-bot</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg bg-bg p-3">
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
    <div className="flex items-center justify-between rounded-lg border border-border-subtle bg-bg-elevated px-3 py-2 text-xs">
      <span className="font-mono text-text-muted">{tool}</span>
      <span className="text-text-muted">{cost}</span>
    </div>
  );
}

function ConnectMethods() {
  return (
    <section className="px-6 py-20 md:py-28">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
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
              className="group relative rounded-xl border border-border bg-bg-card p-6 transition-all duration-200 hover:border-accent/40 hover:bg-bg-card-hover"
            >
              <div className="mb-1 text-xs font-medium uppercase tracking-wider text-accent">
                {method.subtitle}
              </div>
              <h3 className="mt-1 text-xl font-semibold">{method.title}</h3>
              <p className="mt-2 text-sm text-text-muted">{method.desc}</p>
              <div className="mt-5 rounded-lg bg-bg p-3">
                <code className="code-block whitespace-pre text-xs text-text-secondary">
                  {method.code}
                </code>
              </div>
              <div className="mt-4 flex items-center gap-1 text-sm text-accent opacity-0 transition-opacity group-hover:opacity-100">
                Learn more <span>&rarr;</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="px-6 py-20 md:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
          Let your agent find the tools for you.
        </h2>
        <p className="mt-3 text-text-secondary">Start with $1 in free credit.</p>
        <div className="mx-auto mt-8 max-w-lg rounded-xl border border-border bg-bg-elevated p-1">
          <div className="flex items-center gap-2 rounded-lg bg-bg-card px-4 py-3">
            <code className="code-block flex-1 text-left text-text-secondary">
              <span className="text-text-muted">$</span>{" "}
              <span className="text-green">set up</span>{" "}
              <span className="text-accent">https://aegntic.ai/skill.md</span>
            </code>
            <CopyButton text="set up https://aegntic.ai/skill.md" />
          </div>
        </div>
        <div className="mt-8">
          <Link
            href="/app"
            className="inline-flex items-center gap-2 rounded-xl gradient-accent px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-accent/20 transition-all hover:shadow-xl hover:shadow-accent/30"
          >
            Get started
            <span>&rarr;</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border-subtle px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
              <div className="flex h-7 w-7 items-center justify-center rounded-md gradient-accent text-xs font-bold text-white">
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
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
              Product
            </h4>
            <div className="flex flex-col gap-2 text-sm text-text-secondary">
              <Link href="/" className="transition-colors hover:text-text-primary">
                Home
              </Link>
              <Link href="/leaderboard" className="transition-colors hover:text-text-primary">
                Reliability
              </Link>
              <Link href="/tools" className="transition-colors hover:text-text-primary">
                Tools
              </Link>
              <Link
                href="https://docs.aegntic.ai"
                className="transition-colors hover:text-text-primary"
              >
                Docs
              </Link>
              <Link
                href="/app"
                className="transition-colors hover:text-text-primary"
              >
                Get started
              </Link>
            </div>
          </div>
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
              Company
            </h4>
            <div className="flex flex-col gap-2 text-sm text-text-secondary">
              <a
                href="https://x.com/aegntic"
                target="_blank"
                rel="noopener"
                className="transition-colors hover:text-text-primary"
              >
                X
              </a>
              <a
                href="https://github.com/aegntic"
                target="_blank"
                rel="noopener"
                className="transition-colors hover:text-text-primary"
              >
                GitHub
              </a>
              <a
                href="mailto:support@aegntic.ai"
                className="transition-colors hover:text-text-primary"
              >
                Support
              </a>
            </div>
          </div>
        </div>
        <div className="mt-10 flex items-center justify-between border-t border-border-subtle pt-6 text-xs text-text-muted">
          <span>&copy; {new Date().getFullYear()} Aegntic Inc</span>
          <span>v0.1.0</span>
        </div>
      </div>
    </footer>
  );
}
