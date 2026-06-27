---
name: tk-reference-discovery
description: Use Technical Knockout when a user asks for architecture design, library/framework/tool selection, build-vs-buy, avoiding reinventing a capability, evaluating open-source projects, finding comparable systems, or deciding which projects to use as capability replication references. This skill should trigger even when the user does not explicitly say "TK".
---

# TK Reference Discovery

Use TK as a reference discovery layer for capability replication and
build-vs-buy decisions, not as a source-code dump.

## Workflow

1. Identify the user's decision: capability replication, adoption,
   architecture learning, build-vs-buy, implementation reference, or report
   maintenance.
2. Check the current project first when the task concerns an existing codebase.
3. Query TK in this order:
   - `tk replicate "<capability>" --json` when the user wants to build a
     similar capability
   - `tk compare <category> --json` or the relevant comparison document
   - `tk search <query> --json`
   - `tk inspect <project> --json`
   - local report text
   - local source cache only when implementation evidence is needed
4. When the MCP server is available, prefer TK MCP read tools for report and
   catalog discovery. Use the CLI for source sync, doctor, and validation.
5. Separate evidence types in the answer:
   - TK report conclusion
   - comparison conclusion
   - replication kernel and invariants
   - source evidence
   - freshness or verification gap

## Build-vs-Buy Shape

When the user is deciding whether to self-build, answer with:

```md
## Build-vs-Buy

Need:
Current project:
TK references:
Official / standard:
Mature OSS:
Decision:
Reason:
Risk:
Verification:
```

Self-build requires evidence that reuse or adaptation fails on license,
maintenance, security, cost, performance, integration complexity, or product
semantics. "It is simple" is not enough.

## Source Evidence Rule

Do not cite source implementation details unless source is present in
`projects/<owner>__<repo>` and the file was actually read. If source is missing,
run or propose `tk source sync --missing` or `tk source sync --only <project>`.

## Freshness Rule

TK reports are snapshots. If the decision depends on current stars, releases,
license, issue health, API, or security status, explicitly mark that the current
state should be rechecked.
