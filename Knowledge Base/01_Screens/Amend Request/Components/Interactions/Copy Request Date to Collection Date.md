---
epic: LISP-222
status: draft
---
# Copy Request Date to Collection Date

## Overview

When the **Specimen Request Datetime** field is edited on the Amend Request screen, the system can automatically copy the new value to the **Specimen Collection Datetime** field. This saves registration staff from entering the same datetime twice when the collection time is the same as the request time. The behaviour is controlled by a lab-specific option — it can be enabled for some laboratories and disabled for others.

---

## Related User Stories

- **[[CRST-789]]** - Amend Request - Copy Request Date to Collection Date
- **[[CRST-540]]** - Manual Registration - Copy Request Date to Collection Date *(reference — same pattern)*

**Epic:** LISP-222 [CRST][DEV] Amend Request - Screen Object Interaction

---

## Behaviour

### When the Option is Enabled

When staff edit the **Specimen Request Datetime** field, the system immediately copies the new value to the **Specimen Collection Datetime** field. The copy happens automatically without any additional user action.

> The lab number of the retrieved request's prefix must match the lab number associated with the option setting. The option is applied per-laboratory.

### When the Option is Disabled

Editing the **Specimen Request Datetime** field has no effect on the **Specimen Collection Datetime** field. Staff must enter the collection datetime separately if it differs from the request datetime.

---

## Configuration

| Setting | Option Code | Purpose | Effect when enabled | Effect when disabled |
|---------|------------|---------|--------------------|--------------------|
| Copy Request Datetime to Collection Datetime | `COPY_REQUEST_DTM_TO_COLLECT_DTM_ENABLED` | Controls whether editing the Specimen Request Datetime automatically updates the Specimen Collection Datetime | Specimen Collection Datetime is automatically populated with the Specimen Request Datetime value when edited | No automatic copy — Specimen Collection Datetime must be entered independently |

*Source: `LAB_OPTION` table, `option_group = 'REQUEST_REGISTRATION'`*

---

## Related Workflows

- [[Retrieve Request]] — Request retrieval loads both the Specimen Request Datetime and Specimen Collection Datetime fields onto the screen, after which the copy behaviour applies when edits are made.
