---
epic: LISP-253
status: draft
---
# Object Enablement After Retrieval

## Overview

When a request is successfully retrieved on the Wipeout Request screen, the screen transitions from its default empty and locked state into an active state where the **Wipeout Request** button and other relevant controls become available. The enablement rules for Wipeout Request are simpler than those for Cancel Request because there is no concept of a saved cancel comment, no Update Reason or Authorize Reason buttons, and no Cancel Reason text input — the Wipeout Request button simply becomes enabled after a successful retrieval.

> **Shared logic base:** The general enablement mechanism is shared with Cancel Request (CRST-932). The Wipeout Request variant excludes all Cancel Comment-specific buttons and text inputs. See [[Cancel Request/Components/Enablement/Object Enablement After Retrieval|Object Enablement After Retrieval (Cancel Request)]] for the Cancel Request equivalent.

---

## Related User Stories

- **[[CRST-988]]** - Wipeout Request - Object Enablement After Retrieval

**Epic:** LISP-253 [CRST][DEV] Wipeout Request — Screen Object Enablement

---

## Worksheet IDs

The access right check for Wipeout Request uses the following worksheet IDs per lab:

| Lab | Lab No. | Worksheet ID |
|-----|---------|--------------|
| CPS | 1 | `w_lis_gen_wipeout_request` |
| GNS | 2 | `w_lis_gns_wipeout_request` |
| HMS | 3 | `w_lis_gen_wipeout_request` |
| IMS | 4 | `w_lis_gen_wipeout_request` |
| APS | 5 | `w_lis_hist_wipeout_request` |
| BBS | 6 | `w_lis_bbnk_wipeout_request` |
| MBS | 7 | `w_lis_micro_wipeout_request` |
| VRS | 8 | `w_lis_vrs_wipeout_request` |
| CRS | 9 | `w_lis_crs_wipeout_request` |

---

## Screen Object Enablement

### Before Retrieval (Initial State)

When the Wipeout Request screen first opens, all action buttons and input controls are in their default locked state:

| Screen Object | State |
|---------------|-------|
| Request No. Text Input | Empty, accepting input |
| Wipeout Request Button | Disabled |

---

### After Retrieval

When a request has been successfully retrieved:

| Screen Object | State After Retrieval |
|---------------|-----------------------|
| Request No. Text Input | Populated, **non-editable** |
| Wipeout Request Button | ✅ **Enabled** |

---

## CRS-Specific Behaviour

When Wipeout Request is used in the CRS application, the worksheet title is appended with the name of the performing lab for the retrieved request (e.g., "Wipeout Request — Haematology"). The lab-specific configuration is loaded for the **performing lab** of the retrieved request.

---

## Business Rules

1. The **Request No. Text Input** is always non-editable after retrieval.
2. The **Wipeout Request Button** is enabled immediately on retrieval.
3. Unlike Cancel Request, there is no saved cancel comment concept — the Wipeout Request button is enabled for all retrieved requests without exception.
4. Unlike Cancel Request, there are no Update Reason, Authorize Reason, Cancel Comment buttons, Cancel Reason Text Input, or Retain Cancel Reason Checkbox on this screen.

---

## Related Components

- [[Default Screen Behavior]] — The initial state of the screen before any request is retrieved.

## Related Workflows

- [[Retrieve Request]] — Retrieval is the trigger for all enablement changes described here.
