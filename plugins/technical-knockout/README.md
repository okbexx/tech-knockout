# Technical Knockout Codex Plugin

Technical Knockout packages TK reports, comparisons, source-cache workflows,
and architecture decision methodology as an agent-native Codex plugin.

The plugin contains:

- Skills that teach Codex how to use TK evidence.
- A Commander.js-based `tk` CLI for catalog, source, and doctor operations.
- A read-mostly MCP server, built on the official MCP SDK, for structured
  report, catalog, and source-cache access.

Install it from the TK repository root:

```bash
npm --prefix plugins/technical-knockout ci
npm --prefix plugins/technical-knockout run verify
codex plugin marketplace add "$(pwd)"
codex plugin add technical-knockout@tech-knockout
```

See the full user guide at
[`docs/install-codex-plugin.md`](../../docs/install-codex-plugin.md).

Run the CLI from the plugin directory or from the TK repository:

```bash
node plugins/technical-knockout/bin/tk.mjs doctor
node plugins/technical-knockout/bin/tk.mjs search "coding agent runtime" --json
node plugins/technical-knockout/bin/tk.mjs source path gitnexus --json
npm --prefix plugins/technical-knockout run verify
npm --prefix plugins/technical-knockout run mcp:smoke
```
