# Publish-grade socials — v2 (post-strategy, spine-aligned)

Rewritten after the 4-pass research synthesis (`docs/strategy/positioning-2026.md`).
Leads with the tax + the wedge, then the two honest moats (outcome routing,
append-only ledger), then the MCP-surface bet. Problem-first, never mechanics-first.

Anti-slop applied: no em-dashes, no triple-parallel lists, no "not just X but Y",
admits the thesis is a bet, lowercase/fragments, one concrete number per claim.

---

## X — thread (post in order, reply each to the previous)

**1 (the tax + the wedge):**
```
agents that need real data pay a stupid tax. every source is its own api key, billing, schema, pagination. a human wires two and quits. an agent can't feasibly glue fifty, so it hardcodes two providers and the rest of the data universe stays out of reach.

we're collapsing it: one key, one prepaid balance, billed per result. the agent pays, not a developer's procurement form.
```

**2 (reply, the routing moat):**
```
the reflex is to build a bigger catalog. that's the trap. the MCP registry already lists 10,000+ servers for free. listing tools is a commodity now.

the unsolved part is which tool actually works. we instrument every call and route to the provider with the best proven success for that exact job. more calls, more signal, better routing. it runs on data nobody can backfill.
```

**3 (reply, the ledger moat):**
```
and the bill isn't a column we edit. it's an append-only ledger. every charge is a row that's never modified or deleted. balance is derived from the sum of history. failed runs are free, never rounded in our favor, never hidden.

that's the real moat: an auditable system of record for agent spend. trust, not tool count.
```

**4 (reply, the surface + the ask):**
```
it's a cli today. next it's a single MCP server hiding hundreds of upstreams behind one normalized interface, so your agent in claude code or cursor calls us and we route and bill. one tool the LLM reaches for, not five hundred.

what should ship first: scraping, people/company data, search, or prices? whoever earns the routing wins the volume.
```

Image to attach to **1**: the /app console screenshot (balance + runs table), OR
a cleaner "one key, one balance, N providers" graphic when we make one.

---

## LinkedIn — single post

```
I want to be honest about what we're building and why, because the easy pitch would be the wrong one.

If you build agents, you hit a tax. Every external data source, scraping or search or enrichment or weather, is its own integration. Separate API key, separate billing, separate docs, separate way to paginate. A human developer tolerates two or three of these and moves on. An agent that wants real-world data cannot feasibly wire fifty. So it hardcodes two providers and the rest of the data universe stays out of reach.

We're collapsing that tax. aegntic is one key, one prepaid balance, one interface across any data provider, billed per result. The agent pays per call, not the developer's procurement form.

Here's the part I actually care about, and where I think most of the "agent tools" companies are going to get this wrong.

The reflex is to build a bigger catalog. It's a trap. The MCP registry already lists over ten thousand servers, for free. Listing tools is a commodity now. The part nobody has solved is which of those tools actually works. So we instrument every single call and route to the provider with the best proven success rate for that exact job. More calls means more signal means better routing. That flywheel runs on telemetry nobody can reconstruct later.

The other half is the bill. It isn't a column we update. It's an append-only ledger. Every charge is a row that never gets edited or deleted. Your balance is derived, always, from the sum of history. Failed runs are free. We don't round in our favor and we don't hide a charge. That makes it an auditable system of record for agent spend, which matters more to a finance or compliance buyer than to a developer, and that's the point. Trust is the moat, not tool count.

Today it's a CLI. Next it's a single MCP server that hides hundreds of upstreams behind one normalized interface, so when your agent inside Claude Code or Cursor needs data, it calls one tool and we route and bill behind it. One tool an LLM reaches for, instead of five hundred.

Honest caveat: this is a thesis, not demand pulled from users yet. The pattern is proven (OpenRouter did it for models, and it's a real business), but nobody has shipped the agent-billed, per-result version with real traction. We're early, and the moat compounds the earlier we start collecting outcome data.

Repo is private until launch. The build log and the strategy doc are public. If you build agents and burn tokens on data tools that don't work, I'd like to hear which provider you'd want us to route around.
```

Image to attach: the /app console screenshot.

---

## Why v2 replaced v1

v1 led with mechanics (the postgres table, the weather command). A sharp reviewer
rightly asked: why does this matter, who asked, why care. v2 leads with the tax
(the problem) and the two honest moats (routing + ledger) that the research
showed are defensible, and names the bet honestly. Same anti-slop rules.
