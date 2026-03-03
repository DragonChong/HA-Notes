---
epic: LISP-261
status: draft
---
# Default Screen Behavior

## Overview

When the Add/Delete Test screen (Test Maintenance) opens, it enters its initial state with most controls disabled until a request is retrieved. The layout includes a **Request No.** text input, an **Input Specimen No.** button (for HA hospitals), a **Submit** button, a **Clear** button, an **Exit** button, a read-only **Patient Demographics** panel, a **Pay Code** field, and a **Test Grid** with a fixed column sequence. For HA hospitals, there is also a **Discharged** text indicator visible for BTH (private hospital) patients only.

---

## Related User Stories

- **[[CRST-1016]]** — Add Delete Test — Default Screen Behavior

**Epic:** LISP-261 [CRST][DEV] Add/Delete Test — Layout

---

## Screen Object States on Opening

| Screen Object | Initial State |
|---|---|
| **Request No.** text input | Enabled, visible and editable |
| **Input Specimen No.** button | Disabled and visible |
| **Submit** button | Disabled and visible |
| **Clear** button | Disabled and visible |
| **Exit** button | Always enabled and visible |
| Patient Demographics panel | Enabled and read-only |
| **Pay Code** field | Visible and read-only |
| **Discharged** text indicator | Read-only *(BTH private hospital only)* |
| Test Panel | Disabled and visible |
| Test Grid | Visible — column headers prepared on load |

---

## Test Grid Columns

The Test Grid column headers are prepared when the screen loads, in the following fixed sequence:

| # | Column | Notes |
|---|--------|-------|
| 1 | DEL | Deletion indicator; default is unchecked (blank) |
| 2 | Specimen | Specimen or USID related to the test |
| 3 | Test Profile | Profile name of the test group |
| 4 | Group | Test group alpha code |
| 5 | Test Code | Test alpha code |
| 6 | Test Name | Test full name |
| 7 | Ctr | Visible for Special Lab only — loaded upon request retrieval |
| 8 | Sub-ctr | Visible for Special Lab only — loaded upon request retrieval |
| 9 | Status Date | Test status date; background colour follows test status |
| 10 | Optional | Displays "Y" if the test is optional |

> The **Ctr** and **Sub-ctr** columns are prepared in the header but only become visible (and populated) when a Special Lab request is retrieved.

---

## Business Rules

1. The **Request No.** field is the only editable control when the screen first opens.
2. The **Exit** button is always enabled regardless of screen state.
3. The **Input Specimen No.** button, **Submit** button, **Clear** button, and **Test Panel** remain disabled until a request is successfully retrieved.
4. The **Discharged** text indicator is only applicable for BTH (private hospital) patients; it is read-only at all times.
5. The Test Grid column headers are fixed and prepared in the sequence above on every screen load; the **Ctr** and **Sub-ctr** columns are hidden by default and are revealed only for Special Lab requests.
6. The Patient Demographics panel is always read-only — no patient fields can be edited on this screen.

---

## Related Workflows

- [[Retrieve Request]] — Retrieves the request and transitions the screen to the ready state.
- [[Object Enablement After Retrieval]] — Describes which controls become enabled after a request is retrieved.
