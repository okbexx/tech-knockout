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
  const context = await client.callTool({
    name: 'tk_get_project_context',
    arguments: { project: 'gitnexus' },
  });
  const brief = await client.callTool({
    name: 'tk_build_replication_brief',
    arguments: { capability: 'agent internet capability layer', from: 'agent-reach' },
  });
  const hasContext = Boolean(context.content?.[0]?.text?.includes('sourceDir'));
  const hasBrief = Boolean(brief.content?.[0]?.text?.includes('agent-reach'));
  if (tools.tools.length < 1 || !hasContext || !hasBrief) {
    throw new Error('MCP smoke check did not return expected tools/context.');
  }
  console.log(`ok mcp tools=${tools.tools.length}`);
} finally {
  await client.close();
}
