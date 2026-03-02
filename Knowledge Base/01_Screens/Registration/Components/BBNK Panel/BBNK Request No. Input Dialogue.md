# BBNK Request No. Input Dialogue

## Overview

The BBNK Request No. Input Dialogue is a modal dialogue that collects the blood bank request number and any additional request-level information required to complete a blood bank registration. It opens after the user has selected the tests and specimen for a blood bank request. The dialogue brings together the BBNK Panel — showing patient blood history, mother results, blood category, and other blood bank fields — alongside an input area for the lab number, confidentiality flag, and request comment. When the user confirms, the system validates and registers the blood bank request.

---

## Related User Stories

- **[[CRST-122]]** — Registration - BBNK Request No. Input Dialogue
- **[[CRST-121]]** — Registration - BBNK Panel

**Epic:** LISP-31 [CRST][DEV] Registration - Special Lab Workflow (BBNK)

---

## Component Modes

| Mode | When It Applies | Distinguishing Feature |
|------|-----------------|------------------------|
| Specimen Number mode | A specimen number has been scanned or entered before the dialogue opens | "Specimen No:" label and value are shown in the key identifier row |
| Order Number mode | The request is being registered against a GCRS order number without a specimen | "Order No:" label and value are shown in the key identifier row |
| Auto-generate Request No. mode | The lab is configured to auto-generate request numbers | The Lab No. field is pre-filled with a placeholder mask and the field becomes read-only immediately |
| Cross-check Specimen mode | Cross-checking is required by configuration, a specimen exists, auto-generate is off, and the request no. is not a USID format | A specimen number cross-check panel is shown above the Lab No. field; OK requires cross-check to pass |

---

## Visual Layout

The dialogue is titled **"Blood Bank Specific Information"** and is approximately 800 pixels wide. It is laid out in two columns above a row of action buttons.

**Left column (top area):**
- Key identifier row (Specimen No. or Order No. label + value)
- Lab No. input field
- Confidential dropdown
- Test Type (read-only label showing test description)
- Pregnancy label (shown only when present)
- LMP field (shown only when present; double-click to view detail)

**Right column (top area):**
- Claimed HKID Copy button (shown only when a claimed HKID is linked)
- Cross-check specimen panel (shown only in Cross-check Specimen mode)
- Patient Results panel (displaying the patient's blood bank history)

**Left column (lower area):**
- Blood Category bordered box (read-only text area showing the patient's blood category summary)
- Request Comment text area

**Right column (lower area):**
- Mother Results panel (inline display of mother's blood bank results)
- Operation Code field
- Indication Code field
- Inventory Reserve Product panel

**Bottom button row:**
- **Ok** button
- **Cancel** button
- **Haem Result** button

---

## Buttons and Actions

### Lab No. Field

| Property | Detail |
|----------|--------|
| Label | Lab No. |
| Keyboard shortcut | **L** (tilde shortcut on label) |
| State | Editable in Initial state; becomes read-only after a valid request number is confirmed or in auto-generate mode |
| What it does | Accepts a blood bank request number. On modification, the system validates and formats the request number via a server check. If valid and not yet used, the dialogue transitions to the Ready state. If invalid or already in use, an error message is shown and the field is cleared. |

### Confidential Dropdown

| Property | Detail |
|----------|--------|
| Label | Confidential |
| Keyboard shortcut | **C** |
| State | Disabled in Initial state; enabled once a valid request number is entered |
| What it does | Allows staff to set the confidentiality level for the request. Defaults to the system-configured default confidentiality value. |

### Request Comment

| Property | Detail |
|----------|--------|
| Label | Request Comment |
| State | Disabled in Initial state; enabled once a valid request number is entered |
| What it does | Allows staff to enter a free-text comment for the request. Maximum 255 characters. The default labs for the comment are derived from the request laboratories. |

### Ok Button

| Property | Detail |
|----------|--------|
| Label | Ok |
| Keyboard shortcut | **O** |
| When enabled | Only in Ready state (after a valid request number has been confirmed) |
| When disabled | In Initial state and during the save process |
| What it does | Initiates the save sequence: data conversion, validation, blood bank rule group check, age check, duplicate Type & Screen check, pre-registration server processing, and (if cross-check specimen mode is active) specimen form validation. On success, the dialogue closes and the request is registered. If any validation fails, an error message is shown and the dialogue returns to Ready state. |

> When cross-check specimen mode is active, the specimen number cross-check must pass before the save sequence begins.

### Cancel Button

| Property | Detail |
|----------|--------|
| Label | Cancel |
| Keyboard shortcut | **A** |
| When visible | Always visible while the dialogue is open |
| What it does | Closes the dialogue without saving. No data is persisted. |

### Haem Result Button

| Property | Detail |
|----------|--------|
| Label | Haem Result |
| State | Controlled by the BBNK Panel — visible only when the Haematology Results feature is enabled in configuration |
| What it does | Opens the cross-lab haematology result lookup for the current patient. |

---

## Selection and Interaction Behaviours

#### Dialogue opens

On opening, the dialogue clears all fields, sets the Lab No. field to editable, disables all other fields (Confidential, Comment, Ok), and calls the BBNK Panel to load and display the patient's blood history. The Pregnancy and LMP fields are shown only when those values are present for the current test.

If a request number was pre-assigned (e.g., from a GCRS order), the Lab No. field is pre-filled and the system immediately transitions to Ready state, enabling all fields.

If auto-generate mode is active, the Lab No. field shows a placeholder and transitions to Ready state automatically.

After initial rendering, any patient tag warnings are shown before focus is set.

#### User enters a lab number

After the user modifies the Lab No. field, the system validates the format and checks whether the number already exists or has been used. Possible outcomes:

| Outcome | System Response |
|---------|----------------|
| Valid, not existed, not used, no audit conflict | Transitions to Ready state; all fields enabled |
| Already registered in the system | Error shown; Lab No. cleared; remains in Initial state |
| Already used (in use by another request) | Error shown; Lab No. cleared; remains in Initial state |
| Found in audit log (duplicate) | Error shown; Lab No. cleared; remains in Initial state |
| Invalid format | Error shown; Lab No. cleared; remains in Initial state |

#### User clicks Ok

The system runs the following sequence before closing:
1. Data conversion (request number read from field, unless auto-generate mode is active)
2. Validation (request number must not be empty)
3. Blood bank rule group check
4. Age check
5. Duplicate Type & Screen request check (warns if a T&S was recently performed within the configured checking period)
6. Pre-registration server call (obtains autologous blood unit count info; generates request number if auto-generate mode)
7. Specimen form / request number label validation (if cross-check is enabled)

On success, the dialogue closes and returns the registered request number and associated data to the calling screen.

#### User clicks Cancel

The dialogue closes immediately. No data is saved.

#### Specimen Number mode

When a specimen number is present, "Specimen No:" and the formatted specimen number are displayed in the key identifier row at the top of the dialogue. When cross-check is also required, a cross-check panel is shown to prompt the user to confirm the specimen number before saving.

#### Order Number mode

When no specimen number is present, "Order No:" and the formatted GCRS order number are shown instead. This triggers audit logging noting that the request was registered via order number.

---

## Configuration

| Setting | Option Code | Purpose | Effect when enabled | Effect when disabled |
|---------|------------|---------|--------------------|--------------------|
| Auto-generate Request No. | `isManualRegAutoGenReqNoEnabled` *(source: BBS dictionary parameter)* | Controls whether the system generates the lab number automatically | Lab No. field pre-filled with placeholder; request number generated by server during save | Staff must manually enter the lab number |
| Type & Screen Remark Report | `isTypeAndScreenRemarkReportEnabled` *(source: BBS dictionary parameter)* | Controls whether a T&S remark report is generated on registration | Report generation is initiated during the save process | No remark report generated |
| Cross-check Lab No. | `isEnableCrossCheckLabNo` *(source: BBS dictionary parameter)* | Controls whether specimen form / request number label validation occurs during save | Validation step is executed in the save sequence | Validation step is skipped |
| Specimen Form Prompt Type | `bbsPromptValidateSpecFormType` *(source: BBS dictionary parameter)* | Controls whether and how the specimen form check is triggered | Varies by value: "Y" = always for target tests; "E" = eWorklist mode; absent/null = treat as "Y" | If not set for target test type, specimen form check is skipped |
| Default Confidentiality | *(source: BBS dictionary parameter)* | Sets the pre-selected value in the Confidential dropdown | Confidential dropdown defaults to configured value | Confidential dropdown defaults to system default |
| Haem Results Enabled | `isHaemResultsEnabled` *(source: BBS dictionary parameter)* | Controls visibility of the Haem Result button | Button shown | Button hidden |

---

## Error Messages and System Prompts

| Message Code | Description | Trigger | User Options |
|--------------|-------------|---------|-------------|
| 0000888 | Request number already exists | Entered lab number already registered | OK (dismiss, field cleared) |
| 0000891 | Request number already in use | Entered lab number already used by another request | OK (dismiss, field cleared) |
| 0000887 | Request number found in audit log | Lab number already present in GCRS audit records | OK (dismiss, field cleared) |
| 0000522 | Invalid request number format | Entered value does not match the expected lab number format | OK (dismiss, field cleared) |
| 0001038 | Request number is empty | User clicks Ok without a valid request number | OK (dismiss, dialogue returns to Initial state) |
| Duplicate T&S warning | A Type & Screen request was recently performed within the configured checking period | Duplicate T&S detected during save | Confirm / Cancel |
| Patient tag warning | One or more patient tags require a warning | Shown on dialogue open before focus is set | As per patient tag configuration |
| Under 18 T&S remark | Patient is under 18 years old and the request includes a T&S | Age check during save | Informational prompt |
| Autologous blood unit count | Autologous blood units are on file for this patient | Returned by pre-registration server call | Informational display |

---

## Related Workflows

- [[BBNK Panel]] — The full BBNK Panel (patient results, blood category, mother results, etc.) is embedded within this dialogue.
- [[BBNK Panel - Patient Results]] — Patient blood history is displayed in the right column.
- [[BBNK Panel - Mother Results]] — Mother's blood bank results are displayed inline in the lower right of the dialogue.
- [[BBNK Panel - Blood Category]] — The patient's blood category summary is shown in the lower left.
