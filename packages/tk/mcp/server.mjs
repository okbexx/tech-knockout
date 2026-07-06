#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import * as z from 'zod/v4';
import {
  buildReplicationBrief,
  doctor,
  findProject,
  getRunTrace,
  listRuns,
  loadCatalog,
  planReplication,
  projectContext,
  readComparison,
  readReport,
  searchCatalog,
  sourceStatus,
  syncPlan,
  verifyReplication,
} from '../lib/tk-core.mjs';

const server = new McpServer(
  {
    name: 'technical-knockout',
    version: '0.1.0',
  },
  {
    instructions:
      'Use Technical Knockout as a capability replication system. Prefer read-only discovery and replication brief tools first; use the tk CLI for source sync and validation side effects.',
  },
);

function textContent(value) {
  const text = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
  return { content: [{ type: 'text', text }] };
}

server.registerTool(
  'tk_list_projects',
  {
    title: 'List TK Projects',
    description:
      'List Technical Knockout projects from the structured catalog. Use this before project-specific TK queries when the target project is unclear.',
    inputSchema: z.object({
      category: z.string().optional().describe('Optional category substring filter.'),
    }),
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  async ({ category }) => {
    const catalog = loadCatalog();
    const projects = category
      ? catalog.projects.filter((project) => project.category?.toLowerCase().includes(category.toLowerCase()))
      : catalog.projects;
    return textContent({ projects });
  },
);

server.registerTool(
  'tk_search_reports',
  {
    title: 'Search TK Reports',
    description:
      'Search TK reports and catalog metadata for architecture, tool, library, or build-vs-buy references. Returns structured project records.',
    inputSchema: z.object({
      query: z.string().describe('Natural language or keyword query.'),
      limit: z.number().int().positive().max(100).default(10).describe('Maximum results to return.'),
    }),
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  async ({ query, limit }) => textContent({ query, results: searchCatalog(query).slice(0, limit) }),
);

server.registerTool(
  'tk_get_report',
  {
    title: 'Get TK Report',
    description:
      'Read one TK report by project id, report file name, display name, or owner/repo. Use for human-readable evidence and conclusions.',
    inputSchema: z.object({
      project: z.string().describe('Project id, report file, display name, or owner/repo.'),
    }),
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  async ({ project: identifier }) => {
    const project = findProject(identifier);
    if (!project) throw new Error(`Project not found: ${identifier}`);
    return textContent({ project, report: readReport(project) });
  },
);

server.registerTool(
  'tk_get_comparison',
  {
    title: 'Get TK Comparison',
    description:
      'Read a TK comparison document such as coding-agents, code-intelligence, agent-platforms, ai-coding-workflow, or enterprise-knowledge-base-rag.',
    inputSchema: z.object({
      id: z.string().describe('Comparison id without .md extension.'),
    }),
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  async ({ id }) => {
    const text = readComparison(id);
    if (!text) throw new Error(`Comparison not found: ${id}`);
    return textContent({ id, text });
  },
);

server.registerTool(
  'tk_get_project_context',
  {
    title: 'Get TK Project Context',
    description:
      'Return a compact structured context for a TK project, including catalog metadata and current-code source-cache path/status.',
    inputSchema: z.object({
      project: z.string().describe('Project id, report file, display name, or owner/repo.'),
    }),
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  async ({ project }) => {
    const context = await projectContext(project);
    if (!context) throw new Error(`Project not found: ${project}`);
    return textContent(context);
  },
);

server.registerTool(
  'tk_get_dependency_evidence',
  {
    title: 'Get TK Dependency Evidence',
    description:
      'Return direct dependencies, SDKs, manifest counts, and curated build-vs-buy evidence for one TK project. Use before deciding whether the current project should reuse a library instead of self-building.',
    inputSchema: z.object({
      project: z.string().describe('Project id, report file, display name, or owner/repo.'),
    }),
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  async ({ project: identifier }) => {
    const project = findProject(identifier);
    if (!project) throw new Error(`Project not found: ${identifier}`);
    return textContent({
      id: project.id,
      name: project.name,
      repo: project.repo,
      dependencySummary: project.dependencySummary,
      dependencyEvidence: project.dependencyEvidence,
      dependencies: project.dependencies,
    });
  },
);

server.registerTool(
  'tk_get_source_status',
  {
    title: 'Get TK Source Status',
    description:
      'Return local source-cache status for all TK projects. This is read-only and does not fetch or clone.',
    inputSchema: z.object({
      project: z.string().optional().describe('Optional project filter.'),
    }),
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  async ({ project: identifier }) => {
    const status = await sourceStatus();
    if (!identifier) return textContent(status);
    const project = findProject(identifier);
    if (!project) throw new Error(`Project not found: ${identifier}`);
    return textContent({
      generatedAt: status.generatedAt,
      sources: status.sources.filter((source) => source.id === project.id),
    });
  },
);

server.registerTool(
  'tk_sync_plan',
  {
    title: 'Get TK Sync Plan',
    description:
      'Return a source-cache sync plan for missing or selected TK projects. This is read-only and does not execute git commands.',
    inputSchema: z.object({
      project: z.string().optional().describe('Optional project id/report file to sync.'),
    }),
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  async ({ project }) => textContent(syncPlan({ only: project ? [project] : null })),
);

server.registerTool(
  'tk_build_replication_brief',
  {
    title: 'Build TK Replication Brief',
    description:
      'Build a capability replication brief from TK reports and source-cache status. Use when an agent needs to replicate a capability from reference projects into the current project.',
    inputSchema: z.object({
      capability: z.string().describe('Capability to replicate, such as "agent internet capability layer".'),
      from: z
        .string()
        .optional()
        .describe('Optional comma-separated TK project ids to force as references.'),
      limit: z.number().int().positive().max(10).default(5).describe('Maximum auto-discovered references.'),
    }),
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  async ({ capability, from, limit }) => textContent(await buildReplicationBrief(capability, { from, limit })),
);

server.registerTool(
  'tk_plan_replication',
  {
    title: 'Plan TK Replication',
    description:
      'Build a structured replication plan plus persisted run artifacts. Use when the agent wants machine-readable plan/kernel/slices instead of only markdown.',
    inputSchema: z.object({
      capability: z.string().describe('Capability to replicate.'),
      from: z.string().optional().describe('Optional comma-separated TK project ids to force as references.'),
      limit: z.number().int().positive().max(10).default(5).describe('Maximum auto-discovered references.'),
    }),
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  async ({ capability, from, limit }) => textContent(await planReplication(capability, { from, limit })),
);

server.registerTool(
  'tk_verify_replication',
  {
    title: 'Verify TK Replication',
    description:
      'Verify a structured replication plan by capability or persisted run id. Returns verification status plus updated run trace metadata.',
    inputSchema: z.object({
      target: z.string().describe('Capability text or run id.'),
      from: z.string().optional().describe('Optional comma-separated TK project ids to force as references when target is a capability.'),
      limit: z.number().int().positive().max(10).default(5).describe('Maximum auto-discovered references when target is a capability.'),
      run_id: z.string().optional().describe('Optional explicit run id to verify.'),
    }),
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  async ({ target, from, limit, run_id }) => textContent(await verifyReplication(target, { from, limit, runId: run_id })),
);

server.registerTool(
  'tk_get_run_trace',
  {
    title: 'Get TK Run Trace',
    description:
      'Read one persisted TK replication run, including trace, plan, references, and verification artifacts.',
    inputSchema: z.object({
      run_id: z.string().describe('Run id such as run_20260706T123456_abcd12.'),
    }),
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  async ({ run_id }) => {
    const run = getRunTrace(run_id);
    if (!run) throw new Error(`Run not found: ${run_id}`);
    return textContent(run);
  },
);

server.registerTool(
  'tk_list_runs',
  {
    title: 'List TK Runs',
    description: 'List recent persisted TK replication runs.',
    inputSchema: z.object({
      limit: z.number().int().positive().max(100).default(20).describe('Maximum runs to return.'),
    }),
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  async ({ limit }) => textContent(listRuns({ limit })),
);

server.registerTool(
  'tk_doctor',
  {
    title: 'Run TK Doctor',
    description:
      'Run read-only TK doctor checks for repo assets, catalog validity, runtime artifact roots, source-cache presence, and dirty nested source repositories.',
    inputSchema: z.object({
      scope: z.enum(['all', 'repo', 'runtime']).default('all').describe('Doctor scope to inspect.'),
      require_sources: z.boolean().optional().describe('When true, runtime doctor fails if source caches are missing.'),
    }),
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  async ({ scope, require_sources }) => textContent(await doctor({ scope, requireSources: require_sources })),
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error('Fatal error in TK MCP server:', error);
  process.exit(1);
});
