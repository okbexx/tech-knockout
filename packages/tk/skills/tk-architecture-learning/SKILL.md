---
name: tk-architecture-learning
description: Use when extracting reusable architecture patterns from TK reports or source code for capability replication, including minimal architecture kernel, core abstractions, control/data plane, execution flows, state model, contracts, failure model, and design invariants.
---

# TK Architecture Learning

Use this skill when the user wants to learn or reuse architecture from a TK
project. The goal is to extract transferable capability structure, not to copy
a project.

## Required Analysis

For each selected project, collect:

1. Minimal architecture kernel.
2. Core abstractions and their responsibilities.
3. Control plane versus data plane.
4. Key execution flows.
5. State model: persistent, runtime, and external state.
6. Contract boundaries: internal API, CLI/API/MCP/schema, agent-facing docs.
7. Failure and degradation model.
8. Reusable design invariants.
9. What must be preserved to replicate the capability in the current project.
10. What can be replaced by current-project patterns or mature libraries.

## Output Shape

```md
## Architecture Pattern

Reference projects:
Kernel:
Core abstractions:
Control plane:
Data plane:
State model:
Contracts:
Failure model:
Invariants:
What not to copy:
Verification gaps:
```

When source evidence matters, read the local source cache and cite file paths.
When source is missing, use TK reports only and label the result as report-based.
