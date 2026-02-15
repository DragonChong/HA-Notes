# lis-patient-svc

1. **getHkpmiPatientbyEnc**
    - Original Stored Procedure: lis_sp_pat_remote_pmi_by_enc2
    - Registration
        - Input Encounter No.

![image.png](Patient/lis-patient-svc/lis-patient-svc.assets/image.png)

    - Specimen Acknowledgement
        - Order Retrieval (Patient does not exist in DB)
1. **getHkpmiPatientListbyHkid**
    - Original Stored Procedure: lis_sp_pat_remote_demo_by_pid
    - Registration
        - Input HKID
        - Click "Generate Computer Encounter"

![image.png](Patient/lis-patient-svc/lis-patient-svc.assets/image%20(2).png)

1. **getHkpmiCaseListbyHkid**
    - Original Stored Procedure: lis_sp_pat_remote_pmi_by_pid2
    - Registration
        - Input HKID
        - Click PMI List

![image.png](Patient/lis-patient-svc/lis-patient-svc.assets/image%20(3).png)

1. **updatePatientFromPMI**
    - Original Stored Procedure: lis_sp_pat_upd_enc_by_pmi1
    - Specimen Acknowledgement
        - Patient Demographic Discrepancy (Patient name, sex, dob, hkid) during registration
    - Logic
        - Retrieve patient by PMI (By Encounter / HKID)
        - Insert patient_pmi_ex

            Update local created data with PAS only

            if the following major keys matched:

            1. HKID
            2. English Name
            3. DOB
            4. Sex
            5. Chinese Name
        - If HKID change
            - calls movePatientEpisode
            - Insert pid_check
        - Update patient
1. **movePatientEpisode**
    - Original Stored Procedure: lis_sp_pat_move_episode1
    - PID Amendment
    - Logic
        - Update existing patient to cancel
        - Insert new patient
        - Insert pat_amend_log
        - update pid grp for requests