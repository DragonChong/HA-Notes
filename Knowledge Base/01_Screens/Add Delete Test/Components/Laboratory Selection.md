---
epic: LISP-262
status: draft
---
# Laboratory Selection

## Overview

When a request number is entered on the Add/Delete Test screen, the system determines which laboratory the request belongs to. If the request number format matches more than one configured laboratory, the user is prompted to select the intended lab. The detailed logic for this selection is identical to that used in the Amend Request screen.

---

## Related User Stories

- **[[CRST-1017]]** — Add Delete Test — Laboratory Selection

**Epic:** LISP-262 [CRST][DEV] Add/Delete Test — Request Retrieval

---

## Behaviour

The laboratory selection logic for this screen follows the same rules as the Amend Request screen. For the full specification, refer to:

> **[[Laboratory Selection]]** *(Amend Request — CRST-856)*

### Summary of Rules

- For **USID-format** request numbers: the system lists all laboratories where the request format is configured with a lab number of 99. If more than one lab matches, the user is prompted to select.
- For **non-USID-format** request numbers: the system lists all laboratories that share the same request number prefix and are configured with a lab number of 99. If more than one lab matches, the user is prompted to select.

> **Future revamp note:** The current lab selection dialogue is expected to be replaced with a dropdown list in the revamped UI.

---

## Related Workflows

- [[Retrieve Request]] — Laboratory selection occurs as part of request retrieval.
- [[Laboratory Selection]] — Full specification (Amend Request — CRST-856).
