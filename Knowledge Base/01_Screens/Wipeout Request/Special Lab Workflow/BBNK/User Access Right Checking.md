---
epic: LISP-256
status: draft
---
# BBNK - User Access Right Checking

## Overview

When a BBNK request has blood units in a reserved, allocated, or analyser-ordered state, the system performs an access-right check before allowing the wipeout to proceed. Users who hold the **Release Blood** right are shown a warning and may choose to continue; users who do not hold the right are shown an error and the wipeout is blocked. This check is added to the standard validation pipeline as a BBNK-specific step, and follows the same logic as the equivalent check in Cancel Request.

> **Shared logic:** The access-right checking rules and messages are the same as [[User Access Right Checking]] in Cancel Request (CRST-950). The only difference is that the access right is checked against the Wipeout Request window (`w_lis_bbnk_wipeout_request`) rather than the Cancel Request window.

---

## Related User Stories

- **[[CRST-1002]]** — Wipeout Request — BBNK: User Access Right Checking

**Epic:** LISP-256 [CRST][DEV] Wipeout Request — Special Lab Workflow (BBNK)

---

## When the Check Runs

The access-right check runs as part of the validation step in the wipeout pipeline, as a BBNK lab-specific security check appended after base validation. It only applies when the blood inventory validation has already identified reserved, allocated, or analyser-ordered blood units.

---

## Access-Right Logic

| Blood Unit State | User has Release Blood Right | Message Shown | Outcome |
|---|---|---|---|
| Reserved or allocated | Yes | 2376 (warning — Yes/No) | User clicks Yes → pipeline continues; User clicks No → aborted |
| Reserved or allocated | No | 2377 (error) | Wipeout aborted |
| Analyser ordered | Yes | 4354 (warning — Yes/No) | User clicks Yes → pipeline continues; User clicks No → aborted |
| Analyser ordered | No | 4355 (error) | Wipeout aborted |
| Issued or transfused | N/A | *(handled at blood inventory validation — msg 2375)* | Wipeout already aborted before this step |
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
| `cbx_release_blood` | `w_lis_bbnk_wipeout_request` | Grants the user the ability to wipe out a BBNK request that has reserved, allocated, or analyser-ordered blood units. Without this right, such wipeouts are blocked. |

---

## Business Rules

1. The access-right check applies only to BBNK requests.
2. The check is appended to the end of the standard validation step; it runs after all other validation checks have passed.
3. Issued or transfused blood units are handled at the blood inventory validation step (msg 2375) and never reach this check.
4. For reserved, allocated, or analyser-ordered blood units:
   - With the Release Blood right: a warning prompt is shown. The user must actively confirm (Yes) to proceed. Declining (No) aborts the pipeline.
   - Without the Release Blood right: an error is shown and the pipeline is always aborted.
5. If no blood units are in a restricted state, the check completes silently and the pipeline continues.

---

## Related Workflows

- [[Blood Inventory Validation]] — The server-side check that determines whether any blood units are in a restricted state.
- [[BBNK - Wipeout Message]] — The message monitor confirmation shown after successful wipeout when blood was released.
- [[Validation]] — The standard validation pipeline step that this BBNK-specific check extends.
- [[Wipeout Request (Action)]] — The full wipeout pipeline.
