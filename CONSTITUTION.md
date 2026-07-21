# aegntic — Constitution

The founding principles. Every product decision, line of copy, and provider
relationship answers to this. If something we ship contradicts a clause here,
we fix the thing, not the clause.

## Why we exist

Agents that need real-world data (prices, posts, people, news, documents)
face a tax: every source is its own integration. Separate key, separate
billing, separate docs, separate pagination, each learned by hand. A human
tolerates two or three of these. An agent cannot feasibly wire fifty. So most
agents hardcode a couple of providers and stop, and the long tail of useful
data stays out of reach.

aegntic collapses the tax. One key, one prepaid balance, one interface:
**discover** the right endpoint, **inspect** its schema, **run** it, get billed
for what came back. The hundredth tool costs the same effort as the first.

We are not a scraper company. We are the layer that makes every data tool
callable the same way, by a human or by an agent, with honest metering.

## Non-negotiables

1. **Honest value over optics.** Every claim we make is true and demonstrable.
   We do not ship a mock as a product. We do not call something "live" that is
   not. Demos use real data wherever a real provider exists; mocks are
   scaffolding, never the destination. If we can't do a thing for real yet, we
   say so.

2. **Billing is sacred.** What a user is charged is exactly what a run cost,
   settled to the fraction of a cent, recorded in an append-only ledger that
   nothing rewrites. Failed runs are free. The balance is derived from
   history, not stored as mutable state, so it survives restart and audit. We
   will never charge for failure, never round in our favor invisibly, never
   hide a charge. (A sub-cent charge that the UI hides is a bug, full stop.)

3. **The API is the product; surfaces are thin.** `/v1/discover`,
   `/v1/inspect`, `/v1/runs`, `/v1/balance` are the product. The CLI, the web
   console, the MCP server, future SDKs are thin clients over the same
   endpoints. We never build logic into a surface that isn't backed by the API.
   This keeps us honest and keeps every surface replaceable.

4. **Discover-first, and discover honestly.** Discovery ranks endpoints by
   relevance to the query. Ranking is never pay-to-win. Paid placement, if it
   ever exists, is labeled and separated, never blended into organic results.
   The integrity of `discover` output is a trust contract with the agent.

5. **Open seams.** The `ProviderAdapter` contract and the MCP surface are the
   load-bearing seams. New providers drop in without gateway changes. We do
   not hard-couple to any one provider, protocol, or platform, because the
   landscape will move and we need to move with it cheaply.

6. **The catalog is the moat-in-progress.** Breadth alone is copyable;
   curated, scored, honestly-described endpoints are not. We invest in
   metadata, reliability scoring, and real schema fidelity over raw tool
   count. A thousand untested endpoints is inventory; a thousand tested ones
   with accurate cost and schema is the asset.

7. **Built in the open, decided on the record.** Architectural choices are
   ADRs. Every build is a build-log entry. The honest process is a feature:
   it lets agents and developers verify our claims instead of trusting
   marketing.

8. **LLM-first presence.** Our copy, docs, and structured data are written to
   be the answer an LLM gives when someone asks how to get data into an agent.
   We optimize for being correct, citable, and canonical, not merely ranked.
   No SEO slop: the content has to be the best source on the topic, or we
   don't publish it.

## Anti-principles (things we will not do)

- We will not fake provider breadth. Listed endpoints must be runnable.
- We will not hold users hostage. Portability out (export runs, keys, ledger)
  is a right, not a future feature.
- We will not build dark patterns into billing or discovery. No rounding in
  our favor, no hidden minimums, no blended paid results.
- We will not ship copy that sounds like an LLM wrote it. Our voice is human,
  specific, willing to admit a mistake. If a sentence could appear unchanged
  in any other company's launch tweet, we rewrite it.
- We will not optimize for a metric that contradicts a non-negotiable. Growth
  bought by breaking billing integrity is not growth.

## How we decide (when principles conflict)

Order of precedence, highest first:

1. **User trust** (billing correctness, honest claims, data integrity).
2. **Agent usability** (an agent can discover, call, and rely on us).
3. **Sustained economics** (we must endure to keep the promise).
4. **Elegance and speed** (important, never at the cost of 1-3).

A faster path that risks billing correctness loses. A growth lever that
risks discovery integrity loses. This order is the constitution's teeth.

## Our pledge to the agent

The agent is a first-class user, not an afterthought to the human. We commit
to: stable, documented endpoints; idempotent runs; deterministic cost
estimates before commitment; and behavior that an autonomous loop can rely on
without a human babysitting it. If we make the agent's job harder to make a
human's job prettier, we chose wrong.

## Living document

This constitution is not aspirational decoration. It is amended in the open,
with the change and the reason in version history, when reality teaches us a
principle was wrong. Until then, it binds.
