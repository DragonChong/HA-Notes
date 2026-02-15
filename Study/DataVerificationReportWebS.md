# DataVerificationReportWebS

---

## Short Summary

**What it does:** This web service creates a special PDF report called a "Data Verification Report". It's used when a patient's main identification (like an HKID) changes, but they have ongoing lab tests at a hospital. The report helps staff understand which lab tests belong to the patient's *old* ID during a specific hospital visit and checks if related summary lab reports might have been affected by the ID change.

**Why it's needed:** When a patient's ID changes, it can sometimes cause confusion about which lab results belong together, especially in summary reports created around the time of the change. This service generates a report to clarify the situation for a specific hospital visit.

**What information it needs to start:**

- The hospital code.
- The patient's visit or encounter number.
- The patient's *old* ID (before the change).
- The patient's *current* ID (after the change).

**How it works (simply put):**

1. **Checks Inputs:** Makes sure all the needed information is provided.
2. **Finds Patients:** Looks up details for both the old and new patient IDs.
3. **Finds Tests:** Locates the specific lab tests ordered under the *old* ID during that hospital visit.
4. **Analyzes Summaries:** Investigates related summary lab reports generated around the time the ID changed to see if they might have included extra results (under the old ID) or missed results (under the new ID).
5. **Builds Report:** Organizes all this information clearly.

**What you get back:**

- If everything works, you get a **PDF file** containing the report.
- If something goes wrong (like missing information or system errors), you get an **error message** explaining the problem.

In essence, it's a tool to investigate and report on potential lab result confusion caused by patient ID changes during a hospital stay.

---



**Overall Purpose**

This web service (`DataVerificationReportWebS`) is designed to generate a Data Verification Report (DVR) in PDF format. The report seems specifically focused on scenarios where a patient's identifier (like HKID) has changed or been merged, potentially leading to related lab requests being associated with different patient IDs within the same hospital encounter (episode). The service gathers information about lab requests linked to both the initial and current patient identifiers for a specific encounter, identifies related cumulative reports, and presents this information in a consolidated PDF report.

**Main Method: `getDvrReport`**

1. **Input:** Takes `hospCode`, `encounter` number, `initialHkid`, and `currentHkid` as input.
2. **Logging & Input Validation:** Starts by logging the request parameters and checks if any are blank. If so, it returns an error.
3. **Hospital Configuration:**
    - Retrieves a list of relevant hospital codes from a configuration table (`lab_option_master`) using `getHospList()`.
    - Retrieves detailed lab server information (server names, lab numbers) for these hospitals from `lis_lab_server` using `getHospLabList()`. This helps determine which database connections to use for different labs within hospitals.
4. **Patient Information Retrieval:**
    - Initializes a `PatientService`.
    - Attempts to find the *current* patient demographics using the provided `hospCode` and `encounter` by calling an external service (likely HKPMI based on comments and method name `searchHKPMIPatientByCaseNo`). If the current patient isn't found for the given encounter, it returns an error.
    - Iterates through the configured hospitals/labs:
        - For each lab site, it attempts to fetch active patient demographics for the *current* patient using `getActivePatientDemo`.
        - It searches for the *initial* patient using `searchPatientByHkid`.
        - It retrieves the date/time when the patient record merge/amendment occurred using `getMergeDate`.
        - Crucially, it seems to establish the definitive `requestedInitialPatient` details once it finds a site where both initial/current patients and the merge date exist.
5. **Lab Request Retrieval (Core Logic):**
    - Inside the hospital/lab loop:
        - Connects to the specific lab database (e.g., `jdbc/lis-<servername>-s<labno>-lab-db-ds`).
        - **Finds requests linked to the *initial* patient ID within the *current* encounter:** It queries the `request` and `print_audit` tables for requests associated with the `initialPatient`'s PID *before* the `amendActionDate` but belonging to the `currentPatient`'s encounter group. These are stored in `movedEpisodeReqMap`.
        - **Gathers Request Details:** For the requests found above, it queries `request_detail` and `test_dict` to get profile descriptions.
        - **Identifies Cumulative Report Profiles:** It queries `request`, `print_audit`, and `pprofile_style` to find the specific *cumulative* report profile codes (e.g., `CUMREP16`) associated with the initial patient's requests before the merge.
        - **Finds "Extra" Cumulative Reports (Initial Patient):** It queries `request`, `request_copy_hist`, and `pprofile_style` to find requests associated with the *initial* patient's PID group (but *not* in the current encounter) that were generated *after* the moved requests' effective dates but *before* the merge date, matching the cumulative profiles identified earlier. This finds reports that *included* the moved request data before the merge. It keeps track to limit this to the 4 most recent per profile.
        - **Finds "Missing" Cumulative Reports (Current Patient):** It performs a similar query but looks for requests associated with the *current* patient's PID group (again, *not* in the current encounter) generated within the same timeframe (after moved request, before merge). This finds reports under the *new* ID that might have *missed* including the older data from the moved requests due to the merge timing. It also limits this to 4 recent ones per profile.
        - Stores these cumulative report details linked back to the original `movedEpisodeReqMap`.
6. **Data Aggregation & Structuring:**
    - If no relevant requests were found in `movedEpisodeReqMap`, it returns an error (`EXCEPTION_LAB_REQ_NOT_FOUND`).
    - It adds an asterisk `*` to the profile description of moved requests if they have associated cumulative report data.
    - Checks if the initial or current patient details were successfully retrieved. If not, returns specific errors.
    - Populates a `MovedEpisodeVo` with details like hospital, encounter, admission/discharge dates, and specialty from the `requestedCurrentPatient` data.
    - Populates a `DataVerificationReportVo` containing the list of `MovedEpisodeRequestVo` (with their nested cumulative requests), the `initialPatient` details, the `currentPatient` details, and the `MovedEpisodeVo`.
7. **PDF Generation:**
    - Calls the `genReport()` helper method.
    - `genReport()` uses JasperReports (`.jasper` files) and a `PrintHelper` (likely interacting with a reporting service like BRS - Business Report Service) to generate the PDF.
    - It converts the `DataVerificationReportVo` into XML data (`dataXml`) and prepares parameters (`parameterXml`).
    - It calls the reporting service (`printHelper.generateDvrReport`).
    - If successful, it Base64 encodes the resulting PDF byte array.
8. **Response:**
    - Returns a `GetDvrReportResponseElement` containing the original input parameters, the Base64 encoded PDF string (`pdfStr`), or an error message if any step failed.

**Helper Methods:**

- **`getHospList()`:** Queries `lab_option_master` in the corporate database (`JDBC_CORP`) to get a comma-separated list of hospital codes configured for DVR.
- **`getHospLabList(String hospList)`:** Queries `lis_lab_server` in the corporate database for the given hospital list to get server names and lab numbers for specific applications/services (ECPATH5/LAB), organizing them into a nested HashMap (`Hospital -> LabNo -> ServerName`).
- **`genReport(...)`:** Takes the structured report data (`DataVerificationReportVo`), orchestrates the conversion to XML, sets up JasperReport parameters, calls the external reporting service via `PrintHelper`, and returns the Base64 encoded PDF string.

**Key Data Structures (VOs):**

- `PatDemoVo`: Holds patient demographic information (PID, PID group, name, HKID, encounter details, admission/discharge dates, etc.).
- `MovedEpisodeVo`: Represents the specific hospital episode/encounter being reported on.
- `MovedEpisodeRequestVo`: Represents a single lab request associated with the initial patient ID within the target episode. Contains details like request number, effective date, lab type, profile description, and a map of associated `CumulativeReqVo`.
- `CumulativeReqVo`: Represents a request that was part of a cumulative report potentially affected by the patient merge (either including extra data or missing data). Contains request details and the relevant print profile code.
- `DataVerificationReportVo`: The main container object passed to the reporting engine, holding initial/current patient details, episode info, and the list of `MovedEpisodeRequestVo`.

**In Summary:**

This service acts as a specialized reporting tool for a specific clinical scenario: patient ID merges. It meticulously queries across potentially multiple lab databases and a central corporate database to:

1. Identify the initial and current patient records involved in a merge for a given encounter.
2. Find lab requests belonging to the initial patient ID within that encounter.
3. Analyze cumulative reporting history around the time of the merge for *both* patient IDs to identify reports that might show discrepancies (either including the "moved" request data under the old ID or missing it under the new ID).
4. Formats all this complex information into a structured `DataVerificationReportVo`.
5. Generates a user-friendly PDF report using JasperReports and an external reporting service (BRS).

---

## Detailed Summary

**Overall Purpose:**

The `DataVerificationReportImp` web service (`DataVerificationReportWebS`) is designed to generate a specialized PDF report called the Data Verification Report (DVR). Its primary function is to address complexities arising from patient identity merges (e.g., changes in HKID) within the healthcare system. Specifically, it identifies laboratory requests that were originally associated with a patient's *initial* identifier but fall within a hospital encounter linked to their *current* identifier after a merge/update. The report aims to provide a clear picture of these "moved" requests and analyze how associated cumulative lab reports might have been affected by the timing of the patient merge, highlighting potential reporting discrepancies.

**Inputs:**

- `hospCode`: The hospital code where the encounter occurred.
- `encounter`: The specific encounter/episode number.
- `initialHkid`: The patient's identifier *before* the merge/update relevant to this encounter.
- `currentHkid`: The patient's identifier *after* the merge/update relevant to this encounter.

**Outputs:**

- **Success:** A `GetDvrReportResponseElement` object containing the original input parameters and a `pdfStr` field populated with the Base64 encoded string of the generated PDF report.
- **Failure:** A `GetDvrReportResponseElement` object containing the original input parameters and a `errorMessage` field describing the reason for failure (e.g., invalid input, patient not found, database error, PDF generation error).

**Detailed Workflow & Logic:**

1. **Initialization & Validation:**
    - Logs the incoming request details.
    - **Condition:** Checks if any input parameter (`hospCode`, `encounter`, `initialHkid`, `currentHkid`) is blank using `StringHelper.isBlank()`.
    - **Action:** If true, logs an error and returns an `EXCEPTION_INPUT_PARAM` error immediately, as the service cannot proceed without these core identifiers.
    - Retrieves a list of relevant hospital codes configured for DVR from the corporate database (`lab_option_master`) via `getHospList()`. Handles potential exceptions (DB errors, option not found) using a `try-catch` block, returning an error if retrieval fails.
    - Retrieves detailed lab server information (server names, lab numbers) for these hospitals from the corporate database (`lis_lab_server`) via `getHospLabList()`. Handles potential exceptions (DB errors, configuration not found) using `try-catch`, returning an error if retrieval fails.
2. **Patient Identification:**
    - Initializes a `PatientService`.
    - Attempts to fetch the *current* patient's demographics using the `hospCode` and `encounter` by calling an external service (`patientService.searchHKPMIPatientByCaseNo`, likely HKPMI). It catches specific `LisBizException` or `ParseException` during this call but logs them and continues, possibly relying on local LIS DB lookups later.
    - **Condition:** Checks if the `requestedCurrentPatient` object is still `null` after the external call.
    - **Action:** If true (patient not found for the given encounter), logs the failure and returns an `EXCEPTION_CURRENT_PATIENT_NOT_FOUND` error, as the target encounter's patient is essential.
    - Iterates through each hospital and its associated labs identified in `hospLabList`.
    - Within the loop, attempts to fetch *local* LIS database patient demos for both the `currentPatient` (using `hospCode`, `encounter`) and the `initialPatient` (using `initialHkid`) for the specific site (`site` derived from server name). It also fetches the `amendActionDate` (merge timestamp) for the specific encounter/IDs from the local LIS DB.
    - **Condition:** Checks if *either* `currentPatient` or `initialPatient` is `null` for the current site being checked.
    - **Action:** If true, it means the necessary patient records aren't available on this specific LIS instance, so it `continue`s to the next hospital/lab without further processing for this site.
    - **Condition:** Uses a flag `isPdmFound`. If `isPdmFound` is `false` and both patients *and* the `amendActionDate` *are* found for the current site.
    - **Action:** It stores the `initialPatient` details found at this site into `requestedInitialPatient`. This ensures the initial patient details used for the report come from a site confirmed to be involved in the merge event. `isPdmFound` is set to `true` to prevent overwriting these details later.
3. **Lab Request & Cumulative Analysis (Main Loop):**
    - Inside the hospital loop, it iterates through each lab (`labno`, `servName`) associated with that hospital.
    - **Condition:** Skips the entry if `lab` equals "9" (representing the central server entry, not a specific lab).
    - Connects to the specific lab's database (e.g., `jdbc/lis-qmh-s1-lab-db-ds`).
    - Queries `request` and `print_audit` tables for requests matching:
        - `req_pid` = `initialPatient.getPid()`
        - `req_encounter_group` = `currentPatient.getActiveEncounter()`
        - `prtaud_prime = 1` (likely indicating the primary print record)
        - **Conditional:** `prtaud_date < amendActionDate` (if `amendActionDate` is not null).
    - Stores these found requests (representing requests under the old ID within the new encounter's context) in `movedEpisodeReqMap`.
    - **Condition:** Checks if no requests were found (`reqnoStr` is empty) for the initial patient in this specific lab/encounter context.
    - **Action:** If true, closes the lab connection and `continue`s to the next lab, as there's nothing further to analyze for this lab.
    - Retrieves profile descriptions (`test_name`) for the found requests.
    - Identifies the specific cumulative report profile codes (`prtaud_pprofile`, e.g., CUMREP16) associated with the printing of these "moved" requests *before* the `amendActionDate`.
    - **Analyzes "Extra" Cumulative Reports (Initial Patient):** Queries `request`, `request_copy_hist` for requests belonging to the *initial* patient (`req_pid_group`) but *not* the current encounter (`req_encounter_group <> ...`). It looks for requests created *after* the effective date of a "moved" request but *before* the `amendActionDate`, matching the cumulative profiles identified earlier.
        - **Condition:** Limits the results to the 4 most recent (`printProfileCtr < 4`) per unique cumulative print profile code.
        - **Action:** Stores these findings, linking them back to the corresponding `movedEpisodeReq` in its `cumulativeReqMap`. These represent reports generated under the *old* ID that *did* include the data from the moved request before the merge was fully effective.
    - **Analyzes "Missing" Cumulative Reports (Current Patient):** Performs a similar query but looks for requests belonging to the *current* patient (`req_pid_group`).
        - **Condition:** Excludes the original moved request itself (`!cumulativeReq.getReqno().equals(movedEpisodeReq.getReqno())`).
        - **Condition:** Also limits to the 4 most recent per profile (`printProfileCtr < 4`).
        - **Action:** Stores these, linking them to the `movedEpisodeReq`. These represent reports generated under the *new* ID during the transition period that might have *missed* incorporating the historical data from the moved request due to the merge timing.
    - Closes the lab database connection.
4. **Report Data Aggregation:**
    - **Condition:** After looping through all hospitals/labs, checks if `movedEpisodeReqMap` is still empty.
    - **Action:** If true (no relevant requests found anywhere), logs error and returns `EXCEPTION_LAB_REQ_NOT_FOUND`.
    - Iterates through the `movedEpisodeReqMap`.
    - **Condition:** Checks if a request has associated cumulative reports (`getCumulativeReqMap().size() > 0`).
    - **Action:** If true, appends an asterisk (`*`) to the request's `profileDesc` for visual indication on the report.
    - **Condition:** Checks if `requestedInitialPatient` is `null`.
    - **Action:** If true (initial patient details couldn't be definitively sourced), logs error and returns `EXCEPTION_INITIAL_PATIENT_NOT_FOUND`.
    - **Condition:** Checks if `requestedCurrentPatient` is `null` (redundant safety check).
    - **Action:** If true, logs error and returns `EXCEPTION_CURRENT_PATIENT_NOT_FOUND`.
    - Populates the final `DataVerificationReportVo` object with the collected `initialPatient`, `currentPatient`, `episode` details, and the sorted list of `movedEpisodeRequests` (including their nested cumulative report information).
5. **PDF Generation:**
    - Calls the `genReport()` helper method, passing the populated `DataVerificationReportVo`.
    - `genReport` sets up JasperReports parameters (template paths: `dvr.jasper`, `dvr_moved_request.jasper`, etc.).
    - Converts the `DataVerificationReportVo` object to XML data using `XMLHelper`.
    - Calls an external reporting service (likely BRS) via `printHelper.generateDvrReport`, passing the XML data and parameters.
    - **Condition:** Checks the error code returned by the reporting service.
    - **Action:** If the error code is non-zero, throws an exception, caught by the outer block.
    - If successful, Base64 encodes the PDF content received from the reporting service.
    - Catches potential `LisException`, `JAXBException`, or general `Exception` during report generation, logs the error, and returns `EXCEPTION_GEN_PDF_ERROR`.
6. **Cleanup & Response:**
    - Uses `finally` blocks extensively to ensure all opened database connections (`labConn`, `crsConn`), statements (`stmt`, `stmt2`, `pStmt`), and result sets (`rs`) are closed, preventing resource leaks, regardless of whether errors occurred.
    - Returns the final `GetDvrReportResponseElement` containing either the Base64 encoded PDF string or the relevant error message.

**Error Handling Strategy:**

- Proactive validation of inputs.
- Use of `try-catch` blocks around database operations, external service calls, and report generation.
- Specific checks for missing data (patients, requests, configuration).
- Returning distinct, predefined error messages within the response object.
- Extensive logging using `AlsLogWriter` for tracing and debugging.
- Systematic resource cleanup using `finally` blocks.

**Dependencies:**

- Multiple LIS Lab Databases (accessed via JDBC based on server/lab config).
- Corporate Database (`JDBC_CORP`) for configuration (`lab_option_master`, `lis_lab_server`).
- External Patient Lookup Service (e.g., HKPMI, accessed via `PatientService`).
- External Business Report Service (BRS, accessed via `PrintHelper`).
- Java EE/Web Service Libraries (JAX-WS, JAXB).
- JasperReports library (for report templates).
- Apache Commons Codec (for Base64 encoding).
- Internal HA/LIS shared libraries (for logging, DB connections, utilities, VOs).

---

## Detailed Logic

**1. `getDvrReport` Method:**

- **Input Parameter Validation:**
    - `if (StringHelper.isBlank(hospCode) || StringHelper.isBlank(encounter) || StringHelper.isBlank(initialHkid) || StringHelper.isBlank(currentHkid))`: Checks if any of the essential input parameters (`hospCode`, `encounter`, `initialHkid`, `currentHkid`) are null or empty.
    - **Purpose:** Ensures the service has the minimum required information to proceed. If any parameter is missing, it logs an error and returns immediately with an error message (`EXCEPTION_INPUT_PARAM`).
- **Hospital List Initialization (`try-catch` around `getHospList()`):**
    - **Purpose:** Attempts to fetch the list of hospitals configured for DVR. If `getHospList()` throws an exception (e.g., database error or option not found), the `catch` block logs the error and returns with an error message (`EXCEPTION_CONN` or potentially `EXCEPTION_HOSP_OPTION_NOT_FOUND` based on the exception from the helper method).
- **Hospital Lab List Initialization (`try-catch` around `getHospLabList()`):**
    - **Purpose:** Attempts to fetch detailed lab server information for the configured hospitals. If `getHospLabList()` throws an exception (e.g., database error or hospitals not found in `lis_lab_server`), the `catch` block logs the error and returns with an error message (`EXCEPTION_CONN` or `EXCEPTION_HOSP_NOT_FOUND`).
- **Finding Server Hospital Code:**
    - `for (String key : hospLabList.keySet())`: Iterates through the hospital codes obtained from `hospLabList`.
    - `if(hospCode.equals(key))`: Checks if the current hospital key from the map matches the input `hospCode`.
    - **Purpose:** To find the specific entry for the requested hospital in the `hospLabList` map and extract the corresponding central server code (where `labno` is "9") into `serverHospCode`. This seems less critical later as the code iterates through all configured hospitals anyway, but it might have been intended for an initial targeted check.
- **Initial Patient Search (PMI):**
    - `try-catch (LisBizException | ParseException e1)` around `patientService.searchHKPMIPatientByCaseNo()`: Attempts to find the current patient using an external service (likely PMI).
    - **Purpose:** To handle potential business logic errors (`LisBizException`) or date parsing errors (`ParseException`) during the external patient search. If an exception occurs, it logs the error but continues execution (potentially relying on finding the patient in local LIS DB later).
    - `if(requestedCurrentPatient == null)`: Checks if the patient search via PMI failed to find the current patient for the given encounter.
    - **Purpose:** If the primary patient lookup fails, the service cannot proceed reliably. It logs this specific failure and returns with the `EXCEPTION_CURRENT_PATIENT_NOT_FOUND` error.
- **Main Data Gathering Loop (`try-catch (Exception e)`):**
    - **Purpose:** This large `try-catch` block encloses the core logic of iterating through hospitals/labs and querying databases. It catches any general exceptions during this process (database connection issues, SQL errors, etc.), logs them, and returns with a generic database error (`EXCEPTION_DB`).
    - `for (String key : hospLabList.keySet())`: Loops through each hospital configured for DVR.
    - `if(currentPatient == null || initialPatient == null)`: Inside the loop, after attempting to get local patient demos (`getActivePatientDemo`, `searchPatientByHkid`), this checks if either the current or initial patient couldn't be found *for this specific hospital/site*.
    - **Purpose:** If patient details are missing for a site, the service cannot proceed with querying requests for that site. It uses `continue` to skip to the next hospital/site in the loop.
    - `for (Entry<String, String> entry : hospMap.entrySet())`: Loops through each lab (`labno` and `servName`) defined for the current hospital.
    - `if (!"9".equals(lab))`: Checks if the current lab entry is *not* the central server entry ("9").
    - **Purpose:** To skip the central server entry ("9") and only process actual lab-specific databases (Chem Path, Haem, Micro, etc.) for request lookups.
    - **SQL `CASE WHEN` clauses:** Used within several SQL queries.
        - **Purpose:** To translate numeric `req_labno` values into human-readable lab names (e.g., 'Chemical Pathology', 'Haematology').
    - **SQL Conditional Date Filtering (`((amendActionDate != null)?...)`):** Used in multiple queries (`prtaud_date < ?`, `req_effective_date < ?`).
    - **Purpose:** If a merge date (`amendActionDate`) was found, these conditions dynamically add a `WHERE` clause to the SQL query to filter records based on that date (e.g., only include print audit records *before* the merge, or cumulative requests *before* the merge). If `amendActionDate` is `null`, no date filtering is applied for that part of the query.
    - **Building `reqnoStr`:**
        - `if(!StringUtil.isEmpty(reqnoStr))`: Checks if the `reqnoStr` (a comma-separated list of request numbers for SQL `IN` clauses) already contains entries.
        - **Purpose:** To correctly format the string by adding a comma before subsequent request numbers, ensuring a valid SQL `IN (...)` list.
    - **Setting `isPdmFound` Flag:**
        - `if(isPdmFound == false)`: This check appears multiple times.
        - **Purpose:** To capture the `initialPatient` details from the *first* site where both `currentPatient` and `initialPatient` are found *and* an `amendActionDate` exists. Once `isPdmFound` is true, it stops potentially overwriting `requestedInitialPatient` with data from other sites.
    - **Checking for Requests Found:**
        - `if(StringUtil.isEmpty(reqnoStr))`: After querying for initial requests associated with the current encounter, this checks if any requests were found for the current lab.
        - **Purpose:** If no requests were found for the initial patient in this lab/encounter combination, there's no need to proceed with further queries (profile descriptions, cumulative reports) for this specific lab. It closes the connection and `continue`s to the next lab.
    - **Building Profile Description:**
        - `if(lastReq.equals(reqno))`: Checks if the current request number is the same as the previous one processed in the loop.
        - **Purpose:** To append multiple profile descriptions with a comma and space for requests that have more than one profile associated.
    - **Building `reportProfileMap`:**
        - `if(StringUtil.isEmpty(profile))`: Checks if this is the first print profile found for a given request number.
        - **Purpose:** To correctly format the string of print profiles (e.g., `'CUMREP14', 'CUMREP16'`) for use in subsequent SQL `IN` clauses.
    - **Cumulative Report Logic (Initial Patient):**
        - `if(printProfileCtr == null)`: Checks if a counter for a specific print profile (e.g., `CUMREP16`) has been initialized yet.
        - **Purpose:** Initializes the counter to 0 if it's the first time encountering this profile.
        - `if(printProfileCtr < 4)`: Checks if fewer than 4 cumulative requests for this specific print profile have already been added for the initial patient.
        - **Purpose:** Limits the number of "extra" cumulative reports listed per profile to the 4 most recent ones.
        - `if(cumulativePrintProfileMap == null)`: Checks if the map holding cumulative requests (grouped by request number) has been initialized.
        - **Purpose:** Initializes the inner map if it's the first cumulative request found for that specific request number.
        - `if(cumulativePrintProfileMap.get(cumulativeReq.getPrintProfileDesc()) == null)`: Checks if a cumulative request for this *specific print profile* has already been added to the map for the current cumulative request number.
        - **Purpose:** Ensures that only one entry per unique print profile is added for each cumulative request number being tracked.
        - `if(movedEpisodeCumulativeReq!= null)`: Checks if an entry for this cumulative request number already exists in the *moved episode request's* cumulative map.
        - **Purpose:** If it exists, it appends the new print profile code; otherwise, it adds a new entry. This links the found cumulative request back to the original request from the moved episode.
    - **Cumulative Report Logic (Current Patient):** Contains similar conditional checks (`printProfileCtr == null`, `printProfileCtr < 4`, `cumulativePrintProfileMap == null`, etc.) as the initial patient logic.
        - `if(!cumulativeReq.getReqno().equals(movedEpisodeReq.getReqno()))`: An additional check specific to the current patient logic.
        - **Purpose:** To avoid adding the `movedEpisodeReq` itself back into its own list of cumulative reports when checking the current patient's history.
- **Post-Loop Checks:**
    - `if(movedEpisodeReqMap == null || movedEpisodeReqMap.size() <= 0)`: Checks if, after iterating through all hospitals and labs, no relevant requests were found and stored in `movedEpisodeReqMap`.
    - **Purpose:** If no requests related to the initial patient were found in the target encounter across all relevant labs, the report cannot be generated. Logs an error and returns `EXCEPTION_LAB_REQ_NOT_FOUND`.
    - `for(MovedEpisodeRequestVo movedEpisodeReq:movedEpisodeReqMap.values())`: Loops through the found requests.
    - `if(movedEpisodeReq.getCumulativeReqMap().size() > 0)`: Checks if the current request has any associated cumulative reports linked to it (from the logic above).
    - **Purpose:** If cumulative reports exist, it appends an asterisk `*` to the `profileDesc` as a visual indicator on the report.
    - `if(requestedInitialPatient == null)`: Checks if the initial patient details were successfully determined during the loops.
    - **Purpose:** If the initial patient couldn't be definitively identified (e.g., not found in any LIS DB where merge occurred), returns `EXCEPTION_INITIAL_PATIENT_NOT_FOUND`.
    - `if(requestedCurrentPatient == null)`: Although checked earlier after the PMI call, this seems like a redundant safety check before report generation.
    - **Purpose:** Ensures current patient details are available before proceeding; returns `EXCEPTION_CURRENT_PATIENT_NOT_FOUND`.
    - `if(requestedCurrentPatient.getAdmDate() != null)`, `if(requestedCurrentPatient.getDischargeDate() != null)`, `if(requestedCurrentPatient.getSpecialty() != null)`: Checks if specific fields in the current patient data are not null before attempting to use them.
    - **Purpose:** Prevents NullPointerExceptions when setting admission/discharge dates and codes in the `MovedEpisodeVo`.
- **Report Generation (`try-catch (LisException | JAXBException | Exception e)` around `genReport()`):**
    - **Purpose:** Catches exceptions specifically related to report generation (errors from the `PrintHelper`, XML conversion errors (`JAXBException`), or other general errors during the `genReport` call). Logs the specific error and returns `EXCEPTION_GEN_PDF_ERROR`.
- **Resource Cleanup (`finally` block):**
    - `if (crsConn != null)`, `if (labConn != null)`, etc.: Checks if database connections, statements, and result sets were opened.
    - **Purpose:** Ensures that all database resources are properly closed, regardless of whether exceptions occurred, preventing resource leaks.

**2. `getHospLabList` Method:**

- **Database Operation (`try-catch (Exception e)`):**
    - **Purpose:** Catches any exceptions during the connection to the corporate database or execution of the SQL query to get lab server info. Logs the error and throws a new Exception, indicating failure.
- **Result Set Loop (`while (rs.next())`):** Iterates through the rows returned by the query.
- **First Hospital Check (`if (StringUtil.isEmpty(preHosp))`):** Checks if this is the first row being processed.
    - **Purpose:** Initializes `preHosp` with the first hospital code encountered.
- **Same Hospital Check (`if (hosp.equals(preHosp))`):** Checks if the hospital code in the current row is the same as the previous row.
    - **Purpose:** If it's the same hospital, adds the lab number and server name to the *current* `hospInfo` map.
- **New Hospital (`else` block):** Executes when the hospital code changes.
    - **Purpose:** Stores the completed `hospInfo` map for the *previous* hospital (`preHosp`) into the main `hospLabList`. Then, it creates a *new* `hospInfo` map for the *new* hospital and adds the current lab/server info to it. Updates `preHosp`.
- **Handling Last Hospital (`if (!"".equals(hosp))`):** After the loop, checks if any hospitals were processed (`hosp` is not empty).
    - **Purpose:** Ensures that the data for the *last* hospital processed in the loop is added to the `hospLabList`.
- **Final Check (`if (hospLabList.isEmpty())`):** Checks if the final map is empty.
    - **Purpose:** If no valid lab server entries were found for the requested hospitals, throws an exception (`EXCEPTION_HOSP_NOT_FOUND`).
- **Resource Cleanup (`finally` block):** Similar to `getDvrReport`, ensures database resources (`conn`, `ps`, `rs`) are closed.

**3. `getHospList` Method:**

- **Database Operation (`try-catch (Exception e)`):**
    - **Purpose:** Catches exceptions during corporate DB connection or query execution for the DVR hospital list option. Logs the error and throws a `LisException`.
- **Result Check (`if(rs.next())`):** Checks if the query returned at least one row.
    - **Purpose:** If a row exists, it retrieves the `option_text` containing the hospital list.
- **Final Check (`if (hospList.isEmpty())`):** Checks if the `hospList` string is empty after the query attempt.
    - **Purpose:** If the option was not found or was empty in the database, throws an exception (`EXCEPTION_HOSP_OPTION_NOT_FOUND`).
- **Resource Cleanup (`finally` block):** Ensures database resources (`conn`, `pStmt`, `rs`) are closed.

**4. `genReport` Method:**

- **Sorting (`Collections.sort(...)`):** Implicitly uses conditional logic within the `Comparator`'s `compare` method (`req1.getReqno().compareTo(req2.getReqno())`) to determine the order of requests based on their request numbers.
- **Report Service Check (`if(report.getErrorCode() != 0)`):** Checks the error code returned from the `printHelper.generateDvrReport` call.
    - **Purpose:** If the reporting service indicated an error (non-zero error code), it throws an exception containing the error message from the report object.
- **Logging Large Strings (`while (inputXmlLog.length() > loglimit)`):** Checks if the log message string exceeds the defined limit.
    - **Purpose:** Breaks down potentially very long Base64 encoded PDF strings into smaller chunks for logging, preventing excessively large log entries.

This detailed breakdown covers the explicit and implicit conditional logic used throughout the web service to control its flow, handle errors, filter data, and format the final output.

