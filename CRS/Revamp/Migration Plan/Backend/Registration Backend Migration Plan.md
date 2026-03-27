---
title: Registration Backend Migration Plan
tags:
  - crs/revamp
  - backend
  - migration
status: in-progress
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

| Model | Current Location | Final Owner | Notes |
|---|---|---|---|
| All registration VOs (23) | `app/src/.../client/model/` | `client-lib` | ✅ Moved (Step 0c) |
| `LabResultVo` | `app/src/.../client/model/` | `client-lib` | ⚠️ D.6 circular dep blocks `lis-common` move |
| `TransTestrsltWktVo` + `LabTransTestrsltWktVo` | `app/src/.../client/model/` | `lis-common` (Step 0d) | Pending circular dep evaluation |
| `RegistrationRequest` DTO | `app/src/.../client/dto/` | `client-lib` | ✅ Moved (Step 0c) |
| `ResponseObject` | `client-lib` | `lis-common` (D.4) | Pending decision |

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

### VOs — `hk.org.ha.lis.request.client.model` (✅ moved to `client-lib`, Step 0c)

| File | Note | Final Owner |
|---|---|---|
| `StatableVoInterface.java` | State constants interface | `client-lib` |
| `AbstractVo.java` | Abstract base with `int state` | `client-lib` |
| `LocationIdVo.java` | hospital + Integer key | `client-lib` |
| `ReportCopyUnitVo.java` | reportProfile + counter + subCounter | `client-lib` |
| `RequestIdVo.java` | hospital + labNo + requestNo | `client-lib` |
| `AuditVo.java` | requestNo + auditType + auditText + hkid | `client-lib` |
| `RequestDetailVo.java` | All request detail fields; validation groups removed (backend concern) | `client-lib` |
| `RequestDataVo.java` | doctorReference + clinicalDetails + comment; `StringHelper` replaced with `stripTrailing()` | `client-lib` |
| `ReportCopyVo.java` | Full report copy fields | `client-lib` |
| `RequestProfileDetailVo.java` | Alpha code + lab + date; `@JsonSubTypes` for `UsidRequestProfileDetailVo` | `client-lib` |
| `UsidVo.java` | Specimen identifier fields; `getDisplaySpecimen()` simplified | `client-lib` |
| `UsidRequestProfileDetailVo.java` | Extends `RequestProfileDetailVo` + USID list | `client-lib` |
| `RequestInfoVo.java` | Core request info; `@JsonSubTypes` for `UsidRequestInfoVo`; `PatientInfoVo`/`EncounterInfoVo` from `lis-common` | `client-lib` |
| `UsidRequestInfoVo.java` | Extends `RequestInfoVo` + usids list | `client-lib` |
| `GroupVo.java` | Minimal stub with `@JsonIgnoreProperties(ignoreUnknown = true)` — result-only fields omitted | `client-lib` |
| `LabResultViewVo.java` | type + name + `List<GroupVo>` | `client-lib` |
| `LabResultVo.java` | requestInfo + `PatientVo` (lis-common) + labResultViews | `client-lib` ⚠️ D.6 |
| `RegistrationVo.java` | labResult + alphaCodes | `client-lib` |
| `TransTestrsltWktVo.java` | All result worksheet fields | `lis-common` (Step 0d) |
| `LabTransTestrsltWktVo.java` | Extends `TransTestrsltWktVo` + labNo | `lis-common` (Step 0d) |
| `RegistrationProcessParameterVoInterface.java` | Interface + `@JsonDeserialize(as = RegistrationProcessParameterVo.class)` | `client-lib` (D.5: remove) |
| `RegistrationProcessParameterVo.java` | All process parameter fields + copy constructor | `client-lib` |
| `RegistrationPackingVo.java` | Top-level packing VO; `PatientVo` from `lis-common` | `client-lib` |
| `ResponseObject.java` | roState + isRollback; SUCCESS/FAIL/REQUEST_NO_INVALID_FORMAT constants added | `lis-common` (D.4) |

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
| `PatientRegistrationService.java` | ✅ Skeleton | `PatientRepository` |
| `RegistrationProcessorService.java` | ✅ Skeleton | drequest + lab-specific table repositories |
| `RegistrationAuditService.java` | ✅ Skeleton | Audit repositories / invoker replacement |
| `TaskListService.java` | ✅ Skeleton | `TaskListRepository` + confirm table name |
| `TestResultService.java` | ✅ Skeleton | `LabTransTestrsltWktRepository` |
| `RegistrationService.java` | ✅ Full orchestration | Sub-service implementations (Step 3) |

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
- [ ] **0d** — Evaluate `LabResultVo` circular dependency (D.6); if clear → move `TransTestrsltWktVo` + `LabTransTestrsltWktVo` to `lis-common`
- [x] **0e** — Verified `mvn compile` passes: parent → `lis-request-client` → `lis-request-svc` all BUILD SUCCESS ✅

### Step 2 — Dependency / lis-common cleanup
- ~~[ ] Move 24 VOs from `model.vo.registration` to `lis-common` (D.1)~~ (superseded by Step 0c/0d)
- [ ] Move `ResponseObject` to `lis-common` (D.4)
- [ ] Move `TransTestrsltWktVo` + `LabTransTestrsltWktVo` to `lis-common` after D.6 evaluation (Step 0d)

### Step 3 — Create Repositories
- [ ] `PatientRepository` in `postgresql/`, `SybasePatientRepository` in `sybase/`, `PostgresPatientRepository` in `temp/`
- [ ] `LabTransTestrsltWktRepository` in `postgresql/`
- [ ] `TaskListRepository` in `postgresql/` — confirm table name from schema (D.3)
- [ ] Extend `DrequestRepository` with write methods needed for registration
- [ ] Apply `@RepositoryType` on all above repositories

### Step 4 — Implement Sub-Services
- [ ] `PatientRegistrationService.selectActivePatient()` — query patient table
- [ ] `PatientRegistrationService.insertPatient()` — insert new patient
- [ ] `RegistrationProcessorService.extraValidationOnRequestNo()` — request number format validation
- [ ] `RegistrationProcessorService.insertLabSpecificPatientData()` — lab-specific patient data
- [ ] `RegistrationProcessorService.insertCrsRegistrationData()` — drequest INSERT
- [ ] `RegistrationAuditService.logCrsResultAudit()` ×2 — patient + request audit types
- [ ] `RegistrationAuditService.logPatientAudit()` — conditional on auditText not null
- [ ] `RegistrationAuditService.logOperationAudit()` — operation audits from process parameter
- [ ] `TaskListService.insertTaskList()` — insert task list entry
- [ ] `TestResultService.insertTestResult()` — bulk insert test results

### Step 5 — Verification
- [ ] Unit test `RegistrationControllerTest` — mock service, verify `ResultDataResponse` shape
- [ ] Unit test `RegistrationServiceTest` — mock sub-services, verify `ResponseObject` state
- [ ] Integration test: POST `/api/registration/register` with test schema; verify `drequest` row inserted
- [ ] Verify ALS logs with correct `functionId` and `description`
- [ ] Verify `DataSourceContextHolder` routes to correct lab

---

## 7. Open Questions / Decisions

| #   | Question                                                                                                                                  | Decision                                                                                                                   |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| D.1 | Move `model.vo.registration` VOs to `lis-common`?                                                                                         | All 24 VOs → `client-lib`; only `TransTestrsltWktVo` + `LabTransTestrsltWktVo` provisionally to `lis-common` (pending D.6) |
| D.2 | Is JTA needed for atomic Oracle audit + PostgreSQL writes?                                                                                | Pending                                                                                                                    |
| D.3 | Confirm `task_list` table name and schema in target PostgreSQL lab database                                                               | lisg_tasklist, Reference `lis-crs-spec-ack-svc`                                                                            |
| D.4 | `ResponseObject` needs to move to `lis-common`                                                                                            | Pending                                                                                                                    |
| D.5 | `RegistrationProcessParameterVoInterface` — simplify or preserve?                                                                         | Use `RegistrationProcessParameterVo` directly; remove interface                                                            |
| D.6 | `LabResultVo` circular dependency: references `RequestInfoVo`/`LabResultViewVo` which stay in `client-lib` — can it move to `lis-common`? | Pending (evaluate in Step 0d; likely `LabResultVo` stays in `client-lib`)                                                  |

---

## 8. Progress Summary

| Phase | Total | Done |
|---|---|---|
| VOs created | 24 | 24 ✅ |
| DTO created | 1 | 1 ✅ |
| Controller created | 1 | 1 ✅ |
| RegistrationService created | 1 | 1 ✅ |
| Sub-services (skeleton) | 5 | 5 ✅ |
| Module restructure (Step 0 sub-tasks) | 5 | 4 ✅ (0d pending) |
| RegistrationServiceClient created | 1 | 1 ✅ |
| Sub-service implementations | 10 | 0 |
| Repositories | 4 | 0 |
| Tests | 3 | 0 |
