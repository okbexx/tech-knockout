# TK Agent Plugin Architecture

Technical Knockout is an agent-native architecture reference system.

The product is intentionally layered:

| Layer | Responsibility |
|---|---|
| Reports and comparisons | Human-readable research, judgment, and architecture analysis |
| Catalog and source lock | Machine-readable project facts and local source-cache state |
| CLI | Deterministic local operations: catalog, source sync, validation, doctor |
| MCP | Structured read-mostly access for agents |
| Skills | Agent behavior: when to use TK and how to apply evidence |
| Codex plugin | Installable distribution unit |

## Build-vs-Buy Policy

TK product infrastructure should use mature libraries for durable surfaces:

| Need | Decision |
|---|---|
| CLI command parsing | Commander.js |
| MCP stdio server and tool protocol | Official `@modelcontextprotocol/sdk` |
| JSON Schema validation | Ajv draft 2020-12 |

Self-built code should stay at the TK business boundary: catalog field mapping,
source-cache planning, report judgment, and agent workflow semantics.

## Capability Maturity

TK's agent plugin suite targets **L4 Skill + CLI + MCP** maturity:

| Layer | Role |
|---|---|
| Skill | Trigger, reference-first workflow, build-vs-buy discipline |
| CLI | Deterministic local execution, writes, source sync, validation |
| MCP | Structured read-mostly context and tool discovery for agents |
| Schemas | Stable machine contracts for catalog and source lock |
| Docs | Architecture decisions, safety boundary, and verification contract |

The next maturity step is L5 only if TK needs cross-session task state,
automated upgrade/migration, or persistent decision memory beyond repo docs.
Do not add Memory or Long-task machinery just to make the structure look
complete.

## Verification Contract

Changes to the plugin suite should pass:

```bash
npm run verify
```

The verify script covers syntax checks, catalog validation, doctor checks, and
MCP smoke. Plugin manifest and Skill validation are still run with the Codex
creator validators when those surfaces change.

## Control Plane / Data Plane

The control plane is the TK catalog, CLI, MCP server, skills, schemas, and
doctor checks. It decides what evidence exists, what is stale, and what an
agent should read next.

## CLI Framework Policy

`tk` uses Commander.js for command parsing, help output, options, subcommands,
and async actions. This avoids maintaining ad hoc argument parsing while
keeping the dependency surface small. oclif remains the upgrade path if TK
later needs CLI plugins, generated command documentation, or heavier lifecycle
hooks.

The data plane is the report text, comparison text, and local source cache under
`projects/`. Source repositories are not committed to TK and should be treated
as reproducible local cache.

## Source Cache Policy

`projects/<owner>__<repo>` is the canonical cache layout. The cache is ignored
by Git. `tk source sync` can recreate missing caches from catalog metadata.

The source cache is a current-code cache, not a history analysis database. TK
uses shallow clones by default so agents can inspect the full current working
tree without paying for full Git history.

`data/tk.lock.json` records current local state: branch, commit, shallow/full
clone state, dirty state, and remote URL.

Agents that need source code should resolve the project through catalog/context,
check source status, then read files directly from `projects/<owner>__<repo>`.
MCP tools should expose the path and state; CLI commands perform network or
write side effects.

## Agent Usage Contract

Agents should use TK in this order:

1. Current project evidence.
2. TK comparison documents.
3. TK report documents.
4. Source-cache evidence when implementation details matter.
5. Official/current upstream verification when time-sensitive facts matter.

## Safety

MCP tools are read-mostly. Source sync, catalog writes, and doctor updates are
CLI operations so sandbox and approval behavior remains clear.
