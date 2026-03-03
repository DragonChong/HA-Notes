---
epic: LISP-255
status: draft
---
# User Validation

## Overview

After all validation checks pass, the system may require a secondary user authentication step before proceeding with the wipeout. A **User Validation Dialogue** is prompted, requiring the user to enter a valid username and password before the wipeout action is committed. This additional authorisation is configurable per laboratory and ensures that sensitive wipeout actions are approved by an authorised user. If the dialogue is cancelled, access is denied and the wipeout does not proceed.

> **Shared logic:** This behaviour is identical to Cancel Request. See [[Cancel Request/Workflows/Cancel Action/User Validation|User Validation (Cancel Request)]] for the full specification, including the `WORKSHEET_PROPERTY` configuration details and the lab function naming pattern.

---

## Related User Stories

- **[[CRST-994]]** - Wipeout Request - User Validation
- Full logic reference: **[[CRST-939]]** (Cancel Request - User Validation)

**Epic:** LISP-255 [CRST][DEV] Wipeout Request — Wipeout Action

---

## Trigger Point

Step 4 of the wipeout pipeline. Triggered after all validation checks pass (step 3). The system checks whether User Validation is configured for the retrieved request's laboratory. If so, the User Validation Dialogue is displayed. If not, the pipeline proceeds silently to step 5 (Ask for Confirmation).

---

## Lab-to-Worksheet Mapping

The worksheet name used for each laboratory's Wipeout Request security check is:

| Lab No. | Laboratory | Worksheet Name |
|---------|-----------|----------------|
| 1 | Chemistry | `w_lis_gen_wipeout_request` |
| 2 | Genetics | `w_lis_gns_wipeout_request` |
| 3 | Haematology | `w_lis_gen_wipeout_request` |
| 4 | Immunology | `w_lis_gen_wipeout_request` |
| 5 | Histology | `w_lis_hist_wipeout_request` |
| 6 | Blood Bank | `w_lis_bbnk_wipeout_request` |
| 7 | Microbiology | `w_lis_micro_wipeout_request` |
| 8 | Virology | `w_lis_vrs_wipeout_request` |
| 9 | CRS | `w_lis_crs_wipeout_request` |

---

## Workflow Scenarios

### Scenario 1: User Validation Dialogue Is Displayed

#### Process Flow

```mermaid
sequenceDiagram
    participant Operator
    participant Wipeout Screen
    participant User Validation Dialogue

    Wipeout Screen->>User Validation Dialogue: Display User Validation Dialogue
    User Validation Dialogue->>Operator: Prompt for username and password
    alt Valid credentials entered — OK clicked
        Operator->>User Validation Dialogue: Enter username and password; click OK
        User Validation Dialogue->>Wipeout Screen: Proceed to step 5 (Ask for Confirmation)
    else Cancel clicked
        Operator->>User Validation Dialogue: Click Cancel
        User Validation Dialogue->>Operator: Message 675 — "Access Denied." (OK)
        User Validation Dialogue->>Wipeout Screen: Abort; retain screen data
    end
```

### Scenario 2: User Validation Not Configured (Dialogue Suppressed)

The system checks the worksheet property for the retrieved request's laboratory. If the popup window flag is not enabled, the User Validation Dialogue is not displayed and the pipeline continues silently.

---

## Messages

| Message | Text | Trigger | User Options |
|---------|------|---------|-------------|
| 675 | "Access Denied." | Operator clicks **Cancel** on the User Validation Dialogue | OK (dismiss) |

---

## Business Rules

1. User Validation is per-laboratory — the worksheet name differs between labs (see mapping table above).
2. When the popup window is disabled, the system does not display the dialogue but still evaluates the operator's access rights silently.
3. Cancelling the User Validation Dialogue always aborts the wipeout — there is no retry within the same pipeline execution.

---

## Related Workflows

- [[Validation]] — Step 3 of the wipeout pipeline; runs immediately before User Validation.
- [[Ask for Confirmation]] — Step 5 of the wipeout pipeline; runs after User Validation passes.
