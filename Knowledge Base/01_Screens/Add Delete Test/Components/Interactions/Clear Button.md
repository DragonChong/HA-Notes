---
epic: LISP-264
status: draft
---
# Clear Button

## Overview

The **Clear** button allows staff to discard the currently retrieved request and reset the Add/Delete Test screen to its initial empty state. To prevent accidental data loss, the system prompts for confirmation before clearing when a request is already loaded. If the user confirms, all retrieved data and any unsaved test additions or deletions are discarded and the screen reverts to its default initial state.

---

## Related User Stories

- **[[CRST-1025]]** — Add Delete Test — Clear Button

**Epic:** LISP-264 [CRST][DEV] Add/Delete Test — Screen Object Interaction

---

## Behaviour

### Clicking Clear After a Request Is Retrieved

When a request has been retrieved and the **Clear** button is enabled, clicking it displays a confirmation prompt.

---

## Confirmation Prompt

| Message | Text | Trigger | User Options |
|---------|------|---------|-------------|
| 648 | "Clear current record?" | User clicks **Clear** while a request is loaded | OK / Cancel |

### User Clicks Cancel

The prompt closes. The screen is unchanged — the retrieved request data and all current changes remain on screen exactly as before. The buttons remain in their enabled state.

### User Clicks OK

The clear action proceeds. All retrieved information is cleared from the screen:

- Request No. field is emptied
- Patient demographic fields are cleared
- Test Grid is cleared
- Any unsaved test additions or deletions are discarded

The screen reverts to its initial state: the **Submit**, **Clear**, **Test Panel**, and **Input Specimen No.** controls all return to their default disabled state, and the **Request No.** field is ready for a new entry.

---

## Business Rules

1. The **Clear** button is only enabled after a request has been successfully retrieved; it is disabled in the Initial state.
2. When **Clear** is clicked, the confirmation prompt (message 648) must be acknowledged before the clear takes effect.
3. Clicking **Cancel** on the prompt leaves the screen entirely unchanged, including all enabled button states.
4. Clicking **OK** on the prompt unconditionally clears all retrieved data and returns the screen to its initial state.
5. After a clear, the **Submit**, **Clear**, **Input Specimen No.**, and **Test Panel** return to their disabled state, and the **Request No.** field becomes editable again.

---

## Related Components

- [[Default Screen Behavior]] — Describes the initial state that the screen returns to after a clear.
- [[Object Enablement After Retrieval]] — The inverse of clear: describes how the screen becomes active after retrieval.

## Related Workflows

- [[Retrieve Request]] — Retrieval is the prerequisite for the **Clear** button to become enabled.
