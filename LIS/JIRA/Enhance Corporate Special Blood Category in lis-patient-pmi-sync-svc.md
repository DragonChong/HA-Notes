---
created: 2026-07-09
priority: Medium
reference_jira:
  - LIS-7291
  - LIS-8200
  - LIS-10583
request_type: Change Request
services:
  - lis-patient-pmi-sync-svc
status: draft
tags:
  - jira-log
  - lis
  - lis-patient-pmi-sync-svc
target_completion_date: 2026-04-17
title: Enhance `lis-patient-pmi-sync-svc` to support Handling of Patient Merge and Deletion on Corporate Special Blood Category
---
# Enhance `lis-patient-pmi-sync-svc` to support Handling of Patient Merge and Deletion on Corporate Special Blood Category

## Request Type

**Type:** Change Request  
**Priority:** Medium

## Request Summary

Enhance `lis-patient-pmi-sync-svc` to support Handling of Patient Merge and Deletion on Corporate Special Blood Category.

## Background

The current handling of patient merge and patient deletion on corporate special blood category is managed through a table trigger (`transaction_log_tr`) on `transaction_log`. This trigger supports CPI transaction types **020** (Merge HKID), **031** (Change HKID), and **250** (PMI Deletion). When an insert occurs on `transaction_log`, the trigger iterates active records in `bb_corp_blood_category` and either copies corporate special blood requirements from the old HKID to the new HKID (merge/change HKID), or resets requirements to default values on patient deletion.

As part of the system enhancement, the logic is to be revamped into the ECP service `lis-patient-pmi-sync-svc` to modernize the process and align with the updated architecture. The service currently subscribes to **A40** (020 CPI transaction) and **A47** (031 CPI transaction). Handling of patient merge on corporate special blood category will be added for these events. The service will additionally support **A29** (250 CPI transaction) to handle patient deletion on corporate special blood category.

## Change Description

1. **Revamp the table trigger logic into `lis-patient-pmi-sync-svc`:**
   - Migrate existing logic from `transaction_log_tr` (see `docs/LIS-10583/transaction_log_tr.sql`) into the ECP service.
   - Implement equivalent behaviour in `BbCorpBloodCategoryService`:
     - `processBbCorpBloodCatForMergeOrChangeHKID` — copy active `bb_corp_blood_category` records from old HKID to new HKID when `blood_value = 1` and not already active on new HKID; set `patient_log_type` to `020` (A40) or `031` (A47); build merge/change remark.
     - `processBbCorpBloodCatForPMIDeletion` — insert reset records with default `blood_value` (`0`, or `2` for `blood_key = 537`); set `patient_log_type` to `250`.
   - Gate processing via `BbCorpBloodCatSetup.isBbCorpBloodCatEnable()` (feature flag).

2. **Enhance subscription handling in `lis-patient-pmi-sync-svc`:**
   - **A40 / A47 (patient merge or change HKID):** invoke blood category handling from `PatientAppServiceImpl.mergePid()` after successful PID merge — uses `BbCorpBloodCategoryService.getActiveBloodCategories(oldHkid)` and `processBbCorpBloodCatForMergeOrChangeHKID`.
   - **A29 (PMI deletion):** route in `PatientSyncServiceImpl` to `PatientAppServiceImpl.deletePMI()`; process active blood categories for the patient HKID and reset via `processBbCorpBloodCatForPMIDeletion`.
   - Persist access through `BbCorpBloodCategoryRepository` / entity `BbCorpBloodCategory` (PostgreSQL and Sybase implementations).

3. **Maintain data integrity and logging:**
   - Preserve trigger semantics: copy requirements old → new HKID on merge/change; reset to default on deletion; set `corp_alert_status = 21` on new records.
   - Roll back patient merge on blood category failure (`RollbackException` in `mergePid`).
   - Implement audit logging via ALS (`info` / `warn` in `BbCorpBloodCategoryService`, `PatientAppServiceImpl.deletePMI`) for processing details and errors.

## Justification

Revamping the handling of patient merge and deletion on corporate special blood category into the `lis-patient-pmi-sync-svc` ECP service is essential for modernizing the system architecture. This change ensures alignment with the updated PMI subscription model and accurate management of special blood requirements during patient merges and deletions, replacing legacy trigger-based processing with a maintainable, observable service implementation.

## Target Completion Date

17th Apr, 2026

## Reference Logs

- LIS-7291
- LIS-8200

## Design

<!-- Populated by generate-design skill before CP3 review. See design-template.md. -->
