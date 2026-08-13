---
title: Create new column `old_hkid` in `patient_pmi_sync_message_queue` for `lis-patient-pmi-sync-svc`
tags:
  - jira-log
  - lis
  - lis-patient-pmi-sync-svc
request_type: Service Request
priority: Medium
services:
  - lis-patient-pmi-sync-svc
target_completion_date: 2026-08-13
status: draft
created: 2026-08-07
jira: LISB-953
reference_jira:
  - LIS-10723
design_status: draft
---
# Create new column `old_hkid` in `patient_pmi_sync_message_queue` for `lis-patient-pmi-sync-svc`

## Request Type

**Type:** Service Request  
**Priority:** Medium

## Request Summary

Create new column `old_hkid` in `patient_pmi_sync_message_queue` for `lis-patient-pmi-sync-svc`

## Background

For message processing of patient update in `lis-patient-pmi-sync-svc`, A40 (Merge HKID), A45 (Move Episode), and A47 (Change HKID) messages carry both a new HKID and an old HKID. On insert, only the new HKID is stored in the `hkid` column. Before a message is picked up, the scheduler checks for earlier blocking messages (status FAILED, RETRY, or PROCESSING) with the same HKID. New column has to be added in order to ensure A40 / A45 / A47 messages are processed sequentially.

## Change Description

1. **Add `old_hkid` column (Sybase):**
   - `ALTER TABLE dbo.patient_pmi_sync_message_queue ADD old_hkid varchar(12) NULL`
   - Script: `sql/LIS-10723/SQL to deploy (Sybase).sql`
   - Run on each hospital Sybase `LAB_DB`

2. **Add `old_hkid` column (PostgreSQL):**
   - `ALTER TABLE crs_lab.patient_pmi_sync_message_queue ADD COLUMN IF NOT EXISTS old_hkid varchar(12) NULL`
   - Script: `sql/LIS-10723/SQL to deploy (PG).sql`
   - Run on each hospital PostgreSQL LAB database

3. **Rollback scripts (if column must be removed):**
   - `sql/LIS-10723/SQL to rollback (Sybase).sql`
   - `sql/LIS-10723/SQL to rollback (PG).sql`

## Justification

Old HKID could be stored in message queue and ensure A40 (Merge HKID), A45 (Move Episode), and A47 (Change HKID) messages are processed sequentially by message-queue blocking.

## Target Completion Date

14th Aug, 2026

## Design

<!-- Populated by generate-design skill before CP3 review. See design-template.md. -->

## Reference Logs

- LIS-10723
