---
created: '2026-09-10'
design: '[[02 System Design]]'
design_status: draft
dossier: '[[_Dossier]]'
jira: ''
priority: Medium
reference_jira:
  - SEM20260612
request_type: Change Request
services:
  - lis-crs-spec-ack-svc
  - lab-crs-app
status: draft
tags:
  - jira-log
  - lis
target_completion_date: '2027-05-30'
title: >-
  Develop Auto-Registration API on `lis-crs-spec-ack-svc` for Specimen Sorter
  Send-out and Registration
---
# Develop Auto-Registration API on `lis-crs-spec-ack-svc` for Specimen Sorter Send-out and Registration

## Request Type

**Type:** Change Request  
**Priority:** Medium

## Request Summary

Develop Auto-Registration API on `lis-crs-spec-ack-svc` for Specimen Sorter Send-out and Registration

## Background

On Specimen Acknowledgement in `lis-crs-spec-ack-svc`, staff scan the specimen label (USID) and press Send-out or Register. Order retrieve, checks, and data conversion (group tests, request no., ward and doctor) still run on the screen; the service only does the write, then worksheet printing and PHLC. Labs will load tubes onto a specimen sorter for scan, sort, and transport, and LIS has to be called for those same send-out and registration actions. A new API has to be added so the sorter can get the outcome in one call and the attempt is recorded on Specimen Audit Trail (`LOE_AUDIT_TRAIL`).

## Change Description

1. **New API on `lis-crs-spec-ack-svc`:**
   - Add `POST /api/specack/sorter/auto-register`.
   - Request carries USID and sorter id; hospital, HKID, and patient name are optional.
   - Same call returns Registered, Send-out, Relabel, or Failure. Soft alerts are logged only, not shown on the response.

2. **Move Specimen Acknowledgement screen logic onto that API:**
   - Run the same retrieve, checks, and data conversion the screen does today, then the existing send-out or register write.
   - After Registered, print worksheets and create the PHLC order the same way Spec Ack does today. Send-out, Relabel, and Failure print nothing.

3. **New mapping table `loe_specimen_sorter_map`:**
   - Map sorter id to a dedicated LIS user and workstation.
   - If hospital is not sent, take it from the map. Also derive workstation and user from that row.

4. **`LOE_AUDIT_TRAIL` insert:**
   - Record sorter send-out, register, relabel, and failure, as well as the existing register and send-out actions.
   - Add the new sorter actions to the Specimen Audit Trail filter in `lab-crs-app`.

## Justification

The sorter can scan a USID and bin the tube from the LIS result without staff clicking Send-out or Register. Staff Specimen Acknowledgement stays the fallback for Relabel and Failure, and each attempt can be found on Specimen Audit Trail.

## Target Completion Date

30th May, 2027

## Design

Design lives at [[02 System Design]].

## Reference Logs

- SEM20260612
