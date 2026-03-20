# Doctor Input (Single)

## Overview

The Doctor Input (Single) is a shared input field with an attached dropdown lookup that allows the user to search for and select a single doctor by code or name. Unlike the two-field Doctor Input (with Hospital), this component presents only one input — the doctor field — with no hospital context. It is suited to forms where hospital filtering is either unnecessary, already applied externally, or handled by surrounding fields.

The component displays an optional label above the input. When the user types in the field, the dropdown filters the full doctor list in real time, matching against both doctor code and doctor name. When the user selects an entry from the dropdown, the input is populated with the doctor code and the full doctor record is stored internally for retrieval via the ref API.

---

## Visual Layout

The component renders as a vertical stack:

- An optional text label displayed above the input (shown only when the `label` prop is provided)
- A single text input with a dropdown popup

The input width and dropdown popup width are independently configurable. The dropdown displays a multi-column table of matching doctors.

---

## Dropdown Lookup Table

When the dropdown opens, the following columns are shown for each matching doctor entry:

| Column | Data Displayed | Default Visible |
|--------|---------------|-----------------|
| Code | Doctor code | Yes |
| Name | Doctor's full name | Yes |
| Type | Doctor category / display type | Yes |
| Address | Doctor's address | Yes |
| Hospital | Hospital the doctor belongs to | Yes |
| Specialty | Specialty the doctor belongs to | Yes |
| Phone | Doctor's contact phone number | Yes |

Rows are sorted by **Code** ascending. All columns are visible by default (no horizontal scrolling required).

---

## Interaction Behaviours

#### User types in the input field
The dropdown filters the full doctor list in real time. Rows are matched where the doctor **Code** or **Name** starts with the typed text (case-insensitive). The `onDoctorChange` callback fires with the current typed string on every keystroke.

#### User clears the input field
The dropdown shows the unfiltered list. The `onDoctorChange` callback fires with `null` to signal that the field has been cleared.

#### User selects a row from the dropdown
The input is populated with the selected doctor's **Code**. The full `LocationDictionaryVo` record is stored internally. The `onDoctorChange` callback fires with the selected doctor code. `getDataSource()` subsequently returns the selected record.

#### User types without selecting from the dropdown and moves focus away
The input retains the typed text as-is. No blur validation occurs — there is no inline error state. `getDataSource()` returns the last item that was explicitly selected from the dropdown (which may be stale or `null` if never selected).

> **Note:** `getDataSource()` only reflects an explicit dropdown selection. If the value is set programmatically via `setDoctor()` or typed manually without a dropdown pick, `getDataSource()` returns the last selected record, not a lookup of the current text.

---

## Props Reference

| Prop | Type | Required | Default | Purpose |
|------|------|----------|---------|---------|
| `label` | `string` | No | — | Text label displayed above the input |
| `width` | `number` | No | `200` | Width of the text input in pixels |
| `popperWidth` | `number` | No | `700` | Width of the dropdown popup in pixels |
| `locationDisabled` | `boolean` | No | `false` | When `true`, the input is disabled and the user cannot interact with it |
| `onDoctorChange` | `(data: string \| null) => void` | No | — | Callback fired when the input value changes; receives `null` when the field is cleared, or the current string value otherwise |
| `inDefaultHospital` | `string` | No | — | Reserved — accepted in the interface but not applied in the current implementation |
| `hospitalDisabled` | `boolean` | No | — | Reserved — accepted in the interface but not applied in the current implementation |
| `specialtyDisabled` | `boolean` | No | — | Reserved — accepted in the interface but not applied in the current implementation |

---

## Ref Methods

The component exposes the following methods via a React ref of type `ListDoctorSingleBoxInstance`.

| Method | Signature | Description |
|--------|-----------|-------------|
| `getDoctor` | `() => string` | Returns the current text in the input field (the raw typed or set value) |
| `getDataSource` | `() => LocationDictionaryVo \| null` | Returns the full data record of the last item explicitly selected from the dropdown; returns `null` if no dropdown selection has been made |
| `setDoctor` | `(doctor: string) => void` | Programmatically sets the input text; does not trigger `onDoctorChange` and does not update the internal `getDataSource()` record |

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

---

## Configuration

The component loads its doctor data from the application-level dictionary (`window.$lisHubApp`), which is populated on startup. No additional configuration is required.

| Setting | Source | Effect |
|---------|--------|--------|
| Doctor dictionary data | Application-level dictionary (`window.$lisHubApp`) | Provides the full list of active doctors available for lookup; must be initialised before the component renders |

---

## Data Saved

This component is read-only in terms of persistence — it does not write data to the database directly. The parent form is responsible for reading the selected doctor code via `getDoctor()` or the full record via `getDataSource()` and submitting it as part of the form payload.

---

## Related Workflows

- [[CRS Registration Workflow]] — Doctor Input (Single) is used in registration forms where a referring or ordering doctor must be assigned without hospital context.
- [[Location Input]] — Sibling component for location selection; follows the same ref-based API pattern.
- [[Doctor Input (with Hospital)]] — The two-field variant (`LisDoctorBox`) that adds a Hospital selector and filters the doctor list to the selected hospital.
