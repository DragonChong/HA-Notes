---
epic: LISP-226
status: draft
---
# ANAT Regenerate Report Alert

## Overview

After an ANAT lab request is amended, the system checks whether certain fields that affect the printed report have been changed. If they have, and the request's result group is in a **Printed** status, the system displays an alert (message 3121) informing staff which fields changed and advising them to reprint the report if necessary. Clicking OK saves the amendment and clears the screen.

---

## Related User Stories

- **[[CRST-826]]** - Amend Request - ANAT: Regenerate Report Alert

**Epic:** LISP-226 [CRST][DEV] Amend Request - Special Lab Workflow (ANAT)

---

## Trigger Conditions

The alert is shown when **all** of the following are true:

- The result group for the registered ANAT lab request is in a **Printed** status (see Printed Result Group below)
- At least one of the following fields has been amended:
  - Report Location
  - Report Copy Location
  - Request Comment *(see additional condition below)*
  - Specimen Collection Date *(see additional condition below)*

> **Additional condition for Request Comment and Specimen Collection Date:**
> These two fields only trigger the alert when the `OBJECT_ATTRIBUTE` table is configured for the current lab with `objattr_function = 'REGEN'` and the corresponding attribute name:
>
> | Field | `objattr_name` |
> |-------|---------------|
> | Request Comment | `uo_mle_req_comment` |
> | Specimen Collection Date | `uo_em_collection_datetime` |
>
> This configuration is lab-specific (`objattr_labno` must match the current lab number). If the `OBJECT_ATTRIBUTE` record is not present for the current lab, changes to these fields do **not** trigger the alert.

---

## Alert Content

The alert displays **message 3121** with a dynamic list of the changed fields:

```
The following information is changed:
<changed field(s), one per line>

Please choose the report to print in Report Generation screen if it is necessary.
```

**Field labels used in the alert:**

| Field Changed | Label in Alert |
|---------------|---------------|
| Report Location | Report Location |
| Report Copy Location | Copy To Location |
| Request Comment | Request Comment |
| Specimen Collection Date | Collection Date/Time |

When multiple fields have changed, all changed field labels are listed in the alert, in the order: Report Location → Copy To Location → Request Comment → Collection Date/Time.

**Example (all four fields changed):**
```
The following information is changed:
Report Location
Copy To Location
Request Comment
Collection Date/Time

Please choose the report to print in Report Generation screen if it is necessary.
```

---

## Buttons and Actions

#### OK
The amendment is saved. The ANAT lab request information is updated in the database. The Amend Request screen is cleared. Message **501** ("Request Updated.") is shown.

#### Cancel (or closing the alert without clicking OK)
The save does not proceed. The user remains on the Amend Request screen with their changes intact.

---

## Printed Result Group

The alert is only triggered when the result group is in a **Printed** status. This includes:

| Status | Description |
|--------|-------------|
| Printed | The result group has been printed (status = Printed) |
| Amended-and-Printed | The result group has been amended and re-printed (status = Amended-and-Printed) |

> Result groups that are only Authorised (but not yet printed) do **not** trigger this alert.

---

## Related Workflows

- [[ANAT Amend Request]] — Core data processing runs before this alert is evaluated.
- [[Regenerate Report Determination]] — General report regeneration logic for non-ANAT requests; this ANAT alert is the equivalent for ANAT-specific fields ([[CRST-801]]).
- [[Clear Screen]] — Executed after the alert is acknowledged and the save completes.
