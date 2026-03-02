# Validation – Message 1508: Active DFT Order Already Exists

## Overview

When a user enters a DFT test code during registration for an existing patient, the system checks whether that patient already has an incomplete (active) DFT order for the same test profile. If one is found, message 1508 is displayed, asking whether the user wants to add new collections to the existing order or start a fresh new order. This prevents unintentional duplication of DFT orders for the same patient and allows continuation of a partially completed sequence.

---

## Related User Stories

- **[[CRST-752]]** - Registration - DFT Time Sequence Panel - Message 1508

**Epic:** LISP-23 [CRST][DEV] Registration - Patient Handling

---

## Trigger Point

Occurs when the user enters a DFT test code (and the system confirms the test is a valid DFT test) during patient registration. The check applies to all three DFT test series: DFTT, DFTS, and DFTC.

---

## Check Conditions

The system identifies an active DFT order when all of the following are true:

| Condition | Description |
|-----------|-------------|
| Same patient identity group | The current patient's identity group matches the identity group recorded on the previous DFT order |
| Same test profile | The DFT test code being registered matches the profile code on the previous DFT order |
| Order incomplete | The previous DFT order is marked as not yet complete |

If these conditions are met, message 1508 is displayed.

---

## Message Text

> `DFT order still active for this patient. Do You want to add to this order?`

---

## Behaviour on User Response

### On "Yes" — Add to existing order

The existing incomplete DFT order's rows are loaded onto the DFT Panel. The behaviour differs by test series:

| Row Type | DFTS / DFTT | DFTC |
|----------|------------|------|
| Existing rows (from previous order) | All fields read-only (Request No., Collection Date/Time, Time Flag all non-editable) | All fields read-only |
| Remaining empty rows | Request No. and Collection Date/Time are editable; Time Flag is **not** editable | Request No., Collection Date/Time, and Time Flag are all editable |

The user enters new collection data into the remaining available rows to extend the order.

### On "No" — Start a new order

The DFT Panel is blank and fully editable per the standard rules for the selected test series. A completely new DFT order will be created on save.

---

## Interaction Behaviours

#### User enters a DFT test code — active order exists
The system checks for an incomplete DFT order for the same patient and test profile. Message 1508 is displayed with **Yes** and **No** options.

#### User clicks Yes
The DFT Panel is populated with the rows from the existing incomplete order. Previously completed rows are locked. The remaining rows are available for data entry. The user can then enter new request numbers and collection datetimes to add to the existing order.

#### User clicks No
The DFT Panel is presented blank and editable as if registering a brand-new DFT order. The existing incomplete order is not affected.

---

## Configuration

This check runs automatically whenever a DFT test is entered for an existing patient. There is no lab option to disable it.

---

## Business Rules

1. The check is based on the patient's identity group, not an individual patient record. Patients sharing the same identity group are treated as the same individual for this purpose.
2. The check uses the test profile code, not the individual test items, to match orders.
3. Only incomplete orders trigger this message. Completed DFT orders are handled separately by [[Validation - Message 1509 (Completed DFT Order)]].
4. Existing rows loaded from the previous order are always read-only regardless of test series; only the empty rows added in the current session are editable.
5. For DFTS and DFTT, the Time Flag column on remaining rows is not editable even when adding to an existing order, because time flags for these series are fixed by the test attribute configuration.
6. For DFTC, the Time Flag on remaining rows remains editable because the user defines the time flags manually.

---

## Related Workflows

- [[DFT Panel Enablement - DFTT]] — Describes the standard editability rules for DFTT rows.
- [[DFT Panel Enablement - DFTS]] — Describes the standard editability rules for DFTS rows.
- [[DFT Panel Enablement - DFTC]] — Describes the standard editability rules for DFTC rows.
- [[Validation - Message 1509 (Completed DFT Order)]] — Handles the case where a previously completed DFT order exists within the checking period.
