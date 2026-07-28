# TK Multi-Agent Adapter Architecture

Technical Knockout is an agent-native capability replication system.

Its architecture target is multi-agent interoperability: one host-neutral core,
stable machine contracts, and thin adapters for multiple agent hosts.

The main product job is to help an agent turn a proven open-source capability
into a current-project implementation boundary, with evidence, build-vs-buy
discipline, and verification.

The product is intentionally layered:

| Layer | Responsibility |
|---|---|
| Reports and comparisons | Human-readable research, judgment, and architecture analysis |
| Catalog, source lock, and replication runs | Machine-readable project facts, local source-cache state, and persisted replication artifacts |
| CLI | Deterministic local operations: plan, brief rendering, verify, catalog, source sync, doctor, report audit/lint/fix, run inspection |
| MCP | Structured read-mostly access for agents: plan, verify, runs, doctor, context, and evidence |
| Skills | Agent behavior: when to use TK and how to replicate capabilities with evidence |
| Agent host adapters | Thin installable integrations for Codex, OpenCode, and Hermes; Claude Code is explicitly deferred |
| npm package | User-facing CLI and installer entry |

## Directory Boundary

TK uses an npm workspace so the reusable, host-neutral runtime and thin agent
host adapters can evolve independently:

| Directory | Role |
|---|---|
| `packages/tk` | `@jarl_okbe/tk` portable product core: CLI, MCP server, core logic, schemas, catalog snapshots, report/comparison snapshots |
| `plugins/technical-knockout` | Codex-native adapter: `.codex-plugin/plugin.json`, synchronized Skills, plugin README, MCP launch config |

The portable core is the product boundary; no agent host owns it. Every host
adapter must stay small and must not become a second package or hidden runtime
root. A host may copy installed adapter directories into a cache, so
adapter-local configuration must not depend on parent-relative paths such as
`../../packages/tk`.

## Agent Host Adapter Contract

TK targets multiple coding agents through one portable core and host-native
adapters. Each adapter must:

1. Invoke the published CLI and MCP server rather than copy TK business logic.
2. Map TK routing and replication guidance into the host's native Skill,
   instruction, plugin, extension, or configuration surface.
3. Preserve the shared catalog, plan, verification, trace, and dependency
   evidence schemas without host-specific forks.
4. Expose host-appropriate install, readiness, update, and removal guidance.
5. Respect the host's sandbox, approval, and tool-discovery model.
6. Add adapter-specific validation without weakening shared runtime checks.

Codex, OpenCode, and Hermes are the first supported adapters and prove this
contract; no single host limits the architecture. A new agent integration
should add only the thin host mapping required by that agent and reuse
`@jarl_okbe/tk` unchanged.

## Build-vs-Buy Policy

TK product infrastructure should use mature libraries for durable surfaces:

| Need | Decision |
|---|---|
| CLI command parsing | Commander.js |
| MCP stdio server and tool protocol | Official `@modelcontextprotocol/sdk` |
| JSON Schema validation | Ajv draft 2020-12 |
| TOML manifest parsing | `smol-toml` |
| CLI package distribution | npm package with `bin.tk` |
| Agent host distribution | Codex marketplace plugin; OpenCode global JSONC configuration; Hermes global YAML configuration; future hosts use their native plugin, extension, Skill, or configuration mechanism |

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

## Report Structure Governance

TK now treats report structure as part of the product control plane, not just an editorial preference.

- Contract: [`tk-report-structure-contract-v1.md`](./tk-report-structure-contract-v1.md)
- Rollout plan: [`tk-report-structure-rollout-plan.md`](./tk-report-structure-rollout-plan.md)
- Enforcement surface: `tk report audit`, `tk report lint`, `tk report fix-headings`
- Machine artifact: `packages/tk/data/report-structure-audit.json`

The design rule is:

> strict on the decision skeleton, tolerant on narrative granularity.

Only the minimum cross-report decision frame is hard-gated. Deeper architecture subsections, legacy aliases, and optional deep-dives remain warning-level so the repository can migrate incrementally.

## Distribution Policy

TK uses a portable-core plus host-adapter distribution model:

- `@jarl_okbe/tk` on npm is the host-neutral CLI, MCP server, schemas, and
  installer entry.
- Agent integrations are thin adapters over that package and its stable
  machine-readable contracts.
- `plugins/technical-knockout` is the Codex-native shipping adapter.
- `tk opencode` and `tk hermes` are config-based adapters shipped by the portable npm package.

The npm package exposes host-neutral commands such as `tk doctor`, `tk search`,
`tk plan`, `tk verify`, and the main human-readable replication entry:

```bash
tk replicate "agent internet capability layer" --from agent-reach
```

And the structured workflow beneath it:

```bash
tk plan "agent internet capability layer" --from agent-reach --json
tk verify "agent internet capability layer" --from agent-reach --json
tk run list --json
tk run show <run-id> --json
```

The first-release host lifecycle is:

```bash
tk codex install|status|refresh|remove
tk opencode install|status|refresh|remove
tk hermes install|status|refresh|remove
tk plan "agent internet capability layer" --from agent-reach
tk verify "agent internet capability layer" --from agent-reach
tk run list
```

Every adapter exposes equivalent lifecycle guidance while invoking the same
`tk plan`, `tk verify`, `tk run`, CLI, MCP, Skills, and schema contracts.

`replicate` remains the human-readable brief view for users who want direct text output.

`status` is the readiness contract for every supported host. Codex checks its
CLI, marketplace, and plugin. OpenCode and Hermes check their parsed global
configuration, all canonical installed Skills, and the shared MCP command.
`refresh` reapplies current package state; `remove` deletes only TK-owned host
registrations while preserving unrelated user configuration.

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

Every supported adapter starts the shared MCP server through the published package:

```bash
npx --yes --package @jarl_okbe/tk tk-mcp-server
```

Codex must use a durable GitHub repository or explicit local checkout for its
marketplace, never an ephemeral `npx` cache. OpenCode and Hermes copy canonical
Skills to TK's OS-specific user data root and register that durable path in
their global configuration.

## Capability Maturity

TK targets **L6 portable product** maturity through a host-neutral npm package,
CLI, MCP server, canonical Skills, schemas, install guidance, doctor checks,
and verification. Codex, OpenCode, and Hermes are the first shipping adapters,
not the product boundary. Additional adapters must reuse the same portable core
and machine contracts rather than introduce host-specific TK implementations.

| Layer | Role |
|---|---|
| Skill | Trigger, capability replication workflow, build-vs-buy discipline |
| CLI | Deterministic local execution, plan, brief rendering, verify, run inspection, source sync, report governance, validation |
| MCP | Structured read-mostly context plus plan / verify / runs / doctor tools for agents |
| Schemas | Stable machine contracts for catalog, source lock, replication plan, verification result, and run trace |
| Docs | Architecture decisions, runtime artifact rules, safety boundary, and verification contract |
| Host adapters | Native installation, tool discovery, routing instructions, and lifecycle mapping for each supported agent |

Do not add Memory or Long-task machinery just to make the structure look
complete. Add them only when TK owns cross-session replication tasks or durable
decision memory beyond repo docs.

## Verification Contract

Changes to the portable core or any host adapter should pass:

```bash
npm run verify
npm publish --workspace @jarl_okbe/tk --access public --dry-run
```

The verify script covers syntax checks, report lint, catalog validation, split doctor scopes, fixture regression, package boundaries, config-preservation tests, and MCP smoke. Each host adapter must also run its native manifest, Skill/instruction, configuration, and integration validators where such validators exist.

See [`tk-replication-runtime.md`](./tk-replication-runtime.md) for the detailed plan / verification / trace runtime contract and artifact layout.

## Control Plane / Data Plane

The control plane is the TK catalog, CLI, MCP server, skills, schemas, and doctor checks. It decides what evidence exists, what is stale, and what an agent should read next.

The data plane is the report text, comparison text, local source cache, and persisted replication run artifacts. Source repositories are not committed to TK and should be treated as reproducible local cache.

## Plan-first Replication Runtime

Capability replication now flows through a shared core workflow:

```text
capability -> references -> plan.json -> brief.md -> verification.json -> trace.json
```

This keeps CLI and MCP aligned on the same object model. The key rule is:

> `replicate` is a rendered view; `plan`, `verification`, and `trace` are the primary contracts.

### Runtime artifacts

Inside a TK repository checkout, persisted runs live under:

```text
packages/tk/data/runs/<run-id>/
```

Inside the published package they live in the OS-specific user data directory, unless `TK_RUNTIME_DATA_ROOT` overrides the location.

Each run stores:

- `input.json`
- `references.json`
- `plan.json`
- `brief.md`
- `verification.json`
- `trace.json`

`packages/tk/data/runs/` is runtime output and is intentionally ignored by Git.

### Doctor scopes

`tk doctor` is split into two layers:

- `tk doctor repo` — reports/comparisons presence, catalog validity, replication schema availability
- `tk doctor runtime` — source cache state, dirty sources, runtime data root writability, run artifact root writability

The aggregate `tk doctor` command combines both scopes for one summary verdict.

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

## Default Technical-Research Routing

An installed agent adapter should make TK the curated research source for
technical research, architecture, library/framework/tool selection,
open-source evaluation, and build-vs-buy requests even when the user does not
name TK. Inclusion in TK is the maintainer's project-selection decision; the
agent does not reopen candidate discovery on the web. The routing boundary is:

1. Inspect the current project when relevant.
2. Use read-only TK catalog, comparison, report, dependency, and project-context tools.
3. Use replication plan tools only when the user intends to implement a comparable capability.
4. Use local TK source as the implementation-verification layer, not the first discovery layer.
5. If TK has no relevant match, report “no curated TK coverage” and stop candidate research.

Each host adapter exposes capabilities through its native manifest,
configuration, or extension mechanism. The portable `tk-reference-discovery`
Skill owns the routing policy; a host-specific prompt shortcut is not proof of
automatic routing. Codex manifest prompts, OpenCode Skills paths, and Hermes
external Skill directories are three implementations of this adapter contract.

## Deferred Claude Code Adapter

Claude Code is intentionally outside the first supported release. Its later
adapter must satisfy the same lifecycle (`install`, `status`, `refresh`,
`remove`), load the package-owned canonical Skills, start the shared published
MCP server, preserve unrelated user configuration, and pass host-native
validation. It must not copy TK core logic or fork catalog, plan, verification,
trace, or Skill contracts. Until those requirements are implemented and
smoke-tested against Claude Code's native surfaces, documentation must label
Claude Code as deferred rather than supported.

## Agent Usage Contract

Agents should use TK in this order for capability replication:

1. Current project evidence.
2. `tk plan "<capability>" --json` or MCP `tk_plan_replication`.
3. `tk verify <run-id>` / `tk verify "<capability>" --json` or MCP `tk_verify_replication`.
4. `tk deps <project> --json` or MCP `tk_get_dependency_evidence` for build-vs-buy dependency decisions.
5. `tk run show <run-id> --json` or MCP `tk_get_run_trace` when the full persisted artifact chain matters.
6. TK comparison documents.
7. TK report documents.
8. Source-cache evidence when implementation details matter.
9. A bounded coverage statement; no external candidate discovery unless the user explicitly broadens scope.

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
