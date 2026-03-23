---
tags:
  - lis-hub-lib
  - component
---
# Doctor Input (with Hospital)

## Overview

The Doctor Input (with Hospital) is a shared two-field input component that allows the user to search for and select a doctor in the context of a specific hospital. It presents a **Hospital** field and a **Doctor** field side by side. When a hospital is selected, the doctor dropdown is automatically filtered to show only doctors belonging to that hospital. It is suited to forms where both the referring hospital and the specific doctor must be captured together, and where hospital context determines which doctors are valid choices.

The component performs inline validation when focus leaves either field. If the hospital code is not recognised, a warning message is shown and the field is cleared. If the doctor code is not found within the specified hospital, an error message is shown. If only one matching doctor exists for the entered code, the component auto-fills both fields with the canonical values from the dictionary.

---

## Visual Layout

The component renders as a horizontal row containing two input fields:

- **Hospital** field on the left — accepts a hospital code and displays a filterable dropdown of all hospitals
- **Doctor** field on the right — accepts a doctor code and displays a filterable dropdown of doctors, pre-filtered to the selected hospital

Both fields share the same configurable width and dropdown popup width. The two fields are separated by a small horizontal gap. Each field opens its own dropdown table on focus or type.

---

## Dropdown Lookup Tables

### Hospital Dropdown

| Column | Data Displayed | Default Visible |
|--------|---------------|-----------------|
| Code | Hospital code | Yes |
| Name | Hospital name | Yes |

Rows are filtered in real time as the user types, matching against **Code** or **Name**. All columns are visible by default.

### Doctor Dropdown

| Column | Data Displayed | Default Visible |
|--------|---------------|-----------------|
| Code | Doctor code | Yes |
| Name | Doctor's full name | Yes |
| Type | Doctor category / display type | Yes |
| Address | Doctor's address | Yes |
| Hospital | Hospital the doctor belongs to | Yes |
| Specialty | Specialty the doctor belongs to | Yes |
| Phone | Doctor's contact phone number | Yes |

Rows are filtered in real time as the user types, matching against **Code** or **Name**, and are additionally pre-filtered to doctors belonging to the currently selected hospital. If no hospital is selected, the filter defaults to the user's default hospital (from the current session context). All columns are visible by default.

---

## Interaction Behaviours

#### User selects a hospital from the Hospital dropdown
The doctor dropdown filter is updated to show only doctors belonging to the selected hospital. The Host field is populated with the hospital code.

#### User clears the Hospital field
The doctor dropdown filter is removed. The dropdown will fall back to filtering by the user's default hospital from the session context.

#### User types an unrecognised hospital code and moves focus away
Validation runs on blur. If the code does not match any hospital in the dictionary, message **0001493** is shown and the Hospital field is cleared.

#### User types a valid hospital code and moves focus away
If the code is recognised, the Hospital field is retained. Doctor validation is then re-run against the new hospital value.

#### User selects a doctor from the Doctor dropdown
The Doctor field is populated with the selected doctor's code. The selected `LocationDictionaryVo` record is stored internally and can be retrieved via `getDataSource()`.

#### User types a doctor code and moves focus away (single match found)
If exactly one matching doctor is found in the dictionary for the entered code and current hospital, validation succeeds. The Hospital and Doctor fields are auto-filled with the canonical hospital and doctor code from the matched dictionary entry.

#### User types a doctor code and moves focus away (no match found)
Message **0004095** is shown, displaying the combined hospital/doctor code string. The Doctor field is not cleared automatically.

#### User types a doctor code and moves focus away (multiple matches found for the same code across hospitals)
Message **0004101** is shown, indicating that the doctor code is ambiguous. The Doctor field is cleared.

> **Note:** Message 0004101 (multiple doctor ambiguity) is only triggered when the component is operating in a mode where hospital-filtering of doctors has not yet been established. In normal two-field operation, the hospital context prevents ambiguous matches.

---

## Props Reference

| Prop | Type | Required | Default | Purpose |
|------|------|----------|---------|---------| 
| `width` | `number` | No | — | Width in pixels applied to both the Hospital and Doctor input fields |
| `popperWidth` | `number` | No | — | Width in pixels of the dropdown popup for both fields |
| `hospitalDisabled` | `boolean` | No | `false` | When `true`, the Hospital field is disabled and cannot be edited |
| `doctorDisabled` | `boolean` | No | `false` | When `true`, the Doctor field is disabled and cannot be edited |
| `inDefaultHospital` | `string` | No | — | Reserved — accepted in the interface but not applied in the current implementation |
| `customDoctorModifiedFunction` | `() => void` | No | — | Reserved callback — accepted but not currently invoked |
| `customDoctorModifyFailedFunction` | `() => void` | No | — | Reserved callback — accepted but not currently invoked |

---

## Ref Methods

The component exposes the following methods via a React ref of type `ListDoctorBoxInstance`.

| Method | Signature | Description |
|--------|-----------|-------------|
| `getDoctor` | `() => string` | Returns the current text in the Doctor field (the raw typed or set value) |
| `gethospitalValue` | `() => string` | Returns the current text in the Hospital field (the raw typed or set value) |
| `getDataSource` | `() => LocationDictionaryVo \| null` | Returns the full data record of the last doctor explicitly selected from the dropdown, provided the stored record's hospital and code match the current field values; otherwise searches `allRows` for a matching entry; returns `null` if either field is empty or no match is found |
| `setDoctor` | `(doctor: string) => void` | Programmatically sets the Doctor field text; does not trigger validation or update the internal `getDataSource()` record |
| `setHospital` | `(hosp: string) => void` | Programmatically sets the Hospital field text; does not trigger validation or update the doctor filter |

### `LocationDictionaryVo` Fields (relevant to doctors)

| Field | Description |
|-------|-------------|
| `code` | Doctor code |
| `name` | Doctor name |
| `hospital` | Hospital the doctor belongs to |
| `specialty` | Specialty the doctor belongs to |
| `address` | Doctor's address |
| `phone` | Doctor's phone number |
| `displayType` | Display type label |

> **Note on `getDataSource()` behaviour:** The method first checks whether the currently stored selected record still matches both the current Hospital and Doctor field values. If not, it performs a linear search through the full doctor list (`allRows`) to find a matching entry. If either field is empty, `null` is returned immediately.

---

## Error Messages

| Message Code | Description | Trigger | User Options |
|---|---|---|---|
| 0001493 | Invalid hospital code notice | Hospital field value does not match any hospital in the dictionary on blur | Dismiss (OK); Hospital field is cleared |
| 0004095 | Doctor not found for hospital/doctor combination | Doctor field value does not match any doctor for the current hospital on blur | Dismiss (OK); Doctor field is NOT cleared |
| 0004101 | Doctor code is ambiguous (multiple hospitals match) | Doctor code maps to more than one doctor record when hospital filtering is inactive | Dismiss (OK); Doctor field is cleared |

---

## Configuration

The component loads all doctor and hospital data from the application-level dictionary (`window.$lisHubApp`), which is populated on application startup. No explicit configuration is required in the component itself.

| Setting | Source | Effect |
|---------|--------|--------|
| Hospital dictionary | Application-level dictionary (`window.$lisHubApp`) | Provides the full list of hospitals for the Hospital dropdown and validation |
| Doctor dictionary | Application-level dictionary (`window.$lisHubApp`) | Provides the full list of doctors for the Doctor dropdown and validation |
| Default hospital | Session service parameters (`window.$lisHubApp.getServiceParams().hospital`) | Used as the default hospital filter for the Doctor dropdown when no hospital has been entered in the Hospital field |

---

## Data Saved

This component is read-only in terms of persistence — it does not write data to the database directly. The parent form is responsible for reading the selected values via `getDoctor()`, `gethospitalValue()`, or `getDataSource()` and submitting them as part of the form payload.

---

## Related Workflows

- [[Doctor Input (Single)]] — The single-field variant of this component, used when hospital context is not required.
- [[Location Input]] — Sibling component following the same ref-based API pattern, used for location (ward/clinic) selection with optional hospital and specialty filtering.
