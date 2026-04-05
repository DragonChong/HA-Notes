---
title: CRS Revamp — Central Task List
tags:
  - CRS
  - revamp
  - task-tracking
created: 2026-04-04
updated: 2026-04-05
status: active
---

# CRS Revamp — Central Task List

> [!info] Purpose
> Single source of truth for all tasks across all repositories in the CRS Revamp project. Tasks are added by `/task-add` and mirrored in per-screen migration plans. Status is kept in sync by `/task-update`. The Reference column is upgraded to a direct plan note link when `/task-plan` is run.

---

## Repository Index

| Repository | Role | Migration Plan |
|---|---|---|
| `lis-hub-app` | Shell MFE | — |
| `lis-request-app` | Registration + Request screens MFE | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Registration]] · [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|Amend Request]] |
| `lis-crs-common-app` | Level-1 Remote MFE | — |
| `lis-request-svc` | Registration backend service | [[CRS/Revamp/Migration Plan/Backend/Registration Backend Migration Plan\|Registration Backend]] |
| `lis-patient-svc` | Patient APIs | — |
| `lis-hub-svc` | Hub BFF | — |

---

## Status Legend

> [!tip] Status Symbols
> - `[ ]` — Pending
> - `[/]` — In Progress
> - `[x]` — Completed
> - `[-]` — Skipped / Not Applicable
> - `[!]` — Blocked (pending resolution of a dependency)

---

## Task Registry

| Task ID | Repository | Task | Status | Notes | Reference |
|---|---|---|---|---|---|
| REG-2.1 | `lis-request-app` | **Registration Keys Panel** — Enc No., Req No. (read-only), HKID; keyboard shortcuts (Ctrl+Shift+E/H/A/X) | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §2]] |
| REG-2.2 | `lis-request-app` | **Patient Demographics Panel** — two-column layout (Name, Chinese Name, Loc, Ward, Bed, Admitted / Sex, DOB, Age, Race) | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §2]] |
| REG-2.3 | `lis-request-app` | **Request Information Panel** — two-column layout (Clin Dtl, Req Dr, Req Loc, Rpt Loc, Copy, Reference, Comment / Category, Confidential, Private, Bill, Urgency, Collect, Arrived, Request) | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §2]] |
| REG-2.4 | `lis-request-app` | **Test Panel** — Add Test dropdown, test list display (bottom section) | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §2]] |
| REG-2.5 | `lis-request-app` | **Retain Checkboxes Panel** — DB-driven (`RETAIN_MASTER`): Request, DT, Test, Urgency | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §2]] |
| REG-2.6 | `lis-request-app` | **Action Buttons** — Save (disabled initially), Clear, Exit | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §2]] |
| REG-2.7 | `lis-request-app` | **No. of Label Panel** — optional panel, controlled by lab option | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §2]] |
| REG-2.8 | `lis-request-app` | **Print Tube Label Panel** — optional panel, workstation-authorised | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §2]] |
| REG-2.9 | `lis-request-app` | **Sendout Button** — optional, lab-option-driven visibility | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §2]] |
| REG-2.10 | `lis-request-app` | **Screen Font Size** — Normal vs. Large based on menu item config | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §2]] |
| REG-2.11 | `lis-request-app` | **Urgency Color** — visual highlight based on urgency selection | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §2]] |
| REG-3.1 | `lis-request-app` | **Default Opening Behaviour** — Keys Panel enabled; Demographics + Request + Test disabled/hidden; Save disabled | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §3]] |
| REG-3.2 | `lis-request-app` | **Patient Demographics Panel Enablement** — enabled after request number assigned | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §3]] |
| REG-3.3 | `lis-request-app` | **Request Information Panel Enablement** — enabled after request number assigned | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §3]] |
| REG-3.4 | `lis-request-app` | **Requested Test Panel Enablement** — visible + enabled after request number assigned | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §3]] |
| REG-3.5 | `lis-request-app` | **Input Specimen No. Button Enablement** — enabled after ready state, non-USID request number | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §3]] |
| REG-3.6 | `lis-request-app` | **Sendout Button Enablement** — conditional on lab option | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §3]] |
| REG-3.7 | `lis-request-app` | **No. of Label Panel Enablement** | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §3]] |
| REG-3.8 | `lis-request-app` | **Print Tube Label Panel Enablement** | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §3]] |
| REG-3.9 | `lis-request-app` | **ANAT Panel Enablement** — conditional on lab/test selection | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §3]] |
| REG-3.10 | `lis-request-app` | **BBNK Panel Enablement** — conditional on lab/test selection | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §3]] |
| REG-3.11 | `lis-request-app` | **MICR VIRO Panel Enablement** — conditional on lab/test selection | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §3]] |
| REG-3.12 | `lis-request-app` | **Request No. Enablement after Registration Key Input** | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §3]] |
| REG-4.1 | `lis-request-app` | **Screen Object Tab Sequence** — DB-driven tab order from `OBJECT_ATTRIBUTE` table per lab | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §4]] |
| REG-4.2 | `lis-request-app` | **Screen Object Focus** — default focus field after Request No. entry (`objattr_order = 999`) | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §4]] |
| REG-4.3 | `lis-request-app` | **Copy Patient Location to Request Location** — auto-populate Request Loc from Patient Loc | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §4]] |
| REG-4.4 | `lis-request-app` | **Copy Request Date to Collection Date** — auto-populate Collection Date from Request Date | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §4]] |
| REG-4.5 | `lis-request-app` | **Location Interaction — Change Doctor Hospital** — update Doctor dropdown when hospital changes | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §4]] |
| REG-4.6 | `lis-request-app` | **Location Interaction — Private Referral** — trigger Private Change Reason Dialogue | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §4]] |
| REG-4.7 | `lis-request-app` | **Clinical Detail Line Limit Validation** — enforce max line length on input | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §4]] |
| REG-4.8 | `lis-request-app` | **Request Doctor Description** — display doctor name on selection | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §4]] |
| REG-4.9 | `lis-request-app` | **Retain Functionality** — persist field values across consecutive registrations per `RETAIN_MASTER` config | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §4]] |
| REG-5A.1 | `lis-request-app` | **ANAT Panel container** — conditional render based on test selection | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §5A]] |
| REG-5A.2 | `lis-request-app` | **ANAT Test Dropdown** | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §5A]] |
| REG-5A.3 | `lis-request-app` | **Auth By Dropdown** | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §5A]] |
| REG-5A.4 | `lis-request-app` | **Confidential Bench** | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §5A]] |
| REG-5A.5 | `lis-request-app` | **Coroner Test Checkbox** | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §5A]] |
| REG-5A.6 | `lis-request-app` | **Date of Death Field** | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §5A]] |
| REG-5A.7 | `lis-request-app` | **Gynae Clinical Data Button** | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §5A]] |
| REG-5A.8 | `lis-request-app` | **Gynae Clinical Data Request Panel** | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §5A]] |
| REG-5A.9 | `lis-request-app` | **Path Tech Dropdown** | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §5A]] |
| REG-5A.10 | `lis-request-app` | **Specimen Collect Time Unknown Checkbox** | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §5A]] |
| REG-5A.11 | `lis-request-app` | **Specimen Site Input Component** | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §5A]] |
| REG-5A.12 | `lis-request-app` | **Specimen Type Dropdown** | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §5A]] |
| REG-5A.13 | `lis-request-app` | **X-Ray No Field** | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §5A]] |
| REG-5A.14 | `lis-request-app` | **ANAT Panel Save Validation** | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §5A]] |
| REG-5B.1 | `lis-request-app` | **BBNK Panel container** | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §5B]] |
| REG-5B.2 | `lis-request-app` | **Blood Category** | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §5B]] |
| REG-5B.3 | `lis-request-app` | **Mother Results** | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §5B]] |
| REG-5B.4 | `lis-request-app` | **Patient Results** | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §5B]] |
| REG-5B.5 | `lis-request-app` | **BBNK Request No. Input Dialogue** | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §5B]] |
| REG-5C.1 | `lis-request-app` | **MICR VIRO Panel** — antibiogram / virology-specific fields | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §5C]] |
| REG-6.1 | `lis-request-app` | **Patient Selection Dialogue** — multi-result patient picker | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §6]] |
| REG-6.2 | `lis-request-app` | **USID Input Dialogue** — unique specimen ID entry | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §6]] |
| REG-6.3 | `lis-request-app` | **Remap Specimen Dialogue** | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §6]] |
| REG-6.4 | `lis-request-app` | **Specimen and Test Profile Manipulation** | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §6]] |
| REG-6.5 | `lis-request-app` | **Report Copy Input Dialogue** — add/edit additional report copy locations | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §6]] |
| REG-6.6 | `lis-request-app` | **Create New Doctor Dialogue** | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §6]] |
| REG-6.7 | `lis-request-app` | **Verification Dialogue** — user confirmation before final save | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §6]] |
| REG-6.8 | `lis-request-app` | **Send Out Information Dialogue** | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §6]] |
| REG-6.9 | `lis-request-app` | **Private Change Reason Dialogue** | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §6]] |
| REG-6.10 | `lis-request-app` | **Result Entry — 24-Hour Urine** | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §6]] |
| REG-6.11 | `lis-request-app` | **Result Entry — ABG** | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §6]] |
| REG-6.12 | `lis-request-app` | **Result Entry — ABG3** | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §6]] |
| REG-6.13 | `lis-request-app` | **Result Entry — CRCL** | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §6]] |
| REG-6.14 | `lis-request-app` | **Result Entry — Fluid** | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §6]] |
| REG-6.15 | `lis-request-app` | **Result Entry — TIMH** | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §6]] |
| REG-6.16 | `lis-request-app` | **Result Entry — TOX** | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §6]] |
| REG-6.17 | `lis-request-app` | **Result Entry — Urine PYN** | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §6]] |
| REG-6.18 | `lis-request-app` | **Result Entry — Urine QEH** | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §6]] |
| REG-6.19 | `lis-request-app` | **Result Entry — Urine (generic)** | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §6]] |
| REG-6.20 | `lis-request-app` | **Result Entry — on Save dispatcher** — routes to correct dialogue by test type | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §6]] |
| REG-7A.1 | `lis-request-app` | **Patient Info Validation on Save** — overall coordinator | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §7A]] |
| REG-7A.2 | `lis-request-app` | **Age Value Validation on Save** | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §7A]] |
| REG-7A.3 | `lis-request-app` | **Patient Demographics Modified Validation on Save** | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §7A]] |
| REG-7A.4 | `lis-request-app` | **Patient Location Validation on Save** | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §7A]] |
| REG-7A.5 | `lis-request-app` | **Patient Name Validation on Save** | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §7A]] |
| REG-7B.1 | `lis-request-app` | **Request Info Validation on Save** — overall coordinator | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §7B]] |
| REG-7B.2 | `lis-request-app` | **Request Doctor Validation on Save** | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §7B]] |
| REG-7B.3 | `lis-request-app` | **Clinical Detail and Text Field Length Validation on Save** | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §7B]] |
| REG-7B.4 | `lis-request-app` | **Specimen Datetime Validation on Save** | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §7B]] |
| REG-7C.1 | `lis-request-app` | **Test Existence Validation on Save** | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §7C]] |
| REG-7C.2 | `lis-request-app` | **Test Duplication Validation on Save** | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §7C]] |
| REG-7C.3 | `lis-request-app` | **Test Prefix Validation on Save** | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §7C]] |
| REG-7C.4 | `lis-request-app` | **Test Registrable Validation on Save** | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §7C]] |
| REG-7C.5 | `lis-request-app` | **Test Valid Period Validation on Save** — with bypass option | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §7C]] |
| REG-7C.6 | `lis-request-app` | **Test Validity Validation on Save** — with bypass option | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §7C]] |
| REG-7C.7 | `lis-request-app` | **MICR VIRO Validation** | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §7C]] |
| REG-8A.1 | `lis-request-app` | **Retrieve Patient by HKID** | `[/]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §8A]] |
| REG-8A.2 | `lis-request-app` | **Retrieve Patient by Encounter Number** | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §8A]] |
| REG-8A.3 | `lis-request-app` | **Create New Patient by HKID** | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §8A]] |
| REG-8A.4 | `lis-request-app` | **Patient Tag Alert** — show alert when patient has tags/flags | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §8A]] |
| REG-8B.1 | `lis-request-app` | **Default Patient Category** | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §8B]] |
| REG-8B.2 | `lis-request-app` | **Default Request Doctor** | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §8B]] |
| REG-8B.3 | `lis-request-app` | **Default Request Info** | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §8B]] |
| REG-8B.4 | `lis-request-app` | **Default Request Location** | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §8B]] |
| REG-8C.1 | `lis-request-app` | **Request No. Generation** — system-assigned, pre-save | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §8C]] |
| REG-8C.2 | `lis-request-app` | **Test Code Selection Behavior** | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §8C]] |
| REG-8C.3 | `lis-request-app` | **Register Request** — main save: assemble Registration Packing and POST to `CrsRegController` | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §8C]] |
| REG-8C.4 | `lis-request-app` | **Register ANAT Request** — ANAT-specific save path | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §8C]] |
| REG-8C.5 | `lis-request-app` | **Register MICR VIRO Request** — MICR/VIRO-specific save path | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §8C]] |
| REG-8D.1 | `lis-request-app` | **Registration Worksheet Printing** — post-save worksheet | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §8D]] |
| REG-8D.2 | `lis-request-app` | **Request No Label Printing** — post-save label print | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §8D]] |
| REG-8D.3 | `lis-request-app` | **Clear Screen** — reset all fields after successful registration | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §8D]] |
| REG-9A.1 | `lis-patient-svc` | **Retrieve HKPMI patient list** — search PMI patient records by HKID | `[ ]` | Returns list of PMI episodes for patient selection | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §9A]] |
| REG-9A.2 | `lis-patient-svc` | **Retrieve LIS patient by HKID** — look up local patient records by HKID | `[ ]` | Returns matching patient and episode records | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §9A]] |
| REG-9A.3 | `lis-patient-svc` | **Retrieve LIS patient by Encounter Number** — look up local patient by encounter no. | `[ ]` | Returns patient demographics and episode data | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §9A]] |
| REG-9A.4 | `lis-patient-svc` | **PMI patient write-back** — update patient name/race/Chinese name to PMI on first registration | `[ ]` | Conditional on access right `u_lis_obj_hkpmi_security_check` | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §9A]] |
| REG-9B.1 | `lis-request-svc` | **Request No. generation endpoint** | `[ ]` | System-assigned number, pre-save | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §9B]] |
| REG-9B.2 | `lis-request-svc` | **Doctor search / lookup endpoint** | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §9B]] |
| REG-9B.3 | `lis-request-svc` | **Location search / lookup endpoint** | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §9B]] |
| REG-9B.4 | `lis-request-svc` | **Default registration values endpoint** — category, doctor, request info | `[ ]` | May be in `CrsDftRegController` | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §9B]] |
| REG-9B.5 | `lis-request-svc` | **Test validation endpoint** — existence, registrable, valid period | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §9B]] |
| REG-9B.6 | `lis-request-svc` | **Register Request endpoint** — main POST to persist registration packing | `[ ]` | `CrsRegController` POST endpoint | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §9B]] |
| REG-9B.7 | `lis-request-svc` | **Register ANAT Request endpoint** | `[ ]` | ANAT-specific fields | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §9B]] |
| REG-9B.8 | `lis-request-svc` | **Register MICR VIRO Request endpoint** | `[ ]` | MICR/VIRO-specific fields | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §9B]] |
| REG-9B.9 | `lis-request-svc` | **Lab options / configuration endpoint** — `RETAIN_MASTER`, tab sequence (`OBJECT_ATTRIBUTE`), lab options | `[ ]` | May already exist in Hub BFF | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §9B]] |
| REG-10.1 | `lis-request-app` | Unit tests — common input components | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §10]] |
| REG-10.2 | `lis-request-app` | Unit tests — validation logic (all Phase 7 items) | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §10]] |
| REG-10.3 | `lis-request-app` | Unit tests — workflow hooks (patient retrieval, defaults, save sequence) | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §10]] |
| REG-10.4 | `lis-request-app` | Integration test — full registration save flow (happy path) | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §10]] |
| REG-10.5 | `lis-request-app` | Integration test — ANAT registration | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §10]] |
| REG-10.6 | `lis-request-app` | Integration test — BBNK registration | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §10]] |
| REG-10.7 | `lis-request-app` | Integration test — MICR VIRO registration | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §10]] |
| REG-10.8 | `lis-request-app` | Integration test — new patient (HKID not in system) | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §10]] |
| REG-10.9 | `lis-request-app` | Integration test — retain functionality across consecutive registrations | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §10]] |
| REG-10.10 | `lis-request-app` | Accessibility — keyboard tab sequence matches DB config | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan\|Reg Plan §10]] |

---

## Progress Summary

| Repository | Total | Completed | In Progress | Pending |
|---|---|---|---|---|
| `lis-hub-app` | 0 | 0 | 0 | 0 |
| `lis-request-app` | 114 | 0 | 1 | 113 |
| `lis-crs-common-app` | 0 | 0 | 0 | 0 |
| `lis-request-svc` | 9 | 0 | 0 | 9 |
| `lis-patient-svc` | 4 | 0 | 0 | 4 |
| `lis-hub-svc` | 0 | 0 | 0 | 0 |
| **Total** | **127** | **0** | **1** | **126** |

---

## Changelog

| Date | Change |
|---|---|
| 2026-04-04 | Central Task List created |
| 2026-04-05 | Migrated Registration screen tasks (Phase 2–10, 127 tasks) from Registration Migration Plan; `REG-` prefix used for all task IDs |
