# Technical Knockout Native Agent Plugin

This directory is the shared native plugin adapter for Codex and Claude Code.

TK is an agent-native curated technical-research and capability replication
system: Codex and Claude Code can use TK reports, comparisons, source-cache
status, CLI commands, MCP tools, and Skills to analyze a maintainer-selected
project set and turn relevant evidence into a current-project decision or
replication brief.

It contains:

- `.codex-plugin/plugin.json` for Codex marketplace metadata.
- `.claude-plugin/plugin.json` for Claude Code plugin metadata; the
  repository-level `.claude-plugin/marketplace.json` publishes the marketplace.
- `skills/` for agent routing, capability replication, and TK evidence
  workflows.
- `.mcp.json` that starts the TK MCP server through
  `npx --yes --package @jarl_okbe/tk tk-mcp-server`.

The npm package is the primary CLI and MCP implementation and lives in
`packages/tk`. Keep this directory as the shared Codex and Claude Code native
adapter; do not add a second package runtime here. Both hosts discover the
adapter's root `skills/` and `.mcp.json` through their native plugin mechanisms.

OpenCode and Hermes adapters are installed by the same npm package and load the
package-owned canonical Skills directly; they do not add host-specific runtime
copies under this directory.

Install the user-facing package and the native plugin for your host with:

```bash
npx @jarl_okbe/tk codex install
npx @jarl_okbe/tk codex status

# Or, for Claude Code:
npx @jarl_okbe/tk claude install
npx @jarl_okbe/tk claude status
npx @jarl_okbe/tk claude refresh
npx @jarl_okbe/tk claude remove

npx @jarl_okbe/tk doctor
npx @jarl_okbe/tk replicate "agent internet capability layer" --from agent-reach
```

Restart the host or start a new session after installation, refresh, or removal.
Claude removal uninstalls only the plugin and keeps the marketplace registered.
After refreshing Claude Code, `/reload-plugins` reloads the plugin and reconnects
MCP in the current session.

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
