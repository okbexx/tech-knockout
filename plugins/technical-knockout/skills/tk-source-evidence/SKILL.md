---
name: tk-source-evidence
description: Use when a TK answer needs implementation evidence from cloned source projects, local source-cache freshness checks, source sync plans, file/function citations, or when the user asks Codex to clone, pull, download, prepare, sync, or check the TK reference repositories/source cache. Trigger for phrases like "把 TK 需要的仓库 clone 下来", "拉报告里的源码", "prepare TK source repos", and "sync missing TK sources".
---

# TK Source Evidence

Use source cache only when implementation evidence is necessary. Reports and
comparisons are the first discovery layer; source is the verification layer.

## User Conversation Entry

When the user asks to prepare TK repositories through conversation, act through
the TK CLI instead of giving manual `git clone` steps.

Common user intents:

- "把 TK 需要的仓库 clone 下来"
- "拉报告里的源码"
- "准备 TK 的参考项目源码"
- "sync missing TK sources"
- "check whether TK source repos are cloned"

Default behavior:

- If the user asks only to check, run `tk source status --json` and summarize.
- If the user names one project, run `tk source sync --only <project-id>`.
- If the user names several projects, run one `tk source sync --only <project-id>`
  command per project.
- If the user says "needed", "missing", "all", or gives no project scope, run
  `tk source sync --missing`.
- After sync, run `tk source status --json` again. For all-sources readiness,
  `tk doctor --require-sources` is also acceptable.

Summarize in user language: how many were already present, how many were cloned,
which ones failed, and the next command for retry. Do not dump JSON unless the
user asks for it.

## Workflow

1. Run `tk source status --json` or use MCP source-status tools.
2. If the needed repository is missing, run or propose:

```bash
tk source sync --only <project-id>
```

For all missing repositories:

```bash
tk source sync --missing
```

3. Read targeted source files. Prefer `rg`, `rg --files`, and focused file
   reads.
4. Cite local source paths and explain what the source proves.
5. If the source cache is shallow or stale relative to the report, state the
   freshness limitation.

## Safety

Use `tk source sync`; do not hand-roll catalog parsing or manual clone loops.
`projects/` is a local cache. Do not edit or commit third-party source unless
the user explicitly wants to work inside that project.
