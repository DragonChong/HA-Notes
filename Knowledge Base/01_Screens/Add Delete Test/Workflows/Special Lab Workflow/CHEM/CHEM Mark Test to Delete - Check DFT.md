# CHEM: Mark Test to Delete - Check DFT

## Overview

This workflow describes the DFT (Drug Function Test) check applied during the mark-to-delete sequence for CHEM lab requests on the Add Delete Test screen. When the retrieved request is the first request in a DFT series (DFT Time Flag = 0) and the user attempts to delete all tests in the DFT test group, the system blocks the deletion with a message directing the user to use the Wipeout function instead. Deleting individual tests from a first-DFT request is permitted as long as at least one test remains. For any other DFT request in the series (Time Flag ≠ 0), deletion and un-deletion behave normally.

---

## Related User Stories

- **[[CRST-1042]]** - Add Delete Test - CHEM: Mark Test to Delete - Check DFT

**Epic:** LISP-267 [CRST][DEV] Add/Delete Test - Special Lab Workflow (CHEM)

---

## Key Concepts

### DFT Order
A linked series of lab requests representing time-point samples for the same DFT study. Each request in the series is assigned a DFT Time Flag indicating the time interval (e.g., 0, 30, 60, 90 minutes). All requests in a DFT order share the same DFT order number in the system.

### First DFT Request (Time Flag = 0)
The baseline sample in a DFT series. This request has a DFT Time Flag of 0. Deleting all tests from this request via Add Delete Test is not permitted; the Wipeout function must be used instead.

### DFTPF
The test group profile code for the DFT test group. The DFT check only applies when the test group profile code is `DFTPF`.

### Partial Deletion on First DFT Request
Deleting individual tests from a first DFT request is allowed, provided at least one test in the group remains. Only the action that would result in the **entire group** being deleted is blocked.

---

## Trigger Point

This check is step 3 of the [[CHEM Mark Test to Delete]] sequence, reached after the TIS Correlation check and the User Access Right check have both passed.

---

## Workflow Scenarios

### Scenario 1: Delete All Tests on First DFT Request (Time Flag = 0) — Blocked

#### Prerequisites

- The retrieved request is the first DFT request in its DFT series (DFT Time Flag = 0).
- The DFT test group profile code is `DFTPF`.
- The user's action (double-clicking the group header, or double-clicking the last remaining undeleted test in the group) would result in all tests in the group being marked deleted.

#### Process Flow

```mermaid
sequenceDiagram
    User->>Add Delete Test Screen: Double-click test group (or last remaining test)
    System->>System: Check if request is first in DFT series (Time Flag = 0)
    System->>System: Check if test group profile = DFTPF
    System->>System: Check if all tests in group would be deleted
    System->>User: Display message 735
    User->>System: Click OK
    System->>Add Delete Test Screen: Abort deletion; data unchanged
```

#### Step-by-Step Details

1. After the access right check passes, the system checks whether the retrieved request is the first DFT request in its DFT order (DFT Time Flag = 0).
2. The system checks whether the test group profile code is `DFTPF`.
3. The system checks whether the user's current action would result in all tests within the DFT group being marked deleted (i.e., the group header is double-clicked, or the last undeleted test in the group is double-clicked).
4. All three conditions are met: message **735** is displayed — *"This is first sample / time-slot zero sample in the DFT series, and you are not allowed to delete all the DFT tests here, please use 'Wipeout' function to do so."*
5. The user clicks **OK**.
6. The deletion is aborted. No delete flag is assigned. Test data remains unchanged.

---

### Scenario 2: Delete a Specific (Non-Last) Test on First DFT Request — Allowed

#### Prerequisites

- The retrieved request is the first DFT request (Time Flag = 0).
- The user double-clicks a specific test within the DFT group.
- At least one other test in the same group would remain undeleted after this action.

#### Step-by-Step Details

1. The system checks whether the action would result in all tests being deleted — it would not.
2. Message 735 is **not** displayed.
3. The sequence proceeds to step 4 of [[CHEM Mark Test to Delete]]: the delete flag is assigned to the selected test.

---

### Scenario 3: Delete Tests on a Non-First DFT Request (Time Flag ≠ 0) — Normal Behaviour

#### Prerequisites

- The retrieved request is **not** the first DFT request in its series (DFT Time Flag is not 0).

#### Step-by-Step Details

1. The system determines the request is not a first-DFT request.
2. The DFT check is not triggered.
3. The sequence proceeds normally to step 4 of [[CHEM Mark Test to Delete]]: the standard delete flag assignment logic applies. Test groups and individual tests may be deleted or un-deleted freely.

---

## Summary Tables

### DFT Deletion Rules by Time Flag

| DFT Time Flag | Double-click Test Group | Double-click Last Test in Group | Double-click Specific (Non-Last) Test |
|---|---|---|---|
| 0 (First DFT) | Message 735 — blocked | Message 735 — blocked | Delete flag assigned (allowed) |
| > 0 (Non-first DFT) | Delete flag assigned to group and all tests | Delete flag assigned | Delete flag assigned |

---

## Error Messages and System Prompts

| Message | Text | Trigger | User Options |
|---|---|---|---|
| 735 | *"This is first sample / time-slot zero sample in the DFT series, and you are not allowed to delete all the DFT tests here, please use 'Wipeout' function to do so."* | Attempted deletion of all tests in DFTPF group on a first-DFT request | OK (aborts deletion; data unchanged) |

---

## Business Rules

1. The DFT check applies only when the test group profile code is `DFTPF` **and** the request is the first in its DFT series (DFT Time Flag = 0).
2. Partial deletion of a first-DFT request is permitted, provided at least one test in the DFT group remains active after the action.
3. Complete deletion of the first DFT request requires the Wipeout function — it cannot be done through the Add Delete Test screen.
4. For all non-first DFT requests (Time Flag ≠ 0), there is no restriction on deleting or un-deleting individual tests or the entire test group.

---

## Related Workflows

- [[CHEM Mark Test to Delete]] — The parent sequence; this check is step 3.
- [[CHEM: Mark Test to Delete - Check TIS Correlation]] — Step 1, checked before this.
- [[Mark Test to Delete - User Access Right Validation]] — Step 2, checked before this.
- [[Mark Test to Delete]] — Step 4: the standard delete flag assignment logic that runs after this check passes.
