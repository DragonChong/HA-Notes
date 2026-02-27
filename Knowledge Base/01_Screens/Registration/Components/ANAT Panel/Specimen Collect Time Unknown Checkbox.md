# Specimen Collect Time Unknown Checkbox

## Overview

The **Collect Time Unknown** checkbox appears on the ANAT Panel of the Manual Registration screen. It allows registration staff to indicate that the exact specimen collection time is not known. When checked, the system automatically sets the Collection Time to 00:00, representing an unknown time. The checkbox is checked by default whenever the ANAT Panel becomes active, and the time is reset to 00:00 again each time the staff checks the checkbox after editing the time manually.

---

## Related User Stories

- **[[CRST-118]]** - Registration - ANAT Panel - Specimen Collect Time Unknown Checkbox

**Epic:** LISP-30 [CRST][DEV] Registration - Special Lab Workflow (ANAT)

---

## Visual Layout

The **Collect Time Unknown** checkbox appears within the ANAT Panel, which is a lab-specific panel that becomes visible and active when an ANAT lab request number is assigned on the Manual Registration screen.

---

## Checkbox Behaviour

### Default State on Request Number Assignment

When an ANAT lab request number is assigned:

1. The ANAT Panel becomes enabled.
2. The **Collect Time Unknown** checkbox is automatically set to **checked**.
3. The Collection Time field is immediately updated to **00:00** (hours and minutes both set to zero, seconds cleared).

### User Unchecks the Checkbox

When the staff unchecks **Collect Time Unknown**:
- The checkbox state changes to unchecked.
- The Collection Time field is no longer forced to 00:00 and can be edited freely.

### User Edits Collection Time While Checkbox is Unchecked

The staff may enter any valid collection time in the Collection Time field. The time is not automatically overwritten while the checkbox remains unchecked.

### User Checks the Checkbox Again

When the staff re-checks **Collect Time Unknown** after having edited the Collection Time:
1. The system updates the Collection Time field, setting hours and minutes back to **00:00** (seconds also cleared).
2. The checked state is maintained until the staff unchecks it again or a new request number is assigned.

> **Rule:** Checking **Collect Time Unknown** always resets the time portion of the Collection Date to 00:00, regardless of what time was previously entered. The date portion is preserved.

---

## Enablement Rules

| Registration State | Checkbox State |
|---|---|
| Initial (no patient loaded) | Disabled |
| Patient ready (patient loaded, no request number) | Disabled |
| Ready (ANAT request number assigned) | Enabled |

---

## Related Workflows

- The **Collect Time Unknown** value is saved with the request record. A checked state is stored as "Y" (unknown time) and an unchecked state as "N" (known time).
