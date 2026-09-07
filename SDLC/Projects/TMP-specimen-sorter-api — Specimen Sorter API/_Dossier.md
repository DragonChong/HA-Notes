---
title: Specimen Sorter API
tags:
  - sdlc-dossier
key: TMP-specimen-sorter-api
work_type: project
stage: requirement
status: active
services:
  - lis-crs-spec-ack-svc
  - lab-crs-app
  - lis-hub-svc
repos:
  - lis-crs-spec-ack-svc
  - lab-crs-app
  - lis-hub-svc
jira: ''
reference_jira:
  - SEM20260612
requirement: '[[01 Requirement Confirmation]]'
design: ''
jira_log: ''
gates_passed: []
target_completion_date: ''
owner: Ka
risk: high
created: '2026-09-07'
updated: '2026-09-07'
---
# Specimen Sorter API

## Status

> [!info] Stage: **requirement** — gate `requirement` outstanding
> Next action: orchestrator may close `requirement` with verdict **`pass`**, then `/system-design`

## Artifacts

| Stage | Artifact | State |
|---|---|---|
| 01 Requirement | [[01 Requirement Confirmation]] | draft — requester confirmed 2026-09-07; verdict `pass` ready |

## Gate Log

| Date | Gate | Verdict | By | Note |
|---|---|---|

## Decision Log

- 2026-09-07 — Opened this dossier. Drafted [[01 Requirement Confirmation]]. Gate left open. — agent
- 2026-09-07 — First answer set recorded (Q1–Q18; five TBC). — agent
- 2026-09-07 — Remaining TBCs answered: Q2 sorter sends hospital (mapping table still fallback); Q5 DFT/STAR in; Q9 ALS only; Q12 unbox as STAR-in; Q17 p95 < 4 s, ~20/min, sync. All `Rn` set to `confirmed`. Requirement skill verdict **`pass`**. Gate not closed by this skill. — agent

## Open Items

- [x] Q2 — sorter sends hospital; mapping table if omitted
- [x] Q5 — DFT / STAR in (APS/BBS/MBS still out)
- [x] Q9 — soft alerts ALS only
- [x] Q12 — unbox follows STAR
- [x] Q17 — p95 < 4 s; ~20/min; sync
- [ ] Orchestrator closes `requirement` (`pass`), then `/system-design`

## Links

- Services: `lis-crs-spec-ack-svc`, `lab-crs-app`, `lis-hub-svc`
- Prior questionnaire: [[LIS/Project Plans/Specimen Sorter/Requirement Confirmation]]
- Related dossiers: none
- Source deck: `G:/Request/BackEnd/Specimen Sorter/USID Auto-Registration Flow.deck.json`
