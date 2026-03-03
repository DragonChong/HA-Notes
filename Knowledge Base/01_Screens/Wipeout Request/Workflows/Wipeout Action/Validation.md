---
epic: LISP-255
status: draft
---
# Validation

## Overview

Before the wipeout action is committed to the server, the system runs a security check against the request to determine whether the operator holds the access rights required to wipe out a request at the highest result status present. This corresponds to Phase 1 (security check) of the validation that runs in Cancel Request. Unlike Cancel Request, there is no Phase 2 cancel comment validation — the Wipeout Request screen has no cancel reason field and no cancel comment test key requirement. If the security check fails or is declined by the operator, the wipeout is aborted and the screen data is retained.

> **Shared logic (Phase 1 — security check):** The security check logic is identical to Cancel Request. See [[Cancel Request/Workflows/Cancel Action/Validation|Validation (Cancel Request)]] for the full specification of Phase 1, including all four request level scenarios and their messages. The Phase 2 (cancel comment) logic documented in the Cancel Request note does **not** apply to Wipeout Request.

---

## Related User Stories

- **[[CRST-993]]** - Wipeout Request - Validation
- Full Phase 1 logic reference: **[[CRST-938]]** (Cancel Request - Validation, excluding Cancel Comment)

**Epic:** LISP-255 [CRST][DEV] Wipeout Request — Wipeout Action

---

## Key Concepts

### Request Level
A classification assigned to the request during the security check, based on the highest result status found among its tests. The system assigns one of four levels, in priority order: Printed (level 4) → Authorized (level 3) → Entered/Saved (level 2) → No Result (level 1).

### Access Right
A per-operator permission stored in the user profile. Four distinct rights govern the wipeout, each tied to a result level. The right controls whether the operator may wipe out a request at that level.

---

## Trigger Point

Triggered as step 3 of the wipeout pipeline, immediately after the system has gathered server-side information (step 2). It runs only if the operator confirmed the "Are you sure?" prompt (step 1). See [[Confirmation Message]] for step 1 behaviour.

---

## Security Check — Phase 1

The security check is identical to Cancel Request Phase 1. The system classifies the request by its highest result level and checks whether the operator holds the corresponding access right.

### Access Rights — Security Check

| Access Right | Controls wipeout of | Confirmation Message | Blocked Message |
|---|---|---|---|
| Delete Reported Test | Requests with any Printed result | 662 | 663 |
| Delete Authorized Test | Requests with any Authorized result (no Printed) | 665 | 666 |
| Delete Resulted Test | Requests with any Entered/Saved result (no Printed or Authorized) | 668 | 669 |
| Delete Test | Requests with no results at all | *(none — silently proceeds)* | 671 |

### Request Level Classification

| Level | Classification | Status Values Detected |
|---|---|---|
| 4 | Printed | Printed; Amended-and-Printed |
| 3 | Authorized | Authorized; Amended-and-Awaiting-Signout; Amended-and-Authorized |
| 2 | Entered | Entered; Amended-and-Entered |
| 1 | No Result | No result-bearing status found |

> Tests with result type zero are excluded from all status classification checks.

---

## Message Reference

| Message | Text | Trigger | User Options | Post-Action |
|---|---|---|---|---|
| 662 | "Request contain reported test result, Continue?" | Has Delete Reported Test right; Printed results exist | Yes / No | Yes → proceed; No → abort |
| 665 | "Request contain authorized test result, Continue?" | Has Delete Authorized Test right; Authorized results exist | Yes / No | Yes → proceed; No → abort |
| 668 | "Request contain entered test result, Continue?" | Has Delete Resulted Test right; Entered results exist | Yes / No | Yes → proceed; No → abort |
| 663 | "Request contain reported test result, operation not allowed!" | Lacks Delete Reported Test right; Printed results exist | OK | Abort; data retained |
| 666 | "Request contain authorized test result, operation not allowed!" | Lacks Delete Authorized Test right; Authorized results exist | OK | Abort; data retained |
| 669 | "Request contain entered test result, operation not allowed!" | Lacks Delete Resulted Test right; Entered results exist | OK | Abort; data retained |
| 671 | "No such privilege, operation failed!" | Lacks Delete Test right; no results exist | OK | Abort; data retained |

---

## Phase 2 — Wipeout-Specific Validation

Unlike Cancel Request, there is no cancel reason or cancel comment test check in this phase. After the security check passes, the system proceeds directly to step 4 (User Validation) without any additional wipeout-specific input validation.

---

## Business Rules

1. Status classification is based on the **highest** result level found — if any test is Printed, the entire request is treated as a level-4 request.
2. Tests with result type zero are excluded from all status classification checks.
3. The no-result case (level 1) is the only scenario in which a passing rights check does not display a confirmation prompt — the system proceeds silently.
4. There is no cancel reason or cancel comment validation in Wipeout Request — Phase 2 of Cancel Request validation does not apply here.

---

## Related Workflows

- [[Confirmation Message]] — Step 1 of the wipeout pipeline; the "Are you sure?" prompt that precedes validation.
- [[User Validation]] — Step 4 of the pipeline; runs after validation passes.
