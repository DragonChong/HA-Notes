---
epic: LISP-226
status: draft
---
# ANAT Panel — Enablement

## Overview

The **ANAT Panel** on the Amend Request screen displays Anatomical Pathology (ANAT/APS)-specific request fields that can be amended alongside the standard request information. Whether each field in the panel is editable depends on the current state of the lab results (unauthorised, authorised, or no results) and on several lab option settings. This document describes the enablement rules for each ANAT panel field after a registered ANAT lab request is retrieved.

---

## Related User Stories

- **[[CRST-821]]** - Amend Request - ANAT Panel - Enablement

**Epic:** LISP-226 [CRST][DEV] Amend Request - Special Lab Workflow (ANAT)

---

## Key Concepts

### Unauthorised Result
A lab result that has been saved but not yet authorised.

### Authorised Result Group
A result group in any of the following statuses: Provisional, Final, Amend, or Supplementary.

### Autopsy Case
A registered ANAT lab request classified as an autopsy (as opposed to a surgical or cytology case).

---

## Field Enablement Rules

### Test

**Applies to:** ANAT (APS) and CRS Labs

| Condition | Enabled? |
|-----------|----------|
| No ANAT result exists on the request | ✅ Enabled |
| ANAT result group is authorised | ✅ Enabled |
| ANAT result saved but **not yet authorised** (unauthorised result exists) | ❌ Disabled |

---

### Site

Always enabled. No configuration conditions apply.

---

### Spec Type

Enabled when `LAB_OPTION` with `option_group = 'REQUEST_REGISTRATION'`, `option_code = 'SPECIMEN_TYPE_BENCH'`, `option_value = 1` is set **and** the registered request's prefix bench matches the bench code defined in `option_text`.

Disabled when the option is not set or the bench code does not match.

Reference: [[CRST-591]]

---

### Path/Tech

**Applies to:** ANAT (APS) Lab only

**Base enablement:** Requires function group `f_lis_hist_responsible_person` to exist in `FUNCTION_GROUP`.

**Additional disable condition:**

| `ALLOW_RESP_PERSON_CHANGE_AFTER_AUTH` option | Result group state | Enabled? |
|----------------------------------------------|-------------------|----------|
| Enabled (or not set) | Any | ✅ Enabled (subject to function group check) |
| Disabled | No authorised result group | ✅ Enabled (subject to function group check) |
| Disabled | Authorised result group exists | ❌ Disabled |

Reference: [[CRST-590]]

---

### Auth By

**Applies to:** ANAT (APS) Lab only

**Base enablement:** Requires `LAB_OPTION` with `option_group = 'REQUEST_REGISTRATION'`, `option_code = 'AUTH_BY'`, `option_value = 1`.

**Additional disable condition (same as Path/Tech):**

| `ALLOW_RESP_PERSON_CHANGE_AFTER_AUTH` option | Result group state | `AUTH_BY` option | Enabled? |
|----------------------------------------------|-------------------|-----------------|----------|
| Enabled (or not set) | Any | Enabled | ✅ Enabled |
| Disabled | Authorised result group exists | Enabled | ❌ Disabled |
| Either | Any | Disabled | ❌ Disabled (not shown) |

Reference: [[CRST-589]]

---

### DOD (Date of Death)

Always **disabled** for user editing. The field is read-only regardless of result state.

---

### X-ray No.

Enabled only when **both** conditions are met:
- The registered request is an Autopsy case, **and**
- `LAB_OPTION` with `option_group = 'REQUEST_REGISTRATION'`, `option_code = 'XRAY_NO_ENABLED'`, `option_value = 1` is set

Disabled if the request is not an Autopsy case, or if the option is not set.

Reference: [[CRST-587]]

---

### Coroner

Enabled when the registered request is an Autopsy case. Disabled when it is not.

Reference: [[CRST-586]]

---

### Col. Time Unknown

Always enabled. No configuration conditions apply.

---

### Gynae Clinical Data Button

Visible and enabled when `LAB_OPTION` with `option_group = 'GYNAE'`, `option_code = 'MORE'`, `option_value = 1` is set **and** the bench code matches.

Not shown when the option is disabled or not set.

Reference: [[CRST-608]]

---

## Configuration

| Setting | Option Code | Purpose | Effect when enabled | Effect when disabled |
|---------|-------------|---------|--------------------|--------------------|
| Specimen Type Bench | `SPECIMEN_TYPE_BENCH` | Controls whether Spec Type field is active for a given bench | Spec Type enabled if bench matches | Spec Type disabled |
| Auth By | `AUTH_BY` | Controls whether Auth By field is shown | Auth By field enabled (subject to result state) | Auth By field disabled |
| Allow Responsible Person Change After Auth | `ALLOW_RESP_PERSON_CHANGE_AFTER_AUTH` | Controls whether Path/Tech and Auth By remain editable after authorisation | Path/Tech and Auth By remain enabled | Path/Tech and Auth By disabled when authorised result group exists |
| X-ray No. Enabled | `XRAY_NO_ENABLED` | Controls whether X-ray No. is editable for autopsy requests | X-ray No. enabled for autopsy requests | X-ray No. disabled |
| Gynae More | `MORE` *(option_group = 'GYNAE')* | Controls whether the Gynae Clinical Data button is shown | Button shown and enabled | Button not shown |

*Source: `LAB_OPTION` table — `SPECIMEN_TYPE_BENCH`, `AUTH_BY`, `ALLOW_RESP_PERSON_CHANGE_AFTER_AUTH`, `XRAY_NO_ENABLED` use `option_group = 'REQUEST_REGISTRATION'`; `ALLOW_RESP_PERSON_CHANGE_AFTER_AUTH` uses `option_group = 'RESULT_ENTRY'`; `MORE` uses `option_group = 'GYNAE'`*

---

## Related Workflows

- [[ANAT Panel — Tab Sequence]] — Tab sequence is driven by the same enablement rules documented here.
- [[ANAT Panel — Load Data]] — Data is loaded into fields after retrieval; enablement is applied at the same time.
