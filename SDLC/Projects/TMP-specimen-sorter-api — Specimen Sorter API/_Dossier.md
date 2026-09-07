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
> Next action: wait for requester confirmation of [[01 Requirement Confirmation]], then `/system-design`

## Artifacts

| Stage | Artifact | State |
|---|---|---|
| 01 Requirement | [[01 Requirement Confirmation]] | draft |

## Gate Log

| Date | Gate | Verdict | By | Note |
|---|---|---|

## Decision Log

- 2026-09-07 — Opened this dossier for the Specimen Sorter API / USID auto-registration request. Did not reuse `TMP-orchestrator-loop` (throwaway fixture). Drafted [[01 Requirement Confirmation]] from the 28 Aug 2026 deck, the 14 Jul 2026 confirmation slides, the 16-row xlsx questionnaire, SEM20260612, and [[LIS/Project Plans/Specimen Sorter/Requirement Confirmation]]. Requirement gate left open. — agent

## Open Items

- [ ] Requester answers Open questions Q1–Q18 (or defers with an owner)
- [ ] Requester writes confirmation into [[01 Requirement Confirmation]]
- [ ] After confirmation: `/system-design`

## Links

- Services: `lis-crs-spec-ack-svc`, `lab-crs-app`, `lis-hub-svc`
- Prior questionnaire: [[LIS/Project Plans/Specimen Sorter/Requirement Confirmation]]
- Related dossiers: none
- Source deck: `G:/Request/BackEnd/Specimen Sorter/USID Auto-Registration Flow.deck.json`
