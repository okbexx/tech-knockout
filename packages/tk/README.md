# @jarl_okbe/tk

Technical Knockout helps Codex replicate open-source capabilities with evidence.

Use it when you want Codex to build something like a proven project without
copying the wrong code, architecture ceremony, or infrastructure.

## Start

Install TK into Codex and check that it is ready:

```bash
npx @jarl_okbe/tk codex install
npx @jarl_okbe/tk codex status
```

Then ask Codex from your project:

```text
Use Technical Knockout to replicate Agent Reach's internet capability layer in this repo.
```

If Codex needs the original reference code, ask:

```text
Use Technical Knockout to clone the missing reference repositories.
```

For a reference-only brief:

```bash
npx @jarl_okbe/tk replicate "agent internet capability layer" --from agent-reach
```

TK should help Codex answer what to keep, what to adapt, what not to copy, the
first implementation boundary, and how to verify it.

## CLI

```bash
npx @jarl_okbe/tk doctor
npx @jarl_okbe/tk search "coding agent runtime"
npx @jarl_okbe/tk deps agent-reach
npx @jarl_okbe/tk source status
npx @jarl_okbe/tk source sync --missing
```

Examples:
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
