#!/usr/bin/env node

import { defineCommand, runMain } from "citty"
import { name, version, description } from "../package.json" with { type: "json" }

const main = defineCommand({
  meta: {
    name,
    version,
    description,
  },
  subCommands: {
    discover: () => import("./commands/discover").then((m) => m.default),
    inspect: () => import("./commands/inspect").then((m) => m.default),
    run: () => import("./commands/run").then((m) => m.default),
    runs: () => import("./commands/runs").then((m) => m.default),
    balance: () => import("./commands/balance").then((m) => m.default),
    keys: () => import("./commands/keys").then((m) => m.default),
    setup: () => import("./commands/setup").then((m) => m.default),
  },
})

runMain(main)
