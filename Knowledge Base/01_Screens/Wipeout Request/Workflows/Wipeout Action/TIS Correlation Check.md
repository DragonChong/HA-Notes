---
epic: LISP-255
status: draft
---
# TIS Correlation Check

## Overview

When a TIS (Transfusion Information System) request that is correlated with another request is retrieved in the Wipeout Request screen, the system checks for that correlation before allowing the wipeout to proceed. If a correlation is found, message 2738 is prompted to alert the user to remove the correlation first. Wipeout is blocked until the correlation is resolved. This check is unique to Wipeout Request and has no equivalent in Cancel Request.

---

## Related User Stories

- **[[CRST-999]]** — Wipeout Request — TIS Correlation Check

**Epic:** LISP-255 [CRST][DEV] Wipeout Action

---

## Key Concepts

### TIS Correlation
A request is considered correlated when there exists a record in the `tis_correlation` table where the request number appears as either the patient request (`pat_reqno`) or the donor request (`donor_reqno`).

### Performing Lab
The lab to which the retrieved request belongs. TIS Correlation Checking is currently enabled for TIS lab only.

---

## Trigger Point

The TIS Correlation Check is part of the validation step in the wipeout pipeline. It runs when the **Wipeout Request** button is clicked, after the initial confirmation, as part of gathering and validating server information.

---

## Workflow Scenarios

### Scenario 1: Correlated Request — Wipeout Blocked

#### Prerequisites
- The retrieved request is a TIS request.
- The performing lab is configured to enable TIS Correlation Checking (lab option `CHECK_TIS_CORRELATION` = 1 under `TEST_MAINTENANCE`).
- A record exists in the `tis_correlation` table linking the request as either patient request or donor request.

#### Process Flow

```mermaid
sequenceDiagram
    participant User
    participant Wipeout Screen
    participant Server

    User->>Wipeout Screen: Click Wipeout Request button
    Wipeout Screen->>Server: Gather validation information
    Server-->>Wipeout Screen: Correlation flag set
    Wipeout Screen->>User: Prompt message 2738
    User->>Wipeout Screen: Click OK
    Wipeout Screen->>Wipeout Screen: Abort wipeout; retain request data
```

#### Step-by-Step Details

1. The user clicks the **Wipeout Request** button on a retrieved TIS request.
2. The system checks whether TIS Correlation Checking is enabled for the performing lab.
3. The system queries the server to determine whether the request is correlated (appears in `tis_correlation` as either `pat_reqno` or `donor_reqno`).
4. If a correlation is found, message 2738 is prompted. The message text differs slightly depending on whether the request is correlated as a patient request or as a donor request.
5. The user clicks **OK** to dismiss the message.
6. The wipeout process is aborted. The retrieved request information remains on the screen.

---

### Scenario 2: No Correlation — Wipeout Proceeds

#### Prerequisites
- TIS Correlation Checking is enabled for the performing lab.
- No correlation record exists for the retrieved request.

#### Step-by-Step Details

1. The system checks and finds no correlation.
2. The TIS Correlation Check passes silently.
3. The wipeout pipeline continues to the next step.

---

### Scenario 3: TIS Correlation Checking Not Enabled

#### Prerequisites
- The performing lab does not have TIS Correlation Checking enabled (lab option `CHECK_TIS_CORRELATION` ≠ 1).

#### Step-by-Step Details

1. The correlation check is skipped entirely.
2. The wipeout pipeline continues to the next step without any correlation check.

---

## Summary Tables

### Messages

| Message | Text | Trigger | User Options |
|---|---|---|---|
| 2738 | *(TIS correlation alert — correlated as patient request)* | Request found as patient request in `tis_correlation` | OK (dismiss; wipeout aborted) |
| 2738 | *(TIS correlation alert — correlated as donor request)* | Request found as donor request in `tis_correlation` | OK (dismiss; wipeout aborted) |

### Correlation Type Variants

| Correlation Type | Condition | Message |
|---|---|---|
| Patient Request | `tis_correlation.pat_reqno = <request no.>` | 2738 (patient request variant) |
| Donor Request | `tis_correlation.donor_reqno = <request no.>` | 2738 (donor request variant) |

---

## Configuration

| Setting | Option Code | Purpose | Effect when enabled | Effect when disabled |
|---------|------------|---------|--------------------|--------------------|
| TIS Correlation Checking | `CHECK_TIS_CORRELATION` *(under option group `TEST_MAINTENANCE`)* | Controls whether TIS Correlation Checking is performed before a wipeout | Correlation check runs; message 2738 shown if correlated | Correlation check is skipped |

---

## Business Rules

1. TIS Correlation Checking runs only when the performing lab is configured to enable it via the `CHECK_TIS_CORRELATION` lab option.
2. A request is considered correlated if it appears in the `tis_correlation` table as either `pat_reqno` or `donor_reqno`.
3. If a correlation is found, wipeout is always blocked — there is no override path.
4. The user must resolve the correlation externally (e.g., in TIS) before the wipeout can be performed.
5. After clicking OK on message 2738, the retrieved request data remains on the screen; the user is not required to clear or re-retrieve.
6. This check is currently enabled in TIS only — other labs do not trigger the correlation check even if configured.

---

## Related Workflows

- [[Validation]] — The general validation step within which TIS Correlation Check is incorporated.
- [[Wipeout Request (Action)]] — The action step that follows successful completion of all validation checks.
