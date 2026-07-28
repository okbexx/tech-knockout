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
→ implement in the current project
→ run the current project's real verification path
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
4. Build a read-only TK replication brief:

```bash
tk replicate "<capability>" --json
```

Use explicit references when the user names them:

```bash
tk replicate "<capability>" --from agent-reach,superpowers --json
```

When MCP is available, prefer `tk_build_replication_brief` for read-only brief
construction. Use `tk plan` / `tk_plan_replication` only when the user or agent
needs persisted TK plan artifacts. Neither TK plan validation nor source-cache
availability proves that the capability was implemented in the target project.

5. Before recommending new infrastructure, inspect dependency evidence:

```bash
tk deps <project-id> --json
```

Use `dependencyEvidence` to see which libraries, SDKs, frameworks, CLIs, or
protocol packages the reference project reused, what problem they solved, and
when the current project should or should not reuse the same kind of package.

6. If implementation details matter, check source state and read targeted files:

```bash
tk source status --json
tk source sync --only <project-id>
tk source path <project-id> --json
```

7. Do build-vs-buy before self-building infrastructure. Reuse current-project
patterns, standard libraries, official SDKs, and mature OSS unless evidence
shows they fail the product boundary.

8. Output a replication brief before implementation. Do not start coding until
the brief states the implementation boundary and verification path.

9. After implementation, run the target project's real verification path. The
host agent must inspect the actual diff and execute the relevant smoke, test,
browser, build, or validation command. Do not substitute `tk verify` for target
project verification; `tk verify` checks TK plan/evidence artifacts only.

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
Dependency / SDK evidence:
Implementation boundary:
Target-project verification:
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
- Do not recommend adding a library just because a TK reference uses it. First
  check the current project dependencies and the reference's reuse signal and
  caution.
- Keep the first implementation boundary small enough to verify in the current
  project.
- If the user asks for a complete agent capability product, include install,
  CLI, MCP, Skills, docs, doctor, and a value proof path; do not stop at a
  Skill.

## Completion

A TK replication task is complete only when the user can see:

- what capability was gained or skipped;
- which current-project code or dependency was reused first;
- which reference dependencies or SDKs solve the same problem, and why they are
  or are not appropriate for the current project;
- which TK reference proves the remaining kernel;
- what was not copied;
- the implemented boundary;
- one user-visible success path;
- one target-project verification result that was actually executed.
