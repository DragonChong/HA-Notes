# Patient Demographics Modified Validation on Save

## Overview

When a registration request is saved for a new patient whose demographic information was originally sourced from the external Patient Master Index (PMI), and the user has been granted the right to edit PMI patient data, the system checks whether any of five key demographic fields have been changed from their original PMI values. If any modification is detected, the user is presented with a confirmation prompt (message 2192) listing every changed field and the original and new values side by side. The user must actively confirm the changes before the registration can complete. If confirmed, the registration proceeds and an audit record is written to the system. If declined, the registration is cancelled and the user is returned to the screen. This workflow ensures that intentional changes to PMI-sourced patient data are acknowledged and traceable.

---

## Related User Stories

- **[[CRST-534]]** - Registration - Pre-register: Patient Info Validation - Patient Demo Modified

**Epic:** LISP-27 [CRST][DEV] Registration - Register Workflow

---

## Key Concepts

### PMI (Patient Master Index)
An external patient identity system that holds authoritative demographic records for patients. When a new patient is looked up via HKID and their record is found in the PMI, their demographic data (name, sex, DOB, race, Chinese name) is pre-populated on the Registration screen from the PMI record. This is the scenario referred to as "patient data sourced from PMI".

### New Patient with PMI Data
A patient whose HKID does not yet exist in the local LIS records, but whose demographic data was retrieved from the PMI when the user searched for them. The patient is considered "new" to the local system, but their demographic fields arrive pre-filled from the external source.

### Edit PMI Patient Data Right
A system function right that controls whether a specific user is permitted to modify demographic fields when those fields were pre-filled from PMI data. This right is managed in the `LAB_FUNCTION` table. When the right is not granted, the demographic fields on the Patient Demographics Panel are locked — the user cannot change them regardless of whether the data came from PMI.

### Tracked Fields
Only five demographic fields are compared against the original PMI values at save time:
- **Patient Name (English)** — compared by full name string
- **Patient Name (Chinese)** — compared by CCC Code (the encoded representation of the Chinese name)
- **Patient Sex**
- **Date of Birth**
- **Race**

Changes to any other field (e.g., Patient Location, Category) do not trigger message 2192.

---

## Trigger Point

This validation is triggered when the user clicks **Save** on the Manual Registration screen, as part of the pre-save validation pipeline. It runs only when all three of the following conditions are simultaneously true:
1. The request is being registered for a **new patient** (HKID not previously in the local system).
2. The patient's demographic data was **sourced from PMI** (the user selected a patient from the PMI lookup).
3. The user has been **granted the "Edit PMI Patient Data" function right**.

If any one of these three conditions is not met, the check is skipped entirely and the save proceeds without the 2192 prompt.

---

## Workflow Scenarios

### Scenario 1: No Demographic Changes — Save Proceeds Silently

#### Prerequisites
- All three trigger conditions are met (new patient, PMI-sourced data, edit right granted).
- None of the five tracked fields (Name, Chinese Name, Sex, DOB, Race) have been changed from their original PMI values.

#### Process Flow

```mermaid
sequenceDiagram
    User->>Registration Screen: Clicks Save
    Registration Screen->>Validation Pipeline: Run Demographics Modified check
    Validation Pipeline->>Field Comparison: Compare Name, Chinese Name, Sex, DOB, Race vs PMI originals
    Field Comparison-->>Validation Pipeline: No differences found
    Validation Pipeline-->>Registration Screen: Check passes; no prompt shown
    Registration Screen->>System: Continue save workflow
```

#### Step-by-Step Details

1. The system compares each of the five tracked fields against the values originally loaded from the PMI.
2. No differences are detected.
3. The check passes silently. Message 2192 is not shown.
4. The save workflow continues normally.

---

### Scenario 2: One or More Demographics Changed — Confirmation Required (Message 2192)

#### Prerequisites
- All three trigger conditions are met (new patient, PMI-sourced data, edit right granted).
- At least one of the five tracked fields has been changed from its original PMI value.

#### Process Flow

```mermaid
sequenceDiagram
    User->>Registration Screen: Clicks Save
    Registration Screen->>Validation Pipeline: Run Demographics Modified check
    Validation Pipeline->>Field Comparison: Compare Name, Chinese Name, Sex, DOB, Race vs PMI originals
    Field Comparison-->>Validation Pipeline: One or more differences found
    Validation Pipeline-->>Registration Screen: Show message 2192 with change summary
    Registration Screen->>User: Prompt listing modified fields (Yes / No)
    alt User clicks Yes
        User->>Registration Screen: Confirms changes
        Registration Screen->>System: Continue save; write audit record to PATIENT_AUDIT
    else User clicks No
        User->>Registration Screen: Declines
        Registration Screen->>User: Message closes; registration is cancelled
    end
```

#### Step-by-Step Details

1. The system compares each of the five tracked fields against their original PMI values.
2. At least one field has changed. The system assembles a change summary listing only the fields that differ, in the format `FieldName: OldValue -> NewValue`.
3. The system displays message **2192** with the following content:

   > *You have modified the patient demographic [differ from HKPMI] as followings:*
   > *(one line per changed field)*
   > *Do you want to proceed?*

   Only fields that have actually changed are listed. For example, if only Name and Sex were changed:
   > *Name: Smith,John -> Smith,Jonathan*
   > *Sex: Male -> Female*
   > *Do you want to proceed?*

4. The message presents two buttons: **Yes** and **No**.

5. **If the user clicks No:**
   - The message closes.
   - The registration process is stopped. The request is not saved.
   - The user is returned to the Registration screen with all their entries intact, where they may correct the demographics and attempt to save again.

6. **If the user clicks Yes:**
   - The registration proceeds and completes normally.
   - An audit record is inserted into the **Patient Audit** log recording the change. See the Audit Record section below.

---

### Scenario 3: Edit PMI Right Not Granted — Fields Locked, No Check at Save

#### Prerequisites
- The registration is for a new patient whose data came from PMI.
- The user has **not** been granted the "Edit PMI Patient Data" function right.

#### Process Flow

```mermaid
sequenceDiagram
    User->>Registration Screen: Request Number validated; screen enters ready state
    Registration Screen->>Patient Demographics Panel: Set all demographic fields to locked (read-only)
    Note over Patient Demographics Panel: Name, Chinese Name, Sex, DOB, Race are not editable
    User->>Registration Screen: Clicks Save
    Registration Screen->>Validation Pipeline: Run Demographics Modified check
    Validation Pipeline-->>Registration Screen: Condition not met (no edit right); check skipped
    Registration Screen->>System: Continue save workflow normally
```

#### Step-by-Step Details

1. When the Registration screen transitions to the ready state for a new patient with PMI-sourced data, the system checks the "Edit PMI Patient Data" right for the current user.
2. Because the right is not granted, all demographic fields on the Patient Demographics Panel are set to **locked (read-only)**. The user can view the PMI-provided values but cannot change them.
3. When the user clicks Save, the demographics modified check is bypassed entirely because the edit right condition is not met.
4. The save proceeds without the 2192 prompt.

> This scenario also applies when the registration is for a new patient whose data was **not** sourced from PMI (e.g., manually entered from scratch). In that case, `isCurrentPatientDataComeFromPmi` is false, and the check is similarly bypassed.

---

## Tracked Fields and Message Format

The following fields are compared at save time. Only fields with a detected change appear in the message 2192 content.

| Field Label in Message | What is Compared | Display Format in Message |
|------------------------|-----------------|--------------------------|
| Name | Patient Name (English) — full name string | `Name: OldName -> NewName` |
| Chinese Name (CCC Code) | CCC Code of the Chinese name (encoded representation) | `Chinese Name(CCC Code): OldCode -> NewCode` |
| Sex | Sex description (e.g., "Male", "Female") | `Sex: OldSex -> NewSex` |
| DOB | Date of Birth (formatted date string) | `DOB: OldDate -> NewDate` |
| Race | Race code (alpha-1 identifier) | `Race: OldRace -> NewRace` |

---

## Audit Record

When the user clicks **Yes** on message 2192, the system inserts one record into the **Patient Audit** log with the following data:

| Audit Field | Value Recorded |
|-------------|---------------|
| Lab Number | The lab number of the Manual Registration screen |
| Patient ID | The patient's HKID (from the patient record) |
| User | The logged-in user's key |
| Workstation | The workstation/station name |
| Date/Time | The date and time the request was saved |
| Audit Type | **58** (fixed code identifying this as a PMI demographics modification audit) |
| Audit Content | The same change summary text displayed in message 2192 (one line per changed field) |
| Request Number | The lab request number being registered |
| Acting By | The logged-in user's key |
| Text | NULL |

---

## Configuration

| Setting | Source | Purpose | Effect when enabled | Effect when disabled |
|---------|--------|---------|--------------------|--------------------|
| Edit PMI Patient Data Allowed | *(source: `LAB_FUNCTION` table, function key `u_lis_obj_hkpmi_security_check`)* | Controls whether the current user can modify demographic fields that were pre-filled from PMI data | Demographic fields are editable; message 2192 check is active at save time | Demographic fields are locked; message 2192 check is bypassed entirely |

> This setting is a **function right** managed in the `LAB_FUNCTION` / `FUNCTION_GROUP` tables, not a `LAB_OPTION` entry. It is assigned per user role or group. When not granted, no amount of other configuration will enable PMI demographic editing.

---

## Business Rules

1. The demographics modified check runs only when **all three** conditions are true simultaneously: the patient is new to the local system, the demographic data was sourced from PMI, and the current user has the "Edit PMI Patient Data" function right.
2. If any one of the three conditions is false, the check is entirely skipped — no prompt is shown and no audit record is written.
3. Only **five fields** are tracked: Patient Name (English), Patient Name (Chinese, by CCC Code), Patient Sex, Date of Birth, and Race. Changes to other demographic fields (e.g., Location, Category, Bed) do not trigger the prompt.
4. The Chinese name is compared by **CCC Code**, not by the displayed Chinese characters, to ensure a consistent and encoding-safe comparison.
5. Message **2192** is a **mandatory confirmation** — it cannot be bypassed. If the user wants to save with modified demographics, they must click **Yes**. There is no way to proceed without responding to the prompt.
6. Clicking **No** on message 2192 stops the registration entirely. The user must correct the demographics (restoring original values or making deliberate changes) and save again.
7. When the user clicks **Yes**, an audit record of type **58** is written to the Patient Audit log. The audit content mirrors the message 2192 text exactly.
8. When the "Edit PMI Patient Data" right is not granted, the demographic fields are made **read-only** at the point the screen enters the ready state — the user cannot make any changes. The save-time check is therefore redundant for this case and is skipped.
9. This check is specific to the **Manual Registration** screen. It does not apply to amendment workflows or other registration entry points.

---

## Related Workflows

- [[Patient Info Validation on Save]] — This validation runs as part of the broader pre-save patient information validation pipeline.
- [[Retrieve Patient by HKID]] — The scenario where patient data is sourced from PMI begins in the PMI patient lookup workflow; `isCurrentPatientDataComeFromPmi` is set to true when the user selects a patient from the PMI results.
- [[Patient Demographics Panel]] — The Patient Demographics Panel fields are locked or editable based on the same three conditions checked here.
