---
epic: LISP-228
status: draft
---
# MICR-VIRO Panel — Tab Sequence

## Overview

The MICR-VIRO Panel supports keyboard navigation via the Tab key. The tab sequence follows a fixed order beginning with the Microbiologist drop-down, proceeding through the specimen and text fields, and ending with the Treatment Category drop-down. Components that are hidden due to lab option configuration are skipped automatically.

---

## Related User Stories

- **[[CRST-835]]** - Amend Request - MICR/VIRO Panel - Tab Sequence

**Epic:** LISP-228 [CRST][DEV] Amend Request - Special Lab Workflow (MICR/VIRO)

---

## Standard Tab Order (All Components Visible)

Starting from the **Microbiologist** drop-down, the tab sequence within the MICR-VIRO Panel is:

1. Microbiologist drop-down
2. Specimen Type drop-down
3. Site text input
4. Chemotherapy used text input
5. Treatment Category drop-down

---

## Conditional Tab Sequences

### Specimen Type Drop-down Invisible (Target Specimen Selection Active)

When the Specimen Type drop-down is hidden (replaced by the Display-only Specimen Type text input), it is skipped:

1. Microbiologist drop-down
2. Site text input
3. Chemotherapy used text input
4. Treatment Category drop-down

> The Display-only Specimen Type text input is read-only and is not part of the tab sequence.

---

## Field Inclusion Rules

| Component | Included in Tab Sequence |
|-----------|--------------------------|
| Microbiologist drop-down | Always |
| Specimen Type drop-down | Only when the Specimen Type drop-down is visible (Target Specimen Selection inactive) |
| Display-only Specimen Type text input | Never (read-only, not focusable) |
| Site text input | Always |
| Chemotherapy used text input | Always |
| Treatment Category drop-down | Always (included even when disabled; visibility controlled by lab option) |

---

## Related Workflows

- [[MICR-VIRO Panel — Enablement]] — Defines the visibility conditions for each component.
