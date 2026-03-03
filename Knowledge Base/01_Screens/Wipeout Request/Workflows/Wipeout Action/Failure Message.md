---
epic: LISP-255
status: draft
---
# Failure Message

## Overview

When the backend processes the wipeout request and returns a failure state (a non-success response, not an exception), the system displays message 674 in the message monitor. The screen data is retained so the operator can review the situation.

> **Shared logic:** This behaviour is identical to [[Failure Message]] in Cancel Request (CRST-942). The same message code and screen retention behaviour applies.

---

## Related User Stories

- **[[CRST-997]]** — Wipeout Request — Failure Message

**Epic:** LISP-255 [CRST][DEV] Wipeout Action

---

## Trigger Point

Triggered when the server call for the wipeout action returns a failure state. This is distinct from a server exception — see [[Server Error Message]] for the exception case.

---

## Behaviour

1. The backend processes the wipeout request but returns a failure (non-success) state.
2. Message 674 — *"Record update failed!"* — is displayed in the message monitor.
3. No data is cleared. The screen remains in its current state, allowing the operator to review the request and attempt the action again if appropriate.

---

## Messages

| Message | Text | Trigger | Display Location | User Options |
|---------|------|---------|-----------------|-------------|
| 674 | "Record update failed!" | Server returns failure (non-success) state | Message monitor | OK (dismiss) |

---

## Business Rules

1. Message 674 is shown in the message monitor, not as a blocking prompt — the operator is notified but the screen remains usable.
2. Screen data is retained after a failure — no automatic clear occurs.

---

## Related Workflows

- [[Wipeout Request (Action)]] — The primary wipeout pipeline step that may trigger this message on failure.
- [[Server Error Message]] — The distinct message (3385) shown when the backend throws an exception rather than returning a failure state.
