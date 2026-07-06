# TK Replication Runtime

Technical Knockout now treats capability replication as a **plan-first, artifact-backed workflow** instead of a one-shot brief renderer.

The design goal is simple:

> one core workflow, shared by CLI and MCP, with machine-readable contracts first and human-readable markdown as a view layer.

## Why this exists

Earlier TK behavior was good at producing a brief, but weak at giving agents and maintainers a durable object model. The current runtime adds:

- stable contracts for `plan`, `verification`, and `trace`
- persisted run artifacts that can be re-opened later
- the same execution path for CLI and MCP
- split doctor checks for repo assets vs runtime health
- fixture regression that tests a real capability chain instead of only server startup

## Workflow

```text
capability request
  -> resolve references
  -> build plan.json
  -> render brief.md
  -> verify contract
  -> write trace.json
  -> list/show later by run id
```

### Human-facing commands

```bash
tk plan "agent internet capability layer" --from agent-reach
tk verify "agent internet capability layer" --from agent-reach
tk run list
tk run show <run-id>
```

### MCP tools

- `tk_plan_replication`
- `tk_verify_replication`
- `tk_list_runs`
- `tk_get_run_trace`
- `tk_doctor`

## Contracts

| Contract | File | Purpose |
|---|---|---|
| Catalog | `packages/tk/schemas/catalog.schema.json` | Structured project and comparison inventory |
| Source lock | `packages/tk/schemas/source-lock.schema.json` | Local source-cache state snapshot |
| Replication plan | `packages/tk/schemas/replication-plan.schema.json` | Capability replication kernel, ladder, references, contract id |
| Verification result | `packages/tk/schemas/verification-result.schema.json` | Pass/warn/fail result plus check details |
| Run trace | `packages/tk/schemas/run-trace.schema.json` | Run-level artifact and step summary |

`replicate` is now a rendering surface over the structured plan, not the primary data model.

## Run Artifacts

Inside a repository checkout, TK writes runs to:

```text
packages/tk/data/runs/<run-id>/
```

Inside the published npm package, TK writes to the OS-specific user data directory. Override with:

```bash
export TK_RUNTIME_DATA_ROOT=/absolute/path
```

Each run stores:

```text
runs/<run-id>/
├── input.json
├── references.json
├── plan.json
├── brief.md
├── verification.json
└── trace.json
```

### Artifact meaning

| File | Meaning |
|---|---|
| `input.json` | Capability text, reference selector, limit, and run metadata |
| `references.json` | Resolved TK project objects used as evidence |
| `plan.json` | Machine-readable replication plan |
| `brief.md` | Human-readable brief for direct reading or paste into Codex |
| `verification.json` | Verification result and check outcomes |
| `trace.json` | Step-level summary for `plan` / `verify` lifecycle |

`data/runs/` is intentionally ignored by Git so runtime output does not pollute source diffs.

## Doctor Scopes

TK doctor is now split into **repo** and **runtime**.

### `tk doctor repo`
Checks the control-plane assets that should exist inside the package/repo:

- reports available
- comparisons available
- catalog schema validity
- replication schema availability

### `tk doctor runtime`
Checks the data-plane/runtime surfaces:

- source caches known / present
- dirty source caches
- runtime data root writable
- run artifact root writable

### `tk doctor`
Aggregates both scopes for a single health verdict.

## Verification Discipline

Current verification is intentionally layered:

```bash
npm run check --workspace @jarl_okbe/tk
npm run doctor:repo --workspace @jarl_okbe/tk
npm run doctor:runtime --workspace @jarl_okbe/tk
npm run fixtures:regression --workspace @jarl_okbe/tk
npm run benchmark:capabilities --workspace @jarl_okbe/tk
npm run mcp:smoke --workspace @jarl_okbe/tk
npm run verify --workspace @jarl_okbe/tk
```

### What each step proves

| Command | Proof |
|---|---|
| `check` | Syntax surface is valid |
| `doctor:repo` | Repo/package assets and schemas are present |
| `doctor:runtime` | Runtime roots are usable and source-cache checks run |
| `fixtures:regression` | A real multi-fixture `plan -> verify -> list/show trace` path works in a temporary runtime data root |
| `benchmark:capabilities` | The fixture suite also emits capability-level density/timing metrics for kernel, mustKeep, canAdapt, risks, and end-to-end latency |
| `mcp:smoke` | MCP exposes the runtime workflow and can execute it |
| `verify` | The full P0 contract chain still works together |

## Current Fixture Strategy

The fixture suite now covers four stable capability families:

- `agent-reach-plan-verify` → `agent internet capability layer`
- `code-intelligence-plan-verify` → `local code intelligence MCP`
- `coding-runtime-plan-verify` → `durable coding agent runtime`
- `graphrag-plan-verify` → `GraphRAG retrieval kernel`

Each fixture asserts:

- selected reference ids
- verification contract id
- expected verification status / warning surface
- minimum density for `kernel` / `mustKeep` / `canAdapt` / `risks`
- persisted artifact contract (`input.json`, `references.json`, `plan.json`, `brief.md`, `trace.json`, `verification.json`)
- ordered trace steps (`resolve_references -> build_plan -> verify`)

This keeps TK honest across more than one capability shape while still tolerating the normal `source_backing` warning when local source caches are intentionally absent.

## Control Plane vs Data Plane

| Plane | TK surface |
|---|---|
| Control plane | schemas, catalog, CLI/MCP command surfaces, doctor repo, verification contracts |
| Data plane | source caches, run artifacts, brief/trace/verification outputs, doctor runtime |

This split keeps TK honest: the product should not confuse package assets with mutable runtime evidence.

## Recommended User Flow

For direct use:

1. `tk plan "<capability>" --from <project>`
2. read the rendered brief or inspect `plan.json`
3. `tk verify <run-id>` or verify by capability
4. `tk run show <run-id>` when you need the full trace later

For agent use:

1. `tk_plan_replication`
2. `tk_verify_replication`
3. `tk_get_run_trace`
4. `tk_list_runs` for recent history

This keeps both human and agent entrypoints aligned on the same core workflow.
