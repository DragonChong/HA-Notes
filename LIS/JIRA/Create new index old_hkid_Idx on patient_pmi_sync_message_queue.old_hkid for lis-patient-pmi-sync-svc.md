---
title: Create new index `old_hkid_Idx` on `patient_pmi_sync_message_queue.old_hkid` for `lis-patient-pmi-sync-svc`
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
jira: ""
reference_jira:
  - LIS-10723
design_status: draft
---
# Create new index `old_hkid_Idx` on `patient_pmi_sync_message_queue.old_hkid` for `lis-patient-pmi-sync-svc`

## Request Type

**Type:** Service Request  
**Priority:** Medium

## Request Summary

Create new index `old_hkid_Idx` on `patient_pmi_sync_message_queue.old_hkid` for `lis-patient-pmi-sync-svc`

## Background

For message processing of A40 (Merge HKID), A45 (Move Episode), and A47 (Change HKID) messages in `lis-patient-pmi-sync-svc`, `old_hkid` column is used to check for earlier blocking messages (status FAILED, RETRY, or PROCESSING). Without an index on `old_hkid`, there may be full-table scan and lead to performance issue.

## Change Description

1. **Create index (Sybase):**
   - `CREATE NONCLUSTERED INDEX old_hkid_Idx ON dbo.patient_pmi_sync_message_queue (old_hkid)`
   - Included in `sql/LIS-10723/SQL to deploy (Sybase).sql`
   - Run after `old_hkid` column exists on each hospital Sybase `LAB_DB`

2. **Create index (PostgreSQL):**
   - `CREATE INDEX IF NOT EXISTS old_hkid_idx ON crs_lab.patient_pmi_sync_message_queue (old_hkid)`
   - Included in `sql/LIS-10723/SQL to deploy (PG).sql`
   - Run after `old_hkid` column exists on each hospital PostgreSQL LAB database

3. **Rollback:**
   - Drop index before dropping column (Sybase/PG rollback scripts under `sql/LIS-10723/`)

## Justification

The index supports efficient blocking queries that match on `old_hkid`, reducing full-table scan risk for the message-queue scheduler.

## Target Completion Date

14th Aug, 2026

## Design

<!-- Populated by generate-design skill before CP3 review. See design-template.md. -->

## Reference Logs

- LIS-10723
