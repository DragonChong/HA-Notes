# Send Out Information Dialogue

## Overview

The Send Out Information Dialogue is a modal step within the Pre-Register save sequence that collects all information required to refer the patient's specimen to an external laboratory. It appears as a dedicated step in the save stepper when the **Send Out** checkbox is checked on the Registration screen. The dialogue supports a two-specimen structure, capturing separate send-out and receiving datetimes for Specimen 1 and Specimen 2. Most field behaviour — including field enablement, visibility, default values, and validation — follows the rules documented in [[Send Out Information Dialogue (CRST-41)]]. Only the **Request No** field and the **Show Result in ePR** checkbox have different logic specific to the Registration screen.

---

## Related User Stories

- **[[CRST-106]]** - Registration - Pre-register: Send Out Information
- **[[CRST-41]]** - Send Out Information (non-registration screen, governs most field rules)
- **[[CRST-886]]** - Amend Request - Send Out Dialogue

**Epic:** LISP-27 [CRST][DEV] Registration - Register Workflow

---

## Trigger Point

This step is included in the Pre-Register save stepper when the **Send Out** checkbox on the Registration screen is checked before saving. The dialogue opens automatically as part of the sequential save flow.

---

## Differences from CRST-41

The following fields behave differently in the Registration context:

| Field | Behaviour in CRST-106 (Registration) |
|---|---|
| Request No | Displayed as read-only. The request number has already been assigned and cannot be changed from within this dialogue. |
| Show Result in ePR — visibility | Controlled by the `REG_SHOW_RESULT_IN_EPR_CHECKBOX_VISIBLE` lab option (option group: `REQUEST_REGISTRATION`). The checkbox is only shown when this option is enabled. |
| Show Result in ePR — default checked state | Controlled by the `REG_SHOW_RESULT_IN_EPR_CHECKBOX_CHECKED` lab option (option group: `REQUEST_REGISTRATION`). When visible, the checkbox is pre-checked if this option is enabled. |

All other fields follow the rules in [[Send Out Information Dialogue (CRST-41)]].

---

## Visual Layout

A modal dialogue containing a form layout with a row of action buttons at the bottom. Fields are arranged vertically with two parallel columns for specimen-specific fields (Specimen 1 and Specimen 2). The **Destination** combo receives keyboard focus when the dialogue first opens.

---

## Fields

### Core Fields

| Field | Description |
|---|---|
| Request No | Read-only display. Shows the request number already assigned to this registration. |
| Show Result in ePR | Checkbox. Controls whether the result will be shown in the electronic patient record. Visibility and default state are configuration-driven (see [[#Configuration]]). |
| Destination | Combo box. Selects the external laboratory to which the specimen is being sent. Required — validation error 714 is shown if not selected. Receives focus on open. |
| Report To (Requesting Unit) | Dropdown grid. Selects the requesting unit at the destination. Required if the destination is DH, GVU, or PHLC — validation error 3190 is shown if not selected for those destinations. |
| Fee | Numeric input. Optional fee amount. |
| Reference | Free-text area. Optional reference information. |
| Print Form | Checkbox. Indicates whether a send-out form should be printed. |
| Bypass Ward Print | Checkbox. Controls whether direct ward printing is bypassed. State is derived from configuration and the selected Requesting Unit (see [[#Bypass Ward Print Logic]]). |

### Referral Fields

| Field | Description |
|---|---|
| Referral By Lab | Checkbox + dropdown. When checked, enables selection of the referring lab. Validation error 497 is shown if the checkbox is checked, the destination is PHLC or CPLC, and no lab is selected. Visibility and default state are configuration-driven. |
| Referral Doctor | Checkbox + doctor input + name label. When checked, enables entry of the referring doctor. Validation error 497 is shown if the checkbox is checked, the destination is PHLC or CPLC, and no doctor is entered. Visibility, default state, and editability are configuration-driven. |

### Specimen-Specific Fields (Specimen 1 and Specimen 2)

| Field | Description |
|---|---|
| Send Out Datetime | The date and time the specimen is sent out to the external lab. Default is derived from configuration (see [[#Default Values — New Send Out]]). |
| Destination Request No | The request number assigned at the external laboratory. |
| Specimen Receiving Datetime | The date and time the specimen is received at the external lab. Defaults to the arrival datetime. |
| Result Back Datetime | The date and time the result is returned from the external lab. |

---

## Buttons and Actions

### OK

Triggers the validation sequence. If all validations pass, the send-out data is saved and the dialogue closes, returning the completed `SendOut` record to the Registration screen's save sequence.

### Cancel

Closes the dialogue without saving. The save sequence is interrupted.

---

## Validation Sequence

Validations are evaluated in the following order. The first failure stops processing and highlights the relevant field.

| Step | Condition | Error | Field Highlighted |
|---|---|---|---|
| 1 | No destination selected | 714 | Destination |
| 2 | Destination is DH, GVU, or PHLC **and** no Report To selected | 3190 | Report To |
| 3 | Referral By Lab checked **and** destination is PHLC or CPLC **and** no referral lab selected | 497 ("Referral By Lab") | Referral By Lab dropdown |
| 4 | Referral Doctor checked **and** destination is PHLC or CPLC **and** no doctor entered | 497 ("Referral Doctor") | Referral Doctor input |

> **Note:** Destination-type checking distinguishes PHLC from CPLC. PHLC is identified by matching the destination against DH Form Title constants or DH Location Address constants (excluding CPLC). CPLC is identified when the destination description equals "CPLC".

---

## Default Values — New Send Out

When the dialogue opens for a send-out that has not yet been configured (new registration):

| Field | Default Source |
|---|---|
| Show Result in ePR | `REG_SHOW_RESULT_IN_EPR_CHECKBOX_CHECKED` lab option (option group: `REQUEST_REGISTRATION`) |
| Destination | Derived send-out location if already determined; otherwise the `DEFAULT_SEND_OUT_DESTINATION` lab option (see [[#Configuration]]) |
| Send Out Datetime (both specimens) | Controlled by `DEFAULT_SENDOUT_DATE` option (see [[#Send Out Datetime Default Modes]]) |
| Specimen Receiving Datetime (both specimens) | Arrival datetime of the request |
| Report To | `DEFAULT_SENDOUT_REQUESTING_UNIT` lab option (option group: `SEND_OUT`) |
| Bypass Ward Print | Derived from `BY_PASS_WARD_PRINTING` option and selected Requesting Unit (see [[#Bypass Ward Print Logic]]) |
| Referral By Lab checkbox | Pre-checked if `REFERRAL_BY_LAB` option value is 1 |
| Referral By Lab selection | Default value from `REFERRAL_BY_LAB` option text |
| Referral Doctor checkbox | Pre-checked if `REFERRAL_DOCTOR` option value is 1 or 2 |
| Referral Doctor input | Default hospital and doctor code from `REFERRAL_DOCTOR` option text; editability from option value |
| Fee | Empty |

### Send Out Datetime Default Modes

The `DEFAULT_SENDOUT_DATE` option (option group: `SEND_OUT`) controls which timestamp is pre-filled:

| Option Value | Pre-filled Datetime |
|---|---|
| `R` | Request datetime |
| `C` | Collection datetime |
| `A` | Arrival datetime |
| `NA` | Empty (no default) |
| *(not configured)* | Arrival datetime |

---

## Default Values — Existing Send Out

When the dialogue opens for a send-out that was previously saved, all fields are loaded directly from the stored send-out record. The only exception is Report To: if not stored, it falls back to the `DEFAULT_SENDOUT_REQUESTING_UNIT` lab option.

---

## Bypass Ward Print Logic

The **Bypass Ward Print** checkbox state is determined when the dialogue opens and whenever the **Report To** selection changes:

1. If the `BY_PASS_WARD_PRINTING` option is disabled, the checkbox is unchecked.
2. If the option is enabled and no Requesting Unit restriction list is configured, the checkbox is checked.
3. If the option is enabled and a Requesting Unit restriction list is configured, the checkbox is checked **only if** the currently selected Requesting Unit appears in that list.

---

## Referral By Lab — Visibility and Interaction

- The **Referral By Lab** section (checkbox + dropdown) is only shown when the `REFERRAL_BY_LAB` option value is 0 or 1.
- When the checkbox is unchecked, the dropdown is disabled.
- When the checkbox is checked, the dropdown is enabled.
- The section is validated only when the destination is PHLC or CPLC.

## Referral Doctor — Visibility and Interaction

- The **Referral Doctor** section (checkbox + doctor input + name label) is only shown when the `REFERRAL_DOCTOR` option value is 0, 1, or 2.
- When the checkbox is unchecked, the doctor input is disabled.
- When the checkbox is checked, the doctor input is enabled; its editability depends on the option value.
- The doctor name label updates automatically as the doctor field changes.
- The section is validated only when the destination is PHLC or CPLC.

| REFERRAL_DOCTOR Option Value | Section Visible | Checkbox Pre-checked | Input Editable |
|---|---|---|---|
| 0 | Yes | No | Yes |
| 1 | Yes | Yes | Yes |
| 2 | Yes | Yes | No |
| *(not configured)* | No | N/A | N/A |

---

## Data Saved

When the user confirms the dialogue, the following data is written to the send-out record:

| Field | Saved |
|---|---|
| Show Result in ePR | ✅ |
| Reference | ✅ |
| Request No | ✅ |
| Fee | ✅ |
| Send Out Datetime (Specimen 1 and 2) | ✅ |
| Destination Request No (Specimen 1 and 2) | ✅ |
| Specimen Receiving Datetime (Specimen 1 and 2) | ✅ |
| Result Back Datetime (Specimen 1 and 2) | ✅ |
| Destination | ✅ |
| Report To (Requesting Unit) | ✅ |
| Bypass Ward Print | ✅ |
| Referral By Lab | ✅ Only if Referral By Lab is checked **and** destination is PHLC or CPLC |
| Referral Doctor | ✅ Only if Referral Doctor is checked **and** destination is PHLC or CPLC |

---

## Configuration

| Setting | Option Code | Option Group | Purpose | Effect when enabled | Effect when disabled |
|---|---|---|---|---|---|
| Show Result in ePR — visibility | `REG_SHOW_RESULT_IN_EPR_CHECKBOX_VISIBLE` | `REQUEST_REGISTRATION` | Controls whether the Show Result in ePR checkbox is displayed | Checkbox is visible | Checkbox is hidden |
| Show Result in ePR — default checked | `REG_SHOW_RESULT_IN_EPR_CHECKBOX_CHECKED` | `REQUEST_REGISTRATION` | Controls the default checked state of the Show Result in ePR checkbox when visible | Checkbox is pre-checked | Checkbox is unchecked by default |
| Default Send Out Destination | `DEFAULT_SEND_OUT_DESTINATION` | *(source: special parsed constant — maps to a keyword ID for the Destination combo)* | Sets the default Destination selection for new send-outs | Pre-selects the configured destination | Destination left empty |
| Default Send Out Date | `DEFAULT_SENDOUT_DATE` | `SEND_OUT` | Controls which datetime is pre-filled in the Send Out Datetime fields | See Send Out Datetime Default Modes table | Defaults to arrival datetime |
| Default Requesting Unit | `DEFAULT_SENDOUT_REQUESTING_UNIT` | `SEND_OUT` | Sets the default Report To selection for new send-outs | Pre-selects the configured requesting unit | Report To left empty |
| Bypass Ward Print | `BY_PASS_WARD_PRINTING` | `SEND_OUT` | Controls whether the Bypass Ward Print checkbox is enabled by default | Checkbox may be checked, subject to requesting unit restriction | Checkbox is always unchecked |
| Bypass Ward Print — Requesting Unit restriction | `BY_PASS_WARD_PRINTING` (text value) | `SEND_OUT` | Limits Bypass Ward Print to specific requesting units | Only enabled for listed units | No restriction — checkbox follows the boolean option |
| Referral By Lab | `REFERRAL_BY_LAB` (option value) | `SEND_OUT` | Controls visibility and default checked state of the Referral By Lab section | Section shown; value 1 pre-checks it | Section hidden |
| Referral Doctor | `REFERRAL_DOCTOR` (option value) | `SEND_OUT` | Controls visibility, default state, and editability of the Referral Doctor section | Section shown; see Referral Doctor table for value meanings | Section hidden |
| Send Out Function Enabled | `SENDOUT_FUNCTION_ENABLED` | `SEND_OUT` | Controls whether the Send Out step is available at all for the lab | Send Out checkbox and step are available | Send Out functionality is disabled |
| DH Send Out Location Enabled | `DH_SENDOUT_LOCATION_ENABLED` | `SEND_OUT` | Controls whether DH destinations appear in the Destination list | DH destinations are available | DH destinations are not listed |
| Create PHLC Lab Order | `CREATE_PHLC_LAB_ORDER_REG` | `SEND_OUT` | Controls whether a PHLC lab order is created automatically on save | Lab order is created | No lab order is created |

---

## Business Rules

1. The Send Out Information Dialogue only appears in the save sequence when the **Send Out** checkbox is checked on the Registration screen.
2. The **Request No** field is always read-only in this dialogue — the number has already been assigned before the send-out step is reached.
3. The Show Result in ePR checkbox visibility and default state are controlled by separate `REQUEST_REGISTRATION` group options — they are independent settings.
4. Referral By Lab and Referral Doctor information is only persisted when the checkbox is checked **and** the destination is PHLC or CPLC; for all other destinations these fields are ignored even if filled in.
5. The Bypass Ward Print checkbox state is re-evaluated each time the Report To selection changes, not only on initial load.
6. When a `REFERRAL_DOCTOR` option value of 2 is configured, the doctor is pre-filled from the option but is not editable — this supports scenarios where a fixed referral doctor is mandated by configuration.
7. The Send Out Datetime for both specimens uses the same default mode; there is no per-specimen default configuration.

---

## Related Workflows

- [[Send Out Information Dialogue (CRST-41)]] — Governs most field rules for the Send Out dialogue; the Registration version differs only in the Request No display and ePR checkbox configuration source.
- [[Pre-Register Save Sequence]] — The Send Out Information Dialogue is one step within this sequence; it runs when the Send Out checkbox is checked.
- [[Private Change Reason Dialogue]] — Another save-sequence step that runs in the same save operation, positioned before Result Entry.
- [[Amend Request - Send Out Dialogue (CRST-886)]] — The Amend Request version of this dialogue; shares the same underlying PM.
