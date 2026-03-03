---
epic: LISP-264
status: draft
---
# Tab Sequence

## Overview

The Add/Delete Test screen follows a defined keyboard tab order that allows staff to navigate through all interactive controls using the **Tab** key. After a request is retrieved, the initial focus is on the **Test Panel** and the tab sequence cycles through all active controls in a fixed loop. Before retrieval, most controls are disabled and the effective sequence is minimal.

---

## Related User Stories

- **[[CRST-1027]]** — Add Delete Test — Tab Sequence

**Epic:** LISP-264 [CRST][DEV] Add/Delete Test — Screen Object Interaction

---

## Tab Order After Retrieval

The following table defines the tab sequence after a request has been retrieved. The focus starts on the **Test Panel** (the default post-retrieval focus) and cycles through the following controls in order:

| Order | Field / Control |
|-------|----------------|
| 1 | **Test Panel** *(default focus after retrieval)* |
| 2 | **Request No.** *(non-editable; focus passes through)* |
| 3 | **Submit** *(button)* |
| 4 | **Pay Code** *(read-only; focus passes through)* |
| 5 | **Clear** *(button)* |
| → | *Loops back to* **Test Panel** |

---

## Before Retrieval

Before any request has been retrieved, only the **Request No.** field has initial focus. The **Submit**, **Clear**, and **Test Panel** are all disabled and are not reachable by Tab. The effective keyboard navigation is limited.

---

## Business Rules

1. After retrieval, the default focus is on the **Test Panel** — this is where the tab cycle begins.
2. The tab sequence is fixed and does not reorder based on screen state; disabled controls are skipped automatically.
3. The **Pay Code** field appears in the tab sequence but is always read-only — focus passes through it without the user being able to enter data.
4. The **Request No.** field appears in the tab sequence after retrieval but is non-editable — it is present for navigation continuity.
5. The tab sequence loops: after **Clear**, pressing Tab returns focus to the **Test Panel**.
6. The **Exit** button is not listed in the post-retrieval cycle defined by this US; it is always accessible but is not part of the defined loop.

---

## Related Components

- [[Default Focus - Initial]] — Defines the initial focus point when the screen first opens (before retrieval).
- [[Object Enablement After Retrieval]] — Defines which controls are enabled at each state, determining which controls are reachable by Tab.

## Related Workflows

- [[Retrieve Request]] — Retrieval changes the enabled state of controls and triggers the post-retrieval tab cycle.
