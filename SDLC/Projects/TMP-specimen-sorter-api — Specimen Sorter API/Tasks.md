---
title: Tasks — Specimen Sorter API
tags:
  - sdlc
  - tasks
generated_by: task-add
updated: '2026-09-21'
---
# Tasks — Specimen Sorter API

Dossier task list for [[_Dossier]]. Not the CRS Revamp Central Task List.

Work packages: [[05 Project Plan]]. Design: [[02 System Design]].

## Progress Summary

| Repository | Pending | In Progress | Done | Total |
|---|---|---|---|---|
| `lis-crs-spec-ack-svc` | 3 | 0 | 0 | 3 |
| **Total** | 3 | 0 | 0 | 3 |

## Task Registry

| WP | Task ID | Repository | Task | Status | Notes |
|---|---|---|---|---|---|
| WP1 | TASK-001 | `lis-crs-spec-ack-svc` | **Auto-register POST and orchestrator** — `POST /api/sorter/auto-register` | `[ ]` | [[WP1 — Auto-register POST and orchestrator]] · XL · 10d · `TASK-001` |
| WP3 | TASK-002 | `lis-crs-spec-ack-svc` | **Move packing to the API** — group tests, request no., ward/doctor convert (`SpecimenSorterPackingService`) | `[ ]` | [[WP3 — Move packing to the API]] · needs WP1 packing interface · XL · 10d · `TASK-002` |
| WP4 | TASK-003 | `lis-crs-spec-ack-svc` | **Checks, relabel, send-out** — hard/soft checks; Relabel; `LOE_SENDOUT_TEST`; mixed → Failure | `[ ]` | [[05 Project Plan]] WP4 · needs WP1 check/relabel/send-out interfaces and WP3 packing · XL · 10d · `TASK-003` |

## Changelog

| Date | Change |
|---|---|
| 2026-09-10 | Added TASK-001: Auto-register POST and orchestrator (`lis-crs-spec-ack-svc`) |
| 2026-09-10 | Linked TASK-001 to [[WP1 — Auto-register POST and orchestrator]] |
| 2026-09-11 | TASK-001 plan: use `ServiceParameterContextHolder.set`; `CrsContext` obsolete |
| 2026-09-14 | TASK-001 plan: lab allow-list via data-source `LabType`, not `CommonConstants` |
| 2026-09-14 | TASK-001 plan: lab allow-list via `lis-common` `hk.org.ha.lis.enums.Lab`, not `LabType` |
| 2026-09-15 | Added TASK-002: Move packing to the API (`lis-crs-spec-ack-svc`) |
| 2026-09-15 | Linked TASK-002 to [[WP3 — Move packing to the API]] |
| 2026-09-21 | Added TASK-003: Checks, relabel, send-out (`lis-crs-spec-ack-svc`) |
