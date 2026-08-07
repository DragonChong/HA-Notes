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
jira: ""
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

`lis-patient-pmi-sync-svc` queues PMI sync messages in `patient_pmi_sync_message_queue` and blocks later messages by matching on `hkid`. For A40/A45/A47, the old HKID is only in `parsed_message` and is not stored as a column, so blocking cannot see in-flight messages on the old HKID.

Under LIS-10723, the service will persist and use `old_hkid` in blocking queries. The column must be added on all hospital Sybase and PostgreSQL LAB databases before application deployment.

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

DDL is required so the LIS-10723 application can store previous HKID for A40/A45/A47 and include it in message-queue blocking, preserving sequential-per-patient processing.

## Target Completion Date

14th Aug, 2026

## Design

<!-- Populated by generate-design skill before CP3 review. See design-template.md. -->

## Reference Logs

- LIS-10723
