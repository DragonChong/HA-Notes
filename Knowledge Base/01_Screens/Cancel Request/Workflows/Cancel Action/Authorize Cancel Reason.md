---
epic: LISP-247
status: draft
---
# Authorize Cancel Reason

## Overview

The **Authorize Reason** button allows a suitably privileged operator to save and simultaneously authorise the cancel comment test on a previously cancelled request. The action triggers a User Validation Dialogue to confirm the authorising user's identity before committing the change. On success, message 660 is displayed and the cancel comment test is placed into completed (authorised) status. This feature is only available when the lab option `AMEND_CANCEL_COMMENT` is enabled.

---

## Related User Stories

- **[[CRST-944]]** — Cancel Request — Authorize Cancel Reason

**Epic:** LISP-247 [CRST][DEV] Cancel Request - Cancel Action

---

## Key Concepts

### Authorize Cancel Reason
The act of both saving the updated cancel reason text **and** authorising the cancel comment test in a single operation. After authorisation, the cancel comment test moves to completed (authorised) status.

### Cancel Comment Test
The specific test within the request that holds the cancel reason text. Its presence and key are derived from the Cancel Comment dictionary for the current lab.

---

## Trigger Point

Initiated when the operator clicks the **Authorize Reason** button. The button is only visible and enabled when specific prerequisites are met (see below).

---

## Button Prerequisites

| Condition | Requirement |
|---|---|
| Request state | Request must be in the Ready (retrieved) state |
| Cancel Comment Test | A cancel comment test must exist in the request |
| Access right | Operator must hold the `cbx_authorize_comment` right for the current worksheet |
| Lab option | `AMEND_CANCEL_COMMENT` must be enabled (`option_value = 1`) in the `LAB_OPTION` table (`option_group = 'CANCEL'`) |

> The **Authorize Reason** button is hidden entirely when `AMEND_CANCEL_COMMENT` is disabled. When enabled, the button's visibility is further governed by the lab option and the operator's access rights.

---

## Workflow Scenarios

### Scenario 1: Authorisation Succeeds

#### Prerequisites
- The request has been retrieved and a cancel reason is displayed.
- The **Authorize Reason** button is visible and enabled.

#### Process Flow

```mermaid
sequenceDiagram
    participant Operator
    participant Cancel Screen
    participant User Validation Dialogue
    participant Server

    Operator->>Cancel Screen: Click Authorize Reason
    Cancel Screen->>User Validation Dialogue: Display User Validation Dialogue
    Operator->>User Validation Dialogue: Enter valid credentials; click OK
    User Validation Dialogue->>Cancel Screen: Authorisation passed
    Cancel Screen->>Server: Send update with isAuthorize = true
    Server-->>Cancel Screen: Success response
    Cancel Screen->>Operator: Message 660 — update/authorise success (OK)
    Operator->>Operator: Click OK
    Cancel Screen->>Cancel Screen: Clear all screen objects; focus → Request No.
```

#### Step-by-Step Details

1. The operator clicks **Authorize Reason**.
2. The User Validation Dialogue is displayed, prompting for a username and password.
3. The operator enters valid credentials and clicks **OK**.
4. The system verifies the credentials. If valid, the pipeline continues.
5. The system packages and sends the update to the server with the authorisation flag set to `true`.
6. On success, message 660 is displayed.
7. The operator clicks **OK** on message 660.
8. All screen objects are cleared and focus moves to the **Request No.** field.
9. The cancel comment test is now in completed (authorised) status.

---

### Scenario 2: User Validation Fails or Is Cancelled

#### Process Flow

```mermaid
sequenceDiagram
    participant Operator
    participant Cancel Screen
    participant User Validation Dialogue

    Operator->>Cancel Screen: Click Authorize Reason
    Cancel Screen->>User Validation Dialogue: Display User Validation Dialogue
    Operator->>User Validation Dialogue: Click Cancel (or enter invalid credentials)
    User Validation Dialogue->>Operator: Message 675 — "Access Denied." (OK)
    User Validation Dialogue->>Cancel Screen: Abort; retain screen data
```

#### Step-by-Step Details

1. The operator clicks **Authorize Reason**.
2. The User Validation Dialogue is displayed.
3. The operator clicks **Cancel** (or fails authentication).
4. Message 675 — *"Access Denied."* — is displayed.
5. The authorisation is aborted. Screen data is retained.

---

### Scenario 3: Server Call Fails

#### Step-by-Step Details

1. User validation passes and the server call is made.
2. The server returns a failure state or throws an exception.
3. Message 674 — *"Record update failed!"* — is displayed in the message monitor.
4. Screen data is retained.

---

## Configuration

| Setting | Option Group | Option Code | Effect when enabled | Effect when disabled |
|---------|-------------|------------|--------------------|--------------------|
| Amend Cancel Comment | `CANCEL` | `AMEND_CANCEL_COMMENT` | **Authorize Reason** and **Update Reason** buttons are visible | Both buttons are hidden; cancel reason cannot be amended after cancellation |

---

## Messages

| Message | Text | Trigger | User Options |
|---------|------|---------|-------------|
| 660 | *(update/authorise success notice)* | Authorisation and save succeed | OK (triggers screen clear) |
| 675 | "Access Denied." | Operator cancels User Validation Dialogue | OK (dismiss) |
| 674 | "Record update failed!" | Server returns failure | OK (dismiss) |

---

## Business Rules

1. The **Authorize Reason** button requires both the `cbx_authorize_comment` access right **and** the `AMEND_CANCEL_COMMENT` lab option to be enabled; either condition alone is insufficient.
2. Clicking **OK** on message 660 triggers the screen clear — the screen is not cleared before the operator acknowledges the success message.
3. Authorisation sets the cancel comment test to completed (authorised) status; this is distinct from the outstanding status left by the Update Reason action.
4. The User Validation Dialogue is always shown for the Authorize Reason action, regardless of the worksheet popup configuration — authorisation requires explicit identity confirmation.

---

## Related Workflows

- [[Update Reason]] — The non-authorising variant of this action; saves the cancel reason without authorising it.
- [[User Validation]] — Describes the User Validation Dialogue used during this action.
- [[Object Enablement After Retrieval]] — Documents when the Authorize Reason button is enabled vs. disabled.
- [[Failure Message]] — Message 674 shown on server failure.
