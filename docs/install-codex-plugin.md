# Install the Technical Knockout Codex Plugin

This guide is for users who want Codex to use TK before replicating a capability
from another project. After installation, Codex can ask TK what to keep, what to
adapt, what not to copy, where the first implementation boundary should be, and
how to verify it.

## Prerequisites

- Codex CLI or Codex app with plugin support.
- Node.js 22.12.0 or newer.
- npm.

## Install

Install TK into Codex:

```bash
npx @jarl_okbe/tk codex install
npx @jarl_okbe/tk codex status
```

`codex status` should show:

```text
ok codex_cli
ok marketplace_configured
ok plugin_installed
ready technical-knockout@tech-knockout
```

Restart Codex or start a new Codex thread after installation.

## Use TK

From the project where you want the capability, ask Codex:

```text
Use Technical Knockout to replicate Agent Reach's internet capability layer in this repo.
```

Codex should first produce a brief with:

```text
Current project fit
Reference projects
Must keep
Can adapt
Do not copy
Implementation boundary
Verification
```

For reference-only exploration, run:

```bash
npx @jarl_okbe/tk replicate "agent internet capability layer" --from agent-reach
```

Other useful checks:

```bash
npx @jarl_okbe/tk doctor
npx @jarl_okbe/tk search "coding agent runtime"
npx @jarl_okbe/tk source status
```

## Source Cache

`source sync --missing` clones source repositories referenced by TK reports.
When run inside a TK repository checkout, sources are cached under that
checkout's `projects/` directory. When run from the npm package, sources are
cached under the OS-specific user cache directory. Set `TK_SOURCE_ROOT` to
override the source cache root.

`source status --write-lock` writes local source-cache state to the TK checkout
when run from source, or to the OS-specific user data directory when run from
the npm package. Set `TK_RUNTIME_DATA_ROOT` to override that runtime data
directory.

To make `doctor` fail when source caches are missing, run:

```bash
npx @jarl_okbe/tk doctor --require-sources
```

## Install from source for development

Clone the TK repository when you want to develop reports, plugin code, Skills,
or MCP tools:

```bash
git clone https://github.com/okbexx/tech-knockout.git
cd tech-knockout
```

Install workspace dependencies from the repository root:

```bash
npm install
```

Run the package and plugin verification suite:

```bash
npm run verify
```

Register the TK repository as a Codex plugin marketplace:

```bash
npx @jarl_okbe/tk codex install --source "$(pwd)"
```

The underlying Codex commands are:

```bash
codex plugin marketplace add "$(pwd)"
codex plugin add technical-knockout@tech-knockout
```

## Advanced Verification

`tk codex status` is the normal readiness check. If you need to inspect the
raw Codex state, run:

```bash
codex plugin marketplace list
```

The output should include a marketplace named `tech-knockout` from the GitHub
repository, or from your local checkout when you installed with
`--source "$(pwd)"`.

Check that the plugin is installed:

```bash
codex plugin list | rg "technical-knockout|tech-knockout"
```

If `rg` is not installed, use:

```bash
codex plugin list | grep -E "technical-knockout|tech-knockout"
```

The plugin should appear as `technical-knockout@tech-knockout` with an
installed and enabled status.

A useful TK result changes the build decision: skip, reuse, buy, extract a
smaller kernel, or define a tighter implementation boundary. See
[`docs/value-proof.md`](./value-proof.md) for examples.

When developing from source before publishing, run the local CLI from the
workspace package:

```bash
node packages/tk/bin/tk.mjs doctor
node packages/tk/bin/tk.mjs replicate "agent internet capability layer" --from agent-reach
node packages/tk/bin/tk.mjs search "coding agent runtime" --json
node packages/tk/bin/tk.mjs source status --json
node packages/tk/bin/tk.mjs source sync --missing
node packages/tk/bin/tk.mjs source path gitnexus --json
```

`source sync --missing` clones source repositories referenced by TK reports.
From a repository checkout, the cache is `projects/` and is intentionally not
committed to Git. From the npm package, the cache is under the OS-specific user
cache directory.

## Update later

Pull the latest TK repository changes:

```bash
git pull --ff-only
npm install
npm run verify
```

If Codex does not pick up changed plugin metadata immediately, remove and
reinstall the local plugin:

```bash
npx @jarl_okbe/tk codex refresh
```

Start a new Codex thread after reinstalling so the refreshed plugin Skills and
MCP configuration are available to the agent.

## Troubleshooting

If `npx @jarl_okbe/tk codex install` cannot find the plugin, run
`codex plugin marketplace list` and confirm that `tech-knockout` is registered.
If it is missing, rerun:

```bash
npx @jarl_okbe/tk codex install
```

If verification fails with a Node.js engine error, upgrade Node.js to 22.12.0 or
newer and reinstall dependencies.

If the plugin MCP server fails to start, make sure the npm package is published
and available through:

```bash
npx --yes --package @jarl_okbe/tk tk-mcp-server
```

If source paths are missing, run:

```bash
npx @jarl_okbe/tk source sync --missing
```
