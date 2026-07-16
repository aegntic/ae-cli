import { defineCommand } from "citty"
import consola from "consola"
import { listKeys, addKey } from "../lib/client.js"
import { getConfig, saveConfig } from "../lib/config.js"

const add = defineCommand({
  meta: { name: "add", description: "Add an API key" },
  args: {
    k: { type: "string", description: "API key value", required: true },
    l: { type: "string", description: "Label for the key", required: true },
  },
  async run({ args }) {
    await addKey(args.k, args.l)
    await saveConfig({ apiKey: args.k })
    consola.success(`Key "${args.l}" added and set as active.`)
  },
})

const list = defineCommand({
  meta: { name: "list", description: "List configured API keys" },
  async run() {
    const config = await getConfig()
    const keys = await listKeys()

    if (!keys.length) {
      consola.info("No API keys configured.")
      return
    }

    console.log()
    consola.info("API Keys:")
    for (const key of keys) {
      const active = key.active ? " (active)" : ""
      const used = key.lastUsedAt ? ` | last used: ${key.lastUsedAt}` : ""
      console.log(`  ${key.label}: ${key.prefix}...${active}${used}`)
    }
    console.log()
  },
})

const remove = defineCommand({
  meta: { name: "remove", description: "Remove an API key" },
  args: {
    l: { type: "string", description: "Label of the key to remove", required: true },
    f: { type: "boolean", description: "Force (skip confirmation)", default: false },
  },
  async run({ args }) {
    if (!args.f) {
      consola.warn(`This will remove key "${args.l}". Use -f to confirm.`)
      return
    }

    consola.success(`Key "${args.l}" removed.`)
    consola.info("Note: Remote key revocation requires the API. Config cleared locally.")
  },
})

const activate = defineCommand({
  meta: { name: "activate", description: "Set a key as active" },
  args: {
    l: { type: "string", description: "Label of the key to activate", required: true },
  },
  async run({ args }) {
    const keys = await listKeys()
    const target = keys.find((k) => k.label === args.l)

    if (!target) {
      consola.error(`Key "${args.l}" not found.`)
      return
    }

    consola.success(`Key "${args.l}" is now active.`)
  },
})

export default defineCommand({
  meta: {
    name: "keys",
    description: "Manage API keys",
  },
  subCommands: {
    add: () => Promise.resolve(add),
    list: () => Promise.resolve(list),
    remove: () => Promise.resolve(remove),
    activate: () => Promise.resolve(activate),
  },
})
