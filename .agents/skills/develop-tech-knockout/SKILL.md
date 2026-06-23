---
name: develop-tech-knockout
description: Use when developing Technical Knockout itself, especially the TK agent plugin suite, report/catalog/source-cache workflows, Codex skills, CLI, MCP server, schemas, doctor checks, or agent-facing architecture reference features. This skill should trigger for TK product development, not for ordinary use of TK reports.
---

# Develop Technical Knockout

Use this skill when changing Technical Knockout (TK) as a product. TK is an
agent-native architecture reference system: human-readable reports and
comparisons provide judgment, while skills, CLI, MCP, schemas, catalog, and
source-cache tooling make that judgment reliable for coding agents.

## Product Boundary

Keep these layers separate:

- **Reports and comparisons** are the human-readable research assets.
- **Catalog and lock files** are the machine-readable facts.
- **CLI** performs deterministic local operations such as catalog generation,
  source sync, validation, and doctor checks.
- **MCP** exposes structured read-mostly context and tools to agents.
- **Skills** teach agents when and how to use TK evidence.
- **Plugin manifest and marketplace metadata** distribute the whole capability.

Do not turn TK into a vendored source mega-repository. Cloned third-party
repositories are local caches under `projects/` and must not be committed.

## Required First Steps

Before any write in this repository:

1. Run `git fetch --all --prune`.
2. Run `git status --short --branch`.
3. If the branch is behind upstream, report the ahead/behind state and stop
   for user direction. Do not run `git pull`, `git merge`, or `git rebase`
   unless the user explicitly asks.

Before designing plugin, skill, CLI, MCP, schema, installer, or distribution
changes:

1. Check current TK files with `rg --files` and targeted reads.
2. Check relevant TK reference reports and local source caches:
   - `reports/superpowers.md` and `projects/obra__superpowers`
   - `reports/CLI-Anything.md` and `projects/HKUDS__CLI-Anything`
   - `reports/GitNexus.md` and `projects/abhigyanpatwari__GitNexus`
   - `reports/ECC.md` and `projects/affaan-m__ECC`
   - `reports/vibecode-pro-max-kit.md` and `projects/withkynam__vibecode-pro-max-kit`
   - `reports/compound-engineering-plugin.md` and `projects/EveryInc__compound-engineering-plugin`
3. Check current OpenAI Codex documentation when plugin, skill, MCP, hooks,
   marketplace, or Codex behavior is involved.

## Architecture Rules

- Prefer a **Skill + CLI + MCP + schemas** product shape for reusable TK
  capabilities.
- Treat TK product development as a durable capability workflow, not a one-off
  coding task. Skill owns routing and architecture discipline; CLI and MCP own
  deterministic execution; docs record product contracts.
- CLI is the execution boundary. It must support `--help`; commands that
  agents consume should support `--json`.
- CLI argument parsing must use a mature CLI framework, not an ad hoc parser.
  Use Commander.js at the current complexity; consider oclif only if TK needs
  CLI plugins, generated command docs, or heavier lifecycle hooks.
- CLI commands with side effects must have clear scope and preferably
  `--dry-run`.
- MCP protocol, transport, request routing, and tool registration must use the
  official `@modelcontextprotocol/sdk`. Do not hand-roll stdio framing,
  JSON-RPC dispatch, or MCP initialize/tools handlers.
- JSON Schema files must be enforced with a mature validator. Use Ajv draft
  2020-12 for `schemas/*.json`; keep hand-written checks limited to TK business
  invariants such as duplicate project ids or missing source metadata.
- MCP should be read-mostly by default. If an MCP tool can mutate state or
  trigger network/source sync, mark the tool description and annotations
  accordingly.
- Skills should orchestrate agent behavior, not duplicate CLI logic.
- Catalog/lock schemas should be explicit enough that agents do not need to
  parse Markdown ad hoc for common operations.
- Source caches are current-code caches. Default to shallow clones and expose
  local source paths through CLI/MCP context so agents can inspect the current
  working tree directly.
- Keep paths portable. Do not write local user-specific absolute paths into
  committed docs, manifests, schemas, or generated catalog files.

## Capability Shape Decision

When adding or changing TK product infrastructure, apply this decision before
editing code:

| Need | TK shape |
|---|---|
| Agent behavior, routing, build-vs-buy discipline | Skill |
| Repeatable local action, writes, source sync, validation | CLI |
| Read-mostly structured context for agents | MCP |
| Machine-readable facts and compatibility | JSON Schema + Ajv |
| Long-term architecture decision | `docs/tk-agent-plugin-architecture.md` |
| One-off implementation detail | Code only; do not create a new capability |

Do not create a new CLI, Skill, MCP server, or AGENTS.md rule unless the
workflow has a stable trigger, input/output contract, and verification command.

## Repeated Failure Pattern

These are known TK product-development pitfalls:

- Hand-writing CLI parsing instead of using Commander.js.
- Hand-writing MCP protocol or stdio framing instead of using
  `@modelcontextprotocol/sdk`.
- Creating JSON schemas without enforcing them through Ajv.
- Letting agents parse Markdown when a catalog or lock field should exist.
- Treating source cache as committed project content instead of reproducible
  current-code cache.

If a change touches any of these areas, explicitly check whether a mature
library, official SDK, existing TK command, or schema already covers the need.

## Expected Product Contracts

### Catalog

`data/tk.catalog.json` should describe report-level facts:

- project id and display name
- `owner/repo` and repository URL
- report path
- category and tags where available
- adoption summary where available
- architecture value where available
- license and language where available
- analysis date
- local source directory

### Source Lock

`data/tk.lock.json` should describe local source-cache state:

- `owner/repo`
- local source directory
- remote URL
- current branch
- current commit
- shallow/full clone status
- sync timestamp

### CLI

The `tk` CLI should grow around these commands:

- `tk doctor`
- `tk catalog build`
- `tk catalog validate`
- `tk search <query> --json`
- `tk inspect <project> --json`
- `tk compare <category> --json`
- `tk source path <project> --json`
- `tk source sync --all|--missing|--only <id>`
- `tk source status --json`

### MCP

The TK MCP server should expose structured agent tools such as:

- `tk_list_projects`
- `tk_search_reports`
- `tk_get_report`
- `tk_get_comparison`
- `tk_get_project_context`
- `tk_get_source_status`
- `tk_find_architecture_patterns`
- `tk_get_build_vs_buy_evidence`
- `tk_sync_plan`

## Development Workflow

1. Identify which layer is changing: report, comparison, catalog, CLI, MCP,
   skill, plugin, schema, docs, or source-cache tooling.
2. Read the nearest existing files and the relevant reference projects.
3. Keep edits scoped. Avoid unrelated report rewrites or index churn.
4. Update schemas and docs when changing machine-readable contracts.
5. Run the smallest meaningful verification:
   - syntax/type checks for scripts
   - `tk doctor` or equivalent once available
   - catalog validation for catalog/schema changes
   - plugin validation for plugin manifest changes
   - targeted smoke test for MCP tools
   - `npm run verify` from `plugins/technical-knockout` when the plugin suite is touched
6. Summarize changed layers, verification commands, and residual risk.

## Forbidden Shortcuts

- Do not claim a report or source cache is fresh without checking dates and
  source state.
- Do not let agents parse Markdown as the only stable data path once a catalog
  field exists.
- Do not commit `projects/` source caches, generated dependency folders, or
  local credentials.
- Do not introduce a registry or install command that executes arbitrary shell
  from unreviewed metadata.
- Do not copy a reference project's full process model just because it is
  well-designed; extract the architecture pattern and adapt it to TK's product
  boundary.
