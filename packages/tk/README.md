# @jarl_okbe/tk

Technical Knockout CLI and MCP server for capability replication.

TK helps agents turn open-source architecture evidence into a current-project
replication brief: what capability to preserve, what to adapt, what not to
copy, which infrastructure to reuse, and how to verify the result.

## Install

Run without installing:

```bash
npx @jarl_okbe/tk doctor
npx @jarl_okbe/tk replicate "agent internet capability layer" --from agent-reach
npx @jarl_okbe/tk search "coding agent runtime" --json
npx @jarl_okbe/tk source sync --missing
```

Or install globally:

```bash
npm install --global @jarl_okbe/tk
tk doctor
tk replicate "agent internet capability layer" --from agent-reach
```

## Codex Plugin

Install the Technical Knockout Codex plugin:

```bash
npx @jarl_okbe/tk codex install
```

This registers the GitHub marketplace and installs
`technical-knockout@tech-knockout`.

Value proof examples:
https://github.com/okbexx/tech-knockout/blob/main/docs/value-proof.md

## Development

From the repository root:

```bash
npm install
npm run verify
npm run publish:tk -- --dry-run
```

Publish the npm package from the workspace root:

```bash
npm publish --workspace @jarl_okbe/tk --access public
```

The Codex plugin adapter lives in `plugins/technical-knockout`; this package is
the runtime used by that adapter.
