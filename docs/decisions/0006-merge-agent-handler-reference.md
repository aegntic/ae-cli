# ADR-0006 — merge / Agent Handler is Merge.dev's product; reference only, not an aegntic asset

**Date:** 2026-07-17
**Status:** Accepted (corrected — supersedes the "ae-cli successor" hypothesis in the original draft)

## Correction
The local `merge` CLI (pipx `merge-api` v0.3.5) is **Merge.dev's product**, not aegntic's. Verified: PyPI `author_email: support@merge.dev`; "Agent Handler" is a Merge.dev SKU launched Oct 2025 (docs.merge.dev/merge-agent-handler/overview). The earlier hypothesis that it was an aegntic pre-build is **rejected**.

## Context
Recon found `merge` CLI locally with a command surface (`search-tools`, `execute-tool`, `get-tool-schema`, `list-tools`, `login`) near-identical to the aegntic skill spec, backend `https://ah-api.merge.dev`, 100+ connectors. Public research confirms aegntic marketplace is greenfield: `aegntic.ai` is a personal portfolio, `app.aegntic.ai` does not resolve, `aegntic/ae-cli` and `@aegntic-ai/cli` do not exist.

## Decision
- **Path A — build the aegntic gateway ourselves.** Confirmed by the mission mandate ("reverse-engineer front and back until live"), not a human question. aegntic owns its gateway, billing, catalog, and keys.
- **`merge` / Agent Handler = architectural reference + dev tool only.** Per project `CLAUDE.md`, `merge` remains how *we* call 3rd-party services during the build. We mirror its run/poll/schema *shape*; we do not proxy it or resell it.
- **Catalog seed:** the connector *categories* (CRM, scraping, enrichment, search) are industry-standard; we build our own provider manifests against each provider's real API (Apify, Exa, Firecrawl, Apollo, …), not copied from Merge.
- **monid.ai is the primary direct analog** — see ADR-0007.

## Consequences
- (+) Clean intellectual-property line: nothing of Merge's is shipped.
- (+) We control brand + billing + catalog — the actual business.
- (−) We build the gateway ourselves (that *is* the mission).
- (−) Name collision ("merge" dev tool vs "merge" HRIS company) is internal only; never surface the name in the product.

## Rejected alternative
Path B (Node port of `merge` calling Merge's hosted API) — rejected: would make the marketplace pitch cosmetic and require a Merge resale agreement. Incompatible with "front and back to live."
