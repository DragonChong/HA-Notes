---
epic: LISP-223
status: draft
---
# Regenerate Report Determination

## Overview

When a registered lab request that has already been printed is amended, the system checks whether the changed fields would affect the printed report. If so, message 3122 is displayed to ask the user whether to schedule the report for re-printing. This ensures that report recipients always receive up-to-date copies after an amendment. The user can choose to re-print automatically, defer to manual re-printing, or cancel the amendment entirely.

---

## Related User Stories

- **[[CRST-801]]** - Amend Request - Regenerate Report Determination
- **[[CRST-797]]** - Amend Request - Validation (AmendRequestDataValidator) *(parent validation story)*

**Epic:** LISP-223 [CRST][DEV] Amend Request - Amend Action

---

## Trigger Conditions

Message 3122 is displayed when **all** of the following are true:
1. The retrieved request is in **Printed** status (the lab report has been printed at least once)
2. At least one of the following fields has been changed:

| Field | Configuration Required |
|-------|----------------------|
| Report Location | None — always checked for printed requests |
| Report Copy Location | None — always checked for printed requests |
| Request Comment | `OBJECT_ATTRIBUTE` entry with `objattr_function = 'REGEN'` and `objattr_name = 'uo_mle_req_comment'` for the specific lab |
| Specimen Collection Datetime | `OBJECT_ATTRIBUTE` entry with `objattr_function = 'REGEN'` and `objattr_name = 'uo_em_collection_datetime'` for the specific lab |

> The Request Comment and Specimen Collection Datetime triggers are **lab-specific** — they are only active for the laboratory numbers defined in the `OBJECT_ATTRIBUTE` table. Report Location and Report Copy Location apply to all labs without additional configuration.

---

## Message 3122 Content

The message lists every changed field that triggered the check, then asks whether to schedule re-printing:

```
The following information is changed:
<field 1>
<field 2>
...

Do you want to print the report(s) in the next schedule printing?
```

The field labels used in the message are:

| Changed Field | Label in Message |
|--------------|-----------------|
| Report Location | `Report Location` |
| Report Copy Location | `Copy To Location` |
| Request Comment | `Request Comment` |
| Specimen Collection Datetime | `Collection Date/Time` |

---

## Interaction Behaviours

#### User clicks Yes
The amendment is saved. The system automatically schedules the report for re-generation and printing in the next print run.

#### User clicks No
The amendment is saved. The report is **not** automatically re-generated. The user must manually trigger re-generation at a later time.

#### User clicks Cancel
The amendment is undone. The screen returns to its pre-amend state. No data is saved.

---

## Summary Table

| User Action | Amendment Saved | Report Re-generated |
|------------|----------------|---------------------|
| Yes | ✅ | ✅ Automatic (next schedule) |
| No | ✅ | ❌ Manual re-generation required |
| Cancel | ❌ | ❌ |

---

## Related Workflows

- [[Amend Action Result Message]] — After the user clicks Yes or No, the standard save sequence continues and the result message (501 or 1992) is shown.
- [[Report Copy Determination]] — Report copy destinations are recalculated as part of the same save sequence.
