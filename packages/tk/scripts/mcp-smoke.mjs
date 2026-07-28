#!/usr/bin/env node
import assert from 'node:assert/strict';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { validateReplicationPlan, validateRunTrace, validateVerificationResult } from '../lib/tk-core.mjs';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const expectedToolAnnotations = {
  tk_list_projects: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  tk_search_reports: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  tk_get_report: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  tk_get_comparison: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  tk_get_project_context: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  tk_get_dependency_evidence: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  tk_get_source_status: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  tk_sync_plan: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  tk_build_replication_brief: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  tk_plan_replication: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
  tk_verify_replication: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
  tk_get_run_trace: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  tk_list_runs: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  tk_doctor: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
};

function assertToolContracts(toolByName) {
  for (const [name, annotations] of Object.entries(expectedToolAnnotations)) {
    const tool = toolByName.get(name);
    if (!tool) throw new Error(`MCP smoke check missing required tool: ${name}`);
    assert.deepEqual(tool.annotations, annotations, `MCP tool ${name} annotations do not match its read/write contract`);
  }
}

const runtimeDataDir = mkdtempSync(join(tmpdir(), 'tk-mcp-smoke-'));

const client = new Client({ name: 'tk-smoke', version: '0.1.0' }, { capabilities: {} });
const transport = new StdioClientTransport({
  command: process.execPath,
  args: ['./mcp/server.mjs'],
  cwd: process.cwd(),
  stderr: 'pipe',
  env: { ...process.env, TK_RUNTIME_DATA_ROOT: runtimeDataDir },
});

try {
  await client.connect(transport);
  const tools = await client.listTools();
  const toolByName = new Map(tools.tools.map((tool) => [tool.name, tool]));
  assertToolContracts(toolByName);
  const search = await client.callTool({
    name: 'tk_search_reports',
    arguments: { query: 'agent internet capability', limit: 5 },
  });
  const dependencyEvidence = await client.callTool({
    name: 'tk_get_dependency_evidence',
    arguments: { project: 'agent-reach' },
  });
  const context = await client.callTool({
    name: 'tk_get_project_context',
    arguments: { project: 'codegraph' },
  });
  const doctorRepo = await client.callTool({
    name: 'tk_doctor',
    arguments: { scope: 'repo' },
  });
  const doctorRuntime = await client.callTool({
    name: 'tk_doctor',
    arguments: { scope: 'runtime' },
  });
  const plan = await client.callTool({
    name: 'tk_plan_replication',
    arguments: { capability: 'agent internet capability layer', from: 'agent-reach' },
  });
  const planPayload = JSON.parse(plan.content?.[0]?.text || '{}');
  const verify = await client.callTool({
    name: 'tk_verify_replication',
    arguments: { target: planPayload.run?.runId || 'agent internet capability layer', run_id: planPayload.run?.runId },
  });
  const verifyPayload = JSON.parse(verify.content?.[0]?.text || '{}');
  const trace = await client.callTool({
    name: 'tk_get_run_trace',
    arguments: { run_id: planPayload.run?.runId },
  });
  const tracePayload = JSON.parse(trace.content?.[0]?.text || '{}');
  const runs = await client.callTool({
    name: 'tk_list_runs',
    arguments: { limit: 5 },
  });
  const runsPayload = JSON.parse(runs.content?.[0]?.text || '{}');
  const hasSearch = Boolean(search.content?.[0]?.text?.includes('agent-reach'));
  const hasDependencyEvidence = Boolean(dependencyEvidence.content?.[0]?.text?.includes('dependencyEvidence'));
  const hasContext = Boolean(context.content?.[0]?.text?.includes('sourceDir'));
  const hasRepoDoctor = Boolean(doctorRepo.content?.[0]?.text?.includes('replication_schemas_available'));
  const hasRuntimeDoctor = Boolean(doctorRuntime.content?.[0]?.text?.includes('run_artifact_root_writable'));
  const runId = planPayload.run?.runId;
  const contractId = planPayload.plan?.verificationContract;
  const listedRun = runsPayload.runs?.find((run) => run.runId === runId);
  assert.equal(validateReplicationPlan(planPayload.plan).ok, true, 'MCP plan response violates replication plan schema');
  assert.equal(validateVerificationResult(verifyPayload).ok, true, 'MCP verification response violates verification result schema');
  assert.equal(validateRunTrace(tracePayload.trace).ok, true, 'MCP trace response violates run trace schema');
  const hasLinkedRun = Boolean(
    runId &&
    contractId &&
    verifyPayload.runId === runId &&
    verifyPayload.contractId === contractId &&
    tracePayload.runId === runId &&
    tracePayload.plan?.verificationContract === contractId &&
    tracePayload.verification?.runId === runId &&
    tracePayload.verification?.contractId === contractId &&
    tracePayload.trace?.runId === runId &&
    listedRun?.result === verifyPayload.status
  );
  if (
    !hasSearch ||
    !hasDependencyEvidence ||
    !hasContext ||
    !hasRepoDoctor ||
    !hasRuntimeDoctor ||
    !hasLinkedRun
  ) {
    throw new Error('MCP smoke check did not return linked discovery, context, plan, verification, trace, and run-list contracts.');
  }
  console.log(`ok mcp tools=${tools.tools.length}`);
} finally {
  await client.close();
  rmSync(runtimeDataDir, { recursive: true, force: true });
}
