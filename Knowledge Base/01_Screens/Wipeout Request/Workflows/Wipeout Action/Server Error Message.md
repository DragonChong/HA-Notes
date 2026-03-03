---
epic: LISP-255
status: draft
---
# Server Error Message

## Overview

When the backend throws an exception during the wipeout request process, the system displays message 3385 as a prompt to the operator. This is distinct from a server-side business failure — see [[Failure Message]] for the non-success response case. The screen data is retained so the operator can review the situation.

> **Shared logic:** This behaviour is identical to [[Server Error Message]] in Cancel Request (CRST-943). The same message code, prompt style, and screen retention behaviour applies.

---

## Related User Stories

- **[[CRST-998]]** — Wipeout Request — Server Error Message

**Epic:** LISP-255 [CRST][DEV] Wipeout Action

---

## Trigger Point

Triggered when any backend server call during the wipeout pipeline throws an exception. This covers the main wipeout action server call and the gather-information-for-validation server call.

---

## Behaviour

1. The backend throws an exception during processing of the server call.
2. Message 3385 is displayed as a blocking prompt to the operator.
3. The operator dismisses the prompt by clicking **OK**.
4. Screen data is retained. No automatic clear occurs.

---

## Messages

| Message | Text | Trigger | Display | User Options |
|---------|------|---------|---------|-------------|
| 3385 | *(server error notice)* | Backend exception thrown during any server call | Blocking prompt | OK (dismiss) |

---

## Business Rules

1. Message 3385 applies to all server call exceptions within the wipeout pipeline — it is not specific to any single step.
2. The error prompt is blocking — the operator must dismiss it before taking further action.
3. Screen data is retained after a server error — no automatic clear occurs.
4. A server error is distinct from a business failure: a failure returns a non-success state from a completed server call; a server error is an exception that prevents the call from completing normally.

---

## Related Workflows

- [[Wipeout Request (Action)]] — The primary pipeline step whose server call may throw an exception.
- [[Failure Message]] — The distinct message (674) shown when the server call completes but returns a non-success state.
