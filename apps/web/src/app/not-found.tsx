import Link from "next/link";
import { Logo } from "@/components/Logo";

// Dry, on-brand 404. Ties to aedex's honesty voice ("no charge for the lookup")
// and the discover primitive ("0 tools found"). No exclamation marks, no wacky.
export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col bg-bg text-text-primary">
      <header className="swiss-line-b">
        <div className="mx-auto flex max-w-6xl items-center px-5 md:px-10 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Logo height={24} />
          </Link>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-5 md:px-10 py-20">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-text-muted animate-fade-in-up">
          aedex / 404
        </p>
        <h1 className="mt-4 font-serif text-5xl font-medium leading-[0.95] tracking-tight md:text-7xl animate-fade-in-up delay-100">
          This path isn&apos;t <span className="italic text-accent">routed.</span>
        </h1>
        <p className="mt-6 max-w-md text-base leading-relaxed text-text-secondary animate-fade-in-up delay-200">
          No page lives here — and no charge for the lookup. Find what you need below.
        </p>

        <div className="mt-8 animate-fade-in-up delay-300">
          <code className="block overflow-x-auto rounded-xl border-2 border-border bg-bg-elevated px-4 py-3 font-mono text-[13px] text-text-secondary">
            <span className="text-text-muted">$</span> ae discover -q &quot;the page you wanted&quot;
            <span
              aria-hidden
              className="caret-blink ml-2 inline-block h-[12px] w-0 translate-y-[2px] border-l-2 border-accent"
            />
          </code>
          <div className="mt-2 font-mono text-xs text-text-muted">0 tools found · try a different path</div>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-3 animate-fade-in-up delay-400">
          <Link
            href="/"
            className="toy-button bg-accent px-5 py-2.5 text-sm font-bold text-white"
          >
            Back to home →
          </Link>
          <Link
            href="/tools"
            className="rounded-2xl border-2 border-border bg-bg-elevated px-5 py-2.5 text-sm font-semibold text-text-primary transition-colors hover:text-accent"
          >
            Browse tools
          </Link>
        </div>
      </div>
    </main>
  );
}
