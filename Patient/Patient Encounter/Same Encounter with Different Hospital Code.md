# Same Encounter with Different Hospital Code

## PatientService

### selectPatientInfo(EncounterIdVo encounterId)

hk.org.ha.lis.biz.report.impl.AbstractReportBatchDistributorProcessor.distributeBatchReportJobs(List, PrintChannelInterface, Integer, boolean, Timestamp)

hk.org.ha.lis.biz.service.PrintService.generateReportBatchDataXml(ReportBatchVo, PrintChannelInterface, List, Timestamp)

hk.org.ha.lis.biz.service.GcrRequestService.isPatientDataDiscrepency(String, String, EncounterIdVo)

hk.org.ha.lis.biz.requestlist.impl.AbstractRequestListingAppProcessor.selectCachedPatientInfo(EncounterIdVo)

hk.org.ha.lis.biz.frontend.enquiry.impl.AbstractResultInquiryProcessor.selectLabEnquiryPlotData(RequestIdVo, int)

### selectPatientInfos(List<String> encounterIds)

hk.org.ha.lis.biz.service.WorksheetService.selectWorksheetResults(int, String, int, String, String, int, int, String, List<CrossLabResultInfoVo>, List<CrossLabResultInfoVo>, Integer, List<WorksheetElementVo>)

### selectPatientId(EncounterIdVo encounterId)

hk.org.ha.lis.biz.report.impl.AbstractReportInquiryProcessor.selectInquiringPatientId(RequestInfoVo)

hk.org.ha.lis.biz.frontend.ada.impl.AdaAppServiceImpl.selectPatientByEncounterNo(String)

### selectPatientDetail(EncounterIdVo encounterId)

hk.org.ha.lis.biz.rrc.impl.RrcWorkerAppServiceImpl.searchPatient(EdiRequestVo)

### ~~selectEncounterInfo(EncounterIdVo encounterId)~~

### selectEncounterId(EncounterIdVo encounterId)

hk.org.ha.lis.biz.frontend.enquiry.impl.AbstractCumulativeEnquiryProcessor.generateReportForSpecialLab(String, String, String, String, boolean, Timestamp, Timestamp, String, List, List, boolean)

hk.org.ha.lis.biz.requestlist.impl.AbstractRequestListRetrieverProcessor.selectRequestInfosByEncounterNo(String, Timestamp, Timestamp, Timestamp, Timestamp, Timestamp, Timestamp, List, int, int, boolean, int)

hk.org.ha.lis.biz.requestlist.impl.CuhRequestListRetrieverProcessorApsImpl.selectRequestInfosByEncounterNo(String, Timestamp, Timestamp, Timestamp, Timestamp, Timestamp, Timestamp, List, int, int, boolean, int)

hk.org.ha.lis.biz.requestlist.impl.CuhRequestListRetrieverProcessorMbsImpl.selectRequestInfosByEncounterNo(String, Timestamp, Timestamp, Timestamp, Timestamp, Timestamp, Timestamp, List, int, int, boolean, int)

hk.org.ha.lis.biz.requestlist.impl.PwhRequestListRetrieverProcessorApsImpl.selectRequestInfosByEncounterNo(String, Timestamp, Timestamp, Timestamp, Timestamp, Timestamp, Timestamp, List, int, int, boolean, int)

hk.org.ha.lis.biz.requestlist.impl.PwhRequestListRetrieverProcessorMbsImpl.selectRequestInfosByEncounterNo(String, Timestamp, Timestamp, Timestamp, Timestamp, Timestamp, Timestamp, List, int, int, boolean, int)

hk.org.ha.lis.biz.requestlist.impl.QehRequestListRetrieverProcessorApsImpl.selectRequestInfosByEncounterNo(String, Timestamp, Timestamp, Timestamp, Timestamp, Timestamp, Timestamp, List, int, int, boolean, int)

hk.org.ha.lis.biz.requestlist.impl.RequestListRetrieverProcessorApsImpl.selectRequestInfosByEncounterNo(String, Timestamp, Timestamp, Timestamp, Timestamp, Timestamp, Timestamp, List, int, int, boolean, int)

hk.org.ha.lis.biz.service.AbstractRequestService.selectRequestInfosByEncounterNo(String, Timestamp, Timestamp, Timestamp, Timestamp, Timestamp, Timestamp, List, int, int, int)

### selectEncounterDetail(EncounterIdVo encounterId)

hk.org.ha.lis.biz.report.impl.AbstractReportBatchDistributorProcessor.distributeBatchReportJobs(List, PrintChannelInterface, Integer, boolean, Timestamp)

hk.org.ha.lis.biz.frontend.report.impl.AbstractReportPrintingProcessor.retrieveReportCopies(RequestIdVo)

hk.org.ha.lis.biz.service.PatientService.updatePatientFromPmi(EncounterIdVo)

### updatePatientFromPmi(EncounterIdVo encounterId)

hk.org.ha.lis.ejb.service.PatientServiceBean.updatePatientFromPmi(EncounterIdVo, ServiceParameterVo)

### updatePatientFromPmiNewTran(EncounterIdVo encounterId)

hk.org.ha.lis.biz.cras.impl.AbstractCrasAlertAppProcessor.selectCachedPatientEncounterInfo(EncounterIdVo)

hk.org.ha.lis.biz.report.impl.AbstractReportBatchRetrieverProcessor.updatePatientData(EncounterIdVo, RequestIdVo)

### selectPatientEncounterInfoMapByKey(EncounterIdVo encounterId)

hk.org.ha.lis.biz.report.impl.AbstractReportGenerationProcessor.derivePatientEncounterInfoMap(EncounterIdVo, PatientInfoVo, EncounterInfoVo)

hk.org.ha.lis.biz.report.impl.AbstractReportChannelDeriverProcessor.selectPatientEncounterInfo(EncounterIdVo)

hk.org.ha.lis.biz.report.impl.AbstractReportingAppProcessor.selectReportToPatientEncounter(EncounterIdVo)

### selectPatientEncounterInfoMap(EncounterIdVo encounterId)

hk.org.ha.lis.biz.cras.impl.AbstractCrasAlertAppProcessor.selectCachedPatientEncounterInfo(EncounterIdVo)

hk.org.ha.lis.biz.frontend.enquiry.impl.AbstractResultInquiryProcessor.selectLabEnquiryRequestInfo(RequestIdVo)

### selectPatientByHkidEncounter(String patEncounter, String patPid)

hk.org.ha.lis.biz.rrc.impl.RrcWorkerAppServiceImpl.searchPatient(EdiRequestVo)

hk.org.ha.lis.biz.rrc.impl.RrcWorkerAppServiceImpl.searchPmi(EdiRequestVo, String)

### selectPmiByHkidEncounter(String ediReqPatPid, String ediDhEncounter)

hk.org.ha.lis.biz.rrc.impl.RrcWorkerAppServiceImpl.searchPmi(EdiRequestVo, String)

### selectPatientByHospEncounter(String caseNo, String hospCode)

hk.org.ha.lis.biz.rrc.impl.RrcWorkerAppServiceImpl.searchPmi(EdiRequestVo, String)

### selectLatestPatients(String hkid, String encNo, String name)

hk.org.ha.lis.biz.frontend.patient.bbs.impl.BbsPatientAppServiceImpl.enquireBbPatient(RequestInfoVo)

hk.org.ha.lis.biz.frontend.enquiry.impl.AbstractCumulativeEnquiryProcessor.generateReportForSpecialLab(String, String, String, String, boolean, Timestamp, Timestamp, String, List, List, boolean)

### selectPatients(String hkid, String encNo, String name)

hk.org.ha.lis.biz.frontend.patient.impl.DhNslPatientAppServiceImpl.selectPatientsByHkidEncName(String, String, String, ServiceParameterVo, String)

hk.org.ha.lis.biz.frontend.patient.impl.PatientAppServiceImpl.selectPatientsByHkidEncName(String, String, String, ServiceParameterVo, String)

### selectDistinctPidGroupsByHkidEncName(String hkid, String encNo, String name)

hk.org.ha.lis.biz.frontend.patient.bbs.impl.BbsPatientAppServiceImpl.enquireBbPatient(RequestInfoVo)

### selectPatientPmiExs(String hkid, String enc, Timestamp startDatetime, Timestamp endDatetime)

hk.org.ha.lis.biz.frontend.patient.impl.PatientAppServiceImpl.selectPatientPmiExs(String, String, Timestamp, Timestamp)

### cancelAdmission(PatientVo patientVo, String updateBy, String updateWs)

hk.org.ha.lis.biz.frontend.patient.impl.PatientAppServiceImpl.deletePatient(PatientVo, ServiceParameterVo, String)

### selectActivePatient(String encounterNo)

hk.org.ha.lis.biz.frontend.request.impl.DhNslAmendRequestAppServiceImpl.amendMother(AmendRequestPackingVo)

hk.org.ha.lis.biz.frontend.request.impl.DhNslAmendRequestAppServiceImpl.amendRequest(AmendRequestPackingVo)

hk.org.ha.lis.biz.frontend.request.impl.LisPhlcLabOrderAppServiceImpl.createPhlcLabOrder(LisPhlcLabOrderCriteriaVo)

hk.org.ha.lis.biz.frontend.request.impl.RegistrationBbsProcessorImpl.gatherRegistrationClusterPatientInformation(GatherRegistrationBbsPatientInformationRoInterface, String, Long, String)

hk.org.ha.lis.biz.frontend.request.impl.RegistrationAppServiceImpl.gatherRegistrationPatientInformation(String, boolean, int[])

hk.org.ha.lis.biz.frontend.printout.impl.SendOutTestFormAppServiceImpl.getPayCode(ResponseObject, LabResultVo)

hk.org.ha.lis.biz.service.BthPatientService.processPatientAmendment(LisCmsMsgLisVo)

hk.org.ha.lis.biz.frontend.request.impl.DhCplcRegistrationAppServiceImpl.register(RegistrationPackingVo)

hk.org.ha.lis.biz.frontend.request.impl.DhNslRegistrationAppServiceImpl.register(RegistrationPackingVo)

hk.org.ha.lis.biz.frontend.request.impl.RegistrationAppServiceImpl.register(RegistrationPackingVo)

hk.org.ha.lis.biz.frontend.worksheet.bbs.impl.BbsWorksheetAppServiceImpl.retrieveBbsWorksheetRsltWiPatientInfo(String)

hk.org.ha.lis.biz.frontend.worksheet.hms.impl.HmsWorksheetAppServiceImpl.retrieveCbcWorksheetResult(String, int)

hk.org.ha.lis.biz.frontend.worksheet.aps.impl.ApsWorksheetAppServiceImpl.retrieveLabResult(String)

hk.org.ha.lis.biz.registration.impl.PoctRegistrationAppService.retrievePatient(DrequestVo)

hk.org.ha.lis.biz.frontend.request.impl.RegistrationAppServiceImpl.selectActivePatient(String)

hk.org.ha.lis.biz.frontend.request.impl.AmendRequestAppServiceImpl.selectLabResult(RequestCriteriaVo)

hk.org.ha.lis.biz.frontend.request.impl.DhNslCancelProcessorImpl.selectLabResult(RequestCriteriaVo)

hk.org.ha.lis.biz.frontend.request.impl.DhNslWipeoutProcessorImpl.selectLabResult(RequestCriteriaVo)

hk.org.ha.lis.biz.service.AbstractRequestService.selectLabResultWithLatestPatient(RequestIdVo)

hk.org.ha.lis.biz.service.GcrRequestService.selectPatient(GcrOrderVo, Integer, String, LoeOrder, boolean, String)

hk.org.ha.lis.biz.service.PatientService.selectPidChecksByEnc(String)

hk.org.ha.lis.biz.frontend.request.impl.DhNslTestMaintenanceAppServiceImpl.selectRequestData(RequestCriteriaVo)

hk.org.ha.lis.biz.frontend.request.impl.TestMaintenanceAppServiceImpl.selectRequestData(RequestCriteriaVo)

hk.org.ha.lis.biz.frontend.request.impl.GcrSpecAckProcessorImpl.updatePatient(GcrOrderVo)

hk.org.ha.lis.biz.service.PatientService.updatePatientByInterface(String, RequestIdVo, String, String)

hk.org.ha.lis.biz.frontend.patient.impl.PatientAppServiceImpl.updatePatientByPmi(PatientVo)

### selectPidChecksByEnc(String encounter)

hk.org.ha.lis.biz.service.PatientService.selectNotCheckedPidChecks(String, String)

hk.org.ha.lis.biz.frontend.patient.impl.PatientAppServiceImpl.selectPidChecks(String, String)



---

## HKPMI

### SP

| **Method**                                                         | **Hospital Source**                                                | **Remarks**                                             |
| ------------------------------------------------------------------ | ------------------------------------------------------------------ | ------------------------------------------------------- |
| GcrRequestService#selectPatient                                    | (LoeOrder) loeOrder.getLoeordSendHosp()                            | Send Hospital                                           |
| PoctRegistrationAppService#retrievePatient                         | (DrequestVo) drequest.getLocnHosp()                                | DREG:<br/>Request Location / Patient Hospital           |
| RegistrationAppServiceImpl#gatherRegistrationPMIPatientInformation | String hospitalCode                                                | Registration:<br/>Hospital in Setup / Selected Hospital |
| PatientUIAppServiceBean#checkHkidOfEncounterNo                     | String hospitalCode                                                | Registration:<br/>Hospital in Setup / Selected Hospital |
| PatientService#updatePatientFromPmi                                | (EncounterIdVo) encounterId.getHospital()                          | Patient Hospital                                        |
| RrcWorkerAppServiceImpl#searchPmi                                  | (LisPtGetPmiByHkidVo) lisPtGetPmiByHkidVo.getHospitalCode()        | lis_pt_get_pmi_by_hkid1                                 |
| GcrSpecAckProcessorImpl#updatePatient                              | (GcrOrderVo) gcrOrder.getSendHospital()                            | Send Hospital                                           |
| PatientService#updatePatientByPatientVo                            | (PatientVo) vo.getEncounterInfoVo().getEncounterId().getHospital() | Patient Hospital                                        |

### API

| **Method**                                                 | **Hospital Source**                       | **Remarks**                        |
| ---------------------------------------------------------- | ----------------------------------------- | ---------------------------------- |
| AbstractEprEnquiryProcessor#getEprAuth                     | getServiceParameter().getHospital()       | Result Enquiry:<br/>Login Hospital |
| PatientService#isDischargedToWardAeCase                    | (EncounterIdVo) encounterId.getHospital() | Patient Hospital                   |
| PatientService#overrideWardDischargedAeCaseEncounterDetail | (EncounterIdVo) encounterId.getHospital() | Patient Hospital                   |

### WS

| **Method**                                   | **Hospital Source**                                                | **Remarks**      |
| -------------------------------------------- | ------------------------------------------------------------------ | ---------------- |
| DhDirectPrintService#derivePrintChannel      | (DhPdfTasklistVo) task.getPatientHospital()                        | Patient Hospital |
| PatientAppServiceImpl#selectLatestPmiPatient | (PatientVo) vo.getEncounterInfoVo().getEncounterId().getHospital() | Patient Hospital |
| DhDirectPrintService#updatePatientInfo       | (DhPdfTasklistVo) task.getPatientHospital()                        | Patient Hospital |

---

# Analysis of misraw_new_profile Logic

Based on the code you've provided, I'll analyze the logic related to misraw_new_profile.

## Overview

The misraw_new_profile appears to be a database table used in a laboratory management system. Based on the code and context, it seems to be related to tracking new or registered profiles in a medical laboratory information system.

## Key Components

### 1. Table Clearing Function

misraw.c

This function:

- Deletes all records from the misraw_new_profile table using an embedded SQL statement
- Checks if the deletion was successful; if not, it logs out of the Sybase database and exits with an error code
- Is called as part of cleaning up or resetting the system state

### 2. Database Context

The system appears to be using Sybase with embedded SQL/C. The code has several database-related elements:

- Database connection handled through login_sybase() function
- SQL communication handled through embedded SQL statements (prefixed with exec sql)
- Error handling using sqlca (SQL Communication Area)

### 3. Related Profile Management

While not directly modifying the misraw_new_profile table beyond clearing it, the code includes several related profile management functions:

- clear_new_reg_profile(): Initializes variables for tracking a new profile
- open_new_reg_profile_cursor(): Sets up a database cursor to query profile data
- fetch_new_reg_profile(): Retrieves profile records
- print_new_reg_profile(): Outputs profile data to files

These functions are likely part of the overall workflow that might eventually use the misraw_new_profile table.

### 4. Program Flow Related to Profiles

The main function includes a section specifically handling new registered profiles:

misraw.cp

## Key Observations

- The code appears to be part of a data export utility for a laboratory information system
2. misraw_new_profile is only explicitly referenced in the clear_misraw_new_profile() function
- The code seems to be organized around generating various report files (with extensions like .np, .nt, etc.)
- The system handles various types of laboratory data including:
- New registered profiles (np)
- New registered tests (nt)
- Extra-added profiles (xp)
- Extra-added tests (xt)
- Cancelled & deleted tests (dt)
- There's specific hospital/database configuration for different environments:
- TMH (Production, Testing, Development)
- QEH (Production, Testing, Debug)
- PYN (Production, Testing, Debug)
- QMH (Production, Testing, Debug)

Without more context about how this table is populated, it seems misraw_new_profile might be a temporary storage table that's cleared before each run and potentially populated by other parts of the system not shown in these files.

