---
epic: LISP-222
status: draft
---
# Location Interaction — Private Referral

## Overview

When a location is selected on the Amend Request screen — either by typing directly into the **Request Location** fields or by choosing a location through the **Request Location Dialogue** — the system checks whether the selected location is flagged as a Private Referral location. If it is, the **Private Referral** field on the Request Information Panel is automatically updated to reflect this. This ensures that requests originating from private referral sources are correctly marked without requiring staff to set the flag manually.

---

## Related User Stories

- **[[CRST-792]]** - Amend Request - Location Interaction - Private Referral
- **[[CRST-791]]** - Amend Request - Location Interaction - Change Doctor Hospital *(related — performed as part of the same location change event)*
- **[[CRST-102]]** - Manual Registration - Location Interaction - Private Referral *(reference — same pattern)*

**Epic:** LISP-222 [CRST][DEV] Amend Request - Screen Object Interaction

---

## Key Concepts

### Private Referral Location
A location is designated as a Private Referral location when its record in the hospital office/location directory has the private location flag set to **Y** (`OFFICE.office_private_location = 'Y'`). This is a per-location setting maintained in the hospital directory, not a screen configuration.

---

## Behaviour

The Private Referral check is performed whenever a Request Location is selected or changed. The check covers two entry methods:

### Via Request Location Dialogue

When the user opens the **Request Location Dialogue** (e.g., using the shortcut key) and selects a location:

1. The user selects a hospital location by entering a doctor hospital code with the **Doctor** checkbox selected, or by entering a ward/clinic code.
2. When the user confirms with **OK**, the system checks whether the selected location is a Private Referral location.
3. If the selected location has `office_private_location = 'Y'`, the **Private Referral** field on the Request Information Panel is updated accordingly.

### Via Direct Field Edit

When the user directly edits the **Request Location** fields (e.g., changes **Request Location — Ward/Clinic** or **Request Location — Specialty**):

1. After the field value changes, the system checks whether the resulting location is a Private Referral location.
2. If the resolved location has `office_private_location = 'Y'`, the **Private Referral** field is updated.

---

## Data Source

| Data | Source Table | Column |
|------|-------------|--------|
| Private location flag | `OFFICE` | `office_private_location` |
| Location code (lookup key) | `OFFICE` | `office_alpha` |
| Location internal key | `OFFICE` | `office_ckey` |
| Location specialty | `OFFICE` | `office_specialty` |

---

## Related Workflows

- [[Retrieve Request]] — Location fields are populated on retrieval; Private Referral is set based on the retrieved location at that point.
- [[Location Interaction - Change Doctor Hospital]] — The doctor hospital sync and Private Referral check are both triggered when the Request Location Hospital is changed.
