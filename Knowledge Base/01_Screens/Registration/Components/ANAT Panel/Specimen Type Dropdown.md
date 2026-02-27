# Specimen Type Dropdown

## Overview

The **Spec Type** dropdown appears on the ANAT Panel of the Manual Registration screen. It allows registration staff to select the specimen type for an ANAT lab request. The field is only enabled when the assigned request number's bench code matches the list of bench codes configured in the Specimen Type Bench lab option. When a test is subsequently selected, the field may be automatically populated with a default specimen type if one is configured for that test.

---

## Related User Stories

- **[[CRST-591]]** - Registration - ANAT Panel - Spec Type

**Epic:** LISP-30 [CRST][DEV] Registration - Special Lab Workflow (ANAT)

---

## Key Concepts

### Specimen Type Bench Matching
Enablement of the **Spec Type** dropdown is driven by comparing the bench code of the assigned request number against a list of bench codes stored in the `SPECIMEN_TYPE_BENCH` lab option. If the request's bench code appears in that list, the field is enabled; otherwise it remains disabled.

### Specimen Type Data Source
The dropdown list is populated from the `AP_KEYWORD` table where `key_group = 'REG_SPEC_TYPE'`. Each entry displays its description (`key_desc`) and code (`key_code`). Entries are sequenced by `key_seq`.

> **Rule:** If an `AP_KEYWORD` entry has `key_code = 'NIL'`, the Spec Type field is treated as blank (no type selected) by default.

---

## Visual Layout

The **Spec Type** dropdown is displayed within the ANAT Panel. It is always visible once the ANAT Panel is active. Its enabled/disabled state depends on the bench code match described above.

---

## Field Behaviour

### On Request Number Assignment — Bench Code Matches Option Setting

When an ANAT request number is assigned and its bench code matches one of the codes in the `SPECIMEN_TYPE_BENCH` option:

1. The **Spec Type** dropdown becomes **enabled**.
2. The dropdown is **blank by default** (no specimen type pre-selected) unless a default is configured for the selected test (see below).
3. The user may expand the dropdown to see all available specimen types and select one.

### On Request Number Assignment — Bench Code Does Not Match (or Option Has No Bench Codes Configured)

When the request's bench code does not appear in the `SPECIMEN_TYPE_BENCH` option, or the option text is empty:

1. The **Spec Type** dropdown remains **disabled**. The user cannot make a selection.

### On Test Selection — Default Specimen Type

When the user selects a test and the `DEFAULT_SPECTYPE_BY_TEST` lab option has a mapping for that test code:

1. The system automatically sets the **Spec Type** dropdown to the configured default specimen type for that test.
2. The staff may change this pre-selected value if required.

---

## Dropdown List Contents

| Column | Content |
|---|---|
| Description | `AP_KEYWORD.key_desc` |
| Code | `AP_KEYWORD.key_code` |

Items are ordered by `AP_KEYWORD.key_seq`.

---

## Enablement Rules

| Condition | Spec Type Dropdown State |
|---|---|
| Initial (no request number assigned) | Disabled |
| Patient ready (patient loaded, no request number) | Disabled |
| Ready — bench code matches `SPECIMEN_TYPE_BENCH` option | **Enabled** |
| Ready — bench code does not match, or option has no bench codes | Disabled |

---

## Configuration

| Setting | Option Code | Purpose | Effect when configured | Effect when not configured |
|---------|------------|---------|------------------------|---------------------------|
| Specimen Type Bench | `SPECIMEN_TYPE_BENCH` *(option_group: REQUEST_REGISTRATION)* | Defines which bench codes enable the Spec Type dropdown | Dropdown enabled for matching bench codes | Dropdown always disabled |
| Default Spec Type by Test | `DEFAULT_SPECTYPE_BY_TEST` *(option_group: REQUEST_REGISTRATION)* | Maps specific test codes to a default specimen type | Spec Type is auto-populated when matching test is selected | No auto-population; field starts blank |

---

## Related Workflows

- [[Path Tech Dropdown]] — Part of the same ANAT Panel; test selection may affect both the Spec Type default and the Coroner checkbox default.
- [[Coroner Test Checkbox]] — Selecting a test can simultaneously trigger a default Spec Type and auto-check the Coroner checkbox.
- [[Specimen Collect Time Unknown Checkbox]] — Part of the same ANAT Panel and shares the same registration state lifecycle.
