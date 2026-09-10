---
title: Orchestrator loop proof
tags:
  - sdlc-dossier
key: TMP-orchestrator-loop
work_type: enhancement
stage: requirement
status: on-hold
services: []
repos:
  - HA-Notes
jira: ''
reference_jira: []
requirement: ''
design: ''
jira_log: ''
gates_passed: []
target_completion_date: '2026-09-07'
owner: Ka
risk: low
created: '2026-09-07'
updated: '2026-09-10'
---
# Orchestrator loop proof

Throwaway dossier to prove `sdlc-orchestrator`: resolve → report → gate-check → write-back. Not a real change request. Delete once Phase 1 has a real enhancement dossier.

## Status

> [!info] Status: **on-hold** — Phase 1 proof moved to [[TMP-specimen-sorter-api]]. No raw request; do not draft a fake requirement.
> Next action: none until this fixture is deleted or reactivated

## Artifacts

| Stage | Artifact | State |
| --- | --- | --- |
| 01 Requirement | | not started |

## Gate Log

| Date | Gate | Verdict | By | Note |
| --- | --- | --- | --- | --- |

## Decision Log

- 2026-09-07 — First orchestrator turn. Resolved the single `status: active` dossier. Stage `requirement` is not in `gates_passed`. Routed skill `requirement-confirmation` is not on disk yet — stop, do not invent a requirement note.
- 2026-09-07 — Phase 1 spine landed: `requirement-confirmation`, `system-design`, `design-review-pptx` source precedence, `lis-jira-log-creator` dossier + create-after-approve. This fixture still has no raw request — do not draft a fake requirement.
- 2026-09-07 — House rule: requirement may close as `pass with assumptions` so design can start. Assumptions stay as Open Items; a later correction reopens design. Not a clean `pass`.
- 2026-09-10 — Held. Requester switched Phase 1 proof to [[TMP-specimen-sorter-api]] (design-review + JIRA log). This fixture still has no raw request.
- 2026-09-07 — House rule: system-design reads the clones in dossier `repos` (open in the workspace). Do not paste the tree. Missing clone → unverified claims become open design questions.

## Open Items

- [x] First `/sdlc-orchestrator` turn writes this Decision Log
- [ ] Gate skip to `design` is refused (or recorded as exception)
- [ ] Custom Mode: Alt+Enter on `/sdlc-orchestrator` keeps it loaded

## Links

- Skill: `LIS/skills/sdlc/sdlc-orchestrator/SKILL.md`
- Spec: [[Orchestrator Skill Spec]]
- Fixture sibling (on-hold): [[TMP-phase0-plumbing]]
- Phase 1 proof (active): [[TMP-specimen-sorter-api]]
