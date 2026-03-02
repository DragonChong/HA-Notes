---
epic: LISP-223
status: draft
---
# Location Validation

## Overview

When the **Amend** button is clicked, the system validates the **Request Location**, **Report Location**, and **Report Copy Location** fields. Checks cover mandatory presence, optional specialty requirements, and location code validity. All errors are blocking — the amendment is not saved until the issue is corrected.

---

## Related User Stories

- **[[CRST-895]]** - Amend Request - Request / Report / Report Copy Location Validation Checking
- **[[CRST-797]]** - Amend Request - Validation (AmendRequestDataValidator) *(parent validation story)*

**Epic:** LISP-223 [CRST][DEV] Amend Request - Amend Action

---

## Validation Rules and Messages

| Message | Text | Field | Condition | Configuration |
|---------|------|-------|-----------|---------------|
| 490 | "Specialty must not be blank." | Request Location — Specialty | Specialty is empty AND `REQUEST_LOCATION_SPECIALTY_IS_MANDATORY` = 1 | Mandatory only when option enabled |
| 490 | "Request Location must not be blank." | Request Location | Request Location is empty | Always mandatory |
| 490 | "Report Location must not be blank." | Report Location | Report Location is empty | Always mandatory |
| 497 | "Invalid Request Location." | Request Location | Request Location contains an unrecognised code | Always checked |
| 497 | "Invalid Report Location." | Report Location | Report Location contains an unrecognised code | Always checked |
| 497 | "Invalid Copy to." | Report Copy Location | Any Report Copy Location entry contains an unrecognised code | Always checked |

All messages are dismissed with **OK**. No amendment is saved while any of these errors is active.

---

## Configuration

| Setting | Option Code | Purpose | Effect when enabled | Effect when disabled |
|---------|------------|---------|--------------------|--------------------|
| Request Location Specialty Mandatory | `REQUEST_LOCATION_SPECIALTY_IS_MANDATORY` | Controls whether the Request Location Specialty field must be filled | Specialty blank → message 490 blocks amendment | Specialty is optional; no validation on this field |

*Source: `LAB_OPTION` table, `option_group = 'REQUEST_REGISTRATION'`*

---

## Related Workflows

- [[Amend Request Validation]] — Location validation runs as part of the overall validation sequence when the Amend button is clicked.
- [[Location Interaction - Private Referral]] — Private Referral status is set by location selection; related but separate from location validity checks.
