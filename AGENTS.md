# ae-cli — Project Schema

## Master directive
Cognitive Operating System v3.0 governs how to think. Full spec: `/home/ae/AE/AGENTS.md` (github.com/aegntic/cognitive-os). This file adds project overrides only.

## What this is
The `aegntic` CLI (`@aegntic-ai/cli`) plus the gateway + dashboard that make it real. A universal tool-discovery + execution marketplace: discover → inspect → run → poll → bill.

## Non-negotiables
- **Discover first.** Before any hand-rolled scraper or direct third-party call, search the catalog. The catalog is the product.
- **Galaxy-brain, high-level.** Docs frame the inevitable outcome first, then the path. No low-altitude noodling in top-level docs.
- **Track everything.** Every build → `docs/build-log.md`. Every fork-in-road → `docs/decisions/NNNN-*.md` ADR. Every checkpoint → YouTube script in `docs/content/youtube/`.
- **Test before commit.** Background subagent verifies each feature/codeblock. No subpar execution. CI is the floor, not the ceiling.
- **Human out of loop.** When blocked, ask self or a "parental" planning agent: *what context would make the desired outcome inevitable, and what are the next vital, immediate steps?* Do not ping the human for reversible decisions. Green-light assumed.
- **Commit frequently.** Small, reviewable commits to `gh/aegntic/ae-cli`. Use worktrees for parallel exploration.

## Stack (provisional — firmed by ADR after research)
TypeScript end-to-end. Monorepo (pnpm workspaces or turborepo). CLI framework + backend + DB pending ADR-0004.

## Layout
See `README.md`. `raw/` (none yet), `docs/` = agent-owned knowledge, this file = schema.

## Memory model
This repo doubles as an LLM Wiki: `docs/` is the agent-owned compiled layer; ADRs + build-log are append-only timelines. Follow `~/.claude/rules/llm-wiki/` conventions for any synthesis pages.

## Operating hooks
- `bd` (beads) is the work tracker. No TodoWrite, no markdown TODO lists.
- Background agents test before merge.
- Content pipeline (`docs/content/`) produces tweet/LinkedIn/YouTube deliverables per checkpoint — this is a watched build, narrative is a deliverable.
