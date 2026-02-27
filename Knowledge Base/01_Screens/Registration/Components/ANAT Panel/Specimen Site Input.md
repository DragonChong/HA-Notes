# Specimen Site Input

## Overview

The **Specimen Site** input area appears on the ANAT Panel of the Manual Registration screen. It allows registration staff to record one or more anatomical specimen site descriptions against an ANAT lab request. The field operates in one of two modes — free-text or non-free-text (SNOMED selection) — determined by a lab option. This document covers the **free-text mode** behaviour. Non-free-text (SNOMED) mode is covered in a companion document ([[Specimen Site Input - SNOMED Mode]]).

When a request number is assigned, the system may pre-populate a default site from the bench configuration. When a test is selected, an additional default site may be appended from a lab option mapping.

---

## Related User Stories

- **[[CRST-602]]** - Registration - ANAT Panel - Specimen Site Input

**Epic:** LISP-30 [CRST][DEV] Registration - Special Lab Workflow (ANAT)

---

## Key Concepts

### Free-Text Mode
When the `TEXT` specimen option is enabled, the Specimen Site area presents one or more free-text input fields. The user types directly into each field. Pressing **Enter** or moving focus away from the field confirms the entry and adds a new blank field below for the next site.

### Non-Free-Text (SNOMED) Mode
When the `TEXT` option is disabled, the Specimen Site area presents a searchable SNOMED selection control instead of free-text fields. This mode is documented separately.

### Default Site from Bench
The bench configuration (`BENCH` table) may specify a default site text for a given bench code. When a request number whose prefix matches that bench code is assigned, this default text is automatically placed into the Specimen Site input area.

### Default Site from Test Selection
The `DEFAULT_SITE_BY_TEST` lab option maps specific test codes to default site text. When the staff selects a matching test, the configured site text is **appended** to the Specimen Site area (it does not replace any existing entries).

---

## Visual Layout

The **Specimen Site** input area is displayed within the ANAT Panel. In free-text mode it consists of a vertically scrollable stack of text fields — one per site entry. When site text is long, each field scrolls horizontally. As new sites are added, the area scrolls vertically to accommodate them.

---

## Field Behaviour

### On Request Number Assignment — Default Site from Bench

When an ANAT request number is assigned and the bench code has a default site text configured:

1. The default site text is populated into the first Specimen Site field automatically.
2. This applies in free-text mode only. Non-free-text default site loading is covered in the SNOMED mode document.

### Adding a Specimen Site (Free-Text Mode)

1. The user clicks on a blank Specimen Site text field.
2. The user types the site description.
3. The user either presses **Enter** or moves focus away from the field.
4. The entry is confirmed and a new blank text field appears below for the next site.
5. This process can be repeated to record multiple specimen sites.

### On Test Selection — Default Site from Test Option

When the user selects a test code that matches a mapping in the `DEFAULT_SITE_BY_TEST` lab option:

1. The configured default site text for that test is **appended** to the existing Specimen Site entries.
2. Any sites already entered are retained — this is an additive action, not a replacement.

---

## Enablement Rules

| Registration State | Specimen Site Input State |
|---|---|
| Initial (no request number assigned) | Disabled |
| Patient ready (patient loaded, no request number) | Disabled |
| Ready (ANAT request number assigned) | **Enabled** |

---

## Configuration

| Setting | Option Code | Purpose | Effect when enabled | Effect when disabled |
|---------|------------|---------|--------------------|--------------------|
| Specimen Site Input Mode | `TEXT` *(option_group: SPECIMEN)* | Controls whether the site field uses free-text entry or SNOMED selection | Free-text mode active | Non-free-text (SNOMED) mode active |
| Default Site by Test | `DEFAULT_SITE_BY_TEST` *(option_group: REQUEST_REGISTRATION)* | Maps test codes to default site text | Matching site text appended when a mapped test is selected | No auto-append on test selection |
| Site Mandatory | `SITE_MANDATORY` *(option_group: REQUEST_REGISTRATION)* | Controls whether at least one specimen site must be entered before saving | Site label is marked as required; saving without a site shows an error | Site is optional |

> **Setup dependency:** The default site text on request number assignment is derived from the `BENCH` table (`bench_def_site_text`), not from `LAB_OPTION`. This applies to free-text mode only.

---

## Related Workflows

- [[Specimen Type Dropdown]] — Part of the same ANAT Panel; test selection may affect both specimen type and specimen site defaults simultaneously.
- [[Coroner Test Checkbox]] — Part of the same ANAT Panel; test selection affects multiple fields at once.
