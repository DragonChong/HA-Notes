# USID Not Found Alert

## Overview

This workflow describes the pre-save validation that checks whether the USID (Universal Specimen Identifier) values entered during a session still exist in the system at the time of submission. If a USID was entered in the [[USID Input Dialogue]] but cannot be found in the system when the user clicks Submit, a warning message listing the missing USID(s) is displayed. The user may proceed with the save or abort it. An optional suppression checkbox allows the user to silence further alerts for the remainder of the current screen session.

---

## Related User Stories

- **[[CRST-1034]]** - Add Delete Test - USID: USID Not Found Alert

**Epic:** LISP-266 [CRST][DEV] Add/Delete Test - USID

---

## Key Concepts

### USID Format
The USID Not Found check is only performed when the specimen number entered is in USID format. Non-USID specimen numbers are not checked for existence in the system.

### Specimen Not in System
If a specimen number is in USID format but does not exist in the system at all, the USID existence check is **skipped** — no alert is shown for that specimen. The alert is only triggered when the number is found to be a USID that **does not exist**, as opposed to a number that is simply unrecognised.

### Alert Suppression
The user may check a checkbox on message 4074 to suppress further USID Not Found alerts for the current screen session. This suppression is cleared when the Add Delete Test screen is closed and reopened.

---

## Trigger Point

Initiated as part of the Submit process on the Add Delete Test screen, in the pre-save phase, after other pre-submit validations.

---

## Workflow Scenarios

### Scenario 1: One or More USIDs Not Found in System

#### Prerequisites

- One or more specimen numbers entered in the [[USID Input Dialogue]] are in USID format.
- At least one of those USIDs does not currently exist in the system.
- Alert suppression has not been activated for the current screen session.

#### Process Flow

```mermaid
sequenceDiagram
    User->>Add Delete Test Screen: Click Submit
    Add Delete Test Screen->>System: Run pre-save checks
    System->>System: Check each USID-format specimen against system records
    System->>User: Display message 4074 with list of missing USID(s) + suppression checkbox
    alt User clicks OK
        User->>System: OK
        System->>Add Delete Test Screen: Proceed to next save functions
    alt User clicks X (close)
        User->>System: X
        System->>Add Delete Test Screen: Abort save; screen unchanged
    end
```

#### Step-by-Step Details

1. The user clicks **Submit** on the Add Delete Test screen.
2. The system runs pre-save checks and, for each specimen in USID format, verifies whether the USID exists in the system.
3. If one or more USIDs are not found, message **4074** is displayed, listing all the missing USID value(s).
4. The message also includes a checkbox labelled to allow the user to inactivate future USID Not Found alerts for this session.
5. The user chooses one of the following actions:

| User Action | Suppression Checkbox | Outcome |
|---|---|---|
| Click **OK** | Unchecked | Save proceeds to the next functions |
| Click **OK** | Checked | Save proceeds; alert suppressed for this session |
| Click **X** (close) | Unchecked | Save is aborted; screen data remains unchanged |
| Click **X** (close) | Checked | Save is aborted; alert suppressed for this session |

---

### Scenario 2: All USIDs Exist in System

#### Prerequisites

- All USID-format specimen numbers entered have been verified and exist in the system.

#### Step-by-Step Details

1. The system checks all USID-format specimens and finds no missing USIDs.
2. No message is displayed.
3. The Submit process continues normally to the next save functions.

---

### Scenario 3: Specimen Number Not in USID Format

#### Prerequisites

- The specimen number is not in USID format (e.g., a standard specimen number).

#### Step-by-Step Details

1. The system identifies that the specimen number is not in USID format.
2. The USID existence check is skipped entirely for that specimen.
3. The Submit process continues without alerting the user.

---

### Scenario 4: Alert Suppressed for Current Session

#### Prerequisites

- The user previously checked the suppression checkbox on message 4074 during the same screen session.

#### Step-by-Step Details

1. The user clicks **Submit** again (or submits in a subsequent action within the same session).
2. The system recognises that suppression is active.
3. Message 4074 is not displayed; the Submit process continues without prompting the user.
4. Suppression remains active until the Add Delete Test screen is closed and reopened.

---

## Error Messages and System Prompts

| Message | Description | Trigger | User Options |
|---|---|---|---|
| 4074 | One or more USIDs entered could not be found in the system. Lists all missing USID value(s). Includes a checkbox to suppress future alerts for this session. | Submit clicked; one or more USID-format specimen numbers do not exist in system records | **OK** (proceed) / **X** (abort) |

---

## Business Rules

1. The USID existence check is only performed when the specimen number is in USID format — non-USID specimen numbers are never checked for USID existence.
2. If a USID-format specimen number is not found in the system at all (i.e., the specimen does not exist as any record type), the check is skipped, not triggered.
3. All non-existent USIDs are combined into a single message 4074 occurrence — the user is not prompted once per USID.
4. Clicking **OK** on message 4074 allows the save to proceed regardless of the missing USIDs.
5. Clicking **X** (close) on message 4074 aborts the entire save; no data is written.
6. Checking the suppression checkbox, in combination with either **OK** or **X**, prevents message 4074 from appearing again until the Add Delete Test screen is closed and reopened.

---

## Related Workflows

- [[USID Input Dialogue]] — The dialogue where USID specimen numbers are entered. Values entered here are the ones validated at Submit time.
- [[Profile Not Mapped to Specimen Message]] — Another pre-submit check that runs in the same Submit process, validating specimen-to-profile mapping completeness.
- [[Create Specimen Profile Relation from Request]] — Establishes the set of specimen-profile relations that are submitted.
