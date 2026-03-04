# MICR VIRO Panel

## Overview

The MICR/VIRO Panel is a lab-specific input panel that appears in the Registration screen when a Microbiology (MICR) or Virology (VIRO) lab request is being registered. It collects additional information required for microbiology and virology requests that is not part of the standard registration form. Staff enter specimen type, site, chemotherapy history, and optionally a microbiologist and treatment category. All fields are disabled until a valid request number has been entered.

---

## Related User Stories

- **[[CRST-459]]** — Registration - MICR/VIRO Panel
- **[[CRST-124]]** — Registration - Register MICR/VIRO Request
- **[[CRST-497]]** — Registration - MICR/VIRO Validation

**Epic:** LISP-32 [CRST][DEV] Registration - Special Lab Workflow (MICR/VIRO)

---

## Visual Layout

The panel is approximately 430 pixels wide and sits within the Registration screen as a vertically stacked panel. Fields are arranged top to bottom:

1. **Microbiologist** — dropdown
2. **Specimen Type** — dropdown (required; shortcut key **J**)
3. **Site** — multi-line text area (shortcut key **9**); approximately 150px tall
4. **Chemotherapy used** — multi-line text area; approximately 150px tall
5. **Treatment Category** — dropdown; shown only when configured to be visible

---

## Buttons and Actions

This panel contains no buttons. All interaction is through the input fields described below.

---

## Fields

### Microbiologist

| Property | Detail |
|----------|--------|
| Label | Microbiologist |
| Keyboard shortcut | **G** (tilde on label) |
| Type | Editable dropdown |
| Options | Loaded from the MICR/VIRO lab keyword list for microbiologists; no default selection |
| Required | No |

### Specimen Type

| Property | Detail |
|----------|--------|
| Label | Specimen Type |
| Keyboard shortcut | **J** |
| Type | Editable dropdown |
| Options | Loaded from the MICR/VIRO lab keyword list for specimen types; no default selection |
| Required | Yes |

> In certain contexts (e.g., when auto-fill is active from a previous registration record), the Specimen Type may be pre-selected automatically. When in display-only mode, a read-only text field replaces the dropdown.

### Site

| Property | Detail |
|----------|--------|
| Label | Site |
| Keyboard shortcut | **9** |
| Type | Multi-line text area |
| Maximum length | 255 characters |
| Required | Yes (required for saving the request) |

### Chemotherapy Used

| Property | Detail |
|----------|--------|
| Label | Chemotherapy used |
| Type | Multi-line text area (antibiotic text area) |
| Maximum length | 255 characters |
| Required | No |

### Treatment Category

| Property | Detail |
|----------|--------|
| Label | Treatment Category |
| Type | Editable dropdown |
| Options | Loaded from the MICR/VIRO lab keyword list for treatment categories; no default selection |
| Required | No |
| When visible | Only when the Treatment Category lab option is enabled (see Configuration) |
| When enabled | Only when a valid request number has been entered **and** the request lab number prefix matches the configured list (see Configuration) |

---

## Field State Matrix

| Screen State | Microbiologist | Specimen Type | Site | Chemotherapy | Treatment Category (if visible) |
|-------------|---------------|--------------|------|--------------|--------------------------------|
| Initial (screen loaded) | Disabled | Disabled | Disabled | Disabled | Disabled |
| Patient Ready (patient identified, no request no.) | Disabled | Disabled | Disabled | Disabled | Disabled |
| Registration Ready (valid request no. entered) | Enabled | Enabled | Enabled | Enabled | Enabled (if lab prefix matches) / Disabled (if prefix does not match) |

---

## Configuration

| Setting | Option Code | Purpose | Effect when enabled | Effect when disabled |
|---------|------------|---------|--------------------|--------------------|
| Treatment Category Visible | `TREATMENT_CATEGORY_VISIBLE` | Controls whether the Treatment Category field is shown on the panel | Field displayed | Field hidden |
| Lab Prefixes to Enable Treatment Category | `LAB_PREFIXS_TO_ENABLE_TREATMENT_CATEGORY` | Comma-separated list of request lab number prefixes for which Treatment Category is editable | Treatment Category enabled for matching prefixes at Registration Ready state | Treatment Category remains disabled for non-matching prefixes even when visible |

---

## Business Rules

1. All MICR/VIRO-specific fields are disabled at screen load and remain disabled until both a patient and a valid request number have been entered.
2. The Specimen Type field is required; the request cannot be saved without a selection.
3. The Site field is required; the request cannot be saved without an entry.
4. The Treatment Category field is only displayed when the `TREATMENT_CATEGORY_VISIBLE` lab option is set. When visible, it is only editable if the entered request number's lab prefix is in the configured list of enabling prefixes.
5. When the Specimen Type is pre-filled from a prior registration record (auto-fill), the field may display as read-only rather than as an editable dropdown.

---

## Related Workflows

- [[Register MICR VIRO Request]] — Describes how the data from this panel is packaged and submitted during the registration save operation.
- [[MICR VIRO Validation]] — Validation rules that apply to this panel's fields before the request is saved.
