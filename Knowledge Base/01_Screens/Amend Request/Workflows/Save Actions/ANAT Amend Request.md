---
epic: LISP-226
status: draft
---
# ANAT Amend Request

## Overview

When the Amend button is clicked for a retrieved ANAT lab request, the system performs a set of ANAT-specific core data processing steps in addition to the standard amend process. These steps ensure that the Specimen Collection Date is synchronised with the effective date, and that change flags are set correctly for downstream processing of Test and Path/Tech modifications.

---

## Related User Stories

- **[[CRST-824]]** - Amend Request - ANAT: Amend Request

**Epic:** LISP-226 [CRST][DEV] Amend Request - Special Lab Workflow (ANAT)

---

## Trigger

The Amend button is clicked for a retrieved ANAT lab request, after all validations and pre-save checks have passed.

---

## Core Processing Steps

### 1. Specimen Collection Datetime — Effective Date Synchronisation

If the Specimen Collection Datetime has been updated on the Amend Request screen, the system updates `REQUEST.req_effective_date` to match the new `REQUEST.req_collected_date`.

| Field Changed | Database Column Updated |
|---------------|------------------------|
| Specimen Collection Datetime | `REQUEST.req_collected_date` |
| *(Derived automatically)* | `REQUEST.req_effective_date` ← set to new `req_collected_date` |

### 2. ANAT Test Code Change Detection

The system compares the existing ANAT Test Code (from `AP_REQUEST.req_test`) with the current ANAT Test Code selected in the ANAT panel (sourced from the `BENCH_TEST` and `TEST` tables).

- If they differ: the **ANAT Test Modified** flag is set, indicating that downstream ANAT-specific processing (such as change audits) should treat the Test as changed.
- If they are the same: the flag is not set and no test change processing is triggered.

Reference: [[CRST-605]] (BENCH_TEST and TEST lookup)

### 3. ANAT Path/Tech Change Detection

The system compares the existing Path/Tech value (from `AP_REQUEST.req_resp_path`) with the current Path/Tech selection from the ANAT panel (sourced from the `FUNCTION_GROUP` record with `fnt_grp_function_name = 'f_lis_hist_responsible_person'`).

- If they differ: the **Path/Tech Modified** flag is set.
- If they are the same: the flag is not set.

> The system handles cases where either the existing or newly selected value may be null, ensuring that comparisons do not produce errors.

Reference: [[CRST-590]]

---

## Related Workflows

- [[ANAT Change Audit]] — Audit records in `TESTRSLT_AUDIT` are generated based on the changes detected in steps 2 and 3 above.
- [[ANAT Regenerate Report Alert]] — Triggered after the core data processing if specific field changes and result group conditions are met.
- [[Regenerate Report Determination]] — General report regeneration logic; the ANAT variant extends this with its own field comparison logic.
