---
epic: LISP-247
status: draft
---
# User Validation

## Overview

After all validation checks pass, the system may require a secondary user authentication step before proceeding with the cancellation. A **User Validation Dialogue** is prompted, requiring the user to enter a valid username and password before the cancel action is committed. This additional authorisation is configurable per laboratory and ensures that sensitive cancellations are approved by an authorised user. If the dialogue is cancelled, access is denied and the cancellation does not proceed.

---

## Related User Stories

- **[[CRST-939]]** — Cancel Request — User Validation

**Epic:** LISP-247 [CRST][DEV] Cancel Request - Cancel Action

---

## Key Concepts

### User Validation Dialogue
A modal dialogue that prompts for a username and password before the cancel action is saved. This is a secondary authorisation check — distinct from the user's own login — and may be satisfied by any user who holds the appropriate access right for the relevant lab.

### Worksheet Property
A per-lab database configuration (`WORKSHEET_PROPERTY` table) that controls whether the User Validation Dialogue is triggered for a given laboratory's Cancel Request screen. The worksheet name is lab-specific and must have the popup and default authorisation flags enabled.

### Lab Function
A function group entry (`LAB_FUNCTION` / `FUNCTION_GROUP` tables) that grants a user the right to authorise the cancellation via the User Validation Dialogue. The function name follows the pattern `f_lis_auth_<worksheet_name>`, and is specific to each lab.

---

## Trigger Point

Step 4 of the eight-step cancel pipeline. Triggered after all validation checks pass (step 3). The system checks whether User Validation is configured for the retrieved request's laboratory. If so, the User Validation Dialogue is displayed. If not, the pipeline proceeds silently to step 5 (Ask for Confirmation).

---

## Lab-to-Worksheet Mapping

The worksheet name used for each laboratory's Cancel Request security check is:

| Lab No. | Laboratory | Worksheet Name |
|---------|-----------|----------------|
| 1 | Chemistry | `w_lis_gen_cancel_request_comcode` |
| 2 | Genetics | `w_lis_gns_cancel_request` |
| 3 | Haematology | `w_lis_gen_cancel_request_comcode` |
| 4 | Immunology | `w_lis_gen_cancel_request_comcode` |
| 5 | Histology | `w_lis_hist_cancel_request` |
| 6 | Blood Bank | `w_lis_bbnk_cancel_request` |
| 7 | Microbiology | `w_lis_micro_cancel_request` |
| 8 | Virology | `w_lis_gen_cancel_request_comcode` |
| 9 | CRS | `w_lis_crs_cancel_request` |

---

## Workflow Scenarios

### Scenario 1: User Validation Dialogue Is Displayed

#### Prerequisites
- All validation checks (step 3) have passed.
- The retrieved request's laboratory has the User Validation Dialogue configured (popup window enabled).

#### Process Flow

```mermaid
sequenceDiagram
    participant Operator
    participant Cancel Screen
    participant User Validation Dialogue

    Cancel Screen->>User Validation Dialogue: Display User Validation Dialogue
    User Validation Dialogue->>Operator: Prompt for username and password
    alt Valid credentials entered — OK clicked
        Operator->>User Validation Dialogue: Enter username and password; click OK
        User Validation Dialogue->>Cancel Screen: Proceed to step 5 (Ask for Confirmation)
    else Cancel clicked
        Operator->>User Validation Dialogue: Click Cancel
        User Validation Dialogue->>Operator: Message 675 — "Access Denied." (OK)
        User Validation Dialogue->>Cancel Screen: Abort; retain screen data
    end
```

#### Step-by-Step Details

1. All validation checks have passed. The system identifies the worksheet name for the retrieved request's laboratory (see mapping table above).
2. The system checks whether the popup window flag is enabled for that worksheet in the `WORKSHEET_PROPERTY` table.
3. The User Validation Dialogue is displayed, prompting the operator for a username and password.
4. **If the operator enters valid credentials and clicks OK:** The system validates the credentials. If the credentials are valid and the authenticating user holds the required lab function right, the pipeline proceeds to step 5.
5. **If the operator clicks Cancel:** Message 675 — *"Access Denied."* — is displayed with **OK**. Clicking **OK** dismisses the message. The cancellation is aborted and the screen data is retained.

---

### Scenario 2: User Validation Not Configured (Dialogue Suppressed)

#### Prerequisites
- The retrieved request's laboratory has the popup window flag disabled in `WORKSHEET_PROPERTY`.

#### Step-by-Step Details

1. The system checks the worksheet property for the retrieved request's laboratory.
2. The popup window flag is not enabled. The User Validation Dialogue is not displayed.
3. The system checks whether the current operator holds the right assigned via `f_lis_auth_<worksheet_name>` in `FUNCTION_GROUP`.
   - If the operator holds the right, the pipeline proceeds to step 5 with the authorisation implicitly granted.
   - If the operator does not hold the right, the default authorisation setting (`wksht_default_auth`) is applied.
4. In either case, the cancel pipeline continues without any prompt to the operator.

---

## Configuration

The User Validation Dialogue is triggered only when all of the following conditions are met for the retrieved request's laboratory:

| Configuration | Table | Column | Required Value | Purpose |
|--------------|-------|--------|---------------|---------|
| Worksheet popup enabled | `WORKSHEET_PROPERTY` | `wksht_popup_window` | `1` | Enables the User Validation Dialogue for the lab |
| Default authorisation enabled | `WORKSHEET_PROPERTY` | `wksht_default_auth` | `1` | Enables the default authorisation mode |
| Worksheet lab number | `WORKSHEET_PROPERTY` | `wksht_labno` | Lab-specific (see mapping table) | Identifies which lab this property applies to |
| Worksheet name | `WORKSHEET_PROPERTY` | `wksht_name` | Lab-specific (see mapping table) | Identifies which screen this property applies to |
| Lab function | `LAB_FUNCTION` | `lab_fnt_name` | `f_lis_auth_<worksheet_name>` | Grants a user the right to authorise via the dialogue |

*The `LAB_FUNCTION` entry is checked via `FUNCTION_GROUP` to determine whether the authenticating user holds the required access right for the specific lab.*

---

## Messages

| Message | Text | Trigger | User Options |
|---------|------|---------|-------------|
| 675 | "Access Denied." | Operator clicks **Cancel** on the User Validation Dialogue | OK (dismiss) |

---

## Business Rules

1. User Validation is per-laboratory — the worksheet name differs between labs and the configuration is evaluated independently for each lab.
2. When the popup window is disabled, the system does not display the dialogue but still evaluates the operator's access rights silently.
3. Cancelling the User Validation Dialogue always aborts the cancellation — there is no retry within the same pipeline execution.

---

## Related Workflows

- [[Validation]] — Step 3 of the cancel pipeline; runs immediately before User Validation.
- [[Ask for Confirmation]] — Step 5 of the cancel pipeline; runs after User Validation passes.
