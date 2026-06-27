# TK Value Proof

TK is useful only when it changes what an agent does before building.

The product proof is not that TK has reports, Skills, CLI commands, or MCP
tools. The proof is that an agent can turn a reference project into a smaller,
evidence-backed implementation boundary for the current project.

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

## Proof 1: Anti-overengineering Discipline

User need:

The user wants agents to stop hand-writing foundation code and stop adding
infrastructure before checking the current project, standard library, platform
features, installed dependencies, official SDKs, and mature OSS.

Reference:

```bash
npx @jarl_okbe/tk replicate "anti-overengineering agent behavior discipline" --from ponytail
```

TK evidence:

- Ponytail's kernel is a behavior skill corpus, mode resolver, instruction
  builder, host adapter matrix, lightweight state handle, and soft-fail
  injection contract.
- Its reusable invariant is the ladder: skip unnecessary work, reuse local
  code, prefer stdlib/native/installed dependencies, then write the minimum
  implementation.
- It keeps adapter code thin and treats agent-facing Markdown as an API.

TK decision for this project:

Do not copy Ponytail's persona, command set, host matrix, or mode system into
TK. TK should replicate the capability semantics: a hard ladder that prevents
unnecessary foundation work before capability replication begins.

Minimum product boundary:

- Add the TK Replication Ladder to TK methodology and Skills.
- Make `tk replicate` produce a brief with build-vs-buy and implementation
  boundary sections.
- Keep CLI parsing, MCP transport, and schema validation on mature libraries:
  Commander.js, official MCP SDK, and Ajv.

Verification:

- `npx @jarl_okbe/tk replicate "anti-overengineering agent behavior discipline" --from ponytail`
- `npx @jarl_okbe/tk doctor`
- `npm run verify`

## Proof 2: Agent Internet Capability Layer

User need:

The user wants an agent to gain internet reading/search capability without
building a crawler, browser runtime, search engine, credential store, and
platform-specific API stack from scratch.

Reference:

```bash
npx @jarl_okbe/tk replicate "agent internet capability layer" --from agent-reach
```

TK evidence:

- Agent Reach's kernel is a capability registry, ordered backend routing,
  side-effect-aware health probe, local config/credential store,
  agent-facing Skill contract, and direct invocation of upstream tools.
- The control plane decides which channel/backend is currently usable.
- The data plane stays with existing upstream tools such as platform CLIs,
  MCP servers, search APIs, RSS readers, and browser-login backends.

TK decision for a consuming project:

Do not build a unified internet API first. Start with a capability registry,
read-only health/status checks, and an agent-facing contract that tells the
agent which existing upstream tool to use. Only add a new backend when the
brief proves current tools fail the product boundary.

Minimum product boundary:

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

## Proof 3: Current Gap

Code intelligence replication is a good next proof, but it is not finished
until TK reports expose the same reusable sections for CodeGraph and GitNexus
that Ponytail and Agent Reach already expose.

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

## What Counts As Product Value

TK has product value when the brief changes the build decision:

- The agent skips a capability because the current project does not need it.
- The agent reuses current-project code instead of adding a new base.
- The agent chooses a mature library or official SDK instead of self-building.
- The agent extracts only the smallest reusable kernel from a reference.
- The agent states what not to copy before implementation.
- The agent leaves one user-visible path and one deterministic verification
  check.

If the output only summarizes a reference project, TK has not done its job.
