# BBNK Change Audit

## Overview

When a BBS request is amended, the system records an audit log entry for each BBNK field that has changed. The audit log captures the before and after values for Special Blood, Indication Codes, Operation Codes, Date Required, Product Type, and Product Unit. These entries are appended to the general amend audit trail and allow staff to trace what BBNK information was modified and when.

---

## Related User Stories

- **[[CRST-832]]** - Amend Request - BBNK: Change Audit

**Epic:** LISP-227 [CRST][DEV] Amend Request - Special Lab Workflow (BBNK)

---

## Trigger Point

Runs as part of the save sequence after input validation has passed, alongside the standard amend change audit. An audit entry is only written for fields where the value has actually changed.

---

## Audit Log Format

Each changed BBNK field produces one audit log entry in the following format:

| BBNK Field | Audit Log Format | Value Representation |
|------------|------------------|----------------------|
| Special Blood | `Special blood : <old_value> -> <new_value>` | Keyword `alpha1` of each special blood entry |
| Indication Code | `Indication Code : <old_value> -> <new_value>` | Raw indication code text |
| Operation Code | `Operation Code : <old_value> -> <new_value>` | Raw operation code text |
| Date Required | `Product required date : <old_value> -> <new_value>` | Date formatted as `dd-MMM-yyyy` (date only, no time) |
| Product Type | `Product : <old_value> -> <new_value>` | Keyword description of the product type |
| Product Unit | `Product unit : <old_value> -> <new_value>` | Raw unit value |

> An audit entry is only generated when the before and after values differ. If a field is unchanged, no entry is written.

---

## Audit Logic by Field

### Special Blood
The system compares the special blood collection stored with the original request against the current selection in the Blood Category panel. If they differ, the audit entry shows the formatted string of both before and after special blood values, using the keyword `alpha1` for each blood category.

### Indication Code
The system compares the indication code records stored with the original request against the current contents of the Indication Code input. If any code differs, or if the count of codes differs, an audit entry is written. The before value is shown as the comma-joined original code list; the after value is the current comma-joined input.

### Operation Code
The system compares the operation code stored in the original request's first code record against the current contents of the Operation Code input (trimmed). An audit entry is written if the values differ.

### Date Required
The system compares the date required stored in the original Inventory Reserve Product record against the current Date Required input. Comparison is on the full date. The audit entry shows the date in `dd-MMM-yyyy` format, with an empty string for a null value.

### Product Type
The system compares the product type (keyword ckey) in the original Inventory Reserve Product record against the current Product Type selection. If they differ, the audit entry shows the keyword **description** (not the code) for both before and after values.

### Product Unit
The system compares the unit value in the original Inventory Reserve Product record against the current Product Unit selection. The audit entry shows the raw numeric unit value.

---

## Business Rules

1. Audit entries are only written for BBNK fields where the before and after values differ.
2. The Date Required is logged in date-only format (`dd-MMM-yyyy`); time is not included.
3. Product Type is represented by its keyword description, not its code.
4. Special Blood is represented using the keyword `alpha1` of each blood category entry.

---

## Related Workflows

- [[BBNK Amend Request]] — The parent save workflow that triggers this audit process.
- [[ANAT Change Audit]] — The equivalent audit workflow for the ANAT panel, for reference.
