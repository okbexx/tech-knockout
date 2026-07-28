# Install Technical Knockout for Coding Agents

Technical Knockout supports Codex, Claude Code, OpenCode, and Hermes Agent. Every adapter loads the same package-owned Skills, CLI, MCP server, catalog, and machine contracts; only the host installation mechanism differs.

## Prerequisites

- Node.js 22.12.0 or newer.
- npm.
- One supported host: Codex CLI/app with plugin support, Claude Code, OpenCode, or Hermes Agent.

## Choose your host

Run only the pair for the agent you use:

```bash
# Codex
npx @jarl_okbe/tk codex install
npx @jarl_okbe/tk codex status

# Claude Code
npx @jarl_okbe/tk claude install
npx @jarl_okbe/tk claude status

# OpenCode
npx @jarl_okbe/tk opencode install
npx @jarl_okbe/tk opencode status

# Hermes Agent
npx @jarl_okbe/tk hermes install
npx @jarl_okbe/tk hermes status
```

A successful `status` prints `ok` for every check and ends with `ready <host> adapter` or `ready technical-knockout@tech-knockout`. Restart the host or start a new session after installation so it discovers the newly installed Skills and MCP server.

OpenCode and Hermes copy the canonical TK Skills to the OS-specific TK user data directory, then register that durable directory and the published `tk-mcp-server` in the host's global configuration. Codex and Claude Code instead discover the plugin's root `skills/` and `.mcp.json` through their native plugin mechanisms. Set `TK_ADAPTER_SKILLS_ROOT` only when you need to override the installed Skills directory for a configuration-based adapter.

## Use TK

From the project where you need a technical decision, ask naturally; you do not need to name TK:

```text
We need an internet capability layer for our agent. Research existing open-source approaches and dependencies, then decide what to reuse, adopt, or build.
```

The configured agent should inspect the current project and query only the curated TK project set. Inclusion in TK is the maintainer's project-selection signal. When TK has no relevant coverage, the agent should report that bounded result instead of discovering or recommending replacement projects externally.

For a capability-replication request, the agent should establish:

```text
Current project fit
Reference projects
Must keep
Can adapt
Do not copy
Implementation boundary
Verification
Freshness gaps
```

For direct CLI use:

```bash
npx @jarl_okbe/tk replicate "agent internet capability layer" --from agent-reach
npx @jarl_okbe/tk plan "agent internet capability layer" --from agent-reach --json
npx @jarl_okbe/tk verify "agent internet capability layer" --from agent-reach --json
npx @jarl_okbe/tk run list --json
```

## Refresh or remove an adapter

Each supported host exposes the same lifecycle verbs:

```bash
npx @jarl_okbe/tk <codex|claude|opencode|hermes> status
npx @jarl_okbe/tk <codex|claude|opencode|hermes> refresh
npx @jarl_okbe/tk <codex|claude|opencode|hermes> remove
```

`refresh` reloads the latest installed adapter state. `remove` removes TK's host registration while preserving unrelated user configuration. Claude Code removes only the installed plugin and keeps the marketplace registration; other hosts follow the host-specific behavior below. Start a new host session after either operation.

## Host-specific behavior

### Codex

Codex uses its native plugin marketplace. `tk codex install` registers `okbexx/tech-knockout` and installs `technical-knockout@tech-knockout`. `refresh` upgrades the marketplace snapshot, then reinstalls the plugin. `remove` removes both the plugin and marketplace registration.

For local adapter development:

```bash
git clone https://github.com/okbexx/tech-knockout.git
cd tech-knockout
npm install
npm run verify
npx @jarl_okbe/tk codex install --source "$(pwd)"
```

The underlying install commands are:

```bash
codex plugin marketplace add okbexx/tech-knockout
codex plugin add technical-knockout@tech-knockout
```

### Claude Code

Claude Code uses its native plugin marketplace with user-scoped registration and installation. `tk claude install` registers the TK marketplace and installs `technical-knockout@tech-knockout`. The plugin automatically discovers the adapter's root `skills/` and `.mcp.json`.

The underlying install commands are:

```bash
claude plugin marketplace add okbexx/tech-knockout --scope user
claude plugin install technical-knockout@tech-knockout --scope user
```

`tk claude status` checks the native JSON marketplace and installed-plugin views with `claude plugin marketplace list --json` and `claude plugin list --json`, then verifies that the selected scope declares the expected marketplace source. Pass `--source <path-or-repository>` when status-checking a non-default local marketplace. `tk claude refresh` runs `claude plugin marketplace update tech-knockout` followed by `claude plugin update technical-knockout@tech-knockout --scope user`. `tk claude remove` runs only `claude plugin uninstall technical-knockout@tech-knockout --scope user`; it intentionally leaves the marketplace registered because removing a marketplace also uninstalls its plugins. Restart Claude Code or start a new session after install, refresh, or remove; in a live session, use `/reload-plugins` after refresh to reload Skills and reconnect MCP.

### OpenCode

OpenCode uses its global JSONC config at `${XDG_CONFIG_HOME:-~/.config}/opencode/opencode.json`. The installer preserves comments and unrelated settings while adding:

- the durable TK Skills directory to `skills.paths`;
- a local `technical-knockout` MCP server launched through `npx --yes --package @jarl_okbe/tk tk-mcp-server`.

After installation, restart OpenCode and run `opencode mcp list` when you need the host-native MCP connection view.

### Hermes Agent

Hermes uses `${HERMES_HOME:-~/.hermes}/config.yaml`. The installer preserves unrelated YAML configuration while adding:

- the durable TK Skills directory to `skills.external_dirs`;
- a `technical-knockout` entry under `mcp_servers`, launched through the published npm package.

After installation, start a new Hermes session or run `/reload-skills`. Run `hermes mcp test technical-knockout` when you need the host-native MCP connection check.

## Source cache

`source sync --missing` clones source repositories referenced by TK reports. In a TK checkout, sources live under `projects/`. From the published npm package, sources live under the OS-specific user cache directory. Set `TK_SOURCE_ROOT` to override that location.

```bash
npx @jarl_okbe/tk source sync --missing
npx @jarl_okbe/tk source status
npx @jarl_okbe/tk doctor --require-sources
```

## Troubleshooting

1. Run `npx @jarl_okbe/tk <host> status --json` for exact failed checks and paths.
2. Run `npx @jarl_okbe/tk <host> refresh` and start a new host session.
3. Confirm the shared MCP server is available:

   ```bash
   npx --yes --package @jarl_okbe/tk tk-mcp-server
   ```

4. Upgrade Node.js if the package reports an engine error.
5. Run `npx @jarl_okbe/tk source sync --missing` if a referenced source path is absent.
