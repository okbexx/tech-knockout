# Install the Technical Knockout Codex Plugin

This guide is for users who want Codex to use Technical Knockout as an
installable plugin with bundled Skills, CLI commands, and an MCP server.

## Prerequisites

- Codex CLI or Codex app with plugin support.
- Git.
- Node.js 22.12.0 or newer.
- npm.

## Install from source

Clone the TK repository:

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
codex plugin marketplace add "$(pwd)"
```

Install the plugin from that marketplace:

```bash
codex plugin add technical-knockout@tech-knockout
```

Restart Codex or start a new Codex thread after installation.

## Verify the installation

Check that Codex can see the marketplace:

```bash
codex plugin marketplace list
```

The output should include a marketplace named `tech-knockout` whose root points
to your local clone of this repository.

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

`source sync --missing` clones source repositories referenced by TK reports into
the local `projects/` cache. The cache is intentionally not committed to Git.

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

If `codex plugin add technical-knockout@tech-knockout` cannot find the plugin,
run `codex plugin marketplace list` and confirm that `tech-knockout` is
registered. If it is missing, rerun:

```bash
codex plugin marketplace add "$(pwd)"
```

If verification fails with a Node.js engine error, upgrade Node.js to 22.12.0 or
newer and reinstall dependencies.

If source paths are missing, run:

```bash
node plugins/technical-knockout/bin/tk.mjs source sync --missing
```
