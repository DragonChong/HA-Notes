---
epic: LISP-223
status: draft
---
# Amend Action Result Message

## Overview

After all save actions complete, the system displays a result message to inform the user of the outcome. A successful amendment shows a confirmation message and clears the screen. Failure conditions — including server errors, concurrent edits by another user, and unacknowledged CRAS results — each produce specific messages with distinct behaviour. Understanding these result messages is essential for registration staff to know when an amendment has been applied and when they must take corrective action.

---

## Related User Stories

- **[[CRST-808]]** - Amend Request - Amend Action Result Message
- **[[CRST-797]]** - Amend Request - Validation (AmendRequestDataValidator) *(parent validation story)*

**Epic:** LISP-223 [CRST][DEV] Amend Request - Amend Action

---

## Result Messages

### Message 501 — Success

| Property | Detail |
|----------|--------|
| Message | "Request updated." |
| Trigger | Lab request updated successfully without error |
| User Options | OK |
| On OK | Message closes; screen is cleared (see [[Clear Screen]]) |

---

### Message 1992 — Save Failure

| Property | Detail |
|----------|--------|
| Message | "Request update fail" |
| Trigger | An application error occurs during the save |
| User Options | OK |
| On OK | Message closes |

---

### Message 3861 — Concurrent Edit Conflict

| Property | Detail |
|----------|--------|
| Message | "The request data is already outdated, which can be accessed or edited by 3rd parties at the same time. Please retrieve and edit it again." |
| Trigger | Another user has already amended the same request between the current user's retrieval and their Amend click |
| User Options | OK |
| On OK | Message closes; **Amend** button becomes visible and **disabled**; **Clear** button remains enabled |

> After message 3861, the user must click **Clear** to reset the screen and retrieve the request again before making any further amendments.

---

### Message 4332 — Unacknowledged CRAS Result

| Property | Detail |
|----------|--------|
| Message | "Unacknowledged PRELIM result CRAS transaction exists. System will NOT send CRAS signal if you amend request action. Are you sure to proceed?" |
| Trigger | The retrieved request has a CRAS transaction with an unacknowledged preliminary result |
| Default Focus | **No** button |
| User Options | Yes / No |

| Action | Behaviour |
|--------|-----------|
| **No** | Screen is cleared; default focus returns to the Request No. field |
| **Yes** | Amendment proceeds and is saved; the CRAS transaction is not signalled |

> Message 4332 is only shown when `CRAS_TRANSACTION.cras_ready = 1`. If `cras_ready = 0`, the amendment proceeds without this prompt.

---

## Summary Table

| Message | Condition | Options | On OK/Yes | On No/Cancel |
|---------|-----------|---------|-----------|-------------|
| 501 | Success | OK | Screen cleared | — |
| 1992 | Save error | OK | Message closes | — |
| 3861 | Concurrent edit conflict | OK | Amend disabled; Clear enabled | — |
| 4332 | Unacknowledged CRAS result | Yes / No | Amendment saved; no CRAS signal | Screen cleared; focus on Request No. |

---

## Related Workflows

- [[Clear Screen]] — Triggered automatically after a successful amendment (message 501 OK).
- [[Change Audit]] — Audit records are written only when the save succeeds.
- [[Operation Audit]] — Sendout operation audit records are written only when the save succeeds.
