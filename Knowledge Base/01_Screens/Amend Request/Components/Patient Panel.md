---
epic: LISP-220
status: draft
---
# Patient Panel

## Overview

The **Patient Panel** (Patient Demographic panel) displays the demographic details of the patient associated with a retrieved request. On the Amend Request screen, this panel is read-only — all fields are populated automatically when the request is retrieved and cannot be edited. This panel is the same component used on the Registration screen; the key distinction is that on Amend Request it is always non-editable.

---

## Related User Stories

- **[[CRST-771]]** - Amend Request - Patient Demographic Panel
- **[[CRST-86]]** - Registration - Patient Demographic Panel *(shared component origin)*
- **[[CRST-96]]** - Registration - Patient Demographic Panel *(shared component)*
- **[[CRST-777]]** - Amend Request - Retrieve Request
- **[[CRST-778]]** - Amend Request - Amend Request Action
- **[[CRST-779]]** - Amend Request - Clear Action

**Epic:** LISP-220 [CRST][DEV] Amend Request - Layout

---

## Visual Layout

The Patient Panel is a vertically stacked panel occupying the left or upper-left area of the Amend Request screen. All fields are arranged in a single column. The panel is visible at all times but its fields remain blank and non-interactive until a request is successfully retrieved. After retrieval the fields are populated but remain non-editable for the duration of the session.

---

## Fields

| Field | Data Displayed |
|-------|---------------|
| HKID | Patient's Hong Kong Identity Card number |
| Encounter | Hospital encounter number linked to the retrieved request |
| Name (English) | Patient's full name in English |
| Name (Chinese) | Patient's full name in Chinese characters |
| Sex | Patient's sex |
| Age | Patient's age at the time of the request |
| Age Unit | Unit associated with the age value (e.g., years, months, days) |

---

## Behaviour

### Before Request Retrieval

All fields in the Patient Panel are blank and non-interactive. The panel is visible but no data is displayed.

### After Request Retrieval

All fields are populated with the patient's demographic data from the retrieved request. The fields are **read-only** — they cannot be modified by the user on the Amend Request screen. The panel remains populated until the screen is cleared.

### After Clear

When the user clears the screen (using the **Clear** button), all fields in the Patient Panel are reset to blank.

---

## Key Difference from Registration Screen

On the Registration screen, the Patient Demographic panel fields may be populated via patient lookup and can reflect an editable state during the registration workflow. On the Amend Request screen, this panel is **always non-editable** regardless of user role or system configuration — the patient's details cannot be changed via this screen.

---

## Related Workflows

*(To be documented when workflow US are processed.)*

---

## Related Components

- [[Request Info Panel]] — The adjacent panel on the same screen; contains the editable request fields.
- [[Data Retention Panel]] — Also on the Amend Request screen; controls data retention for the amendment.
