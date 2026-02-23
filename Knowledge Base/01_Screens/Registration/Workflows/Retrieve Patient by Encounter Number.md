# Retrieve Patient by Encounter Number

## Overview

This workflow describes how the LIS system retrieves patient information when a user enters an Encounter Number (Case No.) in the Registration screen. The system supports retrieving both local patients (stored in the PATIENT table) and PMI (Patient Master Index) patients.

**Related User Stories:**
- [[CRST-96]] - Retrieve Existing Local Patient by Case Number
- [[CRST-97]] - Retrieve Existing PMI Patient by Case Number

**Entry Point:** Registration screen - Encounter No. (Enc No) field

**Purpose:** Enable registration staff to retrieve existing patient demographics by entering their case number, supporting both local hospital records and PMI integration.

---

## Key Concepts

### Encounter Number (Case No.)
- Hospital-specific patient identification number
- Stored in `PATIENT.pat_encounter` for local patients
- Available from PMI for patients with hospital encounters across the HA system
- Format includes check digit validation

### Local vs PMI Patients
- **Local Patient:** Patient record exists in the current hospital's PATIENT table
- **PMI Patient:** Patient record exists in the Patient Master Index but may not exist locally
- **Current Hospital:** The hospital context where the registration is being performed

### Hospital Matching
- Encounter numbers are hospital-specific
- System validates if entered case number belongs to current hospital
- Hospital panel prompts when case number doesn't match current hospital

---

## Workflow Scenarios

### Scenario 1: Retrieve Local Patient by Current Hospital Case Number

**Prerequisites:**
- Patient record exists in current hospital's PATIENT table
- Case number is valid for current hospital

**Trigger:** User enters case number in Enc No field

**Step-by-Step:**
1. User enters case number in Enc No field on Registration screen
2. System validates check digit of case number
3. System checks if case number exists in PATIENT table for current hospital
4. System retrieves patient's HKID from PATIENT.pat_hkid
5. System populates HKID field in Patient Registration Key
6. System loads patient demographics from PATIENT table:
   - Patient Name (English/Chinese)
   - Date of Birth
   - Gender
   - Address
   - Phone numbers
   - Other demographic fields
7. System sets focus to Request No. field
8. User proceeds with test registration

**Result:** Patient demographics displayed, ready for test registration

---

### Scenario 2: Retrieve PMI Patient by Current Hospital Case Number

**Prerequisites:**
- Patient record does NOT exist in current hospital's PATIENT table
- Case number matches current hospital
- Patient exists in PMI List
- PMI service is available

**Trigger:** User enters PMI case number in Enc No field

**Step-by-Step:**
1. User enters case number in Enc No field
2. System validates check digit
3. System checks local PATIENT table - no record found
4. System extracts hospital code from case number
5. System verifies case number hospital matches current hospital
6. System queries PMI service with case number
7. PMI service returns patient record with HKID
8. System populates HKID field in Patient Registration Key
9. System retrieves patient demographics from PMI:
   - Patient Name (English/Chinese)
   - HKID
   - Date of Birth
   - Gender
   - Address
   - Contact information
10. System displays "Close Indicator" (🔒) next to HKID field
11. System sets focus to Request No. field
12. User proceeds with test registration

**Result:** PMI patient demographics displayed with close indicator, ready for test registration

---

### Scenario 3: Non-Current Hospital Case Number - PMI Available

**Prerequisites:**
- Case number does NOT match current hospital
- User enters valid case number from another hospital
- PMI service is available

**Trigger:** User enters non-current hospital case number

**Step-by-Step:**
1. User enters case number in Enc No field
2. System validates check digit fails for current hospital
3. System displays error message (3214): "Invalid check digit for HKID/Encounter No."
4. System displays Hospital Selection Panel
5. **User Action: Select Hospital from Panel**
   - **Option A: Selected Hospital Matches Case Number Hospital (PMI Available)**
     1. User selects hospital from panel that matches case number
     2. System queries PMI with case number for selected hospital
     3. PMI returns patient record
     4. System populates HKID field
     5. System loads demographics from PMI
     6. System displays close indicator
     7. Focus moves to Request No. field
     8. User proceeds with registration
   
   - **Option B: Selected Hospital Matches but NOT on PMI List**
     1. User selects hospital from panel
     2. System queries PMI but case number not found
     3. System displays message (687): "Create new Encounter case?"
     4. System displays message (3780): "Due to the unavailability of PMI service, the system cannot retrieve patient details for entered HKID at this moment."
     5. **User Sub-Action:**
        - **Yes:** System displays "Enter new episode" panel
          - User manually assigns HKID
          - Focus moves to Request No. field
          - Registration proceeds as new patient
        - **No:** Case number cleared from Enc No field
   
   - **Option C: Selected Hospital Does NOT Match Case Number Hospital**
     1. User selects hospital that doesn't match case number
     2. System displays error message (3214): "Invalid check digit for HKID/Encounter No."
     3. Case number cleared from Enc No field
   
   - **Option D: Cancel Hospital Selection**
     1. User clicks Cancel button
     2. Hospital panel closes
     3. Case number cleared from Enc No field

**Result:** Varies based on user selection - PMI patient retrieved, new patient created, or entry cancelled

---

### Scenario 4: PMI Service Unavailable

**Prerequisites:**
- Case number entered
- PMI service is down or unreachable
- Case number not found in local PATIENT table

**Trigger:** User enters case number when PMI unavailable

**Step-by-Step:**
1. User enters case number in Enc No field
2. System attempts to query PMI service
3. PMI service fails or times out
4. System displays message (3780): "Due to the unavailability of PMI service, the system cannot retrieve patient details for entered HKID at this moment."
5. System displays message (687): "Create new Encounter case?"
6. **User Action:**
   - **Yes:** 
     - System displays "Enter new episode" panel
     - User manually enters patient information including HKID
     - Registration proceeds as new patient
     - System logs PMI unavailability
   - **No:**
     - Case number cleared from Enc No field
     - User must retry later or use alternative identification

**Result:** User creates new patient record or cancels operation

---

## Technical Implementation

### Frontend Components

**File:** `RegistrationUIComponents.as`

**Key Components:**
- `encNoPm: LisEncounterNoTextInputPm` - Encounter number input field
- `hkidTextInputPm: LisHkidTextInputPm` - HKID input field with close indicator
- `patientNamePm: LisTextInputPm` - Patient name field
- `patientLocationPm: LisLocationTextInputPm` - Patient location

**Key Methods:**

1. **`validateEncounterNoHandler(event:Event):void`**
   - Triggered when user enters case number
   - Validates check digit
   - Initiates patient retrieval

2. **`popUpHospitalDialogueForHospitalSelection():void`**
   - Displays Hospital Selection Panel
   - Called when case number doesn't match current hospital
   - Handles user hospital selection

3. **`processEncounterNoSelection(hospital:HospitalVo):void`**
   - Processes hospital selection from panel
   - Validates case number against selected hospital
   - Calls PMI or displays error messages

4. **`createNewEncounterEpisode():void`**
   - Handles creation of new patient episode
   - Called when user confirms creating new encounter (message 687)
   - Displays "Enter new episode" panel

5. **`popUpCreateNewEpisodeDialogue():void`**
   - Displays dialogue for entering new episode information
   - Allows manual HKID entry
   - Modified in: CEO69621

6. **`loadPatientReadyDataToComponents():void`**
   - Loads retrieved patient data into UI components
   - Sets close indicator for PMI patients
   - Sets focus to Request No. field

7. **`setCloseIndicatorForPmiPatient():void`**
   - Displays 🔒 indicator for PMI patients
   - Indicates patient data comes from PMI

### Backend Services

**File:** `PatientUIAppServiceBean.java` / `PatientUIAppServiceImpl.java`

**Key Methods:**

1. **`retrieveRegistrationPatientList(String encNo, String hospital)`**
   - Searches local PATIENT table by encounter number
   - Returns patient list if found locally

2. **`gatherPMIPatientInformationByEncounterNo(String encNo, String hospital)`**
   - Queries PMI service with encounter number
   - Returns PMI patient demographics
   - Handles PMI service failures

3. **`validateEncounterNo(String encNo, String hospital)`**
   - Validates encounter number check digit
   - Verifies hospital matching

4. **`checkPMIAvailability()`**
   - Checks if PMI service is operational
   - Returns service status

### Presentation Model

**File:** `RegistrationPm.as`

**Key Methods:**

1. **`retrieveRegistrationPatientList(String hkid, Function successCallback, Function errorCallback)`**
   - Orchestrates patient retrieval workflow
   - Handles both local and PMI lookups
   - Modified in: LIS-9975

2. **`gatherPMIPatientInformationByEncounterNo(String encNo, Function callback)`**
   - Initiates PMI query by encounter number
   - Processes PMI response
   - Modified in: PMH-BBS-B-000068

3. **`retrieveRegistrationPatientListHandler(event:ResponseObject):void`**
   - Handles patient retrieval response
   - Determines if local or PMI patient
   - Loads data to UI components
   - Modified in: LIS-9975

4. **`serverCallErrorHandlerForPMI(event:FaultEvent):void`**
   - Handles PMI service errors
   - Displays appropriate error messages
   - Modified in: PMH-BBS-B-000068

### Events Managed

**Events Dispatched:**
- `RegistrationEvent.RETRIEVE_REGISTRATION_PATIENT_LIST` - Trigger patient retrieval
- `RegistrationEvent.GATHER_PMI_PATIENT_INFORMATION_BY_ECOUNTER_NO` - Query PMI by case number
- `EncounterNoTextInputEvent.VALIDATE_ENCOUNTER_NO` - Validate encounter number

**Events Handled:**
- `EncounterNoTextInputEvent.ENCOUNTER_NO_VALIDATED` - Check digit validated
- `RegistrationEvent.PATIENT_LIST_RETRIEVED` - Patient data received

---

## Configuration Requirements

### System Parameters

**LAB_OPTION Table:**
- `PMI_ENABLED` - Controls PMI integration (Y/N)
- `PMI_SERVICE_URL` - PMI service endpoint
- `PMI_TIMEOUT` - Service timeout in seconds

**Hospital Configuration:**
- Each hospital has unique code prefix for case numbers
- Case number format defined per hospital
- Check digit algorithm configured per hospital

---

## Error Handling

### Error Code 3214: Invalid Check Digit

**Message:** "Invalid check digit for HKID/Encounter No."

**Scenarios:**
1. User enters case number with invalid check digit
2. User enters case number from non-current hospital
3. Selected hospital doesn't match case number hospital

**System Response:**
- Display error message
- Open Hospital Selection Panel (scenarios 2-3)
- Clear case number from field (after invalid hospital selection)

### Error Code 687: Create New Encounter Case

**Message:** "Create new Encounter case?"

**Scenarios:**
1. Case number not found in PMI
2. Selected hospital matches case number but no PMI record
3. PMI service unavailable

**System Response:**
- Prompt user for confirmation
- Yes: Display "Enter new episode" panel
- No: Clear case number field

### Error Code 3780: PMI Service Unavailable

**Message:** "Due to the unavailability of PMI service, the system cannot retrieve patient details for entered HKID at this moment."

**Scenarios:**
1. PMI service is down
2. PMI service timeout
3. Network connectivity issues

**System Response:**
- Display error message
- Prompt message 687 for new encounter
- Log PMI service failure

### Error Code 1411: Invalid Encounter Number Length

**Message:** Custom message for encounter number length validation

**Scenario:** User enters case number exceeding maximum length

**System Response:**
- Display error message
- Prevent further input

---

## Database Schema Reference

### PATIENT Table

**Key Columns:**
- `pat_encounter` - Encounter number (case no.)
- `pat_hkid` - Patient HKID
- `pat_hospital` - Hospital code
- `pat_eng_name` - Patient English name
- `pat_chi_name` - Patient Chinese name
- `pat_dob` - Date of birth
- `pat_sex` - Gender
- `pat_address` - Address
- `pat_phone` - Phone number

**Query Pattern:**
```sql
SELECT * FROM PATIENT 
WHERE pat_encounter = ? 
AND pat_hospital = ?
```

### LAB_OPTION Table

**Key Columns:**
- `option_name` - Configuration parameter name
- `option_value` - Configuration value
- `hospital_code` - Hospital-specific configuration

**PMI Configuration:**
```sql
SELECT option_value FROM LAB_OPTION 
WHERE option_name = 'PMI_ENABLED' 
AND hospital_code = ?
```

---

## User Interface Elements

### Encounter No. Field
- **Location:** Patient Panel (top section)
- **Type:** Text input with check digit validation
- **Format:** Hospital-specific (e.g., 12345678-9)
- **Validation:** Real-time check digit validation
- **Tab Order:** After HKID field, before Request No. field

### Hospital Selection Panel
- **Type:** Modal dialogue
- **Content:** List of available hospitals
- **Actions:** Select hospital, Cancel
- **Appears When:** Case number doesn't match current hospital

### Enter New Episode Panel
- **Type:** Modal dialogue
- **Fields:** 
  - HKID (manual entry)
  - Episode date
  - Additional demographics
- **Actions:** Confirm, Cancel
- **Appears When:** User confirms creating new encounter

### Close Indicator (🔒)
- **Location:** Next to HKID field
- **Meaning:** Patient data retrieved from PMI
- **Behavior:** Read-only indicator, no user interaction

---

## Test Scenarios

### Test 1: Valid Local Patient Retrieval
**Given:** Patient exists in current hospital PATIENT table
**When:** User enters valid case number
**Expected:** 
- Patient demographics populate
- Focus moves to Request No. field
- No error messages

### Test 2: Valid PMI Patient Retrieval (Current Hospital)
**Given:** 
- Patient NOT in local PATIENT table
- Patient exists in PMI for current hospital
- PMI service available
**When:** User enters valid PMI case number
**Expected:**
- Patient demographics populate from PMI
- Close indicator (🔒) displays
- Focus moves to Request No. field

### Test 3: Non-Current Hospital Case Number (PMI Available)
**Given:**
- Case number from different hospital
- Patient exists in PMI
**When:** 
- User enters case number
- Selects matching hospital from panel
**Expected:**
- Error 3214 displays initially
- Hospital panel opens
- After hospital selection: PMI patient retrieved
- Close indicator displays

### Test 4: Non-Current Hospital Case Number (NOT in PMI)
**Given:**
- Case number from different hospital
- Patient NOT in PMI
**When:**
- User enters case number
- Selects matching hospital
**Expected:**
- Error 3214 displays
- Hospital panel opens
- Error 687 displays
- Error 3780 displays
- Enter new episode panel available

### Test 5: Invalid Hospital Selection
**Given:**
- Case number entered
- Hospital panel displayed
**When:** User selects hospital that doesn't match case number
**Expected:**
- Error 3214 displays
- Case number cleared from field

### Test 6: Cancel Hospital Selection
**Given:** Hospital panel displayed
**When:** User clicks Cancel
**Expected:**
- Panel closes
- Case number cleared from field

### Test 7: PMI Service Unavailable
**Given:** PMI service is down
**When:** User enters PMI case number
**Expected:**
- Error 3780 displays
- Error 687 displays
- Option to create new encounter

### Test 8: Create New Encounter - Confirm
**Given:** Error 687 displayed
**When:** User clicks "Yes"
**Expected:**
- "Enter new episode" panel displays
- User can manually enter HKID
- Registration proceeds as new patient

### Test 9: Create New Encounter - Cancel
**Given:** Error 687 displayed
**When:** User clicks "No"
**Expected:**
- Case number cleared from field
- Focus returns to Enc No field

### Test 10: Invalid Check Digit
**Given:** User enters case number with invalid check digit
**When:** User tabs out of Enc No field
**Expected:**
- Error 3214 displays
- Case number cleared or validation fails

### Test 11: Empty Encounter Number
**Given:** Enc No field is empty
**When:** User tabs to next field
**Expected:**
- No error (optional field)
- Focus moves normally

### Test 12: Case Number with Extra Characters
**Given:** User enters case number exceeding max length
**When:** User continues typing
**Expected:**
- Error 1411 displays
- Input prevented beyond max length

---

## Business Rules

1. **Local Priority:** System always checks local PATIENT table before querying PMI
2. **Hospital Matching:** Case numbers are hospital-specific and must match hospital context
3. **PMI Indicator:** Close indicator (🔒) MUST display for all PMI-retrieved patients
4. **Focus Management:** After successful retrieval, focus MUST move to Request No. field
5. **New Patient Default:** When creating new encounter, system registers as new patient
6. **Error Recovery:** Users can cancel any error dialogue to retry case number entry
7. **Data Source Priority:** Local data takes precedence over PMI data when available
8. **Service Degradation:** System remains operational when PMI unavailable (manual entry)

---

## Related Documentation

- [[_Registration_Overview]] - Main Registration screen layout
- [[LisEncounterNoTextInputPm]] - Encounter number component
- [[LisHkidTextInputPm]] - HKID input component
- [[Retrieve Patient by HKID]] - Alternative patient retrieval workflow
- [[PMI Integration]] - Patient Master Index integration details
- [[Create New Episode]] - New patient episode creation workflow

---

## Modification History

| Date | Developer | Reference | Changes |
|------|-----------|-----------|---------|
| 27 Jun 2014 | Rock Yu | CEO69621 | Amended constructComponents |
| 10 Nov 2014 | Rock Yu | PMH-BBS-B-000068 | Added serverCallErrorHandlerForPMI |
| 27 May 2025 | Tony Chong | LIS-9975 | Amended retrieveRegistrationPatientListHandler |

---

## Notes

- The workflow supports both barcode scanning and manual entry of case numbers
- Hospital Selection Panel is critical for cross-hospital case number handling
- PMI integration requires LAB_OPTION configuration: PMI_ENABLED = 'Y'
- Check digit algorithm varies by hospital configuration
- Close indicator (🔒) is visual only - no user interaction required
- Error messages 687, 3214, and 3780 are key to understanding workflow failures
- System maintains audit trail of PMI queries and service failures
