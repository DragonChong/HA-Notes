---
epic: LISP-249
status: draft
---
# Blood Inventory Validation (BBNK)

## Overview

When a Blood Bank (BBNK) request is cancelled, the system performs a blood inventory validation before proceeding with the cancellation. This validation checks whether any blood units associated with the request are in an issued, transfused, reserved, allocated, or analyser-ordered state. Depending on the finding, the system either blocks the cancellation with an error message or prompts the user with a warning that requires confirmation and a user right to proceed.

---

## Related User Stories

- **[[CRST-947]]** - Cancel Request - BBNK: Blood Inventory Validation

**Epic:** LISP-249 [CRST][DEV] Cancel Request — Special Lab Workflow (BBNK)

---

## When the Validation Runs

The blood inventory validation is a server-side check triggered during the Cancel Request action pipeline, between the initial confirmation and the test-level validation step. The server queries the blood inventory tables for the request and returns flags indicating which blood unit states, if any, are present.

The validation runs as step 2 of the cancel action pipeline:

1. Confirm to Proceed
2. **Gather Server Information for Validation** ← blood inventory flags returned here
3. Validate (test-level access right checks)
4. User Validation
5. Ask for Confirmation
6. Cancel Request (server action)
7. Blood Released Message
8. Clear

---

## Validation Rules

| Blood Unit State | Database Condition | Outcome |
|---|---|---|
| Issued or transfused | Blood unit record has status Issued or Transfused | **Error** — message 2375 is displayed; cancellation is blocked regardless of user rights |
| Reserved or allocated | Blood unit record has status Reserved or Allocated | **Warning** (msg 2376) if user holds the **Release Blood** right; **Error** (msg 2377) if user does not hold the right |
| Analyser ordered | Blood unit record has status Analyser Order | **Warning** (msg 4354) if user holds the **Release Blood** right; **Error** (msg 4355) if user does not hold the right |
| No blood units in any of the above states | — | Validation passes; cancellation pipeline continues |

> The issued/transfused check always results in an error and the cancellation is always aborted — there is no override path regardless of user rights.

---

## Validation Decision Matrix

| Blood Unit State | User has Release Blood Right | Message Shown | Outcome |
|---|---|---|---|
| Issued or transfused | N/A | 2375 (error) | Cancellation aborted |
| Reserved or allocated | Yes | 2376 (warning — Yes/No) | User confirms → continue; User declines → aborted |
| Reserved or allocated | No | 2377 (error) | Cancellation aborted |
| Analyser ordered | Yes | 4354 (warning — Yes/No) | User confirms → continue; User declines → aborted |
| Analyser ordered | No | 4355 (error) | Cancellation aborted |
| None | N/A | *(no message)* | Pipeline continues |

---

## Messages

| Message Code | Type | Description | User Options |
|---|---|---|---|
| 2375 | Error | Blood unit has already been issued or transfused; cancellation blocked | OK (dismiss) |
| 2376 | Warning | Blood unit is reserved or allocated; user may proceed if authorised | Yes (continue) / No (abort) |
| 2377 | Error | Blood unit is reserved or allocated; user lacks right to proceed | OK (dismiss) |
| 4354 | Warning | Blood unit has an analyser order; user may proceed if authorised | Yes (continue) / No (abort) |
| 4355 | Error | Blood unit has an analyser order; user lacks right to proceed | OK (dismiss) |

---

## Required Access Right

| Right | Purpose |
|---|---|
| `cbx_release_blood` (on window `w_lis_bbnk_cancel_request`) | Allows the user to proceed with cancelling a request that has reserved, allocated, or analyser-ordered blood units. Without this right, warnings become hard errors. |

---

## Business Rules

1. Blood inventory validation applies only to BBNK requests.
2. The check is performed server-side at the time the Cancel Request button is clicked, after the initial confirmation prompt.
3. Issued or transfused blood units unconditionally block cancellation — no user right can override this.
4. Reserved, allocated, or analyser-ordered blood units require the **Release Blood** access right to proceed; without it, cancellation is blocked.
5. When the user holds the Release Blood right and the warning prompt is shown, declining (clicking No) aborts the cancellation pipeline.
6. If the request has no blood units in any of the above states, the validation passes silently and the pipeline continues.

---

## Related Workflows

- [[Cancel Request (Action)]] — The full 8-step pipeline within which blood inventory validation runs as step 2.
- [[User Access Right Checking]] — The access-right check that determines whether warnings or errors are shown for reserved/allocated/analyser-ordered blood units.
- [[Blood Released Message]] — The confirmation message shown after successful cancellation when blood units have been released.
- [[Validation]] — The general test-level validation that runs after blood inventory validation in the pipeline.
