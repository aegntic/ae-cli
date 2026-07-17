# Publish-grade socials (human voice, anti-AI-detector)

These are the actual strings to publish. Written to pass as human: no em-dashes,
no triple-parallel lists, no "not just X but Y", no "(the X)" framing, no
motivational sign-offs. Varied rhythm, fragments, first person, admits small
mistakes. One idea per tweet.

---

## X — thread (post in order, reply each to the previous)

**1 (lead):**
```
built a cli over the last day. you type

aegntic run openmeteo/weather/current --query '{"lat":"52.52","lon":"13.405"}'

and it pulls real berlin weather and debits a tenth of a cent from your balance. the debit goes into a postgres table that only ever grows. your balance isn't a column, it's the sum of that table. restart the server, the number's the same.
```

**2 (reply):**
```
the first version charged you even when the run failed. fixed it. a failed run now costs nothing, a good one charges the exact cost instead of the estimate. felt obvious only after i wrote it down.
```

**3 (reply, the war story):**
```
favorite bug today: dashboard started 500ing. "relation runs does not exist". another branch on this machine had run its own db migrations against my dev postgres and renamed runs to jobs. the ledger was untouched because nothing's allowed to edit it. the runs table was just gone. one database per worktree, learned the dumb way.
```

**4 (reply, the console — optional, post if thread lands):**
```
there's a dashboard now too. paste a key, see your balance and run history. it talks to the same /v1/balance the cli does. that's the whole architecture: one api, thin surfaces over it.
```

Image to attach to **1**: the /app console screenshot (balance + runs table) OR the terminal showing the run + ledger row. One image, first tweet only.

---

## LinkedIn — single post

```
I've been building a thing in the open and it crossed a line today, so here's an honest update.

It's a CLI, aegntic. Small pitch: one command discovers a data endpoint (a scraper, an API, whatever you need), inspects its schema, runs it, and bills a prepaid balance per result. No per-tool subscriptions, no dashboards full of tabs.

Today it stopped being a demo. The CLI hits a real external API now, Open-Meteo, free, no key, and pulls live weather for a coordinate you give it. The charge, about a tenth of a cent, gets written to a Postgres ledger that nothing is allowed to edit or delete. Your balance isn't a number sitting in a row somewhere. It's derived, every time, from the sum of every charge and topup that ever happened. Kill the process, bring it back up, the balance is the same. That part I'm quietly proud of.

Two things went wrong this week and I want to put both on the record.

My own tests said billing worked. I ran a second, meaner pass and the balance hadn't moved. Both results were correct. We charge a tenth of a cent and the interface rounded to cents, so a charge was literally invisible. Now it shows four decimals. The lesson I actually took away: a green test is not proof, it's an absence of imagination.

The second one was worse. The dashboard started returning 500 errors. Relation "runs" does not exist. I went looking for my bug and couldn't find it, because it wasn't mine. Another branch, on this same machine, had run its database migrations against the shared dev Postgres and quietly renamed my runs table to its own schema. The ledger came through without a scratch, because append-only means append-only. The runs table was simply gone. One database per worktree from now on. Learned the dumb way, as usual.

The repo stays private until launch. The build log is the honest part and it's public. More soon.
```

Image to attach: the /app console screenshot.

---

## Anti-slop checklist applied
- [x] no em-dashes (—), en-dashes only inside ranges if any
- [x] no triple-parallel lists ("real X, real Y, real Z")
- [x] no "not just X, but Y" / "it's not X, it's Y"
- [x] no "(the leap)" / "(the bug we ate)" framing
- [x] lowercase sentence starts, fragments, contractions
- [x] admits a dumb mistake (the dumb way, couldn't find my own bug)
- [x] one concrete number per claim (tenth of a cent, four decimals, 500)
- [x] no 🚀, no "let's go", no motivational close
- [x] point of view, not a press release
