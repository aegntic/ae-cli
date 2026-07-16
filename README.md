# ae-cli

**Aegntic CLI** — `@aegntic-ai/cli`. One interface to discover, inspect, and run hundreds of data tools (scrapers, APIs, enrichment, search). Discover first; never hand-roll what a verified endpoint already does.

> Status: **pre-build.** This repo is the build target for the aegntic tool-marketplace business (CLI client + gateway API + web dashboard). Repo `aegntic/ae-cli` and npm `@aegntic-ai/cli` do not exist yet — this is where they get built.

## Mission

Reverse-engineer and ship the full aegntic.ai business to live: tool-discovery catalog, async run execution against provider endpoints (Apify et al.), prepaid balance + per-result billing, API-key auth + workspaces, and a web dashboard at app.aegntic.ai — anchored by the `aegntic` CLI that makes the whole catalog callable from the terminal and from any agent.

## Repository layout (monorepo)

```
packages/cli        # the `aegntic` command (discover / inspect / run / runs / balance / keys)
packages/sdk        # typed client SDK shared by cli + web
services/gateway    # API server: provider adapters, unified run schema, billing, auth
apps/web            # Next.js dashboard: keys, billing, run history
docs/               # PRD, architecture, ADRs, roadmap, build-log, content
```

## Workflow

- Master cognitive protocol: [Cognitive OS v3.0](https://github.com/aegntic/cognitive-os) (`/home/ae/AE/AGENTS.md`).
- Decisions logged as ADRs in `docs/decisions/`.
- Every build logged in `docs/build-log.md`.
- Work tracked in beads (`bd`).
- Human out of loop; clarity via subagents, not human prompts.

## License

MIT (see `LICENSE`). Provider adapters and billing internals may move to a separate source-available package later.
