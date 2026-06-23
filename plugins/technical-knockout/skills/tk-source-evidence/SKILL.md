---
name: tk-source-evidence
description: Use when a TK answer needs implementation evidence from cloned source projects, local source-cache freshness checks, source sync plans, or file/function citations from projects under the TK projects cache.
---

# TK Source Evidence

Use source cache only when implementation evidence is necessary. Reports and
comparisons are the first discovery layer; source is the verification layer.

## Workflow

1. Run `tk source status --json` or use MCP source-status tools.
2. If the needed repository is missing, run or propose:

```bash
tk source sync --only <project-id>
```

3. Read targeted source files. Prefer `rg`, `rg --files`, and focused file
   reads.
4. Cite local source paths and explain what the source proves.
5. If the source cache is shallow or stale relative to the report, state the
   freshness limitation.

## Safety

`projects/` is a local cache. Do not edit or commit third-party source unless
the user explicitly wants to work inside that project.
