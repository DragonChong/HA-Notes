---
epic: LISP-254
status: draft
---
# Tab Sequence

## Overview

The Wipeout Request screen follows a defined keyboard tab order that allows staff to navigate through all interactive fields and buttons using the **Tab** key. The sequence begins at the **Request No. Text Input** — which receives focus when the screen first opens — and progresses through the available controls. The effective portion of the tab sequence in use at any moment depends on the current retrieval state: before retrieval, most controls are disabled and are skipped; after retrieval, the **Wipeout Request** button is included in the sequence.

---

## Related User Stories

- **[[CRST-991]]** - Wipeout Request - Tab Sequence

**Epic:** LISP-254 [CRST][DEV] Wipeout Request — Screen Object Interaction

---

## Full Tab Order

The following table defines the complete tab order for Wipeout Request. Whether a control is reachable at a given moment depends on its enabled state (see [[Object Enablement After Retrieval]]):

| Order | Field / Control |
|-------|----------------|
| 1 | **Request No. Text Input** |
| 2 | **Wipeout Request** *(button)* |
| 3 | **Clear** *(button)* |
| 4 | **Exit** *(button)* |

---

## Effective Tab Sequence by State

### Before Request Retrieval

Before any request has been retrieved, the **Wipeout Request** button is disabled. The effective tab path is:

**Request No. Text Input** → **Clear** → **Exit**

### After Request Retrieval

Once a request is loaded and the **Wipeout Request** button is enabled, the effective tab path is:

**Request No. Text Input** → **Wipeout Request** → **Clear** → **Exit**

---

## Comparison with Cancel Request

| Screen | Before Retrieval | After Retrieval |
|--------|-----------------|-----------------|
| Cancel Request | Req. No. → Clear → Cancel Reason → Exit | Req. No. → Clear → Cancel Reason → Cancel Comment Buttons (1–15) → Cancel Request → Exit (or Update Reason → Authorize Reason path) |
| Wipeout Request | Req. No. → Clear → Exit | Req. No. → Wipeout Request → Clear → Exit |

Wipeout Request has a significantly shorter tab sequence because it has no Cancel Reason input, no Cancel Comment buttons, and no Update Reason / Authorize Reason buttons.

---

## Business Rules

1. The tab sequence is fixed — it does not reorder based on retrieval state. Disabled controls are skipped automatically.
2. The **Exit** button is always the last reachable control in the tab sequence.
3. The starting focus point when the screen opens is **Request No. Text Input** — see [[Default Focus - Initial]] for details.
4. The **Wipeout Request** button occupies tab position 2 but is only reachable after a request has been retrieved.

---

## Related Components

- [[Default Focus - Initial]] — Defines the initial focus point, which establishes the starting position for keyboard navigation.
- [[Object Enablement After Retrieval]] — Defines which controls are enabled at each retrieval state, determining the effective reachable tab sequence.

## Related Workflows

- [[Retrieve Request]] — Retrieval changes the enabled state of controls and therefore the effective tab sequence.
