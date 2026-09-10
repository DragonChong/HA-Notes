---
name: implement-task
description: >
  Implement a dossier work package or CRS Revamp task in an open clone.
  Use when asked to implement, build, scaffold, or code. Do not use to
  write the change log (code-change-log) or the schedule (project-plan).
argument-hint: "[TASK-ID or phase.task] [task name] [optional: repo]"
---

# Implement a task

You implement in the clones named on the dossier. Stack and architecture
come from those repos and `LIS/ECP/<service>/` notes, plus
`lis-architecture`. After compile/type-check, stop — `/code-change-log`
writes the record.

---

## Step 0 — Resolve scope

1. Read the active dossier (`repos`, `services`, `## Open Items`,
   optional `tasks:` wikilink).
2. Target repo = user argument, else the dossier `repos` row for this
   package, else (CRS only) Central Task List `repo`.
3. Stack: `LIS/ECP/<service>/` if it exists. Else the lookup below when
   that repo name matches. Else ask — do not invent a stack.
4. Architecture rules: load `lis-architecture`. The frontend/backend
   tables below still apply when the repo is one of those names.
5. Blockers: dossier `## Open Items`. CRS Registration may also use
   D.1–D.6 from `/blocker-check`.
6. Then `/blocker-check`. Verdict **blocked** → stop.

If no dossier and the work is CRS Revamp, keep using
`CRS/Revamp/Central Task List.md` as today.

---

## Step 1 — Identify the repository

| Repository | Type | Tech stack |
|---|---|---|
| `lis-request-app` | Frontend | React, TypeScript, Emotion, Webpack MFE |
| `lis-crs-common-app` | Frontend | React, TypeScript, Webpack MFE (Level-1 consumer) |
| `lis-hub-app` | Frontend | React, TypeScript, Webpack Shell |
| `lab-crs-app` | Frontend | React, TypeScript, Webpack MFE |
| `lis-request-svc` | Backend | Spring Boot, Java, multi-module (app + client-lib) |
| `lis-patient-svc` | Backend | Spring Boot, Java, multi-module |
| `lis-hub-svc` | Backend | Spring Boot, Java |
| `lis-crs-spec-ack-svc` | Backend | Spring Boot, Java |

**Proceed to the section matching the repository type:**
- Frontend → [Frontend Pre-flight + Architecture](#frontend-implementation)
- Backend → [Backend Pre-flight + Architecture](#backend-implementation)

---

## Frontend Implementation

*Applies to: React MFE apps in dossier `repos`, including
`lis-request-app`, `lis-crs-common-app`, `lis-hub-app`, `lab-crs-app`.*

### Pre-flight F1 — Shared library check

Before writing any code, check whether a component from `@lis/lis-hub-lib` already covers this task:

| Need | Component | Rule |
|---|---|---|
| HKID entry field | `HkidInput` | Wire up — never re-implement |
| Encounter number field | `EncounterNumber` | Wire up — never re-implement |
| Request number field | `RequestNumberInput` | Wire up — never re-implement |
| Location (Hospital/Specialty/Ward) | `LisLocationBox` | Wire up — never re-implement |
| Doctor lookup | `LisDoctorSingleBox` | Wire up — never re-implement |
| Keyword dropdown | `KeywordDropdown` | Wire up — never re-implement |
| Constant dropdown | `ConstantDropdown` | Wire up — never re-implement |
| Patient demographics banner | `PatientPanel` | Wire up — never re-implement |

### Pre-flight F2 — Phase constraint

Confirm the phase and respect its scope:

| Phase | Do this | Do NOT do this yet |
|---|---|---|
| Phase 0 | Repo scaffolding, MF config, entry point wiring | Any screen UI |
| Phase 1 | Wrap/wire shared lib components only | Business logic |
| Phase 2 | Layout and structural scaffolding only | Event handlers, API calls, enable/disable logic |
| Phase 3 | Enable/disable states driven by screen state machine | Cross-field interactions |
| Phase 4 | Cross-field interaction logic, tab sequence wiring | Dialogues, validations |
| Phase 5+ | Lab panels, dialogues, validations, workflows, backend | — |

### Pre-flight F3 — Blocker check

Run `/blocker-check`. Use dossier Open Items (and CRS D.1–D.6 when
those apply). If blocked, stop. If proceeding with an assumption, add
`// TODO [OPEN-n]: <assumption>` (CRS Registration may still use
`TODO [BLOCKER D.x]`).

### Frontend Architecture Rules (enforce in every file)

| Rule | Requirement |
|---|---|
| Emotion cache key | `key: "request"` in `createCache` — never `"css"` or default |
| API calls | `apiContext.request.post<ResultDataResponse<T>>(url, payload)` only — no direct Axios |
| Zustand store | `src/features/registration/store/` only — no Hub or lib store imports |
| Panel/tab visibility | `style={{ display: isVisible ? '' : 'none' }}` — never conditional unmount |
| Message box | `(cms.api.ui as any).MessageBoxApi.open({...})` — never `<MessageBoxProvider>` |
| Dictionary | `apiContext.dictionary.get()` — never call dictionary endpoints directly |
| Env values | No hardcoded URLs, lab numbers, or hospital codes |
| TypeScript | Strict mode; all exported functions have explicit return types; props as `interface` |

### Frontend File Output

Generate all files relevant to the task:

```
src/features/registration/
├── components/
│   ├── {ComponentName}.tsx           ← main component
│   └── {ComponentName}.test.tsx      ← test scaffold (see /test-scaffold)
├── hooks/
│   └── use{ComponentName}.ts         ← if component needs local state/effects
├── types/
│   └── {componentName}.types.ts      ← if new types are introduced
└── index.ts                          ← add barrel export for new component
```

For Phase 0 tasks, output goes to `src/cms-plugin/` instead.

**Component file template:**
```tsx
// src/features/registration/components/{ComponentName}.tsx
import React from 'react';
// MUI imports
// @lis/lis-hub-lib imports (if applicable)
// Local imports

interface {ComponentName}Props {
  // explicit prop types
}

export const {ComponentName}: React.FC<{ComponentName}Props> = ({ ... }) => {
  return (
    // JSX
  );
};
```

### Frontend Post-generation

1. Run `npm run type-check` — report and fix all TypeScript errors before finishing
2. Update `src/features/registration/index.ts` with the new barrel export
3. State which tasks this implementation unlocks next
4. Stop. `/code-change-log` writes `06 Code Change Log.md`.

---

## Backend Implementation

*Applies to: Spring Boot services in dossier `repos`, including
`lis-request-svc`, `lis-patient-svc`, `lis-hub-svc`,
`lis-crs-spec-ack-svc`.*

### Pre-flight B1 — Module placement

Determine which module the file belongs to:

| File type | Module | Package root |
|---|---|---|
| Controller, Service, Repository, Entity | `app/` | `hk.org.ha.lis.{svc}.{layer}` |
| VO, DTO, Client interface | `client-lib/` | `hk.org.ha.lis.{svc}.client.{model\|dto}` |
| Shared VOs (cross-service) | `lis-common` | `hk.org.ha.lis.model.vo` |

For `lis-request-svc` specifically:
- `app/` package root: `hk.org.ha.lis.request`
- `client-lib/` package root: `hk.org.ha.lis.request.client`

### Pre-flight B2 — Blocker check

Same blocker rule as frontend — dossier Open Items, then `/blocker-check`.

### Backend Architecture Rules (enforce in every file)

| Rule | Requirement |
|---|---|
| Base class | Controller and Service both extend `AbstractService` (from `audit-logging`) |
| DI | `@RequiredArgsConstructor` + `final` fields — no `@Autowired` |
| ServiceParameter | Store in ThreadLocal via `AbstractService.setServiceParameter()` at controller entry — no per-instance injection |
| DataSource routing | `DataSourceContextHolder.setCurrentDb(serverName, serverLab, database)` at controller entry point — once per request |
| Transactions | Spring `@Transactional` only — no manual `DynamicDataSourceTransactionHelper` |
| Return type | `ResponseEntity<ResultDataResponse<T>>` — no raw `String` returns |
| Logging | `info(functionId, description, content)` / `warn(...)` from `AbstractService` — no SLF4J `logger.info/error` directly |
| Repository structure | `postgresql/` base interface → `sybase/` and `temp/` extend base |
| No anti-patterns | No `CrsContext.setCurrentServiceParameter()`, no `getService(X.class)`, no `ResponseObject` inline `ro.setRoState()` |

### Backend File Output

Generate all files relevant to the task. Follow the multi-module structure:

```
lis-request-svc/
├── app/src/main/java/hk/org/ha/lis/request/
│   ├── controller/
│   │   └── {Name}Controller.java         ← extends AbstractService; @RestController
│   ├── service/
│   │   └── {Name}Service.java            ← extends AbstractService; @Service
│   └── repository/
│       ├── postgresql/
│       │   └── {Name}Repository.java     ← JPA base repository
│       ├── sybase/
│       │   └── {Name}SybaseRepository.java
│       └── entity/
│           └── {Name}Entity.java         ← @Entity; @Table
└── client-lib/src/main/java/hk/org/ha/lis/request/client/
    ├── model/
    │   └── {Name}Vo.java                 ← plain VO; no Spring annotations
    └── dto/
        └── {Name}Request.java            ← extends AbstractRequest
```

**Controller template:**
```java
@RestController
@RequestMapping("/api/{path}")
@RequiredArgsConstructor
public class {Name}Controller extends AbstractService {

    private final {Name}Service {name}Service;

    @PostMapping("/{endpoint}")
    public ResponseEntity<ResultDataResponse<{ReturnType}>> {method}(
            @RequestBody @Valid {Name}Request request) {
        setServiceParameter(request.getServiceParameter());
        DataSourceContextHolder.setCurrentDb(
            request.getServiceParameter().getServerName(),
            request.getServiceParameter().getServerLab(),
            DatabaseConstants.LAB_DB
        );
        return ResponseEntity.ok(ResultDataResponse.success({name}Service.{method}(request)));
    }
}
```

**Service template:**
```java
@Service
@RequiredArgsConstructor
public class {Name}Service extends AbstractService {

    private final {Name}Repository {name}Repository;

    @Transactional
    public {ReturnType} {method}({ParamType} param) {
        info("{functionId}", "{description}", param);
        // implementation
    }
}
```

### Backend Post-generation

1. Run `mvn compile -pl app` (or the relevant module) — report and fix all compilation errors
2. Check that `@Transactional` is applied at the correct service method boundary
3. Verify `DataSourceContextHolder.setCurrentDb(...)` is called at the controller entry point (not in service layer)
4. State which tasks this implementation unlocks next
5. Stop. `/code-change-log` writes `06 Code Change Log.md`.
