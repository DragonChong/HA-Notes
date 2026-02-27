# USID Input Dialogue

## Overview

The USID Input Dialogue (labelled "Input Specimen Number Dialogue" on screen) allows Registration staff to map specimen identifiers (USIDs or Specimen Numbers) to the test profiles entered on a request. It is opened from the Registration screen via the **Input Specimen No.** button, which is available only when the USID feature is enabled for the current lab and the request number is not itself in USID format. The dialogue displays a data grid of specimen-to-test-profile relationships. When confirmed, the mappings are saved back to the request.

---

## Related User Stories

- **[[CRST-514]]** - Registration - USID Input Dialogue

**Epic:** LISP-29 [CRST][DEV] Registration - Screen Object Interaction

---

## Trigger

The **Input Specimen No.** button on the Registration screen is clicked. The button is enabled only when:
- USID is enabled for the current lab, **and**
- The request number currently entered is **not** in USID format.

---

## Initialisation

When the dialogue opens:
1. The test profiles currently entered on the Registration screen are loaded and displayed in the Specimen Test Relation data grid (the **Test** column shows the profile codes).
2. If the dialogue has been opened and confirmed previously for this request, the previously saved specimen-test mappings are pre-loaded into the data grid.
3. If opened after a Cancel, the data grid is empty (previous in-session entries were discarded).
4. Button enablement is evaluated immediately on open (see Button Enablement section).

---

## Visual Layout

A modal dialogue containing:
- A **Specimen No.** input field for entering a USID or Specimen Number.
- A **Specimen Test Relation** data grid showing the current specimen-to-test-profile mappings, with columns for specimen number, test profile code, specimen type code, and specimen type description.
- Four buttons: **OK**, **Cancel**, **Delete**, and **Remap Specimen**.

---

## Buttons and Actions

### OK

| Property | Detail |
|----------|--------|
| **Label** | OK |
| **When enabled** | Always enabled |
| **Keyboard shortcut** | None specified |
| **What it does** | Validates the specimen-test mappings and, if valid, saves them back to the Registration screen and closes the dialogue. See [OK Button Behaviour](#ok-button-behaviour) below. |

### Cancel

| Property | Detail |
|----------|--------|
| **Label** | Cancel |
| **When enabled** | Always enabled |
| **What it does** | Discards all specimen entries made during this dialogue session and closes the dialogue. The Registration screen is unchanged. If the dialogue is re-opened, the data grid is empty. |

### Delete

| Property | Detail |
|----------|--------|
| **Label** | Delete |
| **When enabled** | Only when: a row in the Specimen Test Relation data grid is selected, **and** the request number is not in USID format |
| **What it does** | Removes the selected specimen-test relation row from the data grid. Button enablement is re-evaluated after deletion. |

### Remap Specimen

| Property | Detail |
|----------|--------|
| **Label** | Remap Specimen |
| **Keyboard shortcut** | Ctrl+R |
| **When enabled** | See [Remap Specimen Button Enablement](#remap-specimen-button-enablement) below |
| **What it does** | Opens the Remap Specimen Dialogue, allowing the user to reassign a specimen to a different test profile. |

---

## Specimen No. Input Behaviour

When a value is entered in the **Specimen No.** field and focus leaves the field, the system performs the following checks in order:

1. **Request No is in USID format:** Message **4032** is shown. The entry is not added.

2. **USID or Specimen No already in use by another request:** The system checks the backend service for existing specimen-test relations for other requests. If found, message **4031** is shown and the Specimen No. field is cleared.

3. **USID already added to this dialogue's data grid:** If the same USID has already been added to the current session, message **4030** is shown.

4. **Test profile with no specimen configured:** If any test profile in the current request is set up without specimen assignment, message **4126** is shown, listing the affected profile codes.

5. **All checks pass:** A new row is added to the Specimen Test Relation data grid showing the specimen number mapped to the relevant test profiles.

---

## OK Button Behaviour

When **OK** is clicked, the system validates the data grid contents before closing:

| Validation | Message | Behaviour |
|---|---|---|
| A specimen in the data grid is not mapped to any test profile | 4041 | Dialogue remains open |
| A test profile is not mapped to any specimen | 4075 | Dialogue remains open |

If all validations pass, the specimen-test relations are saved to the request and the dialogue closes. The Registration screen retains the mappings. Re-opening the dialogue shows the saved relations in the data grid.

---

## Remap Specimen Button Enablement

The **Remap Specimen** button is enabled only when **all** of the following conditions are met:

| Condition | Required State |
|---|---|
| User access right | User must have the Remap Specimen access right (not configured as `cb_disable_remap_spec`) |
| Lab option `SKIP_ASSIGN_NEW_PROFILE_TO_ALL_SPECIMENS` | If this option is enabled: at least 1 specimen in the relations; if this option is not enabled: more than 1 specimen in the relations |
| Number of test profile codes | More than 1 test profile code must be present |

---

## Delete Button Enablement

The **Delete** button is enabled only when:
- A row is selected in the Specimen Test Relation data grid, **and**
- The request number is not in USID format.

User access right `cb_disable_delete_spec` disables the Delete button regardless of selection.

---

## Data Grid — Specimen Test Relation

| Column | Data Displayed |
|--------|---------------|
| Specimen No. | The USID or Specimen Number entered |
| Test | The test profile code(s) mapped to this specimen |
| Specimen Type Code | The specimen type code (editable where permitted) |
| Specimen Type Description | The specimen type description |

Rows are sorted by specimen number. Specimen type code and description are editable only where the specimen type input option is enabled.

---

## Configuration

| Setting | Option Code | Purpose | Effect when enabled | Effect when disabled |
|---------|------------|---------|--------------------|--------------------|
| Skip Assign New Profile To All Specimens | `SKIP_ASSIGN_NEW_PROFILE_TO_ALL_SPECIMENS` *(option_group: SPECIMEN)* | Controls the threshold for enabling the Remap Specimen button | Remap enabled when ≥ 1 specimen and > 1 profile | Remap enabled only when > 1 specimen and > 1 profile |
| Specimen Type Input | *(source: dictionaryParam.specimenTypeInput)* | Controls whether specimen type columns are editable | Specimen type code and description columns are editable | Specimen type columns are read-only |

---

## Error Messages

| Message | Trigger | User Options |
|---------|---------|-------------|
| 4030 | USID already added to this dialogue session | Dismiss |
| 4031 | USID or Specimen No already in use by another request | Dismiss; Specimen No. field is cleared |
| 4032 | Request No is in USID format — cannot add another USID | Dismiss |
| 4041 | Specimen in grid not mapped to any test profile (on OK) | Dismiss; dialogue remains open |
| 4075 | Test profile not mapped to any specimen (on OK) | Dismiss; dialogue remains open |
| 4126 | Test profile configured with no specimen | Dismiss |

---

## Related Workflows

- [[Create New Doctor Dialogue]] — Another Registration screen popup dialogue opened via a dedicated button.
- [[Report Copy Input Dialogue]] — Another Registration screen popup dialogue for managing additional destination locations.
