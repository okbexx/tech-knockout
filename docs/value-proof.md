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

## Current Gap

Code intelligence replication is a good next proof, but it is not finished
until TK reports expose the same reusable architecture sections for CodeGraph
and GitNexus that the replication brief extractor expects.

Current command:

```bash
npx @jarl_okbe/tk replicate "local code intelligence MCP" --from codegraph,gitnexus
```

Current result:

TK can identify the references and local source paths, but the generated brief
does not yet extract enough reusable architecture evidence from those reports.

Next product cut:

- Update the CodeGraph and GitNexus reports with the TK architecture section
  names used by `tk replicate`.
- Re-run the same command and require an evidence pack before claiming this as
  a completed value proof.

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
