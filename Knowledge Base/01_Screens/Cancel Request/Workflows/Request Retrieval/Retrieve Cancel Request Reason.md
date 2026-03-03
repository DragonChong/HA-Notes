---
epic: LISP-245
status: draft
---
# Retrieve Cancel Request Reason

## Overview

When a cancelled lab request is retrieved on the Cancel Request screen, the system attempts to locate the cancel reason that was previously recorded against the request. If the cancel reason test key configured in the lab option matches both the test group key and the test member key of an existing test result on the request, the stored cancel reason text is loaded into the **Cancel/Reject Reason** panel. This allows registration staff to view — and optionally amend — the reason for which the request was originally cancelled.

Whether the cancel reason may be edited after retrieval depends on a separate lab option. If the request has not yet been cancelled, editing is always permitted.

---

## Related User Stories

- **[[CRST-980]]** - Cancel Request - Retrieve Cancel Request Reason

**Epic:** LISP-245 Cancel Request - Request Retrieval

---

## Key Concepts

### Cancel Comment Test
A specific test result entry (`TESTRSLT`) stored against the lab request that holds the cancel reason text. The system identifies it by matching both its group key (`testrslt_header_ckey`) and its member key (`testrslt_member_ckey`) against the test key configured in the **CANCEL_COMMENT** lab option.

### Cancel Comment Test Key
The test key value read from `LAB_OPTION` (`option_group = 'CANCEL'`, `option_code = 'CANCEL_COMMENT'`). Both the group key and member key of the test result must equal this value for the test to be recognised as the cancel comment test.

---

## Trigger Point

This behaviour is part of the request retrieval flow. After the system successfully locates the lab request and loads its data, it attempts to identify the cancel reason test and loads any stored reason text into the screen before the screen transitions to the ready state.

See [[Retrieve Request]] for the full retrieval flow.

---

## Workflow Scenarios

### Scenario 1: Cancel Reason Retrieved Successfully

#### Prerequisites
- The lab request has previously been cancelled.
- `LAB_OPTION` (`option_group = 'CANCEL'`, `option_code = 'CANCEL_COMMENT'`) contains a test key value (e.g., 4010).
- The cancelled request has a test result (`TESTRSLT`) where **both** `testrslt_header_ckey` and `testrslt_member_ckey` equal the configured test key, with counter value 1 for both the test and its group.
- `TESTRSLT.testrslt_varchar` contains the previously recorded cancel reason text.

#### Process Flow

```mermaid
sequenceDiagram
    participant User
    participant Cancel Request Screen
    participant System

    User->>Cancel Request Screen: Enter request number
    Cancel Request Screen->>System: Retrieve lab request data
    System-->>Cancel Request Screen: Lab request + test results returned
    Cancel Request Screen->>Cancel Request Screen: Find cancel comment test<br/>(match header_ckey AND member_ckey with CANCEL_COMMENT key)
    Cancel Request Screen->>Cancel Request Screen: Load cancel reason text into Cancel/Reject Reason panel
    Cancel Request Screen->>Cancel Request Screen: Check amend permission
    Cancel Request Screen->>User: Screen ready; cancel reason displayed; edit allowed or locked
```

#### Step-by-Step Details

1. After the lab request data is returned from the server, the system searches all test result entries associated with the request.
2. For each test result group and its member tests, the system checks whether:
   - The group key equals the configured Cancel Comment Test Key, **and**
   - The test member key equals the same Cancel Comment Test Key, **and**
   - The group counter value is 1, **and**
   - The test counter value is 1.
3. The first test result that satisfies all four conditions is identified as the **cancel comment test**.
4. If the cancel comment test is found and its stored text is not blank, the system loads the text into the **Cancel/Reject Reason** panel and checks the **Cancel Reason** checkbox.
5. The system then determines whether the cancel reason may be edited:
   - If the cancel comment test was found (i.e., the request has been cancelled), edit permission is controlled by the **AMEND_CANCEL_COMMENT** lab option (`option_group = 'CANCEL'`, `option_code = 'AMEND_CANCEL_COMMENT'`).
   - If the lab option is enabled, the **Cancel/Reject Reason** panel is editable.
   - If the lab option is disabled, the **Cancel/Reject Reason** panel is read-only.
6. The screen transitions to the ready state.

---

### Scenario 2: Cancel Reason Not Retrieved (Key Mismatch)

#### Prerequisites
- The lab request has previously been cancelled.
- The configured Cancel Comment Test Key does **not** match both keys of the stored test result (either `testrslt_header_ckey` or `testrslt_member_ckey` differs from the configured key).

#### Process Flow

```mermaid
sequenceDiagram
    participant User
    participant Cancel Request Screen
    participant System

    User->>Cancel Request Screen: Enter request number
    Cancel Request Screen->>System: Retrieve lab request data
    System-->>Cancel Request Screen: Lab request + test results returned
    Cancel Request Screen->>Cancel Request Screen: Find cancel comment test<br/>(no match found — key mismatch)
    Cancel Request Screen->>User: Screen ready; Cancel/Reject Reason panel is empty and editable
```

#### Step-by-Step Details

1. The system performs the same search as Scenario 1 but finds no test result where both the group key and the member key match the configured Cancel Comment Test Key.
2. The cancel comment test is considered absent (null).
3. The **Cancel/Reject Reason** panel remains empty.
4. Because no prior cancel reason test was found, editing is permitted regardless of the **AMEND_CANCEL_COMMENT** option.
5. The screen transitions to the ready state.

> **Note:** The key mismatch can occur in any of three ways: both keys differ from the configured key; only the group key (`testrslt_header_ckey`) differs; or only the member key (`testrslt_member_ckey`) differs. In all three cases, no cancel reason is retrieved.

---

### Scenario 3: Request Not Yet Cancelled — Cancel Reason Always Editable

#### Prerequisites
- The lab request is not in a cancelled status (no cancel comment test result exists).

#### Step-by-Step Details

1. The system searches for the cancel comment test and finds none.
2. The cancel comment test is null.
3. The **Cancel/Reject Reason** panel is empty and editable.
4. Edit permission is unconditionally granted because no prior cancellation exists.

---

## Summary Tables

### Cancel Reason Retrieval Logic

| CANCEL_COMMENT key configured | testrslt_header_ckey matches key | testrslt_member_ckey matches key | Both counters = 1 | Cancel Reason Retrieved |
|---|---|---|---|---|
| Yes | Yes | Yes | Yes | Yes — text loaded into panel |
| Yes | Yes | No | — | No |
| Yes | No | Yes | — | No |
| Yes | No | No | — | No |
| No (null) | — | — | — | No (message 219 shown on init) |

### Cancel Reason Edit Permission

| Request cancelled? | Cancel Comment Test found? | AMEND_CANCEL_COMMENT enabled | Cancel/Reject Reason editable? |
|---|---|---|---|
| No | No (null) | N/A | Yes |
| Yes | Yes | Yes | Yes |
| Yes | Yes | No | No |

---

## Data Sources

| Data | Source |
|---|---|
| Cancel Comment Test Key | `LAB_OPTION` — `option_group = 'CANCEL'`, `option_code = 'CANCEL_COMMENT'` |
| Cancel reason text | `TESTRSLT.testrslt_varchar` of the matched cancel comment test |
| Test group key | `TESTRSLT.testrslt_header_ckey` |
| Test member key | `TESTRSLT.testrslt_member_ckey` |
| Amend permission flag | `LAB_OPTION` — `option_group = 'CANCEL'`, `option_code = 'AMEND_CANCEL_COMMENT'` |

---

## Configuration

| Setting | Option Code | Purpose | Effect when enabled | Effect when disabled |
|---------|------------|---------|--------------------|--------------------|
| Cancel Comment Test Key | `CANCEL_COMMENT` (`option_group = 'CANCEL'`) | Identifies the test result key used to store and retrieve the cancel reason | System searches for a matching test result and loads the cancel reason | Cancel reason is never retrieved; message **219** shown on screen initialisation if null |
| Amend Cancel Comment | `AMEND_CANCEL_COMMENT` (`option_group = 'CANCEL'`) | Controls whether staff may edit the cancel reason of an already-cancelled request | Cancel/Reject Reason panel is editable after retrieval | Cancel/Reject Reason panel is read-only after retrieval |

---

## Business Rules

1. Both the test group key (`testrslt_header_ckey`) and the test member key (`testrslt_member_ckey`) must match the configured Cancel Comment Test Key for the cancel reason to be retrieved. A partial match is treated as no match.
2. Only the first matching test result with counter value 1 for both the group and the test is used.
3. If the retrieved cancel reason text is blank, the **Cancel/Reject Reason** panel remains empty even though the test was found.
4. When the cancel comment test is absent (null), edit permission is always granted, regardless of the **AMEND_CANCEL_COMMENT** lab option.
5. When the cancel comment test is found (request was previously cancelled), edit permission is determined solely by the **AMEND_CANCEL_COMMENT** lab option.

---

## Related Workflows

- [[Retrieve Request]] — This workflow is a sub-step of the overall request retrieval; the cancel reason is loaded as part of populating the screen after the request data is returned.
- [[Cancel Comment Test]] — Describes how the cancel comment test is located within the test result structure.
- [[Object Enablement After Retrieval]] — The edit permission determined here directly controls whether the Cancel/Reject Reason panel is enabled or locked after the screen reaches the ready state.
