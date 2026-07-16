---
title: >-
  Enhance CRS Specimen Acknowledgement to Derive Ward-Assigned Request No.
  Reminder Popup from Setup instead of Hardcoded QEH Check
tags:
  - jira-log
  - lis
request_type: Change Request
priority: Medium
services:
  - lis-ecpath5-app
target_completion_date: '2026-07-31'
status: draft
created: '2026-07-16'
jira: null
reference_jira:
  - LIS-9632
  - LIS-8437
design_status: draft
---
# Enhance CRS Specimen Acknowledgement to Derive Ward-Assigned Request No. Reminder Popup from Setup instead of Hardcoded QEH Check

## Request Type

**Type:** Change Request  
**Priority:** Medium

## Request Summary

Enhance CRS Specimen Acknowledgement to Derive Ward-Assigned Request No. Reminder Popup from Setup instead of Hardcoded QEH Check

## Background

In Specimen Acknowledgement, when a specimen is retrieved in a lab that supports the ward-assigned request no. feature but the specimen has not been assigned a ward-assigned request no., the system prompts: *"Please assign Lab No. to acknowledge this specimen!"* Users may suppress the prompt until log-off; suppression is audited (`GCR_AUDIT_ACTION_LABNO_REMINDER`).

After the blood-taking-within-cluster enhancement in LIS-8437, ward-assigned request numbers from other hospitals (e.g. QEH) can be retrieved in KWH CRS. That caused the Lab No. assignment reminder to appear incorrectly for KWH users. LIS-9632 addressed this by hardcoding the popup so it only shows when `LisGlobal.hospital == CommonConstants.HOSPITAL_QEH` in `GcrSpecAckUIComponents.as`.

QEH is currently the only hospital that implements ward-assigned request no. KTH will implement the same feature. The QEH-only hardcode must be removed and replaced with setup-driven control so hospitals that enable ward-assigned request no. get the reminder, and others do not.

Ward-assigned request no. feature enablement is already represented in `loe_control`: hospitals with `WARD_PRINT_LABNO_LABEL = 'Y'` and without `RELABEL_WARD_ASSIGN_REQ_NO = 'Y'` (or the control does not exist) have the feature implemented. For example, QEH has `WARD_PRINT_LABNO_LABEL = 'Y'` only, while KWH has both `WARD_PRINT_LABNO_LABEL = 'Y'` and `RELABEL_WARD_ASSIGN_REQ_NO = 'Y'` (relabel / cross-hospital handling, not local ward-assigned request no. implementation).

## Change Description

1. **Remove QEH-hardcoded hospital check for the Lab No. assignment reminder:**
   - In `GcrSpecAckUIComponents.as` (Specimen Acknowledgement), replace the condition `LisGlobal.hospital == CommonConstants.HOSPITAL_QEH` that gates the *"Please assign Lab No. to acknowledge this specimen!"* popup (`GcrAlertDialogue` / `w_lis_loe_labno_reg_reminder_popup`).
   - Retain existing behaviour: user suppress-until-log-off checkbox, and GCR audit when the reminder is turned off.

2. **Derive popup visibility from existing `loe_control` / dictionary setup:**
   - Show the reminder when the hospital has ward-assigned request no. feature implemented, defined as:
     - `WARD_PRINT_LABNO_LABEL = 'Y'` (already parsed as `dictionaryParam.isWardPrintReqNumberLabelEnabled`); and
     - `RELABEL_WARD_ASSIGN_REQ_NO` is not `'Y'` or does not exist (already parsed as `dictionaryParam.isRelabelWardAssignRequestNo`).
   - Condition effectively: `isWardPrintReqNumberLabelEnabled && !isRelabelWardAssignRequestNo`.
   - Hospitals without this combination (e.g. KWH with both controls `'Y'`) must not see the popup when retrieving cross-hospital ward-assigned request numbers.
   - Hospitals that meet the setup (QEH today; KTH when configured the same way) continue to see the reminder when acknowledging a specimen without a ward-assigned request no.

## Justification

Hardcoding the reminder to QEH blocks rollout of ward-assigned request no. to other hospitals (e.g. KTH) without further code changes. Reusing existing `loe_control` flags (`WARD_PRINT_LABNO_LABEL` / `RELABEL_WARD_ASSIGN_REQ_NO`) keeps behaviour correct for cross-hospital retrieval (LIS-8437) while allowing new sites to enable the feature by setup alone, without another hospital-specific patch.

## Target Completion Date

31st Jul 2026

## Design

<!-- Populated by generate-design skill before CP3 review. See design-template.md. -->

## Reference Logs

- LIS-9632
- LIS-8437
