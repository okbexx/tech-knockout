# TK Agent Plugin Architecture

Technical Knockout is an agent-native capability replication system.

The main product job is to help an agent turn a proven open-source capability
into a current-project implementation boundary, with evidence, build-vs-buy
discipline, and verification.

The product is intentionally layered:

| Layer | Responsibility |
|---|---|
| Reports and comparisons | Human-readable research, judgment, and architecture analysis |
| Catalog and source lock | Machine-readable project facts and local source-cache state |
| CLI | Deterministic local operations: replication brief, catalog, source sync, validation, doctor |
| MCP | Structured read-mostly access for agents and replication brief construction |
| Skills | Agent behavior: when to use TK and how to replicate capabilities with evidence |
| Codex plugin | Installable distribution unit |
| npm package | User-facing CLI and installer entry |

## Directory Boundary

TK uses an npm workspace so the reusable runtime and the Codex adapter can
evolve independently:

| Directory | Role |
|---|---|
| `packages/tk` | `@jarl_okbe/tk` npm package: CLI, MCP server, core logic, schemas, catalog snapshots, report/comparison snapshots |
| `plugins/technical-knockout` | Codex plugin adapter: `.codex-plugin/plugin.json`, Skills, plugin README, MCP launch config |

The plugin adapter must stay small. It should not become a second npm package
or a hidden runtime root. Codex may copy installed plugin directories into a
cache, so plugin-local config must not depend on parent-relative paths such as
`../../packages/tk`.

## Build-vs-Buy Policy

TK product infrastructure should use mature libraries for durable surfaces:

| Need | Decision |
|---|---|
| CLI command parsing | Commander.js |
| MCP stdio server and tool protocol | Official `@modelcontextprotocol/sdk` |
| JSON Schema validation | Ajv draft 2020-12 |
| TOML manifest parsing | `smol-toml` |
| CLI package distribution | npm package with `bin.tk` |
| Codex plugin distribution | Codex marketplace source remains the long-lived plugin source |

Self-built code should stay at the TK business boundary: catalog field mapping,
source-cache planning, report judgment, and agent workflow semantics.

## Dependency Evidence Policy

TK treats dependency and SDK choices as build-vs-buy evidence.

Each report must contain `### 依赖 / SDK 选型证据`, where authors explain the
key libraries, SDKs, CLIs, protocols, parsers, storage engines, UI frameworks,
and runtimes that materially affect replication decisions.

The catalog stores two dependency surfaces:

- `project.dependencies`: the full direct dependency list parsed from source
  manifests such as `package.json`, `pyproject.toml`, `requirements.txt`,
  `go.mod`, and `Cargo.toml`. This excludes lockfile transitive dependencies.
- `project.dependencyEvidence`: curated report rows explaining what a key
  dependency solves, where the evidence is, when to reuse it, and when not to.

Agents should use `tk deps <project> --json` or MCP
`tk_get_dependency_evidence` before recommending new infrastructure. A
reference dependency is evidence to evaluate, not an automatic install
recommendation.

## Distribution Policy

TK uses a split distribution model:

- `@jarl_okbe/tk` on npm is the human-facing CLI and installer entry.
- `plugins/technical-knockout` in the `tech-knockout` repository is the
  long-lived Codex plugin adapter.

The npm package can run `tk doctor`, `tk search`, and `tk codex install`.
It also exposes the main capability replication entry:

```bash
tk replicate "agent internet capability layer" --from agent-reach
```

The user-facing product lifecycle is:

```bash
tk codex install
tk codex status
tk replicate "agent internet capability layer" --from agent-reach
tk codex refresh
```

`status` gives users a direct readiness check for the Codex CLI, marketplace,
and plugin. `refresh` wraps the official Codex remove/add flow so local plugin
development does not require users to remember raw plugin commands.

The value proof lives in [`value-proof.md`](./value-proof.md). New product
surfaces should be justified by a value proof before TK grows a larger runtime.

`tk codex install` wraps official Codex CLI commands instead of reimplementing
plugin installation state:

```bash
codex plugin marketplace add okbexx/tech-knockout
codex plugin add technical-knockout@tech-knockout
```

Publish the npm package from the workspace root:

```bash
npm publish --workspace @jarl_okbe/tk --access public
```

The plugin-provided MCP server starts through the published package:

```bash
npx --yes --package @jarl_okbe/tk tk-mcp-server
```

Do not point Codex at an ephemeral `npx` cache directory as the durable plugin
marketplace. The durable marketplace should be the GitHub repository or an
explicit local checkout.

## Capability Maturity

TK's agent plugin suite targets **L6 portable product** maturity for the Codex
path: npm package, CLI, MCP, Skills, plugin adapter, install docs, doctor, and
verification. Cross-agent adapters can be added later when the Codex path has
enough user evidence.

| Layer | Role |
|---|---|
| Skill | Trigger, capability replication workflow, build-vs-buy discipline |
| CLI | Deterministic local execution, replication brief, writes, source sync, validation |
| MCP | Structured read-mostly context, replication brief, and tool discovery for agents |
| Schemas | Stable machine contracts for catalog and source lock |
| Docs | Architecture decisions, safety boundary, and verification contract |

Do not add Memory or Long-task machinery just to make the structure look
complete. Add them only when TK owns cross-session replication tasks or durable
decision memory beyond repo docs.

## Verification Contract

Changes to the plugin suite should pass:

```bash
npm run verify
npm publish --workspace @jarl_okbe/tk --access public --dry-run
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

The data plane is the report text, comparison text, and local source cache.
Source repositories are not committed to TK and should be treated as
reproducible local cache.

## Source Cache Policy

`projects/<owner>__<repo>` is the canonical cache layout. Inside a TK repository
checkout, that layout lives under the repository root and is ignored by Git.
When TK runs from the npm package, the same layout lives under the OS-specific
user cache directory. Set `TK_SOURCE_ROOT` to override the source cache root.
`tk source sync` can recreate missing caches from catalog metadata.

The source cache is a current-code cache, not a history analysis database. TK
uses shallow clones by default so agents can inspect the full current working
tree without paying for full Git history.

`tk source status --write-lock` records current local state: branch, commit,
shallow/full clone state, dirty state, and remote URL. From a TK checkout this
writes `data/tk.lock.json`; from the npm package it writes to the OS-specific
user data directory. Set `TK_RUNTIME_DATA_ROOT` to override that location.

Agents that need source code should resolve the project through catalog/context,
check source status, then read files directly from the path returned by
`tk source path <project> --json`. MCP tools should expose the path and state;
CLI commands perform network or write side effects.

## Agent Usage Contract

Agents should use TK in this order for capability replication:

1. Current project evidence.
2. `tk replicate "<capability>" --json` or MCP `tk_build_replication_brief`.
3. `tk deps <project> --json` or MCP `tk_get_dependency_evidence` for
   build-vs-buy dependency decisions.
4. TK comparison documents.
5. TK report documents.
6. Source-cache evidence when implementation details matter.
7. Official/current upstream verification when time-sensitive facts matter.

The required user-facing output is:

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

The ladder is TK's product discipline:

1. Skip the capability if the current project does not need it.
2. Reuse current-project code or nearby patterns.
3. Prefer standard library and native platform features.
4. Prefer already-installed dependencies.
5. Prefer official SDKs and mature OSS.
6. Use TK references only to extract the smallest capability kernel.
7. Implement the smallest verifiable boundary.
8. Add new infrastructure only when evidence proves the smaller rungs fail.

## Safety

MCP tools are read-mostly. Source sync, catalog writes, and doctor updates are
CLI operations so sandbox and approval behavior remains clear.
