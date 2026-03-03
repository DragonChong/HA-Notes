---
epic: LISP-258
status: draft
---
# Tab Sequence

## Overview

The Cancel Request screen follows a defined keyboard tab order that allows staff to navigate through all interactive fields and buttons using the **Tab** key. The sequence begins at the **Request No. Text Input** — which receives focus when the screen first opens — and progresses through all interactive controls in a logical top-to-bottom, left-to-right order. The effective portion of the tab sequence in use at any moment depends on the current retrieval state: before retrieval, most controls are disabled and are skipped; after retrieval, the full sequence becomes active.

---

## Related User Stories

- **[[CRST-933]]** - Cancel Request - Tab Sequence

**Epic:** LISP-258 [CRST][DEV] Cancel Request - Screen Object Interaction

---

## Full Tab Order

The following table defines the complete tab order. Whether a control is reachable at a given moment depends on its enabled state (see [[Object Enablement After Retrieval]]):

| Order | Field / Control |
|-------|----------------|
| 1 | **Request No. Text Input** |
| 2 | **Clear** *(button)* |
| 3 | **Cancel Reason Text Input** |
| 4–18 | **Cancel Comment Buttons 1–15** *(in order)* |
| 19 | **Cancel Request** *(button)* |
| 20 | **Update Reason** *(button)* |
| 21 | **Authorize Reason** *(button)* |
| 22 | **Exit** *(button)* |

---

## Effective Tab Sequence by State

### Before Request Retrieval

Before any request has been retrieved, only the **Request No. Text Input**, **Clear**, and **Exit** buttons are enabled. The effective tab path is:

**Request No. Text Input** → **Clear** → **Cancel Reason Text Input** → **Exit**

> **Cancel Reason Text Input** appears in the sequence position but is non-editable before retrieval; in practice focus passes through it to Exit.

### After Retrieval — Request Without Saved Cancel Comment

Once a request without a saved cancel comment is loaded, the **Cancel Comment Buttons** and **Cancel Request Button** become enabled. The effective tab path from the **Cancel Reason Text Input** is:

**Cancel Reason Text Input** → **Cancel Comment Buttons (1–15)** → **Cancel Request** → **Exit**

> **Update Reason** and **Authorize Reason** are disabled in this state and are skipped by Tab.

### After Retrieval — Request With Saved Cancel Comment (User with Authorize Right)

When the retrieved request has a saved cancel comment and the user holds the **Authorize Comment** access right, both Update Reason and Authorize Reason are enabled. The effective tab path from the **Cancel Reason Text Input** is:

**Cancel Reason Text Input** → **Cancel Comment Buttons (1–15)** → **Update Reason** → **Authorize Reason** → **Exit**

> **Cancel Request Button** is disabled in this state and is skipped by Tab.

---

## Business Rules

1. The tab sequence is fixed — it does not reorder based on retrieval state. Disabled controls are skipped automatically.
2. The **Cancel Comment Buttons** occupy tab positions 4 through 18 consecutively (15 buttons total). They are visible at all times but are only reachable by keyboard when enabled.
3. The **Exit** button is always the last reachable control in the tab sequence.
4. The starting focus point when the screen opens is **Request No. Text Input** — see [[Default Focus - Initial]] for details.

---

## Related Components

- [[Default Focus - Initial]] — Defines the initial focus point, which establishes the starting position for keyboard navigation.
- [[Object Enablement After Retrieval]] — Defines which controls are enabled at each retrieval state, determining the effective reachable tab sequence.

## Related Workflows

- [[Retrieve Request]] — Retrieval changes the enabled state of controls and therefore the effective tab sequence.
