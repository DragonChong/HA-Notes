# Gynae Clinical Data Request Panel

## Overview

The Gynae Clinical Data Request Panel is a modal data-entry panel that collects gynaecological clinical information for an ANAT gynaecological lab request. The panel opens when Registration staff click the **Gynae Clinical Data** button on the ANAT Panel for a qualifying gynae request. Multiple hospital-specific variants of the panel exist — the correct variant is selected automatically based on the hospital code associated with the request. All variants persist their data to the `CRS_AP_G_REQUEST` table when the request is registered. This document covers the shared structure, hospital variant mapping, field behaviour, and validation rules. Field-level UI screenshots and acceptance criteria for each hospital variant are documented in the linked user stories.

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

The panel variant displayed is determined by the hospital code of the current ANAT request. The mapping is:

| Hospital Code(s) | Panel Variant |
|-----------------|--------------|
| AHN, NDH | AHN version |
| CMC | CMC version |
| DH | DH version |
| KWH | KWH version |
| PMH, YCH | PMH / YCH version |
| TKO | TKO version |
| UCH | UCH version |
| PYN, QMH, GH, and all other hospitals | UCH version (fallthrough) |

> The UCH panel layout is used as the default for any hospital that does not have a dedicated variant. This means hospitals such as PYN, QMH, and GH all see the UCH version.

---

## Visual Layout

The panel is a modal data-entry dialogue with a scrollable form area. Its layout and field set vary by hospital variant. All variants share:
- A read-only **Request No.** display at the top
- Clinical data fields grouped by category (menstrual history, clinical condition, risk factors, etc.)
- An **OK** button and a **Cancel** button at the bottom

---

## Fields by Hospital Variant

### AHN / NDH Variant

| Field | Type | Remarks |
|-------|------|---------|
| Request No. | Read-only text | |
| LMP | Date picker | |
| Perimenopausal | Checkbox | |
| Postmenopausal (years) | Decimal number | Max 3 digits + 2 decimals |
| Pregnant (weeks) | Integer | Max 3 digits |
| Postnatal (weeks) | Integer | Max 3 digits |
| No Symptoms | Checkbox | Other Symptoms group |
| Menorrhagia | Checkbox | Other Symptoms group |
| Irregular bleeding | Checkbox | Other Symptoms group |
| Discharge | Checkbox | Other Symptoms group |
| IUCD | Checkbox | Other Symptoms group |
| Postcoital bleeding | Checkbox | Other Symptoms group |
| Postmenopausal bleeding | Checkbox | Other Symptoms group |
| Others (Other Symptoms) | Free text | Visible always; stored in `greq_cervix_app` |
| Healthy | Checkbox | Cervix Assessment group |
| Erosion | Checkbox | Cervix Assessment group |
| Polyp | Checkbox | Cervix Assessment group |
| Suspicious | Checkbox | Cervix Assessment group |
| Cancerous | Checkbox | Cervix Assessment group |
| Others (Cervix Assessment) | Free text | Stored in `greq_infect_desc` |

No pre-populated default values for AHN / NDH.

---

### CMC Variant

| Field | Type | Remarks |
|-------|------|---------|
| Request No. | Read-only text | |
| Examination | Dropdown | GYNAE_S keyword group, display type 1. **Default: Routine** |
| Cervix Erosion | Dropdown | GYNAE_S keyword group, display type 4 |
| Contact Bleeding | Dropdown | GYNAE_S keyword group, display type 5 |
| Cervix | Dropdown | GYNAE_S keyword group, display type 6. Options: Healthy, Suspicious, Cancerous, Highly Suspicious |
| Specimen Type | Dropdown | GYNAE_S keyword group, display type 7. **Default: `key_ckey = 6461`** |
| Previous Treatment | Dropdown | GYNAE_S keyword group, display type 8 |
| LMP | Date picker | |
| Menopause (years) | Decimal number | Max 3 digits |
| Pregnant (weeks) | Integer | Max 3 digits |
| Postnatal (weeks) | Integer | Max 3 digits |
| Oral Contraceptive | Checkbox | |
| Other Hormones | Checkbox | |
| IUCD | Checkbox | |

**Default values on first open (new record):**
- Examination: `key_ckey = 6201` (Routine)
- Specimen Type: `key_ckey = 6461`

---

### DH Variant

| Field | Type | Remarks |
|-------|------|---------|
| Request No. | Read-only text | |
| LMP | Radio button + date picker | Radio group — mutually exclusive with Postmenopausal, Postnatal, Pregnant |
| Postmenopausal (year) | Radio button + decimal number | Max 3 digits + 2 decimals |
| Postnatal (weeks) | Radio button + integer | Max 3 digits; field only editable when Postnatal radio selected |
| Pregnant (weeks) | Radio button + integer | Max 3 digits; field only editable when Pregnant radio selected |
| IUCD in-situ | Radio button (No / Yes) | |
| Oral-Contraceptive | Radio button (No / Yes) | |
| Otr. Hormones | Radio button (No / Yes) + free text | Free-text field visible and editable when Yes selected; max 100 characters |
| Chemotherapy | Radio button (No / Yes) + free text | Free-text field visible and editable when Yes selected; max 100 characters |
| Radiotherapy | Radio button (No / Yes) + free text | Free-text field visible and editable when Yes selected; max 100 characters |
| Clinical Summary & Diagnosis | Free text | Max 510 characters; overflow stored in a second column |
| Other Gynae Symptoms | Multi-select checkboxes + free text | See Gynae Symptoms section below |
| Cervix Appearance | Multi-select checkboxes + free text | See Cervix Appearance section below |
| Specimen Collection Device | Multi-select checkboxes + free text | See Specimen Collection Device section below |

**Menstrual status radio group:** Only one of LMP, Postmenopausal, Postnatal, or Pregnant can be active at a time. Selecting a radio button enables that option's input field; all other fields are disabled and cleared on save.

**Default values on first open (new record):**
When the panel opens and the record has no prior data (i.e., Pregnant, Postnatal, and Menopause are all null):
- LMP radio button is selected by default
- Cervix Appearance **Healthy** checkbox is checked by default

---

### KWH Variant

| Field | Type | Remarks |
|-------|------|---------|
| Request No. | Read-only text | |
| Examination | Dropdown | GYNAE_S keyword group, display type 1. **Default: Routine** |
| LMP | Date picker | |
| Menopause | Checkbox | When checked, saves `1.00` to `greq_menopause` |
| Pregnant | Integer | Max 3 digits |
| Postpartum | Integer | Max 3 digits (mapped to Postnatal) |
| Hormones | Checkbox | |
| Oral Contraceptive | Checkbox | |
| Cervix Erosion | Dropdown | GYNAE_S keyword group, display type 4. **Default: Nil** |
| Contact Bleeding | Dropdown | GYNAE_S keyword group, display type 5. **Default: Nil** |
| Cervix Assessment | Dropdown | GYNAE_S keyword group, display type 6. **Default: Healthy** |

**Default values on first open (new record):**
- Examination: `key_ckey = 6201` (Routine)
- Cervix Erosion: `key_ckey = 6411` (Nil)
- Contact Bleeding: `key_ckey = 6431` (Nil)
- Cervix Assessment: `key_ckey = 6451` (Healthy)

---

### PMH / YCH Variant

| Field | Type | Remarks |
|-------|------|---------|
| Request No. | Read-only text | |
| Examination | Dropdown | GYNAE_S keyword group, display type 1 |
| Infectious Disease | Dropdown (No / Yes) + free text | Free-text description field shown when Yes selected |
| Marital Status | Dropdown | GYNAE_S keyword group, display type 3 |
| Gravida | Integer | Max 3 digits |
| Para | Integer | Max 3 digits (mapped to `greq_birth`) |
| Cervix Erosion | Dropdown | GYNAE_S keyword group, display type 4 |
| Contact Bleeding | Dropdown | GYNAE_S keyword group, display type 5 |
| Cervix Assessment | Dropdown | GYNAE_S keyword group, display type 6 |
| LMP | Date picker | |
| Cycle (days) | Integer | Max 2 digits |
| Age of Menopause | Decimal number | Max 3 digits; stored as `XXX.00` |
| Pregnant (weeks) | Integer | Max 3 digits |
| Postpartum (weeks) | Integer | Max 3 digits |
| IUCD | Dropdown (No / Yes) | |
| Hormones | Dropdown (No / Yes) | |
| Oral Contraceptive | Dropdown (No / Yes) | |
| Previous Smear Atypical | Checkbox | Risk Factors group |
| Genital Warts | Checkbox | Risk Factors group |
| STD | Checkbox | Risk Factors group |
| Smoker | Checkbox | Risk Factors group |
| Conization | Checkbox | Risk Factors group |
| Laser Therapy | Checkbox | Risk Factors group |
| Cryotherapy | Checkbox | Risk Factors group |
| Radiotherapy | Checkbox | Risk Factors group |
| Chemotherapy | Checkbox | Risk Factors group |
| Hysterectomy for Malignancy | Checkbox | Risk Factors group |
| None | Checkbox | Risk Factors group |

No pre-populated default values for PMH / YCH.

---

### TKO Variant

| Field | Type | Remarks |
|-------|------|---------|
| Request No. | Read-only text | |
| Examination | Dropdown | GYNAE_S keyword group, display type 1 |
| Radiotherapy | Dropdown (No / Yes) | Saves 0 or 1 |
| LMP | Date picker | |
| Year Commenced | Integer | Max 4 digits (Yr Comm 1) |
| Pregnant (weeks) | Integer | Max 3 digits |
| Chemotherapy | Dropdown (No / Yes) | Saves 0 or 1 |
| Postnatal (weeks) | Integer | Max 3 digits |
| Year Commenced | Integer | Max 4 digits (Yr Comm 2) |
| Oral-Contraceptive | Dropdown (No / Yes) | Saves 0 or 1 |
| Other Hormones | Dropdown (No / Yes) | Saves 0 or 1 |
| Menopause | Decimal number | Max 3 digits + 2 decimals |
| No. of Birth | Integer | Max 3 digits |
| IUCD in-situ | Dropdown (No / Yes) | Saves 0 or 1 |
| Cervical Appearance | Multi-select checkboxes | 8 options: Normal, Cervicitis, Erosion, Polyps, Ulcer, Growth, Suspicious, Cancerous. Stored as 8-character bit-string |

No pre-populated default values for TKO.

---

### UCH / PYN / QMH / GH Variant (and all other hospitals)

| Field | Type | Remarks |
|-------|------|---------|
| Request No. | Read-only text | |
| Examination | Dropdown | GYNAE_S keyword group, display type 1 |
| LMP | Date picker | |
| Radiotherapy | Dropdown (No / Yes) | |
| Mensus Cycle Days | Read-only number | Calculated as the difference between LMP date and request registered date; displays negative when LMP is later than registered date |
| Year Commenced | Integer | Max 4 digits (Yr Comm 1) |
| Pregnant (weeks) | Integer | Max 3 digits |
| Chemotherapy | Dropdown (No / Yes) | |
| Postnatal (weeks) | Integer | Max 3 digits |
| Year Commenced | Integer | Max 4 digits (Yr Comm 2) |
| Oral-Contraceptive | Dropdown (No / Yes) | |
| Other Hormones | Dropdown (No / Yes) | |
| Menopause | Decimal number | Max 3 digits + 2 decimals |
| No. of Birth | Integer | Max 3 digits |
| IUCD in-situ | Dropdown (No / Yes) | |
| Cervical Appearance | Multi-select checkboxes | 6 options: Normal, Cervicitis, Erosion, Polyps, Ulcer, Growth. Stored as 6-character bit-string |

No pre-populated default values for UCH / fallthrough hospitals.

---

## Cervix Appearance Field

> As of LIS-7092 (May 2023), Cervix Appearance uses **checkboxes** on the DH panel (previously radio buttons). An **Others** free-text option was added for the DH panel.
> As of LIS-8616 (November 2023), the **Healthy** option is checked by default when the panel opens for a record with no prior cervix appearance data — applicable to all hospital variants.

The way Cervix Appearance data is stored varies by hospital:

| Hospital Variant | Storage Format | Details |
|-----------------|---------------|---------|
| DH | String literal | One of: `Healthy`, `Suspicious`, `Cancerous`, `Not applicable`, or the free-text value entered in the Others field |
| AHN / NDH | Free text string | The value from the Others (Cervix Assessment) field is stored directly |
| CMC | Keyword ckey number | The selected item's keyword key from GYNAE_S display type 6 |
| KWH | Fixed string `000000` | Always written as `000000`; Cervix Appearance is not a user-editable field in the KWH variant — cervical condition is captured via the Cervix Erosion, Contact Bleeding, and Cervix Assessment dropdowns instead |
| PMH / YCH | Fixed string `000000` | Same as KWH |
| TKO | 8-character bit-string | Each position corresponds to one checkbox option in order: Normal, Cervicitis, Erosion, Polyps, Ulcer, Growth, Suspicious, Cancerous. `1` = checked, `0` = unchecked. Example: `11100100` |
| UCH / others | 6-character bit-string | Each position: Normal, Cervicitis, Erosion, Polyps, Ulcer, Growth. Example: `110110` |

---

## Specimen Collection Device Field (DH Only)

The **Specimen Collection Device** section is present only on the DH panel. The user selects from:
- Spatula
- Cervex brush
- Endocervical brush
- Others (free text)

Multiple options may be selected simultaneously. The saved value is a single concatenated string where the selected items are joined with ` + ` as the separator.

**Example:** If Spatula, Cervex brush, and Others (with text "Brush") are selected, the stored value is: `Spatula + Cervex brush + Brush`

The total length of the constructed string must not exceed 255 characters.

---

## Other Gynae Symptoms Field (DH Only)

The **Other Gynae Symptoms** section is present only on the DH panel. The user may select any combination of:
- No symptoms
- CB (Contact bleeding)
- PCB (Post-coital bleeding)
- PMB (Post menopausal bleeding)
- Abnormal bleeding
- Abn. vag. Discharge
- Others (free text)

The saved value is a single comma-separated string of the selected symptom labels followed by the free-text content of the Others field.

**Example (all selected):** `No symptoms, Contact bleeding, Post-coital bleeding, Post menopausal bleeding, Abnormal bleeding, Abnormal vaginal discharge, <others text>`

The total length of the constructed string must not exceed 255 characters.

---

## Buttons and Actions

### OK

Validates the entered data (for DH only — see Validation section) and, if valid, saves the gynae clinical data against the lab request. The panel closes. The data is written to `CRS_AP_G_REQUEST` when the ANAT lab request is registered. If the `COMPULSORY` lab option (GYNAE group) is enabled, this data must be present before the request can be saved.

**Keyboard shortcut:** Ctrl+Shift+O

### Cancel

Discards any changes and closes the panel without saving. The gynae clinical data for the request is left unchanged.

**Keyboard shortcut:** Ctrl+Shift+C

---

## Selection and Interaction Behaviours

#### Panel opens for a new request

If no gynae clinical data has previously been entered for this request, the panel opens with fields either blank or pre-populated with hospital-specific defaults (see Fields by Hospital Variant sections above). The Cervix Appearance **Healthy** option is checked by default for all hospital variants on a new record.

#### Panel opens for an existing request

If gynae clinical data was previously saved, the panel opens pre-populated with all previously entered values, allowing the user to review or amend them.

#### Infectious Disease field (PMH / YCH only)

When the user selects **Yes** for Infectious Disease, a free-text description field becomes visible for the user to specify the disease. When **No** is selected, the free-text field is hidden.

#### DH panel — menstrual status radio group

The DH panel uses a mutually exclusive radio button group for menstrual status: **LMP**, **Postmenopausal**, **Postnatal**, and **Pregnant**. Only the selected option's input field is active; the others are disabled. When the record is saved, only the value for the selected option is written; all other menstrual status fields are cleared to null.

#### DH panel — Otr. Hormones / Chemotherapy / Radiotherapy detail fields

For these three fields on the DH panel, a free-text detail field becomes visible and editable when the user selects **Yes**. Each detail field is limited to 100 characters.

#### UCH / PYN / QMH panel — Mensus Cycle Days

This field is read-only and calculated automatically. It shows the number of days between the entered LMP date and the request's registered date. A positive value means LMP was before the registered date; a negative value means LMP was entered as a future date relative to registration.

---

## Validation

Validation is applied when the user clicks **OK**. The following checks are performed:

| Condition | Message No. | Message Text (summary) |
|-----------|-------------|------------------------|
| DH: Postnatal radio selected but weeks field is empty | 3244 | "Please enter the weeks for Postnatal." |
| DH: Pregnant radio selected but weeks field is empty | 3245 | "Please enter the weeks for Pregnant." |
| Otr. Hormones is Yes but detail text exceeds 100 characters | 3744 | "Other Hormones detail is not allowed to be more than 100 characters." |
| Chemotherapy is Yes but detail text exceeds 100 characters | 3745 | "Chemotherapy detail is not allowed to be more than 100 characters." |
| Radiotherapy is Yes but detail text exceeds 100 characters | 3746 | "Radiotherapy detail is not allowed to be more than 100 characters." |
| Clinical Summary & Diagnosis exceeds 510 characters | 3747 | "Clinical Summary & Diagnosis is not allowed to be more than 510 characters." |
| Others (Gynae Symptoms) checkbox checked but free-text field is blank | 3246 | "Please enter or uncheck the Other Gynae Symptoms." |
| Constructed Gynae Symptoms string exceeds 255 characters | 3741 | "Please shorten Other Gynae Symptoms for at least N character(s)." |
| Others (Specimen Collection Device) checkbox checked but free-text field is blank | 3247 | "Please enter or uncheck the Other Specimen Collection Device." |
| Constructed Specimen Collection Device string exceeds 255 characters | 3742 | "Please shorten Other Specimen Collection Device for at least N character(s)." |

> Messages 3244 and 3245 apply **only to the DH variant**. Messages 3741–3747 and 3246–3247 apply **only to the DH variant** as those fields exist only in the DH panel.

---

## Data Saved (CRS_AP_G_REQUEST)

All variants save data to the `CRS_AP_G_REQUEST` table. The fields saved vary by hospital variant. The common fields saved across most variants are:

| Field Label | Column | Notes |
|-------------|--------|-------|
| Request No. | `greq_reqno` | Always written |
| Exam Type | `greq_exam` | Keyword ckey; not used by AHN/NDH or DH |
| LMP | `greq_lmp` | Date |
| Pregnant (weeks) | `greq_pregnant` | Integer |
| Postnatal (weeks) | `greq_postnatal` | Integer |
| Menopause | `greq_menopause` | Numeric; KWH stores `1.00` when checkbox checked; PMH/YCH/UCH/TKO store age value |
| Oral Contraceptive | `greq_oral_cont` | 0 or 1 |
| Hormones / HRT | `greq_hormones` | 0 or 1 |
| IUCD | `greq_iucd` | 0 or 1 |
| Chemotherapy | `greq_chemo` | 0 or 1 |
| Radiotherapy | `greq_radiotherapy` | 0 or 1 |
| Cervix Erosion | `greq_cervix_erosion` | Keyword ckey or 0/1 depending on variant |
| Cervix Bleeding | `greq_cervix_bleed` | Keyword ckey or 0/1 depending on variant |
| Cervix Assessment | `greq_cervix_assess` | Keyword ckey |
| Cervix Appearance | `greq_cervix_app` | Format varies by hospital (see Cervix Appearance section) |
| Infectious Disease | `greq_infect_disease` | 0 or 1 |
| Infectious Disease Description / Gynae Symptoms | `greq_infect_desc` | Free text; comma-separated string for DH |
| Marital Status | `greq_marital_status` | Keyword ckey; PMH/YCH only |
| Gravida | `greq_gravida` | PMH/YCH only |
| Para / No. of Birth | `greq_birth` | PMH/YCH, UCH, TKO |
| Year Commenced 1 | `greq_yr_comm1` | UCH/TKO only |
| Year Commenced 2 | `greq_yr_comm2` | UCH/TKO only |
| LMP Cycle Days | `greq_lmp_cycle` | Numeric days (PMH/UCH/TKO) or 1=Healthy flag (AHN/NDH) |
| Previous Smear Atypia | `greq_rk_prev_smear_atyp` | 0 or 1 |
| Genital Warts risk factor | `greq_rk_genital_warts` | 0 or 1; not TKO/UCH |
| STD risk factor | `greq_rk_std` | 0 or 1; not TKO/UCH |
| Smoker risk factor | `greq_rk_smoker` | 0 or 1 |
| Conization history | `greq_rk_conization` | 0 or 1 |
| Laser treatment history | `greq_rk_laser` | 0 or 1 |
| Cryo treatment history | `greq_rk_cryo` | 0 or 1 |
| Hysterectomy (malignant) | `greq_rk_hystect_malign` | 0 or 1 |
| None (risk factors) | `greq_rk_none` | 0 or 1 |
| Hormones detail | `greq_otr_hormo_detail` | Free text, max 100 chars; DH only |
| Chemotherapy detail | `greq_chemo_detail` | Free text, max 100 chars; DH only |
| Radiotherapy detail | `greq_radio_detail` | Free text, max 100 chars; DH only |
| Clinical Summary & Diagnosis | `greq_clin_sum_diag` | Free text, max 255 chars in this column; DH only |
| Clinical Summary & Diagnosis (overflow) | `greq_clin_sum_diag2` | Characters 256–510 overflow here; DH only |
| Specimen Collection Device | `greq_spec_col_device` | Concatenated string, max 255 chars; DH only |
| Registered Date | `greq_registered_date` | Always written |

---

## Configuration

| Setting | Option Code | Purpose | Effect when enabled | Effect when disabled |
|---------|-------------|---------|---------------------|----------------------|
| Gynae Clinical Data Compulsory | `COMPULSORY` *(group: GYNAE)* | Controls whether Gynae Clinical Data must be submitted before saving the ANAT request | Save blocked if panel data not entered | Gynae data entry is optional |

---

## Related Workflows

- [[Gynae Clinical Data Button]] — Describes the button that opens this panel, its visibility rules, and the qualifying test check.
- [[ANAT Panel Save Validation]] — The save validation sequence includes a check for missing gynae clinical data when the `COMPULSORY` option is enabled.
