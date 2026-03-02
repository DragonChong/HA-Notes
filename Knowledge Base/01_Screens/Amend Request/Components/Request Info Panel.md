---
epic: LISP-220
status: draft
---
# Request Info Panel

## Overview

The **Request Info Panel** (Request Information panel) displays and allows editing of all request-level information for a retrieved request. When a request is loaded on the Amend Request screen, all fields in this panel are pre-populated with the current request data and become **editable**, allowing staff to update the request details before confirming the amendment. This panel is the same component used on the Registration screen, used here in an edit-enabled context. The panel also contains two in-panel action buttons for doctor code lookup and report copy location management.

---

## Related User Stories

- **[[CRST-772]]** - Amend Request - Request Information Panel
- **[[CRST-87]]** - Registration - Request Information Panel *(shared component origin)*
- **[[CRST-455]]** - Registration - Request Information Panel *(shared component)*
- **[[CRST-777]]** - Amend Request - Retrieve Request
- **[[CRST-778]]** - Amend Request - Object Enablement After Retrieval
- **[[CRST-779]]** - Amend Request - Retrieve Request *(data mapping)*

**Epic:** LISP-220 [CRST][DEV] Amend Request - Layout | LISP-229 [CRST][DEV] Amend Request - Request Retrieval

---

## Visual Layout

The Request Info Panel occupies the main body of the Amend Request screen, to the right of or below the Patient Panel. Fields are arranged across two columns. The panel is visible at all times but fields remain blank and disabled until a request is successfully retrieved. After retrieval, fields are populated with the existing request data and become editable.

---

## Fields

After a request is retrieved, fields fall into two categories: those that are editable (the user may change the value) and those that are visible but non-editable (displayed for reference only).

| Field | Editable After Retrieval | Table | Column | Data Type |
|-------|:------------------------:|-------|--------|-----------|
| Category | ✅ Yes | `REQUEST` | `req_category` | tinyint |
| Pay Code | ❌ No | `PATIENT` | `pat_type` | char(3) |
| Clinical Detail | ✅ Yes | `REQUEST` | `req_cdetail` / `req_cdetail2` | varchar(255) |
| Reference | ✅ Yes | `REQUEST` | `req_reference` | varchar(255) |
| Comment | ✅ Yes | `REQUEST` | `req_comment` | varchar(255) |
| Bill | ✅ Yes | `REQUEST` | `req_bill` | tinyint |
| Urgency | ✅ Yes | `REQUEST` | `req_urgency` | tinyint |
| Confidential | ✅ Yes | `REQUEST` | `req_confidential` | tinyint |
| Private | ✅ Yes | `REQUEST` | `req_lab_only` | tinyint |
| Bed | ✅ Yes | `REQUEST` | `req_bed` | varchar(8) |
| Request Doctor — Hospital | ✅ Yes | `REQUEST` | `req_reqdoc_hosp` | char(12) |
| Request Doctor — Code | ✅ Yes | `REQUEST` | `req_doc` | smallint |
| Request Doctor — Full Name | ❌ No | `OFFICE` | `office_name` | varchar(40) |
| Request Location — Hospital | ✅ Yes | `REQUEST` | `req_locn_hosp` | char(12) |
| Request Location — Specialty | ✅ Yes | `REQUEST` | `req_unit` | smallint |
| Request Location — Ward / Clinic | ✅ Yes | `REQUEST` | `req_locn` | smallint |
| Report Location — Hospital | ✅ Yes | `REQUEST` | `req_rept_dest_hosp` | char(12) |
| Report Location — Specialty | ✅ Yes | N/A | N/A | Not stored separately |
| Report Location — Ward / Clinic | ✅ Yes | `REQUEST` | `req_rept_dest` | smallint |
| Report Copy — Hospital | ✅ Yes | `REQUEST_COPY_HIST` | `reqcp_office_hosp` | char(12) |
| Report Copy — Specialty | ✅ Yes | N/A | N/A | Not stored separately |
| Report Copy — Ward / Clinic | ✅ Yes | `REQUEST_COPY_HIST` | `reqcp_office` | smallint |
| Specimen Collection Datetime | ✅ Yes | `REQUEST` | `req_collected_date` | smalldatetime |
| Specimen Request Datetime | ✅ Yes | `REQUEST` | `req_requested_date` | smalldatetime |
| Specimen Arrival Datetime | ✅ Yes | `REQUEST` | `req_arrived_date` | smalldatetime |

---

## Buttons and Actions

### New Doctor Code

| Property | Detail |
|----------|--------|
| **Label** | New Doctor Code |
| **When visible** | Always visible when the panel is active |
| **When enabled** | Enabled after request retrieval, unless the lab option `OFFICE_TABLE_MULTIPLE_DOCTOR_NOT_READY` is set to enabled for the retrieved request's lab number — in that case the button is disabled. In practice this option is permanently disabled in production, so the button is always enabled after retrieval. |
| **What it does** | Opens a lookup dialogue allowing the user to search for and select a doctor. The selected doctor's code is populated into the **Request Doctor — Code** field and the doctor's full name is populated into the **Request Doctor — Full Name** display field. |

### Report Copy to Other Location

| Property | Detail |
|----------|--------|
| **Label** | Report Copy to Other Location |
| **When visible** | Always visible when the panel is active |
| **What it does** | Opens a dialogue allowing the user to designate an additional location to receive a copy of the laboratory report. The selected hospital, specialty, and ward or clinic are populated into the **Report Copy** fields. |

---

## Configuration

| Setting | Option Code | Purpose | Effect when enabled | Effect when disabled |
|---------|-------------|---------|--------------------|--------------------|
| Multiple Doctor Not Ready | `OFFICE_TABLE_MULTIPLE_DOCTOR_NOT_READY` *(option_group = `REQUEST_REGISTRATION`)* | Controls whether the New Doctor Code button is disabled for the lab | **New Doctor Code** button disabled after retrieval | **New Doctor Code** button enabled after retrieval |

> This option is permanently disabled in production operation. As a result, the **New Doctor Code** button is always enabled after request retrieval in practice.

---

## Behaviour

### Before Request Retrieval

All fields in the Request Info Panel are blank and disabled. The panel is visible but no data is displayed and no fields can be edited.

### After Request Retrieval

All fields are populated with the current data from the retrieved request. The majority of fields become **editable**, allowing the user to modify request information. The following fields are populated but remain **non-editable**:
- **Pay Code** — displayed for reference only; cannot be changed via Amend Request.
- **Request Doctor — Full Name** — auto-populated based on the doctor code; displayed for reference only.

### After Clear

When the user clears the screen (using the **Clear** button), all fields in the Request Info Panel are reset to blank and the panel returns to its disabled state.

---

## Key Difference from Registration Screen

On the Registration screen, the Request Information panel is populated by the user during a new registration workflow. On the Amend Request screen, it is pre-populated from the existing request record and is opened in an edit-enabled state, ready for the user to make changes without re-entering all data from scratch.

---

## Related Workflows

- [[Retrieve Request]] — This panel is populated as part of the request retrieval workflow; editability of fields is governed by the retrieval outcome.

---

## Related Components

- [[Patient Panel]] — The read-only patient demographic panel on the same screen.
- [[Data Retention Panel]] — Controls data retention for the amendment being submitted.
- [[Buttons]] — The screen-level action buttons, including the **Amend** button that submits changes.
