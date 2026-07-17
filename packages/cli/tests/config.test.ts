import { describe, it, expect, vi, beforeEach } from "vitest"
import { loadConfig } from "../src/utils/config"
import fs from "fs"

vi.mock("fs")

describe("CLI Config", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it("should return default config if file doesn't exist", () => {
    vi.spyOn(fs, "existsSync").mockReturnValue(false)
    const config = loadConfig()
    expect(config.baseUrl).toBe("http://localhost:3100")
    expect(config.keys).toEqual({})
  })
})
