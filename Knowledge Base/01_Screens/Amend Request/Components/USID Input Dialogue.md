---
epic: LISP-225
status: draft
---
# USID Input Dialogue

## Overview

The **Input Specimen Number Dialogue** allows laboratory staff to assign or update USID (Universal Specimen Identifier) and specimen number mappings for a retrieved request before confirming the amendment. It presents a data grid showing the current specimen-to-test-profile relationships for the request, and allows staff to add, delete, or remap specimen assignments. The dialogue is opened from the Amend Request screen via the **Input Specimen No.** button, which is visible only when the USID function is enabled for the current lab.

---

## Related User Stories

- **[[CRST-817]]** - Amend Request - USID Input Dialogue

**Epic:** LISP-225 [CRST][DEV] Amend Request - USID

---

## Component Modes

| Mode | When It Applies | Distinguishing Feature |
|------|-----------------|----------------------|
| No relations | Request has no existing specimen-to-test-profile mappings | Specimen No. column is empty; only Test Profile codes shown |
| Single profile | One test profile with one specimen relation | Single row in the grid |
| Multiple profiles — one specimen | Multiple test profiles all mapped to the same specimen | Test profiles concatenated with "," in the Test column; single Specimen No. shown |
| Multiple specimens | Multiple specimen-to-test-profile pairs | Multiple rows in the grid |

---

## Visual Layout

A modal dialogue containing:
- A **data grid** in the upper area displaying existing specimen-to-test-profile relationships
- A **Specimen No.** text input field for entering a new USID or specimen number
- A row of action buttons at the bottom: **Remap Specimen**, **OK**, **Delete**, **Cancel**

---

## Data Grid Columns

| Column | Data Displayed | Default Visible |
|--------|---------------|-----------------|
| Test | Test Profile Code(s) for the specimen mapping. When multiple profiles share one specimen, codes are concatenated with "," | Yes |
| Specimen No. | The assigned USID or specimen number | Yes |

Only specimen-to-test-profile relations where user access is permitted are shown (`usid_profile_relation.user_access ≠ 0`).

---

## Prerequisite

The **Input Specimen No.** button is only available and enabled when:
- The request has been retrieved on the Amend Request screen
- The USID function is enabled for the current lab
- The manual input request number is **not** in USID format (if the request number is itself in USID format, the button is disabled and adding USID is not permitted)

> **CRS variant note:** In the legacy system, the enablement of this button on the CRS Amend Request screen depends on the USID setup for CRS (lab number = 9).

---

## Opening the Dialogue

When the **Input Specimen No.** button is clicked, the system:

1. Retrieves all test profile codes associated with the current request.
2. Retrieves all existing specimen-to-test-profile relations for the request.
3. Determines the BBS Test Type for any BBS test profile codes:

| BBS Test Profile | Test Type |
|-----------------|-----------|
| Type and Screen Test | T&S |
| Component Test | COMPONENT |
| No Sample Test | NOSAMPLE |

4. Filters out any relations where the user does not have access (`usid_profile_relation.user_access = 0`).
5. Displays the resulting relations in the data grid, with one row per specimen-to-profile mapping.

---

## Input Specimen No. Field

Staff enter a USID or specimen number into the **Specimen No.** field. On leaving the field, the system validates the entry:

| Condition | Behaviour |
|-----------|-----------|
| Request number is in USID format | Adding a USID is not permitted; message **4032** is prompted. The Input Specimen No. button is disabled in this state |
| Entered USID or specimen number already has an existing relation for a **different** request | Message **4031** is prompted; the Specimen No. field is cleared |
| Entered USID has already been added to the data grid for **this** request | Message **4030** is prompted |
| Test Profile is configured with no specimen | Message **4126** is prompted, listing the affected Test Profile Code(s) |
| All checks pass | The new specimen-to-test-profile record row is added to the data grid |

---

## Buttons and Actions

### OK

**When visible:** Always enabled.

**What it does:**
1. Validates that all Test Profiles are mapped to at least one specimen. If any Test Profile has no specimen mapping, message **4075** is prompted and the dialogue remains open.
2. If validation passes, the dialogue closes. The specimen-to-test-profile relations entered are held in memory and will be saved when the Amend button is confirmed.
3. If the **Input Specimen No.** button is clicked again, the previously entered relations are redisplayed in the data grid.

### Delete

**When visible:** Enabled when a row is selected in the data grid **and** the request number is not in USID format.

**What it does:** Removes the selected specimen-to-test-profile relation row from the data grid. The buttons' enabled state is recalculated after deletion.

### Remap Specimen

**When visible:** Enabled when:
- A specimen test record is selected in the data grid, **and**
- The user has the access right to remap specimens, **and**
- One of the following applies regarding the `SKIP_ASSIGN_NEW_PROFILE_TO_ALL_SPECIMENS` lab option:
  - If the option is set (`option_value = 1`): the number of specimens in the relations is greater than 0
  - If the option is not set: the number of specimens in the relations is greater than 1

**Keyboard shortcut:** Ctrl+R

**What it does:** Opens the **Remap Specimen Dialogue** (see [[CRST-623]]). Refer to that user story for full remap behaviour.

### Cancel

**When visible:** Always enabled.

**What it does:** Discards all specimen-to-test-profile changes made in the current session of the dialogue and closes it. If the **Input Specimen No.** button is clicked again, the data grid is empty (previous input is not retained).

---

## Button Visibility Matrix

| Condition | OK | Cancel | Delete | Remap Specimen |
|-----------|-----|--------|--------|----------------|
| Dialogue open, no row selected | Enabled | Enabled | Disabled | Disabled |
| Row selected, request no. in USID format | Enabled | Enabled | Disabled | Based on remap access + option |
| Row selected, request no. not in USID format | Enabled | Enabled | Enabled | Based on remap access + option |

---

## Configuration

| Setting | Option Code | Purpose | Effect when enabled | Effect when disabled |
|---------|-------------|---------|--------------------|--------------------|
| Skip assign new profile to all specimens | `SKIP_ASSIGN_NEW_PROFILE_TO_ALL_SPECIMENS` | Controls when Remap Specimen button is enabled relative to specimen count | Enabled when specimen count > 0 | Enabled only when specimen count > 1 |

*Source: `LAB_OPTION` table, `option_group = 'SPECIMEN'`*

---

## Error Messages and System Prompts

| Message | Description | Trigger | User Options |
|---------|-------------|---------|-------------|
| 4030 | USID already added | Entered USID is already present in the grid for this request | Dismiss (field cleared) |
| 4031 | USID or specimen number already in use | Entered value has an existing relation for a different request | Dismiss (field cleared) |
| 4032 | Cannot add USID when request number is in USID format | Input Specimen No. button clicked while request number is in USID format | Dismiss |
| 4075 | Test Profile not mapped to any specimen | OK clicked with a Test Profile row having no specimen assigned | Dismiss (dialogue stays open) |
| 4126 | Test Profile configured with no specimen | Entered USID maps to a Test Profile with no specimen setup | Dismiss |

---

## Related Workflows

- [[USID Data Conversion]] — The specimen relations collected in this dialogue are converted and prepared for saving when the Amend button is confirmed.
- [[USID Not Found Alert]] — Shown during the Amend pre-save process if a USID entered here cannot be found in the system.
- [[USID Audit]] — Audit records are inserted based on the specimen relation changes made via this dialogue.
