---
epic: LISP-244
status: draft
---
# Cancel Request — Screen Overview

## Overview

The **Cancel Request** screen allows authorised laboratory staff to cancel an existing specimen request. Staff retrieve a request by its request number, review the tests attached to it, enter a cancel reason, and confirm the cancellation. The screen supports configurable shortcut buttons for common cancel reason text, an optional reminder label, and — where configured — the ability to amend or authorise a cancel reason on a previously cancelled request. A read-only Specimen and Site section is shown for MBS and VRS labs. The screen is available in both the General Laboratory and CRS applications.

---

## Related User Stories

- **[[CRST-924]]** - Cancel Request - Default Screen Behavior
- **[[CRST-925]]** - Cancel Request - Retrieve Request
- **[[CRST-926]]** - Cancel Request - Request Not Found Message
- **[[CRST-927]]** - Cancel Request - Test Result
- **[[CRST-928]]** - Cancel Request - Cancel Comment Test
- **[[CRST-929]]** - Cancel Request - Laboratory Selection
- **[[CRST-930]]** - Cancel Request - Not Supported Lab Message
- **[[CRST-931]]** - Cancel Request - Request Cancelled Message
- **[[CRST-932]]** - Cancel Request - Object Enablement After Retrieval
- **[[CRST-933]]** - Cancel Request - Tab Sequence
- **[[CRST-934]]** - Cancel Request - Default Focus (Initial)
- **[[CRST-935]]** - Cancel Request - Clear Button
- **[[CRST-936]]** - Cancel Request - Decode Text
- **[[CRST-937]]** - Cancel Request - Confirmation Message
- **[[CRST-938]]** - Cancel Request - Validation
- **[[CRST-939]]** - Cancel Request - User Validation
- **[[CRST-940]]** - Cancel Request - Ask for Confirmation
- **[[CRST-941]]** - Cancel Request - Cancel Request (Action)
- **[[CRST-942]]** - Cancel Request - Failure Message
- **[[CRST-943]]** - Cancel Request - Server Error Message
- **[[CRST-944]]** - Cancel Request - Authorize Cancel Reason
- **[[CRST-945]]** - Cancel Request - Update Reason
- **[[CRST-946]]** - Cancel Request - ANAT: Object Enablement After Retrieval
- **[[CRST-947]]** - Cancel Request - BBNK: Blood Inventory Validation
- **[[CRST-949]]** - Cancel Request - BBNK: Blood Released Message
- **[[CRST-950]]** - Cancel Request - BBNK: User Access Right Checking
- **[[CRST-951]]** - Cancel Request - MICR/VIRO: Display MICR/VIRO Information
- **[[CRST-979]]** - Cancel Request - Retain Cancel Request Reason Handling
- **[[CRST-980]]** - Cancel Request - Retrieve Cancel Request Reason
- **[[CRST-981]]** - Cancel Request - Retrieve Lab Request by its Assigned Lab No.

**Epic:** LISP-244 [CRST][DEV] Cancel Request - Layout | LISP-245 [CRST][DEV] Cancel Request - Request Retrieval | LISP-246 [CRST][DEV] Cancel Request - Screen Object Enablement | LISP-247 [CRST][DEV] Cancel Request - Cancel Action | LISP-248 [CRST][DEV] Cancel Request - Special Lab Workflow (ANAT) | LISP-249 [CRST][DEV] Cancel Request - Special Lab Workflow (BBNK) | LISP-250 [CRST][DEV] Cancel Request - Special Lab Workflow (MICR/VIRO) | LISP-258 [CRST][DEV] Cancel Request - Screen Object Interaction

---

## Screen Layout

The Cancel Request screen is divided into several sections arranged vertically, with the **Request No.** input field and action buttons near the top.

### Request No. Input and Action Buttons

| Button | Availability |
|--------|-------------|
| **Cancel Request** | Always present |
| **Update Reason** | Present only when `AMEND_CANCEL_COMMENT` lab option is enabled |
| **Authorize Reason** | Present only when `AMEND_CANCEL_COMMENT` lab option is enabled |

See [[Default Screen Behavior]] for initial enablement states.

---

### Specimen and Site Section

A read-only section displayed only for **MBS** and **VRS** labs. It shows the specimen type and site associated with the retrieved request. This section is invisible for all other labs.

---

### Test Grid

Displays the tests attached to the retrieved request. The columns shown depend on whether USID is enabled for the performing lab. See [[Default Screen Behavior]] for column configuration details.

---

### Cancel Reason Text Input

A free-text area where the user enters or builds up the cancel reason. The **Cancel Comment** shortcut buttons (below) can be used to append pre-configured text to this field.

---

### Cancel Comment Buttons

Up to **15** configurable shortcut buttons sourced from the **CANCOM** keyword group. Each button appends its associated keyword description to the Cancel Reason text input. See [[Default Screen Behavior]] for full setup rules.

---

### Update Reason and Authorize Reason Buttons

Visible only when the `AMEND_CANCEL_COMMENT` lab option is enabled. These buttons allow staff to update or authorise the cancel reason on a request that has already been cancelled.

---

### Reminder Label

An optional label displayed at the bottom of the screen, sourced from the `CANCEL_REMINDER` lab option. Shown in red bold font when configured.

---

## Related Workflows

- [[Retrieve Request]] — The workflow that loads request data and enables the action controls when a valid request number is entered.
- [[Object Enablement After Retrieval]] — Describes which controls become active after a request is successfully retrieved.
- [[Cancel Request (Action)]] — The workflow that executes when the user confirms the cancellation.
