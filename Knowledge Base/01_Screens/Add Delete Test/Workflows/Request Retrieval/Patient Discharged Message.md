---
epic: LISP-262
status: draft
---
# Patient Discharged Message

## Overview

When a request is successfully retrieved on the Add/Delete Test screen, the system checks whether the patient has been discharged — but only if the lab is configured to allow add-test operations for discharged patients. If the patient's discharge status triggers a check, one of three messages is shown depending on the nature of the discharge indicator. The user can choose to proceed with the add/delete test action or abort and clear the screen.

---

## Related User Stories

- **[[CRST-1020]]** — Add Delete Test — Patient Discharged Message

**Epic:** LISP-262 [CRST][DEV] Add/Delete Test — Request Retrieval

---

## Trigger Point

This check is performed immediately after a request is successfully retrieved, provided:
- The request is **not** a cancelled request, and
- The lab is configured with the "Check Patient Discharge for Add Test" lab option enabled.

Currently, only **BTH (private hospital)** has this lab option enabled.

---

## Message Decision Logic

The message shown depends on the patient's discharge status flag returned with the retrieved request:

| Patient Discharge Status | Message Shown | Yes Response | No Response |
|---|---|---|---|
| Patient enquiry unavailable | **4156** — Patient enquiry unavailable; confirm whether to proceed | Proceed to add/delete test | Clear all request information from screen |
| Patient record not found | **4157** — Patient record not found; confirm whether to proceed | Proceed to add/delete test | Clear all request information from screen |
| Patient is discharged | **4153** — Patient is discharged; confirm whether to proceed | Proceed to add/delete test | Request information remains on screen; user is not forced to clear |

> **Important distinction for message 4153:** When the user clicks **No** after message 4153, the request information is **not** cleared — it remains on screen. For messages 4156 and 4157, clicking **No** clears all request information.

---

## Messages

| Message Code | Trigger | Buttons | Yes Outcome | No Outcome |
|---|---|---|---|---|
| 4153 | Patient is discharged (discharge flag = "Y") | Yes / No | Proceed to add/delete test action | Request information remains on screen |
| 4156 | Patient enquiry service is unavailable | Yes / No | Proceed to add/delete test action | All request information cleared |
| 4157 | Patient record not found in the patient system | Yes / No | Proceed to add/delete test action | All request information cleared |

---

## Configuration

| Setting | Option Code | Source Table | Purpose | Effect When Enabled | Effect When Disabled |
|---------|------------|--------------|---------|--------------------|--------------------|
| Check Patient Discharge for Add Test | `CHECK_PATIENT_DISCHARGE_FOR_ADD_TEST` | `LAB_OPTION` (`option_group = 'TEST_MAINTENANCE'`) | Controls whether discharged patient checking is performed on request retrieval | Discharge check is performed; appropriate message shown | No discharge checking; screen proceeds to ready state without any discharge message |

---

## Business Rules

1. The discharge check is only performed when the "Check Patient Discharge for Add Test" lab option is enabled for the lab; otherwise no message is shown and retrieval proceeds normally.
2. The check is only performed for non-cancelled requests — if the request is already cancelled, the cancelled request path takes precedence.
3. Messages 4156 and 4157 relate to situations where the patient system could not return a definitive discharge status; the user decides whether to proceed at their own discretion.
4. For message 4153 (confirmed discharged patient), clicking **No** leaves the request data on screen — the user may review it before deciding whether to take further action.
5. For messages 4156 and 4157, clicking **No** clears all retrieved information completely.

---

## Related Workflows

- [[Retrieve Request]] — The discharge check is the final gate in the request retrieval flow before the screen becomes ready for use.
- [[Request Cancelled Message]] — The cancelled request check precedes the discharge check; a cancelled request will not trigger the discharge message.
