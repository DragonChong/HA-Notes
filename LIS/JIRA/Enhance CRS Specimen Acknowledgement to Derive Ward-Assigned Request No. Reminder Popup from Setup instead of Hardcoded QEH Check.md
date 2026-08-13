---
title: Enhance CRS Specimen Acknowledgement to Derive Ward-Assigned Request No. Reminder Popup from Setup instead of Hardcoded QEH Check
tags:
  - jira-log
  - lis
request_type: Change Request
priority: Medium
services:
  - lis-ecpath5-app
target_completion_date: 2026-07-30
status: draft
created: 2026-07-16
jira: LIS-10747
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

In Specimen Acknowledgement, when a specimen is retrieved in a lab that supports the ward-assigned request no. feature but the specimen has not been assigned a ward-assigned request no., the system prompts: *"Please assign Lab No. to acknowledge this specimen!"* 

After the blood-taking-within-cluster enhancement in LIS-8437, ward-assigned request numbers from other hospitals (e.g. QEH) can be retrieved in KWH CRS. That caused the Lab No. assignment reminder to appear incorrectly for KWH users. LIS-9632 addressed this by hardcoding the popup so it only shows when `LisGlobal.hospital == CommonConstants.HOSPITAL_QEH` in `GcrSpecAckUIComponents.as`.

QEH is currently the only hospital that implements ward-assigned request no. KTH will implement the same feature. The QEH-only hardcode must be removed and replaced with setup-driven control so hospitals that enable ward-assigned request no. get the reminder, and others do not.

Ward-assigned request no. feature enablement is already represented in `loe_control`: hospitals with `WARD_PRINT_LABNO_LABEL = 'Y'` and without `RELABEL_WARD_ASSIGN_REQ_NO = 'Y'` (or the control does not exist) have the feature implemented. For example, QEH has `WARD_PRINT_LABNO_LABEL = 'Y'` only, while KWH has both `WARD_PRINT_LABNO_LABEL = 'Y'` and `RELABEL_WARD_ASSIGN_REQ_NO = 'Y'` (relabel / cross-hospital handling, not local ward-assigned request no. implementation).

## Change Description

1. **Remove QEH-hardcoded hospital check for the Lab No. assignment reminder:**
   - In `GcrSpecAckUIComponents.as` (Specimen Acknowledgement), replace the condition `LisGlobal.hospital == CommonConstants.HOSPITAL_QEH` that gates the *"Please assign Lab No. to acknowledge this specimen!"* popup (`GcrAlertDialogue`).

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

**Review type:** incremental
**JIRA key:** LIS-10747
**Service:** lis-ecpath5-app
**Review forum:** CP3
**Review date:** TBC
**Target completion:** TBC — frontmatter says 30 Jul 2026, body says 31 Jul 2026; both lapsed
**Prior review:** none

### Agenda
Background
Design Review
Promotion
Fallback
Q&A

### Slide: How we got here
**Archetype:** evolution
Blood taking within the cluster made another hospital's ward-assigned request numbers retrievable locally
That made the Lab No. reminder fire for users at a site that does not assign those numbers itself
The fix at the time named one hospital in code, which is what now blocks the next site

### Slide: What the code does today
**Archetype:** code-findings
The reminder is gated on the identity of the hospital running the client, not on whether the feature is set up
```actionscript
if (LisGlobal.hospital ==
        CommonConstants.HOSPITAL_QEH) {
    // GcrAlertDialogue
    "Please assign Lab No. to
     acknowledge this specimen!"
}
```
Findings: every new site needs a source change; site identity sits in a shared component; the setup already records the answer

### Slide: Proposed logic
**Archetype:** decision-flow
Two controls already describe whether a hospital implements ward-assigned request no.
A site has the feature when the ward-print control is on and the relabel control is not
Both are already read into the client's dictionary parameters, so no new setup or database work is needed
```
isWardPrintReqNumberLabelEnabled && !isRelabelWardAssignRequestNo
```
Cross-hospital retrieval sites keep both controls on, so they stay silent as they do today

### Slide: How each hospital resolves
**Archetype:** matrix
| Hospital | WARD_PRINT_LABNO_LABEL | RELABEL_WARD_ASSIGN_REQ_NO | Feature implemented | Reminder popup |
| --- | --- | --- | --- | --- |
| QEH | Y | not set | Yes | Shown |
| KWH | Y | Y | No - relabel / cross-hospital only | Suppressed |
| KTH | Y | not set | Yes - once configured | Shown |
| Other sites | not set | not set | No | Suppressed |
This matrix is the regression list: behaviour must be unchanged for QEH and KWH

### Slide: Scope of change
**Archetype:** steps-sidebar
Replace the hospital check in Specimen Acknowledgement with the setup-driven condition
No new control, no setup data change and no database work - both flags are already parsed
Regression across all four cases in the matrix above

### Slide: Promotion
**Archetype:** cards
Release the client with the condition change - QEH is already configured, so nothing to set
Verify at QEH that the reminder still appears, and at KWH that it stays suppressed
KTH enables the feature by setting the ward-print control when they are ready, with no further release

### Slide: Fallback
**Archetype:** cards
Revert the client release - the previous hardcoded behaviour returns immediately
Nothing to unwind: the change introduces no setup data and no schema change
If KTH was configured early, unset the ward-print control to return them to no reminder

### Slide: Q&A

## Reference Logs

- LIS-9632
- LIS-8437
