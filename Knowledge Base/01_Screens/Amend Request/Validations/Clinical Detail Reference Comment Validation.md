---
epic: LISP-223
status: draft
---
# Clinical Detail / Reference / Comment Validation

## Overview

When the **Amend** button is clicked, the system enforces maximum character limits on the **Clinical Detail**, **Reference**, and **Request Comment** text fields. If any field exceeds its limit, an error message is displayed and the amendment is blocked. The fields also enforce these limits interactively — the system prevents entry beyond the maximum character count while the user types.

---

## Related User Stories

- **[[CRST-892]]** - Amend Request - Clinical Detail / Reference / Comment Validation Checking
- **[[CRST-797]]** - Amend Request - Validation (AmendRequestDataValidator) *(parent validation story)*

**Epic:** LISP-223 [CRST][DEV] Amend Request - Amend Action

---

## Character Limits

| Field | Maximum Characters |
|-------|--------------------|
| **Clinical Detail** | 510 |
| **Reference** | 255 |
| **Request Comment** | 255 |

The system prevents the user from entering more than the maximum number of characters in each field. However, if the limit is somehow exceeded (e.g., through paste), an error message is displayed when the **Amend** button is clicked.

---

## Validation Messages

| Message | Text | Field | Trigger | User Options | On OK |
|---------|------|-------|---------|-------------|-------|
| 3528 | "Clinical Detail cannot more than 510 characters!" | Clinical Detail | Clinical Detail > 510 characters at time of Amend | OK | Message closes; user can re-edit |
| 552 | "Reference cannot more than 255 characters!" | Reference | Reference > 255 characters at time of Amend | OK | Message closes; user can re-edit |
| 552 | "Request Comment cannot more than 255 characters!" | Request Comment | Request Comment > 255 characters at time of Amend | OK | Message closes; user can re-edit |

All messages are blocking — the amendment is not saved until the field is corrected.

---

## Related Workflows

- [[Amend Request Validation]] — This validation runs as part of the overall validation sequence when the Amend button is clicked.
