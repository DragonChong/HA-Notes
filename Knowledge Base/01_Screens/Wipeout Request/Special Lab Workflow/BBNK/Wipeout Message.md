---
epic: LISP-256
status: draft
---
# BBNK - Wipeout Message

## Overview

After a BBNK request is successfully wiped out, the system may display informational messages in the message monitor depending on what occurred during the wipeout. If the patient's historical Blood Bank data was deleted as part of the wipeout, message 2217 is shown. If blood units were released as part of the wipeout, message 3256 is shown. These messages are informational and do not require the user to take any action.

---

## Related User Stories

- **[[CRST-1003]]** — Wipeout Request — BBNK: Wipeout Message

**Epic:** LISP-256 [CRST][DEV] Wipeout Request — Special Lab Workflow (BBNK)

---

## Trigger Point

These messages appear at step 7 of the wipeout pipeline (the completion message step), immediately after the server confirms that the wipeout was successful.

---

## Message Conditions

### Historical Patient Data Deleted (Message 2217)

If the user responded **Yes** to message 1659 (see [[BBNK - Ask for Confirmation]]), and the wipeout is subsequently completed, message 2217 is shown in the message monitor to confirm that the patient's historical Blood Bank data has been deleted.

### Blood Units Released (Message 3256)

If the user confirmed that reserved, allocated, or analyser-ordered blood units should be released (by responding **Yes** to message 2376 or 4354 — see [[BBNK - User Access Right Checking]]), and the wipeout is subsequently completed, message 3256 is shown in the message monitor to confirm that the blood units have been released.

---

## Messages

| Message Code | Type | Trigger | Display Location | User Options |
|---|---|---|---|---|
| 2217 | Information | Historical patient data deleted as part of the wipeout | Message monitor | None — informational only |
| 3256 | Information | Blood units released as part of the wipeout | Message monitor | None — informational only |
| 673 | Information | Wipeout completed successfully (standard message) | Message monitor | None — informational only |

> Messages 2217 and/or 3256 appear in addition to the standard wipeout completion message 673, not instead of it.

---

## Conditions Summary

| Condition | Message 2217 Shown | Message 3256 Shown |
|---|---|---|
| Historical data deleted (user said Yes to msg 1659) + wipeout success | Yes | No (unless blood also released) |
| Blood units released (user said Yes to msg 2376 or 4354) + wipeout success | No (unless historical data also deleted) | Yes |
| Both conditions apply | Yes | Yes |
| Neither condition | No | No |

---

## Business Rules

1. Message 2217 is shown only when the user explicitly chose to delete historical patient data (responded Yes to message 1659) and the wipeout was successful.
2. Message 3256 is shown only when blood units were released as part of the wipeout.
3. Both messages are informational — they appear in the message monitor and do not require user interaction.
4. Either, both, or neither message may appear alongside the standard wipeout completion message 673, depending on what occurred.

---

## Related Workflows

- [[BBNK - Ask for Confirmation]] — The step where the user decides whether to delete historical patient data (message 1659).
- [[BBNK - User Access Right Checking]] — The step where the user decides whether to release blood units (messages 2376/4354).
- [[Wipeout Request (Action)]] — The full wipeout pipeline; messages 2217 and 3256 appear at the completion step.
- [[Blood Inventory Validation]] — The earlier pipeline step that checks for blood unit states.
