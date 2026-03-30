---
title: Registration Backend Migration Plan
tags:
  - crs/revamp
  - backend
  - migration
status: in-progress-step5
epic: LISP-21
created: '2026-03-27'
---

# Registration Backend Migration Plan

> [!info] Scope
> This document covers the migration of the **Registration** backend APIs from `lis-crs-spec-ack-svc` to `lis-request-svc`.
> Only the `register` API is planned here. Other APIs will be supplemented in future iterations.
> For the overall registration migration plan see [[Registration Migration Plan]].

---

## 1. Current State (`lis-crs-spec-ack-svc`)

### Entry Point

`CrsRegController.register()` in `lis-crs-spec-ack-svc`:

- Accepts `RegistrationPackingDto` (wraps `ServiceParameterDto` + `RegistrationPackingVo`)
- Manually converts DTO → `ServiceParameterVo` via `ServiceParameterDto.toVo()`
- Sets context via `CrsContext.setCurrentServiceParameter(vo)` and `haRegistrationAppService.setServiceParameter(vo)` — **requiring per-instance injection**
- Calls `haRegistrationAppService.registerInTrans(packing)` (manual dual-transaction via `DynamicDataSourceTransactionHelper` + `oracleTransactionManager`)
- Returns raw `String` (JSON-serialized `ResponseObject`) — not a typed `ResponseEntity`
- Uses SLF4J `logger.info/error` directly

### Service Layers

```
CrsRegController
  └── RegistrationAppServiceImpl.registerInTrans()   ← manual Oracle + Sybase TX open/commit/rollback
        └── register(packing)
              ├── PatientService.selectActivePatient()
              ├── PatientService.insertPatient()            // if newPatient != null
              └── for each RegistrationVo:
                    ├── RegistrationProcessorInterface.extraValidationOnRequestNo()
                    ├── RegistrationProcessorInterface.insertLabSpecificPatientData()
                    ├── RegistrationProcessorInterface.insertCrsRegistrationData()
                    ├── CalendarService.selectCurrentTime()
                    ├── AuditInvoker.logCrsResultAudit()    ← ×2 (patient + request audit types)
                    ├── AuditInvoker.logPatientAudit()      // if auditText != null
                    ├── AuditInvoker.logOperationAudit()
                    └── insertTaskList(requestNo, requestLab, …)
              └── insertTestResult(packing.getTestResults())
```

### Anti-patterns Removed

| Anti-pattern | Location | Replaced With |
|---|---|---|
| `CrsContext.setCurrentServiceParameter(vo)` | Controller | `AbstractService.setServiceParameter()` ThreadLocal |
| `service.setServiceParameter(vo)` per instance | Controller | Same ThreadLocal — no per-instance injection |
| `ServiceParameterDto` in DTO | DTO | `AbstractRequest.serviceParameter` (lis-common `ServiceParameterVo`) |
| Manual dual-transaction (`DynamicDataSourceTransactionHelper` + `oracleTransactionManager`) | App Service | Spring `@Transactional` + `DataSourceContextHolder` |
| Raw `String` return with `JsonHelper.convertObjectToJsonString` | Controller | `ResponseEntity<ResultDataResponse<ResponseObject>>` |
| SLF4J `logger.info/error` | Controller | ALS `info()/warn()` from `AbstractService` |
| `getService(SomeService.class)` via ServiceParameter | Services | Spring `@RequiredArgsConstructor` DI |
| `ResponseObject` with `ro.setRoState(...)` inline | Service return | `ResponseObject.roState` constant + return from service |

---

## 2. Target State (`lis-request-svc`)

### Module Structure

Follows the same multi-module pattern as `lis-patient-svc`.

```
lis-request-svc/                         ← parent POM (packaging=pom)
├── pom.xml                              ← lis-request-svc-parent 1.0.0
├── app/                                 ← Spring Boot server module
│   ├── pom.xml                          ← artifactId: lis-request-svc; depends on client-lib
│   └── src/                             ← controllers, services, repositories, entities
└── client-lib/                          ← thin client library module
    ├── pom.xml                          ← artifactId: lis-request-client; depends on core-api + lis-common
    └── src/
        └── hk.org.ha.lis.request.client/
            ├── model/                   ← all registration VOs
            ├── dto/                     ← RegistrationRequest
            └── RegistrationServiceClient.java
```

### Data Model Ownership

| Model | Final Location | Notes |
|---|---|---|
| 19 request/result VOs | `lis-common` (`hk.org.ha.lis.model.vo`) | ✅ Moved (Step 0d) |
| `RegistrationVo` | `client-lib` | Depends on `LabResultVo` in lis-common |
| `RegistrationPackingVo` | `client-lib` | Depends on `LabTransTestrsltWktVo` in lis-common |
| `RegistrationProcessParameterVo` / Interface | `client-lib` | CRS-specific orchestration |
| `RegistrationRequest` DTO | `client-lib` | ✅ Moved (Step 0c) |
| `ResponseObject` | `client-lib` | Pending move to `lis-common` (D.4) |

---

### Design Principles

- Controller and Service both extend `AbstractService` (from `audit-logging`)
- `ServiceParameterVo` stored in ThreadLocal via `AbstractService.setServiceParameter()` — **no per-instance injection**
- All datasource routing via `DataSourceContextHolder.setCurrentDb(serverName, serverLab, database)` at the controller entry point
- Spring `@Transactional` for transaction management
- Return type: `ResponseEntity<ResultDataResponse<ResponseObject>>` (wraps existing `ResponseObject` shape)
- Logging: `info(functionId, description, content)` / `warn(...)` from `AbstractService`
- All beans wired via `@RequiredArgsConstructor` + `final` fields — no `@Autowired`
- Repository structure: `postgresql/` base → `sybase/` + `temp/` extend base

---

## 3. Files Created (Step 1 ✅)

### VOs — `hk.org.ha.lis.model.vo` in `lis-common` (✅ moved, Step 0d)

| File | Note |
|---|---|
| `StatableVoInterface.java` | State constants interface |
| `AbstractVo.java` | Abstract base with `int state` |
| `LocationIdVo.java` | hospital + Integer key |
| `ReportCopyUnitVo.java` | reportProfile + counter + subCounter |
| `RequestIdVo.java` | hospital + labNo + requestNo |
| `AuditVo.java` | requestNo + auditType + auditText + hkid |
| `RequestDetailVo.java` | All request detail fields; validation groups removed (backend concern) |
| `RequestDataVo.java` | doctorReference + clinicalDetails + comment; `StringHelper` replaced with `stripTrailing()` |
| `ReportCopyVo.java` | Full report copy fields |
| `RequestProfileDetailVo.java` | Alpha code + lab + date; `@JsonSubTypes` for `UsidRequestProfileDetailVo` |
| `UsidVo.java` | Specimen identifier fields; `getDisplaySpecimen()` simplified |
| `UsidRequestProfileDetailVo.java` | Extends `RequestProfileDetailVo` + USID list |
| `RequestInfoVo.java` | Core request info; `@JsonSubTypes` for `UsidRequestInfoVo`; `PatientInfoVo`/`EncounterInfoVo` from `lis-common` |
| `UsidRequestInfoVo.java` | Extends `RequestInfoVo` + usids list |
| `GroupVo.java` | Minimal stub with `@JsonIgnoreProperties(ignoreUnknown = true)` — result-only fields omitted |
| `LabResultViewVo.java` | type + name + `List<GroupVo>` |
| `LabResultVo.java` | requestInfo + `PatientVo` (lis-common) + labResultViews |
| `TransTestrsltWktVo.java` | All result worksheet fields |
| `LabTransTestrsltWktVo.java` | Extends `TransTestrsltWktVo` + labNo |

### VOs remaining in `client-lib` — `hk.org.ha.lis.request.client.model`

| File | Note |
|---|---|
| `RegistrationVo.java` | labResult + alphaCodes; depends on `LabResultVo` in lis-common |
| `RegistrationPackingVo.java` | Top-level packing VO; `PatientVo` + `LabTransTestrsltWktVo` from lis-common |
| `RegistrationProcessParameterVoInterface.java` | Interface + `@JsonDeserialize(as = RegistrationProcessParameterVo.class)` |
| `RegistrationProcessParameterVo.java` | All process parameter fields; `AuditVo` from lis-common |
| `ResponseObject.java` | roState + isRollback; SUCCESS/FAIL/REQUEST_NO_INVALID_FORMAT constants (D.4: pending lis-common move) |

### DTO — `hk.org.ha.lis.request.client.dto` (✅ moved to `client-lib`, Step 0c)

| File | Description | Final Owner |
|---|---|---|
| `RegistrationRequest.java` | Extends `AbstractRequest`; adds `@NotNull @Valid RegistrationPackingVo packing` | `client-lib` |

### Client — `hk.org.ha.lis.request.client` (✅ created, Step 0c)

| File | Description |
|---|---|
| `RegistrationServiceClient.java` | Extends `AbstractRestClient`; `@ConditionalOnProperty(prefix="lis.client.clients.lis-request-service", name="base-url")`; exposes `register(RegistrationRequest)` → `ResultDataResponse<ResponseObject>` |

### Services — `hk.org.ha.lis.request.service`

| File | Status | Pending (Step 3) |
|---|---|---|
| `PatientRegistrationService.java` | ✅ Implemented | selectActivePatient + insertPatient via `PatientRepository` |
| `RegistrationProcessorService.java` | ✅ Implemented | extraValidation (bool) + `insertCrsRegistrationData` → `crs_request` + `crs_request_detail` + `crs_request_copy_hist`; replaces erroneous `DrequestRepository` usage |
| `RegistrationAuditService.java` | ✅ Implemented | logCrsResultAudit / logPatientAudit / logOperationAudit via ALS log; Oracle pending D.2 |
| `TaskListService.java` | ✅ Implemented | insertTaskList via `LisgTaskListRepository` |
| `TestResultService.java` | ✅ Implemented | insertTestResult via `TransTestrsltWktRepository.saveAll()` |
| `RegistrationService.java` | ✅ Full orchestration | All sub-services implemented ✅ |

### Controller — `hk.org.ha.lis.request.controller`

| File | Status |
|---|---|
| `RegistrationController.java` | ✅ `POST /api/registration/register` — fully wired |

---

## 4. DataSource Switching

```java
// Controller entry — set once using ServiceParameterVo
DataSourceContextHolder.setCurrentDb(
    sp.getServerName(),
    sp.getServerLab(),
    DatabaseConstants.LAB_DB
);
```

---

## 5. Transaction Handling

Spring `@Transactional` on `RegistrationService.register()`.

> [!warning] JTA Decision (D.2)
> If Oracle audit writes must be atomic with PostgreSQL writes, set `jta.enabled: true` in `application.yml`. Otherwise `@Transactional` on the PostgreSQL datasource alone is sufficient.

---

## 6. Remaining Implementation Steps

### Step 0 — Module Restructure ✅

- [x] **0a** — Convert `lis-request-svc/pom.xml` to parent POM (`packaging=pom`, `artifactId=lis-request-svc-parent`, modules: `client-lib`, `app`)
- [x] **0b** — Create `app/pom.xml` (inherits parent; depends on all server libs + `lis-request-client`); move `src/` → `app/src/`
- [x] **0c** — Create `client-lib/pom.xml` (`artifactId=lis-request-client`; depends on `core-api` v1.0.2 + `lis-common`); copy all 24 VOs to `client-lib/.../client/model/`; copy `RegistrationRequest` to `client-lib/.../client/dto/`; create `RegistrationServiceClient extends AbstractRestClient`; delete old copies from `app/`; update all imports in `app/`
- [x] **0d** — Moved all 19 request/result VOs (including `LabResultVo`, `TransTestrsltWktVo`, `LabTransTestrsltWktVo`) to `lis-common` (`hk.org.ha.lis.model.vo`); D.6 moot — transitive deps all moved together; `lis-common` installed to local Maven repo
  - ✅ `TransTestrsltWktVo` + `LabTransTestrsltWktVo` confirmed in `hk.org.ha.lis.model.vo`; `RegistrationPackingVo` (client-lib) imports `LabTransTestrsltWktVo` from `lis-common`
- [x] **0e** — Verified `mvn compile` passes: parent → `lis-request-client` → `lis-request-svc` all BUILD SUCCESS ✅

### Step 2 — Dependency / lis-common cleanup
- ~~[ ] Move 24 VOs from `model.vo.registration` to `lis-common` (D.1)~~ (superseded by Step 0c/0d)
- [ ] Move `ResponseObject` to `lis-common` (D.4)
- ~~[x] Move `TransTestrsltWktVo` + `LabTransTestrsltWktVo` to `lis-common` after D.6 evaluation (Step 0d)~~ ✅ done — `hk.org.ha.lis.model.vo`

### Step 3 — Create Repositories ✅
- [x] `PatientRepository` in `postgresql/`, `SybasePatientRepository` in `sybase/`, `PostgresPatientRepository` in `temp/`
- [x] `TransTestrsltWktRepository` in `postgresql/`, `SybaseTransTestrsltWktRepository` in `sybase/`, `PostgresTransTestrsltWktRepository` in `temp/` (table: `trans_testrslt_wkt`; composite PK via `TransTestrsltWktPk`)
- [x] `LisgTaskListRepository` in `postgresql/`, `SybaseLisgTaskListRepository` in `sybase/`, `PostgresLisgTaskListRepository` in `temp/` (table: `lisg_tasklist`; D.3 confirmed)
- [x] `DrequestRepository` — pre-existing; no changes
- [x] `CrsRequestRepository` in `postgresql/`, `SybaseCrsRequestRepository` in `sybase/`, `PostgresCrsRequestRepository` in `temp/` (table: `crs_request`; composite PK via `CrsRequestPk`)
- [x] `CrsRequestDetailRepository` in `postgresql/`, `SybaseCrsRequestDetailRepository` in `sybase/`, `PostgresCrsRequestDetailRepository` in `temp/` (table: `crs_request_detail`; surrogate PK `req_serial`)
- [x] `CrsRequestCopyHistRepository` in `postgresql/`, `SybaseCrsRequestCopyHistRepository` in `sybase/`, `PostgresCrsRequestCopyHistRepository` in `temp/` (table: `crs_request_copy_hist`; surrogate PK `reqcp_serial`)
- [x] `@RepositoryType(LAB_SPECIFIC, LAB_DB)` applied on all base repositories
- [x] `Patient` entity updated to composite PK (`patEncounter` + `patHospital`) via `@IdClass(PatientPk.class)`; `pk/PatientPk.java` created
- [x] `PatientRepository` PK type updated to `PatientPk`
- [x] `CrsRequest.java` entity (43 columns, composite PK `reqReqno`+`reqRegisteredDate`) and `pk/CrsRequestPk.java` created
- [x] `CrsRequestDetail.java` entity (surrogate PK `req_serial`) created
- [x] `CrsRequestCopyHist.java` entity (surrogate PK `reqcp_serial`) created
- [x] `mvn compile` — BUILD SUCCESS (all 3 modules) ✅

### Step 4 — Implement Sub-Services ✅
- [x] `PatientRegistrationService.selectActivePatient()` — `PatientRepository.findByPatEncounterAndPatHospital()` (hospital from ThreadLocal `ServiceParameterVo`); falls back to `findFirstByPatEncounter()` when hospital is null; maps entity → `PatientVo`
- [x] `PatientRegistrationService.insertPatient()` — maps `PatientVo` → `Patient` entity; `PatientRepository.save()`
- [x] `RegistrationProcessorService.extraValidationOnRequestNo()` — validates request number is non-null/non-blank; base is no-op in legacy, returns `boolean`
- [x] `RegistrationProcessorService.insertLabSpecificPatientData()` — no-op (base processor in legacy is empty; lab-specific overrides deferred)
- [x] `RegistrationProcessorService.insertCrsRegistrationData()` — inserts into `crs_request` (always) + `crs_request_detail` (one per alpha code) + `crs_request_copy_hist` (one per report copy); field mapping mirrors `CrsRequestService.convertToCrsRequest()` / `superCreateCrsRequest()` in `lis-crs-spec-ack-svc`; prime/primeType logic for report copies preserved
  - Deferred: `crs_gcrs_request_order` (D.7), `crs_send_out` (D.7), `crs_request_supplement_info` (D.7), USID tables (D.7), `reportMapping()` (D.6)
  - TODO D.5: `req_age_unit` — legacy resolves via `KeywordService`; current fallback = direct Integer parse of `ageUnit` string
- [x] `RegistrationAuditService.logCrsResultAudit()` ×2 — ALS log only; Oracle `AuditInvoker` deferred pending D.2
- [x] `RegistrationAuditService.logPatientAudit()` — ALS log only; Oracle `AuditInvoker` deferred pending D.2
- [x] `RegistrationAuditService.logOperationAudit()` — ALS log only per `AuditVo` entry; Oracle `AuditInvoker` deferred pending D.2
- [x] `TaskListService.insertTaskList()` — builds `LisgTasklist` entity (`TASK_ACTION_CRS_SEND=141`, `TASK_STATUS_OUTSTANDING=0`); `LisgTaskListRepository.save()`
- [x] `TestResultService.insertTestResult()` — maps `List<LabTransTestrsltWktVo>` → `List<TransTestrsltWkt>`; `TransTestrsltWktRepository.saveAll()`
- [x] `mvn compile` — BUILD SUCCESS (all 3 modules) ✅

### Step 5 — Verification
- [ ] Unit test `RegistrationControllerTest` — mock service, verify `ResultDataResponse` shape
- [ ] Unit test `RegistrationServiceTest` — mock sub-services, verify `ResponseObject` state
- [ ] Integration test: POST `/api/registration/register` with test schema; verify `crs_request` + `crs_request_detail` + `crs_request_copy_hist` rows inserted
- [ ] Verify ALS logs with correct `functionId` and `description`
- [ ] Verify `DataSourceContextHolder` routes to correct lab

### Step 6 — Fix `register()` Flow Gaps (see §8.6)
- [ ] **6a** — Add existing-patient check before `insertPatient()` — call `patientRegistrationService.selectActivePatient(encounterIdVo)` first; only insert if null
- [ ] **6b** — After patient insert/find, propagate `patientInfo` + `encounterInfo` onto each `registration.getLabResult().getRequestInfo()`
- [ ] **6c** — Add `setNewPatientData(labResult)` call in the newPatient block (dispatches to strategy)
- [ ] **6d** — Add `registeredDate = now` for `index > 0` registrations in multi-lab batch
- [ ] **6e** — Add `constructOperationAuditsFromLabResult(labResult, operationAudits)` call **before** `logOperationAudit` (dispatches to strategy)
- [ ] **6f** — Update `extraValidationOnRequestNo` to dispatch to strategy for USID format validation

### Step 7 — Lab-Specific Strategy Infrastructure (see §8.7)
- [ ] **7a** — Create `LabRegistrationStrategy` interface in `service/strategy/`
- [ ] **7b** — Create `HaBaseRegistrationStrategy` — USID validation + `constructOperationAuditsFromLabResult` from `requestProfileDetails`
- [ ] **7c** — Wire `Map<Integer, LabRegistrationStrategy>` into `RegistrationProcessorService`; dispatch `beforeCrsRegistration()` and `insertCrsRegistrationLabSpecificData()` in `insertCrsRegistrationData()`
- [ ] **7d** — Update `RegistrationService.register()` to call strategy methods (6c/6e/6f above)

### Step 8 — Lab-Specific Strategy Implementations (see §8.7.3)
- [ ] **8a** — `ApsRegistrationStrategy`: `beforeCrsRegistration` (clear alphaCodes) + `insertCrsRegistrationLabSpecificData` (AP detail/GRequest/transient + testrslt audit)
  - Requires: `CrsApDetail` entity + `CrsApDetailRepository`, `CrsApGRequest` entity + `CrsApGRequestRepository`, `CrsApTransient` entity + `CrsApTransientRepository`
- [ ] **8b** — `BbsRegistrationStrategy`: `setNewPatientData` + `insertLabSpecificPatientData` + `insertCrsRegistrationLabSpecificData` (BB request code/inv + claimed HKID log)
  - Requires: `CrsBbRequestCode` entity + `CrsBbRequestCodeRepository`, `CrsBbRequestInv` entity + `CrsBbRequestInvRepository`
- [ ] **8c** — `CpsRegistrationStrategy`: `insertCrsRegistrationLabSpecificData` (TmpDftLink inserts)
  - Requires: `TmpDftLink` entity + `TmpDftLinkRepository`
- [ ] **8d** — `MbsRegistrationStrategy`: `insertCrsRegistrationLabSpecificData` (MB request/testinfo)
  - Requires: `CrsMbRequest` entity + `CrsMbRequestRepository`, `CrsMbTestinfo` entity + `CrsMbTestinfoRepository`
- [ ] **8e** — `VrsRegistrationStrategy`: delegates to `MbsRegistrationStrategy`
- [ ] **8f** — `mvn compile` — BUILD SUCCESS

### Step 9 — Pre-Registration API Endpoints (see §8.7.4)
- [ ] **9a** — `POST /api/registration/gather-patient-info` — patient info gathering with lab-specific hooks (BBS: blood history, PID check, cluster info, claimed HKID)
- [ ] **9b** — `POST /api/registration/gather-patient-info-by-hkid` — HKID-based patient info gathering
- [ ] **9c** — `POST /api/registration/gather-validation-info` — validation info (BBS: ABO/Rh1 check, previous T&S request)
- [ ] **9d** — `POST /api/registration/pre-registration` — pre-registration processing (BBS: autologous blood + request number generation)
- [ ] **9e** — `POST /api/registration/check-duplicate` — duplicate test request check (MBS: `selectMbsDuplicate`)

### Step 10 — Request Construction API (see §8.7.5)
- [ ] **10a** — `POST /api/registration/construct-request` — loads existing registration from DB via `retrieveCrsRequest(reqNo)` + lab-specific `setLabSpecificRequestData()`
- [ ] **10b** — Implement lab-specific `setLabSpecificRequestData()` per strategy (CPS: TmpDftLink, APS: AP detail/GRequest/transient/followup, BBS: BB request inv/code, MBS: MB request/testinfo)

---

## 7. Open Questions / Decisions

| #   | Question                                                                    | Decision                                                   |
| --- | --------------------------------------------------------------------------- | ---------------------------------------------------------- |
| D.1 | Move `model.vo.registration` VOs to `lis-common`?                           | 19 request/result VOs → `lis-common`; 5 registration-orchestration VOs stay in `client-lib` |
| D.2 | Is JTA needed for atomic Oracle audit + PostgreSQL writes?                  | Pending                                                    |
| D.3 | Confirm `task_list` table name and schema in target PostgreSQL lab database | ✅ `lisg_tasklist`, confirmed from `lis-crs-spec-ack-svc`; `LisgTaskListRepository` created |
| D.4 | `ResponseObject` needs to move to `lis-common`                              | Pending                                                    |
| D.5 | `req_age_unit` in `CrsRequest` — legacy resolves VO string via `KeywordService.selectKeywordFromGroupByCode(ageUnit, "AGE_UNIT")`; current code does direct Integer parse | Pending — direct parse fallback in place; null stored if non-numeric |
| D.6 | `reportMapping()` in base processor — mutates report copies / report destination before `crs_request_copy_hist` insert | Deferred to future iteration |
| D.7 | Conditional tables written by `superCreateCrsRequest()` — `crs_gcrs_request_order`, `crs_send_out`, `crs_request_supplement_info`, USID tables | Deferred to future iterations; TODO comments added in service |
| D.6 | `LabResultVo` circular dependency with `lis-common`?                        | Resolved — all 19 transitive deps moved to `lis-common` together; `LabResultVo` now in `hk.org.ha.lis.model.vo` |

---

## 8. Legacy Class Analysis — Pending Migration

> [!info] Scope
> This section documents the **two RegistrationProcessor hierarchies** and the **CrsRequestService hierarchy** from the legacy backend.
> All classes listed here must be migrated to `lis-request-svc`. As of Step 4, only the base `insertCrsRegistrationData` flow (crs_request + crs_request_detail + crs_request_copy_hist) and base `extraValidationOnRequestNo` are implemented. Everything below represents **additional work** still required.

### 8.1 Class Hierarchy Overview

#### Hierarchy A — Registration-Time Processors (`biz/frontend/request/impl/`)

These processors run **during registration** (called from `RegistrationAppServiceImpl.register()`). They handle patient-info gathering, validation, pre/post-registration hooks, and lab-specific CRS data insertion.

```
RegistrationProcessorInterface  (biz/frontend/request/)  — 12 methods
  └── RegistrationProcessorImpl  (568 lines)
        └── HaRegistrationProcessorImpl  (139 lines)
              ├── RegistrationApsProcessorImpl  (193 lines)
              ├── RegistrationBbsProcessorImpl  (801 lines) ← most complex
              ├── RegistrationCpsProcessorImpl  (111 lines)
              ├── RegistrationMbsProcessorImpl  (~70 lines)
              │     └── RegistrationVrsProcessorImpl  (30 lines)  ← pure subclass
              └── (RegistrationGnsProcessorImpl, RegistrationHmsProcessorImpl, RegistrationImsProcessorImpl — no overrides in this hierarchy)
```

#### Hierarchy B — Request Construction Processors (`biz/registration/impl/`)

These processors run when **constructing a RegistrationVo from an existing request** (e.g. re-opening a saved request). They read lab-specific data from the database and attach it to the RegistrationVo extras map.

```
RegistrationProcessorInterface  (biz/registration/)  — 1 method: constructRequest(reqNo)
  └── AbstractRegistrationProcessor  (300 lines)
        ├── RegistrationProcessorCpsImpl  (108 lines)
        ├── RegistrationProcessorGnsImpl  (61 lines) — no-op
        ├── RegistrationProcessorHmsImpl  (90 lines) — no-op
        ├── RegistrationProcessorImsImpl  (89 lines) — no-op
        ├── RegistrationProcessorApsImpl  (386 lines) ← complex
        ├── RegistrationProcessorBbsImpl  (127 lines)
        ├── RegistrationProcessorMbsImpl  (121 lines)
        └── RegistrationProcessorVrsImpl  (61 lines) — extends MbsImpl
```

#### CrsRequestService Hierarchy

```
AbstractCrsRequestService  (3,434 lines; 14 DAOs)
  └── CrsRequestService  (335 lines; +2 USID DAOs)
```

---

### 8.2 Hierarchy A — Registration-Time Processors (Detail)

#### 8.2.1 RegistrationProcessorImpl (Base — 568 lines)

**File:** `biz/frontend/request/impl/RegistrationProcessorImpl.java`

Extends `AbstractProcessor`. Provides default (no-op) implementations for all 12 interface methods. Implements:

| Method | Behavior |
|---|---|
| `insertCrsRegistrationData(RegistrationVo)` | Calls `handleReportMapInfo()` → `reportMapping()` → `getCrsRequestService().createCrsRequest()` → `insertCrsRegistrationLabSpecificData()` |
| `reportMapping(LabResultVo)` | Complex report-map logic: `RPT_CPY` mode inserts report copies from map; `RPT_DST` mode replaces destination hospital. Uses `getCrsRequestService().selectReportMap()`, `LocationService`, request audit logging |
| `convertReportMapToReportCopyVo()` | Converts a report-map row into a `ReportCopyVo` |
| `selectLocationIdByReportMap()` | Looks up location ID from report map |
| `checkLocationIdExist()` | Validates location exists |

**Stub methods** (to be overridden by lab-specific subclasses):
`gatherRegistrationLabSpecificPatientInformation` (2 overloads), `gatherLabSpecificInformationForValidation`, `processLabSpecificPreRegistration`, `processLabSpecificPostRegistration`, `processLabSpecificPreClose`, `setNewPatientData`, `setNewPatientLabSpecificData`, `gatherRegistrationClusterPatientInformation`, `constructOperationAuditsFromLabResult`, `insertLabSpecificPatientData`, `extraValidationOnRequestNo`, `insertCrsRegistrationLabSpecificData`

#### 8.2.2 HaRegistrationProcessorImpl (139 lines)

**File:** `biz/frontend/request/impl/HaRegistrationProcessorImpl.java`

Extends `RegistrationProcessorImpl`. Adds HA-specific behavior:

| Method | Behavior |
|---|---|
| `getRequestService()` | Returns `RequestService` instance |
| `constructOperationAuditsFromLabResult()` | Builds audit list from `requestProfileDetails` (alpha codes); adds USID-as-reqno audit if `UsidRequestInfoVo` present |
| `extraValidationOnRequestNo()` | Delegates to `validateRequestNoFormatWithUsidSetup()` — validates request number format against USID option values (`DISABLED` → 10-digit only; `ENABLED_ALL` → 12+USID; etc.); throws `LisMessageException` on invalid format |

#### 8.2.3 RegistrationApsProcessorImpl (193 lines)

**File:** `biz/frontend/request/impl/RegistrationApsProcessorImpl.java`

Extends `HaRegistrationProcessorImpl`. APS (Anatomical Pathology) specific.

| Method | Behavior |
|---|---|
| `insertCrsRegistrationData(RegistrationVo)` | **Overrides base** — calls `registration.setAlphaCodes(Collections.emptyList())` before calling `super.insertCrsRegistrationData()` (APS does not insert `crs_request_detail` rows); then inserts AP-specific data + logs `testrslt` audit |
| `insertCrsRegistrationLabSpecificData(RegistrationVo)` | Inserts `CrsApDetail`, `CrsApGRequest`, `CrsApTransient` via `getCrsRequestService()` |

**Dependencies:** `getCrsRequestService().insertCrsApDetail()`, `.insertCrsApGRequest()`, `.insertCrsApTransient()`, `AuditInvoker.logCrsResultAudit()`

#### 8.2.4 RegistrationBbsProcessorImpl (801 lines)

**File:** `biz/frontend/request/impl/RegistrationBbsProcessorImpl.java`

Extends `HaRegistrationProcessorImpl`. BBS (Blood Bank) specific. **Most complex** lab-specific processor.

**Services used:** `BbRequestService`, `OptionService` (×2 — general + BBS-specific), `PatientService` (×2 — general + CRS), `AuditService`, `PatientBloodHistoryService`, `RequestService`, `ResultService`, `BloodInventoryService`, `CounterService`, `KeywordService`

| Method | Behavior |
|---|---|
| `gatherRegistrationClusterPatientInformation(ro, hkid)` | Overload 1 — delegates to overload 2 with skip-PID sentinel |
| `gatherRegistrationClusterPatientInformation(ro, hkid, hkidKey, encounterIdVo)` | Complex cross-server patient PID group verification. Queries `getCrsPatientService().selectPatientActivePidGroupByPid()`, `selectActivePatient()`, `selectLatestPatient()`. Retrieves `PatientBloodHistoryVo`, cluster blood history, and claimed HKID info (option-gated) |
| `gatherRegistrationLabSpecificPatientInformation(ro)` | Extracts hkidKey/hkid/encounter from `ro.getPatient()` → delegates to `gatherRegistrationBbsPatientInformation()` |
| `gatherRegistrationBbsPatientInformation(ro, encounterIdVo, hkidKey, hkid)` | Calls `gatherRegistrationClusterPatientInformation`; then checks `AUTO_PID_CHECK_ENABLED` option → if enabled and request count=0, updates PID lab check status; retrieves `notCheckedPidChecks` |
| `gatherLabSpecificInformationForValidation(criteria, ro)` | Delegates to `gatherBbsInformationForValidation()` |
| `gatherBbsInformationForValidation(criteria, ro)` | Checks `HISTORICAL_ABO_CHECK_CRITERIA` option → queries `ResultService.selectAuthorizedResultsCount()` for ABO/Rh1 test; gathers previous T&S request via `RequestService.selectPreviousRequestByGroup()` |
| `processLabSpecificPreRegistration(criteria, ro)` | Calls `gatherAutologousBloodInformation()` + `generateRequestNumber()` |
| `gatherAutologousBloodInformation(criteria, ro)` | For Component/T&S tests: queries `ResultService.selectNumericResultSum()` (autologous at HKRC), `BloodInventoryService.selectBloodInvCount()` ×5 (quarantine/available/reserved blood + components), `KeywordService.selectKeywords("PRODTYPE")` for cellular/component types |
| `generateRequestNumber(criteria, ro)` | Auto-generates request number with lab prefix based on BBS test type (`TS`/`COMP`/`OTHER`), using `CounterService.getLabSpecCounterNewTran()` + `RequestService.generateNewRequestNo()` with retry loop (max 5) |
| `setNewPatientLabSpecificData(labResultVo)` | Sets `hkidKey` on all `BbRequestCodeVo` entries and `pidGroup` on all `BbRequestInvVo` entries from the extras map |
| `insertCrsRegistrationLabSpecificData(registration)` | Calls `insertCrsBbRequestCode()` + `insertCrsBbRequestInv()` |
| `insertCrsBbRequestInv(registrationVo)` | Calls `insertClaimHkidPatAmendLog()` first (if claimed HKID exists — builds `PatAmendLogVo` and calls `AuditService.insertPatientAmendLog()`), then delegates to `getCrsRequestService().insertCrsBbRequestInv()` |
| `insertLabSpecificPatientData(patient)` | For non-BTH/non-CUH servers: queries `PatientBloodHistoryService.selectPatientBloodHistoryByPidKey()` |

#### 8.2.5 RegistrationCpsProcessorImpl (111 lines)

**File:** `biz/frontend/request/impl/RegistrationCpsProcessorImpl.java`

Extends `HaRegistrationProcessorImpl`. CPS (Chemical Pathology) specific.

| Method | Behavior |
|---|---|
| `insertCrsRegistrationLabSpecificData(registration)` | Inserts `TmpDftLink` records via `RequestRelationService.insertTmpDftLink()` for each `TmpDftLinkVo` in the extras map |

**Dependencies:** `RequestRelationService.insertTmpDftLink()`

#### 8.2.6 RegistrationMbsProcessorImpl (~70 lines)

**File:** `biz/frontend/request/impl/RegistrationMbsProcessorImpl.java`

Extends `HaRegistrationProcessorImpl`. MBS (Microbiology) specific.

| Method | Behavior |
|---|---|
| `insertCrsRegistrationLabSpecificData(registration)` | Calls `getCrsRequestService().insertCrsMbRequest()` + `getCrsRequestService().insertCrsMbTestInfo()` |
| `checkDuplicatedTestRequest(reqNo, hkidKey, alphaCodes, isNewPatient)` | Overrides base — calls `getRequestService().selectMbsDuplicate(...)` to check for duplicate MBS requests |

**Dependencies:** `getCrsRequestService().insertCrsMbRequest()`, `.insertCrsMbTestInfo()`, `RequestService.selectMbsDuplicate()`

#### 8.2.7 RegistrationVrsProcessorImpl (30 lines)

**File:** `biz/frontend/request/impl/RegistrationVrsProcessorImpl.java`

Extends `RegistrationMbsProcessorImpl`. **Pure subclass** — inherits all MBS behavior. No overrides.

#### 8.2.8 GNS / HMS / IMS Processors

No lab-specific overrides in Hierarchy A. Use base `RegistrationProcessorImpl` / `HaRegistrationProcessorImpl` behavior directly.

---

### 8.3 Hierarchy B — Request Construction Processors (Detail)

#### 8.3.1 AbstractRegistrationProcessor (Base — 300 lines)

**File:** `biz/registration/impl/AbstractRegistrationProcessor.java`

Extends `AbstractProcessor`, implements both `RegistrationProcessorInterface` (small) and `RegistrationProcessExecutorInterface`.

| Method | Behavior |
|---|---|
| `constructRequest(String reqNo)` | Calls `getCrsRequestService().retrieveCrsRequest(reqNo)` → `setLabSpecificRequestData()` → returns `RegistrationVo` |
| `setRequestProfileDetailData()` | Reads `requestProfileDetails` from the RegistrationVo and sets them on individual extras |
| `getReqNo()` / `getRegistertedDate()` | Accessors for current request number and registered date |
| `getCrsRequestService()` / `getRequestService()` | Lazy-init factory methods returning service instances |

**Abstract methods:** `getLabNo()`, `setLabSpecificRequestData()`

#### 8.3.2 Lab-Specific Processors — `setLabSpecificRequestData()` Behavior

| Processor | Lab | `setLabSpecificRequestData()` | Dependencies |
|---|---|---|---|
| `RegistrationProcessorCpsImpl` (108 lines) | LAB_NO_CPS | Loads `List<TmpDftLinkVo>` from `RequestRelationService.selectCrsTmpDftLink(reqNo)` → puts into extras map | `RequestRelationService` |
| `RegistrationProcessorGnsImpl` (61 lines) | LAB_NO_GNS | No-op | — |
| `RegistrationProcessorHmsImpl` (90 lines) | LAB_NO_HMS | No-op | — |
| `RegistrationProcessorImsImpl` (89 lines) | LAB_NO_IMS | No-op | — |
| `RegistrationProcessorApsImpl` (386 lines) | LAB_NO_APS | Complex — loads `ApDetailVo`, `ApGRequestVo`, `ApTransientVo`, followup data from CrsRequestService; skips `setRequestProfileDetailData()`; has `triggerLisTrInsApRequest()` (Oracle trigger simulation) | `CrsRequestService`, Oracle trigger |
| `RegistrationProcessorBbsImpl` (127 lines) | LAB_NO_BBS | Loads `BbRequestInvVo` + `BbRequestCodeVo` from CrsRequestService → puts into extras map | `CrsRequestService` |
| `RegistrationProcessorMbsImpl` (121 lines) | LAB_NO_MBS | Loads `MbRequestVo` + `MbTestinfoVo` (conditional: skipped for BTH/CUH servers) from CrsRequestService → puts into extras | `CrsRequestService` |
| `RegistrationProcessorVrsImpl` (61 lines) | LAB_NO_VRS | Only overrides `getLabNo()` to return LAB_NO_VRS; inherits MBS behavior | Same as MBS |

---

### 8.4 CrsRequestService Hierarchy (Detail)

#### 8.4.1 AbstractCrsRequestService (3,434 lines)

**File:** `biz/service/AbstractCrsRequestService.java`

Massive data-access class with **14 DAO interfaces**:
`crsRequestDao`, `crsRequestDetailDao`, `crsRequestCopyHistDao`, `crsMbRequestDao`, `crsMbTestinfoDao`, `crsBbRequestCodeDao`, `crsApRequestDao`, `crsApGRequestDao`, `crsApTransientDao`, `crsSiteDao`, `crsGcrsRequestOrderDao`, `crsSendOutDao`, `crsBbRequestInvDao`, `crsRequestSupplementInfoDao`, `reportMapDao`

**Key methods for Registration:**

| Method | Lines ~  | Behavior |
|---|---|---|
| `createCrsRequest(RegistrationVo)` | 1489–1700 | Master insert: `crs_request` (always) + `crs_request_detail` (per alpha code) + `crs_request_copy_hist` (per report copy) + `crs_gcrs_request_order` (conditional) + `crs_send_out` (conditional) + `crs_request_supplement_info` (conditional via `handleRequestSupplementInfo()`) |
| `retrieveCrsRequest(String reqNo)` | 2110–2200 | Reads `crs_request` + joins `crs_request_detail` + `crs_request_copy_hist` → builds `RegistrationVo` with extras |
| `insertCrsApDetail(RegistrationVo)` | ~2870 | Inserts `crs_ap_detail` row from AP extras |
| `insertCrsApGRequest(RegistrationVo)` | ~2900 | Inserts `crs_ap_g_request` rows from AP extras |
| `insertCrsApTransient(RegistrationVo)` | ~2930 | Inserts `crs_ap_transient` row from AP extras |
| `insertCrsMbRequest(RegistrationVo)` | ~3000 | Inserts `crs_mb_request` from MB extras |
| `insertCrsMbTestInfo(RegistrationVo)` | ~3030 | Inserts `crs_mb_testinfo` rows from MB extras |
| `insertCrsBbRequestInv(RegistrationVo)` | ~3100 | Inserts `crs_bb_request_inv` rows from BB extras |
| `insertCrsBbRequestCode(RegistrationVo)` | ~3130 | Inserts `crs_bb_request_code` rows from BB extras |
| `selectReportMap(String reqHosp)` | ~3200 | Queries `report_map` for hospital |
| `handleReportMapInfo()` | ~3250 | Pre-processes report map before insert |
| `hasCrsRequests(Long hkidKey)` | ~3350 | Checks if patient has recent CRS requests |
| `handleRequestSupplementInfo()` | base returns false | Overridden in CrsRequestService for BTH |
| `convertToCrsRequest()` / `convertToCrsRequestDetail()` / `convertToCrsRequestCopyHist()` | various | VO → entity conversion logic |

#### 8.4.2 CrsRequestService (335 lines)

**File:** `biz/service/CrsRequestService.java`

Extends `AbstractCrsRequestService`. Adds USID support.

**Additional DAOs:** `crsUsidRelationMasterDao`, `crsUsidProfileRelationDao`

| Method | Behavior |
|---|---|
| `createCrsRequest(RegistrationVo)` | Calls `super.createCrsRequest()` then checks if `requestInfoVo instanceof UsidRequestInfoVo` → calls `insertCrsUsidRelations()` |
| `insertCrsUsidRelations()` | Inserts `CrsUsidRelationMaster` + `CrsUsidProfileRelation` records for each USID entry |
| `convertToRequestInfoVo()` | Overrides base to build `UsidRequestInfoVo` with USID data from DB |
| `constructRequestProfileDetailVo()` | Overrides to return `UsidRequestProfileDetailVo` |
| `constructApRequestVo()` / `convertToApRequestVo()` | AP-specific USID conversion overrides |

---

### 8.5 Migration Mapping — What Still Needs to Be Built

#### 8.5.1 New Repositories Required

| Repository | Entity | Table | Used By |
|---|---|---|---|
| `CrsApDetailRepository` | `CrsApDetail` | `crs_ap_detail` | APS insert |
| `CrsApGRequestRepository` | `CrsApGRequest` | `crs_ap_g_request` | APS insert |
| `CrsApTransientRepository` | `CrsApTransient` | `crs_ap_transient` | APS insert |
| `CrsMbRequestRepository` | `CrsMbRequest` | `crs_mb_request` | MBS insert |
| `CrsMbTestinfoRepository` | `CrsMbTestinfo` | `crs_mb_testinfo` | MBS insert |
| `CrsBbRequestInvRepository` | `CrsBbRequestInv` | `crs_bb_request_inv` | BBS insert |
| `CrsBbRequestCodeRepository` | `CrsBbRequestCode` | `crs_bb_request_code` | BBS insert |
| `TmpDftLinkRepository` | `TmpDftLink` | `tmp_dft_link` | CPS insert |
| `CrsUsidRelationMasterRepository` | `CrsUsidRelationMaster` | `crs_usid_relation_master` | USID insert |
| `CrsUsidProfileRelationRepository` | `CrsUsidProfileRelation` | `crs_usid_profile_relation` | USID insert |
| `CrsGcrsRequestOrderRepository` | `CrsGcrsRequestOrder` | `crs_gcrs_request_order` | GCRS conditional insert |
| `CrsSendOutRepository` | `CrsSendOut` | `crs_send_out` | Send-out conditional insert |
| `CrsRequestSupplementInfoRepository` | `CrsRequestSupplementInfo` | `crs_request_supplement_info` | BTH supplement info |
| `ReportMapRepository` | `ReportMap` | `report_map` | Report mapping |

#### 8.5.2 New/Extended Services Required

| Service | Replaces Legacy | Key Methods |
|---|---|---|
| `CrsRequestDataService` | `AbstractCrsRequestService` + `CrsRequestService` | `createCrsRequest()` (full — including GCRS, send-out, supplement, USID), `retrieveCrsRequest()`, all lab-specific inserts, `selectReportMap()`, `hasCrsRequests()` |
| `RegistrationProcessorService` (extend) | Lab-specific processors (Hierarchy A) | Add strategy/dispatch for `insertCrsRegistrationLabSpecificData()` per lab; add `reportMapping()`, `constructOperationAuditsFromLabResult()`, USID validation |
| `RegistrationConstructionService` (new) | Hierarchy B processors | `constructRequest(reqNo)` + lab-specific `setLabSpecificRequestData()` per lab |
| `BbsRegistrationService` (new or embedded) | `RegistrationBbsProcessorImpl` | `gatherRegistrationClusterPatientInformation()`, `gatherBbsInformationForValidation()`, `gatherAutologousBloodInformation()`, `generateRequestNumber()`, `insertClaimHkidPatAmendLog()`, `setNewPatientLabSpecificData()`, `insertLabSpecificPatientData()` |

#### 8.5.3 Strategy Pattern Recommendation

The legacy code uses **class-per-lab polymorphism**. In the Spring migration, replace with a **strategy dispatch pattern**:

```java
// Lab-specific strategy interface
public interface LabRegistrationStrategy {
    String getLabNo();
    void insertLabSpecificData(RegistrationVo registration);
    void setLabSpecificRequestData(RegistrationVo registration);
    // ... other lab-specific hooks
}

// Inject all strategies, dispatch by lab number
@RequiredArgsConstructor
public class RegistrationProcessorService extends AbstractService {
    private final Map<String, LabRegistrationStrategy> strategies;
    
    public void insertCrsRegistrationLabSpecificData(RegistrationVo reg) {
        String labNo = getServiceParameter().getRequestLab();
        LabRegistrationStrategy strategy = strategies.get(labNo);
        if (strategy != null) {
            strategy.insertLabSpecificData(reg);
        }
    }
}
```

**Concrete strategies needed:**
- `ApsRegistrationStrategy` — AP detail/GRequest/transient inserts; empty alphaCodes override; testrslt audit
- `BbsRegistrationStrategy` — BB request code/inv inserts; claimed HKID pat-amend-log; patient blood history; autologous blood; request number generation
- `CpsRegistrationStrategy` — TmpDftLink inserts
- `MbsRegistrationStrategy` — MB request/testinfo inserts; duplicate test check
- `VrsRegistrationStrategy` — extends/delegates to MBS (same behavior, different lab number)
- `GnsRegistrationStrategy` / `HmsRegistrationStrategy` / `ImsRegistrationStrategy` — no-op (or omit from map)

#### 8.5.4 External Service Dependencies (BBS)

BBS is the most complex lab and requires calling services that may live in other microservices:

| Legacy Service | Methods Used | Migration Notes |
|---|---|---|
| `PatientBloodHistoryService` | `selectPatientBloodHistoryByPidKey()`, `selectClusterPatientBloodHistory()` | May need Feign client to `lis-patient-svc` or dedicated BBS patient service |
| `BloodInventoryService` | `selectBloodInvCount()` ×5 | BBS-specific; may need new repository or external service |
| `ResultService` | `selectNumericResultSum()`, `selectAuthorizedResultsCount()` | Cross-cutting — may live in a result microservice |
| `CounterService` | `getLabSpecCounterNewTran()` | Sequence generation — needs careful concurrency handling |
| `KeywordService` | `selectKeywords("PRODTYPE")` | Dictionary service — likely Feign to `lis-dictionary-svc` or `lis-common` cache |
| `RequestService` | `selectRequestCount()`, `selectPreviousRequestByGroup()`, `generateNewRequestNo()`, `selectMbsDuplicate()` | Core request queries — within `lis-request-svc` |
| `PatientService` | `selectActivePatient()`, `selectLatestPatient()`, `selectPatientActivePidGroupByPid()`, `updatePidLabCheck()`, `selectNotCheckedPidChecks()` | Patient queries — Feign to `lis-patient-svc` |
| `OptionService` | `selectOptionValueDetail()` ×multiple | Option/config — likely Feign to config service or local cache |
| `AuditService` | `insertPatientAmendLog()` | Audit — via ALS or Oracle (pending D.2) |
| `LocationService` | Location lookup for report mapping | May be in `lis-common` or Feign |

---

## 9. Progress Summary

| Phase | Total | Done |
|---|---|---|
| VOs created | 24 | 24 ✅ |
| DTO created | 1 | 1 ✅ |
| Controller created | 1 | 1 ✅ |
| RegistrationService created | 1 | 1 ✅ |
| Sub-services (skeleton) | 5 | 5 ✅ |
| Module restructure (Step 0 sub-tasks) | 5 | 5 ✅ |
| RegistrationServiceClient created | 1 | 1 ✅ |
| Sub-service implementations | 10 | 10 ✅ |
| Entities | 6 | 6 ✅ |
| PK classes | 3 | 3 ✅ |
| Repositories (base + sybase + postgres variants) | 18 | 18 ✅ |
| Tests | 3 | 0 |
