---
epic: LISP-257
status: draft
---
# VIRO - Wipeout Request

## Overview

When a VIRO request is wiped out, the system packages additional VIRO-specific data alongside the standard wipeout request fields before sending to the server. This extra data describes the paired specimen relationship, allowing the backend to correctly handle the pair — in particular, to remove the Pair Up Test result from the Second Specimen when the First Specimen is being wiped out.

---

## Related User Stories

- **[[CRST-1006]]** — Wipeout Request — VIRO: Wipeout Request

**Epic:** LISP-257 [CRST][DEV] Wipeout Request — Special Lab Workflow (VIRO)

---

## Trigger Point

This step occurs during the Process Save phase (step 6) of the wipeout pipeline, as the request package is being assembled. The VIRO-specific fields are appended to the standard request package.

---

## Additional Request Packing (VIRO)

In addition to the base request package (see [[Wipeout Request (Action)]]), VIRO requests include the following extra fields:

| Request Packing Field | Data |
|---|---|
| Is First Specimen Request | Indicator of whether the request being wiped out is the First Specimen in the pair |
| Pair Specimen Request No | The request number of the paired specimen |
| VRS Pair Up Test Key | The test key for pairing, from the Pair Up Test configuration (`option_text` of `lab_option` where `option_group = 'PAIRUP'` and `option_code = 'PAIRUP_TEST'`) |

---

## Backend Behaviour on Wipeout

### Wiping Out the First Specimen

When the request being wiped out is the First Specimen:

1. The request is wiped out.
2. The backend uses the Pair Up Test Key to locate the Pair Up Test result (`testrslt`) in the Second Specimen's request.
3. The Pair Up Test result is removed from the Second Specimen.

### Wiping Out the Second Specimen

When the request being wiped out is the Second Specimen:

1. The request is wiped out.
2. No test result modification is made to the First Specimen.

---

## Business Rules

1. All three VIRO-specific fields (`Is First Specimen Request`, `Pair Specimen Request No`, `VRS Pair Up Test Key`) are included in the request package for any VIRO request with a paired specimen.
2. The removal of the Pair Up Test result from the Second Specimen is performed server-side when the wiped-out request is the First Specimen.
3. The Pair Specimen Check step (see [[VIRO - Pair Specimen Check]]) ensures that the Pair Up Test Key configuration exists before the wipeout reaches this point — if the configuration is missing, the wipeout is blocked at the validation step.
4. Wiping out the Second Specimen does not modify the First Specimen's test results.

---

## Related Workflows

- [[VIRO - Pair Specimen Check]] — The validation step that confirms the user's intent and verifies the Pair Up Test configuration before this packing step is reached.
- [[Wipeout Request (Action)]] — The main wipeout pipeline and the base request package contents.
