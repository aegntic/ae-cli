#!/usr/bin/env node

import { defineCommand, runMain } from "citty"
import pkg from "../package.json" with { type: "json" }

const { name, version } = pkg

const main = defineCommand({
  meta: {
    name,
    version,
    description: "Discover and run data endpoints",
  },
  subCommands: {
    discover: () => import("./commands/discover.js").then((m) => m.default),
    inspect: () => import("./commands/inspect.js").then((m) => m.default),
    run: () => import("./commands/run.js").then((m) => m.default),
    runs: () => import("./commands/runs.js").then((m) => m.default),
    balance: () => import("./commands/balance.js").then((m) => m.default),
    keys: () => import("./commands/keys.js").then((m) => m.default),
    setup: () => import("./commands/setup.js").then((m) => m.default),
  },
})

runMain(main)
