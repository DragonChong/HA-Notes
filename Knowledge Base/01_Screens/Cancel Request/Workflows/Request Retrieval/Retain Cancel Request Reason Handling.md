---
epic: LISP-245
status: draft
---
# Retain Cancel Request Reason Handling

## Overview

The Cancel Request screen provides a **Retain Cancel Reason for Next Request** checkbox that allows registration staff to carry a cancel reason forward from one request to the next. When the checkbox is checked and the screen is cleared — whether by the **Clear** button, the **Cancel Request** action, the **Update Reason** action, or the **Authorize Reason** action — the text in the **Cancel/Reject Reason** panel is preserved and the checkbox remains checked but disabled. If the retained reason is still present when a subsequently retrieved request also has an existing cancel reason, the system prompts the user to choose which reason to use.

---

## Related User Stories

- **[[CRST-979]]** - Cancel Request - Retain Cancel Request Reason Handling

**Epic:** LISP-245 Cancel Request - Request Retrieval

---

## Key Concepts

### Retain Cancel Reason for Next Request Checkbox
A checkbox on the Cancel Request screen. When checked, it instructs the system to keep the current cancel reason text on screen after the request data is cleared. The checkbox itself becomes disabled (locked as checked) after clearing so the retained state is visible and cannot be accidentally toggled.

### Retained Cancel Reason
The cancel reason text that remains in the **Cancel/Reject Reason** panel after the screen is cleared with the checkbox checked. It is available for use on the next retrieved request.

---

## Trigger Point

This handling is applied at two points:
1. **During clear** — immediately after a request action (Clear, Cancel Request, Update Reason, or Authorize Reason) clears the screen.
2. **During retrieval** — when a new cancelled request is loaded while a retained reason is already present on screen (checkbox checked).

---

## Workflow Scenarios

### Scenario 1: Retaining the Cancel Reason After Clear

#### Prerequisites
- A cancelled lab request with a cancel reason has been retrieved and its reason is displayed in the **Cancel/Reject Reason** panel.
- The user has checked the **Retain Cancel Reason for Next Request** checkbox.

#### Process Flow

```mermaid
sequenceDiagram
    participant User
    participant Cancel Request Screen

    User->>Cancel Request Screen: Check "Retain Cancel Reason for Next Request"
    User->>Cancel Request Screen: Click Clear / Cancel Request / Update Reason / Authorize Reason
    Cancel Request Screen->>Cancel Request Screen: Clear all request data fields
    Note over Cancel Request Screen: Cancel/Reject Reason text is NOT cleared<br/>because checkbox is checked
    Cancel Request Screen->>Cancel Request Screen: Checkbox remains checked and becomes disabled
    Cancel Request Screen->>User: Screen cleared; cancel reason retained; checkbox locked
```

#### Step-by-Step Details

1. The user retrieves a cancelled lab request. The cancel reason is loaded into the **Cancel/Reject Reason** panel and the **Cancel Reason** checkbox is checked (see [[Retrieve Cancel Request Reason]]).
2. The user checks the **Retain Cancel Reason for Next Request** checkbox.
3. The user clicks one of the following: **Clear**, **Cancel Request**, **Update Reason**, or **Authorize Reason**.
4. The screen clears all request data (patient details, test grid, request number, etc.).
5. Because the **Retain Cancel Reason for Next Request** checkbox is checked, the **Cancel/Reject Reason** panel text is **not** cleared — it is preserved.
6. The **Retain Cancel Reason for Next Request** checkbox remains checked and is set to disabled, so it cannot be unchecked until a new request is retrieved.

> **Note:** The **Cancel/Reject Reason** panel and the **Retain Cancel Reason for Next Request** checkbox are explicitly excluded from the standard clear process. The checkbox's checked state at clear-time determines whether the reason text is wiped or kept.

---

### Scenario 2: Retrieving a Cancelled Request While a Retained Reason Is Present

#### Prerequisites
- The **Retain Cancel Reason for Next Request** checkbox is checked and disabled.
- A cancel reason text is retained in the **Cancel/Reject Reason** panel from the previous request.
- The user enters a new request number that belongs to a cancelled request with its own existing cancel reason.

#### Process Flow

```mermaid
sequenceDiagram
    participant User
    participant Cancel Request Screen
    participant System

    User->>Cancel Request Screen: Enter new request number
    Cancel Request Screen->>System: Retrieve lab request data
    System-->>Cancel Request Screen: Cancelled request + existing cancel reason returned
    Cancel Request Screen->>Cancel Request Screen: Detect: checkbox checked AND retrieved reason is non-blank
    Cancel Request Screen->>User: Prompt message 658:<br/>"Cancel Comment already existed! Do you want to use the Retained Cancel Reason to overwrite it?"<br/>(focus on Yes button)
    alt User clicks Yes
        Cancel Request Screen->>Cancel Request Screen: Retained reason remains in Cancel/Reject Reason panel
        Cancel Request Screen->>User: Screen ready; retained reason used for this request
    else User clicks No
        Cancel Request Screen->>Cancel Request Screen: Replace Cancel/Reject Reason with the retrieved request's own cancel reason
        Cancel Request Screen->>User: Screen ready; current request's cancel reason displayed
    end
```

#### Step-by-Step Details

1. The user enters a request number for a cancelled request while the **Retain Cancel Reason for Next Request** checkbox is already checked and a retained reason is present.
2. The system retrieves the request data. The retrieved request has a non-blank cancel reason of its own.
3. Because the checkbox is checked, the system detects a conflict between the retained reason and the newly retrieved reason.
4. Message **658** — *"Cancel Comment already existed! Do you want to use the Retained Cancel Reason to overwrite it?"* — is displayed. Focus is placed on the **Yes** button.
5. **If the user clicks Yes:**
   - The retained cancel reason remains in the **Cancel/Reject Reason** panel unchanged.
   - The request will use the retained reason for any subsequent cancel or update action.
6. **If the user clicks No:**
   - The **Cancel/Reject Reason** panel is updated with the current cancelled request's own cancel reason.
   - The retained reason is replaced.

---

### Scenario 3: Retrieving a Non-Cancelled Request While a Retained Reason Is Present

#### Prerequisites
- The **Retain Cancel Reason for Next Request** checkbox is checked and disabled.
- A cancel reason text is retained in the **Cancel/Reject Reason** panel.
- The user retrieves a request that has **not** been cancelled (no existing cancel reason).

#### Step-by-Step Details

1. The system retrieves the request. There is no existing cancel reason (cancel comment test is null or text is blank).
2. Because the retrieved request has no cancel reason, there is no conflict. Message **658** is not shown.
3. The retained cancel reason remains in the **Cancel/Reject Reason** panel.
4. The screen transitions to the ready state normally.

---

## Summary Tables

### Clear Behaviour by Checkbox State

| Retain Cancel Reason checkbox checked? | Cancel/Reject Reason cleared on Clear/Action? | Checkbox state after clear |
|---|---|---|
| No | Yes — text is wiped | Enabled (remains unchecked) |
| Yes | No — text is retained | Remains checked; becomes disabled |

### Message 658 Trigger Conditions

| Retain checkbox checked? | Retrieved request has existing cancel reason? | Message 658 shown? |
|---|---|---|
| No | Yes | No — retrieved reason loaded normally |
| No | No | No |
| Yes | No | No — retained reason kept silently |
| Yes | Yes (non-blank) | Yes |

### Message 658 Response Actions

| User Selects | Outcome |
|---|---|
| Yes | Retained cancel reason stays in panel; used for this request's cancel/update action |
| No | Current cancelled request's own cancel reason replaces the retained reason in panel |

---

## Business Rules

1. The **Cancel/Reject Reason** panel and the **Retain Cancel Reason for Next Request** checkbox are both excluded from the standard screen clear process.
2. When the checkbox is unchecked at clear-time, the **Cancel/Reject Reason** panel text is wiped.
3. When the checkbox is checked at clear-time, the **Cancel/Reject Reason** panel text is preserved and the checkbox becomes disabled (locked as checked).
4. Message **658** is only triggered when the checkbox is checked **and** the newly retrieved request has a non-blank existing cancel reason.
5. Clicking **Yes** on message **658** keeps the retained reason; clicking **No** replaces it with the retrieved request's own reason.
6. The retain behaviour applies consistently across all four actions that clear the screen: **Clear**, **Cancel Request**, **Update Reason**, and **Authorize Reason**.

---

## Related Workflows

- [[Retrieve Cancel Request Reason]] — The cancel reason retrieval step is where the conflict detection (and message 658) occurs when a retained reason is already present.
- [[Retrieve Request]] — The overall request retrieval flow within which this handling is applied.
- [[Object Enablement After Retrieval]] — The checkbox enabled/disabled state is part of the screen's enablement logic at STATE_READY and STATE_INITIAL.
- [[Clear Button]] — The clear process that preserves or wipes the cancel reason depending on checkbox state.
