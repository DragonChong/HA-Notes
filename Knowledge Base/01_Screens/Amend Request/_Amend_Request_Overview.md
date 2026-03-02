---
epic: LISP-220
status: draft
---
# Amend Request — Screen Overview

## Overview

The **Amend Request** screen allows authorised laboratory staff to modify the request information of an already-registered specimen request without creating a new request. Staff retrieve an existing request by its request number, review the patient demographic details (read-only), and edit the request information fields as needed before confirming the amendment. The screen is available in the General Laboratory application; a separate variant exists for the CRS application but with a narrower feature set.

---

## Related User Stories

- **[[CRST-771]]** - Amend Request - Patient Demographic Panel
- **[[CRST-772]]** - Amend Request - Request Information Panel
- **[[CRST-775]]** - Amend Request - Buttons
- **[[CRST-776]]** - Amend Request - Data Retention Selection Panel
- **[[CRST-778]]** - Amend Request - Object Enablement After Retrieval
- **[[CRST-779]]** - Amend Request - Retrieve Request
- **[[CRST-780]]** - Amend Request - Initial Values of Request

**Epic:** LISP-220 [CRST][DEV] Amend Request - Layout | LISP-222 [CRST][DEV] Amend Request - Screen Object Interaction | LISP-229 [CRST][DEV] Amend Request - Request Retrieval

---

## Screen Layout

The Amend Request screen is divided into three main sections arranged vertically, with action buttons positioned near the top alongside the **Request No.** input field.

### Request No. Input and Action Buttons

At the top of the screen, the **Request No.** input field allows staff to retrieve an existing request. The action buttons sit in this area:

| Button | Availability |
|--------|-------------|
| **Amend** | Always present |
| **Clear** | Always present |
| **Input Specimen No.** | Present only when the USID option is enabled |
| **Send Out** | Present only when the Sendout function is enabled |
| **Print Send Out** | Present only when the Sendout function is enabled |
| **Print Form** | Present only when the Sendout function is enabled |

See [[Buttons]] for full details.

---

### Patient Demographic Panel

Displays the patient's demographic information retrieved with the request. All fields are **read-only** after retrieval — they cannot be edited on the Amend Request screen.

| Field | Description |
|-------|-------------|
| HKID | Patient's Hong Kong Identity Card number |
| Encounter | Hospital encounter number linked to the request |
| Name (English) | Patient's name in English |
| Name (Chinese) | Patient's name in Chinese |
| Sex | Patient's sex |
| Age | Patient's age at the time of the request |
| Age Unit | Unit of the age value (e.g., years, months) |

See [[Patient Panel]] for full details.

---

### Request Information Panel

Displays and allows editing of the request information fields. Fields are **editable** after the request is retrieved.

| Field | Description |
|-------|-------------|
| Category | Patient category for the request |
| Pay Code | Billing pay code |
| Clinical Detail | Free-text clinical information |
| Reference | Reference text |
| Comment | Free-text comment |
| Bill | Billing indicator |
| Urgency | Urgency level of the request |
| Confidential | Confidentiality flag |
| Private | Private patient flag |
| Bed | Patient's bed location |
| Request Doctor — Hospital | Hospital of the requesting doctor |
| Request Doctor — Code | Code identifying the requesting doctor |
| Request Location — Hospital | Hospital from which the request originates |
| Request Location — Specialty | Specialty from which the request originates |
| Request Location — Ward / Clinic | Ward or clinic from which the request originates |
| Report Location — Hospital | Hospital to which the report is sent |
| Report Location — Specialty | Specialty to which the report is sent |
| Report Location — Ward / Clinic | Ward or clinic to which the report is sent |
| Report Copy — Hospital | Hospital for the report copy recipient |
| Report Copy — Specialty | Specialty for the report copy recipient |
| Report Copy — Ward / Clinic | Ward or clinic for the report copy recipient |
| Specimen Collection Datetime | Date and time the specimen was collected |
| Specimen Request Datetime | Date and time the request was made |
| Specimen Arrival Datetime | Date and time the specimen arrived at the laboratory |

See [[Request Info Panel]] for full details.

---

### Data Retention Panel

A panel unique to the Amend Request screen. It controls whether the amended data is stored permanently or governed by the laboratory's data retention policy.

| Control | Description |
|---------|-------------|
| **Permanent** | Radio button — amendments are retained permanently |
| **Follow Laboratory** | Radio button — amendments follow the laboratory's retention schedule |

This panel is enabled only after a request has been retrieved for a specific lab number. Access is controlled by the **LAB_FUNCTION** access right. This panel is present in the General Laboratory Amend Request only; it does **not** appear in the CRS application variant.

See [[Data Retention Panel]] for full details.

---

## Key Differences from Registration Screen

| Aspect | Registration | Amend Request |
|--------|-------------|---------------|
| Patient Demographic panel | Populated via patient lookup | Populated via request retrieval; **read-only** |
| Request Information panel | Populated by staff during new registration | Pre-populated from existing request; **editable** |
| Save action button | **Save** | **Amend** |
| Data Retention panel | Not present | Present (General Lab only) |
| Sendout buttons | Configurable | Configurable (same LAB_OPTION) |
| Input Specimen No. button | Configurable | Configurable (same LAB_OPTION) |

---

## Related Workflows

- [[Retrieve Request]] — The workflow that populates all three panels and enables the action buttons when a request number is entered.
