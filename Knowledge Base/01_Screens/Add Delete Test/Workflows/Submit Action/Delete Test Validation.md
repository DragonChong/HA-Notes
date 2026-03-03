# Delete Test Validation

## Overview

This workflow describes the validation applied at Submit time when tests have been marked for deletion on the Add Delete Test screen. If every test on the retrieved request is marked for deletion, the system prevents the submission and prompts a blocking message. The action is aborted and no data is written. Partial deletions (where at least one test remains active) pass the validation silently.

---

## Related User Stories

- **[[CRST-1037]]** - Add Delete Test - Delete Test Validation

**Epic:** LISP-266 [CRST][DEV] Add/Delete Test - Submit Action

---

## Trigger Point

Initiated as part of the Submit process on the Add Delete Test screen, when at least one test has been marked for deletion.

---

## Workflow Scenarios

### Scenario 1: All Tests Marked for Deletion

#### Prerequisites

- All test profiles on the retrieved request have been marked for deletion in the Test Grid.

#### Process Flow

```mermaid
sequenceDiagram
    User->>Add Delete Test Screen: Click Submit
    Add Delete Test Screen->>System: Run pre-submit checks
    System->>System: Check if all tests in request are marked deleted
    System->>User: Display message 742
    User->>System: Click OK
    System->>Add Delete Test Screen: Abort action; request data unchanged
```

#### Step-by-Step Details

1. The user clicks **Submit** with all tests on the request marked for deletion.
2. The system checks whether every test in the retrieved request is marked deleted.
3. Because all tests are marked deleted, message **742** is displayed.
4. The user clicks **OK**.
5. The add/delete test action is aborted. No data is written and the request remains unchanged.

---

### Scenario 2: Only Some Tests Marked for Deletion

#### Prerequisites

- At least one test on the retrieved request is **not** marked for deletion.

#### Step-by-Step Details

1. The user clicks **Submit** with one or more tests marked for deletion (but not all).
2. The system checks whether all tests are marked deleted — they are not.
3. Message 742 is **not** displayed.
4. The Submit process continues to the next step.

---

## Error Messages and System Prompts

| Message | Description | Trigger | User Options |
|---|---|---|---|
| 742 | All tests on the request are marked for deletion | Submit clicked with every test marked deleted | OK (aborts the action) |

---

## Business Rules

1. Message 742 is only triggered when **every** test on the retrieved request is marked for deletion — a partial deletion does not trigger the message.
2. Clicking **OK** on message 742 aborts the entire submission. No data is written.
3. This validation is independent of the lab, lab option, or user access right configuration.

---

## Related Workflows

- [[Add Test Validation]] — The Submit-time validations applied to newly added tests.
- [[Mark Test to Delete]] — The screen interaction where tests are flagged for deletion before submission.
- [[Add Delete Test (Action)]] — The overall submit action workflow that encompasses all pre-submit checks and the backend call.
