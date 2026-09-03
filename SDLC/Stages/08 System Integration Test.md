---
title: 08 System Integration Test
tags:
  - sdlc
  - sdlc-stage
stage_key: sit
skill: sit-test-report
skill_status: build
automation_level: B
created: 2026-09-03
status: blueprint
---

# 08 System Integration Test

Part of [[SDLC Agentic Workflow]]. Owning skill: **`sit-test-report`** — *to build*. Level **B**.

## Purpose

Derive the test cases from the requirements, help execute them across DEVQA and SIT, and produce the Test Report `.docx` with the SonarQube scan result attached.

## Entry criteria

- Code review gate passed
- Build deployed to DEVQA and/or SIT

## Two phases

### 8a — Test case derivation (before execution)

Generated from acceptance criteria, one case per criterion, plus negative and boundary cases the agent proposes from the design's error-handling section.

| Field | Notes |
|---|---|
| Case ID | `TC-<Rn>-<seq>` — keeps traceability visible in the ID itself |
| Requirement | `Rn` |
| Environment | DEVQA / SIT |
| Precondition | Data setup, config state, feature-flag state |
| Steps | |
| Expected result | |
| Actual result | Filled at execution |
| Evidence | Screenshot / log extract / SQL output in `assets/` |
| Verdict | Pass / Fail / Blocked / N/A |

### 8b — Report assembly (after execution)

Markdown note is the source of truth; the `.docx` is a render of it via the `docx` capability.

Report sections: scope and build under test · environments and versions · test case results table · defects raised and their status · **SonarQube scan report** (quality gate, new issues, coverage, duplication) · requirement coverage matrix `Rn` → cases → verdict · outstanding risks · sign-off block.

## Output

- `SDLC/Projects/<key>/08 SIT Test Report.md` — source of truth
- `SDLC/Projects/<key>/assets/<key> SIT Test Report.docx` — the deliverable
- Evidence files in `assets/`

## Exit gate

- [ ] Every `Rn` has at least one passing case
- [ ] No open defect at severity high or above
- [ ] SonarQube quality gate passed and the report is embedded, not just referenced
- [ ] Both DEVQA and SIT covered where the plan says so
- [ ] Sign-off block completed by a person

## Human checkpoint

**Required.** Execution and verdicts are human. The agent derives cases, chases coverage gaps, assembles evidence and renders the document.

## Notes

- Ask the agent to run the coverage matrix *before* execution starts. A requirement with no test case is much cheaper to fix on day one of SIT than on the last day.
