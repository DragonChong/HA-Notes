---
epic: LISP-252
status: draft
---
# Not Supported Lab Message

## Overview

When a user attempts to retrieve a request on the CRS application's Wipeout Request screen, the system checks whether the resolved lab code of the entered request belongs to a list of labs that are not supported in the CRS application. If the request belongs to a restricted lab, retrieval is blocked and message **4134** is displayed, directing the user to proceed in the appropriate application instead. The request number is cleared from the **Req. No.** field after the user dismisses the message, and focus returns to that field.

This check applies to the CRS application only and does not apply to the General Laboratory Wipeout Request screen.

> **Shared logic:** This behaviour is identical to Cancel Request. See [[Cancel Request/Workflows/Request Retrieval/Not Supported Lab Message|Not Supported Lab Message (Cancel Request)]] for the full specification, including the configuration details for `SCREEN_NOTSUPPORTLABS`.

---

## Related User Stories

- **[[CRST-985]]** - Wipeout Request - Not Supported Lab Message
- Full logic reference: **[[CRST-930]]** (Cancel Request - Not Supported Lab Message)

**Epic:** LISP-252 [CRST][DEV] Wipeout Request — Request Retrieval

---

## Trigger Point

Triggered after the user enters a request number and the system resolves its lab. Before loading any request data, the system checks whether the resolved lab is in the not-supported list. If it is, the message is shown and retrieval is abandoned.

---

## Message Reference

| Message Code | Text | Trigger | User Options |
|-------------|------|---------|-------------|
| 4134 | "[LAB] request is not supported in CRS. Please proceed in [LAB] application." | Resolved lab is in the `SCREEN_NOTSUPPORTLABS` restricted list | OK (dismiss) |

---

## Configuration

| Setting | Option Code | Purpose | Effect when configured | Effect when not configured |
|---------|-------------|---------|----------------------|----------------------------|
| Not Supported Labs | `SCREEN_NOTSUPPORTLABS` *(option_group = `REQUEST_REGISTRATION`)* | Defines which lab code numbers are blocked from retrieval in the CRS application | Requests with matching lab code numbers are blocked; message 4134 displayed | No lab restriction applied |

---

## Business Rules

1. This check applies only to the **CRS application** variant of the Wipeout Request screen.
2. The not-supported lab restriction is configured per hospital.
3. The not-supported check fires after lab resolution — in a multi-lab scenario, it fires against whichever lab the user selected via [[Laboratory Selection]].
4. After the user dismisses message 4134, the **Req. No.** field is cleared and focus returns to it.

---

## Related Workflows

- [[Retrieve Request]] — This message is an error path within the request retrieval workflow.
- [[Laboratory Selection]] — The not-supported check fires after the user selects a lab.
- [[Request Not Found Message]] — A separate error path triggered when the request number does not exist.
