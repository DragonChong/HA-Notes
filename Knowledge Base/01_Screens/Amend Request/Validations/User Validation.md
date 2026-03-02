---
epic: LISP-223
status: draft
---
# User Validation

## Overview

When the **Amend** button is clicked, the system may require a secondary user authentication step before proceeding with the amendment. A **User Validation Dialogue** is prompted, requiring the user to enter a valid username and password before the amendment is saved. This additional layer of authorisation is configurable per laboratory and ensures that sensitive amendments are approved by an authorised user. If the dialogue is cancelled, access is denied and the amendment does not proceed.

---

## Related User Stories

- **[[CRST-798]]** - Amend Request - User Validation
- **[[CRST-797]]** - Amend Request - Validation (AmendRequestDataValidator) *(parent validation story)*

**Epic:** LISP-223 [CRST][DEV] Amend Request - Amend Action

---

## Key Concepts

### User Validation Dialogue
A modal dialogue that prompts the user to enter a username and password before the amendment is saved. This is a secondary authorisation check — distinct from the user's own login — and may be satisfied by any user with the appropriate access right assigned.

### Worksheet Property
A per-lab database configuration (`WORKSHEET_PROPERTY` table) that controls whether the User Validation Dialogue is triggered for a given laboratory's Amend Request screen. The worksheet name is lab-specific and must have the popup and default authorisation flags enabled.

### Lab Function
A function group entry (`LAB_FUNCTION` / `FUNCTION_GROUP` tables) that grants a user the right to authorise the amendment via the User Validation Dialogue. Each lab has a distinct function name.

---

## Trigger Point

After all field-level validations pass and the **Amend** button is clicked, the system checks whether User Validation is configured for the retrieved request's laboratory. If so, the User Validation Dialogue is displayed before the amendment is saved.

---

## Lab-to-Worksheet Mapping

The worksheet name used for each laboratory's Amend Request security check is:

| Lab No. | Laboratory | Worksheet Name |
|---------|-----------|----------------|
| 1 | Chemistry | `w_lis_gen_amend_request` |
| 2 | Genetics | `w_lis_gns_amend_request` |
| 3 | Haematology | `w_lis_gen_amend_request` |
| 4 | Immunology | `w_lis_gen_amend_request` |
| 5 | Histology | `w_lis_hist_amend_request` |
| 6 | Blood Bank | `w_lis_bbnk_amend_request` |
| 7 | Microbiology | `w_lis_micro_amend_request` |
| 8 | Virology | `w_lis_vrs_amend_request` |
| 9 | CRS | `w_lis_crs_amend_request` |

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

*The `LAB_FUNCTION` entry is checked via `FUNCTION_GROUP` to determine whether the authenticating user has the required access right for the specific lab.*

---

## Interaction Behaviours

#### User Validation Dialogue is displayed
The User Validation Dialogue prompts for a username and password. The user must enter valid credentials and click **OK** to proceed.

#### User enters valid credentials and clicks OK
The system validates the credentials. If valid, the amendment proceeds and the request is updated.

#### User clicks Cancel
Message 675 — **"Access Denied."** — is displayed. The amendment does not proceed.

---

## Messages

| Message | Text | Trigger | User Options |
|---------|------|---------|-------------|
| 675 | "Access Denied." | User clicks **Cancel** on the User Validation Dialogue | OK (dismiss) |

---

## Related Workflows

- [[Amend Request Validation]] — User Validation runs as the final authorisation step after all field-level validations pass and before the amendment is saved.
