import { defineCommand } from "citty"
import { loadConfig, saveConfig } from "../utils/config.js"
import consola from "consola"

const addCommand = defineCommand({
  meta: {
    name: "add",
    description: "Add an API key",
  },
  args: {
    key: {
      type: "string",
      alias: "k",
      description: "API key value",
      required: true,
    },
    label: {
      type: "string",
      alias: "l",
      description: "Label for the key",
      required: true,
    },
  },
  run({ args }) {
    const config = loadConfig()
    config.keys[args.label] = args.key
    if (!config.activeKey) {
      config.activeKey = args.label
    }
    saveConfig(config)
    consola.success(`Added API key "${args.key.substring(0, 20)}..." with label "${args.label}"`)
  },
})

const listCommand = defineCommand({
  meta: {
    name: "list",
    description: "List all configured API keys",
  },
  run() {
    const config = loadConfig()
    const labels = Object.keys(config.keys)
    if (labels.length === 0) {
      consola.info("No API keys configured. Run 'aegntic keys add -k <key> -l <label>' to add one.")
      return
    }
    consola.info("Configured API keys:")
    for (const label of labels) {
      const isActive = config.activeKey === label
      const prefix = config.keys[label].substring(0, 20)
      console.log(`${isActive ? "* " : "  "}${label}: ${prefix}...`)
    }
  },
})

const removeCommand = defineCommand({
  meta: {
    name: "remove",
    description: "Remove an API key",
  },
  args: {
    label: {
      type: "string",
      alias: "l",
      description: "Label of the key to remove",
      required: true,
    },
  },
  run({ args }) {
    const config = loadConfig()
    if (!config.keys[args.label]) {
      consola.error(`No API key found with label "${args.label}"`)
      return
    }
    delete config.keys[args.label]
    if (config.activeKey === args.label) {
      const keys = Object.keys(config.keys)
      config.activeKey = keys.length > 0 ? keys[0] : undefined
    }
    saveConfig(config)
    consola.success(`Removed API key with label "${args.label}"`)
  },
})

const activateCommand = defineCommand({
  meta: {
    name: "activate",
    description: "Switch the active API key",
  },
  args: {
    label: {
      type: "string",
      alias: "l",
      description: "Label of the key to activate",
      required: true,
    },
  },
  run({ args }) {
    const config = loadConfig()
    if (!config.keys[args.label]) {
      consola.error(`No API key found with label "${args.label}"`)
      return
    }
    config.activeKey = args.label
    saveConfig(config)
    consola.success(`Activated API key with label "${args.label}"`)
  },
})

export default defineCommand({
  meta: {
    name: "keys",
    description: "Manage API keys",
  },
  subCommands: {
    add: addCommand,
    list: listCommand,
    remove: removeCommand,
    activate: activateCommand,
  },
})
