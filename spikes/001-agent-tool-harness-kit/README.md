# 001: Agent Tool Harness Kit

## Question

Given an internal tool capability, when an agent needs to discover, validate, run, and inspect it, can a small CLI contract provide a stable minimum interface without adopting CLI-Anything's full monorepo complexity?

## Approach

Build a disposable `jarl_tool.py` spike with one fake-but-contractual tool: `xhs-image-cards`.

It validates the minimum architecture shape:

- `registry list --json` exposes tools, capabilities, healthchecks, side-effect metadata
- `doctor --all --json` reports tool health without side effects
- `run xhs.generate-cards ... --json` creates a `preview-bundle/v1`
- `skill export xhs.generate-cards --json` emits Agent-readable `SKILL.md`
- pytest contract tests lock the JSON and preview bundle shape

## Run

```bash
cd ~/tech-knockout/spikes/001-agent-tool-harness-kit
python3 jarl_tool.py registry list --json
python3 jarl_tool.py doctor --all --json
python3 jarl_tool.py run xhs.generate-cards examples/github-trending.json --preview-dir /tmp/jarl-tool-spike-preview --json
python3 jarl_tool.py skill export xhs.generate-cards --json
python3 -m pytest tests/test_harness_contract.py -q
```

## Results

- Registry works and returns the `xhs-image-cards` capability record.
- Doctor works and distinguishes `side_effect: none`.
- Run command creates a preview bundle:
  - `manifest.json`
  - `summary.json`
  - `artifacts/card-01.md` ... `card-03.md`
- Skill export returns a usable `SKILL.md` skeleton with JSON output / artifacts / verification sections.
- Tests pass: `4 passed in 0.52s`.

## Evidence

Example preview bundle from the demo run:

```text
/tmp/jarl-tool-spike-preview/xhs-image-cards/20260519T024535Z_a09a928c_generate-cards/
├── manifest.json
├── summary.json
└── artifacts/
    ├── card-01.md
    ├── card-02.md
    └── card-03.md
```

## Verdict: VALIDATED

### What worked

- The minimum interface is small: registry + doctor + run + skill export.
- JSON contract is enough for Agent routing.
- Preview bundle is useful even when artifacts are only Markdown placeholders.
- Tests can lock the important behavior without building real image generation yet.

### What didn't

- The spike intentionally does not call real `baoyu-image-cards` / gpt-image-2.
- Registry is JSON, not YAML, to keep stdlib-only implementation.
- No install strategy, permissions model, or external secret handling yet.

### Surprises

- The contract is clearer than CLI-Anything's full project shape. We can keep the useful architecture while avoiding a giant monorepo.
- The `SKILL.md` export should probably be generated from registry + command metadata, not handwritten.

### Recommendation for the real build

Build a small `agent-tool-harness` package around this interface, then add real backends incrementally:

1. `xhs-image-cards` backed by the existing baoyu skill / Codex flow.
2. `distill-vault` backed by `distill` CLI.
3. `personal-site` backed by Astro build/deploy checks.

Keep the contract stable:

```json
{ "ok": true, "data": {}, "artifacts": [], "warnings": [], "next_actions": [] }
```

and require every tool to implement:

- `doctor --json`
- `run <capability> --json`
- `skill export --json`
- preview bundle for any file-producing workflow
