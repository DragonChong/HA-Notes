# USID Input Dialogue

## Overview

The USID Input Dialogue (labelled "Input Specimen Number") allows lab staff to create or update the mapping between specimens (identified by USID or specimen number) and the test profiles of a retrieved lab request on the Add Delete Test screen. The dialogue is opened by clicking the **Input Specimen No.** button and presents a data grid of test profile-to-specimen relations that the user can add to, remap, or delete. Changes are only applied to the request when the user clicks **OK**; cancelling discards all changes.

---

## Related User Stories

- **[[CRST-1032]]** - Add Delete Test - USID Input Dialogue

**Epic:** LISP-266 [CRST][DEV] Add/Delete Test - USID

---

## Key Concepts

### USID
A Universal Specimen Identifier — a barcode-based identifier for a physical specimen. A request number in USID format cannot be used to add further USID mappings via this dialogue.

### Specimen Profile Relation
A link between a specimen (identified by USID or specimen number) and a test profile on the request. Each relation row in the dialogue represents one such mapping.

### Newly Added Test Profile
A test profile that the user has added during the current Add Delete Test session (not yet submitted). These profiles can be remapped via the Remap Specimen feature. Existing (pre-retrieved) profiles cannot be remapped.

### Test Profile Marked Deleted
A test profile in the Test Grid that the user has flagged for deletion. Such profiles are excluded from the USID Input Dialogue data grid and cannot have specimen relations managed for them.

---

## Component Modes

| Mode | When It Applies | Distinguishing Feature |
|---|---|---|
| New test profile added | User has added a new profile and it is not marked deleted | Remap Specimen button may be enabled |
| No change in test profiles | Only existing profiles, none newly added | Remap Specimen button is disabled |
| Mark deleted test profile | A profile is flagged for deletion in the Test Grid | That profile does not appear in the dialogue |

---

## Visual Layout

The dialogue is a modal panel, approximately 220–400 pixels wide (width varies based on specimen type input mode) by 390 pixels tall. It contains:
- A data grid occupying the upper portion, listing test profile-to-specimen relation rows
- A **Specimen No.** text input field for entering new USID or specimen numbers
- A row of action buttons at the bottom: **Remap Specimen**, **OK**, **Delete**, **Cancel**

---

## Opening the Dialogue

The dialogue is opened when the user clicks **Input Specimen No.** on the Add Delete Test screen, provided:
- The screen is in the Ready state
- USID is enabled in the current lab
- The request number is **not** in USID format

> If the request number is already in USID format, the **Input Specimen No.** button is disabled and the dialogue cannot be opened.

When opening, the system loads the current test profile-to-specimen relations as described in [[Create Specimen Profile Relation from Request]]:
- Test profiles marked deleted in the Test Grid are **not** shown in the dialogue data grid.
- Test profiles with `user_access = 0` are **not** shown.
- All other profiles appear, with or without a specimen mapping pre-populated.

---

## Buttons and Actions

### Remap Specimen

**When enabled:**
- The request number is not in USID format, **and**
- A newly added test profile row is selected in the data grid, **and**
- The user has the access right to remap specimen (i.e., `cb_disable_remap_spec` is **not** set), **and**
- The `SKIP_ASSIGN_NEW_PROFILE_TO_ALL_SPECIMENS` lab option is enabled and the number of specimens in the relations is greater than 0 **OR** the lab option is not set and the number of specimens is greater than 1.

**When clicked:** Opens the Remap Specimen sub-dialogue (see below).

---

### OK

**When visible/enabled:** Always enabled.

**What it does:**
1. The system validates that every test profile in the grid is mapped to at least one specimen. If any profile is unmapped, message **4075** is displayed and the dialogue remains open.
2. If all validations pass, the dialogue closes and the updated specimen-profile relations are saved for the request.

---

### Delete

**When enabled:**
- The request number is not in USID format, **and**
- A row with both a test profile and a specimen (i.e., a complete relation) is selected in the data grid.

**What it does:**
- If the selected row is a **newly added** test profile-specimen relation: the specimen number is cleared from that row.
- If the selected row is an **existing** (pre-retrieved) relation: message **4076** is displayed and the deletion is blocked. The relation remains unchanged after the user clicks **OK** on message 4076.

---

### Cancel

**When visible/enabled:** Always enabled.

**What it does:** Discards all changes made in the dialogue (new specimens entered, relations modified or deleted) and closes the dialogue without affecting the request.

---

## Inputting a Specimen Number

1. The user types a USID or specimen number into the Specimen No. text input field.
2. The system checks whether the entered value already exists in the system via a backend lookup:
   - If found as a duplicate, message **4031** is displayed and the Specimen No. field is cleared when the message closes.
3. If the specimen has already been added to this dialogue session, message **4030** is displayed.
4. If the test profile is configured with no specimen (i.e., no specimen assignment expected), message **4126** is displayed, listing the affected test profile code(s).
5. If all checks pass:
   - If there are **newly added test profiles**: a new row is added to the data grid with those profiles and the entered specimen.
   - If there are **no newly added test profiles**: a new row is added with the specimen and a blank test profile column.

---

## Remap Specimen Sub-Dialogue

When the **Remap Specimen** button is clicked, a secondary dialogue opens:

- **Data grid:** One row per test profile code. Only **newly added** test profile codes are shown (existing profiles cannot be remapped).
- **Specimen column:** A combined drop-down list and checkbox control for each row. The drop-down lists all USIDs of specimens in the current relations. The checkbox is checked if a test-specimen relation exists for that profile.
  - If a single relation exists, the specimen USID is shown directly.
  - If multiple relations exist, the display shows `[USID] + "..."`.
- **Keyboard:** Pressing the Space bar opens the specimen drop-down for the highlighted row.
- **Unchecking a checkbox** removes the specimen-test relation for that profile.

**OK button on Remap Specimen:**
- Validates that no specimen is left with zero test profile relations. If any specimen has no profile assigned, message **4041** is displayed and the sub-dialogue remains open.
- If validation passes, the remapped relations are applied, the sub-dialogue closes, and the updated layout is shown in the USID Input Dialogue.

---

## Button Visibility Matrix

| Condition | Remap Specimen | OK | Delete | Cancel |
|---|---|---|---|---|
| No newly added test profile | Disabled | Enabled | Depends on selection | Enabled |
| Newly added test profile, no specimen input yet | Disabled | Enabled | Depends on selection | Enabled |
| Newly added test profile + specimen input + access right + lab option condition met | Enabled | Enabled | Depends on selection | Enabled |
| Existing relation row selected | Disabled | Enabled | Disabled (blocked by msg 4076) | Enabled |
| New relation row selected (has test + specimen) | Depends | Enabled | Enabled (clears specimen) | Enabled |
| Row without specimen selected | Depends | Enabled | Disabled | Enabled |

---

## Error Messages and System Prompts

| Message | Text (or description) | Trigger | User Options |
|---|---|---|---|
| 4030 | USID already added | The entered specimen has already been added to the dialogue in the current session | OK (dismiss) |
| 4031 | Specimen already exists in the system | A duplicate specimen number or USID is found via backend lookup | OK (clears Specimen No. field on close) |
| 4041 | Specimen has no test profile relation | Remap Specimen OK clicked with a specimen not mapped to any profile | OK (sub-dialogue stays open) |
| 4075 | Test profile not mapped to any specimen | OK clicked with a test profile having no specimen mapping | OK (dialogue stays open) |
| 4076 | Cannot delete existing relation | Delete clicked on a pre-existing test-specimen relation row | OK (relation unchanged) |
| 4126 | Test profile configured with no specimen | Specimen entered for a profile that expects no specimen | OK (dismiss) |

---

## Configuration

| Setting | Option Code | Purpose | Effect when enabled | Effect when disabled |
|---|---|---|---|---|
| Skip Assign New Profile to All Specimens | `SKIP_ASSIGN_NEW_PROFILE_TO_ALL_SPECIMENS` | Controls the threshold for enabling Remap Specimen when there is at least one specimen | Remap Specimen enabled if specimen count > 0 | Remap Specimen requires specimen count > 1 |

> Source: `LAB_OPTION` table, `option_group = 'SPECIMEN'`, `option_code = 'SKIP_ASSIGN_NEW_PROFILE_TO_ALL_SPECIMENS'`, `option_value = 1` (enabled).

### Access Rights

| Access Right | Sub-Function | Effect when set |
|---|---|---|
| Not allow to Remap Specimen | `cb_disable_remap_spec` | Remap Specimen button remains disabled regardless of other conditions |
| Not allow to Delete Specimen relation | `cb_disable_delete_spec` | Delete button behaviour restricted |

---

## Related Workflows

- [[Create Specimen Profile Relation from Request]] — Populates the initial data grid content when the dialogue opens.
- [[Profile Not Mapped to Specimen Message]] — The same message 4075 is also triggered at Submit time (outside this dialogue) under specific lab option conditions.
- [[USID Not Found Alert]] — Triggered at Submit time if a USID entered here does not exist in the system.
- [[Object Enablement After Retrieval]] — Governs when the Input Specimen No. button (which opens this dialogue) is enabled.
