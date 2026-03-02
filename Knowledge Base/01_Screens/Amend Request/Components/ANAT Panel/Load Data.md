---
epic: LISP-226
status: draft
---
# ANAT Panel — Load Data

## Overview

When a registered ANAT lab request is retrieved on the Amend Request screen, the system populates the ANAT panel fields from the `AP_REQUEST` table and, for the Site field, from either the `SITE` or `SNOMED` table depending on whether the lab is configured to run in Freetext or Non-freetext site mode.

---

## Related User Stories

- **[[CRST-822]]** - Amend Request - ANAT Panel - Load Data

**Epic:** LISP-226 [CRST][DEV] Amend Request - Special Lab Workflow (ANAT)

---

## Data Sources

| Field | Table | Column / Source | Notes |
|-------|-------|----------------|-------|
| Test | `AP_REQUEST` | `req_test` | |
| Site | `SITE` | `site_text` | **Freetext mode only** — sorted by `SITE.site_seq` |
| Site | `SNOMED` | `snomed_desc` | **Non-freetext mode only** — sorted by `SITE.site_seq` |
| Spec Type | `AP_REQUEST` | `req_specimen_type` | |
| Path/Tech | `AP_REQUEST` | `req_resp_path` | |
| Auth By | `AP_REQUEST` | `req_auth_by` | |
| DOD | `AP_REQUEST` | `req_dod` | Display only; always read-only |
| X-ray No. | `AP_REQUEST` | `req_xray` | |
| Coroner | `AP_REQUEST` | `req_coroner` | |
| Col. Time Unknown | `AP_REQUEST` | `req_col_time_null` | |

---

## Site Mode

The Site field source depends on the **Text** lab option:

| `LAB_OPTION` `option_code = 'TEXT'` `option_value` | Site Mode | Data Source |
|----------------------------------------------------|-----------|-------------|
| 1 | Freetext | `SITE.site_text`, sorted by `SITE.site_seq` |
| 0 | Non-freetext | `SNOMED.snomed_desc`, sorted by `SITE.site_seq` |

*Source: `LAB_OPTION` table, `option_group = 'SPECIMEN'`, `option_code = 'TEXT'`*

Reference: [[CRST-425]]

---

## Related Workflows

- [[ANAT Panel — Enablement]] — Field enablement is applied after data is loaded on retrieval.
- [[ANAT Panel — Tab Sequence]] — Tab order is set up alongside data loading.
- [[ANAT Amend Request]] — On Amend button click, the loaded (and possibly modified) values are compared against original values to detect changes.
