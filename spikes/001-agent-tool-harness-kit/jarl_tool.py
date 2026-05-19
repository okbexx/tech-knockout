#!/usr/bin/env python3
"""Spike: minimal Agent Tool Harness Kit CLI.

This is intentionally small and disposable. It validates the interface shape:
registry -> doctor -> run -> preview bundle -> skill export.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent
REGISTRY_PATH = ROOT / "registry.json"


def emit(payload: dict[str, Any]) -> None:
    print(json.dumps(payload, ensure_ascii=False, indent=2, default=str))


def ok(data: dict[str, Any] | None = None, artifacts: list[dict[str, Any]] | None = None, warnings: list[str] | None = None, next_actions: list[str] | None = None) -> dict[str, Any]:
    return {
        "ok": True,
        "data": data or {},
        "artifacts": artifacts or [],
        "warnings": warnings or [],
        "next_actions": next_actions or [],
    }


def fail(error_type: str, message: str, fix: str | None = None) -> dict[str, Any]:
    payload = {"ok": False, "error": {"type": error_type, "message": message}}
    if fix:
        payload["error"]["fix"] = fix
    return payload


def load_registry() -> dict[str, Any]:
    return json.loads(REGISTRY_PATH.read_text(encoding="utf-8"))


def registry_list(_args: argparse.Namespace) -> int:
    emit(ok({"tools": load_registry()["tools"]}))
    return 0


def doctor(_args: argparse.Namespace) -> int:
    statuses = []
    for tool in load_registry()["tools"]:
        statuses.append(
            {
                "name": tool["name"],
                "ok": True,
                "side_effect": tool.get("side_effects", {}).get("doctor", "none"),
                "checks": [
                    {"name": "registry_entry", "ok": True},
                    {"name": "json_contract", "ok": True},
                    {"name": "preview_protocol", "ok": True},
                ],
            }
        )
    emit(ok({"statuses": statuses}))
    return 0


def slug(text: str) -> str:
    return "".join(ch.lower() if ch.isalnum() else "-" for ch in text).strip("-") or "item"


def fingerprint(data: Any) -> str:
    raw = json.dumps(data, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(raw).hexdigest()


def load_input(path: Path) -> dict[str, Any]:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        raise ValueError(f"Input file not found: {path}")
    except json.JSONDecodeError as exc:
        raise ValueError(f"Input must be JSON: {exc}")


def write_card_artifact(path: Path, title: str, body: str) -> None:
    # Text artifact stands in for generated images in this spike. The contract is the point.
    path.write_text(f"# {title}\n\n{body}\n", encoding="utf-8")


def run_generate_cards(args: argparse.Namespace) -> int:
    if args.capability != "xhs.generate-cards":
        emit(fail("unknown_capability", f"Unsupported capability: {args.capability}", "Run registry list --json"))
        return 2

    input_path = Path(args.input).expanduser().resolve()
    try:
        data = load_input(input_path)
    except ValueError as exc:
        emit(fail("invalid_input", str(exc)))
        return 1

    repos = data.get("repos") or []
    if not isinstance(repos, list) or not repos:
        emit(fail("invalid_input", "Input JSON must contain non-empty repos list"))
        return 1

    preview_root = Path(args.preview_dir).expanduser().resolve() if args.preview_dir else ROOT / ".preview"
    short_hash = fingerprint(data)[:8]
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    bundle_dir = preview_root / "xhs-image-cards" / f"{timestamp}_{short_hash}_generate-cards"
    artifacts_dir = bundle_dir / "artifacts"
    artifacts_dir.mkdir(parents=True, exist_ok=False)

    artifact_records = []
    for idx, repo in enumerate(repos[:3], start=1):
        repo_name = str(repo.get("name", f"repo-{idx}"))
        artifact_path = artifacts_dir / f"card-{idx:02d}.md"
        write_card_artifact(
            artifact_path,
            f"Card {idx}: {repo_name}",
            str(repo.get("why") or data.get("trend_summary") or "No summary."),
        )
        artifact_records.append(
            {
                "id": f"card-{idx:02d}",
                "kind": "markdown-preview",
                "role": "preview",
                "path": str(artifact_path.relative_to(bundle_dir)),
                "label": repo_name,
            }
        )

    manifest = {
        "protocol_version": "preview-bundle/v1",
        "tool": "xhs-image-cards",
        "capability": "generate_cards",
        "status": "ok",
        "created_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "source": {"input_path": str(input_path), "input_fingerprint": f"sha256:{fingerprint(data)}"},
        "summary_path": "summary.json",
        "artifacts": artifact_records,
    }
    summary = {
        "headline": f"Generated {len(artifact_records)} preview cards",
        "facts": {
            "card_count": len(artifact_records),
            "trend_summary": data.get("trend_summary", ""),
            "format": "markdown-preview spike artifact",
        },
        "warnings": ["Spike artifact uses Markdown instead of real PNG images."],
        "next_actions": [
            "Replace markdown writer with real baoyu-image-cards / gpt-image-2 backend.",
            "Keep manifest + summary contract unchanged.",
        ],
    }
    (bundle_dir / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    (bundle_dir / "summary.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")

    emit(
        ok(
            data={"bundle_dir": str(bundle_dir), "card_count": len(artifact_records)},
            artifacts=[{"kind": "preview_bundle", "path": str(bundle_dir)}],
            warnings=summary["warnings"],
            next_actions=summary["next_actions"],
        )
    )
    return 0


def skill_export(args: argparse.Namespace) -> int:
    if args.capability != "xhs.generate-cards":
        emit(fail("unknown_capability", f"Unsupported capability: {args.capability}"))
        return 2
    skill_md = """---
name: xhs-image-cards
description: Generate Xiaohongshu image card preview bundles from trend summary and repo list.
---

## When to use
Use when an agent needs to turn a GitHub Trending summary JSON into XHS-ready card artifacts.

## Inputs
- JSON file with `trend_summary` and `repos[]`.

## Commands
```bash
jarl-tool run xhs.generate-cards examples/github-trending.json --preview-dir .preview --json
jarl-tool doctor --all --json
```

## JSON output
All commands return `{ ok, data, artifacts, warnings, next_actions }`.

## Artifacts
The run command emits a `preview-bundle/v1` directory containing `manifest.json`, `summary.json`, and preview artifacts.

## Verification
Run `python3 -m pytest tests/test_harness_contract.py -q`.
"""
    emit(ok({"skill_md": skill_md}))
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="jarl-tool")
    sub = parser.add_subparsers(dest="command", required=True)

    reg = sub.add_parser("registry")
    reg_sub = reg.add_subparsers(dest="registry_command", required=True)
    reg_list = reg_sub.add_parser("list")
    reg_list.add_argument("--json", action="store_true")
    reg_list.set_defaults(func=registry_list)

    doc = sub.add_parser("doctor")
    doc.add_argument("--all", action="store_true")
    doc.add_argument("--json", action="store_true")
    doc.set_defaults(func=doctor)

    run = sub.add_parser("run")
    run.add_argument("capability")
    run.add_argument("input")
    run.add_argument("--preview-dir", default=None)
    run.add_argument("--json", action="store_true")
    run.set_defaults(func=run_generate_cards)

    skill = sub.add_parser("skill")
    skill_sub = skill.add_subparsers(dest="skill_command", required=True)
    export = skill_sub.add_parser("export")
    export.add_argument("capability")
    export.add_argument("--json", action="store_true")
    export.set_defaults(func=skill_export)

    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    return args.func(args)


if __name__ == "__main__":
    raise SystemExit(main())
