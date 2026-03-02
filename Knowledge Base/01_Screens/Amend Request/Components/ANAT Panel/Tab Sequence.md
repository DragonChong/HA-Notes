---
epic: LISP-226
status: draft
---
# ANAT Panel — Tab Sequence

## Overview

After a registered ANAT lab request is retrieved on the Amend Request screen, the tab sequence through the ANAT panel fields is determined by a combination of the result state and the lab option settings that control field enablement. Fields that are disabled are skipped in the tab order.

---

## Related User Stories

- **[[CRST-823]]** - Amend Request - ANAT Panel - Tab Sequence

**Epic:** LISP-226 [CRST][DEV] Amend Request - Special Lab Workflow (ANAT)

---

## Standard Tab Order (All Fields Enabled)

When all relevant options are enabled and the request is an Autopsy case with no unauthorised or authorised-locked conditions, the full tab sequence through the ANAT panel is:

**Test → Site → Spec Type → Path/Tech → Auth By → X-ray No. → Coroner → Col. Time Unknown → Gynae Clinical Data Button**

> **Note:** DOD is always read-only and is never part of the tab sequence.

---

## Conditional Tab Sequences

The actual tab sequence depends on which fields are enabled. Fields that are disabled are omitted from the sequence.

### If unauthorised ANAT result exists (Test is disabled)

**Site → Spec Type → Path/Tech → Auth By → X-ray No. → Coroner → Col. Time Unknown → Gynae Clinical Data Button**

### If `ALLOW_RESP_PERSON_CHANGE_AFTER_AUTH` is disabled and an authorised result group exists (Path/Tech and Auth By are disabled)

**Test → Site → Spec Type → X-ray No. → Coroner → Col. Time Unknown → Gynae Clinical Data Button**

### If request is not an Autopsy case (X-ray No., Coroner omitted) and Auth By option is disabled, no Gynae option

**Test → Site → Spec Type → Path/Tech → Col. Time Unknown**

### If Spec Type bench option has no bench type defined (`option_text = NULL`) and request is not Autopsy and no Gynae

**Test → Site → Path/Tech → Col. Time Unknown**

---

## Field Inclusion Rules

| Field | Included in Tab Sequence When |
|-------|------------------------------|
| Test | No unauthorised result exists on the request |
| Site | Always |
| Spec Type | `SPECIMEN_TYPE_BENCH` option enabled **and** bench code matches |
| Path/Tech | `f_lis_hist_responsible_person` function group exists **and** not disabled by `ALLOW_RESP_PERSON_CHANGE_AFTER_AUTH` + authorised result combination |
| Auth By | `AUTH_BY` option enabled **and** not disabled by `ALLOW_RESP_PERSON_CHANGE_AFTER_AUTH` + authorised result combination |
| DOD | **Never** (always read-only) |
| X-ray No. | Request is Autopsy case **and** `XRAY_NO_ENABLED` option enabled |
| Coroner | Request is Autopsy case |
| Col. Time Unknown | Always |
| Gynae Clinical Data Button | `GYNAE` / `MORE` option enabled |

---

## Configuration

| Setting | Option Code | Affects Tab Field |
|---------|-------------|------------------|
| Specimen Type Bench | `SPECIMEN_TYPE_BENCH` | Spec Type |
| Auth By | `AUTH_BY` | Auth By |
| Allow Responsible Person Change After Auth | `ALLOW_RESP_PERSON_CHANGE_AFTER_AUTH` | Path/Tech, Auth By |
| X-ray No. Enabled | `XRAY_NO_ENABLED` | X-ray No. |
| Gynae More | `MORE` *(option_group = 'GYNAE')* | Gynae Clinical Data Button |

---

## Related Workflows

- [[ANAT Panel — Enablement]] — Full enablement logic for each field; the tab sequence directly follows which fields are enabled.
- [[ANAT Panel — Load Data]] — Data is loaded prior to the tab sequence being set.
