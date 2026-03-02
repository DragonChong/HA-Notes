# BBNK Panel

## Overview

The BBNK Panel is the lab-specific input area displayed on the Blood Bank (BBNK) Manual Registration screen. It collects blood bank–specific information required for a blood bank request, including the patient's blood history and special blood requirements, the type of test being requested, operation and indication codes, inventory reservation details, and access to haematology cross-lab results. The panel sits below the common registration fields and is always visible when the BBNK lab is selected. Its components are progressively enabled as the registration workflow advances from initial load through patient identification to request number assignment.

---

## Related User Stories

- **[[CRST-121]]** — Registration - BBNK Panel

**Epic:** LISP-31 [CRST][DEV] Registration - Special Lab Workflow (BBNK)

---

## Visual Layout

The BBNK Panel is approximately 430 × 600 pixels. From top to bottom it contains:

1. A **Claimed HKID Copy** button (conditionally visible, right-aligned, at the very top)
2. The **Patient Results** display area
3. A row with two buttons: **Blood Category** and **Mother Results**
4. An **Operation Code** label and text input row
5. An **Indication Code** label and text input row
6. The **Inventory Reserve Product Input** sub-panel (Date Required, Type, Unit)
7. A **Test Type** radio button group (four options)
8. The **Haem Result** button (right-aligned, conditionally visible)

---

## Component Descriptions

### Patient Results Display

Displays the patient's blood bank history retrieved when the patient is identified. All fields are read-only. The display is empty and visible on initial load; populated once a patient is ready.

**ABO Result:**
- Negative blood groups (O Neg, A Neg, B Neg, AB Neg, O para-Bombay Neg, A para-Bombay Neg, B para-Bombay Neg, AB para-Bombay Neg, Bombay Neg, Unknown) are shown in red.
- All other ABO results are shown in blue.
- Deactivated results display the text "Deactivated" in pink.
- If the ABO result has a remark, the border is shown with a shadow style.
- The result label displays the keyword description for the ABO value.

**Antibody Result:**
- Positive: displayed in red and bold.
- Negative: displayed in black.
- Pending: displayed in blue.
- The result label displays the keyword alpha code for the antibody value.

**Transfusion Reaction (TxRx) Data:**
- Displays the keyword description if transfusion reaction information exists.

**DAT Data:**
- Value > 0: displays "Positive" in red and bold.
- Value ≤ 0: displays "Negative" in blue and normal weight.

**Last Transfusion (Last Tx) Data:**
- Displays the keyword description if last transfusion data exists.

| State | Behaviour |
|-------|-----------|
| Initial | Visible, empty |
| Patient Ready | Populated with patient blood history; read-only |
| Registration Input Ready | Read-only |

---

### Blood Category Button

Opens the **Special Blood Selection Dialogue** for selecting or reviewing the patient's blood category requirements.

| State | Behaviour |
|-------|-----------|
| Initial | Disabled |
| Immunohaematology Test Type selected | Disabled |
| Registration Input Ready | Enabled (unless Immunohaematology is selected) |

**Keyboard shortcut:** **B**

**Font style indicator:**
- After the Special Blood Selection Dialogue is closed, the button's font style is updated to reflect whether the selected blood categories match the patient's default blood categories (from the "BLOODCAT" keyword group).
- If the selection matches the defaults: button text is displayed in normal style.
- If the selection differs from the defaults: button text is displayed in italic style.

#### Special Blood Selection Dialogue

A modal dialogue for selecting the patient's special blood requirements.

**Checkbox construction rules:**
- One checkbox is generated per entry in the "BLOODCAT" keyword group.
- Display sequence follows `keygp_display_order`.
- Checkbox label uses the keyword description (`key_desc`).
- Display colour follows `keygp_display_color`.
- Checkboxes use a **Three-State** model (Not Selected / Unknown / Selected) when `key_alpha2 > 100`; otherwise **Two-State** (Not Selected / Selected).
- The default state is Middle (Unknown) if `key_alpha2 > 100`.

**State configuration (from `SPECIAL_BLOOD_CONFIG` LIS constant group):**
Each blood category can have its allowed states configured. If all states or no states are configured, the checkbox follows default three-state or two-state behaviour. Otherwise, only the configured states are reachable in the toggle cycle:
- **Y** — Selected state enabled
- **N** — Not Selected state enabled
- **U** — Unknown state enabled

**Corporate Blood Category:** Blood categories listed in the `CORP_CATEGORY` lab option (PATIENT_BLOOD_REQ group) are marked as corporate categories.

| Button | Behaviour |
|--------|-----------|
| OK | Saves the current checkbox states and closes the dialogue |
| Cancel | Discards all changes to checkbox states and closes the dialogue |

---

### Mother Results Button

Opens the **Mother Results Dialogue**, which shows the blood bank results of the patient's mother.

| State | Behaviour |
|-------|-----------|
| Initial | Disabled |
| Patient Ready | Dialogue data prepared from patient blood history (read-only) |
| Immunohaematology Test Type selected | Disabled |
| Registration Input Ready | Enabled (unless Immunohaematology is selected) |

**Keyboard shortcut:** **M**

**Mother Results Dialogue:**
- All fields are read-only.
- ABO result colour rules match the Patient Results display (negative groups in red; others in blue).
- Antibody result colour rules match the Patient Results display (Positive: red and bold; Negative: black; Pending: blue).
- If no Mother Result is found, all fields display empty.
- **OK** button closes the dialogue.

---

### Operation Code

A label and text input for entering or selecting the clinical operation code associated with the request.

| State | Behaviour |
|-------|-----------|
| Initial | Visible (subject to lab option); disabled; input uppercased; available operation codes loaded from cache or backend |
| Registration Input Ready | Enabled |

**Keyboard shortcut:** **O**

**Ctrl+L:** Opens the **Operation Codes Selection Dialogue**. If a valid operation code is already entered, the dialogue opens with that code pre-filled in the search box and the corresponding row highlighted. Selecting a code from the dialogue sets it in the text input.

**Visibility:** Hidden when the `OPERATION_AND_INDICATION_CODE_INVISIBLE` lab option is set to 1. Visible otherwise (including when the option does not exist).

**Required indicator:** Shown on the label when the `OPERATION_AND_INDICATION_CODE_MANDATORY` lab option is set to 1.

---

### Indication Code

A label and text input for entering or selecting the clinical indication code(s) associated with the request.

| State | Behaviour |
|-------|-----------|
| Initial | Visible (subject to lab option); disabled; input uppercased; available indication codes loaded from cache or backend |
| Registration Input Ready | Enabled |

**Ctrl+L:** Opens the **Indication Codes Selection Dialogue**. Selecting a code sets it in the text input. If a code is already present, the newly selected code is appended after a comma separator (no duplicate checking is performed).

**Visibility and Required indicator:** Controlled by the same lab options as Operation Code (above).

---

### Inventory Reserve Product Input

A sub-panel for specifying blood product reservation requirements: **Date Required**, **Type** (dropdown), and **Unit** (numeric).

| State | Behaviour |
|-------|-----------|
| Initial | Visible (subject to lab option); all three inputs disabled; Type initialised with first "PRODTYPE" keyword item; Unit shows 0; no default date |
| Patient Ready | Date Required defaulted to current date/time |
| Registration Input Ready | All three inputs enabled |

**Visibility:** Hidden when the `INVISIBLE` lab option (INV_RESERVE_PRODUCT group) is set to 1. Visible otherwise (including when the option does not exist).

---

### Test Type

A radio button group for selecting the type of blood bank test being requested.

| Option | Value |
|--------|-------|
| 1. T&S/XM | Type and Screen / Crossmatch |
| 2. Component | Component |
| 3. No sample (Tx) | No Sample (Transfusion) |
| 4. Immunohaematology | Immunohaematology |

| State | Behaviour |
|-------|-----------|
| Initial | Disabled |
| Registration Input Ready | Enabled |

**Selecting Immunohaematology:**
- The **Blood Category** button is disabled.
- The **Mother Results** button is disabled.
- The request urgency is automatically set to **Non-urgent**.

**Changing away from Immunohaematology:**
- The **Blood Category** button is re-enabled.
- The **Mother Results** button is re-enabled.
- Urgency is not automatically changed back.

---

### Haem Result Button

Opens the **Cross Lab Result Dialogue**, which shows haematology test results from other hospitals or labs for the identified patient.

| State | Behaviour |
|-------|-----------|
| Initial | Disabled |
| Registration Input Ready | Enabled (if visible) |

**Visibility:** The button is visible only when **all** of the following are true:
1. The `TEST_RESULT` lab option (CROSS_LAB_RESULT group) is set to 1, **and**
2. The logged-in user has access right `w_lis_bbnk_register_request.cb_cross_lab_result`.

If the lab option is absent, set to 0, or the user lacks the access right, the button is hidden.

**Button click behaviour:**
- The system retrieves cross-lab results for the patient's HKID. The hospitals, labs, and tests to query are defined in the `option_text` of the `TEST_RESULT` lab option (CROSS_LAB_RESULT group).
- Results within the last 7 days are shown in a data grid (Test Alpha Code, Result, Result Ready Date).
- If no results are found within 7 days, the dialogue displays "No test result found within 7 days".
- If the results retrieval fails, error message 2583 is displayed.
- The **OK** button closes the Cross Lab Result Dialogue.

---

### Claimed HKID Copy Button

A conditionally visible button that appears at the top of the panel when a claimed HKID is associated with the current patient. Clicking it copies the claimed HKID value.

| State | Behaviour |
|-------|-----------|
| No claimed HKID | Hidden |
| Claimed HKID linked | Visible, right-aligned above the Patient Results area |

---

## Configuration

| Setting | Option Code | Purpose | Effect when enabled | Effect when disabled |
|---------|-------------|---------|---------------------|----------------------|
| Hide Operation & Indication Code | `OPERATION_AND_INDICATION_CODE_INVISIBLE` *(group: REQUEST_REGISTRATION)* | Controls visibility of Operation Code and Indication Code fields | Fields and labels are hidden | Fields and labels are visible |
| Operation & Indication Code Mandatory | `OPERATION_AND_INDICATION_CODE_MANDATORY` *(group: REQUEST_REGISTRATION)* | Controls whether Operation Code and Indication Code are required fields | Required indicator shown on labels | No required indicator |
| Hide Inventory Reserve Product Input | `INVISIBLE` *(group: INV_RESERVE_PRODUCT)* | Controls visibility of the Inventory Reserve Product Input sub-panel | Sub-panel hidden | Sub-panel visible |
| Haem Result | `TEST_RESULT` *(group: CROSS_LAB_RESULT)* | Controls whether the Haem Result button is shown and defines the hospitals/labs/tests to query | Haem Result button visible (if user has access right); cross-lab result query performed on patient ready | Haem Result button hidden |
| Corporate Blood Category | `CORP_CATEGORY` *(group: PATIENT_BLOOD_REQ)* | Defines which blood categories are flagged as corporate categories in the Special Blood Selection Dialogue | Listed categories marked as corporate | No categories marked as corporate |

---

## Related Workflows

- [[BBNK Panel - Patient Results]] — Detailed behaviour of the Patient Results display area (CRST-583).
- [[BBNK Panel - Blood Category]] — Detailed behaviour of the Blood Category button and Special Blood Selection Dialogue (CRST-584).
- [[BBNK Panel - Mother Results]] — Detailed behaviour of the Mother Results button and dialogue (CRST-585).
- [[Register BBNK Request]] — The data entered via this panel is persisted when the BBNK request is saved (CRST-122).
