# Patient Selection Dialogue

## Overview

The **Patient Selection Dialogue** is a modal dialogue displayed during the Registration workflow when a patient's identity card number is entered and one or more matching records are found in the system. It presents a sortable list of the patient's existing hospital episodes and allows the user to select one, generate a new encounter number, or switch to the external patient index. If the user cannot find an appropriate episode, cancelling the dialogue triggers the new patient creation path.

---

## Related User Stories

- **[[CRST-492]]** - Registration - Patient Selection Dialogue
- **[[CRST-93]]** - Registration - Retrieve PMI Patient by HKID
- **[[CRST-94]]** - Registration - New Case Number for Existing Patient by HKID

**Epic:** LISP-23 [CRST][DEV] Registration - Patient Handling

---

## Component Modes

The dialogue operates in one of three modes depending on the patient data source and system configuration. The title and the label of the bottom-right button change to reflect the current mode.

| Mode | When It Applies | Distinguishing Feature |
|------|-----------------|------------------------|
| Local patient list | Patient has records in the local system; external patient index is available | Bottom-right button labelled **"PMI List"** |
| External patient list | External patient index records have been loaded after the user requested them | Title suffixed with **(PMI List)**; bottom-right button labelled **"Cancel"** |
| PMI unavailable | External patient index is disabled in system configuration | Bottom-right button always labelled **"Cancel"**; no switching to external list is possible |

---

## Visual Layout

The dialogue is a modal window, roughly 800×500 pixels. The upper area is occupied by a sortable data grid displaying the patient's episodes. The lower area contains a row of buttons along the bottom edge. A standard window close button (✕) is available in the title bar.

Depending on configuration, a read-only text field may appear alongside the button row to display a system-generated encounter number before the user confirms it.

---

## Data Grid

The grid lists the patient's hospital episodes. Rows are sorted primarily by **Admission Date** (most recent first), then by **Encounter No**, then by **HKID**. Columns visible without horizontal scrolling are marked **Yes** below.

| Column | Data Displayed | Default Visible |
|--------|---------------|-----------------|
| HKID | Patient's identity card number. The column header label may vary by hospital configuration. | Yes |
| Encounter No | Hospital encounter number for the episode | Yes |
| Hosp | Hospital code | Yes |
| Unit | Clinical specialty or unit | Yes |
| Locn | Ward or location | Yes |
| Name | Patient's name | Yes |
| Sex | Patient's sex | Yes |
| Age | Patient's age at time of record | Yes |
| *(Age Unit)* | Unit of age measurement (e.g., years, months) | Yes |
| DOB | Date of birth | Yes |
| Admission Date | Date of admission; primary sort column | Yes |
| CCC Code | Clinical coding reference (CCC) | Yes |
| Exact DOB | Whether the date of birth is exact or estimated | No |
| Race | Patient's race | No |
| MRN | Medical record number | No |
| Confidential | Whether the record is marked confidential | No |
| Death | Whether the patient is recorded as deceased | No |
| Death Date | Date of death, if recorded | No |
| Discharge Date | Date of discharge from the episode | No |
| Bed | Assigned bed | No |
| Category | Patient category, drawn from the system's category reference list | No |
| Type | Encounter type | No |
| Address | Patient's address | No |

> Columns not visible by default can be revealed by scrolling horizontally.

---

## Buttons and Actions

All buttons are positioned along the bottom edge of the dialogue.

### Generate Computer Encounter

| Property | Detail |
|----------|--------|
| **Label** | Generate Computer Encounter |
| **Keyboard shortcut** | Ctrl+Shift+G |
| **When visible** | Always visible when the dialogue is open |

The system generates a new encounter number automatically.

- If the system is **not** configured for manual encounter entry, the dialogue closes immediately. The Registration screen is populated with the new encounter number and focus moves to the Request No. field. The **Enter New Episode** panel is not shown.
- If the system **is** configured for manual encounter entry, the generated number appears in the read-only text field alongside the **OK** button for the user to review before confirming.

### OK

| Property | Detail |
|----------|--------|
| **Label** | OK |
| **Keyboard shortcut** | Ctrl+Shift+K (implied by label accelerator) |
| **When visible** | Only when the system is configured to allow manual encounter entry **and** the Manual Input Encounter mode is not active (see Button Visibility Matrix) |

- If a row is selected in the grid, clicking **OK** confirms the selected episode. The dialogue closes and the Registration screen is populated with that episode's details.
- If no row is selected (i.e., the user has just generated a new encounter number), clicking **OK** creates a new episode for the existing patient using the generated number. The dialogue closes and the Registration screen is populated.

### Manual Input Encounter

| Property | Detail |
|----------|--------|
| **Label** | Manual Input Encounter |
| **Keyboard shortcut** | Ctrl+Shift+M |
| **When visible** | Only when the system is configured to allow manual encounter entry (see Button Visibility Matrix) |

The dialogue closes without triggering a close callback. The **Enter New Episode** panel opens with the HKID pre-filled and non-editable, and the Encounter No. field pre-filled but **editable** (up to 15 characters). The user can modify the encounter number, then click **Done** to populate the Registration screen.

### Cancel / PMI List

| Property | Detail |
|----------|--------|
| **Label** | **"PMI List"** when the local list is shown and the external patient index is available; **"Cancel"** otherwise |
| **Keyboard shortcut** | Ctrl+Shift+P (PMI List mode) / Ctrl+Shift+A (Cancel mode) |
| **When visible** | Always visible; label changes based on mode |

**When labelled "PMI List":** The dialogue reloads the grid with records from the external patient index. The title changes to include **(PMI List)** and the button label changes to **"Cancel"**.

**When labelled "Cancel":**
- If the local patient list was showing and the patient has records in the external patient index, the external records are retrieved automatically and the dialogue re-opens in external patient list mode.
- If the local patient list was showing and the patient is not found in the external patient index, a notice is added to the system log and the user is prompted whether to create a new encounter case (Message 687).
- If the external patient list was showing, the user is prompted whether to create a new encounter case (Message 687).

### Close (✕ / Window Close Button)

Behaves identically to clicking **Cancel** in all scenarios.

---

## Button Visibility Matrix

The visibility of the **OK** button, the encounter number text field, and the **Manual Input Encounter** button depends on two configuration states:

| Manual Encounter Entry Allowed | Manual Input Encounter Mode Active | Text field visible | OK visible | Manual Input Encounter visible |
|---|---|---|---|---|
| No | N/A | No | No | No |
| Yes | No | Yes | Yes | No |
| Yes | Yes | No | No | Yes |

> In a standard Registration setup, Manual Input Encounter mode is always active when manual encounter entry is allowed, so the text field and OK button are not visible in practice — only the **Manual Input Encounter** button appears.

---

## Selection and Interaction Behaviours

#### User double-clicks a row
The dialogue closes immediately. The selected episode is passed to the Registration screen, which is populated with the patient's demographic and episode details. Focus moves to the Request No. field.

#### User single-clicks a row, then clicks OK (when OK is visible)
The dialogue closes. The selected episode is passed to the Registration screen, which is populated accordingly. Focus moves to the Request No. field.

#### User clicks Generate Computer Encounter (manual entry not allowed)
The system generates a new encounter number. The dialogue closes immediately. The Registration screen is populated with the new encounter number. Focus moves to the Request No. field. The **Enter New Episode** panel is not shown.

#### User clicks Generate Computer Encounter (manual entry allowed)
The system generates a new encounter number, which appears in the text field. Any grid row selection is cleared. The user reviews the number and clicks **OK** to confirm, triggering the same outcome as clicking OK with no row selected.

#### User clicks Manual Input Encounter
The dialogue closes. The **Enter New Episode** panel opens with the HKID pre-filled (non-editable) and a system-generated encounter number pre-filled in the Encounter No. field (editable). The user may modify the encounter number and click **Done**. The Registration screen is populated and focus moves to the Request No. field.

#### User clicks "PMI List"
The grid reloads with records from the external patient index. The dialogue title changes to include **(PMI List)**. The button label changes to **"Cancel"**.

#### User clicks Cancel on the local patient list (PMI available)
The dialogue closes. The system automatically retrieves the patient's records from the external patient index and re-opens the dialogue in external patient list mode (title updated to include **(PMI List)**).

#### User clicks Cancel on the local patient list (patient not found in PMI)
The dialogue closes. A notice is recorded in the system log. The user is prompted: *"Create new Encounter case?"* (Message 687). Answering **Yes** proceeds to new patient creation. Answering **No** cancels the operation.

#### User clicks Cancel on the external patient list
The dialogue closes. The user is prompted: *"Create new Encounter case?"* (Message 687). Answering **Yes** proceeds to new patient creation. Answering **No** cancels the operation.

#### User clicks the window close button (✕)
Same result as clicking **Cancel** in all scenarios.

---

## Configuration

| Setting | Purpose | Effect when enabled | Effect when disabled |
|---------|---------|--------------------|--------------------|
| PMI Server | Controls whether the external patient index is accessible | **"PMI List"** button shown on local patient list; external lookup available | **"Cancel"** button shown; no switching to external patient list |
| Manual Generate Encounter | Controls whether staff can manually review or edit a generated encounter number | **Manual Input Encounter** button visible; user can edit the generated number before confirming | Button hidden; generated encounter number is applied directly without user review |

---

## Error Messages and System Prompts

| Message | Text | Trigger | User Options |
|---------|------|---------|--------------|
| 687 | "Create new Encounter case?" | User cancels or closes the dialogue on any panel variant when no episode is selected | Yes / No |
| 4274 | PMI service unavailable — the system cannot retrieve patient details for the entered identity card number at this time | PMI lookup fails or patient is not found in the external patient index after cancelling the local list | OK (dismiss; recorded in system log) |

---

## Related Workflows

- [[Retrieve Patient by HKID]] — This dialogue is displayed when an existing patient is found during HKID lookup, allowing selection of an existing episode or creation of a new one.
- [[Create New Patient by HKID]] — The cancellation path of this dialogue (Message 687 → Yes) feeds into the new patient creation workflow.
- [[Retrieve Patient by Encounter Number]] — Can also lead to this dialogue when multiple episodes are found for a patient.
