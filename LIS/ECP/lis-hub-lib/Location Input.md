# Location Input (LisLocationBox)

## Overview

The Location Input is a composite field group used to capture a patient's or request's clinical location. It presents up to three interconnected dropdown fields — **Hospital**, **Specialty**, and **Location** — as a single horizontal unit. The three fields have a cascading relationship: selecting a hospital filters the available specialties and locations; selecting a location automatically back-fills the corresponding hospital and specialty fields. Each field is individually configurable as visible or disabled, so parent screens can show only the fields relevant to their workflow.

The component is available from `@lis/lis-hub-lib` as `LisLocationBox`.

---

## Component Modes

The three fields operate as a group but can be shown or hidden independently via props. Common configurations used by parent screens:

| Configuration | Hospital | Specialty | Location | Typical Use Case |
|---|---|---|---|---|
| Full (all three) | Visible | Visible | Visible | Registration screens requiring full location capture |
| Hospital + Location | Visible | Hidden | Visible | Screens where specialty is irrelevant or pre-determined |
| Location only | Hidden | Hidden | Visible | Screens where hospital context is already known |
| Disabled hospital | Disabled | Enabled | Enabled | Pre-filled registration where hospital cannot be changed |

---

## Visual Layout

The component renders as a horizontal row of fields (`Stack direction="row"`). Each visible field is wrapped with a label above it:

- **Hospital** — text field with autocomplete dropdown; label "Hospital"
- **Specialty** — text field with autocomplete dropdown; label "Specialty"
- **Location** — text field with autocomplete dropdown; label "Location"

Each field has a placeholder of "search..." inside the input. All three fields are independently scrollable in their dropdowns; the dropdown list width defaults to 700px and the input width defaults to 200px, both configurable via props.

Fields that are hidden via `hospitalDisplay`, `specialtyDisplay`, or `locationDisplay` props are not shown in the layout.

---

## Interaction Behaviours

#### User types in any field

The dropdown filters in real time as the user types, matching against location code or name. Filtering is case-insensitive.

#### User selects a Hospital from the dropdown

- The Hospital field updates with the selected hospital code.
- The Specialty and Location dropdown lists are immediately re-filtered to show only entries belonging to that hospital.
- If the hospital already had a different value, the Specialty and Location fields are cleared.

#### User selects a Specialty from the dropdown

- The Specialty field updates with the selected specialty code.
- The Hospital field is also updated to the hospital associated with that specialty entry.

#### User selects a Location from the dropdown

- The Location field updates with the selected location code.
- The Hospital and Specialty fields are back-filled automatically from the selected location's associated data.
- The full `LocationDictionaryVo` object for that selection is stored internally, making it available via `getDataSource()`.

#### User types a value manually and leaves the Hospital field (blur)

The entered value is validated against the location dictionary. If no matching hospital code is found, error message **1493** is displayed with the entered value as a parameter, and the Hospital field is cleared. If the value is valid and different from the previous value, Specialty and Location are cleared to force re-selection for the new hospital.

#### User types a value manually and leaves the Specialty field (blur)

If a hospital is selected and the typed specialty code does not exist for that hospital, error message **1493** is displayed and the Specialty field is cleared.

#### User types a value manually and leaves the Location field (blur)

The location code is validated against the dictionary, filtered by the current hospital. If validation fails and the typed value does not match the currently selected row, error message **1493** is displayed and the Location field is cleared. If a unique match is found, the Hospital and Specialty fields are automatically set from that location's data.

#### Specialty is left empty

Specialty is optional. The component does not require a specialty value in order for `getDataSource()` to return a result — only Hospital and Location are required.

---

## Buttons and Actions

This component has no built-in buttons. It is composed entirely of filterable text fields with autocomplete dropdowns. All user actions are driven by typing, dropdown selection, and field blur events.

---

## Configuration

| Setting | Prop | Default | Effect |
|---|---|---|---|
| Default hospital pre-fill | `inDefaultHospital` | Current session hospital | Specialty and Location dropdowns initially filter by this hospital when no hospital has been explicitly selected |
| Input field width | `width` | 200px | Width in pixels applied to all three input fields |
| Dropdown list width | `popperWidth` | 700px | Width in pixels of the dropdown list panel for all three fields |
| Show/hide Hospital field | `hospitalDisplay` | `false` (hidden) | `true` = field is visible |
| Show/hide Specialty field | `specialtyDisplay` | `false` (hidden) | `true` = field is visible |
| Show/hide Location field | `locationDisplay` | `false` (hidden) | `true` = field is visible |
| Disable Hospital field | `hospitalDisabled` | `false` | `true` = field is rendered but non-interactive |
| Disable Specialty field | `specialtyDisabled` | `false` | `true` = field is rendered but non-interactive |
| Disable Location field | `locationDisabled` | `false` | `true` = field is rendered but non-interactive |

> **Note on `hospitalDisplay` vs `hospitalDisabled`:** In the current source, `hospitalDisabled` is used inconsistently — the `style` prop for the Hospital wrapper checks `hospitalDisabled` instead of `hospitalDisplay`. This may be a known implementation quirk; verify behaviour in the running application when mixing these props.

---

## Error Messages and System Prompts

| Code | Trigger | Parameter | User Options |
|---|---|---|---|
| 1493 | Entered Hospital, Specialty, or Location code does not match any record in the location dictionary | The entered invalid code | OK — dismisses; the invalid field is cleared |

---

## Ref Methods

The component exposes an imperative handle. All parent screens must access values via the ref — there are no `onChange` callbacks for the individual field values.

| Method | Returns | Description |
|---|---|---|
| `gethospitalValue()` | `string` | Returns the current text in the Hospital field |
| `getspecialtyValue()` | `string` | Returns the current text in the Specialty field (may be empty) |
| `getlocationValue()` | `string` | Returns the current text in the Location field |
| `getDataSource()` | `LocationDictionaryVo \| null` | Returns the complete location data object when both Hospital and Location have values; `null` otherwise |
| `setHospital(hosp)` | `void` | Programmatically sets the Hospital field and updates Specialty and Location filtering |
| `setSpecialty(specialty)` | `void` | Programmatically sets the Specialty field |
| `setLocation(location)` | `void` | Programmatically sets the Location field |

`getDataSource()` returns `null` if either Hospital or Location is empty. It searches `allRows` by matching against hospital code, location code, and specialty before returning the full `LocationDictionaryVo`.

---

## Data Saved

This component does not write data to the database. It collects a location selection and exposes it to the parent screen via ref methods. The parent screen is responsible for reading the values using `getDataSource()` (for the full object) or the individual getter methods, and for any subsequent data submission.

---

## Related Workflows

- [[CRS Registration Workflow]] — The Location Input is used to capture the requesting ward, clinic, or office during request registration.
- [[CRS Request Retrieval Workflow]] — Location context may be pre-filled when retrieving a request associated with a known ward.
