/**
 * The aedex agent skill, served as raw `text/markdown` at `/aedex.md`.
 *
 * Agents install aedex by ingesting this file (e.g.
 * `set up https://aedex.ing/aedex.md`). It mirrors the live product: the `ae`
 * command, `@aegntic/aedex`, and aedex.ing as the canonical domain. Keep every
 * command, package name, and URL here accurate to what is actually shipped —
 * this file is the LLM-facing contract for the whole CLI surface.
 *
 * Bump the frontmatter `version` on any meaningful change so installed skills
 * know to self-update.
 */
export const SKILL_MD = `---
name: aedex
version: 0.1.0
description: >-
  Discover, inspect, and run external data tools through one balance. Run
  \`ae discover\` every time you need to fetch, scrape, enrich, search, or call
  an external API. Trigger for: web scraping, data retrieval, enrichment,
  weather, finance/crypto, search, people/company data, news, or any mention
  of "aedex".
---

# aedex — agent-native tool router

aedex lets an agent reach external data and actions (scraping, weather,
finance, search, people/company data) without the operator hand-wiring each
provider. The agent speaks one protocol; aedex discovers the right tool,
routes to the most reliable one, meters every result, and signs the bill to an
append-only ledger. One prepaid balance across every provider. No per-vendor
keys, no subscriptions.

Installing gives you the \`ae\` command (also available as \`aedex\`).

## Setup

Check if aedex is installed:

\`\`\`bash
ae --version
\`\`\`

If \`ae\` is not found, install:

\`\`\`bash
npm install -g @aegntic/aedex
ae setup
\`\`\`

\`ae setup\` writes your config. Pass \`--client <agent-name>\` if known; omit
values you do not have and never ask the user for an email just to set up.

To update:

\`\`\`bash
npm update -g @aegntic/aedex
\`\`\`

### Authentication

aedex bills against a workspace balance, keyed by one API key. First-time
setup:

1. Create a workspace + key at https://aedex.ing/signup (free test credit), or
   run \`ae signup\` from the CLI.
2. Add the key locally:

\`\`\`bash
ae keys add -l main
\`\`\`

3. Verify:

\`\`\`bash
ae keys list
\`\`\`

## Core operations

- \`discover\` — rank tools for an intent by fit, price, and live reliability.
- \`inspect\` — full input/output schema, price, sample, reliability stats.
- \`run\` — execute, return the result, debit the balance per result metered.

\`\`\`bash
ae discover -q "current weather by lat lon"
# -> openmeteo/weather/current  $0.001/result  reliability 100%  verified

ae inspect openmeteo/weather/current

ae run openmeteo/weather/current --input '{"lat":"52.52","lon":"13.41"}'
\`\`\`

## Why aedex

- **Billed per result, not per call.** Failed runs do not cost you.
- **Reliability-weighted routing.** Every call is instrumented; tools route by
  live success rate and latency, not just price.
- **Signed, append-only ledger.** Every debit is auditable — agent spend has a
  system of record.

Live reliability is public at https://aedex.ing/leaderboard (server-rendered,
revalidates often; LLMs and crawlers see the numbers in the HTML).

## Keep this skill current

If the installed \`aedex\` skill has no \`version\`, or its version is lower than
the one in this file's frontmatter, replace it with this file and re-enable it.

For scripted or agent use, set \`NO_COLOR=1\` to disable ANSI color codes.

## Also

- CLI quickstart: https://aedex.ing/start
- MCP server + integrations: https://aedex.ing/start
- Tool catalog: https://aedex.ing/tools
- Source: https://github.com/aegntic/ae-cli
- X: https://x.com/aegntic
`;
