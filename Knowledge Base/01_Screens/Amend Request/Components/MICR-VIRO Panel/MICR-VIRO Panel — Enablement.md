---
epic: LISP-228
status: draft
---
# MICR-VIRO Panel — Enablement

## Overview

The **MICR-VIRO Panel** is a lab-specific panel that appears on the Amend Request screen when a Microbiology (MBS, lab no. 7) or Virology (VRS, lab no. 8) request is retrieved. The panel is labelled **"Micro-specific information"** for MBS requests and **"Virology-specific information"** for VRS requests. It exposes fields specific to microbiology and virology requests that can be amended. The panel is hidden when no MBS/VRS request is loaded and is fully disabled when the Clear button is clicked.

---

## Related User Stories

- **[[CRST-829]]** - Amend Request - MICR/VIRO Panel - Enablement

**Epic:** LISP-228 [CRST][DEV] Amend Request - Special Lab Workflow (MICR/VIRO)

---

## Key Concepts

### MBS Request
A request belonging to the Microbiology laboratory (lab number 7). The panel title is "Micro-specific information".

### VRS Request
A request belonging to the Virology laboratory (lab number 8). The panel title is "Virology-specific information". VRS shares the same panel structure as MBS but with a distinct panel name and some VRS-specific behaviour (Pair Specimen).

### Pair Specimen Request (VRS only)
A VRS request that is paired with another specimen request. When a paired request is retrieved, the Specimen Type drop-down is disabled and a warning label is shown instead, as the specimen type cannot be changed.

### Target Specimen Selection
A lab option that replaces the editable Specimen Type drop-down with a read-only display field, used when specimen type is automatically determined from USID data rather than entered manually.

---

## Panel Visibility

| State | MICR-VIRO Panel Visibility |
|-------|---------------------------|
| Amend Request screen opened (no request loaded) | **Invisible** |
| MBS request retrieved | **Visible** (labelled "Micro-specific information") |
| VRS request retrieved | **Visible** (labelled "Virology-specific information") |
| Clear button clicked (after MBS/VRS request was loaded) | **Visible but fully disabled** |
| Non-MBS / Non-VRS request retrieved after panel was shown | **Invisible** |

---

## Component Enablement

When an MBS or VRS request is retrieved, the components within the panel are enabled or shown according to the following rules:

| Component | Enabled | Visible | Notes |
|-----------|---------|---------|-------|
| Microbiologist drop-down | Yes | Yes (always) | List items from keyword group `MICRO_DOC` |
| Specimen Type drop-down | Yes (see VRS exception) | Controlled by lab option | See Configuration; hidden when Target Specimen Selection is active |
| Display-only Specimen Type text input | Read-only | Controlled by lab option | Visible only when Target Specimen Selection is active |
| Site text input | Yes | Yes (always) | |
| Chemotherapy used text input | Yes | Yes (always) | Multi-line text area in VRS (max 255 characters) |
| Treatment Category drop-down | Conditional | Controlled by lab option | See Configuration for visibility and enable conditions |

### VRS — Specimen Type Pair Lock
When a VRS request has a **Pair Specimen Request No.**, the Specimen Type drop-down is visible but **disabled**, and a warning label is shown:

> "Request pair with `<pairSpecimenRequestNo>`. No specimen change allowed."

The warning label is hidden when no pair exists.

---

## Configuration

| Setting | Option Code | Purpose | Effect when enabled | Effect when disabled / absent |
|---------|-------------|---------|--------------------|-------------------------------|
| Target Specimen Selection | `TARGET_SPECIMEN_SELECTION` *(option_group = 'REQUEST_REGISTRATION')* | Switches from editable Specimen Type to display-only mode | Specimen Type drop-down **invisible**; display-only text input **visible** | Specimen Type drop-down **visible** and editable; display-only text input **invisible** |
| Treatment Category Visible | `TREATMENT_CATEGORY_VISIBLE` *(option_group = 'REQUEST_REGISTRATION')* | Controls whether the Treatment Category field is shown | Treatment Category drop-down and label **visible** | Treatment Category drop-down and label **invisible** |
| Lab Prefixes to Enable Treatment Category | `LAB_PREFIXS_TO_ENABLE_TREATMENT_CATEGORY` *(option_group = 'REQUEST_REGISTRATION')* | Controls which request number prefixes allow Treatment Category editing | Treatment Category **enabled** if the retrieved request's prefix is in the `option_text` list | Treatment Category **disabled** even if visible |

---

## Related Workflows

- [[MICR-VIRO Panel — Load Data]] — Populates the panel fields when an MBS/VRS request is retrieved.
- [[MICR-VIRO Amend Request]] — The save workflow that collects panel data for persistence.
