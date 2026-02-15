# Clarification

- Discharge Code
    - Original
        - Transaction Type
        - e.g. 339
    - New
        - Subscription by Event, No Transaction Type
        - Only discharge_code from event (e.g. 9)
    - Existing Logic
        - DhDirectPrintService#getPrintChannelByPatientLocation
            - dh_pdf_tasklist (DHX?)
            - AE encounter, Check if Discharge Code = "9"
            - 
        - PatientService#isDischargedToWardAeCase
            - AE encounter, Check if Discharge Code = "339"
                - Get next encounter by hkid & admission date
                - `SELECT o from Patient o WHERE o.patPidGroup = :hkidKey AND o.patAdmDate > :admissionDate ORDER BY o.patAdmDate ASC`
            - Used by CRAS Alert, Report Printing
    - Possible values

![{19EAF5B2-4348-4C58-A9B5-019DE36AD1BC}.png]({19EAF5B2-4348-4C58-A9B5-019DE36AD1BC}.png)

- Determination of confidential (034 [A08])
    - pmi_access_code (IOI)
- pat_amend_log action code (enhance lis-patient-svc move episode API)
    - Change PID
    - Merge PID
    - Move Episode
- Which database to update patient
    - BBH
    - read hospital_servername from hospital?
    - 

