# Patient Info Validation on Save

## Overview

When a registration is saved, the system runs a series of mandatory and validity checks against the patient demographic fields entered on the Registration screen. These checks enforce that required fields are not left blank, that selected values are valid, and that date and range fields fall within acceptable bounds. Some checks are always active; others are controlled by lab options. Failing a check either blocks the save operation or, for warnings, prompts the user to confirm before proceeding.

---

## Related User Stories

- **[[CRST-531]]** - Registration - Pre-register: Patient Info Validation - Mandatory & Validity

**Epic:** LISP-27 [CRST][DEV] Registration - Register Workflow

**Related:** [[CRST-532]] — Patient Info Validation - Patient Name (patient name format and length checks, covered in [[Patient Name Validation on Save]])

---

## Trigger Point

These validations are triggered when the user clicks **Save** on the Registration screen. They run as part of a sequential validation pipeline that covers all required patient demographic fields before the registration is committed.

---

## Workflow Scenarios

### Scenario 1: Blank Field Check

#### Prerequisites

- The user has clicked Save.
- One or more required patient demographic fields have been left blank.

#### Step-by-Step Details

1. The system checks each configured mandatory field.
2. For any field that is blank, the system displays message **490**: *"[Field Name] cannot be blank."*
3. The save operation is blocked. The user must fill in the field and attempt to save again.

The following fields are subject to blank checks:

| Field | Blank-check always active? | Condition for check to apply |
|-------|---------------------------|------------------------------|
| Patient Name | No | Option `PATIENT_NAME_VALIDATION_ENABLED` enabled **and** new patient |
| Sex | No | Option `PATIENT_SEX_MANDATORY` enabled |
| Age Unit | No | No Date of Birth entered **and** an Age value other than 0 has been entered |
| Patient Location | No | Option `PATIENT_LOCATION_IS_MANDATORY` enabled |
| Patient Category | Yes | Always (when field is active) |

---

### Scenario 2: Invalid Value Check

#### Prerequisites

- The user has clicked Save.
- A field that is active contains a value that is not a valid selection from the available list.

#### Step-by-Step Details

1. The system checks each configured field for an invalid (unrecognised) value.
2. For any field with an invalid value, the system displays message **497**: *"Invalid [Field Name]."*
3. The save operation is blocked. The user must select a valid value and attempt to save again.

The following fields are subject to invalid-value checks:

| Field | Condition for check to apply |
|-------|------------------------------|
| Sex | Option `PATIENT_SEX_MANDATORY` enabled |
| Age Unit | No Date of Birth entered **and** an Age value other than 0 has been entered |
| Patient Category | Always (when field is active) |

**Race** has a separate invalid-value check that displays message **1494** instead of 497 when an unrecognised race value is entered.

---

### Scenario 3: Range and Format Checks

#### Prerequisites

- The user has clicked Save.
- A date, time, or numeric field contains a value that is outside the permitted range or is not in the correct format.

#### Step-by-Step Details

1. The system evaluates each date, time, and numeric field against its permitted bounds and format rules.
2. For any violation, the system displays message **497** with the relevant field name.
3. The save operation is blocked. The user must correct the field value and attempt to save again.

The following fields are subject to range and format checks:

| Field | Rule | Message |
|-------|------|---------|
| Age | Must be 0 or greater (no negative ages) | 497 |
| Date of Birth | Must be a valid date | 497 |
| Date of Birth | Must not be a future date | 497 |
| Admission Date/Time | Must be a valid date/time | 497 |
| Admission Date/Time | Must not be a future date/time | 497 |
| Patient Location | Must be a recognised, active location code | 497 |

**Patient Location — inactive location warning:** If the patient location is recognised but flagged as inactive, the system displays message **2514** as a warning. This is a non-blocking prompt; the user is informed of the inactive status but can still proceed.

---

### Scenario 4: Age Value Validation (Post-Save Pipeline)

#### Prerequisites

- All other validations have passed.
- The age value stored internally is a negative number (which can arise in edge cases involving date-of-birth calculation).

#### Step-by-Step Details

1. After all other validations pass, the system performs a final check on the internally computed age value.
2. If the computed age is negative (less than 0), the system displays message **4121**.
3. The user clicks **OK** on the prompt. The save operation is blocked and the user must correct the Date of Birth or Age field.

> **Note:** This check uses message 4121, not 497. It is a separate pipeline step that runs after all field-level validators.

---

## Summary Tables

### Blank / Invalid Check Reference

| Field | Blank → Message | Invalid → Message | Activation Condition |
|-------|----------------|-------------------|---------------------|
| Patient Name | 490 | — | Option `PATIENT_NAME_VALIDATION_ENABLED` + new patient |
| Sex | 490 | 497 | Option `PATIENT_SEX_MANDATORY` enabled |
| Age Unit | 490 | 497 | DOB is blank **and** Age value ≠ 0 |
| Patient Location | 490 | — | Option `PATIENT_LOCATION_IS_MANDATORY` enabled |
| Patient Category | 490 | 497 | Always active |
| Race | — | 1494 | Always active (invalid value only) |

### Range / Format Check Reference

| Field | Check | Message |
|-------|-------|---------|
| Age | Minimum value 0 | 497 |
| Date of Birth | Format validity | 497 |
| Date of Birth | No future dates | 497 |
| Admission Date/Time | Format validity | 497 |
| Admission Date/Time | No future dates | 497 |
| Patient Location | Valid and active location | 497 (invalid) / 2514 (inactive warning) |
| Primary Report Copy Location | Must be populated if primary report copies exist | 490 |
| Computed Age Value | Must be ≥ 0 | 4121 |

---

## Configuration

| Setting | Option Code | Purpose | Effect when enabled | Effect when disabled |
|---------|------------|---------|--------------------|--------------------|
| Patient Location Mandatory | `PATIENT_LOCATION_IS_MANDATORY` | Controls whether Patient Location is required at save time | Patient Location blank check runs (message 490 if empty) | Patient Location blank check skipped |
| Sex Mandatory | `PATIENT_SEX_MANDATORY` | Controls whether Sex is required at save time | Sex blank (490) and invalid (497) checks run; Sex field label shows a required indicator | Sex mandatory checks skipped |
| Patient Name Validation | `PATIENT_NAME_VALIDATION_ENABLED` | Controls whether the Patient Name blank check is applied to new patients | Patient Name blank check runs (message 490) | Patient Name blank check skipped |

**Option group:** `REQUEST_REGISTRATION` (in `LAB_OPTION` table)

---

## Business Rules

1. All blank and invalid-value checks run as part of a single save-time pipeline; the pipeline stops at the first failing check and presents the error to the user.
2. The Age Unit blank/invalid check only activates when no Date of Birth has been entered **and** an Age value other than zero has been entered. If a Date of Birth is present, Age Unit is derived from it and is not separately validated.
3. The Patient Location mandatory check applies to both new and existing patients (it is not limited to new patients, unlike the Patient Name checks).
4. The Patient Category blank and invalid checks are always active regardless of lab options.
5. Race is checked only for invalid values (not blank); a blank race is permitted.
6. An inactive patient location generates a warning (message 2514) that does not block the save; the user is informed but can proceed.
7. The computed age value check (message 4121) is a final pipeline step that runs after all field-level validations pass. It guards against edge cases where date calculations produce a negative age.

---

## Related Workflows

- [[Patient Name Validation on Save]] — Covers the patient name format (comma structure) and length checks, which are part of the same save-time pipeline.
- [[Retrieve Patient by HKID]] — Patient data is loaded into the demographics panel as part of this workflow; the save-time validations described here apply after that data is reviewed and edited.
- [[Create New Patient by HKID]] — New patient flag is set during this workflow, which activates the patient name and length checks described above.
