# Coroner Test Checkbox

## Overview

The **Coroner** checkbox appears on the ANAT Panel of the Manual Registration screen. It allows registration staff to flag an ANAT lab request as a coroner case. The checkbox is only enabled when the assigned request number belongs to an autopsy bench type; for non-autopsy requests it remains visible but disabled. When an autopsy test is selected that matches the configured coroner test list, the checkbox is automatically checked by default; selecting a non-matching test unchecks it.

---

## Related User Stories

- **[[CRST-586]]** - Registration - ANAT Panel - Coroner Test

**Epic:** LISP-30 [CRST][DEV] Registration - Special Lab Workflow (ANAT)

---

## Key Concepts

### Autopsy Case
A lab request whose request number prefix matches an autopsy bench type as configured in the HISTO_SETUP table. Only autopsy cases enable the **Coroner** checkbox.

### Coroner Test List
A configurable list of ANAT test codes for which the **Coroner** checkbox should be automatically checked when the test is selected. Configured via the `CORONER_TEST` lab option (see [Configuration](#configuration)).

---

## Visual Layout

The **Coroner** checkbox is displayed within the ANAT Panel. It is always visible once the ANAT Panel is active, but its enabled/disabled state depends on whether the request is an autopsy case.

---

## Checkbox Behaviour

### On Request Number Assignment — Autopsy Case

When an ANAT request number that matches an autopsy bench type is assigned:

1. The ANAT Panel becomes enabled.
2. The **Coroner** checkbox becomes **enabled** and is **unchecked** by default.

### On Request Number Assignment — Non-Autopsy Case

When an ANAT request number that does not match an autopsy bench type is assigned:

1. The ANAT Panel becomes enabled.
2. The **Coroner** checkbox is visible but **disabled**. The user cannot interact with it.

### On Test Selection — Test Matches Coroner Test Option

When the user selects a test code that matches one of the codes configured in the **Coroner Test** lab option:

1. The **Coroner** checkbox is automatically set to **checked**.

### On Test Selection — Test Does Not Match Coroner Test Option

When the user selects a test code that does not match any code in the **Coroner Test** lab option:

1. The **Coroner** checkbox is automatically set to **unchecked**.

### Manual Override

The user may manually check or uncheck the **Coroner** checkbox at any time while it is enabled, regardless of the current test selection.

---

## Enablement Rules

| Condition | Coroner Checkbox State |
|---|---|
| Initial state (no request number assigned) | Disabled |
| Patient ready (patient loaded, no request number) | Disabled |
| Request number assigned — autopsy bench type | Enabled |
| Request number assigned — non-autopsy bench type | Disabled |

---

## Configuration

| Setting | Option Code | Purpose | Effect when configured | Effect when not configured |
|---------|------------|---------|------------------------|---------------------------|
| Coroner Test | `CORONER_TEST` *(option_group: REQUEST_REGISTRATION)* | Defines which ANAT test codes automatically check the Coroner checkbox on test selection | Coroner checkbox is auto-checked when a matching test is selected; auto-unchecked when a non-matching test is selected | Coroner checkbox is never auto-checked; default remains unchecked |

> **Setup dependency:** The autopsy bench type classification is derived from the `HISTO_SETUP` table (lab database). A request number prefix must match a `histo_site_code` configured as an autopsy case for the Coroner checkbox to be enabled at all.

---

## Related Workflows

- [[Specimen Collect Time Unknown Checkbox]] — Both the Coroner checkbox and the Collect Time Unknown checkbox are part of the ANAT Panel and share the same enablement lifecycle tied to the assigned request number.
