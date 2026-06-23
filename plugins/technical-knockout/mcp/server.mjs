#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import * as z from 'zod/v4';
import {
  doctor,
  findProject,
  loadCatalog,
  projectContext,
  readComparison,
  readReport,
  searchCatalog,
  sourceStatus,
  syncPlan,
} from '../lib/tk-core.mjs';

const server = new McpServer(
  {
    name: 'technical-knockout',
    version: '0.1.0',
  },
  {
    instructions:
      'Use Technical Knockout as an architecture reference system. Prefer read-only discovery tools first; use the tk CLI for source sync and validation side effects.',
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
  'tk_doctor',
  {
    title: 'Run TK Doctor',
    description:
      'Run read-only TK doctor checks for catalog validity, source-cache presence, and dirty nested source repositories.',
    inputSchema: z.object({}),
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  async () => textContent(await doctor()),
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error('Fatal error in TK MCP server:', error);
  process.exit(1);
});
