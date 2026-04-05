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
| `lis-crs-spec-ack-svc` | Amend Request backend service | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|Amend Request]] |
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
| AR-2.1 | `lis-request-app` | **Request No. Input + Action Buttons area** — Request No. field, Amend / Clear buttons always present; Input Specimen No. / Send Out / Print Send Out / Print Form conditional | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §2]] |
| AR-2.2 | `lis-request-app` | **Patient Demographic Panel** — HKID, Encounter, Name (English + Chinese), Sex, Age, Age Unit; all read-only | `[ ]` | CRST-771 | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §2]] |
| AR-2.3 | `lis-request-app` | **Request Information Panel** — Category, Pay Code, Clinical Detail, Reference, Comment, Bill, Urgency, Confidential, Private, Bed, Request Doctor, Request Loc, Report Loc, Report Copy, Collect / Request / Arrival datetimes | `[ ]` | CRST-772 | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §2]] |
| AR-2.4 | `lis-request-app` | **Data Retention Panel** — Permanent / Follow Laboratory radio buttons; General Lab only; controlled by LAB_FUNCTION access right | `[ ]` | CRST-776 | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §2]] |
| AR-2.5 | `lis-request-app` | **Urgency Color** — red highlight on Request Info Panel when Urgency = Urgent | `[ ]` | CRST-788 | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §2]] |
| AR-3.1 | `lis-request-app` | **Default Opening Behaviour** — Request No. input enabled; Patient + Request Info panels disabled; Amend button disabled | `[ ]` | CRST-785 | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §3]] |
| AR-3.2 | `lis-request-app` | **Object Enablement After Retrieval** — comprehensive field/button matrix; enable editable fields, keep patient panel read-only | `[ ]` | CRST-778 | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §3]] |
| AR-3.3 | `lis-request-app` | **Input Specimen No. Button Visibility** — shown only when USID lab option is enabled | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §3]] |
| AR-3.4 | `lis-request-app` | **Send Out / Print Send Out / Print Form Button Visibility** — shown only when Sendout function is enabled | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §3]] |
| AR-3.5 | `lis-request-app` | **ANAT Panel Visibility** — shown when retrieved request belongs to ANAT lab | `[ ]` | CRST-821 | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §3]] |
| AR-3.6 | `lis-request-app` | **BBNK Panel Visibility** — shown when retrieved request belongs to Blood Bank lab | `[ ]` | CRST-827 | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §3]] |
| AR-3.7 | `lis-request-app` | **MICR-VIRO Panel Visibility** — shown when retrieved request belongs to MICR or VIRO lab | `[ ]` | CRST-829 | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §3]] |
| AR-3.8 | `lis-request-app` | **Data Retention Panel Enablement** — enabled only after retrieval for a lab number; access controlled by LAB_FUNCTION right | `[ ]` | CRST-776 | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §3]] |
| AR-4.1 | `lis-request-app` | **Default Focus (Initial)** — cursor starts on Request No. field when screen opens | `[ ]` | CRST-785 | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §4]] |
| AR-4.2 | `lis-request-app` | **Default Focus after Request No.** — focus moves to Category field after successful request retrieval | `[ ]` | CRST-786 | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §4]] |
| AR-4.3 | `lis-request-app` | **Tab Sequence** — DB-driven tab order through editable fields (`OBJECT_ATTRIBUTE` table, function=`AMEND`) | `[ ]` | CRST-787 | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §4]] |
| AR-4.4 | `lis-request-app` | **Copy Request Date to Collection Date** — auto-populate Collection Date from Request Date on change | `[ ]` | CRST-789 | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §4]] |
| AR-4.5 | `lis-request-app` | **Doctor Description** — auto-populate doctor full name and department when doctor code is selected | `[ ]` | CRST-790 | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §4]] |
| AR-4.6 | `lis-request-app` | **Location Interaction — Change Doctor Hospital** — auto-sync doctor hospital when Request Location hospital changes | `[ ]` | CRST-791 | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §4]] |
| AR-4.7 | `lis-request-app` | **Location Interaction — Private Referral** — set Private flag automatically when a private referral location is selected | `[ ]` | CRST-792 | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §4]] |
| AR-4.8 | `lis-request-app` | **Clear Button** — show confirmation dialogue; reset all fields and return screen to initial state | `[ ]` | CRST-794 | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §4]] |
| AR-4.9 | `lis-request-app` | **Urgency Color Interaction** — apply / remove red highlight on Request Info Panel based on Urgency value | `[ ]` | CRST-788 | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §4]] |
| AR-5A.1 | `lis-request-app` | **ANAT Panel container** — conditional render; shown only for ANAT requests | `[ ]` | CRST-821 | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §5A]] |
| AR-5A.2 | `lis-request-app` | **ANAT Panel Enablement** — field-level enablement rules within the panel | `[ ]` | CRST-821 | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §5A]] |
| AR-5A.3 | `lis-request-app` | **ANAT Panel Load Data** — populate ANAT fields from AP_REQUEST table on retrieval | `[ ]` | CRST-822 | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §5A]] |
| AR-5A.4 | `lis-request-app` | **ANAT Panel Tab Sequence** — tab order through ANAT-specific fields | `[ ]` | CRST-823 | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §5A]] |
| AR-5B.1 | `lis-request-app` | **BBNK Panel container** — conditional render; shown only for Blood Bank requests | `[ ]` | CRST-827 | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §5B]] |
| AR-5B.2 | `lis-request-app` | **BBNK Panel Enablement** — panel visibility and component enablement rules | `[ ]` | CRST-827 | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §5B]] |
| AR-5B.3 | `lis-request-app` | **BBNK Panel Load Data** — populate Blood Bank fields on retrieval | `[ ]` | CRST-828 | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §5B]] |
| AR-5B.4 | `lis-request-app` | **BBNK Panel Tab Sequence** — tab order through Blood Bank fields | `[ ]` | CRST-830 | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §5B]] |
| AR-5C.1 | `lis-request-app` | **MICR-VIRO Panel container** — conditional render; shown only for MICR or VIRO requests | `[ ]` | CRST-829 | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §5C]] |
| AR-5C.2 | `lis-request-app` | **MICR-VIRO Panel Enablement** — panel visibility and component enablement rules | `[ ]` | CRST-829 | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §5C]] |
| AR-5C.3 | `lis-request-app` | **MICR-VIRO Panel Load Data** — populate Microbiology/Virology fields on retrieval | `[ ]` | CRST-834 | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §5C]] |
| AR-5C.4 | `lis-request-app` | **MICR-VIRO Panel Tab Sequence** — tab order through MBS/VRS fields | `[ ]` | CRST-835 | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §5C]] |
| AR-6.1 | `lis-request-app` | **USID Input Dialogue** — specimen number entry; validates USID existence | `[ ]` | CRST-817 | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §6]] |
| AR-6.2 | `lis-request-app` | **Report Copy Input Dialogue** — add/edit additional report copy locations | `[ ]` | CRST-793 | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §6]] |
| AR-6.3 | `lis-request-app` | **Laboratory Selection Dialogue** — CRS multi-match picker when request is found in multiple labs | `[ ]` | CRST-856 | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §6]] |
| AR-6.4 | `lis-request-app` | **Change Reason Dialogue** — required popup when specific tracked fields are modified; captures reason for change | `[ ]` | CRST-800 | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §6]] |
| AR-6.5 | `lis-request-app` | **Private Change Reason Dialogue** — required popup when Private or Lab Only status changes | `[ ]` | CRST-799 | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §6]] |
| AR-6.6 | `lis-request-app` | **User Validation Dialogue** — secondary authentication prompt for privileged amend actions | `[ ]` | CRST-798 | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §6]] |
| AR-6.7 | `lis-request-app` | **Special Blood Dialogue** — BBNK-specific; blood category selection with three-state checkboxes | `[ ]` | CRST-833 | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §6]] |
| AR-7.1 | `lis-request-app` | **Amend Request Validation (coordinator)** — orchestrates all validators; determines order and short-circuit logic | `[ ]` | CRST-797 | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §7]] |
| AR-7.2 | `lis-request-app` | **Clinical Detail / Reference / Comment Validation** — character limit enforcement | `[ ]` | CRST-892 | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §7]] |
| AR-7.3 | `lis-request-app` | **Datetime Validation** — specimen datetime rules (Collect ≤ Arrive ≤ Request, future date guards) | `[ ]` | CRST-893 | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §7]] |
| AR-7.4 | `lis-request-app` | **Location Validation** — Request / Report / Report Copy location rules | `[ ]` | CRST-895 | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §7]] |
| AR-7.5 | `lis-request-app` | **Confidential Validation** | `[ ]` | CRST-896 | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §7]] |
| AR-7.6 | `lis-request-app` | **Bill Validation** | `[ ]` | CRST-897 | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §7]] |
| AR-7.7 | `lis-request-app` | **Urgency Validation** | `[ ]` | CRST-898 | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §7]] |
| AR-7.8 | `lis-request-app` | **Lab Only Validation** | `[ ]` | CRST-899 | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §7]] |
| AR-7.9 | `lis-request-app` | **Request Doctor Validation** — doctor code and hospital matching | `[ ]` | CRST-894 | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §7]] |
| AR-7.10 | `lis-request-app` | **Clinical Detail on Sendout Request Validation** — mandatory clinical detail for sendout requests | `[ ]` | CRST-900 | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §7]] |
| AR-7.11 | `lis-request-app` | **MICR-VIRO Validation** — Microbiologist, Specimen Type, Treatment Category rules | `[ ]` | CRST-836 | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §7]] |
| AR-8A.1 | `lis-request-app` | **Retrieve Request** — main retrieval workflow; data mapping from response to all panels | `[ ]` | CRST-779 | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §8A]] |
| AR-8A.2 | `lis-request-app` | **Initial Values Snapshot** — capture before-image of all editable fields immediately after retrieval; used for change detection | `[ ]` | CRST-780 | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §8A]] |
| AR-8A.3 | `lis-request-app` | **Request Not Found Message** — display error when request number does not exist | `[ ]` | CRST-783 | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §8A]] |
| AR-8A.4 | `lis-request-app` | **Request Cancelled Message** — display warning when retrieved request is in cancelled status | `[ ]` | CRST-782 | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §8A]] |
| AR-8A.5 | `lis-request-app` | **Not Supported Lab Message** — display restriction message when lab is not supported in CRS | `[ ]` | CRST-781 | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §8A]] |
| AR-8A.6 | `lis-request-app` | **Request Retrieval from Other Screen** — handle pre-populated Request No. passed from source screens | `[ ]` | CRST-784 | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §8A]] |
| AR-8A.7 | `lis-request-app` | **Laboratory Selection** — present multi-match picker when request is found in more than one lab | `[ ]` | CRST-856 | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §8A]] |
| AR-8B.1 | `lis-request-app` | **Change Reason Dialogue trigger** — detect tracked-field changes by comparing current values against initial snapshot | `[ ]` | CRST-800 | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §8B]] |
| AR-8B.2 | `lis-request-app` | **Regenerate Report Determination** — prompt for report regeneration when request has already been printed | `[ ]` | CRST-801 | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §8B]] |
| AR-8B.3 | `lis-request-app` | **Report Copy Determination** — recalculate primary report destination from Report Copy list | `[ ]` | CRST-807 | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §8B]] |
| AR-8B.4 | `lis-request-app` | **Change Audit** — write field change audit entries to TESTRSLT_AUDIT for all modified fields | `[ ]` | CRST-803 | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §8B]] |
| AR-8B.5 | `lis-request-app` | **Operation Audit** — write sendout form audit entries | `[ ]` | CRST-806 | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §8B]] |
| AR-8B.6 | `lis-request-app` | **Doctor Modified Alert** — display confirmation alert when the requesting doctor has been changed | `[ ]` | CRST-814 | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §8B]] |
| AR-8B.7 | `lis-request-app` | **Report Printed in TB/DH Form Alert** — display reprint warning when TB or DH report form was previously printed | `[ ]` | CRST-815 | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §8B]] |
| AR-8B.8 | `lis-request-app` | **USID Data Conversion** — prepare specimen relation data for saving | `[ ]` | CRST-819 | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §8B]] |
| AR-8B.9 | `lis-request-app` | **USID Not Found Alert** — display warning when entered USID does not exist in the system | `[ ]` | CRST-818 | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §8B]] |
| AR-8B.10 | `lis-request-app` | **USID Audit** — write specimen relation audit entries (types 559, 560, 564, 565) | `[ ]` | CRST-820 | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §8B]] |
| AR-8B.11 | `lis-request-app` | **Create PHLC Lab Order** — create PHLC outbound message for eligible send-out requests | `[ ]` | CRST-816 | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §8B]] |
| AR-8B.12 | `lis-request-app` | **Print Send Out Form** — auto-print triggering conditions and print sequence post-amend | `[ ]` | CRST-812 | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §8B]] |
| AR-8B.13 | `lis-request-app` | **Amend Action Result Message** — display success or failure messages (501, 1992, 3861, 4332) | `[ ]` | CRST-808 | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §8B]] |
| AR-8B.14 | `lis-request-app` | **Clear Screen** — reset all panels and return to initial state after successful amendment | `[ ]` | CRST-810 | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §8B]] |
| AR-8C.1 | `lis-request-app` | **ANAT Amend Request** — ANAT-specific amend processing and payload assembly | `[ ]` | CRST-824 | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §8C]] |
| AR-8C.2 | `lis-request-app` | **ANAT Change Audit** — ANAT field change audit formatting and submission | `[ ]` | CRST-825 | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §8C]] |
| AR-8C.3 | `lis-request-app` | **ANAT Regenerate Report Alert** — ANAT-specific report regeneration confirmation | `[ ]` | CRST-826 | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §8C]] |
| AR-8D.1 | `lis-request-app` | **BBNK Amend Request** — Blood Bank amend processing with ZIKV special handling | `[ ]` | CRST-831 | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §8D]] |
| AR-8D.2 | `lis-request-app` | **BBNK Change Audit** — Blood Bank field change audit formatting and submission | `[ ]` | CRST-832 | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §8D]] |
| AR-8E.1 | `lis-request-app` | **MICR-VIRO Amend Request** — Microbiology/Virology amend processing and payload assembly | `[ ]` | CRST-837 | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §8E]] |
| AR-8E.2 | `lis-request-app` | **MICR-VIRO Change Audit** — MICR-VIRO field change audit formatting and submission | `[ ]` | CRST-838 | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §8E]] |
| AR-9.1 | `lis-crs-spec-ack-svc` | **Retrieve Request by Request No.** — fetch full request data for display | `[ ]` | Check `CrsAmendController` or `CrsSearchController` | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §9]] |
| AR-9.2 | `lis-crs-spec-ack-svc` | **Amend Request endpoint (general)** — main POST to persist amended request | `[ ]` | `CrsAmendController` POST endpoint | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §9]] |
| AR-9.3 | `lis-crs-spec-ack-svc` | **ANAT Amend Request endpoint** — ANAT-specific fields | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §9]] |
| AR-9.4 | `lis-crs-spec-ack-svc` | **BBNK Amend Request endpoint** — Blood Bank-specific fields | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §9]] |
| AR-9.5 | `lis-crs-spec-ack-svc` | **MICR-VIRO Amend Request endpoint** — Microbiology/Virology-specific fields | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §9]] |
| AR-9.6 | `lis-crs-spec-ack-svc` | **Change Audit endpoint** — write TESTRSLT_AUDIT entries | `[ ]` | May be part of amend payload or separate call | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §9]] |
| AR-9.7 | `lis-crs-spec-ack-svc` | **Doctor search / lookup endpoint** — verify / reuse existing from Registration | `[ ]` | May already exist in Hub BFF | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §9]] |
| AR-9.8 | `lis-crs-spec-ack-svc` | **Location search / lookup endpoint** — verify / reuse existing from Registration | `[ ]` | May already exist in Hub BFF | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §9]] |
| AR-9.9 | `lis-crs-spec-ack-svc` | **USID lookup endpoint** — check specimen number existence | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §9]] |
| AR-9.10 | `lis-crs-spec-ack-svc` | **Lab options / configuration endpoint** — tab sequence (`OBJECT_ATTRIBUTE`), lab options | `[ ]` | Reuse from Registration if already built | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §9]] |
| AR-10.1 | `lis-request-app` | Unit tests — common input components (Request No. input, Lab Selection) | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §10]] |
| AR-10.2 | `lis-request-app` | Unit tests — validation logic (all Phase 7 validators) | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §10]] |
| AR-10.3 | `lis-request-app` | Unit tests — change detection (Initial Values Snapshot vs. modified state) | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §10]] |
| AR-10.4 | `lis-request-app` | Unit tests — workflow hooks (retrieval, save sequence) | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §10]] |
| AR-10.5 | `lis-request-app` | Integration test — full amend save flow (happy path, no tracked-field changes) | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §10]] |
| AR-10.6 | `lis-request-app` | Integration test — amend with Change Reason Dialogue triggered | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §10]] |
| AR-10.7 | `lis-request-app` | Integration test — ANAT amend | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §10]] |
| AR-10.8 | `lis-request-app` | Integration test — BBNK amend | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §10]] |
| AR-10.9 | `lis-request-app` | Integration test — MICR-VIRO amend | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §10]] |
| AR-10.10 | `lis-request-app` | Integration test — retrieval from another screen (pre-populated Request No.) | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §10]] |
| AR-10.11 | `lis-request-app` | Accessibility — keyboard tab sequence matches DB config | `[ ]` | | [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan\|AR Plan §10]] |

---

## Progress Summary

| Repository | Total | Completed | In Progress | Pending |
|---|---|---|---|---|
| `lis-hub-app` | 0 | 0 | 0 | 0 |
| `lis-request-app` | 205 | 0 | 1 | 204 |
| `lis-crs-common-app` | 0 | 0 | 0 | 0 |
| `lis-crs-spec-ack-svc` | 10 | 0 | 0 | 10 |
| `lis-request-svc` | 9 | 0 | 0 | 9 |
| `lis-patient-svc` | 4 | 0 | 0 | 4 |
| `lis-hub-svc` | 0 | 0 | 0 | 0 |
| **Total** | **228** | **0** | **1** | **227** |

---

## Changelog

| Date | Change |
|---|---|
| 2026-04-04 | Central Task List created |
| 2026-04-05 | Migrated Registration screen tasks (Phase 2–10, 127 tasks) from Registration Migration Plan; `REG-` prefix used for all task IDs |
| 2026-04-05 | Migrated Amend Request screen tasks (Phase 2–10, 101 tasks) from Amend Request Migration Plan; `AR-` prefix used for all task IDs; added `lis-crs-spec-ack-svc` to Repository Index |
