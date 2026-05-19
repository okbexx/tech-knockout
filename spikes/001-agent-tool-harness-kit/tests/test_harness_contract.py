import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CLI = [sys.executable, str(ROOT / "jarl_tool.py")]


def run_cli(*args):
    result = subprocess.run(CLI + list(args), cwd=ROOT, text=True, capture_output=True)
    assert result.returncode == 0, result.stderr or result.stdout
    return json.loads(result.stdout)


def test_registry_list_exposes_capabilities_and_healthcheck():
    payload = run_cli("registry", "list", "--json")
    assert payload["ok"] is True
    tools = payload["data"]["tools"]
    names = {tool["name"] for tool in tools}
    assert "xhs-image-cards" in names
    xhs = next(tool for tool in tools if tool["name"] == "xhs-image-cards")
    assert "generate_cards" in xhs["capabilities"]
    assert xhs["healthcheck"] == "xhs-image-cards doctor --json"


def test_doctor_all_reports_tool_status_without_side_effects():
    payload = run_cli("doctor", "--all", "--json")
    assert payload["ok"] is True
    statuses = payload["data"]["statuses"]
    assert statuses[0]["name"] == "xhs-image-cards"
    assert statuses[0]["ok"] is True
    assert statuses[0]["side_effect"] == "none"


def test_run_generate_cards_creates_preview_bundle(tmp_path):
    input_path = ROOT / "examples" / "github-trending.json"
    out_dir = tmp_path / "preview"
    payload = run_cli(
        "run",
        "xhs.generate-cards",
        str(input_path),
        "--preview-dir",
        str(out_dir),
        "--json",
    )
    assert payload["ok"] is True
    bundle_dir = Path(payload["artifacts"][0]["path"])
    assert bundle_dir.exists()
    manifest = json.loads((bundle_dir / "manifest.json").read_text())
    summary = json.loads((bundle_dir / "summary.json").read_text())
    assert manifest["protocol_version"] == "preview-bundle/v1"
    assert manifest["tool"] == "xhs-image-cards"
    assert manifest["capability"] == "generate_cards"
    assert len(manifest["artifacts"]) == 3
    assert summary["facts"]["card_count"] == 3


def test_skill_export_contains_agent_contract_sections():
    payload = run_cli("skill", "export", "xhs.generate-cards", "--json")
    assert payload["ok"] is True
    skill = payload["data"]["skill_md"]
    assert "name: xhs-image-cards" in skill
    assert "## JSON output" in skill
    assert "## Artifacts" in skill
    assert "## Verification" in skill
