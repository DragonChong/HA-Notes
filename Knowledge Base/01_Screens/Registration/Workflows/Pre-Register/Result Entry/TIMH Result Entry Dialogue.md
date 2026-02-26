# TIMH Result Entry Dialogue

## Overview

The TIMH Result Entry Dialogue is a modal input dialogue that appears during the Registration save sequence when the requested tests include a TIMH specimen. It prompts the registration staff to enter the **Time (in hour)** value for the TIMH urine test before the request is finalised. The dialogue is part of the Result Entry step described in [[Result Entry on Save]] and presents a single numeric input field pre-populated with a configurable default value. The entered time value is stored as a pending test result record awaiting post-registration processing.

---

## Related User Stories

- **[[CRST-556]]** — Registration - Pre-register: Result Entry (TIMH)

**Epic:** LISP-27 [CRST][DEV] Registration - Register Workflow

---

## Visual Layout

The dialogue is a small modal window (approximately 240 × 130 pixels). It contains:

- A titled border box labelled **"Time In Hour"**, containing a short numeric text input field followed by the unit label **"Hrs"**.
- A button bar at the bottom with **Done** on the left and **Cancel** on the right.

There is no GCR information panel in this dialogue.

---

## Buttons and Actions

### Done

| Property | Detail |
|---|---|
| **Label** | Done |
| **When visible** | Always |
| **What it does** | Validates the **Time (in hour)** field. If valid, constructs the TIMH test result record and closes the dialogue successfully, allowing the save sequence to continue. If validation fails, an error message is shown and the dialogue remains open. |

### Cancel

| Property | Detail |
|---|---|
| **Label** | Cancel |
| **When visible** | Always |
| **What it does** | Closes the dialogue without saving the result. The overall save sequence is treated as failed and message 3386 is shown to the user. |

---

## Default Value Behaviour

When the dialogue opens, the **Time (in hour)** field is pre-populated as follows:

1. If a default value is configured in the `TIMH_TEST` lab option (`option_text`), that value is displayed.
2. If no default is configured, the hardcoded value **1440** is displayed.

Focus is automatically set to the **Time (in hour)** field and the existing value is selected, allowing the user to type immediately without manually clearing the field.

> The intended default when `option_text` is not configured is **1440** (minutes in 24 hours).

---

## Input Validation

The **Time (in hour)** field accepts numeric input only. Validation occurs when the user clicks **Done**:

| Condition | Message | Message Text | User Options |
|---|---|---|---|
| Field is empty | 1558 | "Time is Not Specified !!" | Dismiss; field retains focus |
| Field contains non-numeric input | 1559 | "Time must be an number !!" | Dismiss; field retains focus |
| Field contains a valid number | *(none)* | Result is saved and dialogue closes | — |

---

## Result Construction

When a valid time value is submitted, the system constructs a pending test result record for the **TIMH** test code using:

- The **Request No.** of the current registration
- The entered **Time (in hour)** value
- The **authorize flag** from the `TIMH_TEST` lab option

The record is written to `TRANS_TESTRSLT_WKT` to await post-registration processing.

---

## Configuration

| Setting | Option Code | Purpose | Effect when enabled | Effect when disabled |
|---|---|---|---|---|
| Authorize Result | `TIMH_TEST` (`option_value`) | Controls whether the TIMH result record is marked as authorised on creation | Result record is created with the authorise flag set | Result record is created without the authorise flag (default: not authorised) |
| Default Time Value | `TIMH_TEST` (`option_text`) | Sets the pre-populated value shown in the Time (in hour) field when the dialogue opens | The configured value is pre-filled | The hardcoded default of **1440** is pre-filled |

**Source:** `LAB_OPTION` table — `option_group = 'REQUEST_REGISTRATION'`, `option_code = 'TIMH_TEST'`

---

## Business Rules

1. The TIMH Result Entry Dialogue is shown only when the request includes a test requiring a TIMH specimen, as determined by the `REG_SPEC` keyword setup. See [[Result Entry on Save]] for the triggering logic.
2. The **Time (in hour)** value must be numeric; non-numeric and empty inputs are rejected with specific error messages before the dialogue can be closed successfully.
3. If the user cancels the dialogue, the entire Registration save sequence is aborted and message 3386 is shown.
4. The test dictionary lookup for the TIMH result record always uses the hardcoded test code **"TIMH"**, regardless of the test profile configuration.
5. The default time value is 1440 when `option_text` for the `TIMH_TEST` lab option is not configured.
6. If the request already has an existing TIMH result (e.g., from a prior attempt), that value is pre-loaded into the field in place of the configured default.

---

## Related Workflows

- [[Result Entry on Save]] — Parent workflow that triggers this dialogue as part of the Registration save sequence.
