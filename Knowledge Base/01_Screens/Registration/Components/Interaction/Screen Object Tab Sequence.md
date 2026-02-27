# Screen Object Tab Sequence

## Overview

The tab sequence on the Registration screen — the order in which the cursor moves between input fields when the user presses Tab — is not hardcoded but is driven entirely by database configuration. Each lab can maintain its own tab order, allowing individual laboratories to arrange the Registration screen's field traversal order to match their clinical workflow. The system reads the configured sequence at startup and assigns each field a sequential tab position accordingly.

---

## Related User Stories

- **[[CRST-115]]** - Registration - Screen Object Tab Sequence

**Epic:** LISP-29 [CRST][DEV] Registration - Screen Object Interaction

---

## Key Concepts

### Tab Sequence Configuration
Each participating field on the Registration screen is registered in a database table (`OBJECT_ATTRIBUTE`) with a function code of `REG`, a lab number, and a numeric order value. The system sorts all entries for the current lab ascending by order value and uses that sorted list to define the tab stop sequence.

### Object Name
A stable identifier that links a database configuration row to a specific field on the screen. For example, the object name `uo_sle_hkid` resolves to the **HKID** input field. The full mapping of object names to UI fields is documented in the Field Reference table below.

### Default Focus Marker (Order 999)
An order value of **999** is a special reserved value and is **not** a regular tab stop. It marks the field that receives focus when an existing patient is loaded via the Request No. field. This special marker is read by the [[Screen Object Focus]] workflow and is separate from the tab sequence.

---

## How the Tab Sequence Is Assigned

1. **Configuration is read per lab.** When the Registration screen initialises, it retrieves all `OBJECT_ATTRIBUTE` rows where the function is `REG` and the lab number matches the current lab. These rows are sorted in ascending order by their order value.

2. **Object names are resolved to screen fields.** Each row's object name is looked up against a fixed internal mapping to identify the corresponding Registration screen field.

3. **Sequential tab indices are assigned.** The resolved fields are numbered starting from 1 in the sorted order. The first field receives tab position 1, the second receives tab position 2, and so on.

4. **Fields not present in the configuration receive no tab stop.** If a field's object name does not appear in the configured list for the current lab, that field is excluded from keyboard tab navigation.

---

## Trigger Point

The tab sequence is calculated and applied each time the Registration screen refreshes its layout — including at initial load and when the lab context changes.

---

## Configuration

| Setting | Source | Purpose |
|---------|--------|---------|
| Function code | `OBJECT_ATTRIBUTE.objattr_function = 'REG'` | Identifies rows that belong to the Registration screen tab sequence |
| Lab number | `OBJECT_ATTRIBUTE.objattr_labno` | Scopes the tab configuration to a specific laboratory |
| Order value | `OBJECT_ATTRIBUTE.objattr_order` | Determines the tab position; rows are sorted ascending by this value |
| Object name | `OBJECT_ATTRIBUTE.objattr_name` | Identifies which screen field the row configures; see Field Reference below |

> **Special value:** An order value of **999** is reserved as the default focus marker for existing patients after Request No. entry. It does **not** create a tab stop — see [[Screen Object Focus]].

---

## Field Reference

The following table lists every object name that the Registration screen recognises, the corresponding UI field label, and — where the field is a sub-component of a compound field — the parent field.

| Object Name | UI Field | Notes |
|-------------|----------|-------|
| `uo_sle_encounter` | Encounter No. | |
| `uo_sle_labno` | Request No. | |
| `uo_sle_hkid` | HKID | |
| `uo_sle_patient_name` | Patient Name | |
| `uo_sle_patient_cname` | Patient Chinese Name | |
| `uo_ddlb_sex` | Patient Sex | |
| `uo_em_dob` | Patient DOB | |
| `uo_em_age` | Patient Age | |
| `uo_ddlb_ageunit` | Patient Age Unit | |
| `uo_ddlb_exact_dob_flag` | Exact DOB Flag | |
| `uo_sle_patient_location` | Patient Location | Top-level compound field |
| `uo_sle_patient_location.uo_sle_hosp` | Patient Location — Hospital | Sub-component |
| `uo_sle_patient_location.uo_sle_spec` | Patient Location — Specialty | Sub-component |
| `uo_sle_patient_location.uo_sle_loc` | Patient Location — Ward | Sub-component |
| `uo_ddlb_category` | Patient Category | |
| `uo_sle_rmbed` | Patient Bed | |
| `uo_em_admission_datetime` | Admission Date/Time | |
| `uo_sle_mrn` | MRN | |
| `dw_pat_race` | Patient Race | |
| `uo_mle_clinical_details` | Clinical Detail | |
| `uo_sle_reqdoc` | Request Doctor | |
| `uo_sle_req_hosp_doc` | Request Doctor (Hosp) | Top-level compound field |
| `uo_sle_req_hosp_doc.uo_sle_doc` | Request Doctor (Hosp) — Code | Sub-component |
| `uo_sle_req_hosp_doc.uo_sle_hosp` | Request Doctor (Hosp) — Hospital | Sub-component |
| `cb_create_doctor` | Create New Doctor Button | |
| `reqdoc_name` | Request Doctor Name | |
| `uo_sle_reqlocn` | Request Location | Top-level compound field |
| `uo_sle_reqlocn.uo_sle_hosp` | Request Location — Hospital | Sub-component |
| `uo_sle_reqlocn.uo_sle_spec` | Request Location — Specialty | Sub-component |
| `uo_sle_reqlocn.uo_sle_loc` | Request Location — Ward | Sub-component |
| `uo_sle_reptdest` | Report Location | Top-level compound field |
| `uo_sle_reptdest.uo_sle_hosp` | Report Location — Hospital | Sub-component |
| `uo_sle_reptdest.uo_sle_spec` | Report Location — Specialty | Sub-component |
| `uo_sle_reptdest.uo_sle_loc` | Report Location — Ward | Sub-component |
| `uo_sle_copyto` | Report Copy Location | Top-level compound field |
| `uo_sle_copyto.uo_sle_hosp` | Report Copy Location — Hospital | Sub-component |
| `uo_sle_copyto.uo_sle_spec` | Report Copy Location — Specialty | Sub-component |
| `uo_sle_copyto.uo_sle_loc` | Report Copy Location — Ward | Sub-component |
| `cb_copyto` | Add Extra Copy Location Button | |
| `uo_mle_doctor_ref` | Reference | |
| `uo_mle_req_comment` | Comment | |
| `uo_ddlb_confidential` | Confidential | |
| `uo_ddlb_lab_only` | Private? | |
| `uo_ddlb_bill` | Bill | |
| `uo_ddlb_urgency` | Urgency | |
| `uo_em_request_datetime` | Request Date/Time | |
| `uo_em_arrival_datetime` | Arrival Date/Time | |
| `uo_em_collection_datetime` | Collection Date/Time | |
| `uo_requested_tests` | Request Test Panel | |
| `cb_save` | Save Button | |
| `cb_cancel` | Clear Button | |
| `cb_exit` | Exit Button | |
| `cb_sendout` | Send Out Button | |
| `uo_lis_retain` | Retain Checkbox | |

---

## Business Rules

1. Tab order is lab-specific — different laboratories may configure entirely different tab sequences for the same screen.
2. The tab sequence is determined solely by the ascending sort of the order value in the configuration — no other factor affects the tab position.
3. A field that has no configuration row for the current lab receives no tab stop and will be skipped during keyboard navigation.
4. An order value of 999 is reserved as a special marker for the default focus field (post-Request-No. entry for existing patients). It does not produce a regular tab stop.
5. Sub-components of compound fields (e.g., the Hospital, Specialty, and Ward parts of Patient Location) can be individually positioned in the tab sequence by using the dot-notation object name.
6. The tab index numbering starts at 1 and increments by 1 for each successive field in the sorted configuration list.

---

## Related Components and Workflows

- [[Screen Object Focus]] — Documents the related `objattr_order = 999` mechanism that controls which field receives focus after Request No. entry for existing patients.
- [[Clear Screen]] — After a registration is saved, the screen clears and the default focus field (determined by the focus configuration) is selected. The tab sequence remains in effect for the next entry.
- [[Register Request]] — The registration save workflow in which the correctly tabbed fields are used throughout data entry.
