---
epic: LISP-250
status: draft
---
# Display MICR/VIRO Information

## Overview

When a Microbiology (MICR) or Virology (VIRO) request is retrieved on the Cancel Request screen, the system displays additional specimen and site information specific to that request. This extra information helps lab staff verify that they are cancelling the correct request. The specimen is shown as a human-readable keyword description rather than a raw code; the site is shown as free text. If the specimen code cannot be matched to a keyword, the field is left blank.

---

## Related User Stories

- **[[CRST-951]]** - Cancel Request - MICR/VIRO: Display MICR/VIRO Information

**Epic:** LISP-250 [CRST][DEV] Cancel Request — Special Lab Workflow (MICR/VIRO)

---

## When the Information Is Displayed

Specimen and site information is loaded as part of the request retrieval step. It appears on the Cancel Request screen after the request has been successfully retrieved and the screen has been populated. The fields are always read-only; they are for display purposes only and cannot be edited.

---

## Fields Displayed

| Field | Data Source | Display Rule |
|---|---|---|
| Specimen | `mb_request.req_specimen` (keyword ckey) | Resolved to the keyword description matching `keyword.key_ckey = mb_request.req_specimen`. Displayed as blank if no matching keyword is found. |
| Site | `mb_request.req_site` | Displayed as-is (free text). Displayed as blank if no site is saved on the request. |

Both fields are non-editable regardless of the state of the request.

---

## Scope

| Lab | Specimen and Site Shown |
|---|---|
| MICR (Microbiology) | Yes |
| VIRO (Virology) | Yes |
| All other labs | No — these fields are not displayed |

> **Legacy system limitation:** In the legacy ECPath CRS implementation, specimen and site information cannot be shown for VIRO requests due to a known display limitation. This is specific to the old system; the intended behaviour (as documented here) is that both MICR and VIRO requests should display specimen and site information.

---

## Business Rules

1. Specimen and site information is displayed only for MICR and VIRO requests.
2. The specimen is always shown as the keyword description, never as the raw keyword code.
3. If the specimen keyword code stored on the request cannot be matched to a keyword description, the Specimen field is shown as blank.
4. If no site is saved on the request, the Site field is shown as blank.
5. Both fields are read-only; they cannot be edited on the Cancel Request screen.
6. If the retrieved request has no MICR/VIRO sub-request data, both fields are left blank.

---

## Related Workflows

- [[Retrieve Request]] — The retrieval step that triggers the loading of MICR/VIRO specimen and site information.
- [[Object Enablement After Retrieval]] — Governs the editable/non-editable state of all screen objects after retrieval; MICR/VIRO specimen and site fields are always non-editable.
