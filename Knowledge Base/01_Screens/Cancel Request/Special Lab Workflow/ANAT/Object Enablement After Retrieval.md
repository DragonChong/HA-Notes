---
epic: LISP-248
status: draft
---
# Object Enablement After Retrieval (ANAT)

## Overview

After a request is retrieved on the Cancel Request screen for an Anatomical Pathology (ANAT / Histology) lab, the enabled or disabled state of interactive screen objects depends on whether the retrieved request has already been cancelled. If the request has not yet been cancelled, the Cancel Reason field and the Cancel Request button are enabled, allowing the user to proceed with cancellation. If the request is already cancelled, those same objects are disabled and the cancel reason is shown as read-only — and this restriction is absolute for ANAT, regardless of any system configuration that would normally permit editing a previously saved cancel reason.

---

## Related User Stories

- **[[CRST-946]]** - Cancel Request - ANAT: Object Enablement After Retrieval

**Epic:** LISP-248 [CRST][DEV] Cancel Request — Special Lab Workflow (ANAT)

---

## Object States

### Before Cancel (Request Not Yet Cancelled)

Applies when the retrieved request has not previously been cancelled (no cancel comment test record exists).

| Screen Object | Visible | State |
|---|---|---|
| Req. No | Yes | Non-editable |
| Patient Demographic | Yes | Non-editable |
| Clinical Details | Yes | Non-editable |
| Request Comment | Yes | Non-editable |
| Test | Yes | Non-editable |
| Retain Cancel Reason checkbox | Yes | **Enabled** |
| Cancel / Reject Reason | Yes | **Editable** |
| Cancel Request button | Yes | **Enabled** |
| Clear button | Yes | Enabled |
| Exit button | Yes | Enabled |

---

### After Cancelled (Request Already Cancelled)

Applies when the retrieved request has previously been cancelled (a cancel comment test record already exists).

| Screen Object | Visible | State |
|---|---|---|
| Req. No | Yes | Non-editable |
| Patient Demographic | Yes | Non-editable |
| Clinical Details | Yes | Non-editable |
| Request Comment | Yes | Non-editable |
| Test | Yes | Non-editable |
| Retain Cancel Reason checkbox | Yes | **Disabled** |
| Cancel / Reject Reason | Yes | **Non-editable** (displays the previously saved cancel reason) |
| Cancel Request button | Yes | **Disabled** |
| Clear button | Yes | Enabled |
| Exit button | Yes | Enabled |

---

## ANAT-Specific Restriction: Amend Cancel Comment Not Permitted

For ANAT, once a request has been cancelled the cancel reason is permanently locked — the **Update Reason** and **Authorize Reason** buttons are never enabled for a retrieved cancelled ANAT request.

This differs from the general lab behaviour, where a lab option (`AMEND_CANCEL_COMMENT`) can be configured to allow staff to edit or authorise a previously saved cancel reason after retrieval. For ANAT, that lab option is unconditionally ignored for cancelled requests:

> Even when `AMEND_CANCEL_COMMENT = 1` in `LAB_OPTION`, the Cancel / Reject Reason field remains non-editable and the Update Reason / Authorize Reason buttons remain disabled for any already-cancelled ANAT request.

### Comparison: General Labs vs. ANAT

| Scenario | General Labs | ANAT |
|---|---|---|
| Request not yet cancelled | Cancel reason editable; Cancel button enabled | Cancel reason editable; Cancel button enabled |
| Request already cancelled; `AMEND_CANCEL_COMMENT` disabled | Cancel reason non-editable; Update/Authorize disabled | Cancel reason non-editable; Update/Authorize disabled |
| Request already cancelled; `AMEND_CANCEL_COMMENT` enabled | Cancel reason editable; Update/Authorize buttons enabled | Cancel reason **still non-editable**; Update/Authorize **still disabled** |

---

## Configuration

| Setting | Option Code | Purpose | Effect when enabled | Effect when disabled |
|---|---|---|---|---|
| Amend Cancel Comment | `AMEND_CANCEL_COMMENT` | Controls whether staff can edit or authorise a previously saved cancel reason | For general labs: Update Reason and Authorize Reason buttons enabled after retrieval of cancelled request | No editing permitted after cancellation for any lab |

> **ANAT override:** The `AMEND_CANCEL_COMMENT` lab option has no effect on ANAT requests. Once cancelled, the cancel reason is always locked regardless of this setting.

---

## Business Rules

1. For ANAT, the editable state of the Cancel / Reject Reason field is determined solely by whether a cancel comment test record already exists — not by any lab option setting.
2. A request that has not yet been cancelled (no cancel comment test exists) always allows the user to enter a reason and proceed with cancellation.
3. A request that is already cancelled (a cancel comment test exists) always presents the Cancel / Reject Reason as read-only and the Cancel Request button as disabled.
4. The Retain Cancel Reason checkbox is enabled only when the Cancel Request button is enabled (i.e., only before cancellation).
5. The Clear and Exit buttons are always enabled regardless of cancellation status.
6. The Update Reason and Authorize Reason workflows are never available for ANAT requests, regardless of user rights or lab option configuration.

---

## Related Workflows

- [[Object Enablement After Retrieval]] — The base screen object enablement rules for general labs; ANAT extends and overrides these rules for the cancelled-request state.
- [[Update Reason]] — Available to general labs when `AMEND_CANCEL_COMMENT` is enabled; never available for ANAT cancelled requests.
- [[Authorize Cancel Reason]] — Available to general labs when `AMEND_CANCEL_COMMENT` is enabled and user holds the appropriate right; never available for ANAT cancelled requests.
- [[Cancel Request (Action)]] — The cancellation pipeline that runs when the Cancel Request button is clicked; enabled for ANAT only when the request has not yet been cancelled.
