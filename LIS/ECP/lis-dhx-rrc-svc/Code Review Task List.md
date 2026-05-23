# Code Review Task List — lis-dhx-rrc-svc

Based on the C-to-Java migration map in [DESIGN.md](../../../ECP/LIS/lis-dhx-rrc-svc/DESIGN.md).

---

## Legend

| Status | Meaning |
|---|---|
| ⬜ Not started |  |
| 🔄 In progress |  |
| ✅ Reviewed — no issues |  |
| ⚠️ Reviewed — issues found |  |
| 🔧 Fixed |  |

---

## Orchestration Layer

| #   | C Function                            | Java Equivalent                                      | Status | Issues                                                                                                                    |
| --- | ------------------------------------- | ---------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------- |
| 1   | `rrc_process()`                       | `DhxRrcAppServiceImpl.rrcProcess()`                  | ⬜      |                                                                                                                           |
| 2   | `update_outstanding_request_status()` | `EdiRequestService.updateOutstandingRequestStatus()` | 🔧     | High: exception swallowed → wrong rollback behaviour; Medium: two try/catch broke atomicity — both fixed                  |
| 3   | `get_outstanding_request()`           | `EdiRequestService.getOutstandingRequest()`          | 🔧     | High: exception swallowed returns null — fixed (now throws); Medium: null conflates DB error and empty result — fixed (now returns empty list); Low: unused import EdiRequestPk — fixed |
| 4   | `start_process()`                     | `DhxRrcStartProcessService.startProcess()`           | ⬜      |                                                                                                                           |

---

## EDI / Patient Layer

| # | C Function | Java Equivalent | Status | Issues |
|---|---|---|---|---|
| 5 | `select_edi_dh_info()` | `EdiRequestService.selectEdiDhInfoById()` | ⬜ | |
| 6 | `retrieve_edi_testrslt()` | `EdiRequestService.retrieveEdiTestrslt()` | ⬜ | |
| 7 | `amend_edi_rslt()` | `EdiRequestService.amendEdiRslt()` | ⬜ | |
| 8 | `update_edi_status()` | `EdiRequestService.updateEdiStatus()` | ⬜ | |
| 9 | `get_latest_patient()` / `get_pmi()` / `get_patient()` | `PatientService.getLatestPatient()` | ⬜ | |

---

## Request Processing Layer

| # | C Function | Java Equivalent | Status | Issues |
|---|---|---|---|---|
| 10 | `check_sendout_reqno_map()` | `RequestService.selectSendoutReqnoMapByCurrentReqno()` | ⬜ | |
| 11 | `wipeout_request()` | `WipeoutService.wipeoutRequest()` | ⬜ | |
| 12 | `assign_reqno()` | `DhxRrcUtilityServiceImpl.assignReqno()` | ⬜ | |
| 13 | `get_specimen()` | `DhxRrcUtilityServiceImpl.getSpecimen()` | ⬜ | |
| 14 | `generate_patient_encounter()` | `DhxRrcUtilityServiceImpl.generatePatientEncounter()` | ⬜ | |
| 15 | `get_year_prefix()` | `DhxRrcUtilityServiceImpl.getYearPrefix()` | ⬜ | |
| 16 | `construct_testrslt()` | `TransTestrsltService.constructTestrslt()` | ⬜ | |

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
