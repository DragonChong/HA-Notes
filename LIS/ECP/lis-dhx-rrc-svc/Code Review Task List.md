# Code Review Task List — lis-dhx-rrc-svc

Based on the C-to-Java migration map in [DESIGN.md](../../../ECP/LIS/lis-dhx-rrc-svc/DESIGN.md).

---

## Legend

| Status                     | Meaning |
| -------------------------- | ------- |
| ⬜ Not started              |         |
| 🔄 In progress             |         |
| ✅ Reviewed — no issues     |         |
| ⚠️ Reviewed — issues found |         |
| 🔧 Fixed                   |         |

---

## Orchestration Layer

| #   | C Function                            | Java Equivalent                                      | Status | Issues                                                                                                                    |
| --- | ------------------------------------- | ---------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------- |
| 1   | `rrc_process()`                       | `DhxRrcAppServiceImpl.rrcProcess()`                  | ⬜      |                                                                                                                           |
| 2   | `update_outstanding_request_status()` | `EdiRequestService.updateOutstandingRequestStatus()` | 🔧     | High: exception swallowed → wrong rollback behaviour; Medium: two try/catch broke atomicity — both fixed                  |
| 3   | `get_outstanding_request()`           | `EdiRequestService.getOutstandingRequest()`          | 🔧     | High: exception swallowed returns null — fixed (now throws); Medium: null conflates DB error and empty result — fixed (now returns empty list); Low: unused import EdiRequestPk — fixed |
| 4   | `start_process()`                     | `DhxRrcStartProcessService.startProcess()`           | 🔧     | High: ACK failure rolled back CRS writes — fixed (sendAcknowledgement wrapped in try/catch; failure sets status=10 matching C); Medium: patientVo dead code — deferred (see Enhancement E1 below); Medium: getSpecType() NPE — fixed (null guard added); Low: boxed Integer == — false alarm (Java unboxes correctly) |

---

## EDI / Patient Layer

| #   | C Function                                             | Java Equivalent                           | Status | Issues                                                                                                                                                                                                                                                                                                                                      |
| --- | ------------------------------------------------------ | ----------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 5   | `select_edi_dh_info()`                                 | `EdiRequestService.selectEdiDhInfoById()` | ✅      | Low: `findById` fetches unused columns (`hKId`, `updateDatetime`) — accepted, no fix needed                                                                                                                                                                                                                                                 |
| 6   | `retrieve_edi_testrslt()`                              | `EdiRequestService.retrieveEdiTestrslt()` | 🔧     | High: independent try/catch in selectEdiTestrsltIncludeTestName could return partial data (only GRPCOM) on first-query failure — fixed (exceptions now propagate); Medium: selectEdiTestrslt swallowed exception returning null disguised DB error as "no records" — fixed (exception propagates)                                           |
| 7   | `amend_edi_rslt()`                                     | `EdiRequestService.amendEdiRslt()`        | ⬜      |                                                                                                                                                                                                                                                                                                                                             |
| 7a  | `create_trans_testrslt()`                              | `TransTestrsltService.createTransTestrslt()` | 🔧  | **Medium: ENUM case — `test_attr` null check missing** — C returns 6 when `ind_test_attr` is null; Java skipped check and called `resultMapping(rslt, null)` → NPE or wrong lookup — fixed (throw `TEST_RESULT_TYPE_NOT_MATCH` when `rsltAttr == null`); **Medium: VARCHAR case — single-null check differs from C** — C returns 6 only when BOTH `test_result` AND `test_text` are null; Java threw when only `test_result` was blank even if `test_text` had content — fixed (now checks both blank); **Medium: Sensitivity — `(MIC)` append outside zone-size null guard** — C only appends `(MIC)` to antibiotics key when `ind_zone_size == 0` (inside the null guard); Java appended regardless, causing wrong `result_mapping` key when zone_size is null — fixed (moved `(MIC)` append inside `if (!isBlank(zone_size))` block); action_type 15→26 is intentional revamp remapping ✅; confidential check placement equivalent ✅; MIC comment `ind_numeric/enum/varchar2=null` equivalent to Java null ✅ |
| 8   | `update_edi_status()`                                  | `EdiRequestService.updateEdiStatus()`     | ⬜      |                                                                                                                                                                                                                                                                                                                                             |
| 9   | `get_latest_patient()` / `get_pmi()` / `get_patient()` | `PatientService.getLatestPatient()`       | 🔧     | High: valid=N path throws immediately — accepted (no encounter for valid=N; rejection log is inserted by design); Medium: updatePatientFromPMI returned null on error causing NPE on unboxing + ambiguous null on data=null in 200 response — fixed (returns API_FAIL on error, SUCCESS on 200/null-data); Low: verify getHkpmiPatientbyEnc wrapper parameter order |

---

## Request Processing Layer

| # | C Function | Java Equivalent | Status | Issues |
|---|---|---|---|---|
| 10 | `check_sendout_reqno_map()` | `RequestService.selectSendoutReqnoMapByCurrentReqno()` | 🔧 | High: pre-check call in `rrcProcess` (line 114) was outside try/catch — DB exception aborted entire request loop — fixed (wrapped in try/catch, sets status=10 and continues); Medium: `selectTransTestrsltWktByReqNo` had same exposure — fixed in same block; Low: `@Query` returns single entity, throws `NonUniqueResultException` if duplicate `dh_current_reqno` rows exist — accepted (data integrity enforced at application level) |
| 11 | `wipeout_request()` | `WipeoutService.wipeoutRequest()` | ✅ | Low: `insertTestrsltAudit` — C sets null audit_text for lab 7 (MBS); Java inserts name/pid text for all labs — benign (more data, not less), no fix; Low: 14 of 16 DELETEs share one outer try/catch, failure log says "Exception to wipeout request" without identifying which table — accepted, granular logging in `insertTestrsltAudit` and `deleteTransTestrsltByPreReqNo` compensates |
| 12 | `assign_reqno()` | `DhxRrcUtilityServiceImpl.assignReqno()` | ⬜ | |
| 13 | `get_specimen()` | `DhxRrcUtilityServiceImpl.getSpecimen()` | ⬜ | |
| 14 | `generate_patient_encounter()` | `DhxRrcUtilityServiceImpl.generatePatientEncounter()` | ⬜ | |
| 15 | `get_year_prefix()` | `DhxRrcUtilityServiceImpl.getYearPrefix()` | ⬜ | |
| 16 | `construct_testrslt()` | `TransTestrsltService.constructTestrslt()` | 🔧 | High: no empty-list guard — fixed (RejectionLogException(12)); High: fatal `amendEdiRslt` error not checked post-loop — fixed (RejectionLogException(11)); **High: `amendEdiRslt` suffixes swapped — `prev==0` appended "P" (should be "C"), `prev==1` appended "C" (should be "P") — wrong test_ckey/rslttype for all paired requests — fixed**; **High: missing `createTransTestrslt` for previous result in paired `rslt_ctr==1` path — C falls through to `create_trans_testrslt(i)+insert` after `amend(1)`, Java had no equivalent — fixed (added `createTransTestrslt` + confidential check after `amendEdiRslt(1)` succeeds)**; Medium: `dbConfi == 1`/`== 3` auto-unboxed `Integer` — NPE if `test_confidential` column null — fixed (null-safe `Integer.valueOf().equals()` at both call sites); Low: `dh_previous_reqno` set in `constructSendoutReqnoMap` vs inside C `construct_testrslt` — functionally equivalent ✅; Low: LINE_LBL inserted at `i+1` vs appended to end in C — `rslt_ctr` governs display order — functionally equivalent ✅ |

---

## CRS Write Layer

| # | C Function | Java Equivalent | Status | Issues |
|---|---|---|---|---|
| 17 | `update_sendout_reqno_map()` / `insert_sendout_reqno_map()` | `RequestService.constructSendoutReqnoMap()` + `insertSendoutReqnoMap()` | ⬜ | |
| 18 | `insert_crs_request()` | `RequestService.insertCrsRequest()` | ⬜ | |
| 19 | `insert_request_detail()` | `RequestService.insertCrsRequestDetail()` | ⬜ | |
| 20 | `insert_request_copy_hist()` | `RequestService.insertCrsRequestCopyHist()` | ⬜ | |
| 21 | `insert_mb_request()` | `RequestService.insertCrsMbRequest()` | ⬜ | |
| 22 | `insert_pdf_order()` | `PrintService.insertPdfOrder()` | ⬜ | |
| 23 | `insert_report_enquiry_cache()` | `RequestService.insertReportEnquiryCache()` | ⬜ | |
| 24 | `insert_tasklist()` | `RequestService.insertTasklist()` | ⬜ | |

---

## Acknowledgement Layer

| # | C Function | Java Equivalent | Status | Issues |
|---|---|---|---|---|
| 25 | `get_send_ack_hosp()` | `RrcSendAckService.setCurrentHospitals()` / `getCurrentHospitals()` | ⬜ | |
| 26 | `send_acknowledgement()` | `SendAcknowledgementService.sendAcknowledgement()` | ⬜ | |

---

## Planned Enhancements

| #  | Description | Status | Notes |
|----|---|---|---|
| E1 | Pass `patientVo` to `lis-request-svc` for patient registration | ⬜ | `DhxRrcStartProcessService.startProcess()`: `patientVo` is currently created but unused. When external patient insert via `lis-request-svc` is implemented, `patientVo` should be passed to the service call. |
| E2 | Pass `PatientVo` to `createPatient` API instead of `PatAdmission3Vo` | ⬜ | `PatientService.getLatestPatient()` and `PatientService.newPatient()`: both call `lisPatientSvc.createPatient(patAdmission3Vo)`. Enhance to accept and pass `PatientVo` (built via `convertToPatientVo()`) for a cleaner, VO-based contract aligned with the rest of the service layer. |

---

## Known Gaps (Not Ported — Review for Risk Assessment)

| # | C Feature | Status | Notes |
|---|---|---|---|
| G1 | Deadlock retry (`while retry < MAX_RETRY`) | ⬜ | No equivalent in Java; assess if PostgreSQL deadlocks are a real risk |
| G2 | LOE message queue (`create_message_queue`) | ⬜ | Disabled in C since CEO-55393; confirm no reinstatement required |
| G3 | `sendtoken(ACT_CRS_SEND)` | ⬜ | Daemon notification; confirm downstream still triggered without it |
| G4 | Multi-connection Sybase transactions | ⬜ | Absorbed into Spring `@Transactional`; verify commit/rollback equivalence |
| G5 | PVT (private) case `#ifdef PVT` | ⬜ | Confirm PVT requests are out of scope for this service |
| G6 | `process_status = 98` pre-pass | ⬜ | Confirm pre-pass behaviour not required |
| G7 | Static `currentDhReqNo` / `currentCrsReqNo` fields | ⬜ | Concurrency risk under multiple HTTP threads; assess `ThreadLocal` fix |
