# MICR/VIRO Validation

## Overview

When the user clicks the Amend button with an MBS or VRS request loaded, the system validates the MICR/VIRO Panel fields before proceeding with the save. The Specimen Type drop-down is mandatory when it is visible. The Microbiologist and Treatment Category fields are optional but must contain a valid list value if a value has been typed.

---

## Related User Stories

- **[[CRST-836]]** - Amend Request - MICR/VIRO Validation

**Epic:** LISP-228 [CRST][DEV] Amend Request - Special Lab Workflow (MICR/VIRO)

---

## Validation Rules

| Field | Mandatory | Invalid Value Check | Message |
|-------|-----------|--------------------|---------| 
| Microbiologist drop-down | No (optional) | Yes — typed value must match a list item | Message **497** |
| Specimen Type drop-down | **Yes** (when visible and not in Target Specimen Selection mode) | Yes — typed value must match a list item | Message **497** for invalid value; Message **490** for empty / no selection |
| Treatment Category drop-down | No (optional) | Yes — typed value must match a list item | Message **497** |

> The Specimen Type validation is skipped entirely when the Target Specimen Selection lab option is active, as the field is in display-only mode and the user cannot edit it.

---

## Validation Details

### Microbiologist
- The field accepts free-text input that is matched against the keyword list.
- If the typed value does not match a list item, message **497** is shown.
- The field is optional; leaving it blank is valid.

### Specimen Type
- When the Specimen Type drop-down is visible (Target Specimen Selection inactive):
  - If no item is selected (empty), message **490** is shown and the save is blocked.
  - If a typed value does not match a list item, message **497** is shown and the save is blocked.
- When the Target Specimen Selection option is active, this validation is not performed.

### Treatment Category
- The field accepts free-text input that is matched against the keyword list.
- If the typed value does not match a list item, message **497** is shown.
- The field is optional; leaving it blank is valid.

---

## Error Messages and System Prompts

| Message | Trigger | User Options |
|---------|---------|-------------|
| 490 | Specimen Type drop-down is empty when mandatory | OK (dismiss; save blocked) |
| 497 | Invalid (non-list) value typed in Microbiologist, Specimen Type, or Treatment Category | OK (dismiss; save blocked) |

---

## Related Workflows

- [[MICR/VIRO Amend Request]] — The save workflow that these validations gate.
- [[MICR/VIRO Panel Enablement]] — Defines when the Specimen Type drop-down is visible (and therefore mandatory).
