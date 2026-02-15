# RRC Revamp Design

## Revamped Flowchart

```bash
flowchart LR
    subgraph External["External System"]
            DH["DH System"]
    end
    subgraph Internal["HA"]
            WS("DhxEaiInsertion <br> WebService")
            INT_DB[("INT Database")]
            SCH_SVC("lis-schedule-svc")
            RRC_SVC("lis-dhx-rrc-svc")
            PAT_SVC("lis-patient-svc")
            REQ_SVC("lis-request-svc")
            CRS_DB[("CRS Database")]
    end
    DH --> WS
    WS --> INT_DB
    SCH_SVC -- Trigger--> RRC_SVC
    RRC_SVC -- Retrieve Outstanding Records --> INT_DB
    RRC_SVC -- Retrieve PMI Patient --> PAT_SVC
    RRC_SVC -- Register/Wipeout Request --> REQ_SVC
    REQ_SVC -- Insert/Delete Request --> CRS_DB

    classDef external fill:#ffebee,stroke:#f44336,stroke-width:2px,color:#000
    classDef internal fill:#e3f2fd,stroke:#2196f3,stroke-width:2px,color:#000
    classDef webservice fill:#e8f5e8,stroke:#4caf50,stroke-width:2px,color:#000
    classDef database fill:#fff3e0,stroke:#ff9800,stroke-width:2px,color:#000
    classDef service fill:#f3e5f5,stroke:#9c27b0,stroke-width:2px,color:#000

    class DH external
    class WS webservice
    class INT_DB,CRS_DB database
    class RRC_SVC,PAT_SVC,REQ_SVC,SCH_SVC service
```

### Flowchart Diagram

This flowchart illustrates the core processing loop within the Spring Boot application, replacing the `rrc_process()` function.

```other
---
config:
  theme: mc
---
flowchart TD
    Start((Start)) --> RetrieveOutstanding("Retreive Outstanding Request(s) from INT_9");
    RetrieveOutstanding --> AnyRequest{Any requests?};
    AnyRequest -- No --> End((End));
    AnyRequest -- Yes --> UpdateProcessing("Update Outstanding Request(s) to PROCESSING");
    UpdateProcessing --> LoopRequest[For Each Request];
    LoopRequest --> CheckEdiDhInfo{EDI_DH_INFO <br> exists for the request?};
    CheckEdiDhInfo -- Exist --> GetPatient("Retrieve or Create Patient Record");
    CheckEdiDhInfo -- Not Existed --> MarkRequestInvalid("Mark Request as Invalid");
    MarkRequestInvalid --> GetPatient
    GetPatient --> CheckSendoutReqnoMap{"SENDOOUT_REQ_MAP <br> exists for the request?"}
    CheckSendoutReqnoMap -- Exist --> Wipeout("Wipeout Request")
    CheckSendoutReqnoMap -- Not Existed --> GenReqNo("Generate Request No.")
    
    Wipeout --> CheckLab7;
    GenReqNo --> CheckLab7
    CheckLab7{"Lab 7?"}
    CheckLab7 -- No --> CreateTestResult
    CheckLab7 -- Yes --> GetSpecimen("Get Key from <br> Specimen Type")
    GetSpecimen --> CreateTestResult("Construct TRANS_TESTRSLT_WKT record from EDI_TESTRSLT")
    CreateTestResult --> CreateRequest("Create Request: CRS_REQUEST <br> CRS_REQUEST_DETAIL <br> CRS_REQUEST_COPY_HIST <br> CRS_MB_REQUEST (MBS)")
    CreateRequest --> CreatePdfOrder("Create PDF_ORER")
    CreatePdfOrder --> CreateReportEnquiryCache("Create REPORT_ENQUIRY_CACHE")
    CreateReportEnquiryCache --> CreateSendoutReqnoMap("Create SENDOUT_REQNO_MAP")
    CreateSendoutReqnoMap --> CreateCRSTask("Create CRS Task")
    CreateCRSTask --> Acknowledgement("Create DH_SEND_ACK_TASKLIST");
    Acknowledgement --> UpdateRequestComplete["Update Request Status to Completed (99)"];
    subgraph Transaction Outcome
        direction LR
        Commit{Commit Transaction};
        Rollback{Rollback Transaction};
    end
    UpdateRequestComplete --> Commit;
    subgraph Error Handling
        direction TB
        Exception[Catch Exception] --> UpdateRequestFail["Update Request Status to Error (10)"];
        UpdateRequestFail --> Rollback;
    end
    GetPatient -- DB Error --> Exception;
    CreateTestResult -- DB Error --> Exception;
    Acknowledgement -- DB Error --> Exception;
    Commit --> SendToken[Send CRS Token];
    Rollback --> LoopRequest;
    SendToken --> LoopRequest;
    LoopRequest -- All processed --> End;
    classDef error fill:#f99,stroke:#333,stroke-width:2px;
    class UpdateRequestFail,Rollback error;
```

---

### Sequence Diagram

This diagram shows the interaction between the major components for processing a single request.

```other
sequenceDiagram
    participant Ext as External System
    participant MB as Message Broker
    participant RRC as RRC Spring Boot App
    participant Service as RrcProcessingService
    participant Repo as JPA Repositories
    participant DB as Databases (intdb9, labdb)

    Ext ->>+ MB: Publishes Lab Request Message
    MB ->>+ RRC: Delivers Message
    RRC ->>+ Service: processRequest(message)
    activate Service

    Service ->> Service: Begin @Transactional
    Service ->> Repo: findOutstandingRequest(reqNo)
    activate Repo
    Repo ->> DB: SELECT FROM edi_request WHERE dh_reqno=...
    DB -->> Repo: Returns EDI Request Data
    Repo -->> Service: Returns EdiRequest Entity
    deactivate Repo

    Service ->> Service: Map EDI data to Internal Models
    Service ->> Repo: findPatientByHkid(...) / save(newPatient)
    activate Repo
    Repo ->> DB: SELECT/INSERT on patient table
    DB -->> Repo: Returns Patient Entity
    Repo -->> Service: 
    deactivate Repo

    Service ->> Repo: saveAll(testResults)
    activate Repo
    Repo ->> DB: INSERT INTO crs_request, testrslt, etc.
    DB -->> Repo: 
    Repo -->> Service: 
    deactivate Repo

    Service ->> Repo: updateEdiStatus(reqNo, COMPLETED)
    activate Repo
    Repo ->> DB: UPDATE edi_request SET status=99
    DB -->> Repo: 
    Repo -->> Service: 
    deactivate Repo

    Service ->> Service: Commit Transaction
    Service -->>- RRC: ProcessingResult(SUCCESS)
    deactivate Service

    RRC ->> MB: Publish Acknowledgement Message
    MB ->>- Ext: Delivers Acknowledgement
```

---

# Original Program Flow

1. Update outstanding EDI_REQUEST & EDI_TESTRSLT records to PROCESSING
    - Source System & Request No. Prefix Filtering
1. Retrieve PROCESSING EDI_REQUEST records
2. Check request existence in EDI_DH_INFO
    - Mark request as invalid if request not found
1. Determination of DH Request Prefix & Source System

|         | **Request Prefix** | **Source System** |
| ------- | ------------------ | ----------------- |
| **CPS** | A                  | C                 |
| **HMS** | N                  | N                 |
| **MBS** | M                  | M                 |

1. Update / Insert patient
2. Check existence of request in SENDOUT_REQNO_MAP
    - Wipeout request if found
1. Generate request no. if (4.) not fulfilled
2. Check if specimen type defined in keyword list
    - 25152 if specimen type not specified
    - 25090 if specimen type not defined
1. Construct TRANS_TESTRSLT_WKT record from EDI_TESTRSLT
2. Create request
    - CRS_REQUEST
    - CRS_REQUEST_DETAIL
    - CRS_REQUEST_COPY_HIST
    - CRS_MB_REQUEST (MBS)
1. Create PDF_ORDER record
2. Create REPORT_ENQUIRY_CACHE record
3. Create SENDOUT_REQNO_MAP record
4. Create CRS task

---

## Flowchart

```bash
---
config:
  theme: mc
---
flowchart TD
    Start((Start)) --> RetrieveOutstanding("Retreive Outstanding Request(s) from INT_9");
    RetrieveOutstanding --> AnyRequest{Any requests?};
    AnyRequest -- No --> End((End));
    AnyRequest -- Yes --> UpdateProcessing("Update Outstanding Request(s) to PROCESSING");
    UpdateProcessing --> LoopRequest[For Each Request];
    LoopRequest --> CheckEdiDhInfo{EDI_DH_INFO <br> exists for the request?};
    CheckEdiDhInfo -- Exist --> GetPatient("Retrieve or Create Patient Record");
    CheckEdiDhInfo -- Not Existed --> MarkRequestInvalid("Mark Request as Invalid");
    MarkRequestInvalid --> GetPatient
    GetPatient --> CheckSendoutReqnoMap{"SENDOOUT_REQ_MAP <br> exists for the request?"}
    CheckSendoutReqnoMap -- Exist --> Wipeout("Wipeout Request")
    CheckSendoutReqnoMap -- Not Existed --> GenReqNo("Generate Request No.")
    
    Wipeout --> CheckLab7;
    GenReqNo --> CheckLab7
    CheckLab7{"Lab 7?"}
    CheckLab7 -- No --> CreateTestResult
    CheckLab7 -- Yes --> GetSpecimen("Get Key from <br> Specimen Type")
    GetSpecimen --> CreateTestResult("Construct TRANS_TESTRSLT_WKT record from EDI_TESTRSLT")
    CreateTestResult --> CreateRequest("Create Request: CRS_REQUEST <br> CRS_REQUEST_DETAIL <br> CRS_REQUEST_COPY_HIST <br> CRS_MB_REQUEST (MBS)")
    CreateRequest --> CreatePdfOrder("Create PDF_ORER")
    CreatePdfOrder --> CreateReportEnquiryCache("Create REPORT_ENQUIRY_CACHE")
    CreateReportEnquiryCache --> CreateSendoutReqnoMap("Create SENDOUT_REQNO_MAP")
    CreateSendoutReqnoMap --> CreateCRSTask("Create CRS Task")
    CreateCRSTask --> Acknowledgement("Create DH_SEND_ACK_TASKLIST");
    Acknowledgement --> UpdateRequestComplete["Update Request Status to Completed (99)"];
    subgraph Transaction Outcome
        direction LR
        Commit{Commit Transaction};
        Rollback{Rollback Transaction};
    end
    UpdateRequestComplete --> Commit;
    subgraph Error Handling
        direction TB
        Exception[Catch Exception] --> UpdateRequestFail["Update Request Status to Error (10)"];
        UpdateRequestFail --> Rollback;
    end
    GetPatient -- DB Error --> Exception;
    CreateTestResult -- DB Error --> Exception;
    Acknowledgement -- DB Error --> Exception;
    Commit --> SendToken[Send CRS Token];
    Rollback --> LoopRequest;
    SendToken --> LoopRequest;
    LoopRequest -- All processed --> End;
    classDef error fill:#f99,stroke:#333,stroke-width:2px;
    class UpdateRequestFail,Rollback error;
```

---

## Sequence Diagrams for Key Processes

### 1. Complete Request Processing Sequence

```other
sequenceDiagram
 participant EXT as External System
 participant EDI as EDI Interface
 participant INT as INT Database
 participant DISP as Dispatcher
 participant WORKER as Worker Thread
 participant PROC as Core Processor
 participant PMI as PMI
 participant CRS as CRS Database
 participant LOE as LOE System
 participant AUDIT as Audit System
 Note over EXT,AUDIT: Laboratory Request Processing Flow
 %% Request Submission
 EXT->>EDI: Submit Test Request
 EDI->>INT: Store in edi_request (status=0)
 EDI->>EXT: Confirm Receipt
 %% Outstanding Request Status Update
 DISP->>DISP: Check process_status == 0
 DISP->>INT: Begin Transaction
 DISP->>INT: update_outstanding_request_status()
 %% Update Request Status
 INT->>INT: UPDATE edi_request SET status=98
 Note right of INT: WHERE status=0 AND source_system match<br/>AND create_datetime < init_datetime
 INT->>INT: UPDATE edi_testrslt SET status=98
 Note right of INT: WHERE status=0 AND source_system match<br/>AND create_datetime < init_datetime
 DISP->>INT: Commit Transaction
 %% Outstanding Request Retrieval
 DISP->>INT: get_outstanding_request()
 INT->>INT: SET rowcount 100
 INT->>INT: SELECT FROM edi_request WHERE status=98
 Note right of INT: Filter by source_system/prefix match<br/>AND create_datetime < init_datetime<br/>ORDER BY create_datetime
 INT-->>DISP: Return Outstanding Requests (max 100)
 %% Request Batch Assignment
 DISP->>DISP: Create Request Batch
 DISP->>WORKER: Assign Request Batch
 %% Worker Thread Processing
 WORKER->>WORKER: Acquire Mutex Lock
 WORKER->>CRS: Begin Transaction
 WORKER->>PROC: Start Processing Request
 %% Patient Demographics Processing
 PROC->>PROC: Check patient data validity flag
 alt Patient Data Valid
 %% PMI Path
 PROC->>PMI: Search Patient Master Index
 PMI->>PMI: Search by HKID + Hospital + Encounter
 alt PMI Record Found and Encounter Matches
 PMI-->>PROC: Return Patient Demographics
 PROC->>PROC: Calculate Patient Age and Unit
 PROC->>CRS: Create/Update Patient from PMI Data
 else PMI Record Not Found or No Match
 PMI-->>PROC: No Match Found
 PROC->>PROC: Fall back to local patient search
 end
 else Patient Data Invalid
 PROC->>PROC: Use local patient search
 end
 %% Local Patient Search (when PMI unavailable)
 alt Local Patient Search Required
 PROC->>CRS: Search Local Patient Database
 alt Patient Exists Locally
 CRS-->>PROC: Return Existing Patient Data
 PROC->>PROC: Calculate Patient Age and Unit
 else New Patient Required
 CRS-->>PROC: Patient Not Found
 PROC->>PROC: Generate New Patient Encounter
 PROC->>PROC: Calculate Patient Age and Unit
 PROC->>CRS: Create New Patient Record
 end
 end
 %% Request Duplication Check
 PROC->>CRS: Check Request Mapping Table
 PROC->>CRS: SELECT req_no FROM sendout_reqno_map
 Note right of CRS: WHERE dh_current_reqno = current_dh_reqno
 alt DH Request Already Exists in Map
 CRS-->>PROC: Return existing request number
 PROC->>PROC: Mark for previous request reuse
 PROC->>PROC: Log "DH Request exists, will wipeout the request"
 %% Wipeout Previous Request Data
 PROC->>PROC: Clean up previous request
 PROC->>CRS: Delete crs_mb_request records (if applicable)
 PROC->>CRS: Delete testrslt records
 PROC->>CRS: Delete worksheet_link records
 PROC->>CRS: Insert testrslt_audit record
 PROC->>CRS: Delete request records
 PROC->>CRS: Delete signout_link records
 PROC->>CRS: Delete trans_testrslt records
 PROC->>CRS: Delete print_list records
 PROC->>CRS: Delete request_copy_hist records
 PROC->>CRS: Delete reqlist records
 PROC->>CRS: Delete sendout records
 PROC->>CRS: Delete request_detail records
 PROC->>CRS: Delete request_profile_detail records
 PROC->>CRS: Delete cras_transaction records
 PROC->>CRS: Delete overdue_link records
 PROC->>CRS: Delete sendout_reqno_map records
 else DH Request Not in Map
 CRS-->>PROC: No existing request found
 PROC->>PROC: Mark for new request generation
 end
 %% Request Number Assignment
 PROC->>PROC: Assign Laboratory Request Number
 alt Reuse Previous Request Number
 PROC->>PROC: Use request number from wiped out request
 Note right of PROC: Skip counter generation, reuse existing Lab No
 else Generate New Request Number
 PROC->>CRS: Get Next Sequence Number from dict_counter
 CRS-->>PROC: Return New Counter Value
 PROC->>PROC: Assemble request number (YYLNNNNNNN)
 end
 PROC-->>PROC: Request Number Assigned
 %% DH Registration Process
 PROC->>PROC: Register with Department of Health
 %% Supporting Data Retrieval
 par Parallel Data Retrieval
 PROC->>CRS: Retrieve Specimen Information
 and
 PROC->>CRS: Retrieve Office Information
 and
 PROC->>CRS: Retrieve Requesting Doctor Information
 end
 %% CRS Request Creation
 PROC->>CRS: Create Laboratory Request Record
 CRS->>CRS: INSERT INTO crs_request
 PROC->>CRS: Create Request Detail Record
 CRS->>CRS: INSERT INTO crs_request_detail
 PROC->>CRS: Create Request Copy History
 CRS->>CRS: INSERT INTO crs_request_copy_hist
 %% Microbiology Request (if applicable)
 alt Microbiology Test
 PROC->>CRS: Create Microbiology Request
 CRS->>CRS: INSERT INTO crs_mb_request
 end
 %% Test Result Processing
 PROC->>INT: Retrieve Test Results
 INT-->>PROC: Return Test Results
 loop For Each Test Result
 PROC->>PROC: Initialize Result Transaction
 PROC->>PROC: Create Result Transaction Record
 PROC->>CRS: Map Result Keywords
 PROC->>CRS: Store Transaction Result
 CRS->>CRS: INSERT INTO trans_testrslt
 end
 %% PDF Order Creation
 alt PDF Report Required
 PROC->>CRS: Create PDF Report Order
 CRS->>CRS: INSERT INTO pdf_order
 end
 %% Report Enquiry Cache
 PROC->>CRS: Create Report Enquiry Cache
 CRS->>CRS: INSERT INTO report_enquiry_cache
 %% Sendout Request Mapping
 PROC->>CRS: Update Request Mapping
 CRS->>CRS: INSERT INTO sendout_reqno_map
 %% Acknowledgment Generation
 PROC->>PROC: Generate Acknowledgment Message
 PROC->>EXT: Send Acknowledgment Message
 %% Status Updates
 PROC->>INT: Update Request Status to Completed
 INT->>INT: UPDATE edi_request SET status=99
 %% Task List Creation
 PROC->>CRS: Create Task List Entry
 CRS->>CRS: INSERT INTO lisg_tasklist
 %% Transaction Commit
 WORKER->>CRS: Commit Transaction
 WORKER->>WORKER: Release Mutex Lock
 %% Audit Trail
 PROC->>AUDIT: Create Audit Record
 AUDIT->>AUDIT: Log Processing Complete
 %% Success Response
 WORKER-->>DISP: Processing Complete
 DISP->>DISP: Update Processing Statistics
 Note over EXT,AUDIT: Request Successfully Processed
```

### 2. Error Handling and Recovery Sequence

```other
sequenceDiagram
 participant WORKER as Worker Thread
 participant PROC as Core Processor
 participant DB as Database
 participant INT as INT Database
 participant ERROR as Error Handler
 participant LOG as Logging System
 participant EXT as External System
 participant MONITOR as System Monitor
 Note over WORKER,MONITOR: Error Handling and Recovery Flow
 %% Normal Processing Start
 WORKER->>DB: Begin Transaction
 WORKER->>PROC: start_process(reqno, labno)
 %% Error Occurrence
 PROC->>DB: Execute Database Operation
 DB-->>PROC: SQL Error / Timeout / Deadlock
 %% Error Detection and Classification
 PROC->>ERROR: get_sqlerr(error_code)
 ERROR->>ERROR: Classify Error Type
 alt Retryable Error
 ERROR-->>PROC: Error Type: RETRYABLE
 else Fatal Error
 ERROR-->>PROC: Error Type: FATAL
 end
 %% Error Logging
 PROC->>LOG: lib_msg(ERR, error_details)
 PROC->>ERROR: create_reject_log(reqno, error_type)
 ERROR->>DB: INSERT INTO reject_log
 PROC->>ERROR: insert_reject_log(reqno, details)
 %% Transaction Rollback
 WORKER->>DB: Rollback Transaction
 DB-->>WORKER: Transaction Rolled Back
 %% Retry Logic
 alt Retryable Error AND Retry Count < MAX_RETRY
 WORKER->>WORKER: Increment Retry Count
 WORKER->>LOG: lib_msg(DEB, "Retrying request")
 %% Wait Before Retry
 WORKER->>WORKER: Sleep(retry_delay)
 %% Retry Processing
 WORKER->>DB: Begin Transaction (Retry)
 WORKER->>PROC: start_process(reqno, labno) [RETRY]
 alt Retry Successful
 PROC-->>WORKER: Processing Success
 WORKER->>DB: Commit Transaction
 WORKER->>LOG: lib_msg(DEB, "Retry successful")
 else Retry Failed
 PROC-->>WORKER: Processing Failed Again
 WORKER->>WORKER: Check Retry Count
 alt More Retries Available
 WORKER->>WORKER: Continue Retry Loop
 else Max Retries Exceeded
 WORKER->>WORKER: Proceed to Permanent Failure
 end
 end
 else Fatal Error OR Max Retries Exceeded
 %% Permanent Failure Handling
 WORKER->>ERROR: Handle Permanent Failure
 %% Update Request Status
 ERROR->>INT: Begin Cleanup Transaction
 ERROR->>INT: update_edi_status(reqno, 10)
 INT->>INT: UPDATE edi_request SET status=10
 %% Data Cleanup
 ERROR->>PROC: wipeout_request(reqno)
 PROC->>DB: del_request(reqno)
 PROC->>DB: del_testrslt(reqno)
 PROC->>DB: del_trans_testrslt(reqno)
 PROC->>DB: del_mb_request(reqno)
 %% Audit Cleanup
 PROC->>DB: insert_wipeout_audit(reqno)
 DB->>DB: INSERT INTO testrslt_audit
 ERROR->>INT: Commit Cleanup Transaction
 %% Error Notification
 ERROR->>EXT: Send Error Acknowledgment
 ERROR->>MONITOR: Update Error Statistics
 MONITOR->>MONITOR: Check Error Thresholds
 alt Error Threshold Exceeded
 MONITOR->>MONITOR: Trigger System Alert
 MONITOR->>LOG: lib_msg(ERR, "High error rate detected")
 end
 %% Manual Task Creation
 ERROR->>DB: insert_unbatch_tasklist(reqno)
 DB->>DB: INSERT INTO lisg_tasklist (manual review)
 end
 %% Final Status Update
 WORKER->>WORKER: Release Mutex Lock
 WORKER-->>MONITOR: Report Processing Result
 MONITOR->>MONITOR: Update System Statistics
 Note over WORKER,MONITOR: Error Handling Complete
```

### 4. Patient Demographics Processing Sequence

```other
sequenceDiagram
 participant PROC as Core Processor
 participant PMI as PMI Database
 participant CRS as CRS Database
 participant AGE as Age Calculator
 participant ENCOUNTER as Encounter Generator
 participant SP as Stored Procedures
 Note over PROC,SP: Patient Demographics Processing Flow
 %% Initial Decision Point
 PROC->>PROC: Check edi_dh_info_valid flag
 alt edi_dh_info_valid == "Y"
 PROC->>PROC: Call get_pmi()
 %% PMI Database Search
 PROC->>PMI: Connect to PMI Database
 PROC->>PMI: SELECT FROM lis_pt_get_pmi_by_hkid1
 Note right of PMI: WHERE _hkid = search_hkid<br/>AND case_no = encounter<br/>AND hospital_code = hospital<br/>ORDER BY adm_dtm DESC
 alt PMI Record Found
 PMI-->>PROC: Return PMI Demographics
 Note right of PMI: case_no, hospital_code, patient_name,<br/>sex, cccode, dob, race, address,<br/>death_indicator, confidential, mrn
 %% Encounter Matching (DHX only)
 PROC->>PROC: Match encounter numbers
 alt Encounter Match Found
 PROC->>PROC: Set match_found = 1
 else No Encounter Match
 PROC->>PROC: Fall back to get_patient()
 end
 else No PMI Record Found
 PMI-->>PROC: No Match Found
 PROC->>PROC: Call get_patient()
 end
 else edi_dh_info_valid == "N"
 PROC->>PROC: Call get_patient()
 end
 %% PMI Path - Patient Exists in PMI
 alt PMI Path (match_found == 1)
 %% Check Local Patient Existence
 PROC->>CRS: Connect to CRS Database
 PROC->>CRS: SELECT COUNT(*) FROM patient
 Note right of CRS: WHERE pat_encounter = pmi_encounter<br/>AND pat_hospital = pmi_hospital
 %% Age Calculation
 PROC->>AGE: calculate_age_and_unit()
 AGE->>CRS: exec lis_sp_convert_date
 AGE->>CRS: SELECT keygp_display_order FROM keyword_group
 AGE-->>PROC: Return calculated age and unit
 alt Patient Exists in Local CRS
 PROC->>SP: exec lis_sp_pat_upd_enc_by_pmi1_dhx
 SP->>CRS: Update existing patient record
 SP-->>PROC: Patient updated successfully
 else Patient Not in Local CRS
 PROC->>SP: exec lis_sp_pat_admission3
 SP->>CRS: INSERT INTO patient (from PMI data)
 SP-->>PROC: Patient created successfully
 end
 %% Retrieve Patient Groups
 PROC->>CRS: SELECT pat_pid_group, pat_encounter_group
 CRS-->>PROC: Return patient group information
 else Local Patient Path (get_patient)
 %% Search Local Patient Database
 PROC->>CRS: SELECT FROM patient
 Note right of CRS: WHERE pat_pid = search_hkid<br/>AND pat_encounter LIKE '[%]%'
 alt Patient Found in Local Database
 CRS-->>PROC: Return existing patient data
 %% HKID Masking Logic (DHX)
 alt DHX and Non-% Encounter
 PROC->>PROC: Mask HKID with % prefix
 PROC->>PROC: Set ignore = 1
 end
 %% Age Calculation
 PROC->>AGE: calculate_age_and_unit()
 AGE-->>PROC: Return calculated age and unit
 %% Retrieve Patient Groups
 PROC->>CRS: SELECT pat_pid_group, pat_encounter_group
 CRS-->>PROC: Return patient group information
 else Patient Not Found Locally
 %% Generate New Encounter
 PROC->>ENCOUNTER: generate_patient_encounter()
 ENCOUNTER->>CRS: Get server datetime components
 ENCOUNTER->>ENCOUNTER: Format: %LABCODE371DDMYYHHMISS
 ENCOUNTER-->>PROC: Return generated encounter
 %% HKID Processing
 alt HKID Masking Required
 PROC->>PROC: Prepend % to HKID
 end
 %% Age Calculation
 PROC->>AGE: calculate_age_and_unit()
 AGE-->>PROC: Return calculated age and unit
 %% Create New Patient
 PROC->>SP: exec lis_sp_pat_admission3
 SP->>CRS: INSERT INTO patient (from EDI data)
 Note right of CRS: Set pat_cat = 8 (Others)<br/>Use default ward/spec codes
 SP-->>PROC: Patient created successfully
 %% Retrieve Patient Groups
 PROC->>CRS: SELECT pat_pid_group, pat_encounter_group
 CRS-->>PROC: Return patient group information
 end
 end
 %% Final Patient Data Assembly
 PROC->>PROC: Assemble Final Patient Record
 Note right of PROC: Patient data ready with:<br/>- Demographics (PMI or EDI source)<br/>- Calculated age and unit<br/>- Patient groups and encounter<br/>- Hospital assignments
 %% Patient Processing Complete
 PROC-->>PROC: Patient Demographics Ready for Request Processing
 Note over PROC,SP: Patient Demographics Processing Complete
```

### 5. Test Result Conversion and Storage Sequence

```other
sequenceDiagram
 participant PROC as Core Processor
 participant INT as INT Database
 participant TRANS as Transaction Processor
 participant KEYWORD as Keyword Mapper
 participant RSLT_DB as Results Database
 participant AUDIT as Audit System
 Note over PROC,AUDIT: Test Result Conversion and Storage Flow
 %% Result Retrieval
 PROC->>INT: retrieve_edi_testrslt(reqno)
 INT->>INT: SELECT FROM edi_testrslt WHERE status=98
 Note right of INT: Ordered by: group_sequence, test_sequence,<br/>ctr, rslt_ctr, test_rslttype
 INT-->>PROC: Return Test Results Array
 %% Initialize Transaction Processing
 PROC->>TRANS: init_trans_testrslt()
 TRANS->>TRANS: Initialize Transaction Structures
 TRANS-->>PROC: Transaction Initialized
 %% Process Each Test Result
 loop For Each Test Result
 PROC->>TRANS: init_edi_trans_testrslt(reqno, index)
 TRANS->>TRANS: Initialize Single Result Transaction
 %% Result Type Processing
 alt Numeric Result
 TRANS->>TRANS: Process Numeric Value
 TRANS->>TRANS: Validate Numeric Range
 TRANS->>TRANS: Apply Reference Range Check
 else Text Result
 TRANS->>TRANS: Process Text Value
 TRANS->>TRANS: Validate Text Length
 TRANS->>TRANS: Apply Text Formatting
 else Enumerated Result
 TRANS->>TRANS: Process Enum Value
 TRANS->>KEYWORD: Map Enum to Keyword
 end
 %% Keyword Mapping
 alt Result Requires Mapping
 TRANS->>KEYWORD: result_mapping(result_value, keygp_code)
 KEYWORD->>KEYWORD: SELECT FROM keyword_list, keyword_group
 Note right of KEYWORD: Match by description or alpha2 code
 alt Mapping Found
 KEYWORD-->>TRANS: Return Mapped Keyword
 TRANS->>TRANS: Apply Mapped Value
 else No Mapping Found
 KEYWORD-->>TRANS: Mapping Not Found
 TRANS->>TRANS: Use Original Value
 TRANS->>AUDIT: Log Mapping Warning
 end
 end
 %% Microbiology Result Processing
 alt Microbiology Result
 TRANS->>TRANS: Process Organism Data
 TRANS->>TRANS: Process Antibiotic Data
 TRANS->>TRANS: Process Susceptibility Data
 TRANS->>TRANS: Process Zone Size Data
 TRANS->>TRANS: Validate Micro Data Relationships
 end
 %% Result Amendment Check
 alt Previous Result Exists
 TRANS->>RSLT_DB: Check Previous Result
 RSLT_DB-->>TRANS: Return Previous Values
 TRANS->>TRANS: amend_edi_rslt(index, prev_ctr)
 TRANS->>TRANS: Compare Current vs Previous
 TRANS->>TRANS: Mark as Amendment if Different
 end
 %% Transaction Result Creation
 TRANS->>TRANS: create_trans_testrslt(index)
 TRANS->>TRANS: Populate Transaction Structure
 Note right of TRANS: Fields: reqno, header_ckey, member_ckey,<br/>ctr, rslt_ctr, result values, flags
 %% Result Validation
 TRANS->>TRANS: Validate Transaction Result
 par Parallel Validation
 TRANS->>TRANS: Validate Required Fields
 and
 TRANS->>TRANS: Validate Data Types
 and
 TRANS->>TRANS: Validate Business Rules
 and
 TRANS->>TRANS: Validate Reference Ranges
 end
 alt Validation Passed
 %% Store Transaction Result
 TRANS->>RSLT_DB: insert_trans_testrslt()
 RSLT_DB->>RSLT_DB: INSERT INTO trans_testrslt
 Note right of RSLT_DB: Complete result record with all<br/>metadata and validation flags
 %% Additional Result Actions
 alt Action Type Required
 TRANS->>RSLT_DB: insert_trans_with_action_type(index, action)
 RSLT_DB->>RSLT_DB: INSERT INTO trans_testrslt_action
 end
 else Validation Failed
 TRANS->>AUDIT: Log Validation Error
 TRANS->>TRANS: Mark Result as Error
 TRANS->>PROC: Return Validation Error
 end
 end
 %% Group Comment Processing
 alt Group Comments Exist
 PROC->>TRANS: init_g_edi_rslt_gpcom()
 TRANS->>TRANS: Process Group Comments
 TRANS->>RSLT_DB: Store Group Comments
 end
 %% Result Processing Summary
 PROC->>TRANS: Finalize Result Processing
 TRANS->>TRANS: Calculate Processing Statistics
 TRANS-->>PROC: Return Processing Summary
 %% Audit Trail Creation
 PROC->>AUDIT: Create Result Audit Trail
 AUDIT->>AUDIT: INSERT INTO testrslt_audit
 Note right of AUDIT: Log: user, date, action type,<br/>result changes, acting_by
 %% Cleanup Temporary Data
 PROC->>TRANS: Cleanup Transaction Data
 TRANS->>TRANS: Clear Temporary Structures
 Note over PROC,AUDIT: Test Result Processing Complete
```

### 6. Request Number Generation Sequence (assign_reqno)

```other
sequenceDiagram
 participant PROC as Core Processor
 participant CRS as CRS Database
 participant DICT as Dictionary Counter
 participant YEAR as Year Prefix Generator
 participant RETRY as Retry Logic
 Note over PROC,RETRY: Request Number Generation Flow
 %% Check for Previous Request Reuse
 alt Previous Request Reuse (g_reuse_prev_reqno == 1)
 PROC->>PROC: Reuse previous wiped out request number
 PROC->>PROC: strcpy(req_reqno, prev_reqno)
 Note right of PROC: Skip generation, use existing Lab No
 PROC-->>PROC: Return success (0)
 else Generate New Request Number
 %% Initialize Parameters
 PROC->>PROC: Set dict_labno = cond_labno
 PROC->>PROC: Set dict_code = "DH_labno"
 %% Connect to Database
 PROC->>CRS: set_sybase_connect("labdb9")
 %% Counter Management
 PROC->>DICT: UPDATE dict_counter (increment and set available)
 Note right of DICT: SET dict_ctr = dict_ctr + 1<br/>SET dict_entry_inused = 'N'
 PROC->>DICT: SELECT dict_ctr, dict_entry_inused
 DICT-->>PROC: Return counter value
 %% Counter Validation
 alt Counter > 9999999
 PROC->>PROC: Return error - Counter overflow
 end
 %% Year Prefix Generation
 PROC->>YEAR: get_year_prefix()
 YEAR->>CRS: SELECT datepart(year, getdate())
 YEAR-->>PROC: Return year_prefix (last 2 digits)
 %% Request Number Assembly
 PROC->>PROC: Initialize final_reqno = year_prefix
 %% Laboratory Type Prefix Logic
 PROC->>PROC: Check dhreq_pre value
 alt dhreq_pre == "A" (Clinical Chemistry)
 PROC->>PROC: Append "C" to final_reqno
 else Other Laboratory Types (Microbiology, etc.)
 PROC->>PROC: Append "M" to final_reqno
 end
 %% Counter Formatting and Final Assembly
 PROC->>PROC: Format counter as 7-digit string
 PROC->>PROC: Assemble final_reqno
 Note right of PROC: Format: YYLNNNNNNN<br/>YY = Year (2 digits)<br/>L = Lab Type (C/M)<br/>NNNNNNN = Sequential counter (7 digits)
 PROC->>PROC: Set req_reqno = final_reqno
 PROC-->>PROC: Return success
 end
 Note over PROC,RETRY: Request Number Generation Complete
```

### 7. Specimen Processing Sequence (get_specimen)

```other
sequenceDiagram
 participant PROC as Core Processor
 participant CRS as CRS Database
 participant KEYWORD as Keyword Database
 participant LOG as Logging System
 Note over PROC,LOG: Specimen Processing Flow
 %% Initial Laboratory Check
 PROC->>PROC: Check laboratory number
 alt Laboratory 1 (Clinical Chemistry)
 PROC->>PROC: Skip specimen processing
 PROC-->>PROC: Return success (no specimen needed)
 else Other Laboratories (Microbiology, etc.)
 %% Specimen Type Validation
 PROC->>PROC: Check EDI specimen type
 alt Specimen Type Not Specified
 PROC->>PROC: Use default specimen = 25152 ("NOT SPECIFIED")
 else Specimen Type Specified
 %% Database Lookup
 PROC->>KEYWORD: Connect to Keyword Database
 PROC->>KEYWORD: SELECT key_ckey FROM keyword_list
 Note right of KEYWORD: WHERE key_ckey in SPECIMEN group<br/>AND keygp_labno = current_lab<br/>AND lower(key_desc) = specimen_type
 alt Specimen Found in Keywords
 KEYWORD-->>PROC: Return specimen key
 else Specimen Not Found
 KEYWORD-->>PROC: No match found
 PROC->>PROC: Use default specimen = 25090 ("OTHER SPECIMEN")
 PROC->>PROC: Save original specimen type for test result
 end
 %% Error Handling
 alt Database Error
 KEYWORD-->>PROC: Database error occurred
 PROC->>LOG: Create reject log with error details
 PROC-->>PROC: Return error (-1)
 end
 end
 end
 PROC-->>PROC: Specimen processing complete
 Note over PROC,LOG: Specimen Processing Complete
```

### 8. Location Information Retrieval Sequence (get_office)

```other
sequenceDiagram
 participant PROC as Core Processor
 participant OFFICE as Office Table
 Note over PROC,OFFICE: Location Information Retrieval Flow
 %% Initialize Variables
 PROC->>PROC: Initialize office variables
 PROC->>PROC: Mark specialty as not found
 PROC->>PROC: Determine hospital and dictionary codes
 %% Specialty Processing
 alt Specialty Information Available (EDI_DH_INFO.local_spec)
 %% Specialty Lookup
 PROC->>OFFICE: SELECT office_ckey FROM office
 Note right of OFFICE: WHERE office_hosp_code = hospital<br/>AND office_alpha = EDI_DH_INFO.local_spec<br/>AND office_type = 6
 alt Specialty Found in Office Table
 OFFICE-->>PROC: Return specialty key
 PROC->>PROC: Mark specialty as found
 else Specialty Not Found
 OFFICE-->>PROC: No specialty match
 PROC->>PROC: Use default specialty and location values
 end
 %% Database Error Handling
 alt Database Error
 OFFICE-->>PROC: Database error occurred
 PROC-->>PROC: Return error
 end
 else No Specialty Information
 PROC->>PROC: Use default specialty settings
 end
 %% Location Processing
 alt Location Information Available (EDI_DH_INFO.local_locn) AND Specialty Found
 %% Location Lookup
 PROC->>OFFICE: SELECT office_ckey, office_patient_category, office_specialty
 Note right of OFFICE: WHERE office_hosp_code = hospital<br/>AND office_alpha = EDI_DH_INFO.local_locn<br/>AND office_specialty = specialty<br/>AND office_type = 1
 alt Exact Match Found
 OFFICE-->>PROC: Return location details
 else No Exact Match
 OFFICE-->>PROC: No location match
 PROC->>PROC: Use default location and specialty values
 end
 %% Database Error Handling
 alt Database Error
 OFFICE-->>PROC: Database error occurred
 PROC-->>PROC: Return error
 end
 else Location Not Available OR Specialty Not Found
 PROC->>PROC: Use default location and specialty values
 end
 %% Report Location Processing
 PROC->>PROC: Check report destination
 alt Report Location Specified (EDI_REQUEST.rep_dest_alpha) 
 %% Report Location Lookup
 PROC->>OFFICE: SELECT office_ckey FROM office
 Note right of OFFICE: WHERE office_hosp_code = hospital<br/>AND office_name = EDI_REQUEST.rep_dest_alpha<br/>AND office_type = 1
 alt Report Location Found
 OFFICE-->>PROC: Return report location key
 else Report Location Not Found
 OFFICE-->>PROC: No report location match
 end
 %% Database Error Handling
 alt Database Error
 OFFICE-->>PROC: Database error occurred
 PROC-->>PROC: Return error
 end
 else No Report Location
 PROC->>PROC: Skip report location processing
 end
 PROC-->>PROC: Location information retrieval complete
 Note over PROC,OFFICE: Location Information Retrieval Complete
```

### 9. Doctor Information Retrieval Sequence (get_req_doc)

```other
sequenceDiagram
 participant PROC as Core Processor
 participant OFFICE as Office Table
 Note over PROC,OFFICE: Doctor Information Retrieval Flow
 %% Initialize Variables
 PROC->>PROC: Initialize doctor search parameters
 PROC->>PROC: Set doctor alpha code to "%NOTSPEC"
 PROC->>PROC: Set hospital code to "DH"
 %% Doctor Lookup
 PROC->>OFFICE: SELECT office_ckey FROM office
 Note right of OFFICE: WHERE office_hosp_code = "DH"<br/>AND office_alpha = "%NOTSPEC"<br/>AND office_type = 0
 alt Doctor Record Found
 OFFICE-->>PROC: Return doctor key
 PROC->>PROC: Set requesting doctor key
 else Doctor Not Found
 OFFICE-->>PROC: No doctor match
 PROC->>PROC: Handle doctor lookup failure
 end
 %% Database Error Handling
 alt Database Error
 OFFICE-->>PROC: Database error occurred
 PROC-->>PROC: Return error
 end
 PROC-->>PROC: Doctor information retrieval complete
 Note over PROC,OFFICE: Doctor Information Retrieval Complete
```

### 10. Create Request Sequence (dhreg)

```other
sequenceDiagram
 participant PROC as Core Processor
 participant OFFICE as Office Table
 participant CRS as CRS Database
 participant DATA as Data Preparation
 Note over PROC,CRS: Create Request Flow
 %% Supporting Data Retrieval
 PROC->>PROC: Prepare request data structure
 PROC->>PROC: Set reference from request ward
 par Supporting Information Retrieval
 PROC->>OFFICE: Retrieve office information
 and
 PROC->>OFFICE: Retrieve doctor information ("%NOTSPEC")
 end
 %% Date and Time Processing
 PROC->>PROC: Set collected datetime from EDI request
 PROC->>PROC: Set arrived datetime from EDI request
 PROC->>PROC: Set laboratory number
 %% Confidentiality Check
 alt PDF Filename is "[CONFIDENTIAL]"
 PROC->>PROC: Mark request as confidential
 else Normal Request
 PROC->>PROC: Keep default confidentiality setting
 end
 %% Validity Check
 alt Patient Data Invalid (valid != "Y")
 PROC->>PROC: Mark as lab-only request
 else Patient Data Valid
 PROC->>PROC: Keep normal request status
 end
 %% Request Detail Preparation
 PROC->>DATA: Prepare request detail data
 DATA->>DATA: Get test result count from EDI_TESTRSLT
 DATA->>DATA: Initialize request detail counter
 loop For Each Test Result from EDI_TESTRSLT
 DATA->>DATA: Check if test alpha code already exists
 alt Test Alpha Code Not Duplicate
 DATA->>DATA: Add test alpha code from EDI_TESTRSLT.test_alpha_code
 DATA->>DATA: Set laboratory number, request number, registration date
 else Test Alpha Code Already Exists
 DATA->>DATA: Skip duplicate test alpha code
 end
 end
 DATA-->>PROC: Request details ready with unique test codes
 %% Request Copy History Preparation
 PROC->>DATA: Prepare request copy history
 DATA->>DATA: Set office, patient groups, encounter groups
 DATA->>DATA: Set prime type and registration date
 DATA-->>PROC: Copy history ready
 %% Microbiology Request Check
 alt Laboratory 7 (Microbiology)
 PROC->>DATA: Prepare microbiology request data
 DATA->>DATA: Set request number, date, specimen, patient group
 DATA-->>PROC: Microbiology data ready
 else Other Laboratories
 PROC->>PROC: Skip microbiology preparation
 end
 %% Sendout Request Mapping Preparation
 PROC->>DATA: Prepare sendout request mapping
 DATA->>DATA: Set request number and DH request number
 alt Sendout Request Number Exists
 alt Laboratory 20 (LOE System)
 DATA->>DATA: Parse LOE sendout request format
 DATA->>DATA: Extract hospital code (2-3 chars)
 DATA->>DATA: Extract request number portion
 else Other Laboratories (HA Lab)
 DATA->>DATA: Parse HA Lab sendout request format
 DATA->>DATA: Determine hospital code length (12/14 chars = 2, others = 3)
 DATA->>DATA: Extract hospital and request portions
 end
 else No Sendout Request Number
 DATA->>DATA: Set sendout request to "."
 end
 DATA-->>PROC: Sendout mapping ready
 %% Database Insertion
 PROC->>CRS: Begin request creation
 PROC->>CRS: Insert main request record (crs_request)
 PROC->>CRS: Insert request details (crs_request_detail)
 PROC->>CRS: Insert request copy history (crs_request_copy_hist)
 alt Microbiology Request
 PROC->>CRS: Insert microbiology request (crs_mb_request)
 end
 PROC-->>PROC: Request creation complete
 Note over PROC,CRS: Create Request Complete
```

### 11. Transaction Test Result Creation Sequence (create_trans_testrslt)

```other
sequenceDiagram
 participant PROC as Core Processor
 participant TRANS as Transaction Processor
 participant LAB as LAB Database
 participant VALID as Result Validator
 Note over PROC,VALID: Transaction Test Result Creation Flow
 %% Initialize Processing
 PROC->>TRANS: Initialize transaction test result creation
 TRANS->>TRANS: Set laboratory number and test key
 TRANS->>TRANS: Initialize validation flags
 %% Confidentiality Check
 TRANS->>LAB: Check test confidentiality status
 LAB->>LAB: SELECT test_confidential FROM test_dict
 Note right of LAB: WHERE test_ckey = current_test_key
 alt Test Confidential (status = 1)
 LAB-->>TRANS: Return confidential flag
 TRANS->>TRANS: Set request confidential = 1
 else Test Restricted (status = 3)
 LAB-->>TRANS: Return restricted flag
 TRANS->>TRANS: Set request confidential = 3 (if not already confidential)
 else Normal Test
 LAB-->>TRANS: Return normal status
 TRANS->>TRANS: Keep existing confidentiality setting
 end
 %% Result Type Processing
 TRANS->>VALID: Process result by type
 VALID->>VALID: Get test result and trim whitespace
 VALID->>VALID: Get test result text and trim whitespace
 alt Result Type: Numeric/Numeric or Enum/Numeric and Enum (1,8,9)
 %% Numeric Result Processing
 VALID->>VALID: Check if result is null or empty
 alt Result Empty
 VALID-->>TRANS: Return error code 6 (empty result)
 else Result Has Value
 VALID->>VALID: Parse numeric value and check conversion
 alt Non-numeric Result
 VALID->>VALID: Check for prefix operators (=,<,>,<=,>=,<>)
 VALID->>VALID: Extract operator and parse remaining numeric part
 alt Valid Operator and Number
 VALID->>VALID: Calculate result type flag with operator
 VALID->>VALID: Count decimal places for precision
 VALID->>TRANS: Set numeric value and precision flags
 else Invalid Format
 VALID-->>TRANS: Return error code 6 (invalid format)
 end
 else Pure Numeric
 VALID->>VALID: Count decimal places for precision
 VALID->>TRANS: Set numeric value and precision flags
 end
 %% Additional Result Information Processing
 VALID->>TRANS: Copy original test result to result field
 %% High/Low Flag Processing
 alt High/Low Flag Available (test_result_flag not null)
 VALID->>TRANS: Append space + high/low flag to result string
 Note right of TRANS: Result format: "original_value H" or "original_value L"
 end
 %% Special Comment Processing 
 alt Special Comment Available (test_special_com not null)
 VALID->>TRANS: Append space + special comment to result string
 Note right of TRANS: Result format: "original_value flag comment"
 end
 %% Reference Range Processing
 alt Reference Range Available (test_ref_range not null)
 VALID->>TRANS: Set reference range in worksheet field
 Note right of TRANS: Worksheet contains reference range<br/>for EPR access (e.g., "5.0-10.0")
 end
 %% Enhanced Result Action Type
 alt Any Additional Information Present
 VALID->>TRANS: Set action_type = 15 (enhanced result)
 Note right of TRANS: Action type 15 indicates result<br/>has additional clinical information
 end
 end
  
 else Result Type: Enum Only (2)
 %% Pure Enum Processing
 VALID->>VALID: Check result and attribute availability
 alt Result or Attribute Missing
 VALID-->>TRANS: Return error code 6 (missing data)
 else Data Available
 VALID->>VALID: Trim test attribute at comma separator
 %% Keyword Mapping Process
 VALID->>LAB: Execute result_mapping function
 Note right of LAB: Map EDI result to keyword database
 LAB->>LAB: Determine mapping method (by description vs alpha2)
 Note right of LAB: if test attribute is SEN_ALL, uses alpha2, otherwise use description
 LAB->>LAB: SELECT FROM keyword_list JOIN keyword_group
 Note right of LAB: WHERE keygp_labno = current_lab<br/>AND keygp_code = attribute_group<br/>AND keygp_item = key_ckey<br/>AND ((lower(key_desc) = lower(result) AND by_desc = 1)<br/>OR (key_alpha2 = result AND by_desc = 0))<br/>AND key_inactive <> 1
 alt Mapping Successful (record found)
 LAB-->>VALID: Return keyword mapping (ckey, alpha2, desc, enter_code)
 VALID->>TRANS: Set enum value and result description
 %% Additional Information for Enum Results
 alt High/Low Flag Available (test_result_flag not null)
 VALID->>TRANS: Append high/low flag to result string
 end
 alt Special Comment Available (test_special_com not null)
 VALID->>TRANS: Append special comment to result string
 end
 alt Reference Range Available (test_ref_range not null)
 VALID->>TRANS: Set reference range in worksheet field
 end
 alt Any Additional Information Present
 VALID->>TRANS: Set action_type = 15 (enhanced result)
 end
 else Mapping Failed (no record found)
 LAB-->>VALID: No keyword match (sqlerrd[2] = 0)
 VALID->>VALID: Log "No record found in keyword"
 VALID-->>TRANS: Return error code 7 (enum mapping failed)
 else Database Error
 LAB-->>VALID: SQL error occurred
 VALID-->>TRANS: Return error code -1 (database error)
 end
 end
 else Result Type: Text/Varchar (3)
 %% Text Result Processing
 VALID->>VALID: Check if test is line label (_LBL suffix)
 alt Line Label Test
 VALID->>VALID: Set default value "." if empty
 else Regular Text Test
 alt Both Result and Text Empty
 VALID-->>TRANS: Return error code 6 (no text content)
 end
 end
 %% Group Comment Processing
 VALID->>VALID: Check if test is group comment (GRPCOM)
 alt Group Comment Test (Laboratory A)
 VALID->>LAB: SELECT test_ckey FROM test_dict
 Note right of LAB: WHERE test_alpha_code = 'GRPCOM'<br/>AND test_labno = current_lab
 alt Group Comment Key Found
 LAB-->>VALID: Return test key
 VALID->>TRANS: Set member and header keys
 VALID->>TRANS: Set text content from EDI_TESTRSLT.test_text
 else Key Not Found
 LAB-->>VALID: No test key found
 VALID-->>TRANS: Return error code -1 (database error)
 end
 else Regular Text Test
 %% Text Length Validation
 alt EDI_TESTRSLT.test_text Available and Not Empty
 VALID->>VALID: Check text length <= 7500 characters
 alt Text Within Limit
 VALID->>TRANS: Set text content from EDI_TESTRSLT.test_text
 else Text Too Long
 VALID-->>TRANS: Return error code 15 (text too long)
 end
 else Use Regular Result
 VALID->>TRANS: Set text content from EDI_TESTRSLT.test_result field
 end
 %% Additional Text Processing
 alt High/Low Flag Available (test_result_flag not null)
 VALID->>TRANS: Append space + high/low flag to text content
 end
 alt Special Comment Available (test_special_com not null)
 VALID->>TRANS: Append space + special comment to text content
 end
 alt Reference Range Available (test_ref_range not null)
 VALID->>TRANS: Set reference range in worksheet field
 end
 alt Any Additional Information Present
 VALID->>TRANS: Set action_type = 15 (enhanced result)
 end
 end
 else Result Type: Organism (6)
 %% Organism Result Processing
 alt Test Result Not Empty
 VALID-->>TRANS: Return error code 6 (unexpected test result)
 else Organism Processing
 VALID->>VALID: Get organism name (use empty string if null)
 %% Organism Keyword Mapping
 VALID->>LAB: Execute result_mapping for ORGANISM group
 LAB->>LAB: Set mapping method (by description = 1)
 Note right of LAB: Uses description matching with EDI_TESTRSLT.organism
 LAB->>LAB: SELECT FROM keyword_list JOIN keyword_group
 Note right of LAB: WHERE keygp_code = "ORGANISM"<br/>AND lower(key_desc) = lower(EDI_TESTRSLT.organism)
 alt Organism Mapping Successful
 LAB-->>VALID: Return organism mapping (ckey, alpha2, desc)
 VALID->>TRANS: Set enum key and format result (organism  )
 %% Growth Processing
 alt Growth Information Available
 %% Growth Keyword Mapping
 VALID->>LAB: Execute result_mapping for GROW group
 LAB->>LAB: Set mapping method (by description = 1)
 Note right of LAB: Uses description matching with EDI_TESTRSLT.growth
 LAB->>LAB: SELECT FROM keyword_list JOIN keyword_group
 Note right of LAB: WHERE keygp_code = "GROW"<br/>AND lower(key_desc) = lower(EDI_TESTRSLT.growth)
 alt Growth Mapping Successful
 LAB-->>VALID: Return growth mapping (ckey, alpha2, desc)
 VALID->>TRANS: Set numeric value and append to result
 Note right of TRANS: Result format: "organism  growth "
 else Growth Mapping Failed
 LAB-->>VALID: No growth match
 VALID-->>TRANS: Return error code 4 (growth mapping failed)
 end
 end
 %% Culture Profile Registration
 VALID->>VALID: Change test alpha suffix to 'P' for profile
 else Organism Mapping Failed
 LAB-->>VALID: No organism match
 VALID-->>TRANS: Return error code 1 (organism mapping failed)
 else Database Error
 LAB-->>VALID: SQL error occurred
 VALID-->>TRANS: Return error code -1 (database error)
 end
 end
 else Result Type: Antibiotic (7)
 %% Antibiotic Result Processing
 alt Antibiotic Name Missing
 VALID-->>TRANS: Return error code 6 (missing antibiotic)
 else Antibiotic Available
 %% MIC vs Regular Antibiotic Processing
 VALID->>VALID: Check if antibiotic ends with "(MIC)"
 alt MIC Antibiotic without Susceptibility
 VALID->>TRANS: Create MIC comment transaction
 VALID->>TRANS: Format text with organism, antibiotic, and zone size
 VALID->>TRANS: Set header and member keys to MIC_COMMENT_KEY (10001)
 VALID->>TRANS: Set result type = 3 (text), sequence = 998
 else Regular Antibiotic
 alt Missing Susceptibility Result
 VALID-->>TRANS: Return error code 16 (missing susceptibility)
 else Complete Antibiotic Data
 %% Zone Size Processing
 alt Zone Size Available
 VALID->>TRANS: Set zone size in varchar2 field
 VALID->>VALID: Ensure antibiotic name has "(MIC)" suffix
 end
 %% Antibiotic Keyword Mapping
 VALID->>LAB: Execute result_mapping for ANTIBIOTIC group
 LAB->>LAB: Set mapping method (by description = 1)
 Note right of LAB: Uses description matching with EDI_TESTRSLT.antibiotics
 LAB->>LAB: SELECT FROM keyword_list JOIN keyword_group
 Note right of LAB: WHERE keygp_code = "ANTIBIOTIC"<br/>AND lower(key_desc) = lower(EDI_TESTRSLT.antibiotics)
 alt Antibiotic Mapping Successful
 LAB-->>VALID: Return ANTIBIOTIC mapping (ckey, alpha2, desc)
 VALID->>TRANS: Set enum = ANTIBIOTIC.key_ckey
 VALID->>TRANS: Set result = ANTIBIOTIC.key_alpha2 + " #59; "
 Note right of TRANS: Format antibiotic result with semicolon separator
 %% Susceptibility Keyword Mapping
 VALID->>LAB: Execute result_mapping for SEN_ALL group
 LAB->>LAB: Set mapping method (by alpha2 = 0)
 Note right of LAB: SEN_ALL uses alpha2 matching with EDI_TESTRSLT.susceptibility
 LAB->>LAB: SELECT FROM keyword_list JOIN keyword_group
 Note right of LAB: WHERE keygp_code = "SEN_ALL"<br/>AND key_alpha2 = EDI_TESTRSLT.susceptibility
 alt Susceptibility Mapping Successful
 LAB-->>VALID: Return SEN_ALL mapping (ckey, alpha2, desc)
 VALID->>TRANS: Set numeric = SEN_ALL.key_ckey
 VALID->>TRANS: Set varchar3 = SEN_ALL.key_ckey (as string)
 VALID->>TRANS: Append SEN_ALL.key_alpha2 to result string
 VALID->>TRANS: Set text = organism_key (from global storage)
 Note right of TRANS: Final result format: "antibiotic #59; susceptibility"<br/>numeric = susceptibility_ckey, varchar3 = susceptibility_ckey_string<br/>text = organism_ckey, enum = antibiotic_ckey
 else Susceptibility Mapping Failed
 LAB-->>VALID: No susceptibility match (sqlerrd[2] = 0)
 VALID-->>TRANS: Return error code 3 (susceptibility mapping failed)
 else Database Error
 LAB-->>VALID: SQL error occurred
 VALID-->>TRANS: Return error code -1 (database error)
 end
 else Antibiotic Mapping Failed
 LAB-->>VALID: No antibiotic match (sqlerrd[2] = 0)
 VALID-->>TRANS: Return error code 2 (antibiotic mapping failed)
 else Database Error
 LAB-->>VALID: SQL error occurred
 VALID-->>TRANS: Return error code -1 (database error)
 end
 end
 end
 end
 else Result Type: Paired (0) or Other
 %% Special Case or Error Handling
 alt Paired Result Type (0)
 VALID->>TRANS: Continue processing (no specific action)
 else Unsupported Type
 VALID-->>TRANS: Return error code 6 (unsupported result type)
 end
 end
 %% Test Unit Validation
 alt Unit Validation Required (Non-A and Non-N laboratories)
 TRANS->>LAB: SELECT test_units FROM test_dict
 Note right of LAB: WHERE test_ckey = current_test_key
 alt Both EDI and Dictionary Have Units
 LAB-->>TRANS: Return dictionary unit
 TRANS->>TRANS: Compare EDI unit with dictionary unit
 alt Units Match
 TRANS->>TRANS: Unit validation passed
 else Units Don't Match
 TRANS-->>PROC: Return error code 14 (unit mismatch)
 end
 else Unit Availability Mismatch
 TRANS-->>PROC: Return error code 14 (unit validation failed)
 end
 else Unit Validation Skipped
 TRANS->>TRANS: Skip unit validation for laboratories A and N
 end
 %% Success Response
 TRANS-->>PROC: Return success (0)
 Note over PROC,VALID: Transaction Test Result Creation Complete
```

### 12. PDF Order Creation Sequence (insert_pdf_order)

```other
sequenceDiagram
 participant PROC as Core Processor
 participant PDF as PDF Order System
 participant LAB as LAB Database
 participant CONFIG as Configuration System
 participant VALID as Validation System
 Note over PROC,VALID: PDF Order Creation Flow
 %% Initialize Processing
 PROC->>PDF: Initialize PDF report order creation
 PDF->>PDF: Set current laboratory number
 PDF->>PDF: Initialize processing variables
 %% Confidential Check
 PDF->>VALID: Check if PDF report is marked as confidential
 alt PDF Filename is "[CONFIDENTIAL]"
 VALID-->>PDF: Report marked as confidential
 PDF-->>PROC: Return success (skip PDF order creation)
 else Normal PDF Processing
 VALID-->>PDF: Normal PDF report processing required
 %% PDF Path Configuration
 alt PDF Storage Path Not Set
 PDF->>CONFIG: Retrieve PDF storage path from OpenShift ConfigMap
 Note right of CONFIG: Future revamp implementation:<br/>ConfigMap-based configuration management<br/>replaces database lis_option table lookup
 CONFIG->>CONFIG: Read EPR_PDF_FILE_PATH from ConfigMap
 Note right of CONFIG: ConfigMap key: EPR_PDF_FILE_PATH<br/>Namespace: laboratory-system<br/>Environment-specific values
 alt Configuration Found in ConfigMap
 CONFIG-->>PDF: Return PDF storage path from ConfigMap
 PDF->>PDF: Store PDF path for future use
 else ConfigMap Access Error
 CONFIG-->>PDF: ConfigMap retrieval failed
 PDF-->>PROC: Return error (-1)
 end
 else PDF Path Already Set
 PDF->>PDF: Use existing PDF storage path
 end
 %% Full Path Construction
 PDF->>PDF: Build complete file path for PDF report
 Note right of PDF: PDF Path + EDI_REQUEST.pdf_filename
 %% Database Connection
 PDF->>LAB: Connect to laboratory database
 %% Previous Request Check
 alt Request Being Reprocessed
 PDF->>LAB: Check for existing PDF orders for this request
 LAB->>LAB: SELECT COUNT(*) FROM pdf_order
 Note right of LAB: WHERE req_no = current_reqno<br/>AND pdf_file = <Full Path>
 alt Existing PDF Records Found
 LAB-->>PDF: Return count of existing records
 %% Retrieve Print Profile for Reuse
 PDF->>LAB: Get existing print profile for reuse
 LAB->>LAB: SELECT print_profile FROM pdf_order
 Note right of LAB: WHERE req_no = current_reqno<br/>AND pdf_file = <Full Path>
 alt Print Profile Found
 LAB-->>PDF: Return existing print profile name
 PDF->>PDF: Mark profile for reuse
 else No Print Profile
 LAB-->>PDF: No print profile found
 PDF->>PDF: Will create new profile
 end
 %% Purge Existing Records
 PDF->>LAB: Remove existing PDF orders to avoid duplicates
 LAB->>LAB: DELETE FROM pdf_order
 Note right of LAB: WHERE req_no = current_reqno<br/>AND pdf_file = <Full Path>
 alt Deletion Successful
 LAB-->>PDF: Existing records removed successfully
 else Deletion Error
 LAB-->>PDF: Database error occurred
 PDF-->>PROC: Return error (-1)
 end
 else No Existing Records
 LAB-->>PDF: No existing PDF records found
 PDF->>PDF: Continue with new PDF order creation
 end
 else New Request Processing
 PDF->>PDF: Skip check for existing records
 end
 %% Print Profile Assignment
 alt Profile Available for Reuse
 PDF->>PDF: Use existing print_profile name from database
 else Create New Print Profile
 PDF->>PDF: Determine profile type based on laboratory
 alt Chemical Pathology
 PDF->>PDF: Set print_profile_name = "CLENQ"
 else Microbiology
 PDF->>PDF: Set print_profile_name = "MBLENQ"
 end
 end
 %% Request Number Processing
 alt Request Marked as Invalid
 PDF->>PDF: Generate special request number for invalid requests
 PDF->>PDF: Extract portion of original request number
 PDF->>PDF: Add "X" prefix to mark as invalid
 Note right of PDF: Format: "X" + 8-digit substring
 else Valid Request
 PDF->>PDF: Use original request number
 end
 %% PDF Order Insertion
 PDF->>LAB: Create PDF order record in database
 LAB->>LAB: INSERT INTO pdf_order
 Note right of LAB: (lab_no, req_no, print_profile, ctr, rslt_ctr,<br/>report_file, pdf_file, report_location_hosp,<br/>report_location, create_datetime, status_datetime, status)<br/>VALUES (labno, pdf_reqno, print_profile, 0, 0,<br/>'NA', full_path, req_locn_hosp, req_locn,<br/>req_registered_date, req_registered_date, 1)
 alt Record Created Successfully
 LAB-->>PDF: PDF order record created successfully
 PDF-->>PROC: Return success (0)
 else Database Error
 LAB-->>PDF: Database error occurred during insertion
 PDF->>PDF: Create rejection log with failure details
 PDF-->>PROC: Return error (-1)
 end
 end
 Note over PROC,VALID: PDF Order Creation Complete
```

### 13. Report Enquiry Cache Creation Sequence (insert_report_enquiry_cache)

```other
sequenceDiagram
 participant PROC as Core Processor
 participant CACHE as Report Cache Processor
 participant LAB as LAB Database
 participant CONFIG as Configuration
 participant VALID as Validator
 Note over PROC,VALID: Report Enquiry Cache Creation Flow
 %% Initialize Processing
 PROC->>CACHE: Initialize report enquiry cache creation
 CACHE->>CACHE: Initialize processing variables
 %% CFS Configuration Check
 alt CFS Configuration Not Loaded (g_cfs_enable = 99)
 CACHE->>CONFIG: Retrieve CFS storage configuration from OpenShift ConfigMap
 Note right of CONFIG: Future revamp implementation:<br/>ConfigMap-based configuration management<br/>replaces database lis_option table lookup
 CONFIG->>CONFIG: Read ENABLE_CFS_STORAGE from ConfigMap
 Note right of CONFIG: ConfigMap<br/>Name: lis-rrc-svc-configmap<br/>Key: ENABLE_CFS_STORAGE
 alt Configuration Found in ConfigMap
 CONFIG-->>CACHE: Return CFS storage setting from ConfigMap
 CACHE->>CACHE: Set global CFS enable flag
 else ConfigMap Access Error
 CONFIG-->>CACHE: ConfigMap retrieval failed
 CACHE->>CACHE: Create rejection log with configuration error
 CACHE-->>PROC: Return error (-1)
 end
 else CFS Configuration Already Loaded
 CACHE->>CACHE: Use existing CFS enable flag
 end
 %% CFS Storage Decision
 alt CFS Storage Disabled (g_cfs_enable != 1)
 %% Cleanup Only Mode
 CACHE->>LAB: Connect to laboratory database
 CACHE->>LAB: Remove existing cache records for request
 LAB->>LAB: DELETE FROM report_enquiry_cache
 Note right of LAB: WHERE reqno = current_reqno
 alt Cleanup Successful
 LAB-->>CACHE: Existing records removed successfully
 CACHE-->>PROC: Return success (cache disabled)
 else Cleanup Error
 LAB-->>CACHE: Database error occurred during cleanup
 CACHE->>CACHE: Create rejection log with cleanup error
 CACHE-->>PROC: Return error (-1)
 end
 else CFS Storage Enabled (g_cfs_enable = 1)
 %% Full Cache Creation Mode
 CACHE->>LAB: Connect to laboratory database
 %% Cleanup Previous Records
 CACHE->>LAB: Remove existing cache records for request
 LAB->>LAB: DELETE FROM report_enquiry_cache
 Note right of LAB: WHERE reqno = current_reqno
 alt Cleanup Successful
 LAB-->>CACHE: Existing records removed successfully
 %% Prepare Cache Data
 CACHE->>CACHE: Set cache creation timestamp
 CACHE->>CACHE: Prepare report enquiry cache record
 Note right of CACHE: Uses request registration date<br/>as effective and cache datetime
 %% Cache Record Creation
 CACHE->>LAB: Create report enquiry cache record
 LAB->>LAB: INSERT INTO report_enquiry_cache
 Note right of LAB: (reqno, profile, ctr, sub_ctr, enforce_single,<br/>cache_datetime, cache_file, pid_group,<br/>effective_datetime, expired, last_access_datetime)<br/>VALUES (current_reqno, 'MBLENQ', 0, 0, 'N',<br/>request_time, pdf_filename, patient_group,<br/>request_time, 'N', null)
 alt Record Created Successfully
 LAB-->>CACHE: Cache record created successfully
 CACHE-->>PROC: Return success (0)
 else Database Error
 LAB-->>CACHE: Database error occurred during insertion
 CACHE->>CACHE: Create rejection log with failure details
 CACHE-->>PROC: Return error (-1)
 end
 else Cleanup Error
 LAB-->>CACHE: Database error occurred during cleanup
 CACHE->>CACHE: Create rejection log with cleanup error
 CACHE-->>PROC: Return error (-1)
 end
 end
 Note over PROC,VALID: Report Enquiry Cache Creation Complete
```