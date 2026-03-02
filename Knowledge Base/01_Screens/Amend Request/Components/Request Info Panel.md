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
- **[[CRST-778]]** - Amend Request - Amend Request Action
- **[[CRST-779]]** - Amend Request - Clear Action

**Epic:** LISP-220 [CRST][DEV] Amend Request - Layout

---

## Visual Layout

The Request Info Panel occupies the main body of the Amend Request screen, to the right of or below the Patient Panel. Fields are arranged across two columns. The panel is visible at all times but fields remain blank and disabled until a request is successfully retrieved. After retrieval, fields are populated with the existing request data and become editable.

---

## Fields

| Field | Description |
|-------|-------------|
| Category | Patient category for this request (e.g., in-patient, out-patient) |
| Pay Code | Billing pay code associated with the request |
| Clinical Detail | Free-text field for clinical background or presenting information |
| Reference | Free-text reference text |
| Comment | Free-text comment for the request |
| Bill | Billing indicator or billing-related flag |
| Urgency | Urgency level of the request |
| Confidential | Flag indicating the request is confidential |
| Private | Flag indicating the patient is a private patient |
| Bed | Patient's bed location at the time of the request |
| Request Doctor — Hospital | Hospital identifier for the requesting doctor |
| Request Doctor — Code | Code identifying the requesting doctor |
| Request Location — Hospital | Hospital from which the request originates |
| Request Location — Specialty | Specialty from which the request originates |
| Request Location — Ward / Clinic | Ward or clinic from which the request originates |
| Report Location — Hospital | Hospital to which the laboratory report is sent |
| Report Location — Specialty | Specialty to which the laboratory report is sent |
| Report Location — Ward / Clinic | Ward or clinic to which the laboratory report is sent |
| Report Copy — Hospital | Hospital for the additional report copy recipient |
| Report Copy — Specialty | Specialty for the additional report copy recipient |
| Report Copy — Ward / Clinic | Ward or clinic for the additional report copy recipient |
| Specimen Collection Datetime | Date and time the specimen was collected from the patient |
| Specimen Request Datetime | Date and time the request was submitted |
| Specimen Arrival Datetime | Date and time the specimen arrived at the laboratory |

---

## Buttons and Actions

### New Doctor Code

| Property | Detail |
|----------|--------|
| **Label** | New Doctor Code |
| **When visible** | Always visible when the panel is active |
| **What it does** | Opens a lookup dialogue allowing the user to search for and select a doctor. The selected doctor's code is populated into the **Request Doctor — Code** field. |

### Report Copy to Other Location

| Property | Detail |
|----------|--------|
| **Label** | Report Copy to Other Location |
| **When visible** | Always visible when the panel is active |
| **What it does** | Opens a dialogue allowing the user to designate an additional location to receive a copy of the laboratory report. The selected hospital, specialty, and ward or clinic are populated into the **Report Copy** fields. |

---

## Behaviour

### Before Request Retrieval

All fields in the Request Info Panel are blank and disabled. The panel is visible but no data is displayed and no fields can be edited.

### After Request Retrieval

All fields are populated with the current data from the retrieved request. The fields become **editable**, allowing the user to modify any of the request information values as required.

### After Clear

When the user clears the screen (using the **Clear** button), all fields in the Request Info Panel are reset to blank and the panel returns to its disabled state.

---

## Key Difference from Registration Screen

On the Registration screen, the Request Information panel is populated by the user during a new registration workflow. On the Amend Request screen, it is pre-populated from the existing request record and is opened in an edit-enabled state, ready for the user to make changes without re-entering all data from scratch.

---

## Related Workflows

*(To be documented when workflow US are processed.)*

---

## Related Components

- [[Patient Panel]] — The read-only patient demographic panel on the same screen.
- [[Data Retention Panel]] — Controls data retention for the amendment being submitted.
- [[Buttons]] — The screen-level action buttons, including the **Amend** button that submits changes.
