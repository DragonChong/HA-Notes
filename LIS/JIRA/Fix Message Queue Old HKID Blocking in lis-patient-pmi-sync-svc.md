---
title: Fix message queue blocking logic in `lis-patient-pmi-sync-svc` to check old HKID for A40/A45/A47 transactions
tags:
  - jira-log
  - lis
  - lis-patient-pmi-sync-svc
request_type: Change Request
priority: Medium
services:
  - lis-patient-pmi-sync-svc
target_completion_date: 2026-07-16
status: draft
created: 2026-07-02
reference_jira:
  - https://hatool.home/jira/browse/LIS-10723
---
# Fix message queue blocking logic in `lis-patient-pmi-sync-svc` to check old HKID for A40/A45/A47 transactions

## Request Type

**Type:** Change Request  
**Priority:** Medium

## Request Summary

Fix message queue blocking logic in `lis-patient-pmi-sync-svc` to check old HKID for A40/A45/A47 transactions by adding an `old_hkid` column and updating retrieval queries.

## Background

`lis-patient-pmi-sync-svc` queues PMI patient sync messages in `patient_pmi_sync_message_queue` and processes them sequentially per HKID. Before a message is picked up, the scheduler checks for earlier blocking messages (status `FAILED`, `RETRY`, or `PROCESSING`) with the same HKID.

For A40 (Merge HKID), A45 (Move Episode), and A47 (Change HKID), each message carries both a **new HKID** and an **old HKID**. On insert, only the new HKID is stored in the `hkid` column (`MessageQueueService.queueMessage`). The old HKID exists only inside `parsed_message` (`PatientTransactionVo.oldHkid`) and is not persisted as a dedicated column.

A production incident on 26 Jun 2026 showed message `P5120260626094915113` (A08) in `PROCESSING` for the patient's old HKID, while message `P5120260626094915193` (A47) was picked up concurrently because the blocking check only compared `blocking.hkid = m.hkid` (new HKID). The A47 message was not blocked by the in-flight A08 message tied to the old HKID.

## Change Description

1. **Database schema — add `old_hkid` column:**
   - Add `old_hkid VARCHAR(12) NULL` to `patient_pmi_sync_message_queue` on all hospital PostgreSQL/Sybase databases.
   - Provide DDL script under `sql/` for deployment.

2. **Entity update — `MessageQueue.java`:**
   - Add `oldHkid` field mapped to `old_hkid` column.

3. **Message enqueue — `MessageQueueService.java`:**
   - Populate `message.setOldHkid(patientTransactionVo.getOldHkid())` when queuing A40/A45/A47 (and any transaction where `oldHkid` is present).

4. **Blocking query updates — `MessageQueueRepository.java`:**
   - **`findProcessableMessages`**: extend the `NOT EXISTS` subquery so a message is blocked when an earlier message shares either HKID:
     - `blocking.hkid = m.hkid`
     - `blocking.hkid = m.oldHkid` (when `old_hkid` is not null)
     - `blocking.old_hkid = m.hkid` (when blocking row has `old_hkid`)
     - `blocking.old_hkid = m.oldHkid` (when both have `old_hkid`)
   - **`countPreviousBlockingMessages`**: add `oldHkid` parameter and apply the same matching logic for `determinePendingMessage`.

5. **Processor update — `MessageQueueProcessor.java`:**
   - Update `determinePendingMessage` (lines 380–401) to pass `message.getOldHkid()` into the amended blocking count query.

## Justification

Without old-HKID blocking, concurrent processing of related PMI transactions can cause data inconsistency — for example, an A47 (change HKID) running while an A08 (update patient info) for the same patient is still in `PROCESSING`. This undermines the sequential-per-patient guarantee the message queue was designed to enforce.

Persisting `old_hkid` and including it in blocking checks ensures A40/A45/A47 messages wait for all in-flight or failed messages associated with either the old or new HKID, preserving patient data integrity across LIS databases.

## Target Completion Date

16th Jul, 2026
