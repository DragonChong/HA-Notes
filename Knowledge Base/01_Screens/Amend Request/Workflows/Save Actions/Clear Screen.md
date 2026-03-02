---
epic: LISP-223
status: draft
---
# Clear Screen

## Overview

After a registered lab request is successfully amended and the result message is acknowledged, the system automatically clears all data from the Amend Request screen. The screen returns to its initial open state, ready for the next retrieval. This behaviour ensures staff start each amendment with a clean screen and prevents accidental re-amendment of the same request.

---

## Related User Stories

- **[[CRST-810]]** - Amend Request - Clear Screen
- **[[CRST-797]]** - Amend Request - Validation (AmendRequestDataValidator) *(parent validation story)*

**Epic:** LISP-223 [CRST][DEV] Amend Request - Amend Action

---

## Trigger Point

Screen clearing occurs automatically as the final step of the save sequence — after the amendment is saved and the success message (501) is acknowledged by the user.

---

## Behaviour

All data entered or loaded during the session is removed from the screen:
- The patient demographic fields are cleared
- The request information fields are cleared
- The Request No. field is cleared
- The screen returns to its default open state, with focus on the **Request No.** field

---

## Related Workflows

- [[Amend Action Result Message]] — Screen clearing is triggered after the user acknowledges message 501.
- [[Retrieve Request]] — The cleared screen state is the same starting point as when the screen is first opened.
