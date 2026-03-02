---
epic: LISP-222
status: draft
---
# Report Copy Input Dialogue

## Overview

The **Report Copy Input Dialogue** (labelled "Report Copy to other location") allows registration staff to add or edit up to ten report copy destinations for an amended request. The dialogue is opened by clicking the **Report Copy to other location** button on the Amend Request screen. It pre-populates with any existing report copy locations already stored against the retrieved request, and allows staff to add, edit, or remove entries before confirming. Changes take effect on the request when the **Amend** button is subsequently clicked.

---

## Related User Stories

- **[[CRST-793]]** - Amend Request - Report Copy Input Dialogue
- **[[CRST-778]]** - Amend Request - Object Enablement After Retrieval *(the "Report Copy to other location" button that opens this dialogue)*
- **[[CRST-513]]** - Manual Registration - Report Copy to Other Location *(reference — same shared component)*
- **[[CRST-779]]** - Amend Request - Retrieve Request *(source of existing report copy location data)*

**Epic:** LISP-222 [CRST][DEV] Amend Request - Screen Object Interaction

---

## Visual Layout

A modal dialogue containing a grid with up to **10 rows**, each representing one report copy destination. Each row contains:

| Column | State |
|--------|-------|
| Report Copy — Hospital | Enabled and editable |
| Report Copy — Specialty | Disabled (not editable directly in this dialogue) |
| Report Copy — Ward / Clinic | Enabled and editable |

The dialogue has **OK** and **Cancel** buttons to confirm or discard changes.

A **Report Copy Location Selection** dialogue can be opened from within this dialogue using the keyboard shortcut **Ctrl+L**, allowing staff to look up and select a location by searching.

---

## Behaviour

### Opening the Dialogue

When the user clicks the **Report Copy to other location** button:
1. The dialogue opens.
2. If the retrieved request already has report copy locations stored, those locations are pre-populated in the dialogue rows in their existing order. The first stored location appears in the first row, the second in the second row, and so on.
3. Empty rows are available for adding new copy destinations up to the maximum of 10.

### Editing Locations

Staff can:
- Edit any existing copy location row by changing the Hospital or Ward/Clinic values.
- Add new copy locations in empty rows (up to the 10-row maximum).
- Remove an existing copy location by erasing its values from a row.

### Row Shift on Removal

If the first copy location row is cleared and other rows still contain data, the remaining locations shift up: the second location moves to the first position, the third to the second, and so on. The first location displayed on the **Request Information Panel** always reflects the entry in the first row of the dialogue.

### Confirming Changes

When the user clicks **OK**:
- The updated locations from the dialogue replace the in-screen copy location data.
- The first row's location is displayed in the **Report Copy Location** field on the Request Information Panel.
- The changes are held in memory and are not written to the database until the user clicks **Amend**.

### Cancelling

If the user clicks **Cancel** (or closes the dialogue without clicking OK), no changes are made to the report copy locations.

---

## Data Saved

Report copy location data is written to the database when the **Amend** button is clicked.

| Field Label | Table | Column | Notes |
|-------------|-------|--------|-------|
| Report Copy — Hospital | `REQUEST_COPY_HIST` | `reqcp_office_hosp` | One row per copy location |
| Report Copy — Office (resolved location key) | `REQUEST_COPY_HIST` | `reqcp_office` | Internal key from `OFFICE.office_ckey` for the selected location |

Existing `REQUEST_COPY_HIST` records for the request are replaced with the updated set on Amend.

---

## Keyboard Shortcuts

| Shortcut | Effect |
|----------|--------|
| **Ctrl+L** | Opens the Report Copy Location Selection dialogue to search for and select a location |

---

## Error Messages and System Prompts

This dialogue does not raise its own error messages. Validation is performed when the **Amend** button is clicked on the main screen.

---

## Related Components

- [[Buttons]] — The **Report Copy to other location** button that opens this dialogue; enablement rules described there.
- [[Request Info Panel]] — The **Report Copy Location** field on this panel reflects the first entry from the dialogue.

## Related Workflows

- [[Retrieve Request]] — Existing report copy locations are loaded from `REQUEST_COPY_HIST` during retrieval and pre-populate this dialogue.
