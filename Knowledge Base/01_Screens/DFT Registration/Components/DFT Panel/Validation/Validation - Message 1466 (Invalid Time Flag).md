# Validation – Message 1466: Invalid Time Flag (DFTC)

## Overview

When the user attempts to save a DFTC (Custom) DFT request, the system validates that every row with a Request No. also has a valid time flag entered. If a row has a Request No. but the time flag is missing or blank, message 1466 is displayed, identifying the specific request, and the save is blocked. This validation applies exclusively to the DFTC series because DFTC is the only series where the user manually enters time flag values.

---

## Related User Stories

- **[[CRST-753]]** - Registration - DFT Time Sequence Panel - Message 1466

**Epic:** LISP-23 [CRST][DEV] Registration - Patient Handling

---

## Trigger Point

Occurs when the user clicks **Save** on the DFT Registration screen, and the DFT test is of the DFTC (Custom) series. This validation runs after the anchor time flag check ([[Validation - Message 1515 (Missing Time Flag 0)]]) has passed.

---

## Message Text

> `Invalid time flag of Request ['Request no.']. Please verify before save.`

The placeholder `'Request no.'` is replaced with the actual request number of the offending row.

---

## Trigger Conditions

| Condition | Triggers Message 1466? |
|-----------|----------------------|
| DFTC row has a Request No. but Time Flag is blank or not entered | **Yes** |
| DFTC row has a Request No. and a valid Time Flag value | No |
| Row has no Request No. (empty row) | No (row is skipped) |
| DFTT or DFTS series | No (this validation does not apply to these series) |

---

## Behaviour When Triggered

1. The system scans all rows on the DFT Panel in order.
2. The first row found with a Request No. but a missing or blank time flag triggers the message.
3. Message 1466 is displayed, with the Request No. of the offending row shown in the message text.
4. The user clicks **OK** to dismiss the message.
5. Focus moves to the **Time Flag** field of the row that triggered the message.
6. The DFT Panel remains open and editable; no data is cleared.
7. The save is not performed.
8. Validation stops at the first failing row; subsequent rows are not checked until the user retries saving.

---

## Interaction Behaviours

#### User clicks Save — a DFTC row has a Request No. but no Time Flag
The system blocks the save and displays message 1466 with the Request No. of the affected row.

#### User clicks OK on message 1466
The message panel closes. The cursor moves to the Time Flag field of the row that caused the error. The user must enter a valid time flag for that row before attempting to save again.

---

## Business Rules

1. This validation only applies to the DFTC (Custom) series. For DFTT and DFTS, time flags are pre-set from the test attribute configuration and cannot be blank.
2. A row without a Request No. is considered empty and is not validated.
3. The validation processes rows in display order and stops at the first failing row. The user must fix and retry to discover subsequent errors.
4. The time flag field for a DFTC row accepts any integer value; the only requirement enforced by this message is that the field must not be blank on a row that has a Request No.

---

## Related Workflows

- [[DFT Panel Enablement - DFTC]] — Describes how DFTC rows are enabled and how the user enters time flags manually.
- [[Validation - Message 1515 (Missing Time Flag 0)]] — The preceding save-time validation that checks for the anchor time flag row; must pass before message 1466 is evaluated.
- [[Validation - Message 1467 (Invalid Datetime Order)]] — A related save-time validation for datetime sequence ordering, which applies to DFTT and DFTS (not DFTC).
