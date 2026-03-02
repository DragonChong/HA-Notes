---
epic: LISP-224
status: draft
---
# Doctor Modified Alert

## Overview

The **Doctor Modified Alert** is a confirmation prompt displayed during the Amend button save sequence when the attending doctor details have changed and the configuration option for PHLC lab order creation is enabled. It gives staff the opportunity to confirm or suppress Send Out Form printing when only the doctor assignment has changed — without any of the core clinical or specimen fields being modified. If the user declines, a bypass audit entry is recorded.

---

## Related User Stories

- **[[CRST-814]]** - Amend Request - Doctor Modified Alert

**Epic:** LISP-224 [CRST][DEV] Amend Request - Send Out Form

---

## Trigger

This alert is part of the **Amend button** save sequence (auto-print path). It is prompted when **all** of the following conditions are true at the time of saving:

- Send Out information exists for the request
- **Print Form** checkbox is checked
- **Print Send Out** button is enabled
- **None** of the following fields have been modified:
  - Clinical Detail
  - Specialty on Request Location
  - Collection Date
  - Specimen Type
  - Site
- `LAB_OPTION` record with `option_group = 'SEND_OUT'`, `option_code = 'CREATE_PHLC_LAB_ORDER_AMD'`, `option_value = 1` exists
- Either the **Doctor Hospital** or **Doctor Code** for the Requesting Doctor has been updated

**Not prompted when:**
- The doctor was not changed
- Any one of the five clinical/specimen fields listed above was modified (those fields trigger auto-print without prompting)
- The `CREATE_PHLC_LAB_ORDER_AMD` option is not set

---

## Component Modes

| Mode | When It Applies |
|------|-----------------|
| Active (shown) | All trigger conditions met and Inactive checkbox not checked |
| Inactivated | User has checked the Inactive checkbox during the current screen session |

---

## Buttons and Actions

#### Yes
The Send Out Form print sequence continues. The form is printed and the PHLC lab order is processed.

#### No
The Send Out Form is **not** printed. An operation audit log is recorded with the message:
> "Bypass Send Out Form printing in Amend Request."
> Audit type: **576**

#### Inactive Checkbox
When checked, the Doctor Modified Alert is suppressed for the **remainder of the current screen session** — it will not appear for any subsequent requests retrieved until the Amend Request screen is closed and reopened.

> **Important:** Even when the alert has been inactivated by the checkbox and the last recorded response was **No**, the bypass audit (type 576, "Bypass Send Out Form printing in Amend Request.") is still recorded.

---

## Configuration

| Setting | Option Code | Purpose | Effect when enabled | Effect when disabled |
|---------|-------------|---------|--------------------|--------------------|
| Create PHLC Lab Order on Amend | `CREATE_PHLC_LAB_ORDER_AMD` | Controls whether PHLC-related alerts and processing are active during Amend | Doctor Modified Alert shown when doctor changes without clinical field changes | Alert never shown; PHLC processing not triggered |

*Source: `LAB_OPTION` table, `option_group = 'SEND_OUT'`*

---

## Related Workflows

- [[Print Send Out Form]] — This alert is evaluated during the Amend button auto-print sequence, after checking that none of the Condition 2 fields changed.
- [[Create PHLC Lab Order]] — Executed after a **Yes** response; not executed when printing is bypassed.
