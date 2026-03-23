---
tags:
  - lis-hub-lib
  - component
---
# Site Combo Box

## Overview

The Site Combo Box (`SiteComboBox`) is a shared searchable dropdown component for selecting one or more anatomical **sites** (specimen collection sites) on a request or result form. It is pre-wired to the LIS dictionary and automatically adapts its available options and interaction mode based on the current lab and bench configuration — no manual data loading or column definition is required by the consuming screen.

The component only renders after its dictionary data has been loaded. Until then it renders nothing, preventing interaction with an empty or stale option list.

---

## Visual Layout

The component renders as a single-line text input with a dropdown popup. The input width and dropdown popup width are independently configurable. A table header row is always shown above the option list.

The dropdown columns and popup width vary by operating mode:

**SNOMED Mode** (standard):
- Popup width: 450 px (default, overridable)
- Four visible columns: Code, Class, Seq, Description

**Free-text (Keyword) Mode**:
- Popup width: adjusts to component default
- One visible column: Description
- Free-text entry (creatable) is enabled — the user can type a value not in the list and confirm it as a new entry

---

## Operating Modes

The component operates in one of two modes, selected automatically at startup based on a lab-level configuration flag.

| Mode | When It Applies | Options Source | Creatable | Dropdown Columns |
|------|----------------|---------------|-----------|-----------------|
| SNOMED Mode | Default; `TEXT` option is not enabled for APS lab | Active SNOMED codes prefixed with `T`, sorted alphabetically then re-sorted by bench priority | No | Code, Class, Seq, Description |
| Free-text (Keyword) Mode | `TEXT` option is enabled for APS lab (`SPECIMEN / TEXT` option value = 1) | AP keyword entries matching the `REG_SPEC_NATURE` group for the configured bench code | Yes | Description only |

> **Note:** The component is only active for the **APS lab (lab 5)** and the **CRS lab (lab 9)**. If the current session's request lab is neither of these, the component renders as an empty state immediately with no options loaded and no dictionary access attempted.

---

## Dropdown Lookup Table — SNOMED Mode

| Column | Data Displayed | Width |
|--------|---------------|-------|
| Code | SNOMED code (T-prefixed) | 80 px |
| Class | SNOMED class identifier | 50 px |
| Seq | SNOMED sequence number | 50 px |
| Description | SNOMED site description | 180 px |

**Sort order:** Entries for which a bench-specific priority exists (from the `REG_SPEC_NATURE` keyword group for the configured `bench`) are sorted first in priority order. All remaining entries are sorted alphabetically by Description.

---

## Dropdown Lookup Table — Free-text (Keyword) Mode

| Column | Data Displayed |
|--------|---------------|
| Description | Site keyword description, sorted alphabetically |

---

## Interaction Behaviours

#### User types in the input field
The dropdown filters the option list in real time, matching against the label field — **Description** in both modes, or **Code** in SNOMED mode if configured.

#### User selects an option from the dropdown
The selected value(s) are stored and reported via the `onChange` callback.

#### User types a value not in the list (Free-text Mode only)
The typed value is accepted as a new creatable entry. The `onChange` callback fires with the new value. This is only available when the lab is configured for free-text site entry.

#### User clears the field
The selection is removed. `onChange` fires with an empty value.

---

## Props Reference

`SiteComboBox` accepts the following props. All standard `ComboTableBox` props are also accepted except `labelField`, `columns`, `disableCreatable`, `showTableHeader`, and `data`, which are managed internally.

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `bench` | `string` | No | — | The bench code used to filter and prioritise site options from the `REG_SPEC_NATURE` keyword group. Required when operating in Free-text Mode; recommended in SNOMED Mode for correct priority ordering |
| `value` | `any \| any[]` | No | — | Controlled selected value or array of values |
| `onChange` | `(event, value) => void` | No | — | Callback fired when the selection changes; receives the synthetic event and the new selected value(s) |
| `multiple` | `boolean` | No | `true` | When `true` (default), allows selecting multiple sites; when `false`, restricts to single selection |
| `width` | `number` | No | — | Width of the text input in pixels |
| `popperWidth` | `number` | No | `450` (SNOMED) / component default (Free-text) | Width of the dropdown popup in pixels; overrides the mode default |
| `disabled` | `boolean` | No | `false` | When `true`, the input is disabled |
| `size` | `"small" \| "medium"` | No | `"medium"` | Size variant of the text input |
| `allSortable` | `boolean` | No | `false` | When `true`, all dropdown columns are made sortable by the user |
| `TextFieldProps` | `object` | No | — | Additional props forwarded to the underlying text field (e.g. `placeholder`) |

---

## Configuration

The component's operating mode is determined entirely at runtime from the application-level dictionary. No component-level configuration is needed.

| Setting | Source | Effect |
|---------|--------|--------|
| Free-text mode flag | `OptionValueDetailVo` dictionary — entry where `group = SPECIMEN`, `code = TEXT`, `labNo = APS lab (5)`, `value = 1` | When present and enabled, the component switches to Free-text (Keyword) Mode |
| Site options (SNOMED Mode) | `SnomedVo` dictionary — active entries with a T-prefixed SNOMED code | Provides the full option list in standard mode |
| Site options (Free-text Mode) | `ApKeywordVo` dictionary — entries where `keyGroup = REG_SPEC_NATURE` and `keyCode` matches the configured bench | Provides the keyword-based option list in free-text mode |
| Bench priority ordering | `ApKeywordVo` dictionary — `REG_SPEC_NATURE` entries for the configured bench | Determines the order in which SNOMED entries appear at the top of the list |
| Active lab | Session service parameters (`window.$lisHubApp.getServiceParams().requestLab`) | Must be APS (5) or CRS (9); component renders empty for all other labs |

---

## Data Saved

This component is read-only in terms of persistence — it does not write to the database directly. The parent form reads the selected site value(s) via the `onChange` callback or the controlled `value` prop and includes them in the form submission payload.

---

## Related Workflows

- [[Keyword Dropdown]] — Sibling component for keyword-based dropdowns; `SiteComboBox` uses the same underlying `ApKeywordVo` dictionary in Free-text Mode.
- [[APS Result Entry]] — `SiteComboBox` is used in the APS result entry basic form to capture the specimen collection site.
- [[CRS Acknowledgment Panel]] — `SiteComboBox` is used in the APS acknowledgment panel for site selection on the registered request.
