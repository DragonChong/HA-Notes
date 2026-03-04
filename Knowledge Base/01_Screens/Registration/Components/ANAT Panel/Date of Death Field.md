# Date of Death Field

## Overview

The **DOD** (Date of Death) datetime field appears on the ANAT Panel of the Manual Registration screen. It allows registration staff to record the patient's date of death against an ANAT autopsy lab request. The field is only enabled when the assigned request number belongs to an autopsy bench type; for non-autopsy requests it remains visible but disabled. When an existing patient record indicates the patient is deceased and a date of death is recorded, that date is pre-populated into the field automatically when the ANAT request number is assigned.

---

## Related User Stories

- **[[CRST-588]]** - Registration - ANAT Panel - DOD Enablement

**Epic:** LISP-30 [CRST][DEV] Registration - Special Lab Workflow (ANAT)

---

## Key Concepts

### Autopsy Case
A lab request whose request number prefix matches an autopsy bench type as configured in the `HISTO_SETUP` table (lab database). The **DOD** field, the [[Coroner Test Checkbox]], and the [[X-Ray No Field]] all share this same prerequisite.

---

## Visual Layout

The **DOD** datetime field is displayed within the ANAT Panel. It is always visible once the ANAT Panel is active. The field includes a calendar indicator that the user can click to select a date from a date picker.

---

## Field Behaviour

### On Request Number Assignment — Autopsy Case

When an ANAT request number that matches an autopsy bench type is assigned:

1. The **DOD** field becomes **enabled** and editable.
2. The field is **blank by default**, unless the patient has an existing date of death recorded (see [Default DOD from Patient Record](#default-dod-from-patient-record) below).
3. The user may type a date directly or click the calendar indicator to select a date.

### On Request Number Assignment — Non-Autopsy Case

When the request number prefix does not match an autopsy bench type:

1. The **DOD** field is **disabled**. The user cannot enter or select a date.

### Default DOD from Patient Record

When a patient is retrieved and their record indicates they are deceased with a date of death on file, and an ANAT autopsy request number is subsequently assigned:

1. The patient's recorded date of death is automatically populated into the **DOD** field.
2. The staff may edit or clear this pre-populated value if needed.

---

## Enablement Rules

| Condition | DOD Field State |
|---|---|
| Initial state (no request number assigned) | Disabled |
| Patient ready (patient loaded, no request number) | Disabled |
| Autopsy case | **Enabled**, editable |
| Non-autopsy case | Disabled |

---

## Related Workflows

- [[Coroner Test Checkbox]] — Shares the autopsy case prerequisite with the DOD field.
- [[X-Ray No Field]] — Shares the autopsy case prerequisite with the DOD field.
- [[Specimen Collect Time Unknown Checkbox]] — All four fields are part of the ANAT Panel and share the same registration state lifecycle.
