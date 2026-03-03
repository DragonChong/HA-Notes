---
epic: LISP-249
status: draft
---
# Blood Released Message (BBNK)

## Overview

After a BBNK request with reserved, allocated, or analyser-ordered blood units is successfully cancelled, the system automatically releases those blood units as part of the cancellation process. Once the release is complete, message 3256 is displayed in the message monitor to inform the user that the blood unit has been released. This message is informational and does not require the user to take any action.

---

## Related User Stories

- **[[CRST-949]]** - Cancel Request - BBNK: Blood Released Message

**Epic:** LISP-249 [CRST][DEV] Cancel Request — Special Lab Workflow (BBNK)

---

## When the Message Appears

Message 3256 appears as the final information message at step 7 of the Cancel Request pipeline, immediately after the server confirms that the cancellation was successful. It is shown only when blood units were actually released during the cancellation — that is, when the request had blood units in a reserved, allocated, or analyser-ordered state.

The message appears in the message monitor (non-blocking), alongside the standard cancellation completion message 673.

The cancel action pipeline for a BBNK request with blood to release:

1. Confirm to Proceed
2. Gather Server Information for Validation (blood inventory check)
3. Validate
4. User Validation (if user holds Release Blood right)
5. Ask for Confirmation
6. Cancel Request (server action — blood units released server-side)
7. **Message Monitor: msg 673 (request cancelled) + msg 3256 (blood released)** ← here
8. Clear

---

## Message

| Message Code | Type | Description | User Options |
|---|---|---|---|
| 3256 | Information (message monitor) | Blood unit has been released as a result of the cancellation | None — informational only |
| 673 | Information (message monitor) | Request has been cancelled successfully | None — informational only |

> Message 3256 is shown in addition to (not instead of) message 673. Both messages appear in the message monitor together after a successful cancellation that releases blood.

---

## Conditions That Trigger the Blood Released Message

| Blood Unit State Before Cancellation | Message 3256 Shown |
|---|---|
| Reserved | Yes |
| Allocated | Yes |
| Analyser ordered | Yes |
| Issued or transfused | No — cancellation is blocked before this point (see [[Blood Inventory Validation (BBNK)]]) |
| No blood units | No |

---

## Business Rules

1. Message 3256 is shown only when the server confirms that blood units were released as part of the cancellation.
2. The message is informational; the user does not need to respond to it.
3. Message 3256 appears alongside the standard cancellation completion message (msg 673), not as a replacement.
4. Requests with issued or transfused blood units never reach this point — they are blocked at the blood inventory validation step.

---

## Related Workflows

- [[Blood Inventory Validation]] — The earlier pipeline step that checks for blood unit states and determines whether the cancellation can proceed.
- [[User Access Right Checking]] — The access-right check that gates which users are permitted to release blood units by cancelling the request.
- [[Cancel Request (Action)]] — The full cancellation pipeline; message 3256 is shown at the completion step.
