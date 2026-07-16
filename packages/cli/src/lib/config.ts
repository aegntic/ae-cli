import { readFile, writeFile, mkdir } from "node:fs/promises"
import { homedir } from "node:os"
import { join } from "pathe"

export interface Config {
  baseUrl: string
  apiKey: string
}

const DEFAULT_BASE_URL = "https://api.aegntic.ai"

function configPath(): string {
  return join(homedir(), ".aegntic", "config.json")
}

export async function getConfig(): Promise<Config> {
  let fileConfig: Partial<Config> = {}

  try {
    const raw = await readFile(configPath(), "utf-8")
    fileConfig = JSON.parse(raw)
  } catch {
  }

  return {
    baseUrl:
      process.env.AEGNTIC_BASE_URL ||
      fileConfig.baseUrl ||
      DEFAULT_BASE_URL,
    apiKey:
      process.env.AEGNTIC_API_KEY ||
      fileConfig.apiKey ||
      "",
  }
}

export async function saveConfig(config: Partial<Config>): Promise<void> {
  const path = configPath()
  let existing: Record<string, unknown> = {}

  try {
    const raw = await readFile(path, "utf-8")
    existing = JSON.parse(raw)
  } catch {
    await mkdir(join(homedir(), ".aegntic"), { recursive: true })
  }

  const merged = { ...existing, ...config }
  await writeFile(path, JSON.stringify(merged, null, 2), "utf-8")
}
