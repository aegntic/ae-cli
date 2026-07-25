import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Logo } from "@/components/Logo";
import { AEDEX, COMPETITORS, getCompetitor } from "@/lib/comparisons";

export const revalidate = false;

export function generateStaticParams() {
  return COMPETITORS.map((c) => ({ competitor: c.slug }));
}

export function generateMetadata({
  params,
}: {
  params: Promise<{ competitor: string }>;
}): Promise<Metadata> {
  return (async () => {
    const { competitor: slug } = await params;
    const c = getCompetitor(slug);
    if (!c) return { title: "Not found — aedex" };
    const title = `${AEDEX.name} vs ${c.name}: features, pricing & which is better`;
    const description = `An honest comparison of ${AEDEX.name} and ${c.name} — pricing model, reliability routing, per-result billing, agent surfaces, and which to pick.`;
    return {
      title,
      description,
      alternates: { canonical: `https://aedex.ing/compare/${c.slug}` },
      openGraph: {
        title,
        description,
        url: `https://aedex.ing/compare/${c.slug}`,
        siteName: "aedex",
        type: "article",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
      },
    };
  })();
}

export default async function ComparisonPage({
  params,
}: {
  params: Promise<{ competitor: string }>;
}) {
  const { competitor: slug } = await params;
  const c = getCompetitor(slug);
  if (!c) notFound();

  const others = COMPETITORS.filter((x) => x.slug !== c.slug);

  // JSON-LD: BreadcrumbList + FAQPage + Product. Our own data, JSON.stringify
  // is safe (no untrusted input reaches these objects).
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "aedex", item: "https://aedex.ing/" },
        { "@type": "ListItem", position: 2, name: "Compare", item: "https://aedex.ing/compare" },
        { "@type": "ListItem", position: 3, name: c.name, item: `https://aedex.ing/compare/${c.slug}` },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: c.faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: "aedex",
      description:
        "Agent-native tool router. Discover, inspect, and run any data tool with one prepaid balance, billed per result, routed by live reliability.",
      brand: { "@type": "Brand", name: "aedex" },
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD", description: "Free test credit on signup" },
    },
  ];

  return (
    <main className="min-h-screen bg-bg text-text-primary">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="sticky top-0 z-50 swiss-line-b bg-bg/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-tight">
            <Logo height={24} />
          </Link>
          <nav className="flex items-center gap-6 text-sm text-text-secondary">
            <Link href="/compare" className="text-text-primary">
              Compare
            </Link>
            <Link href="/tools" className="transition-colors hover:text-text-primary">
              Tools
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

      <article className="mx-auto max-w-3xl px-6 py-12 md:py-16">
        {/* Breadcrumb */}
        <div className="text-xs font-mono uppercase tracking-[0.2em] text-text-muted mb-4 animate-fade-in-up">
          <Link href="/compare" className="hover:text-accent">
            compare
          </Link>{" "}
          / {c.slug}
        </div>

        <h1 className="text-3xl font-bold leading-tight tracking-tight md:text-4xl lg:text-5xl animate-fade-in-up delay-100">
          {AEDEX.name} vs {c.name}
        </h1>
        <p className="mt-3 text-base text-text-secondary animate-fade-in-up delay-100">
          {c.category} · features, pricing & which is better
        </p>

        <p className="mt-6 text-base leading-relaxed text-text-secondary animate-fade-in-up delay-200">
          {c.intro}
        </p>

        {/* Comparison table */}
        <section className="mt-10 animate-fade-in-up delay-300">
          <h2 className="text-sm font-mono uppercase tracking-[0.18em] text-text-secondary mb-4">
            side by side
          </h2>
          <div className="overflow-hidden rounded-2xl border-2 border-border bg-bg-elevated toy-shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs font-mono uppercase tracking-wider text-text-muted swiss-line-b">
                    <th className="px-4 py-3 font-normal">feature</th>
                    <th className="px-4 py-3 font-normal text-accent">aedex</th>
                    <th className="px-4 py-3 font-normal">{c.name}</th>
                  </tr>
                </thead>
                <tbody>
                  {c.rows.map((r) => (
                    <tr key={r.feature} className="swiss-line-b last:border-0">
                      <td className="px-4 py-3 text-text-muted">{r.feature}</td>
                      <td className="px-4 py-3 font-medium text-text-primary">{r.aedex}</td>
                      <td className="px-4 py-3 text-text-secondary">{r.competitor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Pros / cons */}
        <section className="mt-10 grid gap-4 md:grid-cols-2 animate-fade-in-up delay-400">
          <div className="rounded-2xl border-2 border-border bg-bg-elevated p-5 toy-shadow-sm">
            <h3 className="text-sm font-semibold text-toy-green">Where aedex wins</h3>
            <ul className="mt-3 space-y-2">
              {c.aedexWins.map((w) => (
                <li key={w} className="flex gap-2 text-sm leading-relaxed text-text-secondary">
                  <span className="text-toy-green">✓</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border-2 border-border bg-bg-elevated p-5 toy-shadow-sm">
            <h3 className="text-sm font-semibold text-text-secondary">Where {c.name} is stronger</h3>
            <ul className="mt-3 space-y-2">
              {c.competitorWins.map((w) => (
                <li key={w} className="flex gap-2 text-sm leading-relaxed text-text-secondary">
                  <span className="text-text-muted">·</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Verdict */}
        <section className="mt-10 rounded-2xl border-2 border-border bg-bg-elevated p-6 toy-shadow-sm animate-fade-in-up delay-500">
          <h2 className="text-sm font-mono uppercase tracking-[0.18em] text-text-secondary">verdict</h2>
          <p className="mt-3 text-base leading-relaxed text-text-primary">{c.verdict}</p>
        </section>

        {/* FAQ */}
        <section className="mt-12 animate-fade-in-up delay-500">
          <h2 className="text-sm font-mono uppercase tracking-[0.18em] text-text-secondary mb-4">
            frequently asked
          </h2>
          <div className="space-y-3">
            {c.faqs.map((f) => (
              <details
                key={f.q}
                className="group rounded-2xl border-2 border-border bg-bg-elevated p-5 toy-shadow-sm"
              >
                <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold text-text-primary">
                  {f.q}
                  <span className="text-text-muted transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-text-secondary">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mt-12 rounded-2xl border-2 border-accent bg-bg-elevated p-8 toy-shadow animate-fade-in-up delay-500">
          <h2 className="text-xl font-semibold tracking-tight">Run tools from one balance.</h2>
          <p className="mt-2 text-sm leading-relaxed text-text-muted">
            Sign up for free test credit, or hand your agent the skill and let it discover tools itself.
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

        {/* Other comparisons */}
        <section className="mt-12">
          <h2 className="text-sm font-mono uppercase tracking-[0.18em] text-text-secondary mb-4">
            other comparisons
          </h2>
          <div className="flex flex-wrap gap-2">
            {others.map((o) => (
              <Link
                key={o.slug}
                href={`/compare/${o.slug}`}
                className="rounded-full border-2 border-border bg-bg-elevated px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:border-accent hover:text-accent"
              >
                {AEDEX.name} vs {o.name}
              </Link>
            ))}
          </div>
        </section>
      </article>
    </main>
  );
}
