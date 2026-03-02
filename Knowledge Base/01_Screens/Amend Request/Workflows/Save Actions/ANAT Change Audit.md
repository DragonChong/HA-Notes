---
epic: LISP-226
status: draft
---
# ANAT Change Audit

## Overview

When an ANAT lab request is amended and specific ANAT panel fields are changed, the system inserts change audit records into the `TESTRSLT_AUDIT` table. Each record captures the field name and the before/after values, providing a complete trace of what was modified. Audit records are only inserted for fields whose values actually differ from the original.

---

## Related User Stories

- **[[CRST-825]]** - Amend Request - ANAT: Change Audit

**Epic:** LISP-226 [CRST][DEV] Amend Request - Special Lab Workflow (ANAT)

---

## Trigger

Executed during the Amend button save sequence, after the ANAT core data processing step ([[ANAT Amend Request]]) detects field changes.

---

## Audit Record Location

All ANAT change audit records are inserted into `TESTRSLT_AUDIT.testaud_varchar`.

---

## Audit Text Formats by Field

### Test

Audit text: `Test: <old code> -> <new code>`

The test code values are sourced from the `BENCH_TEST` and `TEST` tables (see [[CRST-605]]).

**Example:**
```
Test: A -> Z
```

---

### Site — Freetext Mode

*(When `LAB_OPTION option_group='SPECIMEN', option_code='TEXT', option_value=1`)*

Site values are sourced from `SITE.site_text`. Multiple sites are concatenated with ` | `.

Audit text: `Site : <old sites> -> <new sites>`

**Examples:**

From NULL to values:
```
Site : -> Testing Site 1 | Testing Site 2
```

From values to NULL:
```
Site : Testing Site 1 | Testing Site 2 ->
```

---

### Site — Non-Freetext Mode

*(When `LAB_OPTION option_group='SPECIMEN', option_code='TEXT', option_value=0`)*

Site values are sourced from `SNOMED.snomed_desc`. Multiple sites are concatenated with ` | `.

Audit text: `Site : <old sites> -> <new sites>`

**Examples:**

From one site to multiple:
```
Site : Acetabular fossa -> Adenoid, NOS | Meniscus of wrist | Right foot
```

From NULL to values:
```
Site :  -> Cervix | Vault | Adrenal
```

From values to NULL:
```
Site : Cervix | Vault | Adrenal ->
```

> **Mode-switch behaviour:** If the site mode (Freetext vs Non-freetext) has changed since the request was registered, existing site records that no longer match the current mode will show as `null` in the audit text for the old side.
> Example: `Site : null | null ->`

---

### Spec Type

Audit text: `Spec Type: <old value> -> <new value>`

Values are sourced from the `AP_KEYWORD` table (see [[CRST-591]]).

**Examples:**
```
Spec Type: Thin Prep -> Autocyte
Spec Type:  -> Thin Prep
Spec Type: Thin Prep ->
```

---

### Path/Tech

Audit text: `Path/Tech: <old code> -> <new code>`

Only the code (not the name) is recorded. Values are sourced from `FUNCTION_GROUP` where `fnt_grp_function_name = 'f_lis_hist_responsible_person'` (see [[CRST-590]]).

**Examples:**
```
Path/Tech: %LPY721 -> WONGHC
Path/Tech: HAKY ->
```

---

### Auth By

Audit text: `Auth By: <old code> -> <new code>`

Only the code (not the name) is recorded. Values are sourced from `FUNCTION_GROUP` where `fnt_grp_function_name = 'f_lis_hist_auth_by'` (see [[CRST-589]]).

**Examples:**
```
Auth By: WU682 -> HAKY
Auth By: %CMSUSER ->
```

---

### X-ray No.

Audit text: `X-ray no.: <old value> -> <new value>`

**Examples:**
```
X-ray no.: -> testing
X-ray no.: testing -> 1314
```

---

## Summary Table

| Field | Audit Label | Value Source | Separator (multiple values) |
|-------|-------------|-------------|----------------------------|
| Test | `Test:` | `BENCH_TEST` / `TEST` tables | N/A |
| Site (Freetext) | `Site :` | `SITE.site_text` | ` \| ` |
| Site (Non-freetext) | `Site :` | `SNOMED.snomed_desc` | ` \| ` |
| Spec Type | `Spec Type:` | `AP_KEYWORD` table | N/A |
| Path/Tech | `Path/Tech:` | `FUNCTION_GROUP` (`f_lis_hist_responsible_person`) | N/A |
| Auth By | `Auth By:` | `FUNCTION_GROUP` (`f_lis_hist_auth_by`) | N/A |
| X-ray No. | `X-ray no.:` | Free text input | N/A |

---

## Related Workflows

- [[ANAT Amend Request]] — Change detection flags set during this step determine which audit records are written here.
- [[Change Audit]] — General change audit for standard request fields; ANAT change audit is a parallel mechanism for ANAT-specific fields, writing to `TESTRSLT_AUDIT` rather than the standard audit table.
