# IOI Methods

# proc_type_1

![image.png](Patient/IOI/IOI%20Methods.assets/image.png)

## Methods Being Called

- change_demo(in_prog_id)
- Attempts to update demographic information for an existing patient
- Returns code 100 specifically if patient is not found
- pmi_registration(in_prog_id) (only if patient not found)
- Creates a new patient registration when the patient doesn't exist

## Corresponding Logic

proc_type_1 follows a "try to update, if not found then create" workflow:

```javascript
int proc_type_1(int in_prog_id)
{
    int ret_out = 0;

    // First try to update existing patient demographics
    ret_out = change_demo(in_prog_id);
    
    // If patient not found (code 100), perform registration
    if (ret_out == 100)
    {
       printf("DEBUG : Patient NOT Found. Call PMI Registration\n");
       return(pmi_registration(in_prog_id));
    }
    else
    {
       return ret_out;
    }
}
```

The function:

- First tries to update an existing patient record with change_demo
- If no patient is found (code 100), registers the patient as new with pmi_registration
- Otherwise returns whatever error or success code change_demo returned

## Data Inserted/Updated

### When updating existing patient (change_demo):

```javascript
update patient
set pat_name        = :pat_name,
    pat_cname       = :pat_cname,
    pat_dob         = :pat_dob :ind_pat_dob,
    pat_exact_dob_flag = :cpi_exact_dob_flag[rec_no] :ind_cpi_exact_dob_flag[rec_no],
    pat_sex         = :pat_sex,
    pat_address     = :pat_address :ind_pat_address,
    pat_race        = :pat_race    :ind_pat_race,
    pat_update_date = :pat_update_date,
    pat_update_by   = :pat_update_by,
    pat_update_ws   = :pat_update_ws,
    pat_ward_class  = :pat_ward_class :ind_pat_ward_class
where pat_encounter = :ENCOUNTER and
      pat_pid       = :PID;
```

### When creating new patient (pmi_registration):

Creates a complete patient record including:

- Patient identifiers (PID, encounter number)
- Patient demographics (name, DOB, gender, etc.)
- Administrative data (creation timestamp, user)
- Ward/location information
- System grouping IDs (PID group, encounter group)

### Additional operations:

- Updates audit logs via write_amend_log(CHANGE_DEMO)
- Records updates to PID checking via update_pid_check(CHANGE_DEMO)
- If demographic data mismatches are found, records them in patient_pmi_ex table
- For some hospitals (e.g., UCH), performs special handling like MRN to bed conversions

This transaction type handles the core functionality of keeping patient demographic information synchronized between systems (PMI/CPI and LIS).

---

# proc_type_2

## Methods Being Called

- change_demo(in_prog_id)
- Updates patient demographic information if the patient already exists
- check_ahead()
- Checks if the next record in the batch is a cancellation of this admission
- Returns false (0) if this admission should be ignored due to an immediate cancellation
- patient_adm(in_prog_id)
- Core function that handles patient admission
- This is a wrapper that provides deadlock retry logic around patient_adm_wo_tran
- Inside patient_adm_wo_tran:
- check_encounter() - Checks if the encounter number already exists
- check_patient() - Verifies if the encounter belongs to this patient
- check_pid() - Checks if the patient ID already exists
- get_set_ctr() - Gets/sets counters for PID group and encounter group
- clear_patient_rec() - Initializes patient record variables
- convert_IPAS_to_LIS() - Converts data from IPAS/CPI format to LIS format
- insert_patient_rec() - Creates the patient record in the database
- write_amend_log() - Records the admission action in the audit log
- update_pid_check() - Updates PID check records
- update_pid_group() - Updates patient ID group assignments
- get_and_update_mrn() - Gets and updates Medical Record Number

## Corresponding Logic

```javascript
int proc_type_2(int in_prog_id)
{
   int ret_in = 0;

   // First try to update any existing patient demographic info
   change_demo(in_prog_id);

   // Check if this is an immediate cancellation record that should be ignored
   if (!check_ahead())
   {
      rec_no++;  // Skip this record
      return 0;
   }

   // Attempt to admit the patient
   if (ret_in = patient_adm(in_prog_id))
   {
      printf("ERROR : proc_type_2 - patient admission ERROR\n"); 
   }

   return(ret_in);
}
```

The workflow is:

- Update demographic information if patient exists
- Check if this admission should be processed or ignored (due to an immediate cancellation)
- If not ignored, perform the actual admission
- Return any error code from the admission process

## Data Inserted/Updated

### During admission, the following data is inserted:

```javascript
/* If new patient */
insert into patient (
  pat_encounter, pat_pid, pat_name, pat_sex, pat_dob, pat_age, 
  pat_age_unit, pat_att_dr, pat_adm_date, pat_location, pat_bed, 
  pat_unit, pat_cat, pat_risk, pat_create_date, pat_create_by, 
  pat_update_date, pat_update_by, pat_create_ws, pat_update_ws, 
  pat_address, pat_discharge_date, pat_pid_group, pat_active_encounter, 
  pat_encounter_group, pat_race, pat_mrn, pat_cname, pat_death, 
  pat_confidential, pat_death_date, pat_hospital, pat_discharge_code, 
  pat_type, pat_ward_class, pat_exact_dob_flag
) values (...);
```

### Key data elements inserted:

- Patient identifiers: pat_encounter, pat_pid, pat_pid_group, pat_encounter_group
- Demographics: pat_name, pat_cname, pat_sex, pat_dob, pat_age, pat_race, pat_address
- Visit details: pat_adm_date, pat_location, pat_bed, pat_unit, pat_type, pat_cat
- System data: pat_create_date, pat_create_by, pat_update_date, pat_update_by

### Additional data updates:

- pat_amend_log: Records audit information about the admission action
- pid_check: Updates PID verification records
- For existing patients: Updates demographics with change_demo if the patient already exists

### Special handling:

- For UCH hospital: Converts MRN to bed information for SOPD encounters
- MRN (Medical Record Number) handling through a separate update
- Deadlock retry logic for database concurrency
- Verification-only mode when in_prog_id is 0

The function is a critical component that handles the admission of patients into the Laboratory Information System, ensuring proper integration with the Patient Management Information system.

---

# proc_type_3

## Methods Being Called

- check_ahead()
- Checks if the next record in the batch is relevant to this cancellation
- cancel_adm(in_prog_id)
- Main function that handles admission cancellation
- Implements deadlock retry logic around cancel_adm_wo_tran
- Inside cancel_adm_wo_tran:
- check_encounter() - Verifies the encounter exists
- check_patient() - Checks if encounter belongs to specific patient
- get_set_ctr() - Gets counter for cancellation numbers
- get_patient_details() - Retrieves patient information
- cancel_patient_rec() - Performs the actual cancellation in the database
- write_amend_log() - Records the cancellation in audit logs
- update_pid_check() - Updates PID check records
- update_pid_group() - Updates the patient ID group

## Corresponding Logic

```javascript
int proc_type_3(int in_prog_id)
{
   int ret_in = 0;

   // Check if this cancellation should be processed
   if (!check_ahead())
   {
      rec_no++;  // Skip this record
      return 0;
   }

   // Perform the admission cancellation
   if (ret_in = cancel_adm(in_prog_id))
   {
      printf("ERROR : proc_type_3 - cancel admission ERROR\n");
   }

   return(ret_in);
}
```

The workflow is:

- Check if this cancellation should be processed or ignored
- If not ignored, perform the actual cancellation
- Return any error code from the cancellation process

## Data Inserted/Updated

### During cancellation, the following updates are made:

```javascript
/* First create a cancellation encounter */
insert into patient (...) values (...);

/* Then mark the original encounter as inactive */
update patient
   set pat_active_encounter = 0,
       pat_update_date = :pat_update_date,
       pat_update_by = :pat_update_by,
       pat_update_ws = :pat_update_ws
 where pat_encounter = :ENCOUNTER
   and pat_pid = :PID;
```

### Key data elements:

- Cancellation record creation:
- Creates a new record with a special cancellation encounter ID (prefixed with CAN_ENC_HEAD)
- Sets active_encounter = 0 for this record
- Preserves all the original patient data
- Records the system metadata (who cancelled, when, etc.)
- Original record update:
- Sets pat_active_encounter = 0 to mark it as inactive
- Updates pat_update_date, pat_update_by, pat_update_ws
- Audit records:
- Writes to pat_amend_log with action code CANCEL_ADM_CODE
- Updates pid_check records
- Potentially updates pid_group assignments

### Special handling:

- For UCH hospital: May handle special MRN to bed conversions for SOPD encounters
- Uses counter system to generate unique cancellation numbers
- Implements deadlock retry logic
- Has verification-only mode when in_prog_id is 0

This function complements proc_type_2 (admission) by providing the ability to cancel admissions, ensuring that cancelled encounters are properly marked as inactive while maintaining a complete audit trail of the cancellation.

---

# proc_type_4

## Methods Being Called

1. change_demo(in_prog_id)
- Updates patient demographic information if needed
- check_ahead()
- Checks if this transfer should be processed based on subsequent records
- internal_transfer(in_prog_id)
- Main function handling patient transfers
- Uses retry logic around internal_transfer_wo_tran
- Inside internal_transfer_wo_tran:
- check_encounter() - Verifies encounter exists
- check_patient() - Ensures encounter belongs to specific patient
- get_set_ctr() - Gets counter for transfer numbers
- get_patient_details() - Retrieves current patient information
- cancel_patient_rec() - Cancels the original patient record
- insert_patient_rec() - Creates a new record with updated location
- write_amend_log() - Records transfer in audit logs
- update_pid_check() - Updates PID check records

## Corresponding Logic

```javascript
int proc_type_4(int in_prog_id)
{
   int ret_in = 0;

   // First update demographic information if needed
   change_demo(in_prog_id);

   // Check if this transfer should be processed
   if (!check_ahead())
   {
      rec_no++;  // Skip this record
      return 0;
   }

   // Perform the internal transfer
   if (ret_in = internal_transfer(in_prog_id))
   {
      printf("ERROR : proc_type_4 - internal transfer ERROR\n");
   }

   return(ret_in);
}
```

The workflow is:

- Update demographic information if needed
- Check if this transfer should be processed or ignored
- If not ignored, perform the actual transfer
- Return any error code from the transfer process

## Data Inserted/Updated

### During transfer, two main data operations occur:

1. Cancel original location record:

```javascript
/* Create a cancellation record */
insert into patient (...)
select pat_encounter, pat_pid, pat_name, pat_sex, pat_dob, pat_age,
       pat_age_unit, pat_att_dr, pat_adm_date, pat_location, pat_bed,
       pat_unit, pat_cat, pat_risk, pat_create_date, pat_create_by,
       pat_update_date, pat_update_by, pat_create_ws, pat_update_ws,
       pat_address, pat_discharge_date, pat_pid_group, 0 /* inactive */,
       pat_encounter_group, pat_race, pat_mrn, pat_cname, pat_death,
       pat_confidential, pat_death_date, pat_hospital, pat_discharge_code,
       pat_type, pat_ward_class, pat_exact_dob_flag
from patient
where pat_encounter = :ENCOUNTER and pat_pid = :PID;

/* Mark original record as inactive */
update patient
   set pat_active_encounter = 0,
       pat_update_date = :pat_update_date,
       pat_update_by = :pat_update_by,
       pat_update_ws = :pat_update_ws
 where pat_encounter = :ENCOUNTER
   and pat_pid = :PID;
```

2. Insert new location record:

```javascript
insert into patient (...)
values (...); /* Same patient data but with new location/bed/unit */
```

### Key data elements changed during transfer:

- Location information:
- pat_location - New ward/location
- pat_bed - New bed assignment
- pat_unit - New clinical unit
- pat_ward_class - New ward class
- System data:
- pat_update_date - Transfer timestamp
- pat_update_by - User who performed transfer
- pat_update_ws - Workstation used
- Audit records:
- Writes to pat_amend_log with action code INTERNAL_TRANSFER_CODE
- Updates pid_check records

### Special handling:

- For hospitals like UCH: Special handling for MRN and bed numbers for SOPD encounters
- Uses counter system to generate unique cancellation numbers
- Implements deadlock retry logic
- Has verification-only mode when in_prog_id is 0
- May copy ward class from older record to newer record during transfers

This function implements the internal transfer process, which is a special case of patient movement that doesn't involve discharge. It maintains location history by cancelling the old record and creating a new one with updated location information, while preserving all other patient data.

---

# proc_type_5

## Methods Being Called

1. change_demo(in_prog_id)
- Updates patient demographic information if needed
- check_ahead()
- Checks if this discharge should be processed based on subsequent records
- discharge_patient(in_prog_id)
- Main function handling patient discharge
- Uses retry logic around discharge_patient_wo_tran
- Inside discharge_patient_wo_tran:
- check_encounter() - Verifies encounter exists
- check_patient() - Ensures encounter belongs to specific patient
- get_patient_details() - Retrieves current patient information
- get_set_ctr() - Gets counter for discharge numbers
- cancel_patient_rec() - Cancels the active patient record
- insert_patient_rec() - Creates a discharge record
- write_amend_log() - Records discharge in audit logs
- update_pid_check() - Updates PID check records

## Corresponding Logic

```javascript
int proc_type_5(int in_prog_id)
{
   int ret_in = 0;

   // First update demographic information if needed
   change_demo(in_prog_id);

   // Check if this discharge should be processed
   if (!check_ahead())
   {
      rec_no++;  // Skip this record
      return 0;
   }

   // Perform the patient discharge
   if (ret_in = discharge_patient(in_prog_id))
   {
      printf("ERROR : proc_type_5 - patient discharge ERROR\n");
   }

   return(ret_in);
}
```

The workflow is:

- Update demographic information if needed
- Check if this discharge should be processed or ignored
- If not ignored, perform the actual discharge
- Return any error code from the discharge process

## Data Inserted/Updated

### During discharge, two main data operations occur:

1. Cancel active patient record:

```javascript
update patient
   set pat_active_encounter = 0,
       pat_update_date = :pat_update_date,
       pat_update_by = :pat_update_by,
       pat_update_ws = :pat_update_ws
 where pat_encounter = :ENCOUNTER
   and pat_pid = :PID;
```

2. Create discharge record:

```javascript
insert into patient (...)
values (...); /* With discharge date and discharge code */
```

### Key data elements changed during discharge:

- Discharge information:
- pat_discharge_date - When the patient was discharged
- pat_discharge_code - Reason/type of discharge
- pat_active_encounter - Set to 0 for both records
- System data:
- pat_update_date - Discharge processing timestamp
- pat_update_by - User who processed discharge
- pat_update_ws - Workstation used
- Audit records:
- Writes to pat_amend_log with action code DISCHARGE_PAT_CODE
- Updates pid_check records

### Special handling:

- Uses counter system to generate unique cancellation numbers
- Implements deadlock retry logic
- Has verification-only mode when in_prog_id is 0
- May handle death indicator if the patient was discharged due to death
- For some hospitals: Special handling for specific discharge scenarios

This function implements the patient discharge process, marking the encounter as no longer active and recording the discharge details. It maintains the full patient history by creating a discharge record that includes the discharge date and code, while preserving a record of the patient's stay.

---

# proc_type_6

## Methods Being Called

1. check_ahead()
- Checks if this cancellation of discharge should be processed
- cancel_discharge(in_prog_id)
- Main function handling cancellation of patient discharge
- Uses retry logic around cancel_discharge_wo_tran
- Inside cancel_discharge_wo_tran:
- check_encounter() - Verifies encounter exists
- check_patient() - Ensures encounter belongs to specific patient
- get_patient_details() - Retrieves current patient information
- reactivate_patient_rec() - Reactivates the patient record
- get_set_ctr() - Gets counter for cancellation numbers
- cancel_patient_rec() - Cancels the discharge record
- write_amend_log() - Records cancellation in audit logs
- update_pid_check() - Updates PID check records

## Corresponding Logic

```javascript
int proc_type_6(int in_prog_id)
{
   int ret_in = 0;

   // Check if this discharge cancellation should be processed
   if (!check_ahead())
   {
      rec_no++;  // Skip this record
      return 0;
   }

   // Perform the cancellation of discharge
   if (ret_in = cancel_discharge(in_prog_id))
   {
      printf("ERROR : proc_type_6 - cancel discharge ERROR\n");
   }

   return(ret_in);
}
```

The workflow is:

- Check if this cancellation should be processed or ignored
- If not ignored, perform the actual cancellation of discharge
- Return any error code from the cancellation process

## Data Inserted/Updated

### During discharge cancellation, the following data operations occur:

1. Reactivate patient record:

```javascript
update patient
   set pat_active_encounter = 1,
       pat_update_date = :pat_update_date,
       pat_update_by = :pat_update_by,
       pat_update_ws = :pat_update_ws
 where pat_encounter = :ENCOUNTER
   and pat_pid = :PID;
```

2. Cancel discharge record:

```javascript
/* Create a cancellation record for the discharge */
insert into patient (...)
select pat_encounter, pat_pid, pat_name, pat_sex, pat_dob, pat_age,
       /* ... other fields ... */
       0 /* inactive encounter */,
       /* ... other fields ... */
from patient
where pat_encounter = :CAN_ENCOUNTER and pat_pid = :PID;

/* Mark discharge record as inactive */
update patient
   set pat_active_encounter = 0,
       pat_update_date = :pat_update_date,
       pat_update_by = :pat_update_by,
       pat_update_ws = :pat_update_ws
 where pat_encounter = :CAN_ENCOUNTER
   and pat_pid = :PID;
```

### Key data elements changed:

- Encounter status:
- pat_active_encounter - Set to 1 for the original patient record
- pat_active_encounter - Set to 0 for the discharge record
- System data:
- pat_update_date - Cancellation processing timestamp
- pat_update_by - User who processed cancellation
- pat_update_ws - Workstation used
- Audit records:
- Writes to pat_amend_log with action code CANCEL_DISCHARGE_CODE
- Updates pid_check records

### Special handling:

- Uses counter system to generate unique cancellation numbers
- Implements deadlock retry logic
- Has verification-only mode when in_prog_id is 0
- May handle special cases for certain patient types or hospitals
- Preserves original patient demographics and location information

This function essentially "undoes" a discharge by reactivating the original patient record and marking the discharge record as inactive. This allows the system to handle cases where a discharge was recorded in error or when a discharged patient returns without requiring a new admission.

---

# proc_type_7

## Methods Being Called

- change_demo(in_prog_id)
- Updates patient demographic information if needed
- check_ahead()
- Checks if this transaction should be processed based on subsequent records
- change_hkid(in_prog_id)
- Main function handling patient ID changes
- Uses retry logic around change_hkid_wo_tran
- Inside change_hkid_wo_tran:
- check_encounter() - Verifies encounter exists
- check_patient() - Ensures encounter belongs to specific patient
- check_pid() - Checks if the new patient ID already exists
- get_set_ctr() - Gets/assigns new PID group if needed
- get_patient_details() - Retrieves current patient information
- move_episode() - Moves the encounter to the new patient ID
- write_amend_log() - Records ID change in audit logs
- update_pid_check() - Updates PID check records

## Corresponding Logic

```javascript
int proc_type_7(int in_prog_id)
{
   int ret_in = 0;

   // First update demographic information if needed
   change_demo(in_prog_id);

   // Check if this ID change should be processed
   if (!check_ahead())
   {
      rec_no++;  // Skip this record
      return 0;
   }

   // Perform the patient ID change
   if (ret_in = change_hkid(in_prog_id))
   {
      printf("ERROR : proc_type_7 - change hkid ERROR\n");
   }

   return(ret_in);
}
```

The workflow is:

- Update demographic information if needed
2. Check if this ID change should be processed or ignored
- If not ignored, perform the actual ID change
- Return any error code from the ID change process

## Data Inserted/Updated

### During patient ID change, the following data operations occur:

1. Cancel original patient record:

```javascript
update patient
   set pat_active_encounter = 0,
       pat_update_date = :pat_update_date,
       pat_update_by = :pat_update_by,
       pat_update_ws = :pat_update_ws
 where pat_encounter = :ENCOUNTER
   and pat_pid = :PID;
```

2. Create new record with updated ID:

```javascript
insert into patient (
  pat_encounter, pat_pid, /* new patient ID */
  /* other patient fields preserved from original record */
  pat_pid_group, /* may be a new PID group */
  pat_active_encounter, pat_encounter_group,
  /* other fields */
)
values (...);
```

### Key data elements changed:

- Patient identifiers:
- pat_pid - Changed to the new HKID/patient ID
- pat_pid_group - May be changed to a new group or merged with existing
- System data:
- pat_update_date - ID change timestamp
- pat_update_by - User who processed the change
- pat_update_ws - Workstation used
- Audit records:
- Writes to pat_amend_log with a special action code for ID changes
- Updates pid_check records
- May update pid_group assignments

### Special handling:

- Handles cases where the new ID already exists (patient merge)
- Preserves Medical Record Number (MRN) during ID changes
- Implements deadlock retry logic
- Has verification-only mode when in_prog_id is 0
- May perform special checks for duplicate IDs

This function manages changes to a patient's identifier (HKID), which can happen due to corrections of patient ID errors or formal patient ID changes. It preserves all patient data while maintaining a clear audit trail of the ID change.

---

# proc_type_8

## Methods Being Called

- check_ahead()
- Checks if this transaction should be processed based on subsequent records
- move_episode(in_prog_id)
- Main function handling episode movement between patients
- Uses retry logic around move_episode_wo_tran
- Inside move_episode_wo_tran:
- check_encounter() - Verifies encounter exists
- check_pid() - Verifies if target patient ID exists
- get_patient_details() - Retrieves current patient information
- get_set_ctr() - Gets counter for cancellation numbers
- cancel_patient_rec() - Cancels the record for the original patient
- insert_patient_rec() - Creates a new record under the target patient
- write_amend_log() - Records episode movement in audit logs
- update_pid_check() - Updates PID check records
- update_pid_group() - Updates patient ID group assignments
- get_and_update_mrn() - Updates Medical Record Number

## Corresponding Logic

```javascript
int proc_type_8(int in_prog_id)
{
   int ret_in = 0;

   // Check if this episode move should be processed
   if (!check_ahead())
   {
      rec_no++;  // Skip this record
      return 0;
   }

   // Perform the episode move
   if (ret_in = move_episode(in_prog_id))
   {
      printf("ERROR : proc_type_8 - move episode ERROR\n");
   }

   return(ret_in);
}
```

The workflow is:

- Check if this episode move should be processed or ignored
- If not ignored, perform the actual move
- Return any error code from the process

## Data Inserted/Updated

### During episode movement, the following data operations occur:

1. Cancel record for original patient:

```javascript
/* Create cancellation record */
insert into patient (...)
select /* fields from original patient record with active_encounter=0 */
from patient
where pat_encounter = :ENCOUNTER and pat_pid = :PID_FROM;

/* Mark original record as inactive */
update patient
   set pat_active_encounter = 0,
       pat_update_date = :pat_update_date,
       pat_update_by = :pat_update_by,
       pat_update_ws = :pat_update_ws
 where pat_encounter = :ENCOUNTER
   and pat_pid = :PID_FROM;
```

2. Create new record under target patient:

```javascript
insert into patient (
  pat_encounter, pat_pid, /* new patient ID */
  /* other patient fields preserved from original record */
  pat_pid_group, /* target patient's group */ 
  pat_active_encounter, pat_encounter_group,
  /* other fields */
)
values (...);
```

### Key data elements changed:

- Patient identifiers:
- pat_pid - Changed to the target patient's ID
- pat_pid_group - Updated to target patient's group
- System data:
- pat_update_date - Episode move timestamp
- pat_update_by - User who processed the move
- pat_update_ws - Workstation used
- Audit records:
- Writes to pat_amend_log with action code MERGE_CASE
- Updates pid_check records
- Updates pid_group assignments

### Special handling:

- Handles cases where the target patient doesn't exist (creates new patient)
- Special handling of Medical Record Number (MRN)
- Implements deadlock retry logic
- Has verification-only mode when in_prog_id is 0
- May perform special data merging operations

This function handles the movement of patient encounters/episodes between different patient records - which is essentially reassigning an encounter to a different patient. This is typically used for correcting patient identification errors or handling merged patients in the hospital system.

---

# proc_type_9

## Methods Being Called

1. check_ahead()
- Checks if this transaction should be processed based on subsequent records
- cancel_transfer(in_prog_id)
- Main function handling cancellation of patient transfers
- Uses retry logic around cancel_transfer_wo_tran
- Inside cancel_transfer_wo_tran:
- check_encounter() - Verifies encounter exists
- get_patient_details() - Retrieves current patient information
- get_set_ctr() - Gets counter for cancellation numbers
- get_original_location() - Retrieves the original location before transfer
- cancel_patient_rec() - Cancels the current location record
- insert_patient_rec() - Creates a new record with original location
- write_amend_log() - Records transfer cancellation in audit logs
- update_pid_check() - Updates PID check records

## Corresponding Logic

```javascript
int proc_type_9(int in_prog_id)
{
   int ret_in = 0;

   // Check if this transfer cancellation should be processed
   if (!check_ahead())
   {
      rec_no++;  // Skip this record
      return 0;
   }

   // Perform the transfer cancellation
   if (ret_in = cancel_transfer(in_prog_id))
   {
      printf("ERROR : proc_type_9 - cancel transfer ERROR\n");
   }

   return(ret_in);
}
```

The workflow is:

- Check if this transfer cancellation should be processed or ignored
- If not ignored, perform the actual cancellation
- Return any error code from the process

## Data Inserted/Updated

### During transfer cancellation, the following data operations occur:

1. Cancel current location record:

```javascript
/* Create cancellation record */
insert into patient (...)
select /* fields from current patient record with active_encounter=0 */
from patient
where pat_encounter = :ENCOUNTER and pat_pid = :PID;

/* Mark current record as inactive */
update patient
   set pat_active_encounter = 0,
       pat_update_date = :pat_update_date,
       pat_update_by = :pat_update_by,
       pat_update_ws = :pat_update_ws
 where pat_encounter = :ENCOUNTER
   and pat_pid = :PID;
```

2. Create new record with original location:

```javascript
insert into patient (
  pat_encounter, pat_pid,
  /* other patient fields */
  pat_location, /* original location from before transfer */
  pat_bed, /* original bed */
  pat_unit, /* original unit */
  pat_ward_class, /* original ward class */
  pat_active_encounter = 1, /* active */
  /* other fields */
)
values (...);
```

### Key data elements changed:

- Location information:
- pat_location - Reverted to original location before transfer
- pat_bed - Reverted to original bed assignment
- pat_unit - Reverted to original clinical unit
- pat_ward_class - Reverted to original ward class
- System data:
- pat_update_date - Cancellation timestamp
- pat_update_by - User who processed the cancellation
- pat_update_ws - Workstation used
- Audit records:
- Writes to pat_amend_log with action code for cancelling transfers
- Updates pid_check records

### Special handling:

- Uses counter system to generate unique cancellation numbers
- Retrieves original location information from previous records
- Implements deadlock retry logic
- Has verification-only mode when in_prog_id is 0
- Special handling of ward class (CEO-46552 fix)

This function essentially "undoes" a patient transfer by cancelling the current location record and creating a new record with the original location information. This allows the system to handle cases where a transfer was recorded in error.

---

# proc_type_010

## Methods Being Called

- change_demo(in_prog_id)
- Updates patient demographic information if needed
- check_ahead()
- Checks if this transaction should be processed based on subsequent records
- patient_death(in_prog_id)
- Main function handling patient death recording
- Uses retry logic around patient_death_wo_tran
- Inside patient_death_wo_tran:
- check_encounter() - Verifies encounter exists
- check_patient() - Ensures encounter belongs to specific patient
- get_patient_details() - Retrieves current patient information
- cancel_patient_rec() - Cancels the active patient record
- insert_patient_rec() - Creates a new record with death information
- write_amend_log() - Records the death in audit logs
- update_pid_check() - Updates PID check records

## Corresponding Logic

```javascript
int proc_type_010(int in_prog_id)
{
   int ret_in = 0;

   // First update demographic information if needed
   change_demo(in_prog_id);

   // Check if this death record should be processed
   if (!check_ahead())
   {
      rec_no++;  // Skip this record
      return 0;
   }

   // Process the patient death
   if (ret_in = patient_death(in_prog_id))
   {
      printf("ERROR : proc_type_010 - patient death ERROR\n");
   }

   return(ret_in);
}
```

The workflow is:

- Update demographic information if needed
- Check if this death record should be processed or ignored
- If not ignored, process the patient death
- Return any error code from the process

## Data Inserted/Updated

### During patient death recording, the following data operations occur:

1. Cancel active patient record:

```javascript
update patient
   set pat_active_encounter = 0,
       pat_update_date = :pat_update_date,
       pat_update_by = :pat_update_by,
       pat_update_ws = :pat_update_ws
 where pat_encounter = :ENCOUNTER
   and pat_pid = :PID;
```

2. Create new record with death information:

```javascript
insert into patient (
  pat_encounter, pat_pid,
  /* other patient fields */
  pat_death = 'Y', /* Death indicator */
  pat_death_date = :cpi_death_date[rec_no], /* Death date */
  pat_active_encounter = 1, /* Active record */
  /* other fields */
)
values (...);
```

### Key data elements updated:

- Death information:
- pat_death - Set to 'Y' to indicate patient is deceased
- pat_death_date - Date of death from CPI record
- May include discharge information if death occurred during hospitalization
- System data:
- pat_update_date - Death record timestamp
- pat_update_by - User who processed the death record
- pat_update_ws - Workstation used
- Audit records:
- Writes to pat_amend_log with action code for patient death
- Updates pid_check records

### Special handling:

- Handles consistency between death date and death indicator (CEO-78182 fix)
- May create both death and discharge records if applicable
- Implements deadlock retry logic
- Has verification-only mode when in_prog_id is 0

This function processes patient death records, updating the patient's status in the system while maintaining a complete audit trail. It ensures that death information is properly captured and reflected across the system.

---

# proc_type_031

## Methods Being Called

- change_demo(in_prog_id)
- Updates patient demographic information if needed
- check_ahead()
- Checks if this transaction should be processed based on subsequent records
- dnl_leave(in_prog_id)
- Main function handling the day-night leave process
- Uses retry logic around dnl_leave_wo_tran
- Inside dnl_leave_wo_tran:
- check_encounter() - Verifies encounter exists
- check_patient() - Ensures encounter belongs to specific patient
- get_patient_details() - Retrieves current patient information
- cancel_patient_rec() - Cancels the active patient record
- insert_patient_rec() - Creates a new record with DNL status
- write_amend_log() - Records the leave in audit logs
- update_pid_check() - Updates PID check records

## Corresponding Logic

```javascript
int proc_type_031(int in_prog_id)
{
   int ret_in = 0;

   // First update demographic information if needed
   change_demo(in_prog_id);

   // Check if this DNL record should be processed
   if (!check_ahead())
   {
      rec_no++;  // Skip this record
      return 0;
   }

   // Process the DNL leave
   if (ret_in = dnl_leave(in_prog_id))
   {
      printf("ERROR : proc_type_031 - dnl leave ERROR\n");
   }

   return(ret_in);
}
```

The workflow is:

- Update demographic information if needed
- Check if this DNL record should be processed or ignored
- If not ignored, process the day-night leave
- Return any error code from the process

## Data Inserted/Updated

### During DNL leave processing, the following data operations occur:

1. Cancel active patient record:

```javascript
update patient
   set pat_active_encounter = 0,
       pat_update_date = :pat_update_date,
       pat_update_by = :pat_update_by,
       pat_update_ws = :pat_update_ws
 where pat_encounter = :ENCOUNTER
   and pat_pid = :PID;
```

2. Create new record with DNL information:

```javascript
insert into patient (
  pat_encounter, pat_pid,
  /* other patient fields */
  pat_type = 'DNL', /* Day-night leave */
  pat_active_encounter = 1, /* Active record */
  /* other fields */
)
values (...);
```

### Key data elements updated:

- Leave information:
- pat_type - Set to 'DNL' to indicate patient is on day-night leave
- Location information may be preserved from the original record
- System data:
- pat_update_date - DNL record timestamp
- pat_update_by - User who processed the record
- pat_update_ws - Workstation used
- Audit records:
- Writes to pat_amend_log with action code for DNL
- Updates pid_check records

### Special handling:

- "Not update MRN for DNL update" (CEO-31034) - Medical Record Number handling
- Implements deadlock retry logic
- Has verification-only mode when in_prog_id is 0

This function processes day-night leave records, indicating that a patient has temporarily left the hospital but is expected to return, without formally discharging the patient.

---

# proc_type_I

## Methods Being Called

- change_demo(in_prog_id)
- Updates patient demographic information if needed
- check_ahead()
- Checks if this transaction should be processed based on subsequent records
- pre_adm_cancel(in_prog_id)
- Main function handling pre-admission cancellation
- Uses retry logic around pre_adm_cancel_wo_tran
- Inside pre_adm_cancel_wo_tran:
- check_encounter() - Verifies pre-admission encounter exists
- check_patient() - Ensures encounter belongs to specific patient
- get_patient_details() - Retrieves current patient information
- cancel_patient_rec() - Cancels the pre-admission record
- write_amend_log() - Records the cancellation in audit logs
- update_pid_check() - Updates PID check records

## Corresponding Logic

```javascript
int proc_type_I(int in_prog_id)
{
   int ret_in = 0;

   // First update demographic information if needed
   change_demo(in_prog_id);

   // Check if this pre-admission cancellation should be processed
   if (!check_ahead())
   {
      rec_no++;  // Skip this record
      return 0;
   }

   // Process the pre-admission cancellation
   if (ret_in = pre_adm_cancel(in_prog_id))
   {
      printf("ERROR : proc_type_I - pre-admission cancellation ERROR\n");
   }

   return(ret_in);
}
```

The workflow is:

- Update demographic information if needed
- Check if this pre-admission cancellation should be processed or ignored
- If not ignored, process the cancellation
- Return any error code from the process

## Data Inserted/Updated

### During pre-admission cancellation, the following data operations occur:

1. Cancel the pre-admission record:

```javascript
update patient
   set pat_active_encounter = 0,
       pat_update_date = :pat_update_date,
       pat_update_by = :pat_update_by,
       pat_update_ws = :pat_update_ws
 where pat_encounter = :ENCOUNTER
   and pat_pid = :PID;
```

2. Create cancellation record:

```javascript
insert into patient (
  /* Fields copied from original record */
  pat_active_encounter = 0, /* Inactive */
  /* System metadata fields */
)
values (...);
```

### Key data elements updated:

- Encounter status:
- pat_active_encounter - Set to 0 to mark the pre-admission as cancelled
- System data:
- pat_update_date - Cancellation timestamp
- pat_update_by - User who processed the cancellation
- pat_update_ws - Workstation used
- Audit records:
- Writes to pat_amend_log with action code for pre-admission cancellation
- Updates pid_check records

### Special handling:

- Implements deadlock retry logic
- Has verification-only mode when in_prog_id is 0
- May handle Medical Record Number (MRN) preservation

This function specifically handles the cancellation of pre-admission records (transaction type "I"), which differ from regular admissions in that they represent patients who were registered but not yet physically admitted to the hospital.

---

# proc_type_X

## Methods Being Called

- change_demo(in_prog_id)
- Updates patient demographic information first as is common with many transaction types
- check_ahead()
- Checks if this transaction should be processed or skipped
- cross_hosp_transfer(in_prog_id)
- Main function handling cross-hospital transfers
- Likely uses retry logic around cross_hosp_transfer_wo_tran
- Inside cross_hosp_transfer_wo_tran:
- check_encounter() - Verifies the original encounter exists
- check_patient() - Ensures encounter belongs to specific patient
- get_patient_details() - Retrieves current patient information
- cancel_patient_rec() - Cancels the patient record at original hospital
- insert_patient_rec() - Creates a new record at destination hospital
- write_amend_log() - Records the transfer in audit logs
- update_pid_check() - Updates PID check records

## Corresponding Logic

```javascript
int proc_type_X(int in_prog_id)
{
   int ret_in = 0;

   // First update demographic information if needed
   change_demo(in_prog_id);

   // Check if this cross-hospital transfer should be processed
   if (!check_ahead())
   {
      rec_no++;  // Skip this record
      return 0;
   }

   // Process the cross-hospital transfer
   if (ret_in = cross_hosp_transfer(in_prog_id))
   {
      printf("ERROR : proc_type_X - cross hospital transfer ERROR\n");
   }

   return(ret_in);
}
```

The workflow is:

- Update demographic information if needed
- Check if this cross-hospital transfer should be processed or ignored
- If not ignored, process the transfer between hospitals
- Return any error code from the process

## Data Inserted/Updated

### During cross-hospital transfer, the following data operations likely occur:

1. Cancel record at original hospital:

```javascript
update patient
   set pat_active_encounter = 0,
       pat_update_date = :pat_update_date,
       pat_update_by = :pat_update_by,
       pat_update_ws = :pat_update_ws
 where pat_encounter = :ENCOUNTER
   and pat_pid = :PID
   and pat_hospital = :ORIGINAL_HOSPITAL;
```

2. Create new record at destination hospital:

```javascript
insert into patient (
  pat_encounter, pat_pid,
  /* other patient fields */
  pat_hospital = :NEW_HOSPITAL, /* Changed hospital code */
  pat_location = :NEW_LOCATION, /* New location at destination */
  pat_bed = :NEW_BED,
  pat_unit = :NEW_UNIT,
  pat_active_encounter = 1, /* Active record */
  /* other fields */
)
values (...);
```

### Key data elements updated:

- Hospital and location information:
- pat_hospital - Changed to the new hospital code
- pat_location - New ward/location at destination hospital
- pat_bed - New bed assignment
- pat_unit - New clinical unit
- System data:
- pat_update_date - Transfer timestamp
- pat_update_by - User who processed the transfer
- pat_update_ws - Workstation used
- Audit records:
- Writes to pat_amend_log with action code for cross-hospital transfers
- Updates pid_check records

This function specifically handles the transfer of patients between different hospitals in the healthcare system, ensuring proper maintenance of patient records across hospital boundaries while preserving patient history.

---

# proc_type_Y

### Methods Being Called

1. change_demo(in_prog_id)
- Updates patient demographic information if needed.
2. check_ahead()
- Checks if this transaction should be processed based on subsequent records.
3. special_case_handling(in_prog_id)
- Main function handling a specific type of patient transaction, likely unique to proc_type_Y.
- Uses retry logic around special_case_handling_wo_tran.
4. Inside special_case_handling_wo_tran:
- check_encounter() - Verifies the encounter exists.
- check_patient() - Ensures the encounter belongs to the specific patient.
- get_patient_details() - Retrieves current patient information.
- cancel_patient_rec() - Cancels the current patient record if needed.
- insert_patient_rec() - Creates or updates a record based on the transaction type.
- write_amend_log() - Records the transaction in audit logs.
- update_pid_check() - Updates PID check records.

### Corresponding Logic

```javascript
int proc_type_Y(int in_prog_id)
{
   int ret_in = 0;

   // First update demographic information if needed
   change_demo(in_prog_id);

   // Check if this special case should be processed
   if (!check_ahead())
   {
      rec_no++;  // Skip this record
      return 0;
   }

   // Process the special case
   if (ret_in = special_case_handling(in_prog_id))
   {
      printf("ERROR : proc_type_Y - special case handling ERROR\n");
   }

   return(ret_in);
}
```

### Data Inserted / Updated

During the processing of proc_type_Y, the following data operations might occur:

1. Cancel or Update Existing Record:

```javascript
update patient
        set pat_active_encounter = 0,
            pat_update_date = :pat_update_date,
            pat_update_by = :pat_update_by,
            pat_update_ws = :pat_update_ws
      where pat_encounter = :ENCOUNTER
        and pat_pid = :PID;
```

2. Insert or Update New Record:

```javascript
insert into patient (
       pat_encounter, pat_pid,
       /* other patient fields */
       pat_active_encounter = 1, /* Active record */
       /* other fields */
     )
     values (...);
```

### Key Data Elements Updated

- Patient Identifiers:
- pat_pid - Patient ID might be updated or verified.
- pat_encounter - Encounter number might be updated or verified.
- System Data:
- pat_update_date - Timestamp of the transaction.
- pat_update_by - User who processed the transaction.
- pat_update_ws - Workstation used.
- Audit Records:
- Writes to pat_amend_log with a specific action code for the transaction.
- Updates pid_check records.

### Special Handling

- Implements deadlock retry logic.
- Has verification-only mode when in_prog_id is 0.
- May involve special handling for specific patient types or conditions.

This function likely handles a unique or less common transaction type in the hospital system, ensuring that patient records are accurately updated and maintained.