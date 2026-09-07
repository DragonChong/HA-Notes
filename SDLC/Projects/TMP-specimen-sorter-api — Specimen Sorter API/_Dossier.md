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
| 02 Design | [[02 System Design]] | draft — D1–D7/D9 answered; convertor in scope |

## Gate Log

| Date | Gate | Verdict | By | Note |
|---|---|---|---|---|
| 2026-09-07 | requirement | exception | Requester | Invoked `/system-design` while `requirement` not in `gates_passed`. Confirmation already quoted in 01. |

## Decision Log

- 2026-09-07 — Incremental design: new POST orchestrator on `lis-crs-spec-ack-svc`. — agent
- 2026-09-07 — Packing convertor (`GcrSpecAckDataConvertor`) moves server-side. Sorter id maps to `workbench` + dedicated LIS user via `loe_sorter_map`. No app auth v1. Mixed local+send-out = Failure. STAR no location = Failure. Print all worksheets after HTTP return; late print OK. — agent

## Open Items

- [x] D1 — no authentication currently
- [x] D2 — sorter User + sorter id → workbench
- [x] D3 — mixed → Failure
- [x] D4 — late worksheet OK
- [x] D5 — print all
- [ ] D6 — `SORT_*` on Audit Trail dropdown
- [x] D7 — `loe_sorter_map`
- [ ] D8 — DFT via Spec Ack `register()`
- [x] D9 — STAR no location → Failure
- [ ] D10 — CPS vs HMS lab mismatch → proposed Failure
- [ ] Human `reviewed_by` on [[02 System Design]]

## Links

- Services: `lis-crs-spec-ack-svc`, `lab-crs-app`, `lis-hub-svc`
- Requirement: [[01 Requirement Confirmation]]
- Design: [[02 System Design]]
