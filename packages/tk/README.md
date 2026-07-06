# @jarl_okbe/tk

Technical Knockout helps Codex replicate open-source capabilities with evidence.

Use it when you want Codex to build something like a proven project without copying the wrong code, architecture ceremony, or infrastructure.

TK is now **plan-first**: it produces machine-readable replication contracts and run artifacts before or alongside the human-readable brief.

## Start

Install TK into Codex and check that it is ready:

```bash
npx @jarl_okbe/tk codex install
npx @jarl_okbe/tk codex status
```

Then ask Codex from your project:

```text
Use Technical Knockout to replicate Agent Reach's internet capability layer in this repo.
```

If Codex needs the original reference code, ask:

```text
Use Technical Knockout to clone the missing reference repositories.
```

For a reference-only brief:

```bash
npx @jarl_okbe/tk replicate "agent internet capability layer" --from agent-reach
```

For the structured replication workflow:

```bash
npx @jarl_okbe/tk plan "agent internet capability layer" --from agent-reach --json
npx @jarl_okbe/tk verify "agent internet capability layer" --from agent-reach --json
npx @jarl_okbe/tk run list --json
npx @jarl_okbe/tk run show <run-id> --json
```

TK should help Codex answer what to keep, what to adapt, what not to copy, the first implementation boundary, and how to verify it.

## CLI

| Command | What it does |
|---|---|
| `tk doctor` | Aggregate repo + runtime health checks |
| `tk doctor repo` | Check reports/comparisons, catalog validity, and replication schemas |
| `tk doctor runtime` | Check source-cache state and runtime artifact roots |
| `tk plan "<capability>"` | Build a structured replication plan and persist run artifacts |
| `tk replicate "<capability>"` | Render the human-readable brief view over the structured plan |
| `tk verify "<capability-or-run-id>"` | Verify the replication contract and update the run trace |
| `tk run list` | List recent persisted runs |
| `tk run show <run-id>` | Read one persisted run with plan, trace, references, and verification |
| `tk search "<query>"` | Search TK catalog metadata |
| `tk deps <project>` | Inspect dependency / SDK evidence for one project |
| `tk source status` | Inspect local source-cache state |
| `tk source sync --missing` | Create a clone/fetch plan for missing source caches |

Examples:
- Value proof: <https://github.com/okbexx/tech-knockout/blob/main/docs/value-proof.md>
- Runtime and contracts: <https://github.com/okbexx/tech-knockout/blob/main/docs/tk-replication-runtime.md>
- Architecture notes: <https://github.com/okbexx/tech-knockout/blob/main/docs/tk-agent-plugin-architecture.md>

## Runtime Artifacts

When TK runs from a repository checkout, persisted runs live under:

```text
packages/tk/data/runs/<run-id>/
```

When TK runs from the published npm package, the same artifacts live under the OS-specific user data directory. Set `TK_RUNTIME_DATA_ROOT` to override the location.

Each run stores:

| File | Meaning |
|---|---|
| `input.json` | Capability, selected references, and invocation metadata |
| `references.json` | Resolved reference project records |
| `plan.json` | Structured replication plan validated by `replication-plan.schema.json` |
| `brief.md` | Human-readable brief rendered from the structured plan |
| `verification.json` | Verification result validated by `verification-result.schema.json` |
| `trace.json` | Run trace / step log validated by `run-trace.schema.json` |

`packages/tk/data/runs/` is runtime output, not source-controlled product content.

## MCP

The MCP server exposes the same replication workflow through structured tools:

- `tk_plan_replication`
- `tk_verify_replication`
- `tk_list_runs`
- `tk_get_run_trace`
- `tk_doctor`

Use MCP when an agent needs machine-readable results. Use CLI when a human wants direct control of writes, source sync, or local verification.

## Development

From the repository root:

```bash
npm install
npm run check --workspace @jarl_okbe/tk
npm run fixtures:regression --workspace @jarl_okbe/tk
npm run benchmark:capabilities --workspace @jarl_okbe/tk
npm run mcp:smoke --workspace @jarl_okbe/tk
npm run verify --workspace @jarl_okbe/tk
```

Publish the npm package from the workspace root:

```bash
npm publish --workspace @jarl_okbe/tk --access public
```

The Codex plugin adapter lives in `plugins/technical-knockout`; this package is the runtime used by that adapter.
