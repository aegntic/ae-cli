# ADR-0007 — monid.ai is the primary direct analog; differentiation plan

**Date:** 2026-07-17
**Status:** Accepted

## Context
monid.ai positions as **"OpenRouter for agent tools"** — 1800+ tools, one wallet, pay-per-call, natural-language discovery, integrates with Claude Code / OpenClaw / Hermes. This is the closest existing product to aegntic's spec — closer than Apify (single-domain) or Composio (SDK-first, no CLI centerpiece). User flagged monid as "inspo"; research shows it is actually the **primary competitor to beat**, not merely inspiration.

## Differentiation (what aegntic does differently)
1. **NL discovery is semantic, not keyword-tag.** monid's discovery is keyword/tag-based; aegntic uses pgvector hybrid (semantic + BM25) over `description` + `input_schema`. This is the defensible technical moat.
2. **Per-result metering, not per-call.** monid charges pay-per-call (no margin cushion for retries/failures). aegntic charges per-result (ADR-0005) — value-aligned, survives failed runs.
3. **"Dev writes the check," not "agent wallet."** monid over-indexes on the agent-pays-itself narrative. For hackathon judges, the dev-controlled prepaid balance lands harder.
4. **Heterogeneous catalog with a non-scraping wedge.** monid skews scraping/enrichment. aegntic's demo includes at least one non-scraping category (search/enrichment/CRM) to look broader.

## Steal from monid (verified good)
- The "OpenRouter for tools" positioning sentence — adapt: *"One CLI, one balance, every data tool."*
- One API key / one wallet across the whole catalog.
- Live per-result pricing page (`/tools`) — radical transparency converts devs.
- Pluggable agent integration (Claude Code / OpenClaw / Hermes / MCP), not locked to one host.

## Reject from monid
- Pay-per-call with no subscription floor (no margin cushion).
- "Wallet for agents" sci-fi framing (blurry for judges).
- Scraping-only catalog skew.

## Consequence
Positioning locked: **"One CLI, one balance, every data tool — discover first, run second."** monid is the benchmark to visibly out-do on (1) discovery quality and (2) metering model. Marketing/content (docs/content/*) frames against monid, never by name in customer-facing copy unless asked.
