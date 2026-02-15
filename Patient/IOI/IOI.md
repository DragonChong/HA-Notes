# IOI

### COMT-121

As a labuser, I suppose the patient record need to be up-to-date in HA environment,

so that I can use the updated patient data to create the request.

**IOI Source Code in SVN**

[http://cmsscm/svn/lis_ecpath4/IOI/CPI](http://cmsscm/svn/lis_ecpath4/IOI/CPI) for ECPath

![image.png](IOI.assets/image.png)



**Option For IOI C Program**

lis_option

|   | option_group | option_code      | option_value      | option_text                |
| - | ------------ | ---------------- | ----------------- | -------------------------- |
| 1 | IPAS_SITE    | *hospitalCode*   |                   | timestamp ( fill by prog ) |
| 2 | IPAS         | LAST_TRANSACTION |                   | timestamp ( fill by prog ) |
| 3 | CLT          | REPORT_CATEGORY  | *defaultCategory* |                            |

global_ctr

| ctr_code         | ctr_value |
| ---------------- | --------- |
| GUI_pat_canno    | 1         |
| GUI_pat_encgrp   | 1         |
| GUI_pat_encno    | 1         |
| GUI_pat_pidgrp   | 1         |
| BATCH_pat_canno  | 1000001   |
| BATCH_pat_encgrp | 1000001   |
| BATCH_pat_encno  | 1000001   |
| BATCH_pat_pidgrp | 1000001   |
| IPAS_pat_canno   | 5000001   |
| IPAS_pat_encgrp  | 5000001   |
| IPAS_pat_encno   | 5000001   |
| IPAS_pat_pidgrp  | 5000001   |

**Option for stored procedure**

lis_option

lis_sp_pat_remote_*

lis_sp_pat_upd_enc_by_pmi*

|   | option_group | option_code | option_value | option_text                      |
| - | ------------ | ----------- | ------------ | -------------------------------- |
| 1 | PMI          | SERVER      |              | e.g. HKPMI_H1A_ST1 for test env. |
| 2 | IOI          | ACCEPT_HOSP |              | *hospitalList* / ALL             |
| 3 | CLT          | CLT_ENABLE  | 1            | __                               |
| 4 | PMI          | STOP        |              | __                               |

laboratory

| **lab_labno** | **lab_server** |
| ------------- | -------------- |
| 1 ~ 8         | *serverName*   |

DB connection

| **HOSP**    | **DB**              | **User** |
| ----------- | ------------------- | -------- |
| All S[T/P]9 | LAB_DB  <br/>COM_DB | ipastfr  |

The program start at "laps_restart" in gateway.

The script will run laps_config and laps to start the download IPAS data.

![image.png](IOI.assets/image%20(2).png)

File: **laps_config.c**

Mainly read the config file "laps.cfg", for the interval download time, process mode and output to the log.

![image.png](IOI.assets/image%20(3).png)

| char **rec_count**[4]  <br/>char interval[3]  <br/>**char las**tkey[20]  <br/>char semaphore  <br/>**char** proc_mode |
| --------------------------------------------------------------------------------------------------------------------- |




![image.png](IOI.assets/image%20(4).png)

Default setup:

Normal time interval = 5 mins

Process mode = Auto Restart

File: **laps.c**

Function: **init_section()**

Check download progress, if still in progress will show the error log and restart the interface.

Function: **main_logic()**

Download progress retry checking, after that start to download by using the defined variable (**DOWNLOADPROG**)

It will call laps_download, that configured in laps.h

#elif defined(TESTING)

#if defined(NDH) || defined(OLM) || defined(RH) || defined(YCH) || defined(GH)

#define **DOWNLOADPROG** "nice -20 /appl/lis/home2/testioi2/work/laps_download"

#define KILL_IPAS    "/appl/lis/home2/testioi2/work/laps_kill > /dev/null"

#define RESET_IPAS   "/appl/lis/home2/testioi2/work/laps_config reset > /dev/null"

#else

#define **DOWNLOADPROG** "nice -20 /appl/lis/home2/testioi/work/laps_download"

#define KILL_IPAS    "/appl/lis/home2/testioi/work/laps_kill    > /dev/null"

#define RESET_IPAS   "/appl/lis/home2/testioi/work/laps_config reset > /dev/null"

#endif

File: **laps_download**

Function: **main_logic()**

Called "lis_sp_laps_utility.cp.**set_laboratory()**"

![image.png](IOI.assets/image%20(5).png)

****

Function: "lis_sp_laps_utility.cp.**set_laboratory()**"

check the lab availability in hospital

![{1AA3700E-8464-49B8-8E9D-B6958C920408}.png](IOI.assets/%7B1AA3700E-8464-49B8-8E9D-B6958C920408%7D.png)



Called "lis_sp_laps_utility.cp.**get_syb_tran()**"

Function: lis_sp_laps_utility.cp.**get_syb_tran()**

go to hospital DB S[T/P]9.**COM_DB** and select **cpi_transaction** with **ioi_process = NULL** to retrieve the record need to process.

Show the record need to process in log

After get_syb_tran() function, the log will show again the processing record

Check if the HKID, Name, Sex and DOB to use new record or old record to check patient demographic

e.g.

/* HKID */

if (IPAS_rec.old_hkid[0] != '\0')

{          strcpy(cpi_key_demo.pid, IPAS_rec.old_hkid);       }

else

{          /* use new hkid */          printf("DEBUG : use new HKID for check_patient_demo_ex!\n");          strcpy(cpi_key_demo.pid, IPAS_rec.hkid);       }

It will show message if using the new HKID, Name, Sex, DOB of the following:

- HKID: “DEBUG : use new HKID for check_patient_demo_ex!”
- Name: “DEBUG : use new name for check_patient_demo_ex!”
- Sex: “DEBUG : use new sex for check_patient_demo_ex!”
- DOB: “DEBUG : use new DOB for check_patient_demo_ex!”

Check if the case no is NULL or not. If not null, call **check_patient_demo_ex()** to check the patient demo have exception.

After that, the function will process difference action with difference transaction_type if do not have any exception.

Function: "lis_sp_laps_utility.cp.**check_patient_demo_ex()**"

The function will compare the existing **patient** table record in LAB_DB with COM_DB.cpi_transaction is same or not, and the record will not be process if the patient is not the same.

It will skip checking of the following case

1. Skip checking for cpi transaction without patient name, then will show message/log, exit function
2. Skip checking for no record found in patient table (SQL in Code ref. file: lis_sp_laps_utility.cp line: 2606), then will show message/log, exit function
    - If SQL fail will show SQL ERROR message, return fail.
3. Skip checking for created or updated by IPAS/PMI/NDHIPAS, then will show message/log, exit function

If patient record need to check the exception, and start compare patient key of HKID, NAME, SEX, DOB

e.g.

if (strcmp(in_cpi_key_demo.pid, pat_pid) != 0)

{       printf("DEBUG : check_patient_demo_ex - patient HKID exception!\n");       pat_ex = 1;    }

If all verified, it will show message, and exit the function

if (pat_ex == 0)

{       printf("DEBUG : check_patient_demo_ex - patient key demo verified!\n");       commit_transaction();       return 0;    }

If HKID, NAME, SEX, DOB have difference, the patient record will update or insert to **patient_pmi_ex** table

1. Select the record existing in patient_pmi_ex or not(SQL in Code ref. file: lis_sp_laps_utility.cp line: 2759)
2. Update the existing record (SQL in Code ref. file: lis_sp_laps_utility.cp line: 2781)
3. Or insert the new record (SQL in Code ref. file: lis_sp_laps_utility.cp line: 2795)

Show message/log when success or SQL error.

| **Action type** | **Description**          | **Transaction type in cpi_transaction** | **Transaction type Description**            |
| --------------- | ------------------------ | --------------------------------------- | ------------------------------------------- |
| proc_type_1     | Change demo              | 030                                     | Update Patient Demographic Data             |
| proc_type_2     | Change demo              | 100                                     | In-patient Registration / OPAS Create Case  |
| proc_type_2     | Change demo              | 300                                     | A&E Registration                            |
| proc_type_3     | Change admission         | 121                                     | Update Admission Registration               |
| proc_type_3     | Change admission         | 341                                     | A&E Register Update                         |
| proc_type_4     | Internal transfer        | 140                                     | Transfer Out                                |
| proc_type_4     | Internal transfer        | 160                                     | Trial Discharge                             |
| proc_type_4     | Internal transfer        | 170                                     | Return from Trial Discharge                 |
| proc_type_4     | Internal transfer        | 700                                     | Bed Assignment                              |
| proc_type_5     | Discharge patient        | 13*                                     | Mass Discharges                             |
| proc_type_5     | Discharge patient        | 33*                                     | Discharge of A&E patient                    |
| proc_type_6     | Cancel admission         | 201                                     | Cancellation of Admission (Inpatient)       |
| proc_type_6     | Cancel admission         | 200                                     | Cancellation of Admission (A&E)             |
| proc_type_7     | Cancel discharge         | 21*                                     | Cancellation of Discharges                  |
| proc_type_7     | Cancel discharge         | 35*                                     | Cancellation of A&E Discharge               |
| proc_type_8     | Cancel transfer          | 220                                     | Cancellation of Transfer out                |
| proc_type_8     | Cancel transfer          | 230                                     | Cancellation of Trial Discharge             |
| proc_type_8     | Cancel transfer          | 240                                     | Cancellation of return from Trial Discharge |
| proc_type_8     | Cancel transfer          | 710                                     | Cancellation of Bed Assignment              |
| proc_type_9     | Merge patient            | 020                                     | Merge HKID                                  |
| proc_type_010   | Patient registration     | 010                                     | PMI Registration                            |
| proc_type_031   | Change patient           | 031                                     | Change HKID                                 |
| proc_type_I     | Move episode             | 040                                     | Move episodes                               |
| proc_type_X     | Set patient deceased     | 033                                     | Update Death Indicator                      |
| proc_type_Y     | Set patient confidential | 034                                     | Update Confidentially                       |

**IOI Log**

Hosp gateway testioi/prodioi account

/appl/lis/home2/testioi/work/laps_restart.log

/appl/lis/home2/testioi/work/laps.out

Reference Doc: \dc7shdns04b\CP3_LIS_ECPATH_STORE\Regression Testing\Sybase_16_upgrade\CMC\IOI  In-Out Patient Interface (CMC) sybase16.docx

![image.png](IOI.assets/image%20(6).png)

---

### COMT-225

As a labuser, I suppose the patient record need to be up-to-date in HA environment,

so that I can use the updated patient data to create the request.

**Action function: proc_type_1**

1. Invoke the function "**change_demo**" .
2. Check the return value of "**change_demo**".
3. If the return value is 100, print a debug message indicating that the patient was not found and call the function "**pmi_registration**".

**proc_type_1=>change_demo**

1. If no deadlock, it will invoke **change_demo_wo_tran**.
2. If the deadlock_flag is set:
    - Print an error message indicating a deadlock occurred.
    - Flush the output buffer to ensure the message is displayed.
    - Pause execution for 1 second using the "sleep" function.
    - Continue to the next iteration.

**change_demo** => **change_demo_wo_tran**

1. Start a transaction to ensure data consistency during the update process.
2. Retrieve active encounter from DB.
3. If the "in_prog_id" parameter is zero, cancel the transaction and return without making any changes.
4. Iterate through the active encounter and perform the following steps for each encounter:
    - Retrieve patient details for the specified encounter.
    - Copy relevant information from external sources to local variables.
    - Check if a patient demographic already exists for the given encounter and CPI key. If it does, skip the update process for this encounter.
    - If necessary, update the patient's medical record number (MRN) based on specific conditions.
    - Update the patient's name, Chinese name, date of birth, and sex if the corresponding fields are available in the external source.
    - Handle special cases based on defined macros and perform additional updates if required.
    - Compare the updated patient's name, sex, and date of birth with the previous values.
    - Print debug messages if any of these fields have changed.
    - If the patient has a modified MRN and is in a specific encounter type "SOPD", update the patient's bed information.
    - Perform SQL updates on the patient database table with the modified patient information.
5. Commit the transaction if all updates are successful.
6. If a deadlock occurs during the transaction, roll back the changes and set a deadlock flag.
7. Return appropriate values to indicate the success or failure of the update process.

**change_demo** => **pmi_registration**

1. If no deadlock, it will invoke **pmi_registration_wo_tran**.
2. If the deadlock_flag is set:
    - Print an error message indicating a deadlock occurred.
    - Flush the output buffer to ensure the message is displayed.
    - Pause execution for 1 second using the "sleep" function.
    - Continue to the next iteration.

**pmi_registration_wo_tran**

- It initializes variables and arrays, including ret_out, PID and ENCOUNTER.
- The function performs some initialization and prints a debug message.
- It begins a transaction and retrieves active patient encounters using the **get_all_active_enc** function.
- If a deadlock occurs during the transaction, the function rolls back the transaction, sets a deadlock flag, and returns fail.
- It then iterates over the active encounters, comparing them with a specific condition.
- If a match is found, the function rolls back the transaction, prints a debug message, and calls the **change_demo** function with in_prog_id as an argument.
- If in_prog_id is 0, the function rolls back the transaction and returns 0.
- If the **check_pid** function fails to find a valid PID for in_prog_id, the function will use old number if ID already exists and assign a new number if ID not exists with no deadlock errors.
- It calls the **get_set_ctr** function with specific arguments and checks for deadlock errors.
- The function formats the ENCOUNTER array and performs additional operations.
- Depending on the outcome of the registration process, the function returns either 0 or 1.

**List of information in** **proc_type_1**

| **Function involve**                                                                                                                                                                                                                                                                                                                                                                                                      | **Table to be updated**                                    | **Patient column to be updated**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | **Table column to be insert**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| change_demo  <br/>change_demo_wo_tran  <br/>check_patient_demo_ex  <br/>pmi_registration  <br/>pmi_registration_wo_tran  <br/>convert_IPAS_to_LIS  <br/>copy_patient_demo  <br/>check_insert_opcode  <br/>get_all_active_enc  <br/>get_patient_details  <br/>check_pid  <br/>get_set_ctr  <br/>set_action_info  <br/>set_patient_ind  <br/>convert_mrn_to_bed  <br/>insert_patient_rec  <br/>write_amend_log(CHANGE_DEMO) | patient  <br/>global_ctr  <br/>office  <br/>patient_pmi_ex | pat_name (change_demo_wo_tran)  <br/>pat_cname (change_demo_wo_tran)  <br/>pat_dob (change_demo_wo_tran)  <br/>pat_exact_dob_flag (change_demo_wo_tran)  <br/>pat_sex (change_demo_wo_tran)  <br/>pat_address (change_demo_wo_tran)  <br/>pat_race (change_demo_wo_tran)  <br/>pat_update_date (change_demo_wo_tran)  <br/>pat_update_by (change_demo_wo_tran)  <br/>pat_update_ws (change_demo_wo_tran)  <br/>pat_bed (change_demo_wo_tran)  <br/>pat_ward_classpat_bed (if encounter like SOPD) (change_demo_wo_tran)  <br/>ctr_value (in global_ctr)  <br/>   <br/>(function: check_patient_demo_ex)  <br/>pmi_pid  <br/>pmi_name  <br/>pmi_sex   <br/>pmi_dob  <br/>status_datetime | (function: check_insert_opcode)  <br/>office_ckey  <br/>office_deleted  <br/>office_type  <br/>office_specialty  <br/>office_alpha  <br/>office_name  <br/>office_delivery  <br/>office_tag  <br/>office_category  <br/>office_urgency  <br/>office_reporting  <br/>office_hosp_code  <br/>office_printer_code  <br/>office_patient_category  <br/>office_clt  <br/>   <br/>(function: insert_patient_rec)  <br/>pat_encounter  <br/>pat_pid  <br/>pat_name  <br/>pat_sex  <br/>pat_dob  <br/>pat_create_date  <br/>pat_create_by  <br/>pat_update_date  <br/>pat_update_by  <br/>pat_create_ws  <br/>pat_update_ws  <br/>pat_address  <br/>pat_encounter_group  <br/>pat_pid_group  <br/>pat_active_encounter  <br/>pat_race  <br/>pat_mrn  <br/>pat_cname  <br/>pat_hospital  <br/>pat_exact_dob_flag  <br/>pat_ward_class  <br/>   <br/>(function: check_patient_demo_ex)  <br/>encounter_group  <br/>pmi_pid  <br/>pmi_name  <br/>pmi_sex  <br/>pmi_dob  <br/>create_datetime  <br/>status  <br/>status_datetime |







**Action function: proc_type_2**

1. It invokes the **change_demo** function with the "in_prog_id" parameter.
2. It checks if there are immediate cancellation records by calling the **check_ahead** function to ignore immediate cancelation records.

If there are no immediate cancellation records, it increments the "rec_no" variable and returns 0.

3. If there are immediate cancellation records, it calls the **patient_adm** function with the "in_prog_id" parameter and assigns the return value to ret_in.
4. If "ret_in" is non-zero, it prints an error message indicating a patient admission error using printf.
5. The function will return the value of "ret_in" at last.

**proc_type_2****=>change_demo =>** **change_demo_wo_tran**

- like proc_type_2 invokes **change_demo** and **change_demo_wo_tran**

**check_ahead**

1. If the value of rec_no is greater than or equal to MAX_TRANSACTION, or if ind_cpi_transaction_type[rec_no+1] is -1, the function returns 1 to indicate that immediate cancellation records should be ignored.
2. If the values of cpi_hkid[rec_no] and cpi_hkid[rec_no+1] are the same, and the values of cpi_case_no[rec_no] and cpi_case_no[rec_no+1] are the same, the function checks if cpi_transaction_type[rec_no+1] starts with "201" or "200" using the memcmp function. If either condition is true, the function returns 0 to indicate that immediate cancellation records should not be ignored.
3. If none of the above conditions are met, the function returns 1 to indicate that immediate cancellation records should be ignored.

**patient_adm => patient_adm_wo_tran**

1. If no deadlock, it will invoke **patient_adm_wo_tran**.
2. If the deadlock_flag is set:
    - Print an error message indicating a deadlock occurred.
    - Flush the output buffer to ensure the message is displayed.
    - Pause execution for 1 second using the "sleep" function.
    - Continue to the next iteration.

**patient_adm_wo_tran**

1. Copy values from cpi_hkid[rec_no] and cpi_case_no[rec_no] arrays to PID and ENCOUNTER arrays respectively.
2. Check if the encounter number already exists:
    - If it exists and the patient with the same encounter and different ID also exists, return an error (1).
    - If a deadlock occurs, rollback the transaction and return -1.
3. If in_prog_id is 0, rollback the transaction and return 0.
4. Check if the patient ID exists, use old number if ID already exists, assign a new number if ID not exists:
    - If it doesn't exist and a deadlock occurs, rollback the transaction and return -1.
    - Determine the party based on in_prog_id and use the get_set_ctr function to retrieve or set the patient group.
5. Check if the patient encounter exists, use old Encounter Group if Encounter already exists, assign a new number if Encounter does not exist
    - If it doesn't exist and a deadlock occurs, rollback the transaction and return -1.
    - Determine the party based on in_prog_id and use the get_set_ctr function to retrieve or set the encounter group.
6. Perform various operations to convert and manipulate patient data.
7. Insert the patient record:
    - If successful, perform additional operations, commit the transaction, and return 0.
    - If a deadlock occurs, rollback the transaction and return -1.
    - If an error occurs, print an error message, rollback the transaction, and return 1.

**List of information in** **proc_type_2**

| **Function involve**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | **Table to be updated**      | **Patient column to be update**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | **Patient column to be insert**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| change_demo  <br/>change_demo_wo_tran  <br/>check_ahead  <br/>get_all_active_enc  <br/>get_patient_details  <br/>clear_amend_rec  <br/>copy_amend_rec  <br/>convert_IPAS_name  <br/>check_patient_demo_ex  <br/>init_datetime  <br/>set_action_info  <br/>set_patient_ind  <br/>patient_adm  <br/>patient_adm_wo_tran  <br/>set_action_info  <br/>set_patient_ind  <br/>check_encounter  <br/>check_pid  <br/>convert_IPAS_to_LIS  <br/>convert_mrn_to_bed  <br/>insert_patient_rec  <br/>update_pid_check(CHANGE_DEMO)  <br/>write_amend_log(CHANGE_DEMO)  <br/>write_amend_log(PATIENT_ADM) | patient  <br/>patient_pmi_ex | pat_encounter (change_demo_wo_tran, insert_patient_rec)  <br/>pat_pid (change_demo_wo_tran, insert_patient_rec)  <br/>pat_name (change_demo_wo_tran, insert_patient_rec)  <br/>pat_sex (change_demo_wo_tran, insert_patient_rec)  <br/>pat_dob (change_demo_wo_tran, insert_patient_rec)  <br/>pat_att_dr (change_demo_wo_tran, insert_patient_rec)  <br/>pat_adm_date (change_demo_wo_tran, insert_patient_rec)  <br/>pat_location (change_demo_wo_tran, insert_patient_rec)  <br/>pat_bed (change_demo_wo_tran, insert_patient_rec)  <br/>pat_unit (change_demo_wo_tran, insert_patient_rec)  <br/>pat_cat (change_demo_wo_tran, insert_patient_rec)  <br/>pat_update_date (change_demo_wo_tran, insert_patient_rec)  <br/>pat_update_by (change_demo_wo_tran, insert_patient_rec)  <br/>pat_update_ws (change_demo_wo_tran, insert_patient_rec)  <br/>pat_address (change_demo_wo_tran, insert_patient_rec)  <br/>pat_encounter_group (change_demo_wo_tran, insert_patient_rec)  <br/>pat_pid_group (change_demo_wo_tran, insert_patient_rec)  <br/>pat_active_encounter (change_demo_wo_tran, insert_patient_rec)  <br/>pat_race (change_demo_wo_tran, insert_patient_rec)  <br/>pat_mrn (change_demo_wo_tran, insert_patient_rec)  <br/>pat_cname (change_demo_wo_tran, insert_patient_rec)  <br/>pat_death (change_demo_wo_tran, insert_patient_rec)  <br/>pat_death_date (change_demo_wo_tran, insert_patient_rec)  <br/>pat_hospital (change_demo_wo_tran, insert_patient_rec)  <br/>pat_exact_dob_flag (change_demo_wo_tran, insert_patient_rec)  <br/>pat_type (change_demo_wo_tran, insert_patient_rec)  <br/>pat_ward_class (change_demo_wo_tran, insert_patient_rec)  <br/>pat_bed (if encounter like SOPD) (change_demo_wo_tran)  <br/>   <br/>(function: check_patient_demo_ex)  <br/>pmi_pid  <br/>pmi_name  <br/>pmi_sex   <br/>pmi_dob  <br/>status_datetime | (function: insert_patient_rec)  <br/>pat_encounter  <br/>pat_pid  <br/>pat_name  <br/>pat_sex  <br/>pat_dob  <br/>pat_att_dr  <br/>pat_adm_date  <br/>pat_location  <br/>pat_bed  <br/>pat_unit  <br/>pat_cat  <br/>pat_create_date  <br/>pat_create_by  <br/>pat_update_date  <br/>pat_update_by  <br/>pat_create_ws  <br/>pat_update_ws  <br/>pat_address  <br/>pat_discharge_date  <br/>pat_encounter_group  <br/>pat_pid_group  <br/>pat_active_encounter  <br/>pat_race  <br/>pat_mrn  <br/>pat_cname  <br/>pat_death  <br/>pat_confidential  <br/>pat_death_date  <br/>pat_hospital  <br/>pat_exact_dob_flag  <br/>pat_discharge_code  <br/>pat_typepat_ward_class  <br/>   <br/>(function: check_patient_demo_ex)  <br/>encounter_group  <br/>pmi_pid  <br/>pmi_name  <br/>pmi_sex  <br/>pmi_dob  <br/>create_datetime  <br/>status  <br/>status_datetime |

**List of information in** **proc_type_3**

| **Function involve**                                                                                                                                                                                                                   | **Table to be updated** | **Patient column to be update**                                                                                                                                                                                                                                                     |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| change_adm  <br/>get_patient_details  <br/>clear_amend_rec  <br/>copy_amend_rec  <br/>convert_mrn_to_bed (if encounter = SOPD)  <br/>set_action_info  <br/>set_patient_ind  <br/>add_hospital_prefix  <br/>write_amend_log(CHANGE_ADM) | patient                 | pat_adm_date (change_adm)  <br/>pat_type (change_adm)  <br/>pat_update_date (change_adm)  <br/>pat_update_by (change_adm)  <br/>pat_update_ws (change_adm)  <br/>pat_location (change_adm)  <br/>pat_unit (change_adm)  <br/>pat_bed (change_adm)  <br/>pat_ward_class (change_adm) |

**List of information in** **proc_type_4**

| **Function involve**                                                                                                                                                                                                             | **Table to be updated** | **Patient column to be update**                                                                                                                                                                                                                                                                                                            |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| internal_transfer  <br/>get_patient_details  <br/>clear_amend_rec  <br/>copy_amend_rec  <br/>set_action_info  <br/>set_patient_ind  <br/>transfer_patient_rec  <br/>add_hospital_prefix  <br/>write_amend_log(INTERNAL_TRANSFER) | patient                 | pat_update_date (transfer_patient_rec)  <br/>pat_location (transfer_patient_rec)  <br/>pat_bed (transfer_patient_rec)  <br/>pat_unit (transfer_patient_rec)  <br/>pat_ward_class (transfer_patient_rec)  <br/>pat_update_date (transfer_patient_rec)  <br/>pat_update_by (transfer_patient_rec)  <br/>pat_update_ws (transfer_patient_rec) |

**List of information in** **proc_type_5**

| **Function involve**                                                                                                                           | **Table to be updated** | **Patient column to be update**                                                                                                                                                           |
| ---------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| discharge_pat  <br/>get_patient_details  <br/>set_action_info  <br/>set_action_info  <br/>clear_amend_rec  <br/>write_amend_log(DISCHARGE_PAT) | patient                 | pat_update_date (discharge_pat)  <br/>pat_discharge_date (discharge_pat)  <br/>pat_discharge_code (discharge_pat)  <br/>pat_update_by (discharge_pat)  <br/>pat_update_ws (discharge_pat) |

**List of information in** **proc_type_6**

| **Function involve**                                                                                                                                                                                                                            | **Table to be updated**  | **Patient column to be update**                                                                                                                                                                                                                                                        |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| cancel_adm  <br/>get_patient_details  <br/>check_patient_request  <br/>right_trim  <br/>get_set_ctr  <br/>pad_char  <br/>cancel_patient_rec  <br/>set_action_info  <br/>set_patient_ind  <br/>clear_amend_rec  <br/>write_amend_log(CANCEL_ADM) | patient  <br/>global_ctr | ctr_value (get_set_ctr)  <br/>pat_encounter (cancel_patient_rec)  <br/>pat_active_encounter (cancel_patient_rec)  <br/>pat_update_date (cancel_patient_rec)  <br/>pat_update_by (cancel_patient_rec)  <br/>pat_update_ws (cancel_patient_rec)  <br/>pat_pid_group (cancel_patient_rec) |

**List of information in** **proc_type_7**

| **Function involve**                                                                                                           | **Table to be updated** | **Patient column to be update**                                                                                                                                                                          |
| ------------------------------------------------------------------------------------------------------------------------------ | ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| cancel_discharge  <br/>get_patient_details  <br/>set_action_info  <br/>set_patient_ind  <br/>write_amend_log(CANCEL_DISCHARGE) | patient                 | pat_discharge_date (cancel_discharge)  <br/>pat_discharge_code (cancel_discharge)  <br/>pat_update_date (cancel_discharge)  <br/>pat_update_by (cancel_discharge)  <br/>pat_update_ws (cancel_discharge) |

**List of information in** **proc_type_8**

| **Function involve**                                                                                                                                                                                                                                   | **Table to be updated** | **Patient column to be update**                                                                                                                                                                                                                                                                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| cancel_transfer  <br/>internal_transfer  <br/>get_patient_details  <br/>clear_amend_rec  <br/>copy_amend_rec  <br/>set_action_info  <br/>set_patient_ind  <br/>transfer_patient_rec  <br/>add_hospital_prefix  <br/>write_amend_log(INTERNAL_TRANSFER) | patient                 | pat_update_date (transfer_patient_rec)  <br/>pat_location (transfer_patient_rec)  <br/>pat_bed (transfer_patient_rec)  <br/>pat_unit (transfer_patient_rec)  <br/>pat_ward_class (transfer_patient_rec)  <br/>pat_update_date (transfer_patient_rec)  <br/>pat_update_by (transfer_patient_rec)  <br/>pat_update_ws (transfer_patient_rec) |

**List of information in** **proc_type_9**

| **Function involve**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | **Table to be updated**                                                                        | **Patient column to be update**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | **Table column to be insert**                                                                                                                                                                                                                                                                                                       |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| merge_pid  <br/>check_pid  <br/>get_all_enc  <br/>change_pid  <br/>set_pid_check_rec  <br/>get_patient_details  <br/>convert_mrn_to_bed(SOPD)  <br/>set_action_info  <br/>write_amend_log(MERGE_PID)  <br/>cancel_patient_rec  <br/>insert_patient_rec  <br/>write_amend_log(MERGE_PID)  <br/>update_pid_check  <br/>   <br/>change_demo  <br/>change_demo_wo_tran  <br/>get_all_active_enc  <br/>convert_IPAS_name  <br/>check_patient_demo_ex  <br/>convert_mrn_to_bed  <br/>set_action_info  <br/>set_patient_ind  <br/>write_amend_log(CHANGE_DEMO) | Patient  <br/>lis_patient (update_pid_group)crs_request (update_pid_group,  <br/>UCH APS only) | pat_pid_group (merge_pid)  <br/>pat_update_date (merge_pid)  <br/>pat_update_by (merge_pid)  <br/>pat_update_ws (merge_pid)  <br/>lispat_pid_group (update_pid_group)  <br/>req_pid_group (update_pid_group, UCH APS only)  <br/>   <br/>pat_mrn (change_demo_wo_tran)  <br/>pat_name (change_demo_wo_tran)  <br/>pat_cname (change_demo_wo_tran)  <br/>pat_dob (change_demo_wo_tran)  <br/>pat_exact_dob_flag (change_demo_wo_tran)  <br/>pat_sex (change_demo_wo_tran)  <br/>pat_address (change_demo_wo_tran)  <br/>pat_race (change_demo_wo_tran)  <br/>pat_bed (change_demo_wo_tran)  <br/>pat_update_date (change_demo_wo_tran)  <br/>pat_update_by (change_demo_wo_tran)  <br/>pat_update_ws (change_demo_wo_tran)  <br/>pat_ward_class (change_demo_wo_tran) | encounter_group (check_patient_demo_ex)  <br/>pmi_pid (check_patient_demo_ex)  <br/>pmi_name (check_patient_demo_ex)  <br/>pmi_sex (p check_patient_demo_ex)  <br/>pmi_dob (check_patient_demo_ex)  <br/>create_datetime (check_patient_demo_ex)  <br/>status (check_patient_demo_ex)  <br/>status_datetime (check_patient_demo_ex) |

**List of information in** **proc_type_010**

| **Function involve**                                                                                                                                                                                                                                                                                                                                                                      | **Table to be updated** | **Patient column to be update**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | **Table column to be insert**                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| pmi_registration  <br/>pmi_registration_wo_tran  <br/>get_all_active_enc  <br/>change_demo  <br/>change_demo_wo_tran  <br/>check_pid  <br/>get_set_ctr  <br/>set_action_info  <br/>set_patient_ind  <br/>clear_patient_rec  <br/>convert_IPAS_name  <br/>copy_patient_demo  <br/>set_action_info  <br/>convert_mrn_to_bed  <br/>insert_pmi_patient_rec  <br/>write_amend_log(PATIENT_ADM) | global_ctrpatient       | ctr_value (get_set_ctr)  <br/>   <br/>pat_mrn (change_demo_wo_tran)  <br/>pat_name (change_demo_wo_tran)  <br/>pat_cname (change_demo_wo_tran)  <br/>pat_dob (change_demo_wo_tran)  <br/>pat_exact_dob_flag (change_demo_wo_tran)  <br/>pat_sex (change_demo_wo_tran)  <br/>pat_address (change_demo_wo_tran)  <br/>pat_race (change_demo_wo_tran)  <br/>pat_bed (change_demo_wo_tran)  <br/>pat_update_date (change_demo_wo_tran)  <br/>pat_update_by (change_demo_wo_tran)  <br/>pat_update_ws (change_demo_wo_tran)  <br/>pat_ward_class (change_demo_wo_tran) | (function: insert_patient_rec)  <br/>pat_encounter  <br/>pat_pid  <br/>pat_name  <br/>pat_sex  <br/>pat_dob  <br/>pat_create_date  <br/>pat_create_by  <br/>pat_update_date  <br/>pat_update_by  <br/>pat_create_ws  <br/>pat_update_ws  <br/>pat_address  <br/>pat_encounter_group  <br/>pat_pid_group  <br/>pat_active_encounter  <br/>pat_race  <br/>pat_mrn  <br/>pat_cname  <br/>pat_hospital  <br/>pat_exact_dob_flag  <br/>pat_ward_class |

**List of information in** **proc_type_031**

| **Function involve**                                                                                                                                                                                                                                                                                                                                                                                         | **Table to be updated**  | **Patient column to be update**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | **Table column to be insert**                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| change_pid  <br/>check_pid  <br/>merge_pid  <br/>get_all_enc  <br/>get_set_ctr  <br/>get_all_active_enc  <br/>get_patient_details  <br/>cancel_patient_rec  <br/>convert_mrn_to_bed  <br/>insert_patient_rec  <br/>write_amend_log(CHANGE_PID)  <br/>update_pid_check(CHANGE_PID)  <br/>write_amend_log(MERGE_PID)  <br/>   <br/>change_demo (like proc_type_2)  <br/>change_demo_wo_tran (like proc_type_2) | global_ctr  <br/>patient | ctr_value (get_set_ctr)  <br/>pat_pid_group (merge_pid, insert_patient_rec)  <br/>pat_update_date (merge_pid, cancel_patient_rec, insert_patient_rec)  <br/>pat_update_by (merge_pid, cancel_patient_rec, insert_patient_rec)  <br/>pat_update_ws (merge_pid, cancel_patient_rec, insert_patient_rec)  <br/>pat_encounter (cancel_patient_rec, insert_patient_rec)  <br/>pat_active_encounter (cancel_patient_rec, insert_patient_rec)  <br/>pat_mrn (insert_patient_rec)  <br/>pat_pid (insert_patient_rec)  <br/>pat_name (insert_patient_rec)  <br/>pat_sex (insert_patient_rec)  <br/>pat_dob (insert_patient_rec)  <br/>pat_att_dr (insert_patient_rec)  <br/>pat_adm_date (insert_patient_rec)  <br/>pat_location (insert_patient_rec)  <br/>pat_bed (insert_patient_rec)  <br/>pat_unit (insert_patient_rec)  <br/>pat_cat (insert_patient_rec)  <br/>pat_address (insert_patient_rec)  <br/>pat_encounter_group (insert_patient_rec)  <br/>pat_race (insert_patient_rec)  <br/>pat_cname (insert_patient_rec)  <br/>pat_death (insert_patient_rec)  <br/>pat_death_date (insert_patient_rec)  <br/>pat_hospital (insert_patient_rec)  <br/>pat_exact_dob_flag (insert_patient_rec)  <br/>pat_type (insert_patient_rec)  <br/>pat_ward_class (insert_patient_rec) | (function: insert_patient_rec)  <br/>pat_encounter  <br/>pat_pid  <br/>pat_name  <br/>pat_sex  <br/>pat_dob  <br/>pat_create_date  <br/>pat_create_by  <br/>pat_update_date  <br/>pat_update_by  <br/>pat_create_ws  <br/>pat_update_ws  <br/>pat_address  <br/>pat_encounter_group  <br/>pat_pid_group  <br/>pat_active_encounter  <br/>pat_race  <br/>pat_mrn  <br/>pat_cname  <br/>pat_hospital  <br/>pat_exact_dob_flag  <br/>pat_ward_class |

**List of information in** **proc_type_I**

| **Function involve**                                                                                                                                                                                                                                                                                                                                            | **Table to be updated**                                      | **Patient column to be update**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | **Table column to be insert**                                                                                                                                                                                                                                                                                                                                                                                                                    |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| move_episode  <br/>check_patient  <br/>check_pid  <br/>clear_patient_rec  <br/>get_patient_details  <br/>get_set_ctr  <br/>cancel_patient_rec  <br/>insert_patient_rec  <br/>write_amend_log(MERGE_CASE)        update_pid_check(MERGE_CASE)  <br/>convert_mrn_to_bed  <br/>   <br/>change_demo (like proc_type_2)  <br/>change_demo_wo_tran (like proc_type_2) | global_ctr  <br/>patient  <br/>lis_patient  <br/>crs_request | ctr_value (get_set_ctr)  <br/>pat_encounter (cancel_patient_rec, insert_patient_rec)  <br/>pat_active_encounter (cancel_patient_rec, insert_patient_rec)  <br/>pat_update_date (cancel_patient_rec, insert_patient_rec)  <br/>pat_update_by (cancel_patient_rec, insert_patient_rec)  <br/>pat_update_ws (cancel_patient_rec, insert_patient_rec)  <br/>pat_pid_group (cancel_patient_rec, insert_patient_rec)  <br/>pat_mrn (insert_patient_rec)  <br/>pat_pid (insert_patient_rec)  <br/>pat_name (insert_patient_rec)  <br/>pat_sex (insert_patient_rec)  <br/>pat_dob (insert_patient_rec)  <br/>pat_att_dr  <br/>(insert_patient_rec)  <br/>pat_adm_date  <br/>(insert_patient_rec)  <br/>pat_location  <br/>(insert_patient_rec)  <br/>pat_bed  <br/>(insert_patient_rec)  <br/>pat_unit  <br/>(insert_patient_rec)  <br/>pat_cat  <br/>(insert_patient_rec)  <br/>pat_address  <br/>(insert_patient_rec)  <br/>pat_encounter_group  <br/>(insert_patient_rec)  <br/>pat_race  <br/>(insert_patient_rec)  <br/>pat_cname  <br/>(insert_patient_rec)  <br/>pat_death  <br/>(insert_patient_rec)  <br/>pat_death_date  <br/>(insert_patient_rec)  <br/>pat_hospital  <br/>(insert_patient_rec)  <br/>pat_exact_dob_flag  <br/>(insert_patient_rec)  <br/>pat_type  <br/>(insert_patient_rec)  <br/>pat_ward_class  <br/>(insert_patient_rec)  <br/>lispat_pid_group (update_pid_group)  <br/>req_pid_group (update_pid_group)  <br/>pat_mrn (get_and_update_mrn) | (function: insert_patient_rec)  <br/>pat_encounter  <br/>pat_pid  <br/>pat_name  <br/>pat_sex  <br/>pat_dob  <br/>pat_create_date  <br/>pat_create_by  <br/>pat_update_date  <br/>pat_update_by  <br/>pat_create_ws  <br/>pat_update_ws  <br/>pat_address  <br/>pat_encounter_group  <br/>pat_pid_group  <br/>pat_active_encounter  <br/>pat_race  <br/>pat_mrn  <br/>pat_cname  <br/>pat_hospital  <br/>pat_exact_dob_flag  <br/>pat_ward_class |

**List of information in** **proc_type_X**

| **Function involve**                                                                                                                           | **Table to be updated**      | **Patient column to be update**                                                                                                                                                                                                                                                                                                                                                     | **Table column to be insert**                                                                                                                                                                                                                                                                                                       |
| ---------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| set_pat_death  <br/>get_all_active_enc  <br/>right_trim  <br/>check_patient_demo_ex  <br/>clear_amend_rec  <br/>write_amend_log(DISCHARGE_PAT) | patient_pmi_ex  <br/>patient | pmi_pid (check_patient_demo_ex)  <br/>pmi_name (check_patient_demo_ex)  <br/>pmi_sex (check_patient_demo_ex)  <br/>pmi_dob (check_patient_demo_ex)  <br/>status_datetime (check_patient_demo_ex)  <br/>pat_death_date (set_pat_death)  <br/>pat_death (set_pat_death)  <br/>pat_update_date (set_pat_death)  <br/>pat_update_by (set_pat_death)  <br/>pat_update_ws (set_pat_death) | encounter_group (check_patient_demo_ex)  <br/>pmi_pid (check_patient_demo_ex)  <br/>pmi_name (check_patient_demo_ex)  <br/>pmi_sex (p check_patient_demo_ex)  <br/>pmi_dob (check_patient_demo_ex)  <br/>create_datetime (check_patient_demo_ex)  <br/>status (check_patient_demo_ex)  <br/>status_datetime (check_patient_demo_ex) |

**List of information in** **proc_type_Y**

| **Function involve**                                                                                                                                                       | **Table to be updated**      | **Patient column to be update**                                                                                                                                                                                                                                                                                                                           | **Table column to be insert**                                                                                                                                                                                                                                             |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| set_pat_confid  <br/>set_action_info  <br/>set_patient_ind  <br/>get_all_active_enc  <br/>check_patient_demo_ex  <br/>clear_amend_rec  <br/>write_amend_log(DISCHARGE_PAT) | patient_pmi_ex  <br/>patient | pat_confidential (set_pat_confid)  <br/>pat_update_date (set_pat_confid)  <br/>pat_update_by (set_pat_confid)  <br/>pat_update_ws (set_pat_confid)  <br/>pmi_pid (check_patient_demo_ex)  <br/>pmi_name (check_patient_demo_ex)  <br/>pmi_sex (check_patient_demo_ex)  <br/>pmi_dob (check_patient_demo_ex)  <br/>status_datetime (check_patient_demo_ex) | encounter_group (patient_pmi_ex)  <br/>pmi_pid (patient_pmi_ex)  <br/>pmi_name (patient_pmi_ex)  <br/>pmi_sex (patient_pmi_ex)  <br/>pmi_dob (patient_pmi_ex)  <br/>create_datetime (patient_pmi_ex)  <br/>status (patient_pmi_ex)  <br/>status_datetime (patient_pmi_ex) |

