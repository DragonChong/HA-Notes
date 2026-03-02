# MICR/VIRO Change Audit

## Overview

When an MBS or VRS request is amended, the system compares the previous and new values for each MICR/VIRO-specific field. For any field whose value has changed, an audit entry is appended to the amendment's audit log. Each entry records the field name, the old value, and the new value in a human-readable format. This provides a traceable history of all Microbiologist, Specimen Type, Site, Chemotherapy, and Treatment Category changes made to the request.

---

## Related User Stories

- **[[CRST-838]]** - Amend Request - MICR/VIRO: Change Audit

**Epic:** LISP-228 [CRST][DEV] Amend Request - Special Lab Workflow (MICR/VIRO)

---

## Trigger Point

Runs as part of the standard Amend Request save sequence, after the MICR/VIRO data has been prepared but before the audit log is persisted. Each MICR/VIRO field is evaluated for change independently.

---

## Audit Entries

The system evaluates the following five fields. An audit entry is only written when the old value and the new value differ.

| Field | Audit Format | Value Type |
|-------|-------------|-----------|
| Microbiologist | `Microbiologist: <old> -> <new>` | Keyword description text; empty string when value is null or zero (no selection) |
| Specimen Type | `Specimen type: <old> -> <new>` | Keyword description text; empty string when value is null |
| Site | `Site : <old> -> <new>` | Free text (raw input value); empty string when null |
| Chemotherapy used | `Chemotherapy : <old> -> <new>` | Free text (raw input value); empty string when null |
| Treatment | `Treatment : <old> -> <new>` | Keyword description text; empty string when value is null or zero (no selection) |

> **Spacing note:** The **Microbiologist** and **Specimen type** entries use no space before the colon (e.g., `Microbiologist:`). The **Site**, **Chemotherapy**, and **Treatment** entries use a space before the colon (e.g., `Site :`). This matches the exact format written to the audit log.

---

## Business Rules

1. An audit entry is written only if the old value and new value differ. Fields with no change are not logged.
2. For **Microbiologist** and **Treatment Category**, a null stored value is treated as equivalent to integer key 0 (no selection) when determining the old value for comparison.
3. For **Microbiologist** and **Treatment Category**, when no item is selected, the audit entry shows an empty string rather than a numeric zero.
4. Audit descriptions for **Microbiologist**, **Specimen Type**, and **Treatment Category** use the human-readable keyword description rather than the internal keyword key.
5. **Site** and **Chemotherapy** are free-text fields; their audit entries use the raw text value as entered by the user.

---

## Related Workflows

- [[MICR/VIRO Amend Request]] — The save workflow that triggers this audit logging step.
- [[BBNK Change Audit]] — Equivalent audit workflow for the BBNK panel, for comparison.
