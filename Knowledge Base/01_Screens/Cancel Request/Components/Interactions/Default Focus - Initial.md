---
epic: LISP-258
status: draft
---
# Default Focus — Initial

## Overview

When the Cancel Request screen first opens, the keyboard focus is automatically placed on the **Request No. Text Input**. This ensures that staff can immediately begin entering a request number without needing to click the field manually, allowing the screen to be operated entirely by keyboard from the moment it appears.

---

## Related User Stories

- **[[CRST-934]]** - Cancel Request - Default Focus (Initial)

**Epic:** LISP-258 [CRST][DEV] Cancel Request - Screen Object Interaction

---

## Behaviour

When the Cancel Request screen is opened, the system places the initial keyboard focus on the **Request No. Text Input**.

The **Request No. Text Input** is the only field that is active and ready for input when the screen first opens — all other fields and buttons are either disabled or non-editable until a request is retrieved. Placing focus here immediately directs the user to begin the retrieval workflow.

---

## Business Rules

1. The initial focus on screen open is always the **Request No. Text Input**, regardless of any prior state.
2. This initial focus is distinct from the post-retrieval focus — after a request is retrieved, focus moves to the **Cancel Reason Text Input** (see [[Request Cancelled Message]] for details of the post-retrieval focus behaviour).

---

## Related Components

- [[Tab Sequence]] — The tab sequence begins from the **Request No. Text Input**, consistent with its role as the initial focus point.

## Related Workflows

- [[Retrieve Request]] — The initial focus on the Request No. field is designed to facilitate request retrieval immediately upon screen open.
