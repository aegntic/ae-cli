import { sql } from "drizzle-orm"
import { db } from "./client.js"
import * as schema from "./schema.js"
import { pathToFileURL } from "node:url"

/**
 * Seed the tools catalog with cldcde external skills.
 * These are external skills (kind=external) that aedex can discover and route to.
 * They are not native adapters but external skills that can be invoked via the catalog.
 */

const CldcdeSkills = [
  {
    id: "ae-ltd-claude-template-switchboard",
    provider: "cldcde",
    path: "claude-template-switchboard",
    description: "Switch between Claude Code templates and scaffolding patterns for different project types. Manages template selection, customization, and project initialization workflows.",
    inputSchema: {
      queryParams: {
        template: { type: "string", description: "Template name or category", required: false },
        list: { type: "boolean", description: "List available templates", required: false, default: false },
        init: { type: "boolean", description: "Initialize selected template", required: false, default: false },
      },
    },
    costModel: { type: "per_call", unitPrice: 0.001, currency: "USD" },
    verified: true,
    tags: ["template", "scaffolding", "claude-code", "project-init"],
    kind: "external",
  },
  {
    id: "ae-ltd-context7-radar",
    provider: "cldcde",
    path: "context7-radar",
    description: "Query Context7 for up-to-date library documentation, version info, and API references. Returns structured docs with version-aware code examples.",
    inputSchema: {
      queryParams: {
        library: { type: "string", description: "Library name (e.g., 'react', 'next.js', 'zod')", required: true },
        topic: { type: "string", description: "Specific topic or API to search", required: false },
        version: { type: "string", description: "Specific version to query", required: false },
      },
    },
    costModel: { type: "per_call", unitPrice: 0.0005, currency: "USD" },
    verified: true,
    tags: ["documentation", "context7", "library-docs", "api-reference"],
    kind: "external",
  },
  {
    id: "ae-ltd-mcp-foundry",
    provider: "cldcde",
    path: "mcp-foundry",
    description: "Scaffold and harden MCP (Model Context Protocol) servers with strict contracts and validation. Generates TypeScript/Python MCP servers with Zod/Pydantic validation, tool schemas, and transport wiring.",
    inputSchema: {
      queryParams: {
        action: { type: "string", description: "Action: scaffold|extend|validate", required: true },
        language: { type: "string", description: "typescript|python", required: false, default: "typescript" },
        transport: { type: "string", description: "stdio|sse", required: false, default: "stdio" },
        name: { type: "string", description: "Server name", required: false },
        tools: { type: "string", description: "Comma-separated tool names to scaffold", required: false },
      },
    },
    costModel: { type: "per_call", unitPrice: 0.002, currency: "USD" },
    verified: true,
    tags: ["mcp", "server", "scaffolding", "mcp-foundry", "protocol"],
    kind: "external",
  },
  {
    id: "ae-ltd-mutation-gate",
    provider: "cldcde",
    path: "mutation-gate",
    description: "Enforces safe mutation patterns for agent workflows. Validates and gates state-changing operations with approval gates, dry-run simulation, and rollback hooks.",
    inputSchema: {
      queryParams: {
        operation: { type: "string", description: "Operation to gate: create|update|delete|deploy", required: true },
        payload: { type: "string", description: "JSON payload of the mutation", required: true },
        dryRun: { type: "boolean", description: "Simulate without executing", required: false, default: true },
        approve: { type: "boolean", description: "Auto-approve if checks pass", required: false, default: false },
      },
    },
    costModel: { type: "per_call", unitPrice: 0.001, currency: "USD" },
    verified: true,
    tags: ["mutation", "safety", "gate", "validation", "approval"],
    kind: "external",
  },
  {
    id: "ae-ltd-n8n-orbit",
    provider: "cldcde",
    path: "n8n-orbit",
    description: "Orchestrate n8n workflows as callable tools. Deploy, trigger, monitor, and debug n8n workflows as first-class aedex endpoints with typed inputs/outputs.",
    inputSchema: {
      queryParams: {
        workflow: { type: "string", description: "Workflow name or ID", required: true },
        action: { type: "string", description: "deploy|trigger|status|logs|delete", required: true },
        input: { type: "string", description: "JSON input for workflow trigger", required: false },
      },
    },
    costModel: { type: "per_call", unitPrice: 0.002, currency: "USD" },
    verified: true,
    tags: ["n8n", "workflow", "automation", "orchestration"],
    kind: "external",
  },
  {
    id: "ae-ltd-skill-builder",
    provider: "cldcde",
    path: "skill-builder",
    description: "Scaffold new AE.LTD skills from templates. Generates SKILL.md, SKILL.toml, prompt files, and test scaffolding from a prompt or schema.",
    inputSchema: {
      queryParams: {
        name: { type: "string", description: "Skill name (kebab-case)", required: true },
        description: { type: "string", description: "One-line skill description", required: true },
        template: { type: "string", description: "Template: basic|mcp|workflow|prompt", required: false, default: "basic" },
      },
    },
    costModel: { type: "per_call", unitPrice: 0.001, currency: "USD" },
    verified: true,
    tags: ["skill", "scaffolding", "builder", "template"],
    kind: "external",
  },
  {
    id: "ae-ltd-visual-regression-forge",
    provider: "cldcde",
    path: "visual-regression-forge",
    description: "Generate and run visual regression tests for UI components. Captures baselines, diffs against PR changes, and reports visual deltas with pixel-level precision.",
    inputSchema: {
      queryParams: {
        action: { type: "string", description: "capture|compare|update|report", required: true },
        component: { type: "string", description: "Component path or selector", required: false },
        threshold: { type: "number", description: "Pixel difference threshold (0-1)", required: false, default: 0.01 },
      },
    },
    costModel: { type: "per_call", unitPrice: 0.005, currency: "USD" },
    verified: true,
    tags: ["visual-regression", "testing", "ui", "diff", "screenshot"],
    kind: "external",
  },
  {
    id: "ae-ltd-worktree-mesh",
    provider: "cldcde",
    path: "worktree-mesh",
    description: "Manage git worktree meshes for parallel agent development. Create, sync, and merge isolated worktrees with automatic conflict detection and dependency tracking.",
    inputSchema: {
      queryParams: {
        action: { type: "string", description: "create|sync|merge|list|prune", required: true },
        branch: { type: "string", description: "Branch name", required: false },
        base: { type: "string", description: "Base branch", required: false, default: "main" },
        agents: { type: "string", description: "Comma-separated agent names", required: false },
      },
    },
    costModel: { type: "per_call", unitPrice: 0.001, currency: "USD" },
    verified: true,
    tags: ["git", "worktree", "parallel", "mesh", "parallel-dev"],
    kind: "external",
  },
]

export async function seedCldcdeSkills(): Promise<{ inserted: number; updated: number }> {
  let inserted = 0
  let updated = 0

  for (const skill of CldcdeSkills) {
    const existing = await db
      .select()
      .from(schema.tools)
      .where(sql`${schema.tools.id} = ${skill.id}`)
      .limit(1)

    if (existing.length > 0) {
      await db
        .update(schema.tools)
        .set({
          provider: skill.provider,
          path: skill.path,
          description: skill.description,
          inputSchema: skill.inputSchema,
          costModel: skill.costModel,
          verified: skill.verified,
          tags: skill.tags,
          kind: skill.kind,
          updatedAt: new Date(),
        })
        .where(sql`${schema.tools.id} = ${skill.id}`)
      updated++
    } else {
      await db.insert(schema.tools).values({
        id: skill.id,
        provider: skill.provider,
        path: skill.path,
        description: skill.description,
        inputSchema: skill.inputSchema,
        costModel: skill.costModel,
        verified: skill.verified,
        tags: skill.tags,
        kind: skill.kind,
      })
      inserted++
    }
  }

  return { inserted, updated }
}

// CLI runner: `pnpm --filter @aegntic/gateway db:seed-cldcde`
if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  try {
    const result = await seedCldcdeSkills()
    console.log(`[seed-cldcde] inserted: ${result.inserted}, updated: ${result.updated}`)
    process.exit(0)
  } catch (error) {
    console.error("[seed-cldcde] failed:", error)
    process.exit(1)
  }
}