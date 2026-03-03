---
epic: LISP-252
status: draft
---
# Test Result

## Overview

When a request is successfully retrieved on the Wipeout Request screen, the system displays the request's test results in a **Test Grid**. The grid allows lab staff to review the status of each test before deciding whether to proceed with the wipeout. Each row shows the test code, its status date (colour-coded by status), and whether the test is optional. When the retrieved request belongs to a lab that has USID enabled, a **Specimen** column is also shown.

> **Shared logic:** The test grid population logic is identical to Cancel Request. See [[Cancel Request/Workflows/Request Retrieval/Test Result|Test Result (Cancel Request)]] for the full specification, including the USID/non-USID scenarios, status date colour coding, and business rules.

---

## Related User Stories

- **[[CRST-987]]** - Wipeout Request - Test Result
- Full logic reference: **[[CRST-927]]** (Cancel Request - Test Result)

**Epic:** LISP-252 [CRST][DEV] Wipeout Request — Request Retrieval

---

## Trigger Point

The Test Grid is populated immediately after a request is successfully retrieved. It forms part of the data displayed when the screen transitions to the ready state following a valid request number entry.

---

## Test Grid Columns

| Column | Data Displayed | Shown When |
|--------|---------------|------------|
| Testcode | Alphabetic test code from the test dictionary | Always |
| Specimen | Display specimen number(s) for the test; multiple specimens separated by commas | Only when USID is enabled for the lab |
| Status Date | Date and time of the test's current status; background colour follows test status (see below) | Always |
| Optional | "Y" if the test is optional; blank if mandatory | Always |

---

## Status Date Background Colour

| Test Status | Status Code(s) | Background Colour |
|-------------|---------------|-------------------|
| Awaiting Result | 0 | Default (no colour) |
| Unauthorized | 1, 21 | Yellow |
| Awaiting Signout | 4, 24 | Red |
| Completed | 5, 25 | Green |
| Reported | 6, 26 | Cyan |
| Cancelled | 17 | Magenta |

---

## Business Rules

1. The Test Grid is populated by traversing all lab result views, then all groups within each view, then all tests within each group.
2. The **Specimen** column is only included in the grid when the retrieved request's lab has USID enabled.
3. A test is considered optional if its optional value is 1 or greater; the **Optional** column displays "Y" in this case and is blank otherwise.
4. The background colour of the **Status Date** cell is determined by the test's status code at the time of retrieval.

---

## Related Workflows

- [[Retrieve Request]] — The Test Grid is populated as part of the overall request retrieval flow.
- [[Object Enablement After Retrieval]] — After the Test Grid is populated, the screen's buttons are enabled based on the test statuses.
