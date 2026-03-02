---
epic: LISP-223
status: draft
---
# Change Audit

## Overview

Every time a registered lab request is successfully amended, the system records a change audit entry in `TESTRSLT_AUDIT` for each field that was modified. Each entry captures the field name, the previous value, and the new value in a standardised text format. When the Change Reason Dialogue is used, the selected reason and comment are appended to the relevant field's audit text in square brackets. Multiple field changes generate multiple separate audit records.

---

## Related User Stories

- **[[CRST-803]]** - Amend Request - Change Audit
- **[[CRST-800]]** - Amend Request - Change Reason Dialogue *(reason text appended to audit)*
- **[[CRST-797]]** - Amend Request - Validation (AmendRequestDataValidator) *(parent validation story)*

**Epic:** LISP-223 [CRST][DEV] Amend Request - Amend Action

---

## Audit Text Format

Each changed field produces one audit record written to `TESTRSLT_AUDIT.testaud_varchar` in the format:

```
<Field Label> : <old value> -> <new value>
```

When a change reason is provided (via [[Change Reason Dialogue]]), the reason is appended:

```
<Field Label> : <old value> -> <new value> [<reason and comment>]
```

> The square bracket suffix is only added when `POPUP_CHANGE_REASON` is enabled **and** the specific field is one of the four trigger fields (Urgency, Request Doctor, Report Location, Specimen Collection Datetime). Other fields never receive the bracket suffix even if other fields are changed in the same amendment.

---

## Audit Text Reference Table

| Field Changed | Audit Label | Change Reason Bracket Appended |
|--------------|-------------|-------------------------------|
| Patient Category | `Category` | No |
| Clinical Detail | `Clinical detail` | No |
| Confidential | `Confidentiality` | No |
| Private / Lab Only | `Lab Only Request` | No |
| Urgency | `Urgency` | Yes *(if POPUP_CHANGE_REASON enabled)* |
| Bill | `Bill` | No |
| Report Copy Location | `Copy To` | No |
| Reference | `Reference` | No |
| Comment | `Comment` | No |
| Requesting Doctor (code) | `Requesting doctor` | Yes *(if POPUP_CHANGE_REASON enabled)* |
| Requesting Doctor (department) | `Requesting Doctor Dept` | No |
| Report Location | `Report destination` | Yes *(if POPUP_CHANGE_REASON enabled)* |
| Request Location | `Requesting location` | No |
| Bed | `Room/Bed` | No |
| Lab Request Datetime | `Request Date/Time` | No |
| Specimen Arrival Datetime | `Arrival Date/Time` | No |
| Specimen Collection Datetime | `Collected Date/Time` | Yes *(if POPUP_CHANGE_REASON enabled)* |

---

## Audit Text Examples

| Scenario | `TESTRSLT_AUDIT.testaud_varchar` value |
|----------|---------------------------------------|
| Category: Out Patient → In Patient | `Category : Out-Patient -> In-Patient` |
| Clinical Detail: empty → "test clinical detail" | `Clinical detail : -> test clinical detail` |
| Confidential: No → Restricted | `Confidentiality : No -> Restricted` |
| Private: No → Lab Only | `Lab Only Request : No -> Lab Only` |
| Urgency: Non-Urgent → Urgent (with reason "Amend Urgency") | `Urgency : Non-urgent -> Urgent [Amend Urgency]` |
| Urgency: Non-Urgent → Urgent (no change reason option) | `Urgency : Non-urgent -> Urgent` |
| Bill: Yes → No | `Bill : Yes -> No` |
| Report Copy: PWH//12A → PWH/PHYA/ANK1, KWH/PAD/AC | `Copy To : PWH//12A -> PWH/PHYA/ANK1,KWH/PAD/AC` |
| Reference: "abc" → "testing reference 1" | `Reference : abc -> testing reference 1` |
| Comment changed | `Comment : <old text> -> <new text>` |
| Doctor: PWH-UNK → PWH-WAC846 (with department, with reason) | `Requesting doctor : PWH-UNK -> PWH-WAC846 [Amend Requesting Doctor]` |
| Doctor department: SURG → CTS | `Requesting Doctor Dept : SURG -> CTS` |
| Doctor department: SURG → *(none)* | `Requesting Doctor Dept : SURG -> ` |
| Report Location (with reason) | `Report destination : PWH// -> PWH/PATH/%MICRUR [Amend Report Location]` |
| Request Location changed | `Requesting location : PWH/A&E/%LIS -> PMH/SMSS/A&E` |
| Bed: 123 → 56789 | `Room/Bed : 123 -> 56789` |
| Request Datetime changed | `Request Date/Time : 20-Mar-2025 15:15 -> 19-Mar-2025 14:00` |
| Arrival Datetime changed | `Arrival Date/Time : 20-Mar-2025 15:15 -> 20-Mar-2025 09:00` |
| Collection Datetime (with reason) | `Collected Date/Time : 20-Mar-2025 00:00 -> 19-Mar-2025 03:00 [Amend Specimen Collection Datetime]` |

---

## Business Rules

1. One `TESTRSLT_AUDIT` record is inserted per changed field — multiple changes in a single amendment produce multiple records.
2. Keyword display values (not internal codes) are used in the audit text for Category, Confidential, Private/Lab Only, Urgency, and Bill fields.
3. If the Requesting Doctor has a department, a second audit record is always inserted for the department change, separate from the doctor code record.
4. If the new doctor has no department, the department audit text shows a blank value on the right side of the arrow.
5. The square bracket reason suffix is only appended when `POPUP_CHANGE_REASON` is enabled **and** the changed field is one of the four trigger fields.
6. When `POPUP_CHANGE_REASON` is disabled, no bracket suffix is appended to any audit record.

---

## Data Written

| Data | Table | Column | Notes |
|------|-------|--------|-------|
| Change audit text | `TESTRSLT_AUDIT` | `testaud_varchar` | One record per changed field; format: `<label> : <old> -> <new> [<reason>]` |

---

## Related Workflows

- [[Change Reason Dialogue]] — When active, the selected reason and comment are embedded in the audit text for Urgency, Request Doctor, Report Location, and Collection Datetime changes.
- [[Private Change Reason Dialogue]] — Private status changes also produce `TESTRSLT_AUDIT` entries.
