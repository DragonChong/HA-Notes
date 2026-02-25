# Patient Demographics Panel

## Overview

The Patient Demographics Panel is a data-entry section of the Registration screen that captures the personal and location details of a patient. It becomes interactive only after the HKID, Encounter Number, and Request Number have all been successfully validated. The fields it presents — and whether each field is editable, selectable, or locked — depend on whether the patient is new to the system, already registered, or an existing patient being assigned a new encounter number.

---

## Related User Stories

- **[[CRST-114]]** - Registration - Patient Demographics Panel Enablement

**Epic:** LISP-25 [CRST][DEV] Registration - Screen Object Enablement

---

## Component Modes

The panel operates in three distinct modes, determined automatically by the system when the Request Number is validated:

| Mode | When It Applies | Distinguishing Feature |
|------|-----------------|------------------------|
| New Patient | The HKID and Encounter Number are both new to the system | All demographic fields are editable; Location Hospital defaults to the lab's home hospital; Age Unit defaults to "Years"; Category defaults to "In-Patient" |
| Existing Patient | Both the HKID and Encounter Number are already in the system | Most fields are visible but locked; only Category remains selectable |
| Existing Patient with New Encounter | The HKID is already in the system but the Encounter Number is new | Behaves like New Patient mode with two exceptions: Category has no default selection; Name fields are editable and pre-populated from the patient's existing record |

---

## Visual Layout

The Patient Demographics Panel occupies the central area of the Registration screen, below the Registration Key Panel (which contains the HKID, Encounter Number, and Request Number fields). It is arranged as a form with labelled fields laid out in rows. The panel is not independently scrollable; all 15 fields are visible at once. The panel as a whole is inactive and visually suppressed until the Request Number is confirmed as valid.

---

## Field Enablement by Patient Type

The table below describes the state of each field once the Request Number is validated. "Editable" means the user can type freely. "Selectable" means the user can choose from a dropdown list. "Locked" means the field shows data but cannot be changed. "Disabled" means the field is visually greyed out and cannot be interacted with.

| Field | New Patient | Existing Patient | Existing Patient with New Encounter |
|-------|-------------|------------------|--------------------------------------|
| Name (English) | Editable (blank) | Locked | Editable (pre-populated) |
| Name (Chinese) | Editable (blank) | Locked | Editable (pre-populated) |
| Sex | Selectable | Disabled | Selectable |
| Pay Code | Disabled | Disabled | Disabled |
| Date of Birth | Editable (blank) | Disabled | Editable |
| Age | Editable (blank) | Locked | Editable |
| Age Unit | Selectable; default: **Years** | Disabled | Selectable; default: **Years** |
| Location — Hospital | Editable; default: lab's home hospital | Locked | Editable; default: lab's home hospital |
| Location — Specialty | Editable (blank) | Locked | Editable |
| Location — Ward / Clinic | Editable (blank) | Locked | Editable |
| Category | Selectable; default: **In-Patient** | Selectable | Selectable (no default) |
| Bed | Editable (blank) | Locked | Editable |
| Admitted | Editable (blank) | Disabled | Editable |
| MRN | Editable (blank) | Locked | Editable |
| Race | Selectable (blank) | Disabled | Selectable |

> **Pay Code** is always disabled in all three modes. It is visible but cannot be entered manually; it is populated by the system through other means.

> **Category** is always selectable regardless of patient type. It is the only field that remains interactive for an Existing Patient.

---

## Default Values

The following fields are pre-set when the panel first activates. Defaults apply only in the modes indicated:

| Field | Default Value | Applies In |
|-------|---------------|------------|
| Age Unit | Years | New Patient; Existing Patient with New Encounter |
| Location — Hospital | Lab's home hospital | New Patient; Existing Patient with New Encounter |
| Category | In-Patient | New Patient only |
| Race | (blank — no default) | All modes |

---

## Keyboard Shortcuts

| Field | Shortcut |
|-------|----------|
| Name (English) | **Ctrl + Shift + N** |
| Location — Ward / Clinic | **Ctrl + Shift + O** |

---

## Data Sources

| Field | Source |
|-------|--------|
| Sex | Keyword group **SEX** — Lab database |
| Age Unit | Keyword group **AGE_UNIT** — Lab database |
| Category | Keyword group **CATEGORY** — Lab database |
| Race | Patient Race constants — Lab database |
| Location — Hospital | Office directory, hospital-type offices |
| Location — Specialty | Office directory, specialty-type offices filtered by selected hospital |
| Location — Ward / Clinic | Office directory, ward/clinic-type offices filtered by selected hospital |

---

## Selection and Interaction Behaviours

#### Panel activates after Request Number is validated
Once the user has entered a valid Request Number, the system determines the patient type and applies the appropriate field states from the table above. Fields that are editable or selectable become active; fields that are locked show the patient's existing data; fields that are disabled are greyed out.

#### User enters a Date of Birth
When the user enters a date of birth, the system automatically calculates and populates the Age and Age Unit fields. Conversely, if the user enters an age, the fields remain consistent with the entered value.

#### User changes the Location — Hospital
Changing the hospital selection causes the Specialty and Ward / Clinic dropdowns to reload their options, filtered to show only offices belonging to the newly selected hospital.

#### Existing Patient with New Encounter — Name fields pre-populated
When the panel enters "Existing Patient with New Encounter" mode, the Name (English) and Name (Chinese) fields are pre-filled with the name from the patient's existing record. The user may edit these values before saving.

---

## Related Workflows

- [[Retrieve Patient by HKID]] — The panel activates as the final step of this workflow, after the HKID and Encounter Number are validated.
- [[Retrieve Patient by Encounter Number]] — The panel activates in Existing Patient mode at the conclusion of this workflow.
- [[Create New Patient by HKID]] — The panel activates in New Patient mode after the user confirms creation of a new patient and the Request Number is validated.
- [[Patient Info Validation on Save]] — The fields on this panel are subject to mandatory and validity checks when the user clicks Save.
- [[Patient Name Validation on Save]] — The Patient Name field on this panel is subject to format (comma structure) and length checks when the user clicks Save for a new patient.
