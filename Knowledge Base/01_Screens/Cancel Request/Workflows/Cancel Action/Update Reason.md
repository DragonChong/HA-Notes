---
epic: LISP-247
status: draft
---
# Update Reason

## Overview

The **Update Reason** button allows a suitably privileged operator to save an updated cancel reason text against a previously cancelled request, without authorising it. On success, message 660 is displayed and the cancel comment test remains in outstanding (saved but not yet authorised) status. This feature is only available when the lab option `AMEND_CANCEL_COMMENT` is enabled.

---

## Related User Stories

- **[[CRST-945]]** — Cancel Request — Update Reason

**Epic:** LISP-247 [CRST][DEV] Cancel Action

---

## Key Concepts

### Update Reason
The act of saving an updated cancel reason text without authorising the cancel comment test. After the update, the cancel comment test moves to outstanding status (saved but awaiting authorisation).

### Cancel Comment Test
The specific test within the request that holds the cancel reason text. Its presence and key are derived from the Cancel Comment dictionary for the current lab.

---

## Trigger Point

Initiated when the operator clicks the **Update Reason** button. The button is only visible and enabled when specific prerequisites are met (see below).

---

## Button Prerequisites

| Condition | Requirement |
|---|---|
| Request state | Request must be in the Ready (retrieved) state |
| Cancel Comment Test | A cancel comment test must exist in the request |
| Access right | Operator must hold the `cbx_update_comment` right **or** the `cbx_authorize_comment` right for the current worksheet |
| Lab option | `AMEND_CANCEL_COMMENT` must be enabled (`option_value = 1`) in the `LAB_OPTION` table (`option_group = 'CANCEL'`) |

> The **Update Reason** button is hidden entirely when `AMEND_CANCEL_COMMENT` is disabled. When enabled, an operator who holds `cbx_authorize_comment` also has access to the Update Reason action — holding the higher right implicitly grants the lower one.

---

## Workflow Scenarios

### Scenario 1: Update Succeeds

#### Prerequisites
- The request has been retrieved and a cancel reason is displayed.
- The **Update Reason** button is visible and enabled.

#### Process Flow

```mermaid
sequenceDiagram
    participant Operator
    participant Cancel Screen
    participant Server

    Operator->>Cancel Screen: Click Update Reason
    Cancel Screen->>Server: Send update with isAuthorize = false
    Server-->>Cancel Screen: Success response
    Cancel Screen->>Operator: Message 660 — update success (OK)
    Operator->>Operator: Click OK
    Cancel Screen->>Cancel Screen: Clear all screen objects; focus → Request No.
```

#### Step-by-Step Details

1. The operator clicks **Update Reason**.
2. No User Validation Dialogue is shown — unlike Authorize Reason, Update Reason does not require secondary authentication.
3. The system packages and sends the updated cancel reason to the server with the authorisation flag set to `false`.
4. On success, message 660 is displayed.
5. The operator clicks **OK** on message 660.
6. All screen objects are cleared and focus moves to the **Request No.** field.
7. The cancel comment test is now in outstanding (saved, not yet authorised) status.

---

### Scenario 2: Server Call Fails

#### Step-by-Step Details

1. The server call is made.
2. The server returns a failure state or throws an exception.
3. Message 674 — *"Record update failed!"* — is displayed in the message monitor.
4. Screen data is retained.

---

## Configuration

| Setting | Option Group | Option Code | Effect when enabled | Effect when disabled |
|---------|-------------|------------|--------------------|--------------------|
| Amend Cancel Comment | `CANCEL` | `AMEND_CANCEL_COMMENT` | **Update Reason** and **Authorize Reason** buttons are visible | Both buttons are hidden; cancel reason cannot be amended after cancellation |

---

## Messages

| Message | Text | Trigger | User Options |
|---------|------|---------|-------------|
| 660 | *(update success notice)* | Update saves successfully | OK (triggers screen clear) |
| 674 | "Record update failed!" | Server returns failure | OK (dismiss) |

---

## Business Rules

1. The **Update Reason** button requires either the `cbx_update_comment` or `cbx_authorize_comment` access right **and** the `AMEND_CANCEL_COMMENT` lab option to be enabled.
2. No User Validation Dialogue is shown for the Update Reason action — it proceeds directly to the server call.
3. Clicking **OK** on message 660 triggers the screen clear — the screen is not cleared before the operator acknowledges the success message.
4. After a successful update, the cancel comment test is in outstanding status (not yet authorised). To authorise it, the operator must use the **Authorize Reason** button on a subsequent retrieval (see [[Authorize Cancel Reason]]).

---

## Related Workflows

- [[Authorize Cancel Reason]] — The authorising variant of this action; saves and simultaneously authorises the cancel reason.
- [[Object Enablement After Retrieval]] — Documents when the Update Reason button is enabled vs. disabled.
- [[Failure Message]] — Message 674 shown on server failure.
