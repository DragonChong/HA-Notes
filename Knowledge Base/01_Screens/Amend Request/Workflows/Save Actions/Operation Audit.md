---
epic: LISP-223
status: draft
---
# Operation Audit

## Overview

When a sendout request is amended, the system inserts a **Send Out Form Audit** entry into `OPERATION_AUDIT`. This captures the state of the sendout-specific fields — Destination, Reference, and Requesting Unit — recording the before and after values for each. An operation audit is inserted whether or not the sendout fields were changed; if no changes were made, the audit still records the unchanged values. If sendout data was null or missing, the audit records null for that position.

---

## Related User Stories

- **[[CRST-806]]** - Amend Request - Operation Audit
- **[[CRST-797]]** - Amend Request - Validation (AmendRequestDataValidator) *(parent validation story)*

**Epic:** LISP-223 [CRST][DEV] Amend Request - Amend Action

---

## Scope

Operation audit applies to **sendout requests only**. Non-sendout amendments do not produce an `OPERATION_AUDIT` record via this mechanism.

> Note: The [[Private Change Reason Dialogue]] also writes to `OPERATION_AUDIT` for private-status changes; that is a separate audit mechanism.

---

## Audit Record Format

A single `OPERATION_AUDIT` record is inserted with `operaud_varchar` containing a multi-line block:

```
Send Out Form Audit
Request Number: <lab request number>
Destination: <old destination> -> <new destination>
Reference: <old reference> -> <new reference>
Requesting Unit (const type): <old unit> -> <new unit>
```

---

## Audit Scenarios

### Sendout fields changed

| Scenario | Destination Entry | Reference Entry | Requesting Unit Entry |
|----------|-----------------|-----------------|----------------------|
| Field changed | `<old value> -> <new value>` | `<old value> -> <new value>` | `<old value> -> <new value>` |
| Field unchanged | `<value> -> <value>` *(same on both sides)* | `<value> -> <value>` | `<value> -> <value>` |
| Field was null/empty and value added | `null -> <new value>` | `null -> <new value>` | `null -> <new value>` |
| Field had value and was removed | `<old value> -> null` | `<old value> -> null` | `<old value> -> null` |

> An operation audit record is always inserted for sendout requests — even when no changes were made.

---

## Data Sources for Audit Text

| Audit Field | Source |
|------------|--------|
| Destination description | `KEYWORD_LIST` — keys from `KEYWORD_GROUP` where `keygp_code = 'SENDOUT'` for the specific lab |
| Requesting Unit description | `LIS_CONSTANT` — constant group `SENDOUT_REQ_UNIT`, filtered by hospital code |

---

## Data Written

| Data | Table | Column | Notes |
|------|-------|--------|-------|
| Sendout form audit block | `OPERATION_AUDIT` | `operaud_varchar` | Multi-line text; one record per amendment of a sendout request |

---

## Related Workflows

- [[Private Change Reason Dialogue]] — Also writes to `OPERATION_AUDIT` for private-status change reasons; a separate record from the sendout audit.
- [[Change Audit]] — Field-level change audit written to `TESTRSLT_AUDIT`; separate from the sendout operation audit.
- [[Amend Action Result Message]] — The overall save sequence that triggers all audit writes on successful amendment.
