# @okbexx/tk

Technical Knockout CLI and MCP server for architecture reference evidence.

## Install

Run without installing:

```bash
npx @okbexx/tk doctor
npx @okbexx/tk search "coding agent runtime" --json
npx @okbexx/tk source sync --missing
```

Or install globally:

```bash
npm install --global @okbexx/tk
tk doctor
```

## Codex Plugin

Install the Technical Knockout Codex plugin:

```bash
npx @okbexx/tk codex install
```

This registers the GitHub marketplace and installs
`technical-knockout@tech-knockout`.

## Development

From the repository root:

```bash
npm install
npm run verify
npm run publish:tk -- --dry-run
```

Publish the npm package from the workspace root:

```bash
npm publish --workspace @okbexx/tk --access public
```

The Codex plugin adapter lives in `plugins/technical-knockout`; this package is
the runtime used by that adapter.
