---
epic: LISP-257
status: draft
---
# VIRO - Pair Specimen Check

## Overview

When a Virology (VIRO) request that has a paired specimen is retrieved in the Wipeout Request screen, the system prompts the user to confirm before proceeding with the wipeout. If the request is the First Specimen in a paired set and the Pair Up Test configuration cannot be found, the wipeout is blocked. This is a VIRO-specific validation step with no equivalent in Cancel Request.

---

## Related User Stories

- **[[CRST-1005]]** — Wipeout Request — VIRO: Pair Specimen Check

**Epic:** LISP-257 [CRST][DEV] Wipeout Request — Special Lab Workflow (VIRO)

---

## Key Concepts

### Paired Specimen
A VIRO request may be part of a paired specimen set. The pair is identified by two request numbers stored in the `vr_request` table: the First Specimen Request (`req_reqno`) and the Second Specimen Request (`req_paired_reqno`). When either request in the pair is retrieved, the system also loads information about the paired request.

### First Specimen Request
The request whose number is stored in `req_reqno`. Wiping out the First Specimen Request has implications for the Second Specimen's test results.

### Second Specimen Request
The request whose number is stored in `req_paired_reqno`.

### Pair Up Test Configuration
A lab option that defines the test key used for pairing. Stored as `option_text` of `lab_option` where `option_group = 'PAIRUP'` and `option_code = 'PAIRUP_TEST'`. If this configuration is missing, the system cannot safely proceed with wiping out the First Specimen.

---

## Trigger Point

The Pair Specimen Check is part of the validation step in the wipeout pipeline. It runs when the **Wipeout Request** button is clicked, as a VIRO lab-specific security check.

---

## Workflow Scenarios

### Scenario 1: Request Has a Paired Specimen — User Confirms

#### Prerequisites
- The retrieved request is a VIRO request.
- The request has a paired specimen (a pair request number is present).

#### Process Flow

```mermaid
sequenceDiagram
    participant User
    participant Wipeout Screen

    Wipeout Screen->>User: Prompt message 1886 (paired specimen warning)
    User->>Wipeout Screen: Click Yes

    alt Request is First Specimen AND Pair Up Test config is missing
        Wipeout Screen->>User: Prompt message 1889 (pair maintenance failed)
        User->>Wipeout Screen: Click OK
        Wipeout Screen->>Wipeout Screen: Abort wipeout; retain request data
    else All OK
        Wipeout Screen->>Wipeout Screen: Proceed with wipeout
    end
```

#### Step-by-Step Details

1. The system detects that the retrieved VIRO request has a paired specimen.
2. Message 1886 is prompted to alert the user that this request is part of a pair.
3. **If the user clicks No:** The wipeout is aborted. The retrieved request data remains on the screen.
4. **If the user clicks Yes:**
   - The system checks whether the request is the First Specimen.
   - If it is the First Specimen, the system checks whether the Pair Up Test configuration (`PAIRUP_TEST`) exists.
     - If the configuration **cannot be found**, message 1889 is prompted. After the user clicks **OK**, the wipeout is aborted. The retrieved request data remains on the screen.
     - If the configuration **is found**, the wipeout pipeline proceeds.
   - If it is the Second Specimen (not First), the wipeout pipeline proceeds without checking the Pair Up Test configuration.

---

### Scenario 2: Request Has a Paired Specimen — User Declines

#### Step-by-Step Details

1. Message 1886 is prompted.
2. The user clicks **No**.
3. The wipeout is aborted. The retrieved request data remains on the screen.

---

### Scenario 3: Request Has No Paired Specimen

#### Prerequisites
- The retrieved VIRO request has no pair request number.

#### Step-by-Step Details

1. No paired specimen is found.
2. Message 1886 is not prompted.
3. The wipeout pipeline proceeds to the next step.

---

## Messages

| Message | Text | Trigger | User Options |
|---|---|---|---|
| 1886 | *(Paired specimen warning)* | VIRO request has a paired specimen | Yes (proceed) / No (abort) |
| 1889 | *(Pair Request Maintenance Failed)* | User confirms Yes on msg 1886; request is First Specimen; Pair Up Test config not found | OK (dismiss; wipeout aborted) |

---

## Configuration

| Setting | Option Code | Purpose | Effect when present | Effect when absent |
|---------|------------|---------|--------------------|--------------------|
| Pair Up Test | `PAIRUP_TEST` *(under option group `PAIRUP`)* | Defines the test key used for pairing specimens | First Specimen wipeout may proceed (subject to other checks) | Wipeout of First Specimen is blocked (message 1889) |

---

## Business Rules

1. Message 1886 is shown only when the VIRO request has a paired specimen.
2. Responding No to message 1886 unconditionally aborts the wipeout; the screen data is retained.
3. Message 1889 is shown only when: the user confirms Yes on message 1886, the request is the First Specimen, and the Pair Up Test configuration cannot be found.
4. Message 1889 always aborts the wipeout — there is no override path.
5. If the request is the Second Specimen, message 1889 is never shown regardless of the Pair Up Test configuration.
6. If the request has no paired specimen, neither message 1886 nor message 1889 is shown.

---

## Related Workflows

- [[VIRO - Wipeout Request]] — The request packing step that includes pair specimen data for the backend wipeout process.
- [[Wipeout Request (Action)]] — The full wipeout pipeline.
