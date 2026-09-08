---
title: Enhance lis-scheduler to normalize table-driven job definitions
tags:
  - sdlc-dossier
key: LIS-10785
work_type: enhancement
stage: design
status: active
services:
  - lis-scheduler
repos:
  - lis-common-scheduler-svc
jira: LIS-10785
reference_jira:
  - LIS-10748
design: "[[02 System Design]]"
requirement: "[[01 Requirement Confirmation]]"
jira_log: "[[Enhance `lis-scheduler` to Normalize Table-driven Job Definitions into `job_definition` and `job_request`]]"
gates_passed: []
target_completion_date: '2026-08-27'
owner: Ka
risk: medium
created: '2026-09-08'
updated: '2026-09-08'
---

# Enhance lis-scheduler to normalize table-driven job definitions

## Status

> [!info] Stage: **design** — gates `requirement` and `design` outstanding (draft artifacts; Ka invoked fast path)
> Next action: Review [[01 Requirement Confirmation]] and [[02 System Design]]; set `reviewed_by`; schedule CP3

## Artifacts

| Stage | Artifact | State |
|---|---|---|
| 01 Requirement | [[01 Requirement Confirmation]] | draft 2026-09-08 |
| 02 Design | [[02 System Design]] | draft 2026-09-08 |
| 04 JIRA | [[Enhance `lis-scheduler` to Normalize Table-driven Job Definitions into `job_definition` and `job_request`]] | LIS-10785 exists |

## Gate Log

| Date | Gate | Verdict | By | Note |
|---|---|---|---|---|
| 2026-09-08 | requirement | draft | agent | Fast path per Ka — empty out-of-scope, no open questions |
| 2026-09-08 | design | draft | agent | Co-delivered with requirement for CP3 prep |

## Decision Log

- 2026-09-08 — Proceed on Ka fast path (option B): skip vault/code search; co-deliver requirement + design. — Ka (via agent)

## Open Items

- [ ] Set `reviewed_by` on both artifacts before CP3 deck generation
- [ ] Confirm requirement gate `pass` with quoted SM confirmation

## Links

- Prior release: [[Release lis-scheduler - LIS Common Scheduler Framework with Dynamic Job Creation and Versioning]] (LIS-10748)
- JIRA log: [[Enhance `lis-scheduler` to Normalize Table-driven Job Definitions into `job_definition` and `job_request`]]
