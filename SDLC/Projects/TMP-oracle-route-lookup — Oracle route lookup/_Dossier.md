---
created: '2026-09-25'
design: ''
gates_passed: []
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
stage: requirement
status: active
tags:
  - sdlc-dossier
target_completion_date: ''
title: Oracle route lookup
updated: '2026-09-25'
work_type: fix
---
# Oracle route lookup

Oracle repository reads fail when the thread is already on a Sybase or PostgreSQL hospital route. Requirement draft is waiting for confirmation.

## Status

> [!info] Stage: **requirement** — gate `requirement` outstanding
> Next action: wait for confirmation, or say **proceed on assumptions**

## Artifacts

| Stage | Artifact | State |
|---|---|---|
| 01 Requirement | [[01 Requirement Confirmation]] | draft |

## Gate Log

| Date | Gate | Verdict | By | Note |
|---|---|---|---|---|

## Decision Log

- 2026-09-25 — New dossier. The only other `status: active` dossier is [[TMP-specimen-sorter-api — Specimen Sorter API]], which is a different unit of work. Provisional key `TMP-oracle-route-lookup`.

## Open Items

- [ ] Confirm Q1–Q5 on [[01 Requirement Confirmation]], or proceed on the proposed defaults

## Links

- Services: `data-source` (`lis-svc-lib`); caller `lis-patient-pmi-sync-svc`
- Current behaviour: [[Plan - Implement Distributed Transactions in data-source Library]], [[Dynamic Data Source Design]]
- Related dossiers: [[TMP-specimen-sorter-api — Specimen Sorter API]]
