---
epic: LISP-224
status: draft
---
# Create PHLC Lab Order

## Overview

The **Create PHLC Lab Order** step sends outbound messages to the PHLC system after a Send Out Form is printed or an amendment is saved. It creates or updates a lab order (PO1), adjusts the collection datetime (CS1), or clears the collection datetime (CC1) depending on the state of the sendout location and the amendment data. All messages are inserted into the outbound message table for downstream processing.

---

## Related User Stories

- **[[CRST-816]]** - Amend Request - Create PHLC Lab Order

**Epic:** LISP-224 [CRST][DEV] Amend Request - Send Out Form

---

## Trigger

This step is executed after either:
- The **Amend** button save sequence completes (auto-print path), or
- The **Print Send Out** button is clicked (manual print path)

---

## Prerequisites

All of the following conditions must be met for any PHLC order processing to occur:

- `LAB_OPTION` record with `option_group = 'SEND_OUT'`, `option_code = 'CREATE_PHLC_LAB_ORDER_AMD'`, `option_value = 1` exists
- The sendout location is **not** "CPLC"
- The sendout location matches one of the following definitions in the `LIS_CONSTANT` table:
  - Keyword description matches the entry for **"DH_FORM_TITLE"**, OR
  - Keyword alpha2 field matches the entry for **"DH_LOC_ADDR"**

If any condition is not met, no outbound messages are created and this step is skipped entirely.

---

## Outbound Message Types

Three types of outbound messages may be inserted to `loe_out_bound_message`, depending on the state of the request data:

### PO1 — Create Order

| Condition | Action |
|-----------|--------|
| No existing PO1 record found for the request number | New PO1 message is created |
| Existing PO1 found but its content differs from the new PO1 data | New PO1 message is created to replace/update the order |
| Existing PO1 found and content is unchanged | No PO1 message is sent |

*Data source for PO1 lookup: `phlc_lab_order_map` and `loe_out_bound_message` tables, filtered by request number.*

### CS1 — Update Collection Datetime

| Condition | Action |
|-----------|--------|
| Collection datetime from the amendment is not null AND differs from the existing CS1/CC1 record (or no CS1/CC1 exists) | CS1 message is created to update the collection datetime |
| Collection datetime unchanged | No CS1 message is sent |

### CC1 — Clear Collection Datetime

| Condition | Action |
|-----------|--------|
| Collection datetime has been cleared (set to null) AND a prior CS1 or CC1 record exists for the request | CC1 message is created to clear the collection datetime |
| No prior CS1/CC1 exists | No CC1 message is sent |

> **Additional requirement for CC1:** The `DATE_ATTRIBUTE` option must be configured with `option_text` containing `'C10'` to permit empty collection dates. If this option is not set, the CC1 message is not sent.

---

## Configuration

| Setting | Option Code | Purpose | Effect when enabled | Effect when disabled |
|---------|-------------|---------|--------------------|--------------------|
| Create PHLC Lab Order on Amend | `CREATE_PHLC_LAB_ORDER_AMD` | Controls whether PHLC outbound messages are created | PO1/CS1/CC1 messages sent when conditions met | No PHLC messages sent |
| Date Attribute — Allow Empty Collection Date | `DATE_ATTRIBUTE` *(option_text must contain 'C10')* | Controls whether collection datetime can be left empty | CC1 (clear datetime) message permitted | CC1 not sent even when datetime is cleared |

*Source: `LAB_OPTION` table.*

---

## Related Workflows

- [[Print Send Out Form]] — Auto-print path; PHLC lab order is the final step.
- [[Print Send Out Button]] — Manual print path; PHLC lab order is the final step.
- [[Doctor Modified Alert]] — If the user clicks **No** on this alert, printing is bypassed and PHLC lab order is not created.
- [[Report Printed in TB DH Form Alert]] — If the user clicks **No** on this alert, printing is aborted and PHLC lab order is not created.
