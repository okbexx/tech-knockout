# Install the Technical Knockout Codex Plugin

This guide is for users who want Codex to use Technical Knockout as an
installable plugin with bundled Skills, CLI commands, and an MCP server.

## Prerequisites

- Codex CLI or Codex app with plugin support.
- Node.js 22.12.0 or newer.
- npm.

## Install with npm

Install the Codex plugin through the TK npm CLI:

```bash
npx @okbexx/tk codex install
```

This registers the GitHub marketplace source and installs the Codex plugin:

```bash
codex plugin marketplace add okbexx/tech-knockout
codex plugin add technical-knockout@tech-knockout
```

Restart Codex or start a new Codex thread after installation.

## Use the CLI

Run TK commands through npm without cloning the repository:

```bash
npx @okbexx/tk doctor
npx @okbexx/tk search "coding agent runtime" --json
npx @okbexx/tk source status --json
npx @okbexx/tk source sync --missing
npx @okbexx/tk source path gitnexus --json
```

Or install the CLI globally:

```bash
npm install --global @okbexx/tk
tk doctor
tk source sync --missing
```

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
npx @okbexx/tk doctor --require-sources
```

## Install from source for development

Clone the TK repository when you want to develop reports, plugin code, Skills,
or MCP tools:

```bash
git clone https://github.com/okbexx/tech-knockout.git
cd tech-knockout
```

Install the plugin dependencies:

```bash
npm --prefix plugins/technical-knockout ci
```

Run the plugin verification suite:

```bash
npm --prefix plugins/technical-knockout run verify
```

Register the TK repository as a Codex plugin marketplace:

```bash
npx @okbexx/tk codex install --source "$(pwd)"
```

The underlying Codex commands are:

```bash
codex plugin marketplace add "$(pwd)"
codex plugin add technical-knockout@tech-knockout
```

## Verify the installation

Check that Codex can see the marketplace:

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

## Use the bundled capabilities

After installation, Codex can load the TK Skills when a task involves
open-source project evaluation, architecture learning, build-vs-buy decisions,
or source-backed reference discovery.

You can also ask Codex to use the plugin explicitly:

```text
Use Technical Knockout to compare these architecture options.
```

The plugin also provides the `tk` CLI inside the repository:

```bash
node plugins/technical-knockout/bin/tk.mjs doctor
node plugins/technical-knockout/bin/tk.mjs search "coding agent runtime" --json
node plugins/technical-knockout/bin/tk.mjs source status --json
node plugins/technical-knockout/bin/tk.mjs source sync --missing
node plugins/technical-knockout/bin/tk.mjs source path gitnexus --json
```

`source sync --missing` clones source repositories referenced by TK reports.
From a repository checkout, the cache is `projects/` and is intentionally not
committed to Git. From the npm package, the cache is under the OS-specific user
cache directory.

## Update later

Pull the latest TK repository changes:

```bash
git pull --ff-only
npm --prefix plugins/technical-knockout ci
npm --prefix plugins/technical-knockout run verify
```

If Codex does not pick up changed plugin metadata immediately, remove and
reinstall the local plugin:

```bash
codex plugin remove technical-knockout@tech-knockout
codex plugin add technical-knockout@tech-knockout
```

Start a new Codex thread after reinstalling so the refreshed plugin Skills and
MCP configuration are available to the agent.

## Troubleshooting

If `npx @okbexx/tk codex install` cannot find the plugin, run
`codex plugin marketplace list` and confirm that `tech-knockout` is registered.
If it is missing, rerun:

```bash
npx @okbexx/tk codex install
```

If verification fails with a Node.js engine error, upgrade Node.js to 22.12.0 or
newer and reinstall dependencies.

If source paths are missing, run:

```bash
npx @okbexx/tk source sync --missing
```
