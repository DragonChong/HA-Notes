---
epic: LISP-224
status: draft
---
# Report Printed in TB DH Form Alert

## Overview

The **Report Printed in TB/DH Form Alert** is a confirmation prompt shown before the Send Out Form is printed when the system detects that a TB/DH-type form was previously printed for the same request. It prevents inadvertent double-printing by asking staff to confirm the reprint. The alert is triggered during both the auto-print (Amend button) and manual print (Print Send Out button) sequences.

---

## Related User Stories

- **[[CRST-815]]** - Amend Request - Report Printed in TB/DH Form Alert

**Epic:** LISP-224 [CRST][DEV] Amend Request - Send Out Form

---

## Trigger

This alert is shown when **all** of the following conditions are true:

- `LAB_OPTION` record with `option_group = 'SEND_OUT'`, `option_code = 'CREATE_PHLC_LAB_ORDER_AMD'`, `option_value = 1` exists
- An operation audit record with **audit type 103** exists for the current request (indicating a TB/DH form was previously printed)
- The **Inactive** checkbox has not been checked during the current screen session

**Not prompted when:**
- No operation audit record with audit type 103 exists for the request
- The `CREATE_PHLC_LAB_ORDER_AMD` option is not set

---

## Alert Text

The alert displays **message 4383**, with the screen name inserted as a parameter:

| System | Screen Name in Alert |
|--------|---------------------|
| MBS | "TB Form for DH" |
| VRS | "DH for Form" |

Example (MBS): *"Report has been printed in TB Form for DH. Confirm to print Send Out Form?"* *(exact wording per message 4383)*

---

## Component Modes

| Mode | When It Applies |
|------|-----------------|
| Active (shown) | All trigger conditions met and Inactive checkbox not checked |
| Inactivated | User has checked the Inactive checkbox during the current screen session |

---

## Buttons and Actions

#### Yes
- The Send Out Form print sequence continues.
- An operation audit log is recorded with the message:
  > "Print Send Out Form in Amend Request, which is previously printed in TB Form for DH / DH for Form."
- The request data is cleared from the Amend Request screen after printing.

#### No
- Printing is **aborted**.
- The request data **remains** on the Amend Request screen; no changes are lost.

#### Inactive Checkbox
When checked, the alert is suppressed for the **remainder of the current screen session** — it will not appear for any subsequent requests retrieved until the screen is closed and reopened.

> **When inactivated:** The Send Out Form **is still printed** and the operation audit log is **still recorded**. Inactivating the checkbox only removes the interactive prompt — it does not suppress the print or the audit.

---

## Configuration

| Setting | Option Code | Purpose | Effect when enabled | Effect when disabled |
|---------|-------------|---------|--------------------|--------------------|
| Create PHLC Lab Order on Amend | `CREATE_PHLC_LAB_ORDER_AMD` | Controls whether PHLC-related alerts and processing are active | TB/DH Form Alert evaluated and shown when audit type 103 exists | Alert never shown |

*Source: `LAB_OPTION` table, `option_group = 'SEND_OUT'`*

---

## Related Workflows

- [[Print Send Out Form]] — Auto-print path; this alert is the first step before the form is printed.
- [[Print Send Out Button]] — Manual print path; this alert is also the first step in the button click sequence.
- [[Create PHLC Lab Order]] — Executed after a **Yes** response.
