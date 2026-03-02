---
epic: LISP-222
status: draft
---
# Object Enablement After Retrieval

## Overview

When a request is successfully retrieved on the Amend Request screen, the screen transitions from its default empty/disabled state to an active state where the appropriate fields and buttons are populated and enabled. This document describes exactly which screen objects become enabled, which remain disabled, and which conditions govern their enablement. The enablement rules vary by object type, lab option configuration, and user access rights.

---

## Related User Stories

- **[[CRST-778]]** - Amend Request - Object Enablement After Retrieval

**Epic:** LISP-222 [CRST][DEV] Amend Request - Screen Object Interaction

---

## Request No. Field

After a request is retrieved, the **Request No.** field remains **visible but non-editable**. The retrieved request number is displayed in the field for reference throughout the session.

---

## Patient Demographic Panel

After retrieval, all Patient Demographic fields are **populated and non-editable**:

| Field | State After Retrieval |
|-------|-----------------------|
| HKID | Populated, non-editable |
| Encounter | Populated, non-editable |
| Name (English) | Populated, non-editable |
| Name (Chinese) | Populated, non-editable |
| Sex | Populated, non-editable |
| Age | Populated, non-editable |
| Age Unit | Populated, non-editable |

See [[Patient Panel]] for full field descriptions.

---

## Request Information Panel

After retrieval, the Request Information fields are **populated**. Most fields become editable; two are non-editable.

| Field | State After Retrieval |
|-------|-----------------------|
| Category | Populated, **editable** |
| Pay Code | Populated, **non-editable** |
| Clinical Detail | Populated, **editable** |
| Reference | Populated, **editable** |
| Comment | Populated, **editable** |
| Bill | Populated, **editable** |
| Urgency | Populated, **editable** |
| Confidential | Populated, **editable** |
| Private | Populated, **editable** |
| Bed | Populated, **editable** |
| Request Doctor — Hospital | Populated, **editable** |
| Request Doctor — Code | Populated, **editable** |
| Request Doctor — Full Name | Populated, **non-editable** |
| Request Location — Hospital | Populated, **editable** |
| Request Location — Specialty | Populated, **editable** |
| Request Location — Ward / Clinic | Populated, **editable** |
| Report Location — Hospital | Populated, **editable** |
| Report Location — Specialty | Populated, **editable** |
| Report Location — Ward / Clinic | Populated, **editable** |
| Report Copy — Hospital | Populated, **editable** |
| Report Copy — Specialty | Populated, **editable** |
| Report Copy — Ward / Clinic | Populated, **editable** |
| Specimen Collection Datetime | Populated, **editable** |
| Specimen Request Datetime | Populated, **editable** |
| Specimen Arrival Datetime | Populated, **editable** |

### In-Panel Button Enablement

| Button | State After Retrieval | Condition |
|--------|-----------------------|-----------|
| **New Doctor Code** | ✅ Enabled | Enabled unless `OFFICE_TABLE_MULTIPLE_DOCTOR_NOT_READY` is enabled for the lab. In practice this option is permanently disabled in production, so the button is always enabled. |
| **Report Copy to Other Location** | ✅ Enabled | Always enabled after retrieval — no condition. |

See [[Request Info Panel]] for full details.

---

## Data Retention Panel

| Condition | Panel State After Retrieval |
|-----------|-----------------------------|
| User has LAB_FUNCTION access right (directly or via group) | ✅ Enabled — user may select Permanent or Follow Laboratory |
| User does not have LAB_FUNCTION access right | Disabled — radio buttons cannot be interacted with |
| CRS application (not General Lab) | Not present on screen |

See [[Data Retention Panel]] for full details.

---

## Button Enablement

### Mandatory Buttons

| Button | State — No Request Loaded | State — After Retrieval |
|--------|---------------------------|-------------------------|
| **Amend** | Disabled | ✅ Enabled |
| **Clear** | ✅ Enabled *(current system)* | ✅ Enabled |

> **Revamp note:** The **Clear** button should be disabled when no request is loaded in the revamped system. This is a deliberate behavioural change from the current system.

### Optional Buttons

| Button | Visibility Condition | State After Retrieval | Additional Condition |
|--------|---------------------|-----------------------|----------------------|
| **Input Specimen No.** | USID `ENABLE` option_value = 1 | ✅ Enabled | Request must have USID format |
| **Input Specimen No.** | USID `ENABLE` option_value = 0 / 2 / 3 | Disabled | — |
| **Send Out** | `SENDOUT_FUNCTION_ENABLED` = 1 | ✅ Enabled | — |
| **Print Send Out** | `SENDOUT_FUNCTION_ENABLED` = 1 | ✅ Enabled | Sendout previously registered on request |
| **Print Send Out** | `SENDOUT_FUNCTION_ENABLED` = 1 | Disabled | No sendout registered yet |
| **Print Form** | `SENDOUT_FUNCTION_ENABLED` = 1 | ✅ Enabled (default: checked) | `SENDOUT_FORM_PRINTING_ENABLED_ON_AMEND` = 1 |
| **Print Form** | `SENDOUT_FUNCTION_ENABLED` = 1 | Disabled | `SENDOUT_FORM_PRINTING_ENABLED_ON_AMEND` = 0 |

See [[Buttons]] for full details.

---

## Configuration

| Setting | Option Code | Purpose | Effect when enabled | Effect when disabled |
|---------|-------------|---------|--------------------|--------------------|
| Multiple Doctor Not Ready | `OFFICE_TABLE_MULTIPLE_DOCTOR_NOT_READY` *(option_group = `REQUEST_REGISTRATION`)* | Controls whether New Doctor Code button is disabled | Button disabled after retrieval | Button enabled after retrieval |
| USID Enable | `ENABLE` *(option_group = `USID`, option_labno = 9)* | Controls Input Specimen No. button visibility and enablement | Button shown; enabled for USID format requests with option_value = 1 | Button hidden or disabled |
| Sendout Function | `SENDOUT_FUNCTION_ENABLED` *(option_group = `REQUEST_REGISTRATION`)* | Controls sendout button group visibility | Send Out, Print Send Out, Print Form shown | All hidden |
| Sendout Form Printing on Amend | `SENDOUT_FORM_PRINTING_ENABLED_ON_AMEND` *(option_group = `REQUEST_REGISTRATION`)* | Controls Print Form enablement on Amend Request | Print Form checkbox enabled and checked by default | Print Form checkbox disabled |

> `OFFICE_TABLE_MULTIPLE_DOCTOR_NOT_READY` is permanently disabled in production, making the **New Doctor Code** button always enabled in practice.

---

## Business Rules

1. The Request No. field is always non-editable after retrieval — the request number cannot be changed via Amend Request.
2. All Patient Demographic fields are non-editable after retrieval — patient data cannot be modified via Amend Request.
3. Pay Code is non-editable after retrieval — it is displayed for reference only.
4. The Request Doctor Full Name field is non-editable — it is auto-populated from the doctor code and is for display only.
5. The **Amend** button is disabled until a request is retrieved; it becomes enabled upon successful retrieval.
6. The **Clear** button is always enabled in the current system, regardless of whether a request is loaded. In the revamped system, it should only be enabled after a request has been retrieved.
7. The **Print Form** checkbox defaults to **checked** when it becomes enabled after retrieval.
8. The **Print Send Out** button is conditional on a sendout having been previously registered against the request — it is disabled if no sendout exists.
9. Data Retention Panel enablement is scoped to the lab number of the retrieved request and requires the LAB_FUNCTION access right.

---

## Related Components

- [[Patient Panel]] — The read-only demographic panel populated on retrieval.
- [[Request Info Panel]] — The editable request information panel populated on retrieval.
- [[Data Retention Panel]] — The access-controlled retention panel enabled on retrieval.
- [[Buttons]] — The screen action buttons whose enablement changes on retrieval.
