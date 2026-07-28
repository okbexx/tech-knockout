# TK Multi-Agent Value Proof

Technical Knockout (TK) supports the same capability-replication path in
**Codex, Claude Code, OpenCode, and Hermes Agent**. From the project where the
technical decision must be made:

1. Install and check the adapter for the host you use:

   ```bash
   npx @jarl_okbe/tk <codex|claude|opencode|hermes> install
   npx @jarl_okbe/tk <codex|claude|opencode|hermes> status
   ```

2. Restart the host or start a new session, then ask naturally. You do not need
   to name TK:

   ```text
   We need an internet capability layer for our agent. Research existing
   open-source approaches and dependencies, then decide what to reuse, adopt,
   or build.
   ```

3. Expect the agent to inspect the current project first, stay within TK's
   curated project set, and return a **Capability Replication Brief** rather
   than a code dump. For an implementation-oriented request, also expect a
   persisted `plan.json`, `verification.json`, and `trace.json`.

4. Verify machine-readable state independently of the agent's prose:

   ```bash
   npx @jarl_okbe/tk <codex|claude|opencode|hermes> status --json
   npx @jarl_okbe/tk run list --json
   npx @jarl_okbe/tk run show <run-id> --json
   ```

A successful adapter `status` reports `ok` for every check and a ready result.
A real host session is still required to establish that the host discovered the
Skill and MCP server, routed the natural-language request correctly, followed
the evidence order, and produced a useful brief. Installation state is not
proof of model behavior.

## What TK Must Change

TK has product value when it changes the build decision: skip the capability,
reuse current-project code, choose an installed dependency or mature SDK,
extract a smaller kernel, or define a tighter first implementation boundary.
If the output only summarizes a reference project, TK has not done its job.

The required brief is:

```md
## Capability Replication Brief

Capability:
Current project fit:
Reference projects:
Evidence:
TK Replication Ladder:
Kernel:
Must keep:
Can adapt:
Do not copy:
Build-vs-buy:
Dependency / SDK evidence:
Implementation boundary:
Verification:
Freshness gaps:
```

The behavior contract is host-neutral:

1. Route a technical-research or capability-replication request to TK even when
   the user does not name TK.
2. Inspect the current project before consulting TK evidence.
3. Search only the curated TK catalog. Inclusion is TK's project-selection
   boundary, not permission to reopen candidate discovery on the web.
4. Use replication planning only when the user intends to implement a
   comparable capability.
5. Use local source-cache evidence only when implementation details matter.
6. If TK has no relevant match, report **no curated TK coverage** and stop
   candidate research unless the user explicitly broadens the scope.
7. For an implementation-oriented request, persist and schema-validate the
   plan, verification result, and run trace through the shared runtime.

## Two Kinds of Proof

### Automated deterministic evidence

Automation may assert only stable machine contracts:

- the selected adapter is installed and its `status --json` checks pass;
- the adapter configuration or native plugin state exposes the shared
  `technical-knockout` MCP server;
- a rendered brief contains every required section listed above;
- persisted `plan.json`, `verification.json`, and `trace.json` conform to TK's
  existing replication plan, verification result, and run trace schemas;
- the CLI and MCP surfaces use the same run and schema contracts.

The existing schemas are authoritative. A value-proof check must consume those
schemas rather than duplicate their rules in a host-specific test.

### Manual behavior evidence from a real host session

A human acceptance session is required to determine whether each host's agent:

- automatically selects TK for a natural request that does not name TK;
- examines current-project evidence before TK evidence;
- stays inside the curated collection;
- applies the TK Replication Ladder rather than merely summarizing references;
- produces a useful, evidence-backed brief with all required sections;
- creates and verifies the persisted plan / verification / trace chain for an
  implementation-oriented request;
- reports no curated coverage without expanding to external candidates when TK
  has no match.

These are behavioral observations, not facts implied by a passing installer or
schema check. Automated tests must not assert exact model wording, sentence
order, stylistic similarity, or that a nondeterministic model always routes the
same prompt identically. They may validate the resulting machine contracts and
required brief headings only.

## Four-Host Acceptance Matrix

Use one fresh session per host after adapter installation. This template is
intentionally unfilled; record observed evidence rather than assuming parity.

| Acceptance item | Codex | Claude Code | OpenCode | Hermes Agent |
|---|---|---|---|---|
| Adapter `status --json` ready | Not run | Not run | Not run | Not run |
| Shared MCP server visible to host | Not run | Not run | Not run | Not run |
| Natural request routes to TK without naming TK | Not run | Not run | Not run | Not run |
| Current project inspected before TK | Not run | Not run | Not run | Not run |
| Evidence remains within curated TK projects | Not run | Not run | Not run | Not run |
| Brief contains all required sections | Not run | Not run | Not run | Not run |
| `plan.json`, `verification.json`, `trace.json` persisted and schema-valid | Not run | Not run | Not run | Not run |
| No curated match stops without external expansion | Not run | Not run | Not run | Not run |

For each cell, replace `Not run` only with a dated result and the relevant
command output, run id, or session transcript reference. Do not convert an
adapter readiness result into a pass for a behavioral row.

## Executable Reference Examples

These direct CLI examples exercise the shared TK core independently of which
host initiated the request. They are useful for inspecting the expected
technical decision, but they do not prove automatic routing in any host.

### Foundation build-vs-buy gate

```bash
npx @jarl_okbe/tk replicate "agent capability plugin with CLI MCP and Skills" --from superpowers,compound-engineering-plugin,ECC
```

A useful brief separates plugin distribution, deterministic CLI execution,
read-mostly MCP access, Skills, and documentation instead of proposing one
custom agent runtime. It checks current-project reuse, platform features,
installed dependencies, official SDKs, and mature OSS before TK-owned
infrastructure. The smallest boundary keeps catalog mapping, replication
briefs, source-cache planning, and agent workflow semantics in TK while using
Commander.js, the official MCP SDK, and Ajv for foundation machinery.

### Agent internet capability layer

```bash
npx @jarl_okbe/tk replicate "agent internet capability layer" --from agent-reach
npx @jarl_okbe/tk plan "agent internet capability layer" --from agent-reach --json
npx @jarl_okbe/tk verify "agent internet capability layer" --from agent-reach --json
```

A useful brief identifies the smallest kernel: capability registry, ordered
backend routing, side-effect-aware health checks, local configuration, and
direct use of upstream tools. It does not propose a crawler, browser runtime,
search engine, credential store, and platform API stack unless current-project
and TK evidence proves those additions necessary.

Source evidence is valid only after:

```bash
npx @jarl_okbe/tk source path agent-reach --json
```

returns an existing path and the cited files have been read.

### Local code-intelligence MCP

```bash
npx @jarl_okbe/tk replicate "local code intelligence MCP" --from codegraph
npx @jarl_okbe/tk plan "local code intelligence MCP" --from codegraph --json
npx @jarl_okbe/tk verify "local code intelligence MCP" --from codegraph --json
```

A useful brief first establishes that the current project needs repeated
structural exploration beyond ordinary language-server navigation. Its minimum
boundary is a local persisted symbol graph, bounded MCP queries, explicit
server instructions, one reliable sync path, source paths and line evidence,
and honest freshness and degraded-backend state—not a new graph platform.

GitNexus is retired from TK's curated catalog and is not a supported reference
or source-cache target. Historical comparisons in reports remain research
context, not an active recommendation or product dependency.

## Pass Condition

The value proof passes for a host only when both layers are recorded:

- deterministic checks establish adapter/MCP readiness and valid shared
  artifacts; and
- a real host session establishes the routing and decision behavior.

Across all four hosts, equivalent outcomes matter more than identical prose.
The proof must never treat model phrasing as a machine contract or describe an
unexecuted host session as verified.
