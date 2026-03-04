---
epic: LISP-227
status: draft
---
# BBNK Panel Enablement

## Overview

The **BBNK Panel** is a lab-specific panel that appears on the Amend Request screen when a Blood Bank (BBS) request is retrieved. It exposes Blood Bank–specific fields that can be amended alongside the standard request information. The panel is hidden when no BBS request is loaded and is fully disabled after the Clear button is clicked.

---

## Related User Stories

- **[[CRST-827]]** - Amend Request - BBNK Panel - Enablement

**Epic:** LISP-227 [CRST][DEV] Amend Request - Special Lab Workflow (BBNK)

---

## Key Concepts

### BBS Request
A request belonging to the Blood Bank laboratory (lab number 6). The BBNK Panel is shown only for this lab number.

---

## Panel Visibility

| State | BBNK Panel Visibility |
|-------|-----------------------|
| Amend Request screen opened (no request loaded) | **Invisible** |
| BBS request retrieved | **Visible** |
| Clear button clicked (after BBS request was loaded) | **Visible but fully disabled** |
| Non-BBS request retrieved after a BBS request was shown | **Invisible** |

---

## Component Enablement

When a BBS request is retrieved, the components within the BBNK Panel are enabled according to the following rules:

| Component | Enabled | Visible | Notes |
|-----------|---------|---------|-------|
| Blood Category button | Yes | Yes (always when panel is visible) | Keyboard shortcut: **B** |
| Indication Code label | Yes — visible when panel shown | Controlled by lab option | See Configuration table |
| Indication Code input | Yes | Controlled by lab option | Enabled when BBS request is retrieved |
| Operation Code label | Yes — visible when panel shown | Controlled by lab option | See Configuration table |
| Operation Code input | Yes | Controlled by lab option | Enabled when BBS request is retrieved |
| Inventory Reserve Product inputs (Date Required, Type, Unit) | Yes | Controlled by lab option | Enabled when BBS request is retrieved |

When the Clear button is clicked all components in the panel are disabled.

---

## Configuration

| Setting | Option Code | Purpose | Effect when option_value = 0 (or option absent) | Effect when option_value = 1 |
|---------|-------------|---------|--------------------------------------------------|------------------------------|
| Operation & Indication Code Visibility | `OPERATION_AND_INDICATION_CODE_INVISIBLE` *(option_group = 'REQUEST_REGISTRATION')* | Controls whether the Indication Code and Operation Code fields are shown | Fields are **visible** | Fields are **invisible** |
| Operation & Indication Code Mandatory | `OPERATION_AND_INDICATION_CODE_MANDATORY` *(option_group = 'REQUEST_REGISTRATION')* | Controls whether Indication Code and Operation Code labels show as required | Labels are **not** marked required | Labels are marked as **required** |
| Inventory Reserve Product Visibility | `INVISIBLE` *(option_group = 'INV_RESERVE_PRODUCT')* | Controls whether the Inventory Reserve Product inputs (Date Required, Type, Unit) are shown | Inputs are **visible** | Inputs are **invisible** |

---

## Related Workflows

- [[BBNK Amend Request]] — The save workflow that collects BBNK panel data for persistence.
- [[BBNK Load Data]] — The load workflow that populates the panel when a BBS request is retrieved.
