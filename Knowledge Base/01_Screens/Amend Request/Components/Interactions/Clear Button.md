---
epic: LISP-222
status: draft
---
# Clear Button — Interaction

## Overview

The **Clear** button allows registration staff to discard a retrieved request and reset the Amend Request screen to its initial state. To prevent accidental data loss, the system prompts for confirmation before clearing. If the user confirms, all retrieved data is removed and all action buttons revert to their default (post-open, no request loaded) states. If the user cancels, the screen remains unchanged.

---

## Related User Stories

- **[[CRST-794]]** - Amend Request - Clear Button

**Epic:** LISP-222 [CRST][DEV] Amend Request - Screen Object Interaction

---

## Behaviour

### Enablement

The **Clear** button is **disabled** when the Amend Request screen first opens. It becomes **enabled** once a registered lab request has been successfully retrieved.

> **Revamp note:** See [[Buttons]] for the enablement rule. The current system enables Clear regardless of retrieval state; the revamped system should only enable it after retrieval.

### Clicking Clear

When the user clicks the **Clear** button:
1. The system displays a confirmation prompt: **"Clear current record?"** (message 648).
2. The user must choose **OK** or **Cancel**.

### User Clicks Cancel on the Prompt

The confirmation prompt closes. The screen is unchanged — the retrieved request data remains on screen and all buttons remain in their current enabled state.

### User Clicks OK on the Prompt

The system clears all retrieved request data from the screen. All fields are emptied and the screen reverts to the same state as when it was first opened:
- All action buttons reset to their **default opening state** (i.e., **Amend** is disabled; **Clear** is disabled per revamp intent).
- The **Request No.** field is cleared and ready for a new entry.

---

## Error Messages and System Prompts

| Message | Text | Trigger | User Options |
|---------|------|---------|-------------|
| 648 | "Clear current record?" | User clicks the **Clear** button while a request is loaded | OK / Cancel |

---

## Related Components

- [[Buttons]] — Describes the Clear button's visual presence, visibility, and enablement rules in the context of all Amend Request buttons.

## Related Workflows

- [[Retrieve Request]] — Retrieval is the prerequisite for the Clear button to be enabled; clicking Clear undoes the effects of retrieval.
