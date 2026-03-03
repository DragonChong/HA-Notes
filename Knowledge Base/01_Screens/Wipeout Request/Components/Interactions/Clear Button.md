---
epic: LISP-254
status: draft
---
# Clear Button

## Overview

The **Clear** button allows staff to discard the currently retrieved request and reset the Wipeout Request screen to its initial empty state. To prevent accidental data loss, the system prompts for confirmation before clearing when a request is already loaded. If the user confirms, all retrieved data is removed and the screen reverts to its default state.

Unlike Cancel Request, the Wipeout Request screen has no **Retain Cancel Reason Checkbox** and no **Cancel Reason Text Input**. The Clear button therefore clears all retrieved data without any selective retention logic.

> **Shared logic (confirmation prompt only):** The confirmation prompt behaviour (message 648 "Clear current record?") is shared with Cancel Request — see [[Cancel Request/Components/Interactions/Clear Button|Clear Button (Cancel Request)]]. The key difference is that Wipeout Request has no cancel reason retention.

---

## Related User Stories

- **[[CRST-989]]** - Wipeout Request - Clear Button
- Shared logic reference (confirmation prompt): **[[CRST-935]]** Clear Button Click Action point 1

**Epic:** LISP-254 [CRST][DEV] Wipeout Request — Screen Object Interaction

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

The screen reverts to its initial state: the **Wipeout Request** button returns to its disabled state and the **Request No. Text Input** is ready for a new entry.

---

## Business Rules

1. If no request has been retrieved when **Clear** is clicked, no confirmation prompt is shown and the clear action proceeds immediately.
2. If a request has been retrieved, the "Clear current record?" confirmation (message 648) must be acknowledged before the clear takes effect.
3. Unlike Cancel Request, there is no **Retain Cancel Reason** logic — all retrieved data is cleared without exception.
4. After a clear, all fields (request data, patient demographics, clinical details, comments, test grid) are reset to empty.
5. After a clear, the screen reverts to its initial enabled state — the **Wipeout Request** button is disabled and the **Request No. Text Input** is ready for input.

---

## Related Components

- [[Default Screen Behavior]] — Describes the initial state the screen returns to after a clear.
- [[Object Enablement After Retrieval]] — The inverse of clear: describes how the screen becomes active after retrieval.

## Related Workflows

- [[Retrieve Request]] — Retrieval is the prerequisite for the confirmation prompt to appear; clearing undoes the effects of retrieval.
