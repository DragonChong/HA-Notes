---
epic: LISP-223
status: draft
---
# Private Change Reason Dialogue

## Overview

When a registered lab request involves a change in private location status, the system requires the user to provide a written reason before the amendment can be saved. A **Private Change Reason Dialogue** is displayed after the **Amend** button is clicked and before the request is updated. The dialogue contains a comment textarea where the reason must be entered. This dialogue is specific to amendments that cross the private/non-private or lab-only boundary of a request's location. If the user cancels, the amendment is undone.

---

## Related User Stories

- **[[CRST-799]]** - Amend Request - Private Change Reason Dialogue
- **[[CRST-797]]** - Amend Request - Validation (AmendRequestDataValidator) *(parent validation story)*

**Epic:** LISP-223 [CRST][DEV] Amend Request - Amend Action

---

## Key Concepts

### Private Location
A location designated as a private clinic or private ward (see [[Location Interaction - Private Referral]] for how private location affects Request Location). When a request is associated with a private location, it may have a **Private Referral** status or a **Lab Only** status.

### Lab Only Request
A request at a private location where the requester is a lab-only contact. See [[Lab Only Validation]] for the validation rules.

---

## Trigger Conditions

The Private Change Reason Dialogue is displayed when the **Amend** button is clicked and **any** of the following changes is detected:

| Scenario | Description |
|----------|-------------|
| Non-private → Private with Private Referral changed | Request location changed to a private location AND the Private Referral status is also changed |
| Private Referral → Lab Only | Registered private location request with Private Referral status amended to Lab Only |
| Private / Lab Only → Non-Private | Registered private location Lab Only request amended to a non-private status |

> The dialogue is only shown when the private/lab-only boundary is crossed. Changing a private location request's other fields without crossing this boundary does not trigger the dialogue.

---

## Dialogue Behaviour

| State | OK Button |
|-------|-----------|
| Comment textarea is empty | **Disabled** — user cannot proceed |
| Comment textarea has text | **Enabled** — user can submit |

The comment textarea must contain text before **OK** is enabled. There is no separate error message for blank comment — the button disablement prevents submission.

---

## Interaction Behaviours

#### User opens the dialogue
The Private Change Reason Dialogue is displayed with an empty comment textarea. The **OK** button is initially disabled. The **Cancel** button is always enabled.

#### User types a reason in the comment textarea
Once any text is entered, the **OK** button becomes enabled.

#### User clicks OK (reason provided)
The amendment proceeds. The registered lab request is updated. An audit record is inserted into `TESTRSLT_AUDIT` and an operation audit record is inserted into `OPERATION_AUDIT`. The entered comment is written to `OPERATION_AUDIT.operaud_varchar`.

#### User clicks Cancel
The amendment is undone. The screen returns to its pre-amend state.

---

## Data Written on OK

| Data | Table | Column | Notes |
|------|-------|--------|-------|
| Private change reason comment | `OPERATION_AUDIT` | `operaud_varchar` | Free-text reason entered in the dialogue |
| Audit record | `TESTRSLT_AUDIT` | `testaud_varchar` | Change audit entry for the private status change |

---

## Related Workflows

- [[Amend Request Validation]] — Private change detection runs as part of validation before the dialogue is displayed.
- [[Change Audit]] — The private status change is also recorded as a change audit entry in `TESTRSLT_AUDIT`.
- [[Operation Audit]] — The private change reason is stored as an operation audit entry in `OPERATION_AUDIT`.
