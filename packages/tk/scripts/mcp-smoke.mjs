#!/usr/bin/env node
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const client = new Client({ name: 'tk-smoke', version: '0.1.0' }, { capabilities: {} });
const transport = new StdioClientTransport({
  command: process.execPath,
  args: ['./mcp/server.mjs'],
  cwd: process.cwd(),
  stderr: 'pipe',
});

try {
  await client.connect(transport);
  const tools = await client.listTools();
  const toolByName = new Map(tools.tools.map((tool) => [tool.name, tool]));
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
  const runs = await client.callTool({
    name: 'tk_list_runs',
    arguments: { limit: 5 },
  });
  const hasSearch = Boolean(search.content?.[0]?.text?.includes('agent-reach'));
  const hasDependencyEvidence = Boolean(dependencyEvidence.content?.[0]?.text?.includes('dependencyEvidence'));
  const briefTool = toolByName.get('tk_build_replication_brief');
  const planTool = toolByName.get('tk_plan_replication');
  const verifyTool = toolByName.get('tk_verify_replication');
  const hasHonestToolAnnotations =
    briefTool?.annotations?.readOnlyHint === true &&
    planTool?.annotations?.readOnlyHint === false &&
    verifyTool?.annotations?.readOnlyHint === false;
  const hasContext = Boolean(context.content?.[0]?.text?.includes('sourceDir'));
  const hasRepoDoctor = Boolean(doctorRepo.content?.[0]?.text?.includes('replication_schemas_available'));
  const hasRuntimeDoctor = Boolean(doctorRuntime.content?.[0]?.text?.includes('run_artifact_root_writable'));
  const hasPlan = Boolean(planPayload.plan?.verificationContract);
  const hasVerify = Boolean(verify.content?.[0]?.text?.includes('contractId'));
  const hasRuns = Boolean(runs.content?.[0]?.text?.includes('run_'));
  if (
    tools.tools.length < 1 ||
    !hasSearch ||
    !hasDependencyEvidence ||
    !hasHonestToolAnnotations ||
    !hasContext ||
    !hasRepoDoctor ||
    !hasRuntimeDoctor ||
    !hasPlan ||
    !hasVerify ||
    !hasRuns
  ) {
    throw new Error('MCP smoke check did not return the expected discovery, context, or replication contracts.');
  }
  console.log(`ok mcp tools=${tools.tools.length}`);
} finally {
  await client.close();
}
