# TK Examples

These examples show what a useful TK result looks like.

TK is doing its job when it changes the build decision: skip the capability,
reuse what already exists, choose a mature dependency, extract a smaller kernel,
or define a tighter first implementation boundary.

## User Path

```bash
npx @jarl_okbe/tk codex install
npx @jarl_okbe/tk codex status
npx @jarl_okbe/tk replicate "<capability>" --from <reference-project>
```

Then ask Codex:

```text
Use Technical Knockout to replicate this capability in the current project.
```

The expected result is a capability replication brief, not a code dump.

## Example 1: Foundation Build-vs-Buy Gate

User need:

The user wants agents to stop hand-writing foundation code and stop adding
infrastructure before checking the current project, standard library, platform
features, installed dependencies, official SDKs, and mature OSS.

Reference:

```bash
npx @jarl_okbe/tk replicate "agent capability plugin with CLI MCP and Skills" --from superpowers,compound-engineering-plugin,ECC
```

What TK surfaces:

- TK identifies plugin distribution, CLI execution, MCP tools, Skills, and
  docs as separate surfaces instead of one large custom runtime.
- The build-vs-buy gate requires current-project reuse, standard
  library/platform features, installed dependencies, official SDKs, and mature
  OSS before TK-owned infrastructure.
- The product boundary stays small: CLI does deterministic local work, MCP
  stays read-mostly, Skills steer agent behavior, and docs explain the user
  path.

Decision:

Do not build a custom agent runtime, installer protocol, MCP transport, CLI
parser, schema validator, or search engine. TK should use mature foundations
and keep self-built code at the product boundary: catalog mapping, replication
briefs, source-cache planning, and agent workflow semantics.

First implementation boundary:

- Add the TK Replication Ladder to TK methodology and Skills.
- Make `tk replicate` produce a brief with build-vs-buy and implementation
  boundary sections.
- Keep CLI parsing, MCP transport, and schema validation on mature libraries:
  Commander.js, official MCP SDK, and Ajv.

Verification:

- `npx @jarl_okbe/tk replicate "agent capability plugin with CLI MCP and Skills" --from superpowers,compound-engineering-plugin,ECC`
- `npx @jarl_okbe/tk doctor`
- `npm run verify`

## Example 2: Agent Internet Capability Layer

User need:

The user wants an agent to gain internet reading/search capability without
building a crawler, browser runtime, search engine, credential store, and
platform-specific API stack from scratch.

Reference:

```bash
npx @jarl_okbe/tk replicate "agent internet capability layer" --from agent-reach
```

What TK surfaces:

- Agent Reach's kernel is a capability registry, ordered backend routing,
  side-effect-aware health probe, local config/credential store,
  agent-facing Skill contract, and direct invocation of upstream tools.
- The control plane decides which channel/backend is currently usable.
- The data plane stays with existing upstream tools such as platform CLIs,
  MCP servers, search APIs, RSS readers, and browser-login backends.

Decision for a consuming project:

Do not build a unified internet API first. Start with a capability registry,
read-only health/status checks, and an agent-facing contract that tells the
agent which existing upstream tool to use. Only add a new backend when the
brief proves current tools fail the product boundary.

First implementation boundary:

- Define the channels the current project actually needs.
- Expose machine-readable status for each channel.
- Route the agent to existing tools instead of proxying all data through a new
  service.
- Keep credential handling local and explicit; do not hide platform account or
  ToS risk.

Verification:

- `npx @jarl_okbe/tk replicate "agent internet capability layer" --from agent-reach`
- Source evidence only after `npx @jarl_okbe/tk source path agent-reach --json`
  returns an existing path and the agent has read the cited files.

## Example 3: Local Code Intelligence MCP

User need:

The user wants a local code-intelligence layer for coding agents without
building language parsers, symbol storage, graph traversal, incremental sync,
and host installers from scratch.

Reference:

```bash
npx @jarl_okbe/tk replicate "local code intelligence MCP" --from codegraph
```

What TK surfaces:

- CodeGraph's minimum kernel combines local file scanning, isolated
  Tree-sitter/WASM parsing, SQLite nodes/edges/FTS, best-effort reference
  resolution, MCP tools plus server instructions, and watch/sync fallback.
- The control plane owns init/install/sync/status, host targeting, output
  budgets, and fallback policy; the data plane parses files, updates the local
  graph, traverses relationships, and returns path-and-line evidence.
- Native SQLite may fall back to WASM, watchers may fall back to hooks or
  manual sync, and best-effort resolution still requires source reads and
  executable verification for ambiguous dynamic behavior.

Decision for a consuming project:

Do not build a graph database platform first. Start with a local persisted
symbol graph, bounded MCP queries, explicit server instructions, and one
reliable sync path. Preserve worker isolation, path traversal guards, and
honest best-effort semantics; adapt the host installer and storage backend only
when the consuming project requires it.

First implementation boundary:

- Confirm the current project needs repeated structural exploration rather
  than ordinary language-server navigation.
- Index only the languages and relationships required by the first user path.
- Return source paths and line numbers from every code-evidence query.
- Expose index freshness and degraded backend state before adding deeper graph
  analytics.

Verification:

- `npx @jarl_okbe/tk replicate "local code intelligence MCP" --from codegraph`
- `npx @jarl_okbe/tk plan "local code intelligence MCP" --from codegraph --json`
- The generated evidence pack contains the architecture kernel, abstractions,
  control/data plane, execution flows, state, contracts, failure model, and
  design invariants.

GitNexus is retired from TK's curated catalog and is not a supported reference
or source-cache target. Historical comparisons in reports remain research
context, not an active recommendation or product dependency.

## What Good Looks Like

TK has product value when the brief changes the build decision:

- The agent skips a capability because the current project does not need it.
- The agent reuses current-project code instead of adding a new base.
- The agent chooses a mature library or official SDK instead of self-building.
- The agent extracts only the smallest reusable kernel from a reference.
- The agent states what not to copy before implementation.
- The agent leaves one user-visible path and one deterministic verification
  check.

If the output only summarizes a reference project, TK has not done its job.
