---
epic: LISP-223
status: draft
---
# Confidential Validation

## Overview

When the **Amend** button is clicked, the system validates the **Confidential** field. The field must not be blank and must contain a recognised value. Both checks produce blocking error messages that prevent the amendment from being saved until corrected.

---

## Related User Stories

- **[[CRST-896]]** - Amend Request - Confidential Validation Checking
- **[[CRST-797]]** - Amend Request - Validation (AmendRequestDataValidator) *(parent validation story)*

**Epic:** LISP-223 [CRST][DEV] Amend Request - Amend Action

---

## Validation Rules and Messages

| Message | Text | Condition | User Options | On OK |
|---------|------|-----------|-------------|-------|
| 490 | "Confidentiality must not be blank." | Confidential field is empty | OK | Message closes; amendment not saved |
| 497 | "Invalid Confidential." | Confidential field contains an unrecognised value | OK | Message closes; amendment not saved |

---

## Related Workflows

- [[Amend Request Validation]] — Confidential validation runs as part of the overall validation sequence when the Amend button is clicked.
