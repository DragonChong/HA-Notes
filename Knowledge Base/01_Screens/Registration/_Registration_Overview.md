# Registration Screen Overview

## Purpose
The Manual Registration screen allows Registration Staff to manually register specimens and orders into the LIS system.

## Screen Layout

The Manual Registration screen consists of **four main sections**:

### 1. Patient Panel (Top Left)
The Patient Panel is divided into two columns for patient demographic information:

#### First Column
| Field | Type | Description |
|-------|------|-------------|
| **Name** | Text field | Patient English Name |
| **Chinese Name** | Text field | Patient Chinese Name |
| **Loc** | 3 dropdown selectors | Patient Location (Hospital, Specialty, Sub Specialty) |
| **Ward** | Dropdown | Ward selection |
| **Bed** | Text field | Patient bed number |
| **Admitted** | DateTime field | Patient admission date and time |

#### Second Column
| Field | Type | Description |
|-------|------|-------------|
| **Sex** | Dropdown | Patient sex/gender |
| **DOB** | Date field + checkbox | Date of Birth with "Exact DOB Date" checkbox |
| **Age** | Text field + dropdown | Patient age with age unit selector |
| **Race** | Dropdown | Patient race |

**Related User Stories:** [[CRST-86]] Registration - Patient Panel

---

### 2. Request Information Panel (Top Right)
The Request Information Panel is divided into two columns for request details:

#### First Column
| Field | Type | Description |
|-------|------|-------------|
| **Clin Dtl** | Text field | Clinical Details |
| **Req Dr** | 2 dropdown selectors | Request Doctor (Hospital, Doctor code and name) |
| **Req Loc** | 3 dropdown selectors | Request Location (Hospital, Specialty, Ward/Sub Specialty) |
| **Rpt Loc** | 3 dropdown selectors | Report Location (Hospital, Specialty, Ward/Sub Specialty) |
| **Copy** | 3 dropdown selectors | Report Copy Location (Hospital, Specialty, Ward/Sub Specialty) |
| **Reference** | Text field | Reference information |
| **Comment** | Text field | Additional comments |

#### Second Column
| Field | Type | Description |
|-------|------|-------------|
| **Patient Category** | Dropdown | Patient category classification |
| **Confidential** | Dropdown | Confidentiality level |
| **Private** | Dropdown | Privacy settings |
| **Bill** | Dropdown | Billing information |
| **Urgency** | Dropdown | Request urgency level |
| **Collect** | DateTime field + checkbox | Collection date/time with "Exact time" checkbox |
| **Arrived** | DateTime field + checkbox | Arrival date/time with "Exact time" checkbox |
| **Request** | DateTime field + checkbox | Request date/time with "Exact time" checkbox |

**Related User Stories:** [[CRST-87]] Registration - Request Info Panel

---

### 3. Test Panel (Bottom)
Located at the bottom of the screen, the Test Panel contains:

| Field | Type | Description |
|-------|------|-------------|
| **Add Test** | Dropdown | Selection dropdown for adding tests to the request |

**Related User Stories:** [[CRST-88]] Registration - Test Panel

---

### 4. Action Buttons & Retain Options (Bottom Right)

#### Retain Checkboxes
Dynamically generated checkboxes based on `RETAIN_MASTER` configuration:
- **Request** - Retain request information
- **DT** - Retain date/time values
- **Test** - Retain test selections
- **Urgency** - Retain urgency setting

The retain checkboxes allow users to preserve field values when registering multiple consecutive specimens with similar attributes.

**Related User Stories:** [[CRST-433]] Registration - Retain Checkbox

#### Action Buttons
Located at the bottom right corner:

| Button | Function |
|--------|----------|
| **Save** | Saves the registration worksheet |
| **Clear** | Clears all data fields |

**Related User Stories:** [[CRST-89]] Registration - Buttons

---

## Technical Implementation

### Main Files
- **MXML Component:** `lisWeb/flex_src/hk/org/ha/lis/request/presentation/Registration.mxml`
- **UI Components:** `lisWeb/flex_src/hk/org/ha/lis/request/presentation/RegistrationUIComponents.as`
- **Panel Component:** `RegistrationPanel` (submodule)

### Architecture
- Built using Adobe Flex (ActionScript/MXML)
- Uses Parsley framework for dependency injection
- Follows MVVM pattern with Presentation Models (PM)
- Context: `RegistrationContext`
- Presentation Model: `RegistrationPm`

### Key Component Classes
- `LisTextInputPm` - Text input fields
- `LisDateTimeTextInputPm` - Date/time fields
- `LisKeywordComboBoxPm` - Dropdown selections
- `LisLocationTextInputPm` - Location selectors
- `LisDoctorTextInputPm` - Doctor selection
- `TestPanelPm` - Test panel management
- `RetainObjectRadioButtonGroupPm` - Retain checkbox group

---

## User Access Requirements
- User must have access rights to open Manual Registration screen
- Access is validated before screen display

---

## Related Epic
**LISP-21:** [CRST][DEV] Registration - Layout

---

## Notes
- All dropdown selections are populated from system configuration tables
- Retain functionality is configurable via `RETAIN_MASTER` database table
- Screen dimensions: 1280x800 pixels
- Screen uses custom stylesheet: `assets/css/requestnormal.swf`
