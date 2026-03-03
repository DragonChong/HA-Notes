---
epic: LISP-251
status: draft
---
# Default Screen Behavior

## Overview

When the Wipeout Request screen is opened, it enters its initial state with all action controls disabled and non-editable until a request is retrieved. The layout includes a **Wipeout Request** button and a test grid. Depending on lab configuration, a read-only **Specimen and Site** section is also visible for MBS and VRS labs. Unlike the Cancel Request screen, there are no Cancel Reason text input, Cancel Comment shortcut buttons, Update Reason, Authorize Reason, or Retain Cancel Reason controls — the Wipeout Request screen is focused solely on the wipeout action.

> **Shared logic:** The test grid column construction and overall screen initialisation logic are shared with Cancel Request. See [[Cancel Request/Components/Default Screen Behavior|Default Screen Behavior (Cancel Request)]] for the equivalent Cancel Request document.

---

## Related User Stories

- **[[CRST-982]]** - Wipeout Request - Default Screen Behavior

**Epic:** LISP-251 [CRST][DEV] Wipeout Request — Layout

---

## Screen Object States on Opening

### Wipeout Request Button

| Control | Initial State |
|---------|--------------|
| **Wipeout Request** button | Visible, **disabled** |

The button remains disabled until a request has been successfully retrieved.

---

### Specimen and Site Section

A read-only section showing the specimen and site information for the request. Visibility is determined by the performing lab.

| Lab | Section Visible |
|-----|----------------|
| MBS (Microbiology) | Yes |
| VRS (Virology) | Yes |
| All other labs (CPS, HMS, IMS, APS, BBS, GNS, etc.) | No |

> The Specimen and Site section is read-only — it displays information only and cannot be edited on the Wipeout Request screen.

---

### Test Grid

The Test Grid displays the tests attached to the retrieved request. The columns shown depend on whether the USID (Universal Specimen ID) feature is enabled for the performing lab and hospital.

| Configuration | Specimen Column Shown |
|--------------|-----------------------|
| USID enabled for the performing lab | Yes |
| USID disabled for the performing lab | No |

USID enablement is controlled by the lab option with `option_group = 'USID'` and `option_code = 'ENABLE'` (values 1, 2, or 3 indicate enabled).

---

## Configuration

| Setting | Option Code | Purpose | Effect when enabled | Effect when disabled |
|---------|------------|---------|--------------------|--------------------|
| USID Enablement | `ENABLE` *(option_group: `USID`)* | Controls whether the USID (Universal Specimen ID) feature is active for the lab | Specimen column is shown in the Test Grid | Specimen column is not shown in the Test Grid |

---

## Business Rules

1. The **Wipeout Request** button is always disabled when the screen first opens; it becomes active only after a request is retrieved.
2. The **Specimen and Site** section is only visible for MBS and VRS labs; it is invisible for all other labs.
3. Unlike Cancel Request, there is no Cancel Reason text input, no Cancel Comment buttons, and no Retain Cancel Reason checkbox on the Wipeout Request screen.
4. Unlike Cancel Request, the screen does not check for a Cancel Comment test keyword configuration on load — no initialisation message is shown.

---

## Related Components

- [[Retrieve Request]] — Retrieves an existing request and transitions the screen to the ready state, enabling the Wipeout Request button.
- [[Object Enablement After Retrieval]] — Describes which controls become enabled after a request is successfully retrieved.
