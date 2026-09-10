---
created: '2026-09-07'
design: '[[02 System Design]]'
gates_passed:
  - design
jira: ''
jira_log: >-
  [[Develop Auto-Registration API on `lis-crs-spec-ack-svc` for Specimen Sorter
  Send-out and Registration]]
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
stage: jira
status: active
tags:
  - sdlc-dossier
target_completion_date: '2027-05-30'
title: Specimen Sorter API
updated: '2026-09-10'
work_type: project
---
# Specimen Sorter API

## Status

> [!info] Stage: **jira** — gate `design` in `gates_passed`. `design-review` exception recorded. JIRA log drafted; MCP create failed (proxy 504).
> Next action: create the LIS Change Request by hand, or paste the key — `/lis-jira-log-creator`

## Artifacts

| Stage | Artifact | State |
|---|---|---|
| 01 Requirement | [[01 Requirement Confirmation]] | confirmed 2026-09-07; not in gates_passed |
| 02 Design | [[02 System Design]] | approved 2026-09-10 — screen vs API; `loe_specimen_sorter_map` |
| 03 Slide Brief | [[03 Slide Brief]] | draft |
| 03 Design Review | [[assets/Specimen Sorter API.pptx]] | generated |
| 04 JIRA | [[Develop Auto-Registration API on `lis-crs-spec-ack-svc` for Specimen Sorter Send-out and Registration]] | draft |

## Gate Log

| Date | Gate | Verdict | By | Note |
|---|---|---|---|---|
| 2026-09-07 | requirement | exception | Requester | Invoked `/system-design` while `requirement` not in `gates_passed`. Confirmation already quoted in 01. |
| 2026-09-10 | design | pass | Ka | 02 exit checklist after 2026-09-10 rewrite: Rn mapped, DDL+rollback, env config, fallback, D1–D11 closed, `reviewed_by` Tony Chong. |
| 2026-09-10 | design-review | exception | Ka | Deck generated 2026-09-10. CP3 not presented. Skip to JIRA create so Phase 1 can close. Do not treat as `pass`. |

## Decision Log

- 2026-09-07 — Incremental design: new POST orchestrator on `lis-crs-spec-ack-svc`. — agent
- 2026-09-07 — Packing convertor moves server-side. Sorter id maps to workbench + dedicated user. No app auth. Mixed = Failure. STAR no location = Failure. Print all after return. — agent
- 2026-09-08 — D6 agree (`SORT_*` plus existing writes; Audit Trail filter). D8 agree (DFT uses Spec Ack `register()`). D10: do not check workbench lab against test lab. — agent
- 2026-09-08 — Rejected: print worksheet after send-out or ack. Worksheet (and PHLC) only after Registered, matching Spec Ack `constructSaveActions` (D11). Late print still OK on that path (D4). — agent
- 2026-09-09 — `reviewed_by` set to Tony Chong on [[02 System Design]]. Design gate not closed; next is CP3 deck. — agent
- 2026-09-09 — CP3 deck generated from [[03 Slide Brief]] (`assets/Specimen Sorter API.pptx`). `design-review` not closed until CP3 actions are written back. — agent
- 2026-09-10 — Print/PHLC reuse locked from clone: worksheets via `gcrWorksheetPrinting` / `gcrShWorksheetPrinting` / `gcrSendOutWorksheetPrinting`; PHLC via `LisPhlcLabOrderAppServiceImpl.createPhlcLabOrder`. In-process after Registered, no HTTP loopback. — agent
- 2026-09-10 — Existing design restated as the Specimen Acknowledgement screen (retrieve, send-out, register validation/convert, worksheet, PHLC). Proposed: one POST, move those logics, `LOE_AUDIT_TRAIL` `SORT_*`, table `loe_specimen_sorter_map` (derive hospital if omitted, plus user and workstation). Rejected keeping `loe_sorter_map`. — agent
- 2026-09-10 — CP3 deck refreshed from [[03 Slide Brief]]: Spec Ack action matrix (register convert vs worksheet), new POST, `loe_specimen_sorter_map` derive hospital / workstation / user, `LOE_AUDIT_TRAIL` insert. `design-review` not closed until CP3 actions are written back. — agent
- 2026-09-10 — Phase 2 skills started on this dossier: `project-plan`, `code-change-log` on disk; CRS task skills generalized. Do not run `/project-plan` until `jira` is in `gates_passed` (or a new exception). — agent
- 2026-09-10 — `/lis-jira-log-creator` Step 7: `jira_search` to `hatool.home` failed (proxy 504 Unknown Host). No issue created. Vault draft kept; `jira` left empty. Create by hand or paste the key. — agent
- 2026-09-10 — `design-review` exception: CP3 not held; skip to JIRA create to close Phase 1. Deck stays generated; gate not in `gates_passed`. — Ka
- 2026-09-10 — Design gate closed. 02 still meets the exit checklist after the rewrite (`reviewed_by` Tony Chong). `design` written to `gates_passed`. — Ka
- 2026-09-10 — JIRA log drafted: [[Develop Auto-Registration API on `lis-crs-spec-ack-svc` for Specimen Sorter Send-out and Registration]]. Target 30th May, 2027. No JIRA key yet. — agent

## Open Items

- [x] D1 — no authentication currently
- [x] D2 — sorter User + sorter id → workbench
- [x] D3 — mixed → Failure
- [x] D4 — late worksheet OK (Registered only)
- [x] D5 — print all (registration path)
- [x] D6 — `SORT_*` plus existing writes; add to Audit Trail filter
- [x] D7 — `loe_specimen_sorter_map` (was `loe_sorter_map`)
- [x] Refresh [[03 Slide Brief]] and pptx after this 02 rewrite
- [x] D8 — DFT via Spec Ack `register()`
- [x] D9 — STAR no location → Failure
- [x] D10 — no workbench-vs-test-lab check
- [x] D11 — worksheet printed during registration only
- [x] Human `reviewed_by` on [[02 System Design]] (Tony Chong)
- [ ] Paste JIRA key when the Change Request is created by hand
- [ ] Run `/project-plan` after `jira` is in `gates_passed`

## Links

- Services: `lis-crs-spec-ack-svc`, `lab-crs-app`, `lis-hub-svc`
- Requirement: [[01 Requirement Confirmation]]
- Design: [[02 System Design]]
- JIRA log: [[Develop Auto-Registration API on `lis-crs-spec-ack-svc` for Specimen Sorter Send-out and Registration]]
