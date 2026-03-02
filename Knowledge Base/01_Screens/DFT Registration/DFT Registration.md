# DFT Registration

## Overview

The DFT Registration screen is a specialised request registration screen used to register Differential Function Test (DFT) requests for a patient. Unlike the standard Registration screen, DFT Registration incorporates a dedicated DFT Sequence Panel that allows staff to manage up to 14 time-sequenced collection entries for a single DFT test order. The screen enforces a strict progression: patient details must be entered first, then a valid DFT test code must be selected before the DFT Sequence Panel becomes interactive. The screen is accessible only when it has been configured in the system menu.

---

## Related User Stories

- **[[CRST-686]]** - DFT Registration - Panel Layout
- **[[CRST-767]]** - DFT Registration - General

**Epic:** LISP-210 [CRST][DEV] DFT Registration

---

## Screen Access

The DFT Registration screen appears in the **Request** menu only when it has been explicitly configured in the system menu setup. If no menu configuration exists for DFT Registration, the screen is not accessible to users and does not appear in the menu.

---

## Screen State Matrix

The screen progresses through distinct states based on user actions. The table below summarises which areas are active at each stage.

| Area | Initial (Screen Opens) | New Patient Entered | Existing Patient Entered | DFT Test Code Entered |
|------|----------------------|--------------------|--------------------------|-----------------------|
| Encounter No. field | Visible, blank, **editable** | — | — | — |
| HKID field | Visible, blank, **editable** | — | — | — |
| Patient Demographics panel | Visible, **disabled** | **Enabled** | **Disabled** | — |
| Request Information panel | Visible, **disabled** | **Enabled** | **Enabled** | — |
| Requested Tests panel | Visible, **disabled** | **Enabled** | **Enabled** | — |
| DFT Sequence panel | Visible, **disabled** | **Disabled** | **Disabled** | **Enabled** |
| Save button | **Disabled** | **Disabled** | **Disabled** | **Enabled** |
| Clear button | **Enabled** | **Enabled** | **Enabled** | **Enabled** |
| Exit button | **Enabled** | **Enabled** | **Enabled** | **Enabled** |

> **Encounter No.** is accessible via keyboard shortcut **Ctrl+Shift+E**. **HKID** is accessible via keyboard shortcut **Ctrl+Shift+H**.

---

## Visual Layout

The DFT Registration screen is a full-screen panel with the same structural zones as the standard Registration screen, with the following DFT-specific differences:

- The standard **Request No.**, **Comment**, and **Collection Date** fields are hidden — these are managed per time sequence instead.
- In their place, the **DFT Sequence Panel** is displayed. This panel occupies the lower portion of the screen and contains a vertical list of 14 **DFT Request Time Sequence** rows.
- Each time sequence row contains: a **Request No.** field, a **Collect D/T** (collection date and time) field, a **Time Flag** value (displayed in the column header as the test unit, e.g., `hr(s)`), and a **Specimen No.** field.
- The **Request No.** and **Specimen No.** columns in the DFT Sequence Panel are visible only when the screen is used in GCR (Group Collection Request) mode; they are hidden in standard DFT Registration.

---

## DFT Sequence Panel

The DFT Sequence Panel displays 14 time-sequenced entries, each representing one collection point in the DFT order. The column header for the time flag displays the unit associated with the selected DFT test (e.g., `hr(s)`), if one is configured. If no unit is configured, the header is blank.

### Columns per Sequence Row

| Column | Data Displayed | Visible in Standard DFT |
|--------|---------------|------------------------|
| Request No. | The request number assigned to this sequence entry | No (GCR mode only) |
| Collect D/T | Collection date and time for this sequence entry | Yes |
| Time Flag | The numeric time point for this sequence (e.g., 0, 1, 2 … hours) | Yes |
| Specimen No. | The specimen number linked to this sequence entry | No (GCR mode only) |

---

## DFT Test Types and Sequence Behaviour

The behaviour of the DFT Sequence Panel depends on the **test type** of the selected DFT test, as defined in the test dictionary.

| Test Type | Description | Request No. | Collect D/T | Time Flag Sequences |
|-----------|-------------|-------------|-------------|---------------------|
| **DFTT** | DFT Timed | Editable | Editable | **Disabled** — time points are fixed by the test dictionary |
| **DFTS** | DFT Sample | Editable | Editable | **Disabled** — time points are fixed by the test dictionary |
| **DFTC** | DFT Custom | Editable | Editable | **Editable** — all 14 time flag entries are editable |

> For DFTT and DFTS, the system automatically populates the time flag values from the test dictionary. Staff cannot modify these values. For DFTC, staff may freely edit all 14 time flag entries.

---

## Test Units Display

If the selected DFT test has a unit value configured in the test dictionary (e.g., `hr(s)`), that unit is displayed as the column header label for the Time Flag column in the DFT Sequence Panel. If no unit is configured, the column header remains blank.

---

## Buttons and Actions

### Save

| Property | Detail |
|----------|--------|
| **When visible** | Always visible |
| **When enabled** | Only after a valid DFT test code has been entered and the DFT Sequence Panel is populated |
| **What it does** | Saves the DFT request, including all time sequence entries that have been populated |

> The Save button becomes disabled again if the DFT test code field is cleared after a valid test was entered.

### Clear

| Property | Detail |
|----------|--------|
| **When visible** | Always visible |
| **When enabled** | Always enabled |
| **What it does** | Clears all entered data on the screen and resets to the initial state |

### Exit

| Property | Detail |
|----------|--------|
| **When visible** | Always visible |
| **When enabled** | Always enabled |
| **What it does** | Closes the DFT Registration screen |

---

## Selection and Interaction Behaviours

#### User enters a new patient (Encounter No. / HKID not previously registered)

The Patient Demographics, Request Information, and Requested Tests panels all become editable. The DFT Sequence Panel remains disabled until a valid DFT test code is entered.

#### User enters an existing patient (Encounter No. / HKID found in system)

The Patient Demographics panel is disabled (populated with the existing patient's data and cannot be edited). The Request Information and Requested Tests panels become editable. The DFT Sequence Panel remains disabled until a valid DFT test code is entered.

#### User enters a valid DFT test code in the Requested Tests panel

The system validates that the entered test code is a DFT test type (DFTT, DFTS, or DFTC). If valid:
1. The system retrieves the test's time flag sequence definition and unit from the test dictionary.
2. For a **new patient**, the system proceeds directly to populate the DFT Sequence Panel.
3. For an **existing patient**, the system checks whether there are any active DFT orders for this patient and test. If active orders exist, the system asks the user whether to add to an existing order or create a new order. If multiple existing orders are found, a dialogue is displayed for the user to select which order to associate.
4. If the system configuration includes a checking period for recently completed DFT requests, the system prompts the user to confirm the first collection date and time before proceeding.
5. Once all checks pass, the DFT Sequence Panel is enabled and populated with the time sequence data.
6. The Save button becomes enabled.

#### User enters a non-DFT test code in the Requested Tests panel

The system displays an error message indicating that only DFT tests are permitted. The DFT Sequence Panel is not enabled.

#### User clears the DFT test code after a valid test was entered

The DFT Sequence Panel is cleared and disabled. The Save button becomes disabled. The system resets to the "patient ready" state (Request Information and Requested Tests editable, DFT Sequence disabled).

#### Default request comment is applied on save (CHEM lab only)

When the `DFT_REQ_COMMENT` lab option is configured with a comment text for the CHEM lab, the system automatically attaches that comment to every DFT request saved from the CHEM lab DFT Registration screen. The comment is not visible on the DFT Registration screen itself (the Comment field is hidden). It can be viewed by opening the registered request in the Request Amendment screen.

---

## Configuration

| Setting | Option Code | Purpose | Effect when enabled | Effect when disabled |
|---------|-------------|---------|--------------------|--------------------|
| DFT Registration menu access | *(source: TOP_MENU table, menu_code for DFT Registration)* | Controls whether DFT Registration appears in the Request menu | Screen is accessible from the Request menu | Screen does not appear in the menu |
| Force recalculation of DFT collection datetime | `FORCE_RECALCULATION_DFT_COL_DTM_ENABLED` | Controls whether collection datetimes are forcibly recalculated when the test code is re-entered | Collection datetimes are recalculated on test code entry | Existing collection datetimes are preserved |
| Auto-calculation of DFT collection datetime | `AUTO_CALCULATION_DFT_COL_DTM_ENABLED` | Controls whether the system automatically calculates collection datetimes for each sequence based on the first collection time | Datetimes are auto-calculated from the first collection time using the time flag offsets | All sequence datetimes default to the first collection time without offset calculation |
| DFT series that disable auto-calculation | `DFT_SERIES_TO_DISABLE_AUTO_CALCULATION` | Specifies which DFT series types override the auto-calculation setting | Auto-calculation is disabled for the listed series, regardless of the general setting | No override; general auto-calculation setting applies |
| Checking period for completed DFT requests | `CHECKING_PERIOD_FOR_COMPLETE_DFT_REQ` | Sets the lookback period (in days) to check for recently completed DFT orders before allowing a new one | System prompts for first collection datetime and validates against recently completed orders within the period | No check is performed; user proceeds directly to DFT panel |
| Default first DFT collection time | `DEFAULT_DFT_COL_DTM` | Provides the default time value used when prompting the user for the first collection datetime | Dialogue pre-populated with this time | Not applicable |
| Default DFT request comment | `DFT_REQ_COMMENT` | Sets a default comment text to be automatically added to all DFT requests registered through the CHEM lab DFT Registration screen | The configured comment text is saved with every new DFT request; it is visible in the Request Amendment screen after registration | No default comment is added |

---

## Error Messages and System Prompts

| Message | Trigger | User Options |
|---------|---------|-------------|
| Only DFT tests allowed (message 0003252) | User enters a non-DFT test code in the Requested Tests panel | Dismiss (no action taken; test code field remains) |
| "Do you want to add to an existing order?" (message 0001508) | An active DFT order already exists for the patient and selected test | Yes (add to existing order) / No (create new order) |
| Recently completed DFT order conflict (message 0001509) | A completed DFT order within the checking period is found; screen is cleared | OK (dismiss; screen clears automatically) |
| "Cancel registration?" / confirm clear prompt (message 0000648) | User cancels the first collection datetime dialogue | OK (clear screen and return to Encounter No. field) / Cancel (return to DFT sequence panel) |

---

## Related Workflows

- [[DFT Registration - New DFT Order]] — The primary happy-path workflow for registering a new DFT request for a new or existing patient.
- [[DFT Registration - Add to Existing DFT Order]] — The workflow followed when the patient already has an active DFT order and the user chooses to append new sequences.
