# aedex — Go-to-Market

> Status: launched & public (2026-07-21). This is the plan to turn **live** into **used**.

## TL;DR

**Wedge:** *"Discover first, run second, bill last."* The catalog **is** the product — agents that call `ae discover` stop hand-rolling scrapers.
**Channel:** agents discover aedex natively through the MCP server (the agent-native channel) + a programmatic SEO catalog that ranks for every "data tool" query.
**Money:** prepaid balance, **per-result** billing, failed runs free, 1.25× provider markup. Tamper-evident Ed25519 ledger = the trust wedge.
**One asset that does the selling:** the public reliability leaderboard backed by real telemetry — nobody can fake it, everyone links to it.

---

## 1. Positioning

| | |
|---|---|
| **Category** | Agent data infrastructure — *"the API marketplace an agent can shop itself."* |
| **Is** | One CLI (`ae`) + one prepaid balance → discover → inspect → run any data tool, billed per result, with a tamper-proof ledger + public reliability board. |
| **Is not** | Not a scraper-builder. Not a glue library. Not a per-call API gateway. The catalog IS the product. |
| **Enemy** | The status quo: every dev/agent hand-rolling a scraper, wiring 10 provider accounts, guessing which API is reliable. |

The single sentence: **aedex is the catalog that makes every agent a data-tool expert — discover once, run anything, billed only on success.**

---

## 2. The wedge (and why it compounds)

1. **Discover-first habit.** An agent (or dev) trained to `ae discover "<intent>"` before building never hand-rolls. That habit *is* the business. Every discover→run is revenue; the more tools cataloged, the stronger the habit.
2. **Agents as distribution.** The gateway ships an **MCP server**. Claude Code / Cursor / Codex / any MCP-aware agent discovers + runs aedex natively. Wire once → every agent call is a billed result. Agents become the channel.
3. **Trust you can prove.** Per-result billing + **failed runs free** + a **signed, auditable ledger** (`GET /v1/balance/audit`) removes the #1 objection to prepaid data: "how do I know I'm not getting robbed?"

---

## 3. Ideal customer profiles (ranked by willingness-to-pay)

| # | Segment | Why they pay | Entry hook |
|---|---------|--------------|-----------|
| 1 | **Agent-native power users** — Claude Code / Cursor / Codex builders | One MCP install → revenue on every agent data call. Highest lifetime value. | "Add aedex to your MCP config, your agent now shops for data." |
| 2 | **Indie devs / scraping workflows** | One bill, ranked reliable endpoints, no 10 provider accounts, no auth glue. | `ae discover "scrape linkedin"` → ranked, ready to run. |
| 3 | **Data & growth teams** | Need vendor reliability evidence; cite the public leaderboard for buy decisions. | The leaderboard is the sales asset. |
| 4 | **Providers (Apify first, two-sided)** | List tools in a catalog agents already shop. Distribution they can't get alone. | Marketplace flywheel (P5+). |

**Primary bet: #1, agent-native.** It's the only segment where distribution compounds automatically (each install seeds more agent calls).

---

## 4. Channels (highest leverage → lowest)

1. **MCP registries / directories.** List aedex in Smithery, mcp.run, the Claude MCP registry, and Cursor's MCP index. *This is the agent-native channel* — being listed = being discoverable by every agent. **Highest leverage, lowest cost, do first.**
2. **Programmatic SEO.** One indexed page per catalog tool: `aedex.ing/t/<tool>` and `aedex.ing/q/<intent>`. Rank for "scrape linkedin api", "weather api free", "hackernews api", "fx rates api". The leaderboard is the linkable asset that earns backlinks. Compounds forever.
3. **Launch spike.** Show HN (*"Show HN: the API catalog your AI agent can shop itself"*), Product Hunt, r/LocalLLaMA, r/MachineLearning, r/webdev, r/sidehustle, dev Twitter/X. Hook = leaderboard + per-result/failed-runs-free + live audit. One-time, high-signal.
4. **Content.** Repo already seeds `docs/content/` (tweets, LinkedIn, YT). Beats: *"Why per-result billing beats per-call"*, *"How agents shop for data"*, provider teardowns, weekly reliability report (auto-generated from the board).
5. **Provider marketplace.** Apify self-serve listing → two-sided flywheel. Turns providers into a sales force.

---

## 5. The offer & pricing GTM

- **Activation:** first **$5 free** on signup (currently only a seeded test key exists — free tier must ship to convert). Goal: get a new user to their first successful `ae run` within one session.
- **Pricing wedge:** per-result, failed runs free. Emphasize in every surface. It is the differentiated trust claim.
- **Proof:** `GET /v1/balance/audit` — make the live signed-ledger audit a public, linkable page (`/audit` or `/trust`).
- **Top-up:** Stripe checkout (webhook verified, not yet exercised end-to-end live — close this loop).

---

## 6. Growth loops

1. **Catalog → SEO → discover → run → revenue.** Every cataloged tool = one more indexed page = one more entry point.
2. **Leaderboard → backlinks → authority.** Honest reliability rankings earn links; links → rankings → more discover traffic.
3. **MCP install → agent usage → telemetry → leaderboard richer.** More usage improves the board; a richer board sells harder.
4. **Provider listing → provider promotes aedex → more tools → stronger catalog.** Two-sided.

---

## 7. Metrics that matter

| Funnel stage | Metric |
|---|---|
| Reach | Catalog pages indexed; organic impressions; MCP registry installs |
| Activation | `% who run first successful` `ae run` within session of `ae setup` |
| Retention | Weekly active API keys |
| Monetization | Free-credit → first Stripe top-up conversion %; revenue per active key |
| Product health | Leaderboard freshness (last telemetry run); failed-run rate |

Instrument these before chasing volume. You can't optimize activation you don't measure.

---

## 8. 30 / 60 / 90

**30 days — distribution + instrumentation**
- aedex listed in **≥2 MCP registries** (Smithery + one more).
- Programmatic `/t/<tool>` + `/q/<intent>` pages live and submitted to search consoles.
- **Analytics + activation funnel** instrumented (Vercel Analytics + a key event on first successful run).
- **First-$5-free** live.
- **Show HN + Product Hunt** launch.
- Public `/trust` (signed-ledger audit) page.

**60 days — flywheels**
- Apify **provider marketplace** self-serve (first two-sided surface).
- 50+ catalog pages ranking.
- Newsletter (weekly reliability report, auto-published from the board).
- Stripe top-up loop verified end-to-end live.

**90 days — leverage**
- Featured MCP partnership (Cursor / Claude).
- Referral credits (invite → both get balance).
- Paid conversion measured + the offer tuned on data.

---

## 9. Launch checklist (the spike)

- [ ] Show HN post drafted (hook + live leaderboard link + audit link)
- [ ] Product Hunt asset pack (gallery, demo GIF of `ae discover → run`, tagline)
- [ ] Dev Twitter/X thread (5 tweets: problem → wedge → leaderboard → per-result → install cmd)
- [ ] LinkedIn post (B2B angle: vendor reliability)
- [ ] Reddit variants per subreddit (tone-matched, not spammy)
- [ ] Demo: 60s screencast `ae discover "weather"` → `ae run` → balance
- [ ] All CTAs point to `bun add -g @aegntic/aedex` + https://aedex.ing

---

## 10. What to automate (engineering, supports GTM)

| Automation | Why it matters for GTM | Status |
|---|---|---|
| **CI** (typecheck/lint/build/test) | Confidence to ship fast without breaking the live product | ❌ missing → shipping now |
| **Auto-release** (tag → npm publish) | Removes the manual token-publish friction for every version | ❌ missing → shipping now |
| **Dependabot** | Keep providers/deps current; a stale provider adapter = broken runs = churn | ❌ missing → shipping now |
| **Analytics** | Measure activation; the #1 lever | pending (cred choice) |
| **Leaderboard-warming cron** | Keep the board honest + fresh 24/7 (the asset must look alive) | pending |
| **Dynamic OG cards** | Per-tool shareable cards → better launch + social CTR | pending |
| **Uptime monitor** | `/health` alerting; dead gateway = instant churn | pending |
| **Error tracking** | Know about failed runs before users tweet about them | pending |

---

*aedex.ing — Discover first. Run second. Bill last.*
