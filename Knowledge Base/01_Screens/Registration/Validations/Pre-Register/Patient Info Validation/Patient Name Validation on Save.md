# Patient Name Validation on Save

## Overview

When a registration is saved for a new patient, the system validates the **Patient Name** field against two independent checks: a format check that enforces comma-separated name structure, and a length check that enforces a maximum character count. The format check is controlled by a lab option and produces a **bypassable warning** — the user can choose to proceed or correct the name. The length check is always active for new patients and is a **hard stop** that must be corrected before saving can continue.

These checks exist to ensure that patient names are recorded in a consistent, parseable format and do not exceed the bounds of the underlying data storage.

---

## Related User Stories

- **[[CRST-532]]** - Registration - Pre-register: Patient Info Validation - Patient Name

**Epic:** LISP-27 [CRST][DEV] Registration - Register Workflow

**Related:** [[CRST-531]] — Patient Info Validation - Mandatory & Validity (covers other patient demographic fields validated at save time)

---

## Key Concepts

### New Patient
A patient whose record does not yet exist in the local patient database. Both the format check (when the option is enabled) and the length check apply **only to new patients**.

### Warning Validator vs. Hard-Stop Validator
The format check (messages 1564–1568) is a **warning**: it prompts the user with a Yes/No question, allowing them to proceed with a non-conforming name if they choose. The length check (message 3528) is a **hard stop**: it prompts an OK-only error and prevents saving until the name is corrected.

### Symbol Characters
For the purposes of patient name validation, "invalid characters" (symbols) are defined as any character that is not a letter (A–Z, a–z) or a space. Specifically, the validation accepts only alphabetic characters and spaces in each part of the name (before and after the comma).

---

## Trigger Point

Both validations are triggered as part of the save-time validation pipeline when the user clicks **Save** on the Registration screen, and only when the request is being registered for a **new patient**.

---

## Workflow Scenarios

### Scenario 1: Format Validation (Option-Controlled Warning)

#### Prerequisites

- The lab option `PATIENT_NAME_VALIDATION_ENABLED` is enabled (`option_value = 1`) for the relevant lab.
- The request is being registered for a new patient.
- The patient name entered does not conform to one of the valid format rules.

#### Process Flow

```mermaid
sequenceDiagram
    participant User
    participant Registration Screen
    participant Validation Engine

    User->>Registration Screen: Click Save
    Registration Screen->>Validation Engine: Run save-time validations
    Validation Engine->>Validation Engine: Check Patient Name format
    alt Name format is invalid
        Validation Engine-->>Registration Screen: Format warning (1564/1565/1566/1567/1568)
        Registration Screen->>User: Display "Invalid Patient name." prompt (Yes / No)
        alt User clicks Yes
            User->>Registration Screen: Confirm proceed
            Registration Screen->>Validation Engine: Continue remaining validations
            Validation Engine-->>Registration Screen: Validation complete
            Registration Screen->>User: Registration saved
        else User clicks No
            User->>Registration Screen: Decline proceed
            Registration Screen->>User: Message closed; Patient Name field available for re-editing
        end
    else Name format is valid
        Validation Engine-->>Registration Screen: Format check passed
        Registration Screen->>Validation Engine: Continue remaining validations
    end
```

#### Step-by-Step Details

1. The user clicks **Save**.
2. The system evaluates the **Patient Name** field against the format rules below. This check is only performed if the `PATIENT_NAME_VALIDATION_ENABLED` option is enabled for the current lab and the request is for a new patient.
3. The system identifies the **first** format violation (checks are applied in priority order):
   - **No comma present** → message 1564: *"A comma should be included in the patient name."*
   - **Comma is the first character** → message 1565: *"Comma cannot be the first character."*
   - **More than one comma present** → message 1566: *"More than one comma in the patient name is not allowed."*
   - **Invalid character after the comma** (symbol or non-alphabetic character in the surname portion) → message 1567: *"Invalid character after the comma."*
   - **Invalid character before the comma** (symbol or non-alphabetic character in the given-name portion) → message 1568: *"Invalid character before the comma."*
4. The system displays the applicable warning message headed *"Invalid Patient name."* with a **Yes** and **No** button.
5. **If the user clicks No:** The warning is dismissed. The Patient Name field remains editable so the user can correct the name. The save operation does not proceed.
6. **If the user clicks Yes:** The warning is dismissed and the system continues with the remaining save-time validations. The request is saved with the non-conforming patient name.

> **Note:** Message 4176 (*"There should be a space after the comma."*) is registered in the system as a potential format error but is not currently activated in standard Registration. The comma-space format requirement is not enforced at this time.

---

### Scenario 2: Format Validation Disabled

#### Prerequisites

- The lab option `PATIENT_NAME_VALIDATION_ENABLED` is disabled (`option_value = 0`) for the relevant lab.
- The request is being registered for a new patient.

#### Step-by-Step Details

1. The user clicks **Save**.
2. The system skips the patient name format check entirely.
3. The save operation proceeds to the remaining validations without any patient name format prompt, regardless of whether the name contains commas or symbols.

---

### Scenario 3: Name Length Validation (Hard Stop)

#### Prerequisites

- The request is being registered for a new patient.
- The patient name entered exceeds the maximum permitted length for the relevant lab type.

#### Process Flow

```mermaid
sequenceDiagram
    participant User
    participant Registration Screen
    participant Validation Engine

    User->>Registration Screen: Click Save
    Registration Screen->>Validation Engine: Run save-time validations
    Validation Engine->>Validation Engine: Check Patient Name length
    alt Name exceeds maximum length
        Validation Engine-->>Registration Screen: Length error (3528)
        Registration Screen->>User: Display "Patient Name cannot more than N characters!" (OK only)
        User->>Registration Screen: Click OK
        Registration Screen->>User: Message closed; Patient Name field available for re-editing
    else Name is within maximum length
        Validation Engine-->>Registration Screen: Length check passed
        Registration Screen->>Validation Engine: Continue remaining validations
    end
```

#### Step-by-Step Details

1. The user clicks **Save**.
2. The system counts the characters in the **Patient Name** field and compares the count against the maximum length for the current lab type:
   - **HA Labs:** maximum 48 characters
   - **DH Labs:** maximum 81 characters
3. If the name exceeds the limit, the system displays message 3528: *"Patient Name cannot more than N characters!"* (where N is the applicable maximum).
4. The message has an **OK** button only. The user cannot bypass this check.
5. After the user clicks **OK**, the message is dismissed. The Patient Name field remains editable so the user can shorten the name.
6. The save operation does not proceed until the name length is within the permitted limit.

> **Note:** The name length check is **not** controlled by the `PATIENT_NAME_VALIDATION_ENABLED` option. It is always active for new patients regardless of the option setting.

---

## Summary Tables

### Format Validation Messages (Scenario 1)

| Message | Trigger Condition | Prompt Text | User Options |
|---------|-------------------|-------------|-------------|
| 1564 | Patient name contains no comma | "A comma should be included in the patient name." | Yes (proceed) / No (re-edit) |
| 1565 | Comma is the first character | "Comma cannot be the first character." | Yes (proceed) / No (re-edit) |
| 1566 | More than one comma in the name | "More than one comma in the patient name is not allowed." | Yes (proceed) / No (re-edit) |
| 1567 | Invalid character (symbol) after the comma | "Invalid character after the comma." | Yes (proceed) / No (re-edit) |
| 1568 | Invalid character (symbol) before the comma | "Invalid character before the comma." | Yes (proceed) / No (re-edit) |
| 4176 | No space after the comma | "There should be a space after the comma." | Yes (proceed) / No (re-edit) — *currently not active* |

### Length Validation Messages (Scenario 3)

| Message | Lab Type | Maximum Length | Prompt Text | User Options |
|---------|----------|----------------|-------------|-------------|
| 3528 | HA Lab | 48 characters | "Patient Name cannot more than 48 characters!" | OK (re-edit) |
| 3528 | DH Lab | 81 characters | "Patient Name cannot more than 81 characters!" | OK (re-edit) |

### Validation Activation Summary

| Check | Controlled by Option | Applies To | Bypassable |
|-------|---------------------|------------|-----------|
| Name format (comma structure) | Yes — `PATIENT_NAME_VALIDATION_ENABLED` | New patients only | Yes (user can click Yes to proceed) |
| Name length | No — always active | New patients only | No (hard stop, OK only) |

---

## Configuration

| Setting | Option Code | Purpose | Effect when enabled | Effect when disabled |
|---------|------------|---------|--------------------|--------------------|
| Patient Name Validation | `PATIENT_NAME_VALIDATION_ENABLED` | Controls whether the comma-structure format check is applied to patient names at save time | Format validation runs; warning shown if name does not conform | Format validation skipped; any name format accepted |

**Option group:** `REQUEST_REGISTRATION` (in `LAB_OPTION` table)

> The name length check is **not** controlled by `PATIENT_NAME_VALIDATION_ENABLED`. It is always enforced for new patients.

---

## Business Rules

1. Patient name format validation and length validation apply only when registering a **new patient**. Existing patients retrieved by HKID or encounter number are not subject to these checks.
2. The format check is a warning that can be bypassed: clicking **Yes** allows the registration to proceed with a non-conforming name.
3. The length check is a hard stop: it cannot be bypassed and must be corrected before the registration can be saved.
4. Format checks are applied in priority order. Only the first violation found is shown at a time. If the user corrects the name and saves again, the next violation (if any) will then be shown.
5. "Invalid characters" for the purpose of the format check are any characters that are not letters (A–Z, a–z) or spaces. Both the portion before the comma and the portion after the comma must consist only of letters and spaces.
6. Message 4176 (no space after the comma) is defined in the system but is not currently active in standard Registration — the comma-space format requirement is not enforced.
7. The maximum name length differs by lab type: 48 characters for HA labs and 81 characters for DH labs.

---

## Related Workflows

- [[Patient Info Validation on Save]] — Covers the broader set of patient demographic field validations (Sex, Age Unit, Patient Location, Patient Category, Race, Age, DOB, Admission Date) that run as part of the same save-time pipeline. Patient Name format and length checks are part of this same pipeline.
