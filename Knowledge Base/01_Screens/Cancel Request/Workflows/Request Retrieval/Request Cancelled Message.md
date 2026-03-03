---
epic: LISP-245
status: draft
---
# Request Cancelled Message

## Overview

When a request is retrieved on the Cancel Request screen and the system determines that it has already been cancelled, the screen displays a message to inform the user of this status before loading the cancel reason data. The exact message shown — and whether the user can proceed to update or authorise the cancel reason — depends on the user's access rights and whether the lab option for amending cancel comments is enabled. Users without the necessary rights are shown an informational message only, and the screen is cleared.

---

## Related User Stories

- **[[CRST-931]]** - Cancel Request - Request Cancelled Message

**Epic:** LISP-245 [CRST][DEV] Cancel Request — Request Retrieval

---

## When This Occurs

This behaviour is triggered immediately after a request is successfully retrieved and the system identifies that the request already has a cancel comment test record — that is, it has previously been cancelled. Before enabling the screen for any further action, the system evaluates the user's rights and the `AMEND_CANCEL_COMMENT` lab option to determine which message to show and whether any further action is permitted.

---

## Message Decision Logic

The outcome depends on two conditions evaluated in combination:

1. **Does the user hold any cancel request access right?** (any of: Report, Authorised, Resulted, No Result)
2. **Is amending the cancel comment permitted?** (determined by `AMEND_CANCEL_COMMENT` lab option, or overridden by the lab's special rules)

| User Holds a Cancel Right | Amend Cancel Comment Permitted | Message Shown | Screen State After Message |
|---|---|---|---|
| Yes | Yes | 654 — Request already cancelled; can update the cancel reason | Screen is enabled in Ready state; Cancel Reason field editable; Update/Authorize buttons enabled per user rights |
| Yes | No | 655 — Request already cancelled; cannot update the cancel reason | Screen is enabled in Ready state; Cancel Reason field non-editable; Update/Authorize buttons disabled |
| No | Yes | 656 — Request already cancelled (informational) | Screen is cleared; user cannot proceed |
| No | No | *(no message)* | Screen is cleared silently; user cannot proceed |

> When the screen is cleared after showing message 656 (or silently), the Cancel Reason field, patient details, and all retrieved data are reset to their initial state. The user must enter a new request number to continue.

---

## Messages

| Message Code | Description | Buttons |
|---|---|---|
| 654 | Request already cancelled; user has rights and may amend the cancel reason | OK (proceeds to load data and enable screen) |
| 655 | Request already cancelled; user has rights but cannot amend the cancel reason | OK (proceeds to load data in read-only state) |
| 656 | Request already cancelled; user does not have rights to proceed | OK (screen is cleared after dismissal) |

Messages 654 and 655 both result in the screen being populated with the retrieved data and enabled. The difference is whether the Cancel Reason field becomes editable.

---

## What Happens After the Message Is Dismissed

### After message 654 or 655
The system loads the retrieved request data into all screen fields. If the cancel comment test has a non-empty text result, the previously saved cancel reason is loaded into the Cancel Reason field. The screen is placed in the Ready state, with the Cancel button disabled (since the request is already cancelled) and the Update/Authorize buttons enabled according to the user's access rights.

### After message 656
The screen is cleared. All fields are reset and the screen returns to its initial state, ready for a new request number to be entered.

### When no message is shown (user has no right, amend not permitted)
The screen is cleared silently without any message.

---

## Configuration

| Setting | Option Code | Purpose | Effect when enabled | Effect when disabled |
|---|---|---|---|---|
| Amend Cancel Comment | `AMEND_CANCEL_COMMENT` | Controls whether a previously saved cancel reason can be edited after retrieval | Message 654 shown (if user has right); Cancel Reason field editable | Message 655 shown (if user has right); Cancel Reason field non-editable |

> **ANAT override:** For ANAT (Anatomical Pathology) requests, `AMEND_CANCEL_COMMENT` is always treated as disabled for already-cancelled requests, regardless of the lab option setting. See [[Object Enablement After Retrieval (ANAT)]] for details.

---

## Business Rules

1. The "request cancelled" message path is triggered only when a cancel comment test record is found in the retrieved request's lab results.
2. A user must hold at least one cancel request access right to see the retrieved data; without any such right, the screen is cleared.
3. When the user has rights and amend is permitted (msg 654), the Cancel Reason field becomes editable and the Update/Authorize buttons are enabled per the user's specific rights.
4. When the user has rights but amend is not permitted (msg 655), the Cancel Reason field is displayed as read-only and the Update/Authorize buttons remain disabled.
5. When the user has no rights but amend is permitted (msg 656), an informational message is shown and the screen is then cleared.
6. When the user has no rights and amend is not permitted, the screen is cleared silently with no message.
7. The focus after loading the screen in Ready state is placed on the Cancel Reason field.

---

## Related Workflows

- [[Cancel Comment Test]] — The mechanism by which the system identifies that a request has already been cancelled.
- [[Retrieve Request]] — The retrieval step that precedes this message path.
- [[Object Enablement After Retrieval]] — The full screen object enablement logic applied after the message is dismissed.
- [[Object Enablement After Retrieval (ANAT)]] — The ANAT-specific override that unconditionally blocks amending a cancelled request.
- [[Update Reason]] — The workflow available when the user has the appropriate right and amend is permitted.
- [[Authorize Cancel Reason]] — The workflow available when the user has the authorise right and amend is permitted.
