# DFT Order Dialogue

## Overview

The DFT Order Dialogue is a modal grid dialogue that appears during DFT registration when the patient has more than one incomplete DFT order for the same test profile. It presents the existing orders for the user to select from, ensuring that the new DFT request is linked to the correct ongoing order. If only one matching order exists, the dialogue is skipped and the order is used directly without prompting.

---

## Related User Stories

- **[[CRST-770]]** - DFT Registration - DFT Order Dialogue

**Epic:** LISP-23 [CRST][DEV] Registration - Patient Handling

---

## Visual Layout

The dialogue is a modal grid window with the title **"Select Order"**. It contains a single data grid listing the candidate DFT orders, with three columns. There are no explicit OK or Cancel buttons; the user selects an order by double-clicking a row, which closes the dialogue automatically.

---

## Data Grid

| Column | Data Displayed | Notes |
|--------|----------------|-------|
| Order No | The DFT order number (`DFT_LINK.dft_order_no`) | Shown only on the first row for each unique order number; blank for subsequent rows belonging to the same order |
| Req. no. | The request number associated with the row (`DFT_LINK.dft_reqno`) | Always displayed; column width 120 px |
| Time | The time flag for the row (`DFT_LINK.dft_time_flag`) | Displayed on every row |

**Default sort order:** Rows are sorted by **Order No** ascending, then by **Time** ascending within each order.

> **Order No display rule:** When multiple rows share the same order number (because one DFT order spans multiple time points), the order number is displayed only in the first row of that group. All subsequent rows for the same order show a blank **Order No** cell. This allows the user to visually group rows by order.

---

## Buttons and Actions

There are no conventional button controls in this dialogue. Interaction is entirely through double-clicking a grid row.

### Double-click a row

**What it does:** The dialogue records the selected order's order number and closes immediately. The DFT Registration screen then links the new request to the selected order and populates the DFT Sequence Panel with the existing data for that order.

---

## Selection and Interaction Behaviours

#### User double-clicks a row
The dialogue closes. The DFT Registration screen links the new request to the selected DFT order number and loads the existing order data into the DFT Sequence Panel. Registration continues with that order's context.

#### Only one matching order exists (bypass condition)
When the system identifies exactly one incomplete DFT order for the patient's test profile, the DFT Order Dialogue is not shown. The single order is selected automatically and registration proceeds directly.

#### User closes the dialogue without selecting (no selection)
If the dialogue is dismissed without a double-click (e.g., via the window close button), no order number is returned. The DFT registration workflow does not proceed to the DFT Sequence Panel.

---

## Trigger Condition

The dialogue is shown only when **all** of the following are true:

1. The registration is for an **existing** DFT order (not a new order being created for the first time).
2. The patient has **more than one** incomplete DFT order (`DFT_LINK.dft_complete = 0`) matching the same `dft_pid_gp` and `dft_profile` as the current request.
3. The user has confirmed message **1508** ("Multiple DFT orders found — select one?") by clicking **Yes**.

When the system finds exactly one matching order, it assigns that order directly and message 1508 is not shown.

---

## Data Sources

| Data | Source |
|------|--------|
| DFT order rows displayed | `DFT_LINK` table — rows where `dft_complete = 0` matching the patient group (`dft_pid_gp`) and profile (`dft_profile`) of the current request, plus any completed orders already linked |
| Order No | `DFT_LINK.dft_order_no` |
| Req. no. | `DFT_LINK.dft_reqno` |
| Time | `DFT_LINK.dft_time_flag` |

---

## Related Workflows

- [[DFT Registration - Register]] — The DFT Order Dialogue is displayed as part of the Register workflow when an existing DFT order must be identified before registration can continue.
