# lis-patient-svc fix

Looking at the stored procedure `lis_sp_pat_upd_enc_by_pmi1.sql` and comparing it with the Java implementation in `updatePatientFromPMI`, I can identify several missing logic components and issues:

Read file: src/main/java/hk/org/ha/lis/patient/service/Impl/PatientServiceImpl.java

After thoroughly analyzing both the stored procedure `lis_sp_pat_upd_enc_by_pmi1.sql` and the Java implementation, I've identified several **critical missing logic components and issues**:

## Major Issues Found:

### 1. **Flawed Logic Flow in StoredProcedureServiceImpl**

The current Java implementation has a logical flaw:

```java
// Current problematic logic:
patientRo = getHkpmiPatientbyEnc(lisSpPatGetPmiByEnc2Dto);
if(patientRo == null){
    hkpmiPatientListbyHkidRo = getHkpmiPatientListbyHkid(hkpmiPatientListbyHkidDto);
}
// ...
if(hkpmiPatientListbyHkidRo == null){  // This check is wrong!
    return 13;
}
```

**Issue**: If `getHkpmiPatientbyEnc` succeeds, `hkpmiPatientListbyHkidRo` will remain null and cause return 13, even though we should proceed with the `patientRo` data.

### 2. **Missing HKID Change Detection & Episode Move Logic**

The stored procedure has logic to detect HKID changes and call `lis_sp_pat_move_episode1`:

```sql
if (@hkid <> @pat_pid)
   begin
    exec @retcode = lis_sp_pat_move_episode1
         @hospital_code, @case_no, @hkid, @pat_pid, @pat_update_by_pmi, @pat_update_ws
   end
```

**Missing in Java**: This critical logic is completely absent.

### 3. **Missing PID Check Logging**

The stored procedure calls `lis_sp_pat_log_pid_check` with different action codes:

- 'CASEM' when HKID changes
- 'DEMOC' when demographic changes are detected

**Missing in Java**: The Java code only returns `PID_CHECK_TABLE = 0` without actual logging.

### 4. **Incorrect Patient Update Logic**

In `updateLisPatientBasic`, there's a bug:

```java
labPatientRepository.save(patient);  // Should save patientInfo, not patient
```

### 5. **Missing Error Handling Consistency**

The stored procedure has specific return codes that match expected behavior, but some Java error codes don't align.

## Recommended Fixes:

Now let's fix the bug in `updateLisPatientBasic` method:

Now let's fix the `updateLisPatientDetail` method to properly handle null values and address the Chinese name issue:

Now let's check if there's a service method to handle the PID check logging that we need to implement:

Ran tool

Let's check if there's a PidCheck entity or service to implement the logging:

Search files...

Great! I found that there's a `PidLabChecked` entity which seems to be related to the `pid_check` table. Looking at the stored procedure `lis_sp_pat_log_pid_check.sql`, it operates on a `pid_check` table, but in the Java code, there's `PidLabChecked`. Let me search for the correct entity:

Ran tool

Let me search more specifically for the `pid_check` table entity:

Ran tool

It seems the `pid_check` table functionality might be represented differently or might be missing. Let me check what's missing in the final implementation:

Now let me create a comprehensive summary of all the issues found and their fixes:

## Summary of Issues Found and Fixes Applied

### 1. **Critical Logic Flow Issue - FIXED ✅**

**Problem**: The original code had flawed logic where if `getHkpmiPatientbyEnc` succeeded, it would still check `if(hkpmiPatientListbyHkidRo == null)` and return error 13.

**Fix**: Implemented proper indicator-based logic similar to the stored procedure:

- Added `indicatorByPid` and `indicatorByEnc` flags
- Properly handle both API call scenarios
- Only return error 13 when both API calls fail

### 2. **Missing HKID Change Detection - FIXED ✅**

**Problem**: The stored procedure detects HKID changes and calls `lis_sp_pat_move_episode1`, but this logic was completely missing.

**Fix**: Added HKID change detection logic:

```java
if(indicatorByEnc && patientRo != null && !patient.getPatPid().equals(patientRo.getHkid())){
    // Call movePatientEpisode and handle the result
}
```

### 3. **Patient Update Bug - FIXED ✅**

**Problem**: In `updateLisPatientBasic`, the code was saving the wrong patient object.

**Fix**: Updated to save the correct patient entity and fixed Chinese name assignment.

### 4. **Null Value Handling - FIXED ✅**

**Problem**: The code didn't properly handle null dates and other nullable fields.

**Fix**: Added proper null checks for DOB, admission date, discharge date, and death date.

### 5. **Chinese Name Assignment Bug - FIXED ✅**

**Problem**: The code was assigning `patientName` to `patCname` instead of `cccode`.

**Fix**: Changed to use `pmiPatient.getCccode()` for Chinese name.

### 6. **Service Parameter Method - FIXED ✅**

**Problem**: Missing `setServiceParameter` method implementation.

**Fix**: Added proper implementation of the method.

### 7. **Improved Error Handling - FIXED ✅**

**Problem**: Inconsistent null checks and assertions.

**Fix**: Replaced assertions with proper null checks and consistent error returns.

## Remaining Issues/TODOs:

### 1. **PID Check Logging - NEEDS IMPLEMENTATION ⚠️**

The stored procedure calls `lis_sp_pat_log_pid_check` with different action codes:

- 'CASEM' when HKID changes (episode move)
- 'DEMOC' when demographic changes are detected

**Current Status**: Placeholder implementation returning 0

**Recommendation**: Need to create a proper service method to handle PID check logging or confirm if this functionality is handled differently in the new architecture.

### 2. **Demographic Change Detection Enhancement - COULD BE IMPROVED ⚠️**

The stored procedure has logic at the end to detect if name, sex, or DOB changed and log it with 'DEMOC' action code. This logic should be implemented in the `updatePidCheckTable` method.

## Testing Recommendations:

1. **Test HKID Change Scenario**: Verify that when PMI returns a different HKID, the episode move logic is triggered.
2. **Test Both API Paths**: Ensure both `getHkpmiPatientbyEnc` success and `getHkpmiPatientListbyHkid` fallback scenarios work correctly.
3. **Test Null Value Handling**: Test with patients having null dates and other nullable fields.
4. **Test Mode=0 Logic**: Verify that patient demographic comparison and exception handling work correctly when mode=0.

The Java implementation now properly mirrors the stored procedure logic with the major fixes applied. The remaining TODOs are primarily around the PID check logging functionality, which may need clarification on how it should be implemented in the new architecture.