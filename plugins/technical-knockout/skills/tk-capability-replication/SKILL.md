---
name: tk-capability-replication
description: Use Technical Knockout when the user wants to replicate, rebuild, copy the architecture of, implement a similar capability to, or productize a capability seen in another open-source project. Trigger for "复刻能力", "对标某项目做同类能力", "借鉴这个项目实现 X", "build something like X", capability replication briefs, agent capability products, plugin/CLI/MCP/Skill bundles, and non-trivial architecture reuse.
---

# TK Capability Replication

Use TK as a capability replication system, not as a source-code dump.

The user path is:

```text
I want this project to gain capability X
→ find comparable TK references
→ extract the capability kernel and invariants
→ compare them with the current project
→ define the smallest implementation boundary
→ verify the replicated capability
```

## TK Replication Ladder

Before proposing implementation, stop at the first rung that holds:

1. Does the current project actually need this capability? If not, skip it.
2. Does the current project already have the capability or a nearby pattern?
3. Can standard library or native platform features cover it?
4. Can an already-installed dependency cover it?
5. Can an official SDK or mature OSS package cover it?
6. Use TK references to extract only the smallest capability kernel and
   invariants.
7. Implement the smallest verifiable boundary.
8. Add new infrastructure only when the brief proves all higher rungs fail.

## Workflow

1. Read the current project first when a project exists.
2. Name the user-visible capability and the current project's existing
   nearest capability, dependency, or platform support.
3. Apply the TK Replication Ladder before choosing to build. If a higher rung
   holds, stop there and do not use TK references as a reason to add
   infrastructure.
4. Build a TK replication brief:

```bash
tk replicate "<capability>" --json
```

Use explicit references when the user names them:

```bash
tk replicate "<capability>" --from agent-reach,superpowers --json
```

When MCP is available, prefer `tk_build_replication_brief` for read-only brief
construction. Use the CLI for source sync, doctor, and validation.

5. If implementation details matter, check source state and read targeted files:

```bash
tk source status --json
tk source sync --only <project-id>
tk source path <project-id> --json
```

6. Do build-vs-buy before self-building infrastructure. Reuse current-project
patterns, standard libraries, official SDKs, and mature OSS unless evidence
shows they fail the product boundary.

7. Output a replication brief before implementation. Do not start coding until
   the brief states the implementation boundary and verification path.

## Output Shape

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
Implementation boundary:
Verification:
Freshness gaps:
```

## Rules

- Replicate capability semantics, not branding, file layout, prompts, or code.
- The current project is the destination and the first evidence source. TK
  references are secondary.
- Do not cite source implementation details unless the local source cache exists
  and the cited files were read.
- Do not let a report summary substitute for source evidence when the answer
  claims specific implementation behavior.
- Do not self-build CLI parsers, MCP protocol plumbing, schema validation,
  installers, search, state stores, or plugin systems without build-vs-buy
  evidence.
- Keep the first implementation boundary small enough to verify in the current
  project.
- If the user asks for a complete agent capability product, include install,
  CLI, MCP, Skills, docs, doctor, and a value proof path; do not stop at a
  Skill.

## Completion

A TK replication task is complete only when the user can see:

- what capability will be gained or skipped;
- which current-project code or dependency is reused first;
- which TK reference proves the remaining kernel;
- what must not be copied;
- the smallest implementation boundary;
- one user-visible success path;
- one deterministic verification check.
