# Request Information Panel

## Overview

The Request Information Panel is a data-entry section of the Registration screen that captures the clinical and logistical details of a laboratory request. It becomes interactive only after the HKID, Encounter Number, and Request Number have all been successfully validated. Unlike the Patient Demographics Panel, its fields do not vary by patient type — all fields are enabled in the same way for every request. However, some fields carry system-derived defaults, and the visibility of the three specimen datetime fields is controlled by a lab-level configuration setting.

---

## Related User Stories

- **[[CRST-455]]** - Registration - Request Information Panel Enablement

**Epic:** LISP-25 [CRST][DEV] Registration - Screen Object Enablement

---

## Visual Layout

The Request Information Panel sits below the Patient Demographics Panel on the Registration screen. It is arranged as a form with labelled fields. The panel contains free-text input fields, dropdown selectors, location sub-panels (each composed of a hospital, specialty, and ward/clinic field), a doctor sub-panel, action buttons, and optionally visible datetime fields at the bottom. All fields become active simultaneously when the Request Number is validated.

---

## Field Enablement

All fields on the Request Information Panel activate when the Request Number is validated. The table below lists each field, its default state on activation, and its keyboard shortcut where applicable.

| Field | State on Activation | Default Value | Shortcut |
|-------|---------------------|---------------|----------|
| Clin Dtl (Clinical Detail) | Visible, blank, editable | (blank) | **Ctrl+Shift+C** |
| Confidential | Visible, selectable | **No** | **Ctrl+Shift+F** |
| Private | Visible, selectable | **No** | **Ctrl+Shift+K** |
| Bill | Visible, selectable | **No** | (none) |
| Urgency | Visible, selectable | **Non-urgent** | **Ctrl+Shift+U** |
| Req Dr. — Hospital | Visible, editable | Lab's home hospital | (none) |
| Req Dr. — Doctor Code | Visible, blank, editable | (blank) | **Ctrl+Shift+D** |
| Enter New Doctor button | Active (clickable) | N/A | (none) |
| Req Dr. — Doctor Name | Visible, non-editable | (populated when doctor code entered) | (none) |
| Req Loc — Hospital | Visible, editable | Lab's home hospital | (none) |
| Req Loc — Specialty | Visible, blank, editable | (blank) | (none) |
| Req Loc — Ward / Clinic | Visible, blank, editable | (blank) | **Ctrl+Shift+Q** |
| Rpt Loc — Hospital | Visible, editable | Lab's home hospital | (none) |
| Rpt Loc — Specialty | **Disabled**, non-editable | N/A | (none) |
| Rpt Loc — Ward / Clinic | Visible, blank, editable | (blank) | **Ctrl+Shift+P** |
| Copy — Hospital | Visible, editable | Lab's home hospital | (none) |
| Copy — Specialty | **Disabled**, non-editable | N/A | (none) |
| Copy — Ward / Clinic | Visible, blank, editable | (blank) | **Ctrl+Shift+Y** |
| Report Copy to other location button | Active (clickable) | N/A | (none) |
| Ref (Reference) | Visible, blank, editable | (blank) | **Ctrl+Shift+W** |
| Comm (Comment) | Visible, blank, editable | (blank) | **Ctrl+Shift+Z** |
| Request datetime | Visible or hidden — see Configuration | Current date/time (or blank if optional) | **Ctrl+Shift+R** |
| Arrive datetime | Visible or hidden — see Configuration | Current date/time (or blank if optional) | **Ctrl+Shift+V** |
| Collect datetime | Visible or hidden — see Configuration | Current date/time (or blank if optional) | **Ctrl+Shift+L** |

> **Rpt Loc — Specialty** and **Copy — Specialty** are always disabled and non-editable. These fields cannot be entered by the user.

> If the Request Number uses an **urgent lab prefix**, the system automatically sets the Urgency field to **Urgent** upon activation, overriding the "Non-urgent" default.

---

## Default Value Behaviour

### Location defaults
The Hospital fields for Req Location, Rpt Location, and Copy Location all default to the same hospital as the Patient Location — which itself defaults to the lab's home hospital. When the patient's location hospital is changed, the defaults for these panels update accordingly.

### Req Location pre-populated from Patient Location
When an existing patient is loaded, the Req Location fields (Hospital, Specialty, Ward/Clinic) are pre-filled to match the patient's recorded location. The user may change them before saving.

### Req Doctor pre-populated from Patient's Attending Doctor
When an existing patient is loaded, the Req Doctor field is pre-filled with the patient's attending doctor, if one is recorded. The user may change this before saving.

### Confidential, Private, Bill, and Urgency defaults
Each of these dropdown fields resets to its system default ("No", "No", "No", "Non-urgent" respectively) each time a new request is started. If the registration is opened from a menu item that pre-fills request data, these values may be overridden by the pre-filled data.

---

## Configuration

| Setting | Option Code | Purpose | Effect when enabled | Effect when disabled |
|---------|------------|---------|--------------------|--------------------|
| Specimen Datetime Visibility | `DATE_ATTRIBUTE` | Controls whether the Request, Arrive, and Collect datetime fields are shown. Each of the three datetime fields (Request, Arrive, Collect) is controlled independently by positional flags encoded within the option text. | Datetime field is visible and editable | Datetime field is hidden |
| Datetime default as empty when optional | `DATE_ATTRIBUTE` | Controls whether optional datetime fields default to blank instead of the current date/time | Defaults to blank | Defaults to current date/time |

> Both settings are derived from the same `DATE_ATTRIBUTE` option row. The option text encodes visibility and default-format flags per datetime type (Request, Arrival, Collection). The settings are evaluated per lab number — the lab number of the Request Number prefix determines which option row applies.

---

## Data Sources

| Field | Source |
|-------|--------|
| Confidential | Keyword group **CONFID** — Lab database |
| Private | Keyword group **PRIVATE_RQ** — Lab database |
| Bill | Keyword group **FOUND_YN** — Lab database |
| Urgency | Keyword group **URGENCY** — Lab database |
| Req Dr. — Hospital | Office directory, hospital-type offices |
| Req Dr. — Doctor Code | Office directory, doctor-type offices filtered by selected hospital |
| Req Loc / Rpt Loc / Copy — Hospital | Office directory, hospital-type offices |
| Req Loc / Rpt Loc / Copy — Specialty | Office directory, specialty-type offices filtered by selected hospital |
| Req Loc / Rpt Loc / Copy — Ward / Clinic | Office directory, ward/clinic-type offices filtered by selected hospital |

> Only **active** keyword items are shown in dropdown lists. Inactive keyword items are excluded.

---

## Selection and Interaction Behaviours

#### Panel activates after Request Number is validated
Once the Request Number is validated, all fields in the Request Information Panel become active simultaneously. Location and doctor fields are pre-populated where patient data is available.

#### User changes a Location — Hospital field
Changing any Hospital field (Req Loc, Rpt Loc, or Copy) causes the associated Ward/Clinic dropdown to reload, filtered to show only locations belonging to the newly selected hospital. The Specialty field for Rpt Loc and Copy remains disabled regardless of the selected hospital.

#### User enters a Doctor Code
When the user enters or selects a doctor code in the Req Dr. field, the system populates the read-only **Doctor Name** field with the full name of the matched doctor.

#### User clicks "Enter New Doctor"
The system opens a dialogue allowing the user to create or register a new doctor record. Once saved, the new doctor is available for selection in the Req Dr. field.

#### User clicks "Report Copy to other location"
The system opens a dialogue or panel that allows additional copy-to locations to be specified beyond the single Copy location visible on the main panel.

#### Request Number has an urgent lab prefix
If the validated Request Number begins with a prefix designated as "urgent", the Urgency field is automatically set to **Urgent** before the user can interact with the panel.

---

## Related Workflows

- [[Retrieve Patient by HKID]] — The panel activates as part of the final state reached by this workflow.
- [[Retrieve Patient by Encounter Number]] — The panel activates with existing patient data pre-populated.
- [[Create New Patient by HKID]] — The panel activates with default values for a new patient.
- [[Default Request Info]] — Describes the default values applied to the Request Information Panel fields when a request number is first assigned, including Confidential, Bill, Urgency, Private, and the three datetime fields.
