# ADR-0002 — Repo visibility: private first, public at launch checkpoint

**Date:** 2026-07-17
**Status:** Accepted

## Context
Creating `aegntic/ae-cli` as **public** on day one publishes server/billing code, provider-adapter secrets patterns, and unfinished architecture to the world before review. The mission is "watched," but watched ≠ published-early. Irreversible-ish (history sticks, scrapers cache).

## Decision
Create `aegntic/ae-cli` as **private**. Ship the vertical slice, harden secrets handling (ADR will cover), then flip public at a named **Launch checkpoint** documented in `docs/roadmap.md`. The flip itself becomes a content moment (YouTube script, tweet, LinkedIn).

## Consequences
- (+) Freedom to iterate, commit often, break things without public history shame.
- (+) Security review (security-reviewer agent) lands before exposure.
- (−) Community/contributor signal delayed — acceptable; wedge is the demo, not stars.

## Trigger to flip public
All true:
1. Gateway serves `discover → inspect → run → poll` end-to-end on ≥1 real provider.
2. No secrets in tree (gitleaks + manual pass).
3. LICENSE + README + AGENTS.md present.
4. Launch checkpoint content drafted.
