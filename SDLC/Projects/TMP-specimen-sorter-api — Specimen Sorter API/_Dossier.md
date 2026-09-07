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
> Next action: requester answers remaining TBC items on [[01 Requirement Confirmation]] (Q2, Q5 DFT/STAR, Q9, Q12, Q17), then `/system-design`

## Artifacts

| Stage | Artifact | State |
|---|---|---|
| 01 Requirement | [[01 Requirement Confirmation]] | draft — answers recorded 2026-09-07; 5 TBC |

## Gate Log

| Date | Gate | Verdict | By | Note |
|---|---|---|

## Decision Log

- 2026-09-07 — Opened this dossier for the Specimen Sorter API / USID auto-registration request. Did not reuse `TMP-orchestrator-loop` (throwaway fixture). Drafted [[01 Requirement Confirmation]] from the 28 Aug 2026 deck, the 14 Jul 2026 confirmation slides, the 16-row xlsx questionnaire, SEM20260612, and [[LIS/Project Plans/Specimen Sorter/Requirement Confirmation]]. Requirement gate left open. — agent
- 2026-09-07 — Requester answered Q1–Q18. Agreed: optional HKID/name; USID-only retrieve; CPS/HMS only (APS/BBS/MBS out); Failure for not-found / already-used; one Failure + message code; reuse Specimen Audit Trail; return status on same call; request no. = USID or Relabel; datetime = server now; no partial register; no retry job; encounter/tube colour ignored for routing. Send-out = `LOE_SENDOUT_TEST` cluster code. Post-actions: worksheet yes, label no, PHLC yes. Hospital: TBC, fallback = sorter-id mapping table. Still TBC: Q2 hospital-on-call, Q5 DFT/STAR, Q9 soft-alert logging, Q12 unboxed, Q17 latency. Gate not closed. — agent

## Open Items

- [ ] Q2 — does the sorter send performing hospital? Fallback mapping table agreed
- [ ] Q5 — DFT / STAR in or out
- [ ] Q9 — how to log soft Spec Ack alerts
- [ ] Q12 — specimen not unboxed
- [ ] Q17 — latency / volume pass mark
- [ ] After TBCs: `/system-design`

## Links

- Services: `lis-crs-spec-ack-svc`, `lab-crs-app`, `lis-hub-svc`
- Prior questionnaire: [[LIS/Project Plans/Specimen Sorter/Requirement Confirmation]]
- Related dossiers: none
- Source deck: `G:/Request/BackEnd/Specimen Sorter/USID Auto-Registration Flow.deck.json`
