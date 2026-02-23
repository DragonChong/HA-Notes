# LisHkidTextInputPm

## Overview
`LisHkidTextInputPm` is a specialized text input component for handling Hong Kong Identity Card (HKID) numbers in the LIS system. It extends `LisTextInputPm` and provides validation, check digit calculation, and integration with patient data retrieval services.

## Component Details

### Package
`hk.org.ha.lis.common.component.basic`

### File Location
`lisFlexLib/flex_src/hk/org/ha/lis/common/component/basic/LisHkidTextInputPm.as`

### Inheritance
```
LisTextInputPm
  └─ LisHkidTextInputPm
```

### Interfaces Implemented
- `LisSyncComponentInterface` - Supports synchronous component operations
- `LisHkidExecutorInterface` - Provides execution interface for HKID-related operations

---

## Key Features

### 1. HKID Validation
- Validates HKID format and structure
- Calculates and verifies check digit
- Supports both 8-digit and 9-digit HKID formats
- Error prompting for invalid HKIDs

### 2. Check Digit Calculation
- Automatic check digit generation (when enabled)
- Manual check digit verification
- Algorithm-based validation using weighted sum method

### 3. Patient Data Integration
- Retrieves patient information from backend services
- Checks HKID against patient records
- Validates HKID merge status
- Checks patient amendment logs

### 4. CUMC Number Support
- Retrieves CUMC (Chinese University Medical Centre) numbers
- Cross-references HKID with CUMC records
- Supports document number validation

### 5. Patient Sub-ID Validation
- Checks patient sub-ID existence
- Validates patient identity across systems
- Error handling for duplicate or missing records

---

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `isGenerateCheckDigitAllowed` | Boolean | Controls automatic check digit generation |
| `hkidMergeEnabled` | Boolean | Enables/disables HKID merge checking |
| `hkidMergeForceCheckEnabled` | Boolean | Forces HKID merge validation |
| `hospSpecFeatureEnabled` | Boolean | Enables hospital-specific features (default: true) |
| `defaultMergeHkid` | Boolean | Default setting for merge HKID behavior |
| `executor` | LisHkidExecutorInterface | Executor for HKID operations |
| `searchCallbackFunction` | Function | Callback for search operations |
| `resultCallback` | Function | Callback for result handling |
| `checkPatientSubIdExistenceCallback` | Function | Callback for patient sub-ID existence check |

---

## Key Methods

### Validation Methods

#### `validateCheckDigit(hkid:String=null):Boolean`
Validates the check digit of an HKID number using the official algorithm.

**Parameters:**
- `hkid` - HKID string to validate (optional, uses component text if null)

**Returns:**
- `true` if check digit is valid, `false` otherwise

**Events Dispatched:**
- `LisValidationResultEvent` - Contains validation result

---

#### `verifyCheckDigit(hkid:String=null, isShowError:Boolean=true):Boolean`
Verifies check digit and optionally displays error messages.

**Parameters:**
- `hkid` - HKID string to verify
- `isShowError` - Whether to show error message (default: true)

**Returns:**
- `true` if valid, `false` otherwise

---

### Data Retrieval Methods

#### `getHkidKey(resultCallback:Function, hkid:String=null):void`
Retrieves patient key information based on HKID.

**Parameters:**
- `resultCallback` - Function to handle result
- `hkid` - HKID to query (optional)

---

#### `checkHkid(hkid:String, isCheckPatientAmendLogNeeded:Boolean, resultHandler:Function):void`
Checks HKID against patient records and optionally checks amendment logs.

**Parameters:**
- `hkid` - HKID to check
- `isCheckPatientAmendLogNeeded` - Whether to check patient amendment log
- `resultHandler` - Function to handle results

**Events Dispatched:**
- `HkidTextInputEvent.CHECK_HKID`

**Side Effects:**
- Sets `isAwaiting` flag during async operation

---

#### `checkPatientSubIdExistence(patientSubId:PatientSubIdVo, callback:Function):void`
Checks if a patient sub-ID exists in the system.

**Parameters:**
- `patientSubId` - Patient sub-ID value object
- `callback` - Function to handle result

**Events Dispatched:**
- `PatientUIEvent.CHECK_PATIENT_SUB_ID_EXISTENCE`

---

### Configuration Methods

#### `enableHkidMerge(enable:Boolean):void`
Enables or disables HKID merge checking functionality.

**Parameters:**
- `enable` - Boolean to enable/disable merge checking

---

### Helper Methods

#### `getHkid():String`
Extracts and formats HKID from component text.

**Returns:**
- Formatted HKID string

---

#### `calculateCheckDigit(hkid:String):String`
Calculates the check digit for an HKID using the weighted sum algorithm.

**Parameters:**
- `hkid` - HKID without check digit

**Returns:**
- Check digit character (0-9 or A)

**Algorithm:**
```
1. Convert HKID letters to numeric values (A=10, B=11, etc.)
2. Apply weight multipliers from right to left
3. Calculate weighted sum
4. Compute check digit: 11 - (sum mod 11)
5. If result is 10, check digit is 'A'
6. If result is 11, check digit is '0'
```

---

## Events

### Managed Events

| Event Type | Scope | Description |
|------------|-------|-------------|
| `HkidTextInputEvent.CHECK_HKID` | local | Checks HKID validity and retrieves patient data |
| `HkidTextInputEvent.RETRIEVE_CUMC_NO` | local | Retrieves CUMC number for HKID |
| `PatientUIEvent.CHECK_PATIENT_SUB_ID_EXISTENCE` | local | Checks patient sub-ID existence |

### Event Dispatching

#### LisValidationResultEvent
Dispatched after check digit validation with result details.

#### LisComponentEvent.MODIFIED_COMPLETE
Dispatched after modification operations complete.

---

## Backend Integration

### Service Layer

#### PatientUIAppServiceBean (EJB)
**Location:** `lisEJB/src/hk/org/ha/lis/ejb/frontend/common/PatientUIAppServiceBean.java`

**Methods:**
- `checkHkid(String hkid, boolean isCheckPatientAmendLogNeeded, ServiceParameterVo)` - Validates HKID and retrieves patient data
- `checkCumcNo(String trueHkid, String passport, ServiceParameterVo)` - Retrieves CUMC number
- `checkPatientSubIdExistence(ServiceParameterVo, PatientSubIdVo)` - Validates patient sub-ID

---

#### PatientUIAppServiceImpl (Business Logic)
**Location:** `lisEJB/src/hk/org/ha/lis/biz/frontend/common/impl/PatientUIAppServiceImpl.java`

**Key Operations:**
- Patient record lookup by HKID
- Patient amendment log checking
- Merged HKID validation
- Cross-lab result retrieval
- Cluster patient blood history retrieval

---

### Command Layer

#### HkidTextInputCommand
**Location:** `lisFlexLib/flex_src/hk/org/ha/lis/command/patient/HkidTextInputCommand.as`

**Responsibilities:**
- Remote service invocation
- Async token handling
- Result/error callback management
- Deadlock retry support (via AsyncTokenWrapper)

**Command Methods:**
- `checkHkid(event:HkidTextInputEvent):AsyncToken`
- `retrieveCumcNoEvent(event:HkidTextInputEvent):AsyncToken`

**Result Handlers:**
- `handleCheckHkidResult(result:PatientUIRo, trigger:HkidTextInputEvent):void`
- `handleRetrieveCumcNoEventResult(result:PatientUIRo, trigger:HkidTextInputEvent):void`

**Error Handlers:**
- `handleCheckHkidError(fault:FaultEvent, trigger:HkidTextInputEvent):void`
- `handleRetrieveCumcNoEventError(fault:FaultEvent, trigger:HkidTextInputEvent):void`

---

## Event Objects

### HkidTextInputEvent
**Location:** `lisFlexLib/flex_src/hk/org/ha/lis/event/patient/HkidTextInputEvent.as`

**Properties:**
- `callback:Function` - Success callback
- `errorHandleCallback:Function` - Error callback
- `hkid:String` - HKID value
- `isCheckPatientAmendLogNeeded:Boolean` - Amendment log check flag
- `docNo:String` - Document number for CUMC lookup

**Static Factory Methods:**
```actionscript
// Create CHECK_HKID event
HkidTextInputEvent.checkHkid(hkid:String, 
                              isCheckPatientAmendLogNeeded:Boolean, 
                              callback:Function, 
                              errorHandleCallback:Function=null)

// Create RETRIEVE_CUMC_NO event
HkidTextInputEvent.retrieveCumcNo(hkid:String, 
                                   docNo:String, 
                                   callback:Function,
                                   errorHandleCallback:Function=null)
```

---

### PatientUIEvent
**Location:** `lisFlexLib/flex_src/hk/org/ha/lis/event/patient/PatientUIEvent.as`

**Properties:**
- `callback:Function` - Success callback
- `errorHandleCallback:Function` - Error callback
- `patientSubId:PatientSubIdVo` - Patient sub-ID value object

**Static Factory Methods:**
```actionscript
// Check patient sub-ID existence
PatientUIEvent.checkPatientSubIdExistence(patientSubId:PatientSubIdVo, 
                                          callback:Function, 
                                          errorHandleCallback:Function=null)

// Select cluster patient blood history
PatientUIEvent.selectClusterPatientBloodHistory(hkid:String, 
                                                isSkipRequestHospital:Boolean, 
                                                callback:Function, 
                                                errorHandleCallback:Function=null)

// Select cross-lab results
PatientUIEvent.selectCrossLabResult(hkid:String, 
                                    callback:Function, 
                                    errorHandleCallback:Function=null)
```

---

## Usage in Registration Screen

The `LisHkidTextInputPm` component is used in the Registration screen as part of patient identification. See [[_Registration_Overview]] for context.

### Integration Points
- Patient Panel for manual registration
- Patient search and lookup
- Patient data validation
- Merge HKID handling

---

## Data Flow

```
User Input (HKID)
    ↓
LisHkidTextInputPm (Validation)
    ↓
HkidTextInputEvent (Event Dispatch)
    ↓
HkidTextInputCommand (Remote Call)
    ↓
PatientUIAppServiceBean (EJB)
    ↓
PatientUIAppServiceImpl (Business Logic)
    ↓
PatientService / Database
    ↓
Result Handler (Callback)
    ↓
UI Update
```

---

## Notes
- HKID format: 1-2 letters + 6 digits + 1 check digit (e.g., A123456(7))
- Check digit can be 0-9 or 'A'
- Component supports async operations with `isAwaiting` flag
- Hospital-specific features can be enabled/disabled via configuration
- Merge HKID functionality helps identify patient record consolidations
