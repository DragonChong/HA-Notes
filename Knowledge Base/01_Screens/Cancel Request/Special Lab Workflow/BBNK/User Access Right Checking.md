---
epic: LISP-249
status: draft
---
# User Access Right Checking (BBNK)

## Overview

When a BBNK request has blood units in a reserved, allocated, or analyser-ordered state, the system performs an access-right check before allowing the cancellation to proceed. Users who hold the **Release Blood** right are shown a warning and may choose to continue; users who do not hold the right are shown an error and the cancellation is blocked. This check is added to the standard validation pipeline as a BBNK-specific step.

---

## Related User Stories

- **[[CRST-950]]** - Cancel Request - BBNK: User Access Right Checking

**Epic:** LISP-249 [CRST][DEV] Cancel Request — Special Lab Workflow (BBNK)

---

## When the Check Runs

The access-right check runs as part of the validation step (step 3) in the Cancel Request pipeline. The BBNK validation function extends the standard validation by appending a lab-specific security check step after the base validation:

1. Confirm to Proceed
2. Gather Server Information for Validation (blood inventory flags loaded)
3. **Validate → [standard checks] → Lab-Specific Security Check** ← access-right check here
4. User Validation
5. Ask for Confirmation
6. Cancel Request (server action)
7. Blood Released Message
8. Clear

The check only has an effect when the blood inventory validation (step 2) has identified reserved, allocated, or analyser-ordered blood units. If no such blood units are present, the check passes silently.

---

## Access-Right Logic

| Blood Unit State | User has Release Blood Right | Message Shown | Outcome |
|---|---|---|---|
| Reserved or allocated | Yes | 2376 (warning — Yes/No) | User clicks Yes → pipeline continues; User clicks No → cancelled |
| Reserved or allocated | No | 2377 (error) | Cancellation aborted |
| Analyser ordered | Yes | 4354 (warning — Yes/No) | User clicks Yes → pipeline continues; User clicks No → cancelled |
| Analyser ordered | No | 4355 (error) | Cancellation aborted |
| Issued or transfused | N/A | *(handled at blood inventory validation step — msg 2375)* | Cancellation already aborted before this step |
| None | N/A | *(no message)* | Check passes silently |

---

## Messages

| Message Code | Type | Description | User Options |
|---|---|---|---|
| 2376 | Warning | Blood unit is reserved or allocated; proceed with release? | Yes (release and continue) / No (abort) |
| 2377 | Error | Blood unit is reserved or allocated; user lacks right to release | OK (dismiss) |
| 4354 | Warning | Blood unit has an analyser order; proceed with release? | Yes (release and continue) / No (abort) |
| 4355 | Error | Blood unit has an analyser order; user lacks right to release | OK (dismiss) |

---

## Required Access Right

| Right | Window | Purpose |
|---|---|---|
| `cbx_release_blood` | `w_lis_bbnk_cancel_request` | Grants the user the ability to cancel a BBNK request that has reserved, allocated, or analyser-ordered blood units. Without this right, such cancellations are blocked. |

---

## Business Rules

1. The access-right check applies only to BBNK requests.
2. The check is appended to the end of the standard validation step; it runs after all other validation checks have passed.
3. Issued or transfused blood units are handled at the blood inventory validation step (msg 2375) and never reach the access-right check.
4. For reserved, allocated, or analyser-ordered blood units:
   - With the Release Blood right: a warning prompt is shown. The user must actively confirm (Yes) to proceed. Declining (No) aborts the pipeline.
   - Without the Release Blood right: an error is shown and the pipeline is always aborted.
5. If no blood units are in a restricted state, the access-right check completes silently and the pipeline continues.

---

## Related Workflows

- [[Blood Inventory Validation (BBNK)]] — The server-side check that determines whether any blood units are in a restricted state and loads the flags used by this access-right check.
- [[Blood Released Message (BBNK)]] — The confirmation message shown after successful cancellation when blood units have been released.
- [[Validation]] — The standard validation pipeline step that this BBNK-specific check extends.
- [[Cancel Request (Action)]] — The full cancellation pipeline.
