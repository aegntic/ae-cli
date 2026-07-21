import type { Metadata } from "next";
import Link from "next/link";
import CopyButton from "@/components/CopyButton";
import { Logo } from "@/components/Logo";

export const metadata: Metadata = {
  title: "get started — aedex",
  description:
    "Install the aedex CLI, mint a workspace API key, and run your first tool in under a minute.",
};

const STEPS = [
  {
    k: "01",
    t: "install",
    sub: "one global install",
    cmds: [{ label: "install", code: "bun add -g ae" }],
    note: "Bun 1.0+. Works in any shell.",
  },
  {
    k: "02",
    t: "get a key",
    sub: "workspace + API key",
    cmds: [
      { label: "write config", code: "ae setup" },
      { label: "mint a key", code: "ae keys add --label web" },
    ],
    note: "Prints a key like aedex_live_… — copy it. This is the only secret you need.",
  },
  {
    k: "03",
    t: "run it",
    sub: "first tool, billed per result",
    cmds: [{ label: "discover + run", code: 'ae discover -q "weather"' }],
    note: "Then ae run openmeteo/weather/current --query … Pays from one prepaid balance.",
  },
];

export default function StartPage() {
  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-50 swiss-line-b bg-bg/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 md:px-10 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Logo height={26} />
          </Link>
          <Link href="/app" className="text-sm font-semibold text-text-secondary transition-colors hover:text-text-primary">
            I have a key →
          </Link>
        </div>
      </header>

      <main className="px-5 md:px-10 pt-12 pb-24">
        <div className="mx-auto max-w-3xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-muted">
            get started
          </p>
          <h1 className="mt-3 font-serif text-4xl font-medium leading-[1.02] tracking-tight md:text-6xl">
            Running in <span className="italic text-accent">sixty seconds.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-text-secondary">
            Install the CLI, mint a workspace key, run your first tool. No account, no
            dashboard signup — just a terminal and one prepaid balance.
          </p>

          <ol className="mt-12 space-y-3">
            {STEPS.map((s) => (
              <li
                key={s.k}
                className="rounded-3xl border-2 border-border bg-bg-elevated p-6 toy-shadow-sm md:p-8"
              >
                <div className="flex items-baseline justify-between gap-4 swiss-line-b pb-4">
                  <div className="flex items-baseline gap-4">
                    <span className="font-mono text-3xl font-bold text-text-muted">{s.k}</span>
                    <h2 className="font-serif text-2xl italic text-accent md:text-3xl">{s.t}</h2>
                  </div>
                  <span className="hidden font-mono text-[11px] uppercase tracking-[0.16em] text-text-muted sm:block">
                    {s.sub}
                  </span>
                </div>

                <div className="mt-5 space-y-2.5">
                  {s.cmds.map((c) => (
                    <div
                      key={c.label}
                      className="flex items-center gap-2 rounded-2xl border-2 border-border bg-bg p-1"
                    >
                      <code className="flex-1 px-4 py-2.5 font-mono text-[13px] text-text-secondary">
                        <span className="text-text-muted">$</span> {c.code}
                      </code>
                      <CopyButton text={c.code} />
                    </div>
                  ))}
                </div>

                <p className="mt-4 text-sm leading-relaxed text-text-muted">{s.note}</p>
              </li>
            ))}
          </ol>

          <div className="mt-10 flex flex-wrap items-center gap-4 rounded-3xl border-2 border-border bg-accent p-6 toy-shadow md:p-8">
            <div className="flex-1">
              <h3 className="font-serif text-2xl text-white">Got your key?</h3>
              <p className="mt-1 text-sm text-white/80">Open the console and paste it.</p>
            </div>
            <Link
              href="/app"
              className="toy-button inline-flex items-center gap-2 bg-white px-6 py-3 text-sm font-bold text-text-primary"
            >
              Open console →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
