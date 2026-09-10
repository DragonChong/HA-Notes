---
title: >-
  Develop Auto-Registration API on `lis-crs-spec-ack-svc` for Specimen Sorter
  Send-out and Registration
tags:
  - jira-log
  - lis
request_type: Change Request
priority: Medium
services:
  - lis-crs-spec-ack-svc
  - lab-crs-app
target_completion_date: '2027-05-30'
status: draft
created: '2026-09-10'
jira: ''
reference_jira:
  - SEM20260612
design_status: draft
design: '[[02 System Design]]'
dossier: '[[_Dossier]]'
---
# Develop Auto-Registration API on `lis-crs-spec-ack-svc` for Specimen Sorter Send-out and Registration

## Request Type

**Type:** Change Request  
**Priority:** Medium

## Request Summary

Develop Auto-Registration API on `lis-crs-spec-ack-svc` for Specimen Sorter Send-out and Registration

## Background

On Specimen Acknowledgement in `lis-crs-spec-ack-svc`, staff scan a USID (GCRS Specimen Number) and click Send-out or Register. Retrieve, validation, and packing (test groups, request no., ward/doctor mapping) still run in the front-end; the service only writes through `/sendOutSpecimen` and `/gcrSpecAckRegister`, then worksheet print and PHLC. Labs will load tubes onto a specimen sorter, and middleware needs those same actions in one call so the sorter can bin from `REGISTERED` / `SEND_OUT` / `RELABEL` / `FAILURE`. A new POST has to be added so that front-end logic can move behind the API and `LOE_AUDIT_TRAIL` records the sorter attempt.

## Change Description

1. **New API on `lis-crs-spec-ack-svc`:**
   - Add `POST /api/specack/sorter/auto-register` (`SpecimenSorterController`).
   - Request: `usid` and `sorterId` required; `hospital`, `hkid`, `patientName` optional.
   - Response HTTP 200 with status `REGISTERED` / `SEND_OUT` / `RELABEL` / `FAILURE` on the same call.

2. **Move Specimen Acknowledgement front-end logics onto that API:**
   - Retrieve as the mapped sorter user (do not call GET `/retrieveGcrOrder`, which hard-codes `ltc611`).
   - Port validation and packing (`SpecimenSorterValidationService`, `SpecimenSorterPackingService`): group tests, request no. assignment, ward/doctor mapping, then existing `sendOutSpecimen` / `register()`.
   - After `REGISTERED` and after HTTP return: same in-process worksheet print and PHLC as Spec Ack. Send-out / Relabel / Failure print nothing. DFT uses Spec Ack `register()`, not `/api/dftreg`.

3. **New mapping table `loe_specimen_sorter_map`:**
   - Sorter id → dedicated LIS user and workbench. Derive hospital if omitted; derive workstation and user from the same row. Printer / STAR location stay on `workbench`.

4. **`LOE_AUDIT_TRAIL` insert:**
   - Write `SORT_REG` / `SORT_SO` / `SORT_RELABEL` / `SORT_FAIL`, plus existing `REG` / `SEND_OUT`. Add `SORT_*` to the Specimen Audit Trail action filter in `lab-crs-app`.

## Justification

Sorter middleware can scan a USID and bin the tube from one sync call (p95 under 4 s) without staff clicking Send-out or Register. Staff Specimen Acknowledgement stays the fallback for Relabel and Failure, and each attempt is searchable on Specimen Audit Trail.

## Target Completion Date

30th May, 2027

## Design

Design lives at [[02 System Design]].

## Reference Logs

- SEM20260612
