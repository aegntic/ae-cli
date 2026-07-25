#!/usr/bin/env python3
"""
Agent Skill Evaluation Harness
------------------------------
Automated structural + fidelity evaluation for Agent Skills (SKILL.md format).

Usage:
  python evaluate_skill.py /path/to/skill-directory [--output reports/]
  python evaluate_skill.py /path/to/skill-directory --test-cases test_cases/namespace.yaml

Scores against the elite rubric:
  - Trigger Quality          20%
  - Instruction Rigor + Self-Checking  30%
  - Output Contract Consistency 20%
  - Edge-Case Resilience     15%
  - Portability & Spec Compliance 15%
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import dataclass, field, asdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

try:
    import yaml
except ImportError:
    yaml = None


# ---------------------------------------------------------------------------
# Data models
# ---------------------------------------------------------------------------

@dataclass
class CheckResult:
    name: str
    passed: bool
    score: float          # 0.0 – 1.0
    weight: float
    details: str
    evidence: list[str] = field(default_factory=list)


@dataclass
class EvaluationReport:
    skill_name: str
    skill_path: str
    timestamp: str
    overall_score: float
    grade: str
    checks: list[CheckResult]
    recommendations: list[str]
    raw_frontmatter: dict[str, Any] = field(default_factory=dict)
    body_stats: dict[str, Any] = field(default_factory=dict)


# ---------------------------------------------------------------------------
# Parsing helpers
# ---------------------------------------------------------------------------

def parse_skill_md(skill_dir: Path) -> tuple[dict[str, Any], str]:
    skill_md = skill_dir / "SKILL.md"
    if not skill_md.exists():
        raise FileNotFoundError(f"No SKILL.md found in {skill_dir}")

    content = skill_md.read_text(encoding="utf-8")
    if not content.startswith("---"):
        raise ValueError("SKILL.md missing YAML frontmatter")

    parts = content.split("---", 2)
    if len(parts) < 3:
        raise ValueError("Malformed frontmatter")

    frontmatter_raw = parts[1].strip()
    body = parts[2].strip()

    # Minimal YAML parser for the fields we care about (no external dep required)
    frontmatter: dict[str, Any] = {}
    for line in frontmatter_raw.splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if ":" in line:
            key, _, value = line.partition(":")
            frontmatter[key.strip()] = value.strip()

    return frontmatter, body


def count_tokens_approx(text: str) -> int:
    """Rough token estimate (words * 1.3). Good enough for skill sizing."""
    words = len(re.findall(r"\b\w+\b", text))
    return int(words * 1.3)


# ---------------------------------------------------------------------------
# Individual checks
# ---------------------------------------------------------------------------

def check_spec_compliance(frontmatter: dict, body: str, skill_dir: Path) -> CheckResult:
    evidence = []
    score = 1.0
    details = []

    # Required fields
    name = frontmatter.get("name", "")
    description = frontmatter.get("description", "")

    if not name:
        score -= 0.4
        details.append("Missing required 'name' field")
    else:
        evidence.append(f"name: {name}")
        if not re.match(r"^[a-z0-9]([a-z0-9-]*[a-z0-9])?$", name):
            score -= 0.2
            details.append("name does not match kebab-case rules")
        if skill_dir.name != name:
            score -= 0.15
            details.append(f"Directory name '{skill_dir.name}' != frontmatter name '{name}'")

    if not description:
        score -= 0.4
        details.append("Missing required 'description' field")
    else:
        evidence.append(f"description length: {len(description)} chars")
        if len(description) > 1024:
            score -= 0.15
            details.append("description exceeds 1024 character limit")
        if ": " in description:
            score -= 0.1
            details.append("description contains ': ' which forces quoting (banned by strict YAML rules)")

    # Body presence
    if len(body) < 200:
        score -= 0.2
        details.append("Body is extremely short (<200 chars)")

    # Optional but recommended structure
    has_references = (skill_dir / "references").is_dir()
    has_scripts = (skill_dir / "scripts").is_dir()
    evidence.append(f"references/: {has_references}, scripts/: {has_scripts}")

    score = max(0.0, min(1.0, score))
    return CheckResult(
        name="Spec Compliance & Portability",
        passed=score >= 0.75,
        score=score,
        weight=0.15,
        details="; ".join(details) if details else "Fully compliant with Agent Skills open standard",
        evidence=evidence,
    )


def check_trigger_quality(frontmatter: dict) -> CheckResult:
    description = frontmatter.get("description", "")
    evidence = []
    score = 0.5  # baseline

    # Length and specificity
    if 80 <= len(description) <= 900:
        score += 0.15
    evidence.append(f"description length: {len(description)}")

    # Trigger richness – look for action verbs and domain terms
    trigger_signals = [
        r"\b(use when|triggers? on|when|for|check|audit|generate|validate|assess)\b",
        r"\b(domain|social|handle|namespace|brand|availability|premium)\b",
    ]
    hits = 0
    for pattern in trigger_signals:
        if re.search(pattern, description, re.I):
            hits += 1
    score += min(0.25, hits * 0.12)
    evidence.append(f"trigger signal hits: {hits}")

    # Negative: overly vague
    if re.search(r"\b(help|assist|do things|general)\b", description, re.I) and hits < 2:
        score -= 0.15
        evidence.append("possible vague language detected")

    score = max(0.0, min(1.0, score))
    return CheckResult(
        name="Trigger Quality",
        passed=score >= 0.7,
        score=score,
        weight=0.20,
        details="Description specificity and trigger coverage",
        evidence=evidence,
    )


def check_instruction_rigor(body: str) -> CheckResult:
    evidence = []
    score = 0.4

    # Mandatory loop / agentic language
    agentic_patterns = [
        r"agentic|loop|iterate|cycle|self-check|critique|verify|threshold",
        r"never present|must|mandatory|required|explicitly",
        r"confidence|score|rank|elite|threshold",
    ]
    for pat in agentic_patterns:
        if re.search(pat, body, re.I):
            score += 0.08
            evidence.append(f"found: {pat[:30]}...")

    # Self-checking indicators
    self_check_terms = ["self-check", "audit", "integrity", "consistency", "quality gate", "confidence tag"]
    found_sc = [t for t in self_check_terms if t.lower() in body.lower()]
    score += min(0.25, len(found_sc) * 0.06)
    evidence.append(f"self-check terms: {found_sc}")

    # Hard thresholds
    if re.search(r"≥|>=|threshold|composite|7\.8|elite", body, re.I):
        score += 0.1
        evidence.append("hard threshold language present")

    # Anti-patterns
    if re.search(r"\bjust do your best\b|\buse your judgment\b|\bfeel free\b", body, re.I):
        score -= 0.15
        evidence.append("vague instructional language detected")

    score = max(0.0, min(1.0, score))
    return CheckResult(
        name="Instruction Rigor + Self-Checking",
        passed=score >= 0.7,
        score=score,
        weight=0.30,
        details="Presence of agentic loops, mandatory checks, and hard quality gates",
        evidence=evidence,
    )


def check_output_contract(body: str) -> CheckResult:
    evidence = []
    score = 0.3

    # Structured output expectations
    contract_signals = [
        r"output contract|structure every response|report",
        r"ranked|shortlist|matrix|score|confidence",
        r"risk surface|acquisition path|self-check notes",
        r"loop summary|cycles run",
    ]
    for pat in contract_signals:
        if re.search(pat, body, re.I):
            score += 0.12
            evidence.append(f"contract signal: {pat[:40]}")

    # Explicit sections
    if re.search(r"## Output Contract|Namespace Intelligence Report", body, re.I):
        score += 0.15
        evidence.append("explicit Output Contract section found")

    score = max(0.0, min(1.0, score))
    return CheckResult(
        name="Output Contract Consistency",
        passed=score >= 0.65,
        score=score,
        weight=0.20,
        details="Clarity and completeness of expected final output structure",
        evidence=evidence,
    )


def check_edge_case_resilience(body: str) -> CheckResult:
    evidence = []
    score = 0.35

    resilience_signals = [
        r"if .* blocked|when primary.*taken|saturation|max .* cycles",
        r"rate limit|fewer than|abort|narrow|re-enter the loop",
        r"never present an unverified|reject any memory|live API",
        r"failure|edge case|all names taken",
    ]
    for pat in resilience_signals:
        if re.search(pat, body, re.I):
            score += 0.12
            evidence.append(f"resilience: {pat[:35]}...")

    score = max(0.0, min(1.0, score))
    return CheckResult(
        name="Edge-Case Resilience",
        passed=score >= 0.6,
        score=score,
        weight=0.15,
        details="Handling of blocked names, rate limits, and saturation",
        evidence=evidence,
    )


# ---------------------------------------------------------------------------
# Main evaluation
# ---------------------------------------------------------------------------

def evaluate(skill_dir: Path) -> EvaluationReport:
    frontmatter, body = parse_skill_md(skill_dir)

    checks = [
        check_spec_compliance(frontmatter, body, skill_dir),
        check_trigger_quality(frontmatter),
        check_instruction_rigor(body),
        check_output_contract(body),
        check_edge_case_resilience(body),
    ]

    overall = sum(c.score * c.weight for c in checks)
    overall = round(overall * 100, 1)  # 0–100 scale for readability

    if overall >= 85:
        grade = "Elite"
    elif overall >= 75:
        grade = "Strong"
    elif overall >= 60:
        grade = "Acceptable"
    else:
        grade = "Needs Work"

    recommendations = []
    for c in checks:
        if c.score < 0.7:
            recommendations.append(f"Improve {c.name}: {c.details}")

    if not recommendations:
        recommendations.append("No critical gaps detected. Proceed to live multi-run fidelity testing.")

    body_stats = {
        "approx_tokens": count_tokens_approx(body),
        "char_count": len(body),
        "has_references": (skill_dir / "references").is_dir(),
        "has_scripts": (skill_dir / "scripts").is_dir(),
    }

    return EvaluationReport(
        skill_name=frontmatter.get("name", skill_dir.name),
        skill_path=str(skill_dir),
        timestamp=datetime.now(timezone.utc).isoformat(),
        overall_score=overall,
        grade=grade,
        checks=checks,
        recommendations=recommendations,
        raw_frontmatter=frontmatter,
        body_stats=body_stats,
    )


def print_report(report: EvaluationReport) -> None:
    print("=" * 64)
    print(f"  AGENT SKILL EVALUATION REPORT")
    print("=" * 64)
    print(f"Skill        : {report.skill_name}")
    print(f"Path         : {report.skill_path}")
    print(f"Timestamp    : {report.timestamp}")
    print(f"Overall Score: {report.overall_score}/100  →  {report.grade}")
    print("-" * 64)

    for c in report.checks:
        status = "PASS" if c.passed else "FAIL"
        print(f"[{status}] {c.name}")
        print(f"       Score : {c.score:.2f}  (weight {c.weight})")
        print(f"       Detail: {c.details}")
        if c.evidence:
            for e in c.evidence[:4]:
                print(f"         • {e}")
        print()

    print("-" * 64)
    print("Recommendations:")
    for r in report.recommendations:
        print(f"  → {r}")
    print("=" * 64)


def main() -> int:
    parser = argparse.ArgumentParser(description="Evaluate an Agent Skill (SKILL.md)")
    parser.add_argument("skill_dir", type=Path, help="Path to the skill directory")
    parser.add_argument("--output", "-o", type=Path, default=None, help="Write JSON report to this path")
    parser.add_argument("--json", action="store_true", help="Print raw JSON instead of human report")
    args = parser.parse_args()

    if not args.skill_dir.is_dir():
        print(f"Error: {args.skill_dir} is not a directory", file=sys.stderr)
        return 1

    try:
        report = evaluate(args.skill_dir)
    except Exception as e:
        print(f"Evaluation failed: {e}", file=sys.stderr)
        return 1

    if args.json:
        # Convert dataclasses for JSON
        payload = asdict(report)
        print(json.dumps(payload, indent=2))
    else:
        print_report(report)

    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        with open(args.output, "w", encoding="utf-8") as f:
            json.dump(asdict(report), f, indent=2)
        print(f"\nJSON report written to {args.output}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
