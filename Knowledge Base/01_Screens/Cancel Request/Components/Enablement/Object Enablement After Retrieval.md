---
epic: LISP-246
status: draft
---
# Object Enablement After Retrieval

## Overview

When a request is successfully retrieved on the Cancel Request screen, the screen transitions from its default empty and locked state into an active state where the appropriate buttons and fields become available. Which buttons are enabled and which fields are editable depends on whether the retrieved request already has a saved cancel comment, and on the user's access rights. This document describes the full enablement rules for each screen object after retrieval.

---

## Related User Stories

- **[[CRST-932]]** - Cancel Request - Object Enablement After Retrieval

**Epic:** LISP-246 [CRST][DEV] Cancel Request - Screen Object Enablement

---

## Key Concepts

### Cancel Comment Test
A request may already have a saved cancel comment (recorded as a text result against a configured test). If such a comment exists, the Cancel Request button is disabled and the Update Reason / Authorize Reason buttons become relevant. See [[Cancel Comment Test]] for the full retrieval logic.

### Amend Cancel Comment Setting
The lab option `AMEND_CANCEL_COMMENT` (option_group = `CANCEL`) controls whether staff may edit the **Cancel Reason Text Input** and enable the **Retain Cancel Reason Checkbox** after retrieval. If this option is not configured or has option_value ≠ 1, those controls remain locked — unless no cancel comment test exists, in which case they are always editable (see Business Rules).

### User Access Rights
Button availability for Update Reason and Authorize Reason is governed by worksheet-level access rights specific to each lab's Cancel Request worksheet.

---

## Worksheet IDs

The access right check for Cancel Request uses the following worksheet IDs per lab:

| Lab | Lab No. | Worksheet ID |
|-----|---------|--------------|
| CPS | 1 | `w_lis_gen_cancel_request_comcode` |
| GNS | 2 | `w_lis_gns_cancel_request` |
| HMS | 3 | `w_lis_gen_cancel_request_comcode` |
| IMS | 4 | `w_lis_gen_cancel_request_comcode` |
| APS | 5 | `w_lis_hist_cancel_request` |
| BBS | 6 | `w_lis_bbnk_cancel_request` |
| MBS | 7 | `w_lis_micro_cancel_request` |
| VRS | 8 | `w_lis_gen_cancel_request_comcode` |
| CRS | 9 | `w_lis_crs_cancel_request` |

---

## Screen Object Enablement

### Before Retrieval (Initial State)

When the Cancel Request screen first opens, all action buttons and input controls are in their default locked state:

| Screen Object | State |
|---------------|-------|
| Request No. Text Input | Empty, accepting input |
| Cancel Request Button | Disabled |
| Update Reason Button | Disabled |
| Authorize Reason Button | Disabled |
| Cancel Reason Text Input | Non-editable |
| Retain Cancel Reason Checkbox | Disabled |

---

### After Retrieval — Request Without Saved Cancel Comment

When the retrieved request has no previously saved cancel comment:

| Screen Object | State After Retrieval |
|---------------|-----------------------|
| Request No. Text Input | Populated, **non-editable** |
| Cancel Request Button | ✅ **Enabled** |
| Update Reason Button | Disabled |
| Authorize Reason Button | Disabled |
| Cancel Reason Text Input | **Editable** |
| Retain Cancel Reason Checkbox | **Enabled** |

> When there is no saved cancel comment, the **Cancel Reason Text Input** and **Retain Cancel Reason Checkbox** are always editable and enabled, regardless of the `AMEND_CANCEL_COMMENT` lab option.

---

### After Retrieval — Request With Saved Cancel Comment

When the retrieved request already has a saved cancel comment, the **Cancel Request Button** is always disabled. Whether the **Update Reason** and **Authorize Reason** buttons become enabled depends on the user's access rights on the Cancel Request worksheet:

#### Button Enablement Matrix

| User Access Right | Cancel Request Button | Update Reason Button | Authorize Reason Button |
|-------------------|-----------------------|----------------------|------------------------|
| Has `cbx_authorize_comment` | Disabled | ✅ Enabled | ✅ Enabled |
| Has `cbx_update_comment` only | Disabled | ✅ Enabled | Disabled |
| Has neither right | Disabled | Disabled | Disabled |

> **Note:** Having `cbx_authorize_comment` automatically enables **Update Reason** as well — both buttons are enabled together for authorizers.

#### Cancel Reason Text Input and Retain Cancel Reason Checkbox

Editability of these controls is governed by the `AMEND_CANCEL_COMMENT` lab option:

| Lab Option `AMEND_CANCEL_COMMENT` | Cancel Reason Text Input | Retain Cancel Reason Checkbox |
|------------------------------------|--------------------------|-------------------------------|
| option_value = 1 (enabled) | **Editable** | **Enabled** |
| Not configured or option_value ≠ 1 | Non-editable | Disabled |

---

## CRS-Specific Behaviour

When Cancel Request is used in the CRS application, the following additional behaviours apply:

### Worksheet Title
After a request is retrieved, the worksheet title is appended with the name of the requesting laboratory for the retrieved request (e.g., "Cancel Request — Haematology").

### Lab-Specific Setup Loading
In CRS, the lab-specific keyword setup (keyword group code `CANCOM`) and the corresponding button and access right configuration must be loaded for the **performing lab** of the retrieved request, not the current user's default lab. When a request from a performing lab is retrieved, the Cancel Comment Buttons, Update Reason Button, and Authorize Reason Button are enabled according to that lab's configuration and the user's access rights against that lab's worksheet.

> In practice, if lab-specific keywords for the performing lab have not been loaded, the Cancel Comment Buttons will not be visible and the Update Reason and Authorize Reason buttons will not be enabled even for users with appropriate access rights. This is a known limitation of the current system in CRS.

---

## Configuration

| Setting | Option Code | Purpose | Effect when enabled | Effect when disabled |
|---------|-------------|---------|---------------------|----------------------|
| Amend Cancel Comment | `AMEND_CANCEL_COMMENT` *(option_group = `CANCEL`)* | Controls whether staff may edit the cancel reason and retain checkbox after retrieval when a comment already exists | Cancel Reason Text Input editable; Retain Cancel Reason Checkbox enabled | Both controls remain locked after retrieval |

---

## Business Rules

1. The **Request No. Text Input** is always non-editable after retrieval — the request number cannot be changed on the Cancel Request screen.
2. When no saved cancel comment exists, **Cancel Request Button** is enabled immediately on retrieval; Update Reason and Authorize Reason remain disabled.
3. When a saved cancel comment exists, the **Cancel Request Button** is always disabled — cancellation must go through the Update/Authorize comment flow first.
4. When no saved cancel comment exists, the **Cancel Reason Text Input** and **Retain Cancel Reason Checkbox** are always editable and enabled after retrieval, regardless of the `AMEND_CANCEL_COMMENT` lab option. The option only restricts editing when a comment already exists.
5. Having the `cbx_authorize_comment` right enables both **Authorize Reason** and **Update Reason** buttons simultaneously.
6. Having only the `cbx_update_comment` right enables **Update Reason** but leaves **Authorize Reason** disabled.
7. Access right checks use the worksheet ID of the **performing lab** for the retrieved request, not the user's default lab.
8. In CRS, lab-specific setup (comment codes, buttons, access rights) is loaded per performing lab at the time of request retrieval.

---

## Related Components

- [[Default Screen Behavior]] — The initial state of the screen before any request is retrieved.
- [[Cancel Comment Test]] — Determines whether a saved cancel comment exists on the retrieved request, which drives the button enablement rules.

## Related Workflows

- [[Retrieve Request]] — Retrieval is the trigger for all enablement changes described in this document.
- [[Request Cancelled Message]] — Describes what happens after the enabled Cancel Request Button is clicked.
