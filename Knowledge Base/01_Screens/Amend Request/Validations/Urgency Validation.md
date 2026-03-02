---
epic: LISP-223
status: draft
---
# Urgency Validation

## Overview

When the **Amend** button is clicked, the system validates the **Urgency** field. The field must not be blank and must contain a recognised urgency keyword. Both checks produce blocking error messages that prevent the amendment from being saved until corrected.

---

## Related User Stories

- **[[CRST-898]]** - Amend Request - Urgency Validation Checking
- **[[CRST-797]]** - Amend Request - Validation (AmendRequestDataValidator) *(parent validation story)*

**Epic:** LISP-223 [CRST][DEV] Amend Request - Amend Action

---

## Validation Rules and Messages

| Message | Text | Condition | User Options | On OK |
|---------|------|-----------|-------------|-------|
| 490 | "Urgency must not be blank." | Urgency field is empty | OK | Message closes; amendment not saved |
| 497 | "Invalid Urgency." | Urgency field contains an unrecognised value | OK | Message closes; amendment not saved |

---

## Related Components

- [[Urgency Color]] — Describes the colour-coding behaviour of the Urgency field; separate from the validation rules documented here.

## Related Workflows

- [[Amend Request Validation]] — Urgency validation runs as part of the overall validation sequence when the Amend button is clicked.
