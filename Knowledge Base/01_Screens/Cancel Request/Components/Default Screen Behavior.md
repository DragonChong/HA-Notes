# Default Screen Behavior

## Overview

When the Cancel Request screen is opened, it enters its initial state with the core action controls disabled and non-editable until a request is retrieved. The layout includes a **Cancel Request** button, a **Cancel Reason** text input area, a test grid, up to 15 configurable **Cancel Comment** shortcut buttons, and — depending on lab configuration — a **Reminder** label and **Update Reason** / **Authorize Reason** buttons. For MBS and VRS labs, a read-only **Specimen and Site** section is also visible. The screen finishes loading by checking that the Cancel Comment test keyword has been configured; if it has not, a warning message is shown.

---

## Related User Stories

- **[[CRST-924]]** - Cancel Request - Default Screen Behavior

**Epic:** LISP-244 [CRST][DEV] Cancel Request - Layout

---

## Screen Object States on Opening

### Cancel Request Button and Cancel Reason Text Input

| Control | Initial State |
|---------|--------------|
| **Cancel Request** button | Visible, **disabled** |
| **Cancel Reason** text input | Visible, **non-editable** |

Both controls remain in this state until a request has been successfully retrieved.

---

### Specimen and Site Section

A read-only section showing the specimen and site information for the request. Visibility is determined by the performing lab.

| Lab | Section Visible |
|-----|----------------|
| MBS (Microbiology) | Yes |
| VRS (Virology) | Yes |
| All other labs (CPS, HMS, IMS, APS, BBS, GNS, etc.) | No |

> The Specimen and Site section is read-only — it displays information only and cannot be edited on the Cancel Request screen.

---

### Test Grid

The Test Grid displays the tests attached to the retrieved request. The columns shown depend on whether the USID (Universal Specimen ID) feature is enabled for the performing lab and hospital.

| Configuration | Specimen Column Shown |
|--------------|----------------------|
| USID enabled for the performing lab | Yes |
| USID disabled for the performing lab | No |

USID enablement is controlled by the lab option with `option_group = 'USID'` and `option_code = 'ENABLE'` (values 1, 2, or 3 indicate enabled).

---

### Cancel Comment Buttons

Up to **15** Cancel Comment shortcut buttons are displayed. Each button is configured from the keyword group **CANCOM** for the performing lab.

| Property | Value |
|----------|-------|
| Button label | `key_alpha1` of the corresponding CANCOM keyword |
| Click action | Appends `key_desc` of the corresponding keyword to the **Cancel Reason** text input |
| Maximum buttons | 15 (hardcoded) |
| Initial state | Visible, **disabled** (until a request is retrieved) |

**Visibility rules:**
- If 15 CANCOM keywords are configured → all 15 buttons are visible.
- If fewer than 15 CANCOM keywords are configured → only the configured buttons are visible; the remaining button slots are hidden.
- If no CANCOM keywords are configured → all Cancel Comment buttons are invisible.

---

### Update Reason and Authorize Reason Buttons

These two buttons allow staff to amend or authorise an existing cancel reason on a previously cancelled request. Their visibility depends on lab configuration.

| Control | When Visible | Initial State (when visible) |
|---------|-------------|------------------------------|
| **Update Reason** button | `AMEND_CANCEL_COMMENT` option enabled | Visible, **disabled** |
| **Authorize Reason** button | `AMEND_CANCEL_COMMENT` option enabled | Visible, **disabled** |

When the `AMEND_CANCEL_COMMENT` option is **not** enabled, both buttons are **invisible**.

---

### Reminder Label

A configurable label displayed at the bottom of the screen to show a hospital- or lab-specific reminder message.

| Condition | Label Visible | Label Text |
|-----------|--------------|-----------|
| `CANCEL_REMINDER` option text is set for the performing lab | Yes | The `option_text` value from the lab option, displayed in red bold font |
| `CANCEL_REMINDER` option text is not set | No | — |

---

## Initialisation Check — Cancel Comment Test Setup

After the screen finishes loading, the system checks whether the Cancel Comment test keyword has been configured in the lab option:

- **Lab option checked:** `option_group = 'CANCEL'`, `option_code = 'CANCEL_COMMENT'`

| Condition | System Action |
|-----------|--------------|
| Lab option is present and `option_value` is not null | Screen loads normally |
| Lab option is missing or `option_value` is null | Message **219** is shown to alert the user that the Cancel Comment test is not configured |

---

## Configuration

| Setting | Option Code | Purpose | Effect when enabled | Effect when disabled |
|---------|------------|---------|--------------------|--------------------|
| USID Enablement | `ENABLE` *(option_group: `USID`)* | Controls whether the USID (Universal Specimen ID) feature is active for the lab | Specimen column is shown in the Test Grid | Specimen column is not shown in the Test Grid |
| Amend Cancel Comment | `AMEND_CANCEL_COMMENT` *(option_group: `CANCEL`)* | Controls whether staff can amend or authorise cancel reasons on cancelled requests | **Update Reason** and **Authorize Reason** buttons are visible | Both buttons are invisible |
| Cancel Reminder | `CANCEL_REMINDER` *(option_group: `CANCEL`)* | Provides a freetext reminder message displayed at the bottom of the screen | Reminder Label is visible showing the `option_text` value | Reminder Label is invisible |
| Cancel Comment Test | `CANCEL_COMMENT` *(option_group: `CANCEL`)* | Identifies the test keyword used to store the cancel comment | Screen loads normally | Message 219 is shown on screen load |

---

## Error Messages and System Prompts

| Message | Trigger | User Options |
|---------|---------|-------------|
| 219 | Cancel Comment test keyword (`CANCEL_COMMENT` lab option) is not configured or has a null value for the performing lab | OK (dismiss) |

---

## Business Rules

1. The **Cancel Request** button and **Cancel Reason** text input are always disabled and non-editable when the screen first opens; they become active only after a request is retrieved.
2. The **Specimen and Site** section is only visible for MBS and VRS labs; it is invisible for all other labs.
3. The maximum number of Cancel Comment buttons is fixed at **15**.
4. Cancel Comment buttons are shown only for keywords configured in the **CANCOM** keyword group for the performing lab; buttons without a corresponding keyword are invisible.
5. Cancel Comment buttons are disabled when the screen first opens; they are enabled after a request is retrieved.
6. The **Update Reason** and **Authorize Reason** buttons are only visible when the `AMEND_CANCEL_COMMENT` lab option is enabled.
7. If the `CANCEL_COMMENT` lab option is missing or its value is null, message **219** is displayed after the screen loads. This does not prevent the screen from opening.

---

## Related Workflows

- [[Retrieve Request]] — Retrieves an existing request and transitions the screen to the ready state, enabling the Cancel Request button and Cancel Reason input.
- [[Object Enablement After Retrieval]] — Describes which controls become enabled after a request is successfully retrieved.
