# Constant Dropdown

## Overview

The Constant Dropdown is a shared single-select dropdown field for selecting a value from the system's constant reference data. Constants are pre-configured coded entries organised into named groups (e.g., `ABO`, `SENDOUT_REQ_UNIT`) and optionally scoped by a format code (e.g., a lab site identifier such as `TKO`). The component loads the relevant constant entries on mount and presents them in a two-column table dropdown — showing both the constant code and its description.

Unlike the [[Keyword Dropdown]], which is scoped by lab number, the Constant Dropdown is scoped by group and an optional format. It is used wherever a field must be restricted to a controlled set of coded constants — for example, blood group types, sendout units, or other lab-specific coded reference values.

---

## Visual Layout

The component renders as a single autocomplete input with a two-column table dropdown.

- The input width is controlled by the `width` prop (CSS string, e.g., `'300px'`). When omitted, the default is approximately `500px`.
- The dropdown popup width is controlled separately via `popperWidth`. When omitted, the popup also defaults to approximately `500px`.
- The input field displays the selected entry's **code** (`constAlpha`).
- The dropdown table shows two columns: **Code** and **Description**.
- While the constant list is being resolved on first render, the component shows a loading placeholder.

---

## Dropdown Lookup Table

| Column | Data Displayed |
|--------|---------------|
| Code | The constant's short code (`constAlpha`) |
| Description | The constant's human-readable description (`constDesc`) |

---

## Interaction Behaviours

#### User opens the dropdown
The full filtered constant list for the configured group and format is shown in the two-column table.

#### User types in the input
The dropdown filters to show only matching entries. Matching is handled by the underlying autocomplete control against the displayed values.

#### User selects an option
The input displays the selected entry's **code** (`constAlpha`). The `getCurrentConstant` callback fires with the full constant record object. The parent is responsible for storing the selection.

#### Parent passes `value={null}` or clears the value prop
The input is cleared and shows no selection.

#### Data changes (group or format prop changes)
The component re-fetches the constant list automatically and resets the displayed options. The parent must reset `value` if the previously selected entry is no longer valid.

---

## Format Filtering Rules

The `format` prop narrows the constant list beyond the group filter:

| `format` prop | Behaviour |
|--------------|-----------|
| Not provided | All constants matching `group` are included, regardless of their `constFormat` value |
| Provided (e.g., `'TKO'`) | Only entries where `constFormat` equals the provided value **or** `constFormat` equals `'0'` are included. A `constFormat` of `'0'` is a universal marker meaning the entry applies to all formats |

> **Note:** Entries with `constFormat = '0'` always appear when a format filter is active. They represent constants that are valid across all format contexts.

---

## Props Reference

| Prop | Type | Required | Default | Purpose |
|------|------|----------|---------|---------|
| `dataSource` | `object` | Yes | — | The application constant dictionary object (typically the `Dictionary` from the global dictionary store). Must be passed in by the parent — the component does not fetch it independently |
| `group` | `string` | Yes | — | The constant group code to filter by (e.g., `'ABO'`, `'SENDOUT_REQ_UNIT'`). Changing this prop triggers a reload |
| `value` | `any` | No | `undefined` | The currently selected constant record (controlled). Pass `null` or `undefined` to show an empty selection |
| `format` | `string` | No | — | An optional format code to further narrow the constant list (e.g., `'TKO'`). When omitted, all constants in the group are shown. When provided, only entries matching the format or with `constFormat = '0'` are shown |
| `disabled` | `boolean` | No | `false` | When `true`, the dropdown is read-only and cannot be interacted with |
| `width` | `string` | No | `'500px'` | A CSS width string for the input component (e.g., `'300px'`, `'100%'`) |
| `popperWidth` | `string` | No | `'500px'` | A CSS width string for the dropdown popup (e.g., `'500px'`, `'50%'`) |
| `getCurrentConstant` | `(value: any) => void` | No | — | Callback fired when the user selects an option. Receives the full constant record object |

---

## Constant Record Fields

When a selection is made, `getCurrentConstant` receives a `ConstantDetailVo` object with the following fields:

| Field | Description |
|-------|-------------|
| `constGroup` | The group this constant belongs to |
| `constAlpha` | The short code for the constant (displayed in the input field) |
| `constDesc` | The human-readable description (displayed in the dropdown table) |
| `constFormat` | The format scope for this constant (`'0'` = universal, otherwise a specific format code) |
| `constType` | Numeric type identifier for programmatic lookup |

---

## Configuration

The constant list content is entirely driven by the constant dictionary loaded into the application on startup. There are no component-level configuration options beyond the props above.

| Setting | Source | Effect |
|---------|--------|--------|
| Constant dictionary | Application-level dictionary store (`window.$lisHubApp`) | Provides all constant groups and entries; must be initialised before the component renders |

---

## Data Saved

This component is read-only in terms of persistence — it does not write data to the database. The parent form is responsible for reading the selected constant from the `getCurrentConstant` callback and including it in the form submission payload.

---

## Related Workflows

- [[CRS Registration Workflow]] — Constant dropdowns are used for coded fields such as blood group and other lab-specific classification values during request registration.
- [[Keyword Dropdown]] — Sibling component for keyword-based selections; scoped by lab number rather than format.
