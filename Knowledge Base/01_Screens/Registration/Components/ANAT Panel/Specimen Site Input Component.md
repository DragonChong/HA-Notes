# Specimen Site Input Component

## Overview

The Specimen Site Input Component is the dropdown/selection panel that appears when the user interacts with any text field in the Specimen Site area of the ANAT Panel. It provides the list of selectable site descriptions from which the user picks values to populate each Specimen Site field. The component operates in one of two modes — **Freetext mode** or **Non-freetext mode** — controlled by the `TEXT` lab option (SPECIMEN group). In freetext mode the list is sourced from Specimen Nature keywords matched to the current bench; in non-freetext mode the list is sourced from the SNOMED table. When both sources apply, Specimen Nature entries are displayed before SNOMED entries. This component is a companion to the [[Specimen Site Input]] component, which describes the overall Specimen Site area and field management.

---

## Related User Stories

- **[[CRST-603]]** — Registration - ANAT Panel - Specimen Site Input Component
- **[[CRST-602]]** — Registration - ANAT Panel - Specimen Site Input *(freetext area and field management)*

**Epic:** LISP-30 [CRST][DEV] Registration - Special Lab Workflow (ANAT)

---

## Component Modes

| Mode | When It Applies | List Source |
|------|-----------------|-------------|
| Freetext | `TEXT` option value = 1 | Specimen Nature (`AP_KEYWORD`) filtered by bench code |
| Non-freetext | `TEXT` option value = 0 | SNOMED table (`T` codes, active records only) |
| Non-freetext with Specimen Nature | Non-freetext AND bench matched to Specimen Nature bench | Specimen Nature entries first, then SNOMED entries |

---

## Visual Layout

The component appears as a dropdown grid attached to whichever Specimen Site text field the user has focused. The grid is scrollable and supports user-selectable sort order (ascending or descending). The columns displayed depend on the active mode:

- **Freetext mode:** Specimen Nature descriptions only.
- **Non-freetext mode:** Four columns — SNOMED Code, SNOMED Class, SNOMED Seq, and SNOMED Description.
- **Combined mode (non-freetext + bench match):** Specimen Nature entries appear first in the list, followed by SNOMED entries, within the same dropdown grid.

---

## Data Grid / List

### Freetext Mode — Specimen Nature List

| Column | Data Displayed | Default Visible |
|--------|---------------|-----------------|
| Description | Specimen Nature description (`AP_KEYWORD.key_desc`) for the matched bench | Yes |

The list is populated only when the current lab request number prefix matches a bench code that has a corresponding Specimen Nature setup (`AP_KEYWORD.key_group = 'REG_SPEC_NATURE'`, `AP_KEYWORD.key_code = bench code`). If the prefix does not match, the dropdown is empty.

### Non-Freetext Mode — SNOMED List

| Column | Data Displayed | Default Visible |
|--------|---------------|-----------------|
| SNOMED Code | The SNOMED T-code | Yes |
| Class | SNOMED class | Yes |
| Seq | SNOMED sequence | Yes |
| Description | SNOMED description | Yes |

The SNOMED list is filtered to include only:
- Records whose SNOMED code begins with `T` (T-codes only)
- Records where the inactive flag is `N` or null (active records only)

---

## Buttons and Actions

### Sort Toggle

The user can toggle the sort order of the dropdown list between ascending and descending. This is available in both freetext and non-freetext modes.

---

## Selection and Interaction Behaviours

#### User selects a Specimen Nature description (freetext mode)

The selected Specimen Nature description (`AP_KEYWORD.key_desc`) is added to the focused Specimen Site text field. If a default specimen site was already present in that field, it is replaced by the selected description.

#### User selects a SNOMED entry from the list (non-freetext mode)

The SNOMED description (`SNOMED.snomed_desc`) is added to the focused Specimen Site text field. If a default specimen site was already present in that field, it is replaced by the selected description.

#### User types a keyword in the Specimen Site text field (non-freetext mode)

The system recognises the typed keyword against the SNOMED description list and automatically resolves it to the matching `SNOMED.snomed_desc`, populating the field with the recognised value.

#### Bench prefix matches a Specimen Nature bench (non-freetext mode)

When the lab request number prefix matches a bench code that also has Specimen Nature data configured, the dropdown shows Specimen Nature descriptions first, followed by SNOMED entries, in a combined list. The user selects from either group.

---

## Configuration

| Setting | Option Code | Purpose | Effect when enabled (value = 1) | Effect when disabled (value = 0) |
|---------|-------------|---------|--------------------------------|----------------------------------|
| Specimen Site Text Mode | `TEXT` *(group: SPECIMEN)* | Controls whether the Specimen Site accepts free text or requires SNOMED selection | Freetext mode: dropdown sourced from Specimen Nature (`AP_KEYWORD`) | Non-freetext mode: dropdown sourced from SNOMED table; free-text input not permitted |

### Data Sources

| Data | Source | Notes |
|------|--------|-------|
| Specimen Nature descriptions | `AP_KEYWORD` table (`key_group = 'REG_SPEC_NATURE'`, `key_code = bench code`) | Freetext mode; filtered by current bench prefix |
| SNOMED site list | `SNOMED` table | Non-freetext mode; T-codes, active records only |
| Default specimen site (non-freetext) | `BENCH` table (`bench_def_site`, `bench_def_class`, `bench_def_seq`) matched to `SNOMED` (`snomed_code`, `snomed_class`, `snomed_seq`) | Pre-populates the site field on request assignment |

---

## Error Messages and System Prompts

| Message | Code | Trigger | User Options |
|---------|------|---------|-------------|
| "Error in getting option dictionary! If necessary, please contact LIS support at 6277-9292 or Call center at 2515-2653." | 3377 | The `TEXT` lab option (SPECIMEN group) does not exist when the user assigns an ANAT lab request number | OK (dismiss); registration flow is not triggered |
| "Invalid site [(keyword of invalid snomed description)]" | 1297 | User enters a text value in non-freetext mode that does not match any active SNOMED description | OK (dismiss) |
| "Duplicated site: (duplicate snomed description)" | 3596 | User attempts to add a SNOMED description that is already present in the Specimen Site area | OK (dismiss) |

---

## Related Workflows

- [[Specimen Site Input]] — Describes the overall Specimen Site area: field management, scrollbars, default site loading, and the `SITE_MANDATORY` validation rule. This component document covers only the dropdown list and data sources.
