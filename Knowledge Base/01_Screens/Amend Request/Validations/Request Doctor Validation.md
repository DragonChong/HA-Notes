---
epic: LISP-223
status: draft
---
# Request Doctor Validation

## Overview

When the **Amend** button is clicked, the system validates the **Request Doctor** fields before saving the amendment. Three distinct checks are performed: the doctor code must not be blank, the doctor code must exist on the current lab's hospital, and — when configured — the Request Doctor's hospital must match the Request Location hospital. Hard errors block the amendment outright; the hospital mismatch check presents a confirmation that the user can choose to override.

---

## Related User Stories

- **[[CRST-894]]** - Amend Request - Request Doctor Validation Checking
- **[[CRST-797]]** - Amend Request - Validation (AmendRequestDataValidator) *(parent validation story)*

**Epic:** LISP-223 [CRST][DEV] Amend Request - Amend Action

---

## Validation Rules and Messages

| Message | Text | Condition | User Options | On Action |
|---------|------|-----------|-------------|-----------|
| 490 | "Req Doctor must not be blank." | Request Doctor Code field is empty | OK | Message closes; amendment undone |
| 497 | "Invalid Request Doctor." | Request Doctor Code does not exist on the current lab's hospital | OK | Message closes; amendment undone |
| 4064 | "Request Doctor Hosp. and Request Location Hosp. mismatched. Continue?" | Request Doctor Hospital does not match Request Location Hospital AND `OFFICE_TABLE_MULTIPLE_DOCTOR_NOT_READY` = 0 | Yes / No | **Yes:** amendment proceeds and saves. **No:** message closes; user can re-edit Request Doctor Hospital and Doctor Code |

> Messages 490 and 497 are hard errors — the amendment cannot proceed until the field is corrected. Message 4064 is a confirmation — the user may choose to override the mismatch and save.

---

## Configuration

| Setting | Option Code | Purpose | Effect when enabled (= 0) | Effect when disabled (= 1) |
|---------|------------|---------|--------------------------|---------------------------|
| Office Table Multiple Doctor Not Ready | `OFFICE_TABLE_MULTIPLE_DOCTOR_NOT_READY` | Controls whether the hospital mismatch confirmation (4064) is evaluated | Hospital mismatch check is active; message 4064 is prompted on mismatch | Hospital mismatch check is skipped; no 4064 message |

*Source: `LAB_OPTION` table, `option_group = 'REQUEST_REGISTRATION'`.*

> Note: The option acts as a "not ready" flag — setting `option_value = 0` means the multi-doctor office table feature **is** in effect, enabling the mismatch check. Setting it to `1` suppresses the check.

---

## Related Workflows

- [[Amend Request Validation]] — Request Doctor validation runs as part of the overall validation sequence when the Amend button is clicked.
