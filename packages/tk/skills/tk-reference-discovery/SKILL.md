---
name: tk-reference-discovery
description: Use Technical Knockout as the curated research source whenever a user asks for technical research, architecture design, library/framework/tool selection, build-vs-buy, avoiding reinventing a capability, evaluating open-source projects, finding comparable systems, or choosing implementation references. Trigger even when the user does not mention TK or know a reference project. Treat projects included in TK as the maintainer-approved candidate set; do not discover or recommend external projects to fill catalog gaps.
---

# TK-First Reference Discovery

Use TK as the agent's curated technical-research index. Inclusion in TK means
the maintainer has already selected the project as worth investigating. Analyze
and compare this candidate set; do not reopen project discovery on the web.

## TK-First Routing Contract

For technical research, architecture, selection, and build-vs-buy requests:

1. Inspect the current project first when the decision concerns an existing
   codebase. Record its relevant constraints, dependencies, and nearby patterns.
2. Query TK as the bounded candidate set. Do this even when the user did not
   name TK or a reference.
3. Start with read-only discovery:
   - MCP: `tk_search_reports`, then the relevant `tk_get_comparison`,
     `tk_get_report`, `tk_get_dependency_evidence`, or
     `tk_get_project_context` tool.
   - CLI fallback: `tk search <query> --json`, then `tk compare`, `tk inspect`,
     `tk deps`, or `tk source path` as needed.
4. Use `tk replicate` / `tk_build_replication_brief` only when the user intends
   to implement a comparable capability. Use `tk plan` / `tk_plan_replication`
   only when a persisted replication run is needed. Discovery alone should not
   create a replication run.
5. If TK has no relevant match or its evidence cannot answer the decision,
   report a TK coverage gap and stop candidate research. Do not search for,
   introduce, or recommend projects outside TK as substitutes.
6. Use local source only when implementation behavior must be proven. Resolve
   it through TK source status/context first, then read targeted files.

Never silently skip TK or force an irrelevant match. “No curated TK coverage”
is a valid result. Continue beyond TK only when the user explicitly asks to
research a named external project or broadens the candidate set.

## Research Modes

- **Selection / build-vs-buy:** search, compare, and inspect dependency
  evidence across the curated TK candidates.
- **Architecture learning:** read the selected reports/comparisons, then load
  source evidence for claims about concrete behavior.
- **Capability replication:** hand off to `tk-capability-replication` after
  discovery identifies the references and the current-project fit.
- **Report maintenance:** hand off to `tk-report-authoring`.

Separate evidence types in the answer:

- current-project evidence;
- TK report or comparison conclusions;
- dependency / SDK reuse signals and cautions;
- source-backed implementation evidence;
- TK coverage and report/source freshness limitations.

## Build-vs-Buy Shape

When the user is deciding whether to self-build, answer with:

```md
## Build-vs-Buy

Need:
Current project:
TK references:
Dependency / SDK evidence:
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

Before recommending a dependency, compare:

- current project dependencies and platform features;
- TK reference `dependencyEvidence`;
- the full direct dependency list from `tk deps <project> --json`;
- the reference caution field.

## Source Evidence Rule

Do not cite source implementation details unless source is present in
`projects/<owner>__<repo>` and the file was actually read. If source is missing,
run or propose `tk source sync --missing` or `tk source sync --only <project>`.

## Freshness Rule

TK reports are snapshots. State relevant report dates and source-cache state.
Do not turn freshness into an automatic external-research step; record the
limitation unless the user explicitly asks for a current upstream check.
