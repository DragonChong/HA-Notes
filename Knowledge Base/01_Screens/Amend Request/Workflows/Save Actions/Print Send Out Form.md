---
epic: LISP-224
status: draft
---
# Print Send Out Form (Auto on Amend)

## Overview

When the **Amend** button is clicked on a request that has Send Out information, the system may automatically print the Send Out Form depending on the nature of the changes made. Three distinct conditions can trigger automatic printing. The print sequence also involves the [[Doctor Modified Alert]], the [[Report Printed in TB DH Form Alert]], and the [[Create PHLC Lab Order]] processes — in that order — before the form is actually printed.

---

## Related User Stories

- **[[CRST-812]]** - Amend Request - Amend Action - Print Send Out Form
- **[[CRST-814]]** - Amend Request - Doctor Modified Alert *(Condition 3 trigger)*
- **[[CRST-815]]** - Amend Request - Report Printed in TB/DH Form Alert *(part of print sequence)*
- **[[CRST-816]]** - Amend Request - Create PHLC Lab Order *(part of print sequence)*

**Epic:** LISP-224 [CRST][DEV] Amend Request - Send Out Form

---

## Prerequisites for Any Auto-Print

All auto-print conditions require:
- Send Out information exists for the request
- The **Print Form** checkbox is checked

If either condition is not met, the Send Out Form is not printed regardless of what was changed.

---

## Auto-Print Trigger Conditions

### Condition 1 — Send Out Info Newly Added

| Requirement | State |
|------------|-------|
| Send Out information | Newly added in this amendment (did not exist before) |
| Print Form checkbox | Checked |
| Print Send Out button | Disabled (no prior sendout) |

When all three apply and **Amend** is clicked, the Send Out Form is printed automatically.

---

### Condition 2 — Specific Components Modified

| Requirement | State |
|------------|-------|
| Send Out information | Previously saved for the request |
| Print Form checkbox | Checked |
| At least one of the following fields changed | Clinical Detail, Specialty on Request Location, Collection Date, Specimen Type, or Site |

When all apply and **Amend** is clicked, the Send Out Form is printed automatically.

---

### Condition 3 — Request Doctor Modified (with PHLC option)

| Requirement | State |
|------------|-------|
| Send Out information | Previously saved for the request |
| Print Form checkbox | Checked |
| Print Send Out button | Enabled |
| Condition 2 fields | None of them modified |
| `CREATE_PHLC_LAB_ORDER_AMD` option | Enabled (= 1) |
| Request Doctor (Hospital or Doctor Code) | Changed |
| Doctor Modified Alert response | User clicks **Yes** |

When all apply and **Amend** is clicked, the Doctor Modified Alert is shown first; printing only proceeds if the user clicks **Yes**.

---

## When Send Out Form is NOT Printed

| Scenario |
|----------|
| No Send Out info added (Print Send Out button disabled and no info input) |
| Print Form checkbox is not checked |
| Send Out info exists but none of the trigger fields (Condition 2/3) were modified — e.g., only Request Comment changed |

---

## Auto-Print Sequence

When auto-print is triggered, the following steps occur in order:

1. **[[Doctor Modified Alert]]** — prompted only for Condition 3; user must click **Yes** to continue
2. **[[Report Printed in TB DH Form Alert]]** — prompted if `CREATE_PHLC_LAB_ORDER_AMD` = 1 and the request was previously printed in TB/DH form; user must click **Yes** to continue (if already inactivated, skipped)
3. **Print Send Out Form** — the form is printed using the front-end report template with report code `SEND_OUT_FORM`
4. **Insert Operation Audit** — if user proceeded through the TB/DH alert, audit log is recorded
5. **[[Create PHLC Lab Order]]** — PHLC order created/updated and outbound messages prepared if conditions are met

---

## Configuration

| Setting | Option Code | Option Group | Purpose | Effect when enabled (= 1) |
|---------|------------|-------------|---------|--------------------------|
| Create PHLC Lab Order on Amend | `CREATE_PHLC_LAB_ORDER_AMD` | `SEND_OUT` | Enables PHLC order creation and gates Condition 3 / TB-DH alert | Doctor Modified Alert and PHLC order processing are active |

*Source: `LAB_OPTION` table.*

---

## Related Workflows

- [[Print Send Out Button]] — Manual printing path triggered by clicking the Print Send Out button directly.
- [[Doctor Modified Alert]] — Condition 3 gate; prompted before printing when only doctor info changed.
- [[Report Printed in TB DH Form Alert]] — Prompted in the print sequence when the request was previously printed in TB/DH form.
- [[Create PHLC Lab Order]] — Final step in the print sequence; sends PO1/CS1/CC1 messages to PHLC.
