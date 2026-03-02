---
epic: LISP-224
status: draft
---
# Print Send Out Button

## Overview

The **Print Send Out** button allows laboratory staff to manually print the Send Out Form for a retrieved request without performing a full amendment. When clicked, the system runs the same print sequence used during auto-printing on Amend: it first checks whether a TB/DH form alert is required, then prints the Send Out Form, records an audit entry if applicable, and finally processes the PHLC lab order.

---

## Related User Stories

- **[[CRST-813]]** - Amend Request - Amend Action - Print Send Out Button
- **[[CRST-815]]** - Amend Request - Report Printed in TB/DH Form Alert *(part of print sequence)*
- **[[CRST-816]]** - Amend Request - Create PHLC Lab Order *(part of print sequence)*

**Epic:** LISP-224 [CRST][DEV] Amend Request - Send Out Form

---

## Trigger

The user clicks the **Print Send Out** button. This button is only visible and enabled when the Send Out function is configured for the lab (see [[Buttons]]).

---

## Print Sequence

When **Print Send Out** is clicked, the following steps occur in order:

1. **[[Report Printed in TB DH Form Alert]]** — prompted if `CREATE_PHLC_LAB_ORDER_AMD` = 1 and the request was previously printed in TB/DH form; **Yes** continues, **No** aborts printing
2. **Print Send Out Form** — the form is printed using the front-end report template with report code `SEND_OUT_FORM`
3. **Insert Operation Audit** — if the user clicked **Yes** on the TB/DH alert (or the alert was inactivated), the audit log is recorded
4. **[[Create PHLC Lab Order]]** — PHLC order created/updated and outbound messages prepared if conditions are met

> The Doctor Modified Alert ([[Doctor Modified Alert]]) is **not** part of the Print Send Out Button sequence — it is only used during the Amend button auto-print path.

---

## Interaction Behaviours

#### Report Printed in TB/DH Form Alert not required
The Send Out Form is printed immediately using report code `SEND_OUT_FORM`.

#### Report Printed in TB/DH Form Alert is prompted — user clicks Yes
The Send Out Form is printed. An operation audit log is recorded. The PHLC lab order is processed.

#### Report Printed in TB/DH Form Alert is prompted — user clicks No
Printing is aborted. The request data remains on the Amend Request screen.

---

## Related Workflows

- [[Print Send Out Form]] — Auto-print triggered by the Amend button; shares the same print sequence after the alert step.
- [[Report Printed in TB DH Form Alert]] — Conditional alert shown before printing proceeds.
- [[Create PHLC Lab Order]] — Final step; sends outbound PHLC messages when conditions are met.
