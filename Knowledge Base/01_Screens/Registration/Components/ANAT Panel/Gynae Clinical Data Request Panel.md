# Gynae Clinical Data Request Panel

## Overview

The Gynae Clinical Data Request Panel is a modal data-entry panel that collects gynaecological clinical information for an ANAT gynaecological lab request. The panel opens when Registration staff click the **Gynae Clinical Data** button on the ANAT Panel for a qualifying gynae request. Multiple hospital-specific variants of the panel exist — the correct variant is selected automatically based on the hospital associated with the request. All variants share a common set of clinical data fields, with each hospital version presenting a layout and field subset tailored to that hospital's workflow. This document covers the shared structure and the hospital mapping. Field-level details for each hospital variant are documented in the linked user stories.

---

## Related User Stories

- **[[CRST-609]]** — Registration - ANAT Panel - Gynae Clinical Data Request Panel(s)
- **[[CRST-387]]** — Gynae Clinical Data Panel (AHN)
- **[[CRST-388]]** — Gynae Clinical Data Panel (CMC)
- **[[CRST-389]]** — Gynae Clinical Data Panel (DHL)
- **[[CRST-390]]** — Gynae Clinical Data Panel (KWH)
- **[[CRST-391]]** — Gynae Clinical Data Panel (PMH / YCH)
- **[[CRST-392]]** — Gynae Clinical Data Panel (PYN / QMH / UCH)
- **[[CRST-393]]** — Gynae Clinical Data Panel (TKO)

**Epic:** LISP-30 [CRST][DEV] Registration - Special Lab Workflow (ANAT)

---

## Component Modes

| Hospital | Panel Variant |
|----------|--------------|
| AHN | AHN version |
| CMC | CMC version |
| DH / H&C | DH version |
| KWH | KWH version |
| PMH / YCH | PMH/YCH version |
| PYN / QMH / UCH | UCH version |
| TKO | TKO version |

The correct variant is loaded automatically when the panel opens, based on the hospital code associated with the current ANAT request.

---

## Visual Layout

The panel is a modal data-entry dialogue. Its layout varies by hospital variant, but all variants share a scrollable form area containing clinical data fields grouped by clinical category. The panel includes an **OK** / **Confirm** button to save the entered data and a **Cancel** button to discard changes.

---

## Common Data Fields

The following fields are present across all or most hospital variants. Individual hospital variants may expose additional fields or omit fields that are not relevant to that hospital's workflow.

| Field | Description |
|-------|-------------|
| Request No. | The ANAT lab request number — displayed read-only for reference |
| Exam Type | Type of gynaecological examination performed (keyword-driven dropdown) |
| Last Menstrual Period (LMP) | Date of the patient's last menstrual period |
| Menstrual Cycle Days | Calculated or entered menstrual cycle length in days |
| Year of commencement (Yr Comm 1) | Year the patient commenced hormone or oral contraceptive treatment (first occurrence) |
| Pregnant | Weeks of pregnancy, if applicable |
| Postnatal | Weeks postnatal, if applicable |
| Year of commencement (Yr Comm 2) | Year of commencement (second occurrence, e.g., HRT) |
| Menopause | Year of menopause, if applicable |
| Oral Contraceptives | Whether the patient is taking oral contraceptives (Yes/No or checkbox) |
| Hormones / HRT | Whether the patient is receiving hormone replacement therapy (Yes/No or checkbox) |
| IUCD | Whether the patient has an intra-uterine contraceptive device |
| Radiotherapy | Whether the patient has had or is receiving radiotherapy (Yes/No) |
| Chemotherapy | Whether the patient has had or is receiving chemotherapy (Yes/No) |
| Cervix Appearance | Cervical appearance assessment (e.g., Healthy, Suspicious, Cancerous, Not Applicable) |
| Cervix Erosion | Degree of cervix erosion (keyword-driven) |
| Cervix Bleeding | Presence of cervical bleeding (keyword-driven) |
| Cervix Assessment | Overall cervical assessment (keyword-driven) |
| Specimen Collection Device | Device used to collect the specimen (e.g., Spatula, Cervex Brush, Endocervical Brush) |
| Gynae Symptoms | Symptoms reported (e.g., No symptoms, Contact bleeding, Post-coital bleeding, Post-menopausal bleeding, Abnormal bleeding, Abnormal vaginal discharge, Other) |
| Other Symptoms (free text) | Free-text entry when "Other symptoms" is selected |
| Infectious Disease | Whether an infectious disease is present; free-text detail field shown if Yes |
| Marital Status | Patient's marital status (keyword-driven) |
| Gravida | Number of pregnancies |
| Previous Treatment | Previous gynaecological treatment (keyword-driven) |
| Specimen Type | Specimen type used for the test (keyword-driven) |
| Other Assessment | Free-text additional clinical assessment notes |
| Clinical Summary / Diagnosis | Free-text clinical summary and diagnostic impression |

> **Default values:** For certain hospital variants (KWH, CMC, DH), the system pre-populates specific fields with default values when the panel opens for a new request. These defaults are hospital-specific and are documented in the respective hospital variant user stories.

---

## Buttons and Actions

### OK / Confirm

Saves the entered gynae clinical data against the lab request and closes the panel. The data is stored in the `CRS_AP_G_REQUEST` table and linked to the lab request. If the `COMPULSORY` lab option (GYNAE group) is enabled, this data must be present before the request can be saved.

### Cancel

Discards any changes and closes the panel without saving. The gynae clinical data for the request is left unchanged.

---

## Selection and Interaction Behaviours

#### Panel opens for a new request

If no gynae clinical data has previously been entered for this request, the panel opens with fields either blank or pre-populated with hospital-specific defaults (where applicable).

#### Panel opens for an existing request

If gynae clinical data was previously saved, the panel opens pre-populated with all previously entered values, allowing the user to review or amend them.

#### Infectious Disease field

When the user selects "Yes" for infectious disease, a free-text input field becomes visible for the user to specify the disease. When "No" is selected, the free-text field is hidden.

#### DH hospital variant — menstrual status radio group

The DH panel uses a radio button group to indicate the patient's menstrual status (LMP / Pregnant / Postnatal). Selecting each option activates the corresponding data entry field and hides the others.

---

## Configuration

| Setting | Option Code | Purpose | Effect when enabled | Effect when disabled |
|---------|-------------|---------|---------------------|----------------------|
| Gynae Clinical Data Compulsory | `COMPULSORY` *(group: GYNAE)* | Controls whether Gynae Clinical Data must be submitted before saving the request | Save blocked if panel data not entered | Gynae data entry is optional |

---

## Related Workflows

- [[Gynae Clinical Data Button]] — Describes the button that opens this panel, its visibility rules, and the qualifying test check.
- [[ANAT Panel Save Validation]] — The save validation sequence includes a check for missing gynae clinical data when the `COMPULSORY` option is enabled.
