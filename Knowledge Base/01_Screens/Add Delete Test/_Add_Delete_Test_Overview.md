---
status: draft
---
# Add/Delete Test — Knowledge Base Overview

## Purpose

This section documents the **Add/Delete Test** screen (also referred to as **Test Maintenance**), which allows laboratory staff to add new tests to, or delete existing tests from, a previously registered request. It is the primary screen for post-registration test modification in the CRS and General Laboratory environments.

---

## Epics

| Epic | Title | Scope |
|------|-------|-------|
| LISP-261 | Add/Delete Test — Layout | Default screen behaviour, grid columns |
| LISP-262 | Add/Delete Test — Request Retrieval | Lab selection, retrieval, not-supported lab, request not found, discharged patient, private patient, request cancelled messages |
| LISP-263 | Add/Delete Test — Screen Object Enablement | Object enablement after retrieval |
| LISP-264 | Add/Delete Test — Screen Object Interaction | Clear button, default focus, tab sequence, mark test to delete (including order check and user access right validation) |
| LISP-265 | Add/Delete Test — Submit Action | Add/delete test action, add test validation, delete test validation, add test user access right validation, change reason dialogue, server error message |
| LISP-266 | Add/Delete Test — USID | USID input dialogue, profile not mapped to specimen message, USID not found alert, create specimen profile relation from request |
| LISP-267 | Add/Delete Test — Special Lab Workflow (CHEM) | CHEM: mark test to delete, check DFT, check TIS correlation |
| LISP-268 | Add/Delete Test — Special Lab Workflow (BBNK) | BBNK: get patient blood history, mark test to delete, check cross match group, test code determination |
| LISP-269 | Add/Delete Test — Special Lab Workflow (MICR) | MICR: retrieve request, mark test to delete, culture or sensitivity check |

---

## Screen Structure

The Add/Delete Test screen is built on the same base as the Cancel and Wipeout Request screens — a request number input, patient demographic panel, and test grid — but replaces the cancel/wipeout action with a **Submit** button. It also adds a **DEL** column in the test grid (to mark tests for deletion) and supports adding tests via the test panel.

Key differences from Cancel/Wipeout Request:
- Tests can be **added** (not just deleted)
- A **DEL** toggle column is present in the test grid
- A **Submit** button replaces the Cancel/Wipeout button
- An **Input Specimen No.** button is present (USID-enabled labs only)
- For HA hospitals: specimen profile relations can be created from request
- Special lab-specific sub-rules apply (BBNK cross-match, CHEM DFT/TIS, MICR culture/sensitivity)

---

## Note Inventory

### LISP-261 — Layout

- [[Default Screen Behavior]] — CRST-1016

### LISP-262 — Request Retrieval

- [[Laboratory Selection]] — CRST-1017
- [[Not Supported Lab Message]] — CRST-1018
- [[Retrieve Request]] — CRST-1019
- [[Patient Discharged Message]] — CRST-1020
- [[Private Patient Message]] — CRST-1021
- [[Request Cancelled Message]] — CRST-1022
- [[Request Not Found Message]] — CRST-1023

### LISP-263 — Screen Object Enablement

- [[Object Enablement After Retrieval]] — CRST-1024

### LISP-264 — Screen Object Interaction

- [[Clear Button]] — CRST-1025
- [[Default Focus - Initial]] — CRST-1026
- [[Tab Sequence]] — CRST-1027
- [[Mark Test to Delete]] — CRST-1028
- [[Mark Test to Delete - Check Test Delete or Un-delete in Order]] — CRST-1029
- [[Mark Test to Delete - User Access Right Validation]] — CRST-1030

### LISP-265 — Submit Action

- [[Add Test User Access Right Validation]] — CRST-1035
- [[Add Test Validation]] — CRST-1036
- [[Delete Test Validation]] — CRST-1037
- [[Change Reason Dialogue]] — CRST-1038
- [[Add/Delete Test (Action)]] — CRST-1039
- [[Server Error Message]] — CRST-1040

### LISP-266 — USID

- [[Create Specimen Profile Relation from Request]] — CRST-1031
- [[USID Input Dialogue]] — CRST-1032
- [[Profile Not Mapped to Specimen Message]] — CRST-1033
- [[USID Not Found Alert]] — CRST-1034

### LISP-267 — Special Lab Workflow (CHEM)

- [[CHEM Mark Test to Delete]] — CRST-1041
- [[CHEM Mark Test to Delete - Check DFT]] — CRST-1042
- [[CHEM Mark Test to Delete - Check TIS Correlation]] — CRST-1043

### LISP-268 — Special Lab Workflow (BBNK)

- [[BBNK Get Patient Blood History]] — CRST-1046
- [[BBNK Mark Test to Delete]] — CRST-1044
- [[BBNK Mark Test to Delete - Check Cross Match Group]] — CRST-1045
- [[BBNK Test Code Determination]] — CRST-1047

### LISP-269 — Special Lab Workflow (MICR)

- [[MICR Retrieve Request]] — CRST-1048
- [[MICR Mark Test to Delete]] — CRST-1049
- [[MICR Mark Test to Delete - Culture or Sensitivity Check]] — CRST-1050
