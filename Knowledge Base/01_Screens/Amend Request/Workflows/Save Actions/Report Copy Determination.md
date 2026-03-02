---
epic: LISP-223
status: draft
---
# Report Copy Determination

## Overview

When a registered lab request is amended, the system recalculates the primary report copy destination. The outcome depends on whether the **Report Location** field is populated after the amendment. If the Report Location is cleared, the system substitutes the patient's location as the primary report destination. If a Report Location is added, it becomes the primary report destination. This ensures every amended request always has a valid primary report recipient.

---

## Related User Stories

- **[[CRST-807]]** - Amend Request - Report Copy Determination
- **[[CRST-797]]** - Amend Request - Validation (AmendRequestDataValidator) *(parent validation story)*

**Epic:** LISP-223 [CRST][DEV] Amend Request - Amend Action

---

## Determination Rules

| Report Location After Amendment | Primary Report Destination Assigned |
|---------------------------------|------------------------------------|
| Empty (cleared or was never set) | Patient's current location |
| Populated (added or retained) | The specified Report Location |

---

## Data Written

| Data | Table | Column | Notes |
|------|-------|--------|-------|
| Primary report copy — hospital | `REQUEST_COPY_HIST` | `reqcp_office_hosp` | Hospital code of the assigned primary report destination |
| Primary report copy — location key | `REQUEST_COPY_HIST` | `reqcp_office` | Office key (`OFFICE.office_ckey`) of the assigned primary report destination |

*The location values are sourced from `OFFICE.office_hosp_code` and `OFFICE.office_ckey`.*

---

## Related Workflows

- [[Regenerate Report Determination]] — When the report copy destination changes on a printed request, message 3122 is shown to ask whether to re-print.
- [[Amend Action Result Message]] — Report copy determination is part of the overall save sequence that completes before the result message is shown.
