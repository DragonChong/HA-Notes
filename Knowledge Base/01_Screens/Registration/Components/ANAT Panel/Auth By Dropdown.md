# Auth By Dropdown

## Overview

The **Auth By** dropdown appears on the ANAT Panel of the Manual Registration screen. It allows registration staff to record the person who authorised the ANAT lab request. The field is controlled entirely by a lab option — when the option is enabled the dropdown is available for selection after a request number is assigned; when the option is disabled the dropdown is visible but cannot be edited. As an optional convenience, the dropdown can be configured to automatically mirror the selection made in the **Responsible Pathologist** field.

---

## Related User Stories

- **[[CRST-589]]** - Registration - ANAT Panel - Auth By

**Epic:** LISP-30 [CRST][DEV] Registration - Special Lab Workflow (ANAT)

---

## Key Concepts

### Auth By Data Source
The list of selectable users in the **Auth By** dropdown is drawn from the `FUNCTION_GROUP` table, where `fnt_grp_function_name = 'f_lis_hist_auth_by'`. Only users with this function group assignment appear in the list.

---

## Visual Layout

The **Auth By** dropdown is displayed within the ANAT Panel. It is always visible once the ANAT Panel is active. Its enabled/disabled state is governed solely by the `AUTH_BY` lab option — it does not depend on whether the request is an autopsy case.

---

## Field Behaviour

### On Request Number Assignment — Auth By Option Enabled

When an ANAT request number is assigned and the `AUTH_BY` lab option is enabled:

1. The **Auth By** dropdown becomes **enabled** and the user may select a person from the list.

### On Request Number Assignment — Auth By Option Disabled

When the `AUTH_BY` lab option is not enabled:

1. The **Auth By** dropdown remains **disabled**. The user cannot make a selection.

### Auto-Sync with Responsible Pathologist

When the `AUTH_BY_SYNC_WITH_RESP_PERSON` option is enabled and the **Auth By** dropdown is currently enabled:

1. Whenever the user changes the selection in the **Responsible Pathologist** field, the system automatically updates the **Auth By** dropdown to the user with a matching user code from the Auth By list.
2. If a matching user is found, the **Auth By** dropdown is set to that user.
3. If the **Responsible Pathologist** is cleared (set to blank), the **Auth By** dropdown is also cleared.

---

## Enablement Rules

| Registration State | Auth By Dropdown State |
|---|---|
| Initial (no request number assigned) | Disabled |
| Patient ready (patient loaded, no request number) | Disabled |
| Ready — `AUTH_BY` option enabled | **Enabled** |
| Ready — `AUTH_BY` option disabled | Disabled |

---

## Configuration

| Setting | Option Code | Purpose | Effect when enabled | Effect when disabled |
|---------|------------|---------|--------------------|--------------------|
| Auth By | `AUTH_BY` *(option_group: REQUEST_REGISTRATION)* | Controls whether the Auth By dropdown is editable | Dropdown enabled after request number assigned | Dropdown disabled |
| Auth By Sync with Resp Person | `AUTH_BY_SYNC_WITH_RESP_PERSON` *(option_group: RESULT_ENTRY)* | Controls whether the Auth By field automatically follows the Responsible Pathologist selection | Auth By is auto-populated when Responsible Pathologist changes | Auth By is independent; must be set manually |

---

## Related Workflows

- [[Coroner Test Checkbox]] — Part of the same ANAT Panel; both are visible whenever the panel is active.
- [[Date of Death Field]] — Part of the same ANAT Panel; enablement of DOD depends on autopsy case, while Auth By depends only on the lab option.
- [[X-Ray No Field]] — Part of the same ANAT Panel.
- [[Specimen Collect Time Unknown Checkbox]] — Part of the same ANAT Panel.
