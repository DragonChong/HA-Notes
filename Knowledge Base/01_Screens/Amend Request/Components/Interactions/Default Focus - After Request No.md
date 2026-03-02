---
epic: LISP-222
status: draft
---
# Default Focus — After Request No.

## Overview

After a registered lab request has been successfully retrieved by entering a request number, the keyboard focus moves automatically to the **Category** dropdown in the Request Information Panel. This positions the cursor at the first editable field, allowing staff to begin reviewing or amending the request information immediately without additional navigation.

---

## Related User Stories

- **[[CRST-786]]** - Amend Request - Default Focus after Request No.

**Epic:** LISP-222 [CRST][DEV] Amend Request - Screen Object Interaction

---

## Behaviour

When the user enters a registered request number in the **Request No.** field and the system successfully retrieves the request, the keyboard focus is transferred to the **Category** dropdown list on the Request Information Panel.

The **Category** dropdown is active and ready for interaction — the user can immediately open it to change the value or press **Tab** to move to the next field.

> This behaviour defines the starting point for the tab sequence documented in [[Tab Sequence]].

---

## Related Workflows

- [[Retrieve Request]] — Focus shifts to the Category dropdown on successful request retrieval.
- [[Tab Sequence]] — The tab sequence begins from the Category dropdown, which is where focus lands after retrieval.
