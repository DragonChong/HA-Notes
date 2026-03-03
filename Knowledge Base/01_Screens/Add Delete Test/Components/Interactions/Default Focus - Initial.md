---
epic: LISP-264
status: draft
---
# Default Focus — Initial

## Overview

When the Add/Delete Test screen first opens, the keyboard focus is automatically placed on the **Request No.** field. This ensures that staff can immediately begin entering a request number without needing to click the field manually, allowing the screen to be operated entirely by keyboard from the moment it appears.

---

## Related User Stories

- **[[CRST-1026]]** — Add Delete Test — Default Focus (Initial)

**Epic:** LISP-264 [CRST][DEV] Add/Delete Test — Screen Object Interaction

---

## Behaviour

When the Add/Delete Test screen is opened from the Registration top menu, the system places the initial keyboard focus on the **Request No.** field.

The **Request No.** field is the only field that is active and ready for input when the screen first opens — all other fields and buttons are either disabled or non-editable until a request is retrieved. Placing focus here immediately directs the user to begin the retrieval workflow.

---

## Business Rules

1. The initial focus on screen open is always the **Request No.** field, regardless of any prior state.
2. This initial focus is distinct from the post-retrieval focus — after a request is retrieved, focus moves to the **Test Panel** (consistent with the tab sequence starting point after retrieval).

---

## Related Components

- [[Tab Sequence]] — The tab sequence after retrieval begins from the **Test Panel**, with the **Request No.** field at the second position in the post-retrieval cycle.

## Related Workflows

- [[Retrieve Request]] — The initial focus on the Request No. field is designed to facilitate request retrieval immediately upon screen open.
