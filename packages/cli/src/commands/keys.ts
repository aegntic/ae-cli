import { defineCommand } from "citty"
import consola from "consola"
import { listKeys, createKey, deleteKey } from "../lib/client.js"
import { getConfig, saveConfig } from "../lib/config.js"

const add = defineCommand({
  meta: { name: "add", description: "Create a new API key (server mints it)" },
  args: {
    l: { type: "string", description: "Label for the key" },
  },
  async run({ args }) {
    // Server mints the key and returns it once. Save the minted key, not a
    // caller-supplied one.
    const created = await createKey(args.l)
    await saveConfig({ apiKey: created.key })
    consola.success(`Key "${created.label}" created and set as active.`)
    console.log(`  ${created.key}`)
    consola.warn("Store this key securely — it will not be shown again.")
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
  meta: { name: "remove", description: "Revoke an API key (deletes it server-side)" },
  args: {
    l: { type: "string", description: "Label of the key to revoke", required: true },
    f: { type: "boolean", description: "Force (skip confirmation)", default: false },
  },
  async run({ args }) {
    if (!args.f) {
      consola.warn(`This will revoke key "${args.l}" on the server. Use -f to confirm.`)
      return
    }

    const res = await deleteKey(args.l)
    consola.success(`Key "${res.label}" revoked (deleted server-side).`)
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
