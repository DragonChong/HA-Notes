---
epic: LISP-223
status: draft
---
# Bill Validation

## Overview

When the **Amend** button is clicked, the system validates the **Bill** field. If an unrecognised value has been entered, an error message is displayed and the amendment is blocked until the value is corrected.

---

## Related User Stories

- **[[CRST-897]]** - Amend Request - Bill Validation Checking
- **[[CRST-797]]** - Amend Request - Validation (AmendRequestDataValidator) *(parent validation story)*

**Epic:** LISP-223 [CRST][DEV] Amend Request - Amend Action

---

## Validation Rules and Messages

| Message | Text | Condition | User Options | On OK |
|---------|------|-----------|-------------|-------|
| 497 | "Invalid Bill." | Bill field contains an unrecognised value | OK | Message closes; amendment not saved |

---

## Related Workflows

- [[Amend Request Validation]] — Bill validation runs as part of the overall validation sequence when the Amend button is clicked.
