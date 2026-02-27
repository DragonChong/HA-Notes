# Report Copy Input Dialogue

## Overview

The Report Copy Input Dialogue is a modal popup that allows Registration staff to enter up to ten copy report destination locations for a request. It is opened from the Registration screen by clicking the button next to the **Copy Report Location** field. When the dialogue is confirmed, the entered locations are saved and the first entered location is displayed on the Registration screen in the Copy Report Location field.

---

## Related User Stories

- **[[CRST-513]]** - Registration - Report Copy Input Dialogue

**Epic:** LISP-29 [CRST][DEV] Registration - Screen Object Interaction

---

## Trigger

The dialogue opens when the popup button next to the **Copy Report Location** field on the Registration screen is clicked.

---

## Initialisation

When the dialogue opens:

1. Ten location input rows are prepared, each containing a **Hospital**, **Specialty** (read-only / disabled), and **Location** sub-field.
2. Any copy report locations already entered in the current request are pre-loaded into the corresponding rows, in the order they were previously entered.
3. Remaining rows (beyond the number of previously entered locations) are left blank.
4. Focus is placed on the **Hospital** field of the first row.

---

## Visual Layout

A modal dialogue containing:
- Ten location input rows, each row consisting of a **Hospital** field and a **Location** field (Specialty is present but disabled).
- An **OK** button to confirm the entered locations.
- A **Cancel** button (standard dialogue close behaviour) to discard changes.

---

## Buttons and Actions

### OK

| Property | Detail |
|----------|--------|
| **Label** | OK |
| **What it does** | Saves all non-blank, valid location entries from the dialogue rows back to the request. The dialogue closes and the Registration screen's **Copy Report Location** field is updated to display the first entered location. |

### Cancel

| Property | Detail |
|----------|--------|
| **Label** | Cancel |
| **What it does** | Closes the dialogue without saving any changes. The Copy Report Location field on the Registration screen is unchanged. |

---

## Interaction Behaviour

#### User clicks the Copy Report Location popup button

The dialogue opens pre-filled with any locations previously entered. If no locations have been entered yet, all ten rows are blank.

#### User enters locations and clicks OK

The system reads through all ten rows in order and collects every non-blank row that has a valid location identifier. These are saved as the request's copy report locations in entry order. The dialogue closes and the **Copy Report Location** field on the Registration screen shows the first saved location. Any rows that were blank or had an invalid/zero location identifier are ignored.

#### All rows are left blank and the user clicks OK

The Copy Report Location field on the Registration screen is cleared.

#### User clicks the popup button again after locations have already been entered

The dialogue opens with the previously entered locations pre-populated in the rows, allowing the user to review or amend them.

---

## Data Handling Rules

1. Up to ten copy report locations may be entered per request.
2. Only rows with a non-blank entry and a valid (non-zero) location identifier are retained when the dialogue is confirmed.
3. Blank rows between valid entries are skipped — only valid rows are counted.
4. When the Registration screen is cleared (e.g., the Clear button is used), all copy report locations are reset and the Copy Report Location field is cleared.
5. The **Specialty** sub-field within each row is always disabled — location lookup is by Hospital and Location only.

---

## Related Workflows

- [[Copy Patient Location to Request Location]] — The request location (including the primary Copy Report Location field) may be auto-populated from the patient location; the Copy Report Input Dialogue manages the extended list of up to ten destinations.
