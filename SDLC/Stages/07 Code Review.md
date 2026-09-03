---
title: 07 Code Review
tags:
  - sdlc
  - sdlc-stage
stage_key: code-review
skill: code-review
skill_status: build
automation_level: A
created: 2026-09-03
status: blueprint
---

# 07 Code Review

Part of [[SDLC Agentic Workflow]]. Owning skill: **`code-review`** — *to build*, absorbing `phase-review` and `sonar-scan-fix`. Level **A** (agent-run, human adjudicates).

## Purpose

Review the diff against three things at once: the design, the team's architecture rules, and general correctness. The first of those is what a human reviewer usually cannot do quickly and an agent can — because the design note is right there.

## Entry criteria

- Development gate passed, PR exists
- Design note and change log available

## Inputs

| Input | Source |
|---|---|
| Diff | `git diff <base>...<head>` in the local clone |
| Intent | `02 System Design.md` |
| Claimed changes | `06 Code Change Log.md` |
| Team rules | `lis-architecture`, `data-source-usage`, `lis-audit-logging`, `lis-als-logger`, `react-best-practices`, `lis-hub-lib-components`, `lis-message-box-usage` |
| Static analysis | SonarQube report |

## Review dimensions

1. **Design conformance** — does the diff implement the design, all of it, and only it? Flag both *missing* and *extra*. Extra is the more dangerous of the two in a change-controlled environment.
2. **Architecture rules** — the V-style violation checks from `phase-review`, sourced from `lis-architecture` rather than hardcoded.
3. **Correctness** — null handling (your PostgreSQL nullable-column notes are directly relevant), transaction boundaries, concurrency, error paths, timezone handling.
4. **Data access** — dynamic data source routing, XA/JTA boundaries where applicable.
5. **Observability** — are the log markers the change log claims actually in the code?
6. **Security and audit** — audit logging on the paths that need it, no secrets in code, no PHI in logs.
7. **Test adequacy** — is each `Rn` covered?

## Output — `07 Code Review.md`

Findings table: severity (`blocker` / `major` / `minor` / `nit`), file:line, dimension, what is wrong, concrete fix. Plus a coverage matrix `Rn` → files → tests.

## Exit gate

- [ ] Zero `blocker` findings open
- [ ] Every `major` finding fixed or accepted with a recorded reason
- [ ] SonarQube: no new blockers or criticals
- [ ] Design conformance section says "no unexplained extras"
- [ ] A human has approved the PR

## Human checkpoint

**Required.** The agent produces findings; a person approves the PR. Do not let agent approval count as review approval — that is the audit trail that matters if something goes wrong in production.

## Notes

> [!warning] Reviewing your own agent's code
> When stage 06 was agent-assisted, running stage 07 with the same model in the same session is weak review — it tends to confirm its own choices. Run code review in a **fresh session** with only the diff, the design note and the rules loaded. Cheap to do, and it changes the findings noticeably.
