# X-Ray No. Field

## Overview

The **X-Ray No.** text field appears on the ANAT Panel of the Manual Registration screen. It allows registration staff to record an X-ray reference number against an ANAT autopsy lab request. The field is only enabled when both conditions are met: the assigned request number belongs to an autopsy bench type **and** the X-Ray No. lab option is enabled. In all other situations the field remains visible but disabled.

---

## Related User Stories

- **[[CRST-587]]** - Registration - ANAT Panel - X-RAY No.

**Epic:** LISP-30 [CRST][DEV] Registration - Special Lab Workflow (ANAT)

---

## Key Concepts

### Autopsy Case
A lab request whose request number prefix matches an autopsy bench type as configured in the `HISTO_SETUP` table (lab database). Both the **Coroner** checkbox and the **X-Ray No.** field share this prerequisite — see [[Coroner Test Checkbox]].

---

## Visual Layout

The **X-Ray No.** text field is displayed within the ANAT Panel. It is always visible once the ANAT Panel is active. Enablement depends on the combination of the request type and the lab option described below.

---

## Field Behaviour

### On Request Number Assignment — Autopsy Case with X-Ray No. Option Enabled

When an ANAT request number that matches an autopsy bench type is assigned, and the `XRAY_NO_ENABLED` option is on:

1. The **X-Ray No.** field becomes **enabled** and editable.
2. The field accepts a free-text entry of up to **20 characters**.

### On Request Number Assignment — Autopsy Case with X-Ray No. Option Disabled

When the request is an autopsy case but `XRAY_NO_ENABLED` is not enabled:

1. The **X-Ray No.** field remains **disabled**. The user cannot enter a value.

### On Request Number Assignment — Non-Autopsy Case

When the request number prefix does not match an autopsy bench type:

1. The **X-Ray No.** field is **disabled** regardless of the option setting.

---

## Enablement Rules

Both conditions must be satisfied for the field to be enabled:

| Condition | X-Ray No. Field State |
|---|---|
| Initial state (no request number assigned) | Disabled |
| Patient ready (patient loaded, no request number) | Disabled |
| Autopsy case AND `XRAY_NO_ENABLED` = enabled | **Enabled** |
| Autopsy case AND `XRAY_NO_ENABLED` = disabled | Disabled |
| Non-autopsy case (regardless of option) | Disabled |

---

## Field Constraints

| Property | Value |
|---|---|
| Maximum input length | 20 characters |

> **Validation note:** The field enforces the 20-character limit at input time. Entries exceeding this limit are not accepted.

---

## Configuration

| Setting | Option Code | Purpose | Effect when enabled | Effect when disabled |
|---------|------------|---------|--------------------|--------------------|
| X-Ray No. Enabled | `XRAY_NO_ENABLED` *(option_group: REQUEST_REGISTRATION)* | Controls whether the X-Ray No. field is editable on autopsy requests | Field is enabled for autopsy requests | Field is disabled even for autopsy requests |

> **Setup dependency:** The autopsy bench type classification is derived from the `HISTO_SETUP` table (lab database). The `XRAY_NO_ENABLED` option alone is not sufficient — the request must also be an autopsy case for the field to be enabled.

---

## Related Workflows

- [[Coroner Test Checkbox]] — The Coroner checkbox shares the same autopsy case prerequisite as the X-Ray No. field.
- [[Specimen Collect Time Unknown Checkbox]] — Both are part of the ANAT Panel and share the same registration state lifecycle.
