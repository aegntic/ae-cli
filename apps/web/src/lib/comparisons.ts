/**
 * Competitor comparison data for /compare and /compare/[slug].
 *
 * Editorial rules (inherits aedex positioning-2026 + constitution):
 *  - Honest and specific. Favor aedex where it genuinely wins (per-result
 *    metering, reliability-weighted routing, one balance, signed ledger) and
 *    concede where a competitor is stronger. Never invent fake weaknesses.
 *  - Cite aedex's real posture, not invented benchmark numbers for competitors.
 *  - Keep competitor claims qualitative + widely-known; do not fabricate their
 *    pricing or feature specifics beyond what is broadly public.
 */

export type ComparisonRow = {
  feature: string;
  aedex: string;
  competitor: string;
};

export type Faq = { q: string; a: string };

export type Competitor = {
  slug: string;
  name: string;
  category: string;
  tagline: string;
  url: string;
  /** One-line hub blurb. */
  blurb: string;
  /** Page intro paragraph(s). */
  intro: string;
  rows: ComparisonRow[];
  aedexWins: string[];
  competitorWins: string[];
  verdict: string;
  faqs: Faq[];
};

export const AEDEX = {
  name: "aedex",
  tagline: "Agent-native tool router — one balance, billed per result.",
};

export const COMPETITORS: Competitor[] = [
  {
    slug: "monid",
    name: "Monid",
    category: "agent tool router",
    tagline: "Connect your agent to every tool it needs.",
    url: "https://monid.ai/",
    blurb:
      "The closest direct analog — pay-per-call tool router with an agent skill, MCP, and CLI. aedex differs on metering model and routing.",
    intro:
      "Monid and aedex solve the same problem from the same angle: one integration that lets an agent discover, compare, and run many external tools against a single balance. They are the closest peers in the category, so this is the most direct comparison. The differences are in how calls are billed, how tools are chosen, and how spend is recorded.",
    rows: [
      { feature: "Core model", aedex: "Agent-native tool router", competitor: "Agent-native tool router" },
      { feature: "Pricing", aedex: "Billed per result", competitor: "Billed per call" },
      { feature: "Failed runs", aedex: "Free — you pay for results", competitor: "Charged per call attempt" },
      { feature: "Tool selection", aedex: "Reliability-weighted routing", competitor: "Discover + compare by fit/price" },
      { feature: "One balance", aedex: "Yes, across providers", competitor: "Yes, across providers" },
      { feature: "CLI", aedex: "Yes (ae)", competitor: "Yes (monid)" },
      { feature: "MCP server", aedex: "Yes", competitor: "Yes" },
      { feature: "Agent skill", aedex: "Yes (aedex.md)", competitor: "Yes (SKILL.md)" },
      { feature: "Spend audit", aedex: "Signed append-only ledger", competitor: "Balance metering" },
    ],
    aedexWins: [
      "Per-result billing means failed or empty runs don't cost the operator — value-aligned for flaky data tools.",
      "Reliability-weighted routing routes to tools that actually work, not just the cheapest listed.",
      "A signed, append-only ledger gives agent spend a tamper-evident system of record.",
    ],
    competitorWins: [
      "Larger marketed tool count and broader provider list today.",
      "Mature hosted console (app.monid.ai) and polished Mintlify docs.",
    ],
    verdict:
      "If you want the largest possible tool list right now, Monid is further along on breadth. If you care about honest metering (pay for results, not attempts), routing to tools that work, and auditable agent spend, aedex is the stronger foundation.",
    faqs: [
      {
        q: "Is aedex a good Monid alternative?",
        a: "Yes, for operators who want per-result billing instead of per-call, reliability-weighted routing, and a signed ledger for agent spend. Both expose the same agent surfaces — skill, MCP, and CLI — with one balance across providers.",
      },
      {
        q: "Monid vs aedex: which is better?",
        a: "They are near-identical in shape. aedex wins on metering (per result, failed runs free), routing (reliability-weighted), and audit (append-only ledger). Monid currently markets a larger tool catalog. Pick aedex for billing honesty and routing quality; Monid for raw breadth today.",
      },
      {
        q: "Does aedex support the same agent integrations as Monid?",
        a: "Yes. aedex ships an agent skill (aedex.ing/aedex.md), an MCP server, and a CLI — the same three connection paths, so agents that work with Monid's surfaces can move over.",
      },
    ],
  },
  {
    slug: "firecrawl",
    name: "Firecrawl",
    category: "web scraping / extraction",
    tagline: "Turn websites into LLM-ready markdown.",
    url: "https://www.firecrawl.dev/",
    blurb:
      "Excellent at one thing — scraping sites into clean markdown for LLMs. aedex routes to scraping among many other tool categories from one balance.",
    intro:
      "Firecrawl is a focused, high-quality scraping-and-extraction API. It is the right pick if scraping a site into LLM-ready markdown is the whole job. aedex is broader: it routes to scraping tools alongside weather, finance, search, people data, and more from a single balance and a single agent surface.",
    rows: [
      { feature: "Core model", aedex: "Multi-category tool router", competitor: "Scraping + extraction API" },
      { feature: "Scope", aedex: "Many tool categories", competitor: "Web scraping focus" },
      { feature: "Pricing", aedex: "Per result", competitor: "Credit/subscription based" },
      { feature: "One balance", aedex: "Across all categories", competitor: "Scraping credits" },
      { feature: "Agent surfaces", aedex: "Skill · MCP · CLI", competitor: "API · SDK · MCP" },
      { feature: "Reliability routing", aedex: "Yes", competitor: "Single pipeline" },
    ],
    aedexWins: [
      "One balance and one integration across scraping plus weather, finance, search, and people data — no second vendor.",
      "Reliability-weighted routing can pick between scraping providers by live success rate.",
      "Per-result billing across every category, not scraping-only credits.",
    ],
    competitorWins: [
      "Deeper, purpose-built scraping pipeline with polished markdown/extract output.",
      "Mature SDKs and larger scraping-specific community.",
    ],
    verdict:
      "Use Firecrawl when scraping is the entire job and you want best-in-class extraction. Use aedex when your agent needs scraping as one of several data sources behind one balance and one meter.",
    faqs: [
      {
        q: "Is aedex a good Firecrawl alternative?",
        a: "If you need scraping plus other data tools behind one balance, yes. aedex routes to scraping providers alongside other categories and bills per result. If scraping into markdown is your only need, Firecrawl is more specialized.",
      },
      {
        q: "Does aedex do web scraping?",
        a: "Yes — scraping is one routed category (e.g. via Apify/Browserbase-style providers) discoverable through the same skill, MCP, and CLI as every other tool. Reliability routing can choose the best-performing scraper per call.",
      },
      {
        q: "Firecrawl vs aedex pricing?",
        a: "Firecrawl uses credit/subscription credits scoped to scraping. aedex bills per result across all tool categories from one prepaid balance, and failed runs are free.",
      },
    ],
  },
  {
    slug: "bright-data",
    name: "Bright Data",
    category: "enterprise web data / proxies",
    tagline: "Enterprise-scale web data platform.",
    url: "https://brightdata.com/",
    blurb:
      "Massive enterprise scraping + proxy infrastructure sold to humans via contract. aedex is agent-native metering across many categories, not a scraping datacenter.",
    intro:
      "Bright Data is an enterprise web-data and proxy platform built for human procurement at scale. It is far larger as a scraping operation. aedex is not competing on raw scraping scale — it is an agent-native router that meters many tool categories per result and routes by reliability, suited to agents rather than enterprise scraping contracts.",
    rows: [
      { feature: "Core model", aedex: "Agent-native tool router", competitor: "Enterprise scraping + proxies" },
      { feature: "Buyer", aedex: "Agents + operators", competitor: "Enterprise, human-procured" },
      { feature: "Scope", aedex: "Many categories", competitor: "Web data at massive scale" },
      { feature: "Pricing", aedex: "Per result, prepaid", competitor: "Usage tiers / contract" },
      { feature: "Agent surfaces", aedex: "Skill · MCP · CLI", competitor: "API / SDK / IDE" },
      { feature: "Spend audit", aedex: "Signed ledger", competitor: "Account dashboards" },
    ],
    aedexWins: [
      "Built for agents first — one skill/MCP/CLI and one balance, no enterprise procurement.",
      "Per-result metering and a signed ledger map cleanly to agent-spend auditing.",
      "Routes across categories beyond scraping.",
    ],
    competitorWins: [
      "Vastly larger proxy and scraping infrastructure and dataset catalog.",
      "Enterprise compliance, support, and data products at scale.",
    ],
    verdict:
      "If you are an enterprise buying web data at scale, Bright Data is the incumbent. If you are wiring agents to many data tools and want honest per-result metering with one balance, aedex fits where Bright Data's contract model does not.",
    faqs: [
      {
        q: "Is aedex a good Bright Data alternative?",
        a: "Only for agent-native, multi-category data access with per-result metering. aedex is not a proxy/scraping datacenter and does not replace Bright Data's enterprise scale. It complements agent stacks that need many tool types behind one balance.",
      },
      {
        q: "Bright Data vs aedex for agents?",
        a: "Bright Data targets enterprise web-data procurement by humans. aedex targets agents: one skill/MCP/CLI, one prepaid balance, per-result billing, and reliability routing across categories.",
      },
    ],
  },
  {
    slug: "scraperapi",
    name: "ScraperAPI",
    category: "proxy scraping SaaS",
    tagline: "Proxy-based scraping API.",
    url: "https://www.scraperapi.com/",
    blurb:
      "Simple pay-per-scrape proxy API. aedex adds routing + per-result billing across many categories, not just scraping.",
    intro:
      "ScraperAPI is a straightforward scraping API over a proxy network, billed per scrape. aedex is broader and billed per result: it can route to scraping alongside other data tools, choosing by reliability and price, all from one balance.",
    rows: [
      { feature: "Core model", aedex: "Multi-category tool router", competitor: "Proxy scraping API" },
      { feature: "Scope", aedex: "Many categories", competitor: "Scraping only" },
      { feature: "Pricing", aedex: "Per result", competitor: "Per scrape / credits" },
      { feature: "Routing", aedex: "Reliability-weighted", competitor: "Single network" },
      { feature: "Agent surfaces", aedex: "Skill · MCP · CLI", competitor: "API / SDK" },
    ],
    aedexWins: [
      "One balance across scraping plus finance, weather, search, and people data.",
      "Reliability-weighted routing across providers rather than one proxy network.",
      "Per-result billing — failed scrapes don't debit.",
    ],
    competitorWins: [
      "Simple, focused scraping API that is easy to drop into an existing pipeline.",
      "Mature proxy rotation and anti-bot handling specific to scraping.",
    ],
    verdict:
      "Pick ScraperAPI for a single, simple scraping endpoint. Pick aedex when scraping is one of several data needs and you want one metered balance with reliability routing.",
    faqs: [
      {
        q: "Is aedex a good ScraperAPI alternative?",
        a: "Yes if you need scraping plus other data tools behind one balance with per-result billing and reliability routing. If you only need a scraping proxy endpoint, ScraperAPI is simpler.",
      },
      {
        q: "How does aedex price scraping vs ScraperAPI?",
        a: "aedex bills per result across all categories from one prepaid balance; failed runs are free. ScraperAPI bills per scrape via credits scoped to scraping.",
      },
    ],
  },
  {
    slug: "apify",
    name: "Apify",
    category: "scraping actors marketplace",
    tagline: "Marketplace of scraping actors.",
    url: "https://apify.com/",
    blurb:
      "Large marketplace of scraping actors, billed to developers. aedex can route to Apify-style providers as one source among many, metered per result.",
    intro:
      "Apify is a broad marketplace of scraping 'actors' with its own runtimes and billing. It is strong and deep in scraping automation. aedex treats Apify-style providers as upstream sources it can route to — one of many categories — behind a single balance and per-result metering, rather than being a scraping marketplace itself.",
    rows: [
      { feature: "Core model", aedex: "Tool router (Apify = upstream)", competitor: "Scraping actors marketplace" },
      { feature: "Scope", aedex: "Many categories", competitor: "Scraping automation" },
      { feature: "Pricing", aedex: "Per result", competitor: "Per actor run / subscription" },
      { feature: "Buyer", aedex: "Agents + operators", competitor: "Developers" },
      { feature: "Agent surfaces", aedex: "Skill · MCP · CLI", competitor: "API / SDK / MCP" },
    ],
    aedexWins: [
      "Routes to Apify and other providers from one balance instead of managing actor billing separately.",
      "Per-result metering across categories, plus reliability routing between providers.",
      "Agent-first surfaces and a signed spend ledger.",
    ],
    competitorWins: [
      "Deep, mature actor marketplace with scheduling, storage, and a large community.",
      "More scraping-specific tooling and prebuilt actors.",
    ],
    verdict:
      "Use Apify directly when you want its actor ecosystem and runtimes. Use aedex when you want Apify-style sources abstracted behind one balance alongside other categories, metered per result for agents.",
    faqs: [
      {
        q: "Is aedex a good Apify alternative?",
        a: "aedex does not replace Apify's actor marketplace — it can route to Apify-style providers as one upstream among many, billed per result from one balance. Good for agents needing many tool types; not for teams needing Apify's full actor runtime.",
      },
      {
        q: "Can aedex use Apify?",
        a: "Apify-style scraping providers fit the routed catalog. The agent discovers and runs them through aedex's skill/MCP/CLI and pays per result from its one balance, with reliability routing applied.",
      },
    ],
  },
  {
    slug: "composio",
    name: "Composio",
    category: "agent integrations / SDK",
    tagline: "Integrations SDK for AI agents.",
    url: "https://composio.dev/",
    blurb:
      "SDK-first library of integrations for agent frameworks. aedex is a runtime router that meters and routes calls per result, not an embedded SDK.",
    intro:
      "Composio provides a large library of integrations accessed primarily through SDKs inside agent frameworks, often via subscriptions to developers. aedex is a runtime tool router: an agent calls one skill/MCP/CLI, aedex discovers and runs the tool, and meters per result against a balance. Different layer of the stack.",
    rows: [
      { feature: "Core model", aedex: "Runtime tool router", competitor: "Integrations SDK library" },
      { feature: "Layer", aedex: "Gateway / runtime", competitor: "Embedded SDK" },
      { feature: "Pricing", aedex: "Per result", competitor: "Subscription to developers" },
      { feature: "Routing", aedex: "Reliability-weighted", competitor: "Direct integration calls" },
      { feature: "Spend audit", aedex: "Signed ledger", competitor: "Subscription plans" },
    ],
    aedexWins: [
      "Runtime metering per result and reliability routing, not a static SDK call.",
      "Signed ledger for agent spend vs subscription billing to developers.",
      "One balance and one MCP server hides N upstreams behind a normalized interface.",
    ],
    competitorWins: [
      "Broad integration library wired for many agent frameworks.",
      "SDK ergonomics for developers embedding integrations in-app.",
    ],
    verdict:
      "Use Composio when you want an embedded integrations SDK inside your framework. Use aedex when you want a runtime router that discovers, routes, and meters tool calls per result for agents.",
    faqs: [
      {
        q: "Is aedex a good Composio alternative?",
        a: "If you want runtime tool routing with per-result metering and reliability routing for agents, yes. If you need an embedded integrations SDK inside a specific framework, Composio fits better — they sit at different layers.",
      },
      {
        q: "Composio vs aedex: SDK or router?",
        a: "Composio is an SDK/library of integrations developers embed and subscribe to. aedex is a runtime router the agent calls at execution time, billing per result from a balance and routing by reliability.",
      },
    ],
  },
];

export function getCompetitor(slug: string): Competitor | undefined {
  return COMPETITORS.find((c) => c.slug === slug);
}
