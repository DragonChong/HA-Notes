# Path/Tech Dropdown

## Overview

The **Path/Tech** dropdown appears on the ANAT Panel of the Manual Registration screen. It allows registration staff to select the responsible pathologist or technician for an ANAT lab request. Unlike some other ANAT Panel fields, the Path/Tech dropdown does not depend on a lab option or autopsy case status — it is always enabled whenever an ANAT request number is assigned. Optionally, a selection in this field can automatically update the [[Auth By Dropdown]] if the sync option is enabled.

---

## Related User Stories

- **[[CRST-590]]** - Registration - ANAT Panel - Path/Tech

**Epic:** LISP-30 [CRST][DEV] Registration - Special Lab Workflow (ANAT)

---

## Key Concepts

### Path/Tech Data Source
The list of selectable users in the **Path/Tech** dropdown is drawn from the `FUNCTION_GROUP` table, where `fnt_grp_function_name = 'f_lis_hist_responsible_person'`. Only users with this function group assignment appear in the list.

---

## Visual Layout

The **Path/Tech** dropdown is displayed within the ANAT Panel. It is always visible once the ANAT Panel is active. No additional lab option is required for the field to be enabled.

---

## Field Behaviour

### On Request Number Assignment

When an ANAT request number is assigned:

1. The **Path/Tech** dropdown becomes **enabled** and the user may select a person from the list.
2. The dropdown has no default selection — it starts blank.

### Auto-Population for Autopsy Cases

When the request is an autopsy case and the logged-in user has the required access right for the Responsible Pathologist field, the system pre-selects the current user in the **Path/Tech** dropdown when the request number is assigned.

### Invalid Selection

If the user types a value in the field that does not match any entry in the list, an error message is shown and the field is cleared. The user must select a valid entry from the dropdown list.

### Sync to Auth By

When the `AUTH_BY_SYNC_WITH_RESP_PERSON` option is enabled and the **Auth By** field is enabled, changing the **Path/Tech** selection automatically updates the **Auth By** dropdown to the matching user. See [[Auth By Dropdown]] for details.

---

## Enablement Rules

| Registration State | Path/Tech Dropdown State |
|---|---|
| Initial (no request number assigned) | Disabled |
| Patient ready (patient loaded, no request number) | Disabled |
| Ready (any ANAT request number assigned) | **Enabled** |

---

## Related Workflows

- [[Auth By Dropdown]] — When the Auth By Sync option is enabled, a change to Path/Tech automatically updates Auth By.
- [[Coroner Test Checkbox]] — Part of the same ANAT Panel.
- [[Date of Death Field]] — Part of the same ANAT Panel.
- [[X-Ray No Field]] — Part of the same ANAT Panel.
- [[Specimen Collect Time Unknown Checkbox]] — Part of the same ANAT Panel.
