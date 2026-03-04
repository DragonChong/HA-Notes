# Add Test User Access Right Validation

## Overview

This workflow describes the access right check performed at Submit time when a new test profile has been added on the Add Delete Test screen. When the lab is configured to enforce user access rights for Add/Delete Test, the system verifies that the submitting user holds the appropriate access right before allowing the add test action to proceed. If the user lacks the required right, a blocking message is displayed and the action is aborted.

---

## Related User Stories

- **[[CRST-1035]]** - Add Delete Test - Add Test User Access Right Validation

**Epic:** LISP-265 [CRST][DEV] Add/Delete Test - Submit Action

---

## Trigger Point

Initiated as part of the Submit process on the Add Delete Test screen, when at least one new test profile has been added.

---

## Workflow Scenarios

### Scenario 1: Lab Configured to Check Access Rights — User Has No Right

#### Prerequisites

- The `ADD_DEL_TEST_CHK` lab option is enabled for the requesting lab.
- A new test profile has been added in the current session.
- The submitting user does not hold the Add Test access right for the requesting lab.

#### Process Flow

```mermaid
sequenceDiagram
    User->>Add Delete Test Screen: Click Submit
    Add Delete Test Screen->>System: Run pre-submit checks
    System->>System: ADD_DEL_TEST_CHK option enabled
    System->>System: Check Add Test access right for user and lab
    System->>User: Display message 724
    User->>System: Click OK
    System->>Add Delete Test Screen: Abort add/delete test action; request data unchanged
```

#### Step-by-Step Details

1. The user clicks **Submit** with a newly added test profile.
2. The system checks whether the `ADD_DEL_TEST_CHK` lab option is enabled for the requesting lab.
3. Because the option is enabled, the system checks whether the user holds the Add Test access right for the requesting lab (see Access Rights table below).
4. The user does not hold the required right, so message **724** is displayed.
5. The user clicks **OK**.
6. The add/delete test action is aborted. No data is written and the request remains unchanged.

---

### Scenario 2: Lab Configured to Check Access Rights — User Has Right

#### Prerequisites

- The `ADD_DEL_TEST_CHK` lab option is enabled for the requesting lab.
- A new test profile has been added in the current session.
- The submitting user holds the Add Test access right for the requesting lab.

#### Step-by-Step Details

1. The user clicks **Submit**.
2. The system checks the `ADD_DEL_TEST_CHK` option — it is enabled.
3. The system checks the user's Add Test access right — the user has the right.
4. Message 724 is **not** displayed. The Submit process continues to the next validation step.

---

### Scenario 3: Lab Not Configured to Check Access Rights

#### Prerequisites

- The `ADD_DEL_TEST_CHK` lab option is either disabled (`option_value = 0`) or does not exist for the requesting lab.

#### Step-by-Step Details

1. The user clicks **Submit**.
2. The system checks the `ADD_DEL_TEST_CHK` option — it is not enabled or absent.
3. The access right check is skipped entirely. Message 724 is not displayed regardless of the user's access rights.
4. The Submit process continues normally.

---

## Summary Tables

### Access Rights by Lab

| Lab | Required Access Right |
|---|---|
| CPS, HMS, IMS, MBS, VRS | `cbx_add_test` (via `w_lis_test_maintenance`) |
| GNS | `cbx_add_test` (via `w_lis_gns_test_maintenance`) |
| BBS | `cbx_add_test` (via `w_lis_bbnk_test_maintenance`) |
| CRS | `cbx_add_test` (via `w_lis_crs_test_maintenance`) |

---

## Error Messages and System Prompts

| Message | Description | Trigger | User Options |
|---|---|---|---|
| 724 | User does not have the Add Test access right | Submit clicked with a new test profile and user lacks right (option enabled) | OK (aborts action) |

---

## Configuration

| Setting | Option Code | Purpose | Effect when enabled | Effect when disabled |
|---|---|---|---|---|
| Add/Delete Test Access Right Check | `ADD_DEL_TEST_CHK` | Controls whether the Add Test access right is validated on Submit | Message 724 displayed and action aborted if user lacks right | Access right check is skipped; submit proceeds regardless |

> Source: `LAB_OPTION` table, `option_group = 'TEST_MAINTENANCE'`, `option_code = 'ADD_DEL_TEST_CHK'`, `option_value = 1` (enabled).

---

## Business Rules

1. This check only applies when a new test profile has been added in the current session — delete-only submissions do not trigger the Add Test access right check.
2. If the `ADD_DEL_TEST_CHK` option is absent or disabled, no access right check is performed and the Submit proceeds regardless of the user's rights.
3. Clicking **OK** on message 724 aborts the entire submission. No data is written.

---

## Related Workflows

- [[Mark Test to Delete - User Access Right Validation]] — Equivalent access right check applied when marking tests for deletion.
- [[Add Test Validation]] — The next set of Submit-time validations applied to newly added tests after the access right check passes.
- [[Add Delete Test (Action)]] — The overall submit action workflow that encompasses all pre-submit checks.
