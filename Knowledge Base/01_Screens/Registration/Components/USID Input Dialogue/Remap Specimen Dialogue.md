# Remap Specimen Dialogue

## Overview

The Remap Specimen Dialogue allows Registration staff to reassign which specimens are mapped to which test profiles within the same request. It is a sub-dialogue opened from the [[USID Input Dialogue]], available when the Remap Specimen button is enabled. The dialogue presents each test profile as a row in a data grid, with a combined dropdown and checkbox control listing all available specimens. Staff can check or uncheck specimens per test profile to redefine the mapping. When confirmed, the updated mappings are applied back to the Input Specimen Dialogue.

---

## Related User Stories

- **[[CRST-623]]** - Registration - USID Input Dialogue: Remap Specimen

**Epic:** LISP-29 [CRST][DEV] Registration - Screen Object Interaction

---

## Trigger

Opened when the **Remap Specimen** button is clicked (or **Ctrl+R** is pressed) in the [[USID Input Dialogue]]. The Remap Specimen button must be enabled (see [[USID Input Dialogue]] for enablement conditions).

---

## Initialisation

When the dialogue opens:

1. Each test profile code from the current specimen-test relations is displayed as one row in the **Test Specimen** data grid.
2. Each row shows the test profile code in the **Test** column and a combined dropdown/checkbox control in the **Specimen No.** column.
3. The dropdown/checkbox control lists all specimens currently in the Input Specimen Dialogue.
4. The checkbox for each specimen is **pre-checked** if a mapping already exists between that specimen and the test profile for that row.
5. The first selected specimen is shown as the dropdown's selected value:
   - If only one specimen is mapped: the selected value shows that specimen's identifier.
   - If more than one specimen is mapped: the selected value shows the first specimen's identifier followed by "…" (e.g., `ABC123...`).
6. The first row in the grid is selected by default.

---

## Visual Layout

A modal dialogue containing:
- A **Test Specimen** data grid with two columns:
  - **Test** — the test profile code (read-only)
  - **Specimen No.** — a combined dropdown list with checkboxes for each specimen
- Two buttons: **OK** and **Cancel**

---

## Buttons and Actions

### OK

| Property | Detail |
|----------|--------|
| **Label** | OK |
| **When enabled** | Always enabled |
| **What it does** | Validates that every specimen is mapped to at least one test profile. If valid, applies the updated mappings to the Input Specimen Dialogue and closes. If invalid, message **4041** is shown and the dialogue remains open. |

### Cancel

| Property | Detail |
|----------|--------|
| **Label** | Cancel |
| **When enabled** | Always enabled |
| **What it does** | Closes the dialogue and discards all changes made to the specimen-test mappings. The Input Specimen Dialogue is unchanged. |

---

## Test Specimen Data Grid Interaction

#### User presses Space Bar with a row selected

The Specimen No. dropdown for the highlighted row is opened.

#### User opens the Specimen No. dropdown and checks a specimen

The selected specimen is added to the mapping for that test profile. If more than one specimen is now mapped, the dropdown's display value updates to show the first specimen's identifier followed by "…".

#### User opens the Specimen No. dropdown and unchecks a specimen

The specimen is removed from the mapping for that test profile. If only one specimen remains checked, the dropdown's display value shows that specimen's identifier without "…". If the unchecked specimen was shown first in the dropdown display, the next remaining specimen takes its place.

---

## OK Button Validation

When **OK** is clicked:

| Condition | Message | Behaviour |
|---|---|---|
| At least one specimen has no mapping to any test profile | 4041 | Dialogue remains open |
| All specimens are mapped to at least one test profile | — | Mappings are applied; dialogue closes |

---

## Error Messages

| Message | Trigger | User Options |
|---------|---------|-------------|
| 4041 | A specimen in the current relations is not checked against any test profile | Dismiss; dialogue remains open |

---

## Related Workflows

- [[USID Input Dialogue]] — The Remap Specimen Dialogue is opened from the Input Specimen Dialogue and its results are returned there on confirmation.
