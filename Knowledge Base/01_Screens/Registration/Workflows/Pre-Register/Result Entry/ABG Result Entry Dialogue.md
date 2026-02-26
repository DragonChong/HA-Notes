# ABG Result Entry Dialogue

## Overview

The ABG (Arterial Blood Gas) Result Entry Dialogue is a modal input dialogue that appears during the Registration save sequence when the requested tests include an ABG specimen. It prompts registration staff to enter four blood gas measurement values: **Canula Flow (O2 Flow)**, **FIO2**, **Respiratory Rate (RR)**, and **Sample Type (ABGT)**. The dialogue is part of the Result Entry step described in [[Result Entry on Save]]. The four input field titles are derived from the test dictionary, making them configurable via the blood gas test code setup. Accepted results are stored as pending records awaiting post-registration processing.

---

## Related User Stories

- **[[CRST-557]]** — Registration - Pre-register: Result Entry (ABG)

**Epic:** LISP-27 [CRST][DEV] Registration - Register Workflow

---

## Visual Layout

The dialogue is a modal window (approximately 220 × 320 pixels, expanding to 540 × 320 when a GCR information panel is shown). It contains two main areas displayed side by side:

**Left area — input fields:**
- A titled border box containing four result entry controls stacked vertically:
  1. A label showing the **Canula Flow** test full name, followed by a numeric text input and the unit "L/min"
  2. A label showing the **FIO2** test full name, followed by a numeric text input and the unit "%"
  3. A label showing the **Respiratory Rate** test full name, followed by a numeric text input and the unit "/min"
  4. A label (in blue) showing the **Sample Type** test full name, followed by a drop-down selector for the sample type
- A **Done** button on the left and a **Cancel** button on the right below the border box

**Right area — GCR information panel (conditional):**
- Visible only when GCR test information is available for the current request
- Shows the test category as a title ("Information for \<Category\>") and a read-only text area with the test information

On opening, focus is automatically placed on the **Canula Flow** input field.

---

## Buttons and Actions

### Done

| Property | Detail |
|---|---|
| **Label** | Done |
| **Keyboard shortcut** | Default button (Enter key) |
| **When visible** | Always |
| **What it does** | Validates the **Sample Type** selection; constructs result records for each field that has a value; closes the dialogue successfully if Sample Type is valid (or empty). If Sample Type is invalid, shows message 1555 and keeps the dialogue open. |

### Cancel

| Property | Detail |
|---|---|
| **Label** | Cancel |
| **When visible** | Always |
| **What it does** | Closes the dialogue without saving any results. The overall save sequence is treated as failed and message 3386 is shown to the user. |

---

## Input Fields

| Field | Input Type | Unit | Behaviour when empty or invalid |
|---|---|---|---|
| Canula Flow (O2 Flow) | Numeric text input | L/min | Empty or non-numeric value — no result record created for this field (silent) |
| FIO2 | Numeric text input | % | Empty or non-numeric value — no result record created for this field (silent) |
| Respiratory Rate | Numeric text input | /min | Empty or non-numeric value — no result record created for this field (silent) |
| Sample Type (ABGT) | Drop-down (keyword list) | — | Invalid value — message 1555 shown; no result record created for this field |

> **Note:** For the three numeric fields (Canula Flow, FIO2, Respiratory Rate), invalid or empty input does not prevent the dialogue from closing — the result record for that field is simply omitted. Only an invalid **Sample Type** causes an error message and prevents submission.

---

## Sample Type Drop-Down

The **Sample Type** drop-down is populated from the keyword group **BG_TYPE**, scoped to the test's lab number. Valid selections are drawn from this keyword list. If the user types or selects a value not present in the list, message 1555 is shown.

---

## Setup Validation on Dialogue Open

Before the input fields are shown, the system validates the blood gas test code configuration:

| Condition | Message | Behaviour |
|---|---|---|
| `option_text` for the `BG` lab option is null (no test codes defined) | 1556 — "There are no Blood Gas setting for this hospital." | Dialogue closes immediately; save sequence is cancelled |
| `option_text` contains fewer than 4 test codes | 1557 — "There are insufficient Blood Gas setting." | Dialogue closes immediately; save sequence is cancelled |
| Any of the 4 test dictionaries cannot be loaded | *(no message)* | Dialogue closes immediately; save sequence is cancelled |
| All 4 test dictionaries loaded successfully | *(none)* | Input fields are displayed with test full names as labels |

---

## Field Title Derivation

The label for each of the four input fields is the **full name** of the corresponding test dictionary entry, looked up using the test code from `option_text` and the current lab number:

| Field | Test Code Position in `option_text` |
|---|---|
| Sample Type (ABGT) | 1st code |
| Canula Flow (O2 Flow) | 2nd code |
| FIO2 | 3rd code |
| Respiratory Rate (RR) | 4th code |

The four codes are stored as a comma-delimited list in `option_text` of the `BG` lab option.

---

## Pre-population from Prior Results

If the request already has existing blood gas result records (e.g., from a prior registration attempt), the fields are pre-populated:

- **Canula Flow, FIO2, Respiratory Rate:** pre-filled with the previously entered result text
- **Sample Type:** the previously selected keyword is re-selected in the drop-down

---

## Result Construction

When **Done** is clicked and validation passes:

- A result record is constructed for each field that has a non-empty value, using:
  - The **Request No.** of the current registration
  - The entered value for that field
  - The **authorize flag** from the `BG` lab option
- Up to four records (one per field) are written to `TRANS_TESTRSLT_WKT` to await post-registration processing
- Fields left empty produce no result record — partial submission is allowed

---

## Configuration

| Setting | Option Code | Purpose | Effect when enabled | Effect when disabled |
|---|---|---|---|---|
| Authorize Result | `BG` (`option_value`) | Controls whether blood gas result records are marked as authorised on creation | Result records created with the authorise flag set | Result records created without the authorise flag (default: not authorised) |
| Blood Gas Test Codes | `BG` (`option_text`) | Defines the four test codes (comma-delimited) used to look up test dictionaries and construct result records | 4 codes loaded; input field titles populated from test full names | Null → message 1556; fewer than 4 → message 1557; dialogue cannot open |

**Source:** `LAB_OPTION` table — `option_group = 'REQUEST_REGISTRATION'`, `option_code = 'BG'`

---

## Error Messages and System Prompts

| Message | Text | Trigger | User Options |
|---|---|---|---|
| 1555 | "\[@PARM1\] is invalid !!" | User submits an unrecognised value in the **Sample Type** drop-down | Dismiss; focus returns to Sample Type |
| 1556 | "There are no Blood Gas setting for this hospital." | `option_text` for `BG` is null when dialogue opens | Dismiss; dialogue closes; save cancelled |
| 1557 | "There are insufficient Blood Gas setting." | `option_text` for `BG` contains fewer than 4 test codes | Dismiss; dialogue closes; save cancelled |
| 3386 | *(Registration cancelled message)* | User clicks **Cancel** | Dismiss |

---

## Business Rules

1. The ABG Result Entry Dialogue is shown only when the request includes a test requiring an ABG specimen, as determined by the `REG_SPEC` keyword setup. See [[Result Entry on Save]] for the triggering logic.
2. The four blood gas test codes must be defined in `option_text` of the `BG` lab option as a comma-delimited list in the order: Sample Type, Canula Flow, FIO2, Respiratory Rate. Fewer than four codes prevents the dialogue from opening.
3. The input field labels are always the full names of the test dictionary entries, resolved per the current lab. If any of the four test dictionaries cannot be loaded, the dialogue closes and the save is cancelled.
4. Partial results are permitted — empty numeric fields are silently omitted and no result record is written for them. The user is not required to enter all four values.
5. An invalid **Sample Type** selection triggers message 1555 and prevents submission; the other three fields are unaffected by this validation.
6. If the user cancels the dialogue, the entire Registration save sequence is aborted and message 3386 is shown.
7. The **Sample Type** drop-down options are driven by the keyword group **BG_TYPE**, scoped to the lab number.
8. If the request already contains blood gas result records, those values are pre-loaded into the fields when the dialogue opens.

---

## Related Workflows

- [[Result Entry on Save]] — Parent workflow that triggers this dialogue as part of the Registration save sequence.
