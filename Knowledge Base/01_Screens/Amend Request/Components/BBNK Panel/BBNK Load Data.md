---
epic: LISP-227
status: draft
---
# BBNK Load Data

## Overview

When a BBS request is retrieved on the Amend Request screen, the **BBNK Panel** is populated with the Blood Bank–specific data stored against that request. This includes the Blood Category (special blood requirements), the Indication and Operation codes, and the Inventory Reserve Product details. Each data area has its own loading logic to ensure the correct defaults are presented to the user.

---

## Related User Stories

- **[[CRST-828]]** - Amend Request - BBNK Panel - Load Data

**Epic:** LISP-227 [CRST][DEV] Amend Request - Special Lab Workflow (BBNK)

---

## Key Concepts

### Special Blood / Blood Category
A set of Blood Bank–specific requirement flags for the request (e.g. special antigen requirements, irradiated blood). Stored as a collection of special blood records.

### System Default Special Blood
The default (blank / unmodified) special blood configuration for the hospital, used as a baseline to determine whether the user has made any non-default selections.

### Inventory Reserve Product
A product reservation record linked to the request, holding the requested product type, unit quantity, and the date by which the product is required.

---

## Data Loading

### Blood Category

The Blood Category button font style reflects whether the loaded special blood requirement differs from the system default:

| Condition | Blood Category Button Style |
|-----------|------------------------------|
| Special blood requirement is the same as the system default | Normal |
| Special blood requirement differs from the system default | **Italic** |

### Operation Code and Indication Codes

If the request was saved with Operation and/or Indication codes, they are pre-populated in their respective input fields:

| Field | Source |
|-------|--------|
| Operation Code input | First record in the request's code list where an operation code is present |
| Indication Code input | All indication codes from the request's code list, concatenated with `,` (e.g. `CM1,CM2`) |

> A request may have been saved with multiple Indication Codes, each stored as a separate database record. Multiple Operation Code values (e.g. `G10,G11`) are stored together in the first code record row and are loaded as-is into the Operation Code input.

### Inventory Reserve Product

If the request was saved with a Reserve Product record, the following fields are pre-populated:

| Field | Default Value |
|-------|--------------|
| Date Required | Saved date value; if saved value is null, defaults to **current date** |
| Product Type | Saved product type |
| Product Unit | Saved unit value |

---

## Related Workflows

- [[BBNK Panel Enablement]] — The enablement rules that determine which components are visible and editable when data is loaded.
- [[BBNK Amend Request]] — The save workflow that collects the panel data after the user has made amendments.
