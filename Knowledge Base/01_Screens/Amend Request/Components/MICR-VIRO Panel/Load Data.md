# MICR/VIRO Panel — Load Data

## Overview

When an MBS or VRS request is retrieved on the Amend Request screen, the MICR/VIRO Panel is populated with the microbiology/virology-specific data stored against that request. Each field is pre-filled from the corresponding column in the `mb_request` database table. A special case applies for the Display-only Specimen Type field, which is sourced from the USID relation data when the Target Specimen Selection option is active.

---

## Related User Stories

- **[[CRST-834]]** - Amend Request - MICR/VIRO Panel - Load Data

**Epic:** LISP-228 [CRST][DEV] Amend Request - Special Lab Workflow (MICR/VIRO)

---

## Data Loading

| Field | Default Value Source | Notes |
|-------|---------------------|-------|
| Microbiologist | `mb_request.req_microbiologist` | Selected by keyword key; not loaded if value is 0 |
| Specimen Type drop-down | `mb_request.req_specimen` | Selected by keyword key; only loaded when Target Specimen Selection is inactive |
| Display-only Specimen Type text input | `usid_relation_master.spectype_desc` | Only when Target Specimen Selection is active AND `usid_relation_master.target_specimen = 'Y'` for the request |
| Specimen Type Warning label (VRS only) | Constructed from pair request number | Text: "Request pair with `<pairSpecimenRequestNo>`. No specimen change allowed." — always set on load, visible only when a pair exists |
| Site | `mb_request.req_site` | Free text |
| Chemotherapy used | `mb_request.req_chemotherapy` | Free text; multi-line text area in VRS |
| Treatment Category | `mb_request.req_treatment` | Selected by keyword key; only loaded when Treatment Category is visible and enabled |

---

## Key Conditions

### Display-only Specimen Type
The display-only Specimen Type text input is populated only when:
1. The lab option `TARGET_SPECIMEN_SELECTION` is active (`option_value = 1`), **and**
2. The request has a USID relation record where `usid_relation_master.target_specimen = 'Y'`.

The displayed value is `usid_relation_master.spectype_desc` (the specimen type description text).

### VRS — Specimen Type Warning Label
The warning label text is always constructed on load from the pair specimen request number. Whether the label is **visible** depends on whether the pair request number is non-null (controlled by the Enablement logic, not by load data).

---

## Related Workflows

- [[MICR/VIRO Panel Enablement]] — Defines which components are visible and editable after data is loaded.
- [[MICR/VIRO Amend Request]] — The save workflow that collects the panel data after the user has made amendments.
