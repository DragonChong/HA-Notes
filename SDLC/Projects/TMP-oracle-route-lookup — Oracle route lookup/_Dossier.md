---
gates_passed:
  - requirement
stage: design
updated: '2026-09-25'
created: '2026-09-25'
design: '[[02 System Design]]'
jira: ''
jira_log: ''
key: TMP-oracle-route-lookup
owner: Ka
reference_jira: []
repos:
  - lis-svc-lib
requirement: '[[01 Requirement Confirmation]]'
risk: medium
services:
  - data-source
status: active
tags:
  - sdlc-dossier
target_completion_date: ''
title: Oracle route lookup
work_type: fix
---
# Oracle route lookup

Oracle repository reads fail when the thread is already on a Sybase or PostgreSQL hospital route. Requirement gate is passed with assumptions. Design is next.

## Status

> [!info] Stage: **design** — gate `design` outstanding
> Next action: present the deck. Do not close `design-review` until CP3 actions are written back to [[02 System Design]].

## Artifacts

| Stage | Artifact | State |
|---|---|---|
| 01 Requirement | [[01 Requirement Confirmation]] | pass with assumptions 2026-09-25 |
| 02 Design | [[02 System Design]] | draft |
| 03 Slide Brief | [[03 Slide Brief]] | draft |
| 03 Design Review | [[assets/Oracle route lookup.pptx]] | generated |

## Gate Log

| Date | Gate | Verdict | By | Note |
|---|---|---|---|---|
| 2026-09-25 | requirement | pass with assumptions | Requester | Q1 answered: default to Sybase. Q2–Q5 kept as A1–A4. |

## Decision Log

- 2026-09-25 — New dossier. The only other `status: active` dossier is [[TMP-specimen-sorter-api — Specimen Sorter API]], which is a different unit of work. Provisional key `TMP-oracle-route-lookup`.
- 2026-09-25 — Q1 proposed default (PostgreSQL) was wrong. Requester: default to Sybase for the failed call; still do not cache it (R4). Design failure fallback is Sybase.
- 2026-09-25 — Rejected switching the shared route to Oracle for the `loe_control` read. `RoutingTransactionManager.ensureTarget` would commit the hospital segment (R2).
- 2026-09-25 — High-level CP3 deck generated from [[03 Slide Brief]]. Default QA passed. CP3-profile QA still reports no numeric JIRA key because A4 is the provisional key `TMP-oracle-route-lookup`.
- 2026-09-25 — Deck revised: agenda added. Background is the skipped Chinese-character strip in `lis-patient-pmi-sync-svc` after the LIS-10723 data-source transaction-locking upgrade. CP3 QA passed.
- 2026-09-25 — Promotion and fallback are one compare slide. Left is the library ship. Right is the previous build. CP3 QA passed.
- 2026-09-25 — Fallback step 2 was wrapping, so step 3 sat lower than the promotion column. Shortened to “On Sybase, the log says defaulting to PostgreSQL”. Both columns now share the same step tops.
- 2026-09-25 — Regenerated `Oracle route lookup.pptx` from the current spec (7 slides). CP3 QA: 0 errors. Two warnings: the agenda still lists Open Questions, and the spec has no asks slide and no closing slide.
- 2026-09-25 — Slide wording uses remove instead of strip. Regenerated `Oracle route lookup.pptx`.

## Open Items

- [x] Confirm Q1–Q5 on [[01 Requirement Confirmation]], or proceed on the proposed defaults
- [ ] A1 — Oracle target is `LOE` / lab `1` / `LOE_DB` (Q2)
- [ ] A2 — Change only `data-source`; leave `MessageQueueService` unchanged (Q3)
- [ ] A3 — Hospital segment stays uncommitted; do not switch the shared route to Oracle for the read (Q4)
- [ ] A4 — Provisional key `TMP-oracle-route-lookup` until a JIRA key is assigned (Q5)

## Links

- Services: `data-source` (`lis-svc-lib`); caller `lis-patient-pmi-sync-svc`
- Current behaviour: [[Plan - Implement Distributed Transactions in data-source Library]], [[Dynamic Data Source Design]]
- Related dossiers: [[TMP-specimen-sorter-api — Specimen Sorter API]]
