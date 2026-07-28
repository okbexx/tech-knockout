# Technical Knockout Codex Plugin

This directory is the Codex plugin adapter for Technical Knockout.

TK is an agent-native curated technical-research and capability replication
system: Codex can use TK reports, comparisons, source-cache status, CLI
commands, MCP tools, and Skills to analyze a maintainer-selected project set
and turn relevant evidence into a current-project decision or replication brief.

It contains:

- `.codex-plugin/plugin.json` for Codex marketplace metadata.
- `skills/` for agent routing, capability replication, and TK evidence
  workflows.
- `.mcp.json` that starts the TK MCP server through
  `npx --yes --package @jarl_okbe/tk tk-mcp-server`.

The npm package is the primary CLI and MCP implementation and lives in
`packages/tk`. Keep this directory as the Codex adapter; do not add a second
package runtime here.

OpenCode and Hermes adapters are installed by the same npm package and load the
package-owned canonical Skills directly; they do not add host-specific runtime
copies under this directory.

Install the user-facing package and Codex plugin with:

```bash
npx @jarl_okbe/tk codex install
npx @jarl_okbe/tk doctor
npx @jarl_okbe/tk replicate "agent internet capability layer" --from agent-reach
```

For local development from the repository root:

```bash
npm install
npm run verify
npm run publish:tk -- --dry-run
```

See the shared adapter guide at
[`docs/install-agent-adapters.md`](../../docs/install-agent-adapters.md) and the
Codex-specific guide at
[`docs/install-codex-plugin.md`](../../docs/install-codex-plugin.md).
