---
epic: LISP-245
status: draft
---
# Request Not Found Message

## Overview

When a user enters a request number on the Cancel Request screen that does not exist in the database, the system displays a **Request Not Found** message. The message includes the entered request number so the user can confirm which number was not found. After the user dismisses the message, the screen clears automatically and the user may try again.

---

## Related User Stories

- **[[CRST-926]]** - Cancel Request - Request Not Found Message

**Epic:** LISP-245 [CRST][DEV] Cancel Request - Request Retrieval

---

## Trigger Point

This message is shown immediately after the server returns a response confirming that no request record exists for the entered request number (i.e. `REQUEST.req_reqno` has no matching row). It occurs as part of the request retrieval flow described in [[Retrieve Request]].

---

## Workflow

### Process Flow

```mermaid
sequenceDiagram
    participant User
    participant Cancel Request Screen
    participant System

    User->>Cancel Request Screen: Enter request number and leave field
    Cancel Request Screen->>System: Retrieve lab request data
    System-->>Cancel Request Screen: No request record found
    Cancel Request Screen->>User: Message 164 — "Request not found : [Request No.]"
    User->>Cancel Request Screen: Dismiss message (OK)
    Cancel Request Screen->>Cancel Request Screen: Clear screen
    Cancel Request Screen->>User: Screen returned to initial state; Request No. field cleared
```

### Step-by-Step Details

1. The user enters a request number and moves focus away from the **Request No.** field.
2. The system validates the request number format and, if valid, attempts to retrieve the request from the database.
3. The server returns a response indicating that no matching request record exists.
4. Message **164** — *"Request not found : [Request No.]"* — is displayed, with the entered request number substituted into the message text.
5. The user dismisses the message.
6. The screen clears: all fields are reset to their initial state and the **Request No.** field is cleared.

---

## Error Messages

| Message | Text | Trigger | User Options |
|---------|------|---------|-------------|
| 164 | "Request not found : [Request No.]" | The entered request number does not exist in `REQUEST.req_reqno` | OK (dismiss) |

---

## Business Rules

1. The entered request number is included in the message text so the user can confirm which number was not found.
2. Dismissing the message unconditionally clears the screen — the user cannot resume from a partially filled screen.

---

## Related Workflows

- [[Retrieve Request]] — This message is one of the outcomes of the request retrieval flow when the request record is absent.
- [[Laboratory Selection]] — Lab selection occurs before the retrieval attempt; this message is only shown after a lab has been determined and the request lookup has been made.
