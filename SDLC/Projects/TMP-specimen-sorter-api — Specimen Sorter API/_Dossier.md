---
created: '2026-09-07'
design: '[[02 System Design]]'
gates_passed: []
jira: ''
jira_log: ''
key: TMP-specimen-sorter-api
owner: Ka
reference_jira:
  - SEM20260612
repos:
  - lis-crs-spec-ack-svc
  - lab-crs-app
  - lis-hub-svc
  - lis-ecpath5-app
requirement: '[[01 Requirement Confirmation]]'
risk: high
services:
  - lis-crs-spec-ack-svc
  - lab-crs-app
  - lis-hub-svc
stage: design
status: active
tags:
  - sdlc-dossier
target_completion_date: ''
title: Specimen Sorter API
updated: '2026-09-07'
work_type: project
---
# Specimen Sorter API

## Status

> [!info] Stage: **design** — gate `design` outstanding (`requirement` proceeded under exception)
> Next action: human sets `reviewed_by` on [[02 System Design]], then `/design-review-pptx`

## Artifacts

| Stage | Artifact | State |
|---|---|---|
| 01 Requirement | [[01 Requirement Confirmation]] | confirmed 2026-09-07; not in gates_passed |
| 02 Design | [[02 System Design]] | draft |

## Gate Log

| Date | Gate | Verdict | By | Note |
|---|---|---|---|---|
| 2026-09-07 | requirement | exception | Requester | Invoked `/system-design` while `requirement` not in `gates_passed`. Confirmation already quoted in 01 with `reviewed_by: Requester`. Not treated as a clean pass. |

## Decision Log

- 2026-09-07 — Opened dossier; requirement drafted and confirmed. — agent
- 2026-09-07 — Incremental design: new POST orchestrator on `lis-crs-spec-ack-svc` reusing retrieve / sendOut / register / worksheet / PHLC. Rejected overloading staff register, ECPath5 register, a new service, and an async queue. Sorter map table + `SORT_*` audit actions. Print after HTTP return. — agent

## Open Items

- [ ] D1 — middleware auth (NetworkPolicy + API key?)
- [ ] D2 — technical user / workstation on audit rows
- [ ] D3 — mixed local + send-out
- [ ] D4 — worksheet/PHLC after HTTP return
- [ ] D5 — print all worksheets (no picker)
- [ ] D6 — `SORT_*` audit actions vs reuse `REG`/`SEND_OUT`
- [ ] D7 — `loe_sorter_map` vs `LOE_CONTROL`
- [ ] D8 — DFT via Spec Ack `register()` vs `/api/dftreg`
- [ ] D9 — STAR location when no workbench
- [ ] D10 — CPS vs HMS mismatch on map lab
- [ ] Human `reviewed_by` on [[02 System Design]]

## Links

- Services: `lis-crs-spec-ack-svc`, `lab-crs-app`, `lis-hub-svc`
- Requirement: [[01 Requirement Confirmation]]
- Design: [[02 System Design]]
- Prior questionnaire: [[LIS/Project Plans/Specimen Sorter/Requirement Confirmation]]
- Source deck: `G:/Request/BackEnd/Specimen Sorter/USID Auto-Registration Flow.deck.json`
