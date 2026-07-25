import { defineCommand } from "citty"
import { fileURLToPath } from "node:url"
import { dirname, join } from "pathe"
import { existsSync } from "node:fs"
import { execFile } from "node:child_process"
import { promisify } from "node:util"
import consola from "consola"

const execFileAsync = promisify(execFile)

// ponytail: repo root is walk-up dependent (src vs dist), so find it by marker
// rather than counting levels. Falls back to cwd if the marker is missing.
function findRepoRoot(from: string): string {
  let dir = from
  for (let i = 0; i < 8; i++) {
    if (existsSync(join(dir, "tools", "skill-eval", "scripts", "evaluate_skill.py"))) return dir
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  return process.cwd()
}

const REPO_ROOT = findRepoRoot(dirname(fileURLToPath(import.meta.url)))
const EVAL_SCRIPT = join(REPO_ROOT, "tools", "skill-eval", "scripts", "evaluate_skill.py")

const evalCmd = defineCommand({
  meta: { name: "eval", description: "Score a skill directory against the elite rubric" },
  args: {
    dir: {
      type: "positional",
      description: "Path to the skill directory (default: repo ./namespace-intelligence)",
      required: false,
    },
    output: { type: "string", alias: "o", description: "Write JSON report to this path" },
    json: { type: "boolean", alias: "j", description: "Print raw JSON instead of human report" },
  },
  async run({ args }) {
    const target = args.dir
      ? args.dir
      : join(REPO_ROOT, "namespace-intelligence")

    if (!existsSync(EVAL_SCRIPT)) {
      consola.error(`Evaluator not found at ${EVAL_SCRIPT}. Expected tools/skill-eval.`)
      process.exit(1)
    }

    const pyArgs = [EVAL_SCRIPT, target]
    if (args.output) pyArgs.push("-o", args.output)
    if (args.json) pyArgs.push("--json")

    try {
      const { stdout } = await execFileAsync("python3", pyArgs, { cwd: REPO_ROOT })
      process.stdout.write(stdout)
    } catch (error: any) {
      consola.error(error.message || "Evaluation failed")
      if (error.stdout) process.stdout.write(error.stdout)
      process.exit(1)
    }
  },
})

const listCmd = defineCommand({
  meta: { name: "list", description: "List skills bundled in this repo" },
  async run() {
    const names = ["namespace-intelligence"]
    if (!names.length) {
      consola.info("No bundled skills.")
      return
    }
    consola.info(`Bundled skills (${names.length}):`)
    for (const n of names) {
      const has = existsSync(join(REPO_ROOT, n, "SKILL.md"))
      console.log(`   ${has ? "✓" : "✗"} ${n}`)
    }
  },
})

export default defineCommand({
  meta: {
    name: "skills",
    description: "Evaluate and manage Agent Skills bundled in this repo",
  },
  subCommands: {
    eval: () => Promise.resolve(evalCmd),
    list: () => Promise.resolve(listCmd),
  },
})
