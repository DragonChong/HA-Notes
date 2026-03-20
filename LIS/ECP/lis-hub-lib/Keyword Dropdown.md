# Keyword Dropdown

## Overview

The Keyword Dropdown is a shared single-select dropdown field for selecting a value from a system-managed keyword list. Keywords are pre-configured reference data organised into named groups (e.g., `URGENCY`, `SENDOUT`) and optionally scoped to a specific lab. The component loads the relevant keyword entries on mount and presents them as a searchable autocomplete dropdown. The parent form owns the selected value and receives the full keyword record through a callback when the user makes a selection.

This component is used wherever a field must be restricted to a controlled set of terms maintained in the keyword dictionary — for example, urgency levels, sendout destinations, or specimen types.

---

## Visual Layout

The component renders as a single autocomplete input. While the keyword list is being resolved on first render, the component shows a loading placeholder. Once loaded, it displays a standard autocomplete combobox.

- The input width is determined by the surrounding layout (no `width` prop — wrap in a container to control size).
- The dropdown popup width is fixed at the input width by default. An optional `popperWidth` prop overrides this to a specific CSS width value (e.g., `'300px'` or `'50%'`).
- Each dropdown option displays the keyword's **description** text.

---

## Interaction Behaviours

#### User opens the dropdown
The full filtered keyword list for the configured group and lab number is shown. Options are displayed in the order returned by the keyword dictionary (insertion / display order).

#### User types in the input
The dropdown filters to show only options whose **description** starts with (or contains) the typed text. Matching is handled by the underlying autocomplete control.

#### User selects an option
The input displays the selected keyword's **description**. The `getCurrentKeyword` callback fires with the full keyword record object. The parent is responsible for storing the selection.

#### Parent passes `value={null}` or clears the value prop
The input is cleared and shows no selection.

#### Data changes (group or labNo prop changes)
The component re-fetches the keyword list automatically and resets the displayed options. The currently selected value is not automatically cleared — the parent must reset `value` if needed.

---

## Keyword Resolution Rules

The component filters the keyword dictionary using these rules:

| Condition | Behaviour |
|-----------|-----------|
| `labNo = null` | Returns all active keywords matching `group`, regardless of lab number |
| `labNo = 7` or `labNo = 8` | Uses recursive group expansion — keyword entries may reference sub-groups via a forwarding field, building a flattened list from a nested hierarchy |
| Any other `labNo` | Returns active keywords where both `group` and `labNo` match exactly |

---

## Props Reference

| Prop | Type | Required | Default | Purpose |
|------|------|----------|---------|---------|
| `dataSource` | `object` | Yes | — | The application keyword dictionary object (typically the `Dictionary` from the global dictionary store). Must be passed in by the parent — the component does not fetch it independently |
| `group` | `string` | Yes | — | The keyword group code to filter by (e.g., `'URGENCY'`, `'SENDOUT'`). Changing this prop triggers a reload |
| `labNo` | `number \| null` | Yes | — | The lab number to scope the keyword list. Pass `null` for lab-independent (global) keywords |
| `value` | `any` | No | `undefined` | The currently selected keyword object (controlled). Pass `null` or `undefined` to show an empty selection |
| `disabled` | `boolean` | No | `false` | When `true`, the dropdown is read-only and cannot be interacted with |
| `popperWidth` | `string` | No | — | A CSS width string (e.g., `'300px'`, `'50%'`) to override the dropdown popup width. When omitted, the popup matches the input width |
| `getCurrentKeyword` | `(value: any) => void` | No | — | Callback fired when the user selects an option. Receives the full keyword record object |

---

## Keyword Record Fields

When a selection is made, `getCurrentKeyword` receives an object with the following fields:

| Field | Description |
|-------|-------------|
| `key` | Unique numeric identifier (ckey) for the keyword entry |
| `groupCode` | The keyword group this entry belongs to |
| `labno` | The lab number this keyword is scoped to |
| `description` | The human-readable label displayed in the dropdown |
| `enterCode` | The short entry code for the keyword (used for programmatic lookup) |
| `alpha1` | Auxiliary code field 1 |
| `alpha2` | Auxiliary code field 2 (used as sub-group pointer in recursive groups) |
| `keyDisplay` | Display flag controlling visibility |
| `displayType` | Numeric display type category |
| `active` | Whether the keyword entry is currently active |

---

## Configuration

The keyword list content is entirely driven by the keyword dictionary loaded into the application on startup. There are no component-level configuration options beyond the props above.

| Setting | Source | Effect |
|---------|--------|--------|
| Keyword dictionary | Application-level dictionary store (`window.$lisHubApp`) | Provides all keyword groups and entries; must be initialised before the component renders |
| Active flag | Per keyword entry in the dictionary | Only entries with `active = true` are included in the dropdown list |

---

## Data Saved

This component is read-only in terms of persistence — it does not write data to the database. The parent form is responsible for reading the selected keyword from the `getCurrentKeyword` callback and including it in the form submission payload.

---

## Related Workflows

- [[CRS Registration Workflow]] — Keyword dropdowns are used for coded fields such as urgency and specimen type during request registration.
- [[CRS Spec-Ack Workflow]] — Keyword dropdowns appear in specimen acknowledgement forms for result and action codes.
