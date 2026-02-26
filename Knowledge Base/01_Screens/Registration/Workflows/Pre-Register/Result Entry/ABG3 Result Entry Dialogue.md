# ABG3 Result Entry Dialogue

## Overview

The ABG3 (Blood Gas) Result Entry Dialogue is a modal input dialogue that appears during the Registration save sequence when the requested tests include an ABG3 specimen. It prompts registration staff to enter three blood gas values: **FIO2**, **Flow Rate**, and **Mask Type**. Unlike the [[ABG Result Entry Dialogue]], FIO2 and Flow Rate are entered via enum-numeric selector controls (not plain text inputs), enforcing both numeric range and enumerated option validation. The Mask Type is selected from a drop-down driven by the **MASK** keyword group. Accepted results are stored as pending records awaiting post-registration processing.

---

## Related User Stories

- **[[CRST-558]]** — Registration - Pre-register: Result Entry (ABG3)

**Epic:** LISP-27 [CRST][DEV] Registration - Register Workflow

---

## Visual Layout

The dialogue is a modal window (approximately 236 × 254 pixels). It contains:

- A single titled border box with three result entry controls stacked vertically:
  1. A label showing the **FIO2** test full name, followed by an enum-numeric selector and the unit "%"
  2. A label showing the **Flow Rate** test full name, followed by an enum-numeric selector and the unit "L/min"
  3. A label showing the **Mask Type** test full name, followed by a drop-down selector for the mask type
- A **Done** button on the left and a **Cancel** button on the right below the border box

There is no GCR information panel in this dialogue.

On opening, focus is automatically placed on the **FIO2** selector.

---

## Buttons and Actions

### Done

| Property | Detail |
|---|---|
| **Label** | Done |
| **When visible** | Always |
| **What it does** | Validates **Mask Type** first. If invalid, shows message 1555 and keeps dialogue open. If Mask Type is valid, validates **FIO2** and **Flow Rate** enum-numeric fields. If any numeric field is invalid, an alert is shown in the Log Monitor and the dialogue remains open. If all fields are valid, constructs result records for each field that has a value and closes the dialogue successfully. |

### Cancel

| Property | Detail |
|---|---|
| **Label** | Cancel |
| **When visible** | Always |
| **What it does** | Closes the dialogue without saving any results. The overall save sequence is treated as failed and message 3386 is shown to the user. |

---

## Input Fields

| Field | Input Type | Unit | Validation |
|---|---|---|---|
| FIO2 | Enum-numeric selector | % | Must be numeric in range 0–9,999,999, or a valid enumerated option. Invalid input triggers a Log Monitor alert and prevents submission. |
| Flow Rate | Enum-numeric selector | L/min | Same validation as FIO2. Flow Rate is **optional** — an empty value is accepted and produces no result record. |
| Mask Type | Drop-down (keyword list) | — | Must be a valid item from the **MASK** keyword group. Invalid value triggers message 1555 and prevents submission. |

> **Key difference from [[ABG Result Entry Dialogue]]:** FIO2 and Flow Rate use enum-numeric selectors with enforced range validation (0 to 9,999,999), not free-text inputs. An invalid enum-numeric value blocks submission rather than being silently ignored.

---

## Mask Type Drop-Down

The **Mask Type** drop-down is populated from the keyword group **MASK**, scoped to the test's lab number. If the user enters or selects an unrecognised value, a "Invalid Mask Type item." alert is shown in the Log Monitor, and message 1555 is displayed on submission.

---

## Setup Validation on Dialogue Open

Before the input fields are shown, the system validates the blood gas test code configuration. ABG3 uses the same `BG` option code as ABG, but requires only the **first 3 test codes**:

| Condition | Message | Behaviour |
|---|---|---|
| `option_text` for `BG` is null (no test codes defined) | 1556 — "There are no Blood Gas setting for this hospital." | Dialogue closes immediately; save sequence is cancelled |
| `option_text` contains fewer than 3 test codes | 1557 — "There are insufficient Blood Gas setting." | Dialogue closes immediately; save sequence is cancelled |
| Any of the 3 test dictionaries cannot be loaded | *(no message)* | Dialogue closes immediately; save sequence is cancelled |
| All 3 test dictionaries loaded successfully | *(none)* | Input fields are displayed with test full names as labels |

> **Note:** ABG3 requires at least 3 codes; ABG requires exactly 4. Both read from the same `BG` `option_text` field.

---

## Field Title Derivation

The label for each input field is the **full name** of the corresponding test dictionary entry, looked up using the test code from `option_text` and the current lab number:

| Field | Test Code Position in `option_text` |
|---|---|
| FIO2 | 1st code |
| Flow Rate | 2nd code |
| Mask Type | 3rd code |

---

## Result Construction

When **Done** is clicked and all validation passes:

- A result record is constructed for each field that has a non-empty value, using:
  - The **Request No.** of the current registration
  - The entered or selected value for that field
  - The **authorize flag** from the `BG` lab option
- Up to three records (one per field) are written to `TRANS_TESTRSLT_WKT` to await post-registration processing
- An empty **Flow Rate** produces no result record — it is the only optional field

---

## Configuration

| Setting | Option Code | Purpose | Effect when enabled | Effect when disabled |
|---|---|---|---|---|
| Authorize Result | `BG` (`option_value`) | Controls whether blood gas result records are marked as authorised on creation | Result records created with the authorise flag set | Result records created without the authorise flag (default: not authorised) |
| Blood Gas Test Codes | `BG` (`option_text`) | Defines the test codes (comma-delimited) used to look up test dictionaries and construct result records. ABG3 uses the first 3 codes. | 3+ codes loaded; input field titles populated from test full names | Null → message 1556; fewer than 3 → message 1557; dialogue cannot open |

**Source:** `LAB_OPTION` table — `option_group = 'REQUEST_REGISTRATION'`, `option_code = 'BG'`

---

## Error Messages and System Prompts

| Message | Text | Trigger | User Options |
|---|---|---|---|
| 1555 | "\[@PARM1\] is invalid !!" | User submits an unrecognised value in the **Mask Type** drop-down | Dismiss; focus returns to FIO2 |
| 1556 | "There are no Blood Gas setting for this hospital." | `option_text` for `BG` is null when dialogue opens | Dismiss; dialogue closes; save cancelled |
| 1557 | "There are insufficient Blood Gas setting." | `option_text` for `BG` contains fewer than 3 test codes | Dismiss; dialogue closes; save cancelled |
| 3386 | *(Registration cancelled message)* | User clicks **Cancel** | Dismiss |
| Log Monitor alert | "Invalid enum option \<value\>" | FIO2 or Flow Rate value is out of range or not a valid enumerated option | Alert shown in Log Monitor; submission blocked |
| Log Monitor alert | "Invalid Mask Type item." | Mask Type value is not in the MASK keyword list | Alert shown in Log Monitor; message 1555 also shown on submission |

---

## Business Rules

1. The ABG3 Result Entry Dialogue is shown only when the request includes a test requiring an ABG3 specimen, as determined by the `REG_SPEC` keyword setup. See [[Result Entry on Save]] for the triggering logic.
2. ABG3 uses the same `BG` lab option as [[ABG Result Entry Dialogue]] but reads only the **first 3** comma-delimited test codes from `option_text` (FIO2, Flow Rate, Mask Type). The 4th code used by ABG is not needed.
3. FIO2 and Flow Rate are validated as enum-numeric values within the range 0 to 9,999,999. An out-of-range or non-numeric value blocks submission and is reported in the Log Monitor.
4. **Flow Rate is optional.** An empty Flow Rate value is accepted and no result record is created for it.
5. **FIO2 is not marked optional by the US** — its enum-numeric field has no default, but an empty value is also omitted silently (no error message). The dialogue can close successfully even if FIO2 is left blank.
6. Mask Type must be a valid item from the **MASK** keyword group. An invalid Mask Type triggers message 1555 and prevents the dialogue from closing.
7. If the user cancels the dialogue, the entire Registration save sequence is aborted and message 3386 is shown.
8. The field title for each input is the full name of the corresponding test dictionary entry, resolved per the current lab number.

---

## Related Workflows

- [[Result Entry on Save]] — Parent workflow that triggers this dialogue as part of the Registration save sequence.
- [[ABG Result Entry Dialogue]] — The ABG variant, which uses 4 test codes from the same `BG` option and plain text inputs for numeric fields.
