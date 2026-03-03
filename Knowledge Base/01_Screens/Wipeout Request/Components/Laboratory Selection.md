---
epic: LISP-252
status: draft
---
# Laboratory Selection

## Overview

The **Laboratory Selection** control allows staff to specify which laboratory's database should be searched when retrieving a request on the Wipeout Request screen. It is needed because, in a CRS environment, a single request number prefix may be shared across multiple laboratories. In the current system, this appears as a pop-up dialogue when ambiguity is detected. In the revamped system, it is replaced by a **dropdown list** displayed directly on the Wipeout Request screen.

> **Shared logic:** The Laboratory Selection logic is identical to that used in Cancel Request. See [[Cancel Request/Components/Laboratory Selection|Laboratory Selection (Cancel Request)]] for the full specification, including the lab number to display name mapping, USID-format handling, default lab selection from workstation identifier, and all interaction behaviours.

---

## Related User Stories

- **[[CRST-984]]** - Wipeout Request - Laboratory Selection
- Full logic reference: **[[CRST-929]]** (Cancel Request - Laboratory Selection)

**Epic:** LISP-252 [CRST][DEV] Wipeout Request — Request Retrieval

---

## Key Concepts

The Laboratory Selection step is triggered in the CRS application when a request number prefix maps to two or more laboratories. The user must select the target lab before retrieval can proceed. A default lab is pre-selected based on the workstation identifier.

For the complete specification — including the cross-lab prefix configuration rules, dropdown content, default selection logic, and all edge cases — refer to [[Cancel Request/Components/Laboratory Selection|Laboratory Selection (Cancel Request)]].

---

## Business Rules

1. Laboratory Selection applies only in the **CRS application**. In a single-lab application, retrieval always uses the current lab directly.
2. If only one lab matches the entered request number prefix, the selection step is bypassed and retrieval proceeds immediately.
3. All standard retrieval error paths ([[Request Not Found Message]], [[Not Supported Lab Message]]) apply after a lab is selected.
4. The full set of rules — including the workstation default, USID-format handling, and the lab number to name mapping — are the same as Cancel Request.

---

## Related Workflows

- [[Retrieve Request]] — Laboratory Selection is an intermediate step within the retrieval workflow.
- [[Request Not Found Message]] — Triggered if the request number does not exist in the selected lab's database.
- [[Not Supported Lab Message]] — A pre-retrieval check that blocks retrieval for labs not supported in CRS.
