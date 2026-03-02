---
epic: LISP-225
status: draft
---
# USID Data Conversion

## Overview

The **USID Data Conversion** step prepares specimen-to-test-profile relation data for saving during the Amend Request process. When the Amend button is confirmed, the system converts the specimen relations entered or modified in the **Input Specimen Number Dialogue** into the request information package that is sent for saving. The conversion determines the correct data source classification for each specimen based on its format and associated send details, and handles add, update, and remove scenarios across multiple database tables.

---

## Related User Stories

- **[[CRST-819]]** - Amend Request - USID Data Conversion

**Epic:** LISP-225 [CRST][DEV] Amend Request - USID

---

## Trigger

Executed during the **Amend button** save sequence, after any required pre-save alerts (USID Not Found, Doctor Modified, etc.) have been resolved.

---

## Source Classification

For each specimen relation included in the amendment, the system determines the **source** value to be stored in `usid_relation_master`:

| Condition (evaluated in order) | Source Value |
|-------------------------------|-------------|
| Specimen relations were entered in the Input Specimen Number Dialogue **and** the USID equals the Request No. | `USID` |
| Specimen relations were entered **and** the USID is not null (but not equal to Request No.) | `RELABEL` |
| Specimen relations were entered **and** Send Hospital, Specimen No., and Specimen Suffix are all not null | `CMS` |
| No specimen relations were entered in the Input Specimen Number Dialogue | `MANUAL` |

> **Note:** The system does not allow an amendment where a Test Profile is mapped to no specimen.

---

## Amendment Scenarios

### Update from No Mapping to Specimen Mapping
The source in `usid_relation_master` is updated from `MANUAL` to `RELABEL` (for USID input) or `CMS` (for Specimen No. input).

| Table | Change |
|-------|--------|
| `usid_relation_master` | `source` updated from `MANUAL` → `RELABEL` or `CMS` |

### Update from Specimen No. to USID
The source in `usid_relation_master` is updated from `CMS` to `RELABEL`.

| Table | Change |
|-------|--------|
| `usid_relation_master` | `source` updated from `CMS` → `RELABEL` |

### Update from USID to Specimen No.
The source in `usid_relation_master` is updated from `RELABEL` to `CMS`.

| Table | Change |
|-------|--------|
| `usid_relation_master` | `source` updated from `RELABEL` → `CMS` |

### Add Specimen to Request with Multiple Test Profiles
A new specimen-to-test-profile mapping is added. Three tables are affected:

| Table | Change |
|-------|--------|
| `usid_relation_master` | New record added for the new specimen |
| `usid_profile_relation` | `master_id` updated for the affected test profile |
| `usid_test_relation` | `master_id` updated for all tests within the affected test profile |

### Remove Specimen from Request with Multiple Test Profiles
An existing specimen-to-test-profile mapping is removed. Three tables are affected:

| Table | Change |
|-------|--------|
| `usid_relation_master` | Record deleted for the removed specimen |
| `usid_profile_relation` | `master_id` updated for the affected test profile |
| `usid_test_relation` | `master_id` updated for all tests within the affected test profile |

---

## Related Workflows

- [[USID Input Dialogue]] — The specimen relations collected here are the input data for this conversion step.
- [[USID Not Found Alert]] — Resolved before this conversion step executes.
- [[USID Audit]] — Audit records are inserted to `operation_audit` based on the changes made by this conversion.
