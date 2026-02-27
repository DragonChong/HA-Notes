# Retain

## Overview

The **Retain** component is a group of radio buttons that appears on the Manual Registration screen. It allows registration staff to nominate a set of fields whose values are preserved when the screen is cleared after a save or when the **Clear** button is pressed. Without a retain selection, every field is cleared between registrations. With a retain selection, the fields associated with the chosen retain group keep their values so that the next registration can begin with those fields pre-filled, reducing repetitive data entry for high-volume workflows.

---

## Related User Stories

- **[[CRST-117]]** - Registration - Retain

**Epic:** LISP-29 [CRST][DEV] Registration - Screen Object Interaction

---

## Key Concepts

### Retain Group
A named set of fields that should be preserved across registrations. Each group is defined in the **Retain Master** configuration (`RETAIN_MASTER`) and associated with a numeric group code. The radio button label displayed to the user is taken from the `retain_name` entry in `RETAIN_MASTER`.

### Field-to-Group Assignment
A field is enrolled in a retain group by adding a row to `OBJECT_ATTRIBUTE` with:
- `objattr_function = 'RETAIN'`
- `objattr_retain` equal to the `retain_group` code of the desired group
- `objattr_name` containing the field's object name

Only fields that have such a row for the current lab participate in the Retain feature.

### Skip on Patient Load
When a patient has been successfully identified (i.e., an existing patient record was retrieved), certain patient demographic fields — such as Patient Name, Sex, DOB, Location, Category, and similar — are excluded from retain restoration. This prevents stale values from a previous patient overwriting the freshly loaded patient data. These fields are only retained when no patient record is loaded on the screen.

---

## Visual Layout

The Retain component is a compact, horizontally laid-out group of radio buttons positioned on the Registration screen. It is only visible when at least one retain group is configured for the current lab. If no retain groups are defined, the component is hidden entirely. Each radio button bears the label from the corresponding `RETAIN_MASTER` entry. The first configured group is selected by default.

---

## Retain Groups (Standard Configuration)

The following standard retain groups are defined in the reference configuration. Actual groups available on a given installation depend on the `RETAIN_MASTER` and `OBJECT_ATTRIBUTE` setup for the current lab.

| Group | Default Label | Fields Retained |
|-------|--------------|-----------------|
| 1 | No Retain | None — all fields are cleared |
| 2 | Retain Request | Encounter No., HKID, Patient Name, Sex, DOB, Age, Age Unit, Exact DOB Flag, Patient Location, Patient Category, Bed, Admission Date/Time, MRN, Race, Request Doctor, Clinical Detail, Request Location, Report Location, Reference, Comment, Confidential, Private, Bill, Urgency, Request Date/Time, Collection Date/Time, Arrival Date/Time |
| 3 | Retain Test | Requested Tests |
| 4 | Retain DT | Request Date/Time, Collection Date/Time, Arrival Date/Time |
| 5 | Retain Urgency | Urgency |

> The labels shown above are examples. Each installation may configure different group names and field assignments via `RETAIN_MASTER` and `OBJECT_ATTRIBUTE`.

---

## Retainable Fields Reference

The following fields can be enrolled in any retain group via `OBJECT_ATTRIBUTE` configuration:

| Object Name | Field Label |
|-------------|-------------|
| `uo_sle_encounter` | Encounter No. |
| `uo_sle_labno` | Request No. |
| `uo_sle_hkid` | HKID |
| `uo_sle_patient_name` | Patient Name |
| `uo_sle_patient_cname` | Patient Chinese Name |
| `uo_ddlb_sex` | Sex |
| `uo_em_dob` | DOB |
| `uo_em_age` | Age |
| `uo_ddlb_ageunit` | Age Unit |
| `uo_ddlb_exact_dob_flag` | Exact DOB Flag |
| `uo_sle_patient_location` | Patient Location (whole field) |
| `uo_sle_patient_location.uo_sle_hosp` | Patient Location — Hospital |
| `uo_sle_patient_location.uo_sle_spec` | Patient Location — Specialty |
| `uo_sle_patient_location.uo_sle_loc` | Patient Location — Ward |
| `uo_ddlb_category` | Patient Category |
| `uo_sle_rmbed` | Bed |
| `uo_em_admission_datetime` | Admission Date/Time |
| `uo_sle_mrn` | MRN |
| `dw_pat_race` | Race |
| `uo_mle_clinical_details` | Clinical Detail |
| `uo_sle_req_hosp_doc` | Request Doctor (Hosp) — whole field |
| `uo_sle_req_hosp_doc.uo_sle_doc` | Request Doctor (Hosp) — Code |
| `uo_sle_req_hosp_doc.uo_sle_hosp` | Request Doctor (Hosp) — Hospital |
| `uo_sle_reqlocn` | Request Location (whole field) |
| `uo_sle_reqlocn.uo_sle_hosp` | Request Location — Hospital |
| `uo_sle_reqlocn.uo_sle_spec` | Request Location — Specialty |
| `uo_sle_reqlocn.uo_sle_loc` | Request Location — Ward |
| `uo_sle_reptdest` | Report Location (whole field) |
| `uo_sle_reptdest.uo_sle_hosp` | Report Location — Hospital |
| `uo_sle_reptdest.uo_sle_spec` | Report Location — Specialty |
| `uo_sle_reptdest.uo_sle_loc` | Report Location — Ward |
| `uo_sle_copyto` | Report Copy Location (whole field) |
| `uo_sle_copyto.uo_sle_hosp` | Report Copy Location — Hospital |
| `uo_sle_copyto.uo_sle_spec` | Report Copy Location — Specialty |
| `uo_sle_copyto.uo_sle_loc` | Report Copy Location — Ward |
| `uo_mle_doctor_ref` | Reference |
| `uo_mle_req_comment` | Comment |
| `uo_ddlb_confidential` | Confidential |
| `uo_ddlb_lab_only` | Private |
| `uo_ddlb_bill` | Bill |
| `uo_ddlb_urgency` | Urgency |
| `uo_em_request_datetime` | Request Date/Time |
| `uo_em_arrival_datetime` | Arrival Date/Time |
| `uo_em_collection_datetime` | Collection Date/Time |
| `uo_requested_tests` | Requested Tests |

---

## Interaction Behaviours

#### User selects a retain group radio button
The selection is recorded. No immediate change to the screen fields occurs. The selected group determines which fields will be preserved the next time the screen is cleared.

#### User clicks Clear (with a retain group selected)
1. The system prompts the user to confirm the clear action (message 648).
2. If the user confirms:
   a. The current values of all fields belonging to the selected retain group are captured.
   b. The screen is fully cleared.
   c. The captured values are restored to their respective fields.
   d. The Retain radio button selection itself is **not** reset — it remains on the previously selected group so the staff member does not need to re-select it for the next registration.
3. If the user cancels the prompt, no action is taken.

#### User saves a registration (with a retain group selected)
After a successful save, the screen clears for the next registration using the same retain logic as the Clear button. Fields in the selected retain group are preserved; all other fields are cleared. The Retain selection remains unchanged.

#### No patient loaded — all retain fields are restored
When no patient has been looked up (i.e., the screen is in a fresh state after clear), all fields assigned to the selected retain group are restored, including patient demographic fields such as Name, Sex, DOB, Location, and Category.

#### Patient is loaded — patient demographic fields are excluded from restoration
When an existing patient is retrieved during a new registration, the system deliberately skips restoring the following fields even if they are enrolled in the active retain group. This ensures the freshly loaded patient's data takes precedence:
- Encounter No.
- Request No.
- HKID
- Patient Name
- Patient Chinese Name
- Sex
- DOB / Age / Age Unit
- Patient Location
- Patient Category
- Bed
- Admission Date/Time
- MRN
- Race

---

## Configuration

| Setting | Source | Purpose |
|---------|--------|---------|
| Retain group definitions | `RETAIN_MASTER` table — `retain_name`, `retain_group`, lab number | Defines the named groups that appear as radio buttons on screen. Each row produces one radio button. |
| Field-to-group assignments | `OBJECT_ATTRIBUTE` table — `objattr_function = 'RETAIN'`, `objattr_retain` = group code, `objattr_name` = object name | Controls which fields belong to which retain group for a given lab. |

> If no rows are found in `RETAIN_MASTER` for the current lab, the Retain component is hidden entirely and no retain behaviour applies.

---

## Business Rules

1. The Retain component is only visible when at least one retain group is configured for the current lab.
2. The first configured retain group is selected by default when the screen initialises.
3. The Retain radio button selection is **exempt from the clear process** — selecting a retain group and then clicking Clear does not reset the selection back to the default. The selection persists until the user explicitly changes it.
4. Retain applies on both **Clear** and **Save** — whenever the screen resets for a new registration, the active retain group determines which fields are preserved.
5. Patient demographic fields (Name, Sex, DOB, Location, Category, etc.) are not restored from the retain group when an existing patient is successfully loaded. The patient's live data always takes precedence.
6. The retain group membership is per-lab — the same field may be in different groups (or no group) depending on which lab the screen is operating for.
7. Retain groups are mutually exclusive — only one group can be selected at a time. Multiple retain groups cannot be combined.

---

## Related Workflows

- [[Clear Button]] — The clear action is the primary trigger for retain restoration. The Retain component determines which fields survive a clear.
- [[Screen Object Tab Sequence]] — The `OBJECT_ATTRIBUTE` table is also used to configure the tab sequence and default focus; retain configuration uses the same table with a different function code (`RETAIN` vs `REG`).
- [[Screen Object Focus]] — After clear with retain, focus returns to the default initial focus field (HKID or Encounter No.) as configured.
