---
epic: LISP-258
status: draft
---
# Clear Button

## Overview

The **Clear** button allows staff to discard the currently retrieved request and reset the Cancel Request screen to its initial empty state. To prevent accidental data loss, the system prompts for confirmation before clearing when a request is already loaded. If the user confirms, all retrieved data is removed and the screen reverts to its default state. A key behaviour distinguishes Cancel Request from other screens: the **Retain Cancel Reason Checkbox** and the **Cancel Reason Text Input** are deliberately excluded from the standard clear operation — if the checkbox is checked, the cancel reason text is preserved across clears so that staff do not need to re-enter a reason when processing multiple requests.

---

## Related User Stories

- **[[CRST-935]]** - Cancel Request - Clear Button

**Epic:** LISP-258 [CRST][DEV] Cancel Request - Screen Object Interaction

---

## Behaviour

### Clicking Clear Before Any Request Is Retrieved

When no request has been retrieved, clicking **Clear** performs the clear action immediately with no confirmation prompt. The screen is already in its initial state, so nothing visible changes.

### Clicking Clear After a Request Is Retrieved

When a request has been retrieved, clicking **Clear** displays a confirmation prompt before taking any action.

---

## Confirmation Prompt

| Message | Text | Trigger | User Options |
|---------|------|---------|-------------|
| 648 | "Clear current record?" | User clicks **Clear** while a request is loaded | Yes / No |

### User Clicks No

The prompt closes. The screen is unchanged — the retrieved request data and all current input remain on screen exactly as before.

### User Clicks Yes

The clear action proceeds. The following data is cleared from the screen:

- Request No.
- Patient demographic fields
- Clinical detail fields
- Request comment
- Test data grid

The screen reverts to its initial state: all action buttons return to their default disabled state and the **Request No. Text Input** is ready for a new entry.

---

## Retain Cancel Reason Behaviour

The **Retain Cancel Reason Checkbox** and the **Cancel Reason Text Input** are always excluded from the standard clear sweep — they are never cleared automatically by the base clear action. Instead, the following rule applies:

| Retain Cancel Reason Checkbox State | Cancel Reason Text Input After Clear |
|--------------------------------------|---------------------------------------|
| Checked | **Retained** — the cancel reason text is preserved |
| Unchecked | **Cleared** — the cancel reason text is emptied |

This allows staff to enter a cancel reason once, check **Retain Cancel Reason**, and then continue clearing and re-retrieving multiple requests without needing to re-enter the reason each time.

---

## Business Rules

1. If no request has been retrieved when **Clear** is clicked, no confirmation prompt is shown and the clear action proceeds immediately.
2. If a request has been retrieved, the **"Clear current record?"** confirmation (message 648) must be acknowledged before the clear takes effect.
3. The **Retain Cancel Reason Checkbox** is never cleared by the Clear button — its checked or unchecked state persists across clear operations.
4. The **Cancel Reason Text Input** is only cleared by the Clear button when the **Retain Cancel Reason Checkbox** is unchecked. When the checkbox is checked, the text is preserved.
5. After a clear, all other fields (request data, patient demographics, clinical details, comments, test grid) are reset to empty.
6. After a clear, the screen reverts to its initial enabled state — action buttons are disabled and the **Request No. Text Input** is ready for input.

---

## Related Components

- [[Default Screen Behavior]] — Describes the initial state the screen returns to after a clear.
- [[Object Enablement After Retrieval]] — The inverse of clear: describes how the screen becomes active after retrieval.

## Related Workflows

- [[Retrieve Request]] — Retrieval is the prerequisite for the confirmation prompt to appear; clearing undoes the effects of retrieval.
