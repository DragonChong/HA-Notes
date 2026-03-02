---
epic: LISP-222
status: draft
---
# Location Interaction — Change Doctor Hospital

## Overview

When registration staff change the **Request Location — Hospital** field on the Amend Request screen, the system checks whether the **Request Doctor Hospital** and **Request Doctor Code** fields need to be synchronised. If either the doctor code or the doctor's hospital is not yet set, the system automatically copies the newly selected Request Location Hospital into the **Request Doctor Hospital** field. This keeps the doctor's location consistent with the request location when no specific doctor hospital has been recorded.

---

## Related User Stories

- **[[CRST-791]]** - Amend Request - Location Interaction - Change Doctor Hospital
- **[[CRST-792]]** - Amend Request - Location Interaction - Private Referral *(related — Private Referral check is performed as part of the same location change)*
- **[[CRST-539]]** - Manual Registration - Location Interaction - Change Doctor Hospital *(reference — same pattern)*

**Epic:** LISP-222 [CRST][DEV] Amend Request - Screen Object Interaction

---

## Behaviour

### Condition for Auto-Sync

When the user changes the **Request Location — Hospital**, the system checks whether either of the following conditions is true:

| Condition | Description |
|-----------|-------------|
| Doctor code not set | The **Request Doctor Code** field is blank or has not been entered |
| Doctor hospital not set | The **Request Doctor Hospital** field is blank |

If **either** condition is true, the system sets the **Request Doctor Hospital** to match the newly selected **Request Location — Hospital** value.

If both the doctor code and the doctor hospital are already populated, no automatic update is made to the **Request Doctor Hospital** field.

### Private Referral Check

After the Request Location Hospital change (and any resulting doctor hospital sync), the system also checks whether the selected location is configured as a Private Referral location. See [[Location Interaction - Private Referral]] for full details of that check.

---

## Summary

| Doctor Code Set | Doctor Hospital Set | Effect of Changing Request Location Hospital |
|:--------------:|:-------------------:|---------------------------------------------|
| No | Any | Request Doctor Hospital is updated to match the new Request Location Hospital |
| Yes | No | Request Doctor Hospital is updated to match the new Request Location Hospital |
| Yes | Yes | No automatic update — doctor hospital remains unchanged |

---

## Related Workflows

- [[Retrieve Request]] — Location fields are populated on retrieval; auto-sync applies when the user subsequently edits Request Location Hospital.
- [[Location Interaction - Private Referral]] — Private Referral check is performed alongside the doctor hospital sync when the Request Location Hospital is changed.
