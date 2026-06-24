# Technical Knockout Codex Plugin

Technical Knockout packages TK reports, comparisons, source-cache workflows,
and architecture decision methodology as an agent-native Codex plugin.

The plugin contains:

- Skills that teach Codex how to use TK evidence.
- A Commander.js-based `tk` CLI for catalog, source, and doctor operations.
- A read-mostly MCP server, built on the official MCP SDK, for structured
  report, catalog, and source-cache access.

Install it as a user-facing npm CLI:

```bash
npx @okbexx/tk codex install
npx @okbexx/tk doctor
```

Install it from a local TK repository checkout for development:

```bash
npm --prefix plugins/technical-knockout ci
npm --prefix plugins/technical-knockout run verify
node plugins/technical-knockout/bin/tk.mjs codex install --source "$(pwd)"
```

See the full user guide at
[`docs/install-codex-plugin.md`](../../docs/install-codex-plugin.md).

Run the CLI from the plugin directory or from the TK repository:

```bash
tk doctor
tk doctor --require-sources
tk search "coding agent runtime" --json
tk source path gitnexus --json
npm --prefix plugins/technical-knockout run verify
npm --prefix plugins/technical-knockout run mcp:smoke
```
