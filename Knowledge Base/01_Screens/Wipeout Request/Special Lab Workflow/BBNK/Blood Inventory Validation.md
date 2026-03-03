---
epic: LISP-256
status: draft
---
# Blood Inventory Validation (BBNK)

## Overview

When a Blood Bank (BBNK) request is wiped out, the system performs a blood inventory validation before proceeding with the wipeout. This validation checks whether any blood units associated with the request are in an issued, transfused, reserved, allocated, or analyser-ordered state. Depending on the finding, the system either blocks the wipeout with an error message or prompts the user with a warning that requires confirmation and a user right to proceed.

> **Shared logic:** The blood inventory validation logic is identical to Cancel Request. See [[Cancel Request/Special Lab Workflow/BBNK/Blood Inventory Validation|Blood Inventory Validation (Cancel Request)]] for the full specification, including the full decision matrix and all message codes. Key difference: the access right checked is the **Wipeout Request** worksheet right (`w_lis_bbnk_wipeout_request`) rather than the Cancel Request worksheet right.

---

## Related User Stories

- **[[CRST-1000]]** - Wipeout Request - BBNK: Blood Inventory Validation
- Full logic reference: **[[CRST-947]]** (Cancel Request - BBNK: Blood Inventory Validation)

**Epic:** LISP-256 [CRST][DEV] Wipeout Request — Special Lab Workflow (BBNK)

---

## When the Validation Runs

The blood inventory validation is a server-side check triggered during the Wipeout Request action pipeline, between the initial confirmation and the test-level validation step.

The validation runs as step 2 of the wipeout action pipeline:

1. Confirm to Proceed
2. **Gather Server Information for Validation** ← blood inventory flags returned here
3. Validate (test-level access right checks)
4. User Validation
5. Ask for Confirmation
6. Wipeout Request (server action)
7. Result Message
8. Clear

---

## Validation Rules

| Blood Unit State | Database Condition | Outcome |
|---|---|---|
| Issued or transfused | Blood unit record has status Issued or Transfused | **Error** — message 2375 is displayed; wipeout is blocked regardless of user rights |
| Reserved or allocated | Blood unit record has status Reserved or Allocated | **Warning** (msg 2376) if user holds the **Release Blood** right; **Error** (msg 2377) if user does not hold the right |
| Analyser ordered | Blood unit record has status Analyser Order | **Warning** (msg 4354) if user holds the **Release Blood** right; **Error** (msg 4355) if user does not hold the right |
| No blood units in any of the above states | — | Validation passes; wipeout pipeline continues |

> The issued/transfused check always results in an error and the wipeout is always aborted — there is no override path regardless of user rights.

---

## Validation Decision Matrix

| Blood Unit State | User has Release Blood Right | Message Shown | Outcome |
|---|---|---|---|
| Issued or transfused | N/A | 2375 (error) | Wipeout aborted |
| Reserved or allocated | Yes | 2376 (warning — Yes/No) | User confirms → continue; User declines → aborted |
| Reserved or allocated | No | 2377 (error) | Wipeout aborted |
| Analyser ordered | Yes | 4354 (warning — Yes/No) | User confirms → continue; User declines → aborted |
| Analyser ordered | No | 4355 (error) | Wipeout aborted |
| None | N/A | *(no message)* | Pipeline continues |

---

## Messages

| Message Code | Type | Description | User Options |
|---|---|---|---|
| 2375 | Error | Blood unit has already been issued or transfused; wipeout blocked | OK (dismiss) |
| 2376 | Warning | Blood unit is reserved or allocated; user may proceed if authorised | Yes (continue) / No (abort) |
| 2377 | Error | Blood unit is reserved or allocated; user lacks right to proceed | OK (dismiss) |
| 4354 | Warning | Blood unit has an analyser order; user may proceed if authorised | Yes (continue) / No (abort) |
| 4355 | Error | Blood unit has an analyser order; user lacks right to proceed | OK (dismiss) |

---

## Required Access Right

| Right | Worksheet | Purpose |
|---|---|---|
| `cbx_release_blood` | `w_lis_bbnk_wipeout_request` | Allows the user to proceed with wiping out a request that has reserved, allocated, or analyser-ordered blood units. Without this right, warnings become hard errors. |

---

## Business Rules

1. Blood inventory validation applies only to BBNK requests.
2. The check is performed server-side at the time the Wipeout Request button is clicked, after the initial confirmation prompt.
3. Issued or transfused blood units unconditionally block the wipeout — no user right can override this.
4. Reserved, allocated, or analyser-ordered blood units require the **Release Blood** access right to proceed; without it, the wipeout is blocked.
5. When the user holds the Release Blood right and the warning prompt is shown, declining (clicking No) aborts the wipeout pipeline.
6. If the request has no blood units in any of the above states, the validation passes silently and the pipeline continues.

---

## Related Workflows

- [[Confirmation Message]] — Step 1 of the wipeout pipeline; runs before blood inventory validation.
- [[Validation]] — The general test-level validation that runs after blood inventory validation in the pipeline.
