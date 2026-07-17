import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs"
import { join } from "path"
import { homedir } from "os"
import { AegnticClient } from "@aegntic/sdk"

const CONFIG_DIR = join(homedir(), ".aegntic")
const CONFIG_FILE = join(CONFIG_DIR, "config.json")

export interface CliConfig {
  baseUrl: string
  activeKey?: string
  keys: Record<string, string>
}

const DEFAULT_CONFIG: CliConfig = {
  baseUrl: "http://localhost:3100",
  keys: {},
}

export function loadConfig(): CliConfig {
  if (!existsSync(CONFIG_FILE)) {
    return DEFAULT_CONFIG
  }
  try {
    const data = readFileSync(CONFIG_FILE, "utf-8")
    return { ...DEFAULT_CONFIG, ...JSON.parse(data) }
  } catch (error) {
    return DEFAULT_CONFIG
  }
}

export function saveConfig(config: CliConfig) {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true })
  }
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8")
}

export function getClient(): AegnticClient {
  const config = loadConfig()
  const activeLabel = config.activeKey || "main"
  const apiKey = config.keys[activeLabel]

  if (!apiKey) {
    throw new Error(
      `No API key configured for active label "${activeLabel}". Run 'aegntic keys add -k <key> -l ${activeLabel}' first.`
    )
  }

  return new AegnticClient({
    baseUrl: config.baseUrl,
    apiKey,
  })
}
