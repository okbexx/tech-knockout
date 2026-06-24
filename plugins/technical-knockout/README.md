# Technical Knockout Codex Plugin

This directory is the Codex plugin adapter for Technical Knockout.

It contains:

- `.codex-plugin/plugin.json` for Codex marketplace metadata.
- `skills/` for agent routing and TK evidence workflows.
- `.mcp.json` that starts the TK MCP server through
  `npx --yes --package @okbexx/tk tk-mcp-server`.

The npm package is the primary CLI and MCP implementation and lives in
`packages/tk`. Keep this directory as the Codex adapter; do not add a second
package runtime here.

Install the user-facing package and Codex plugin with:

```bash
npx @okbexx/tk codex install
npx @okbexx/tk doctor
```

For local development from the repository root:

```bash
npm install
npm run verify
npm run publish:tk -- --dry-run
```

See the full user guide at
[`docs/install-codex-plugin.md`](../../docs/install-codex-plugin.md).
