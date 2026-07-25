# Agent Skill Evaluation Suite

Automated structural evaluation + fidelity test harness for Agent Skills (SKILL.md format).

## Quick Start

```bash
# Evaluate any skill directory
python scripts/evaluate_skill.py /path/to/namespace-intelligence

# Write JSON report
python scripts/evaluate_skill.py /path/to/namespace-intelligence -o reports/namespace_eval.json

# JSON only
python scripts/evaluate_skill.py /path/to/namespace-intelligence --json
```

## What It Scores

| Dimension                        | Weight | What is measured                                      |
|----------------------------------|--------|-------------------------------------------------------|
| Spec Compliance & Portability    | 15%    | Frontmatter validity, kebab-case, directory match     |
| Trigger Quality                  | 20%    | Description specificity and activation signals        |
| Instruction Rigor + Self-Checking| 30%    | Agentic loops, mandatory audits, hard thresholds      |
| Output Contract Consistency      | 20%    | Explicit report structure and required sections       |
| Edge-Case Resilience             | 15%    | Handling of saturation, rate limits, blocked names    |

**Grading**
- ≥ 85 → Elite
- ≥ 75 → Strong
- ≥ 60 → Acceptable
- < 60 → Needs Work

## Live Fidelity Testing

The structural script catches most design flaws. For full confidence:

1. Run the positive / negative / edge-case prompts from `test_cases/namespace_intelligence.yaml` against a live agent that has the skill loaded.
2. Score each response against the `fidelity_checklist`.
3. Re-run 3–5 times per prompt to measure consistency.

## Files

```
skill-evaluation/
├── README.md
├── scripts/
│   └── evaluate_skill.py      # Main automated harness
├── test_cases/
│   └── namespace_intelligence.yaml
└── reports/                   # Output directory for JSON reports
```

## Extending

Add new test case YAML files for other skills. The structural evaluator works on any valid SKILL.md without modification.
