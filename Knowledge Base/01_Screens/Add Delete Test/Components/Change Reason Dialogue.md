# Change Reason Dialogue

## Overview

The Change Reason Dialogue is a modal prompt that appears during the Submit process on the Add Delete Test screen when the lab is configured to require a reason for the change. It allows the user to select a predefined reason category from a drop-down list and optionally enter a free-text explanation. For certain reason categories, the text input is mandatory. The dialogue may be cancelled to return to the screen without submitting. If confirmed, the change reason is attached to the submission audit trail.

---

## Related User Stories

- **[[CRST-1038]]** - Add Delete Test - Change Reason Dialogue

**Epic:** LISP-266 [CRST][DEV] Add/Delete Test - Submit Action

---

## Component Modes

| Mode | When It Applies | Distinguishing Feature |
|---|---|---|
| Prompted | Lab is configured with `POPUP_CHANGE_REASON` enabled | Dialogue appears after other pre-submit validations pass |
| Not prompted | Lab option is disabled or absent | Dialogue does not appear; submission proceeds without a reason |

---

## Visual Layout

The Change Reason Dialogue is a small modal panel. It contains:
- A **Reason of Change** drop-down list with three fixed options
- An **Input Reason** free-text field for additional detail
- An **OK** button and a **Cancel** button

---

## Reason of Change Options

The **Reason of Change** drop-down always contains exactly three items, in this order:

1. Typo mistake at registration *(default selection)*
2. Information clarified
3. Other

---

## Buttons and Actions

### OK

**When visible/enabled:** Always enabled.

**What it does:**
1. If **"Information clarified"** or **"Other"** is selected and the Input Reason field is blank, message **2654** is displayed and the dialogue remains open. The user must enter a reason before proceeding.
2. If the validation passes, the dialogue closes and the submit action proceeds with the change reason attached:
   - If Input Reason is **not blank**: the reason is recorded as `Reason: [Selected Reason] :[Input Reason]`
   - If Input Reason is **blank** (only valid for "Typo mistake at registration"): the reason is recorded as `Reason: [Selected Reason] `

---

### Cancel

**When visible/enabled:** Always enabled.

**What it does:** Closes the dialogue without submitting. The user is returned to the Add Delete Test screen with all previously entered data intact and no submission made.

---

## Error Messages and System Prompts

| Message | Description | Trigger | User Options |
|---|---|---|---|
| 2654 | Input Reason is required for this selection | OK clicked with "Information clarified" or "Other" selected and Input Reason field is blank | OK (dialogue stays open) |

---

## Configuration

| Setting | Option Code | Purpose | Effect when enabled | Effect when disabled |
|---|---|---|---|---|
| Popup Change Reason | `POPUP_CHANGE_REASON` | Controls whether the Change Reason Dialogue is shown during Submit | Change Reason Dialogue is prompted after pre-submit validations pass | Dialogue is not shown; submission proceeds without a reason |

> Source: `LAB_OPTION` table, `option_group = 'REQUEST_REGISTRATION'`, `option_code = 'POPUP_CHANGE_REASON'`, `option_value = 1` (enabled).

---

## Business Rules

1. The Change Reason Dialogue is only prompted when the `POPUP_CHANGE_REASON` lab option is enabled. If the option is disabled or absent, the dialogue is skipped entirely.
2. The default selection in the Reason of Change drop-down is always **"Typo mistake at registration"**.
3. A blank Input Reason is only permitted when **"Typo mistake at registration"** is selected. Selecting **"Information clarified"** or **"Other"** with a blank input reason triggers message 2654 and blocks submission.
4. Clicking **Cancel** discards the submission attempt entirely. No data is written.

---

## Related Workflows

- [[Add Delete Test (Action)]] — The Change Reason Dialogue is part of the overall submit action; it appears after other pre-submit validations pass.
- [[Add Test Validation]] — Pre-submit content validations that precede the Change Reason Dialogue prompt.
