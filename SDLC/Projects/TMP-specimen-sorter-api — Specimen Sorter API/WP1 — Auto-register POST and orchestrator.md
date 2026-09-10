---
title: "WP1 — Auto-register POST and orchestrator"
task-id: TASK-001
phase: WP1
task: "WP1"
repo: lis-crs-spec-ack-svc
status: pending
estimate: XL
blockers:
  - none
tags:
  - specimen-sorter
  - backend
  - wp1
created: 2026-09-10
---
# WP1 — Auto-register POST and orchestrator

> [!info] Phase Constraint
> **WP1** — New `POST /api/specack/sorter/auto-register`, request/response contract, orchestrator, and in-process retrieve as the mapped sorter user. Collaborator interfaces for map / packing / validation / relabel / send-out / register / post-process / audit are declared and injected; their bodies wait for WP2–WP6.
> Do not port the Flex convertor, hard/soft validator, worksheet/PHLC, `SORT_*` audit writes, or `loe_specimen_sorter_map` DDL in this task.

## Context

Middleware needs one sync call so the sorter can bin Registered / Send-out / Relabel / Failure. Staff Spec Ack stays. Today's GET `/retrieveGcrOrder` hard-codes user `ltc611` — the sorter must not use that GET. WP1 puts the POST and the orchestrator on existing `lis-crs-spec-ack-svc` (port 8118). It does not create a new service and does not overload `/gcrSpecAckRegister` or `/v1/ecpath5-register`.

Legacy source: Specimen Acknowledgement screen retrieve + save path (Flex convertor / validator stay on later WPs). Screen retrieve today: `CrsSpecAckController.retrieveGcrOrder` → `GcrUIAppServiceImpl.retrieveGcrOrder`.

Related notes:
- [[02 System Design]] — path, body, statuses, class list, sequence
- [[05 Project Plan]] — WP1 XL 10d
- [[01 Requirement Confirmation]]
- [[Knowledge Base/01_Screens/Specimen Acknowledgement/Workflows/Open and Navigate Specimen Acknowledgement Screen]]
- [[LIS/ECP/Micro-Frontend-Backend Architecture/03 - Backend Microservices]] — `lis-crs-spec-ack-svc` security commented out; NetworkPolicy only (D1)

## Blockers

None from D1–D11 (all answered on [[02 System Design]]). CRS Registration D.1–D.6 do not apply.

Open dossier item **Paste JIRA key** is not a code blocker for WP1.

> [!warning] Depends on WP2 (map table) — interface only in WP1
> **Unknown until WP2:** real `loe_specimen_sorter_map` + workbench row.
> **Assumption to proceed:** `SpecimenSorterMapService` is an injected interface. WP1 ships a test double / empty impl that returns miss → Failure. Orchestrator still sets `ServiceParameterVo` from whatever the map returns.
> **Risk if wrong:** WP2 swaps the impl; orchestrator signature should not need to change.

## Technical Approach

**Files to create:**
- `src/main/java/hk/org/ha/lis/crs/specack/controller/SpecimenSorterController.java` — `POST /sorter/auto-register` on root `/api/specack`. Extends `AbstractService`. Does **not** call GET `/retrieveGcrOrder`.
- `src/main/java/hk/org/ha/lis/crs/hub/biz/sorter/SpecimenSorterAutoRegisterService.java` — orchestrator. Sets `ServiceParameterVo` + `CrsContext` from map user + workbench hospital / lab / `serverName`.
- `src/main/java/hk/org/ha/lis/crs/hub/biz/sorter/SpecimenSorterMapService.java` — interface (+ stub impl for WP1). WP2 fills Oracle lookup.
- `src/main/java/hk/org/ha/lis/crs/hub/biz/sorter/SpecimenSorterPackingService.java` — interface only (WP3).
- `src/main/java/hk/org/ha/lis/crs/hub/biz/sorter/SpecimenSorterValidationService.java` — interface only (WP4).
- `src/main/java/hk/org/ha/lis/crs/hub/biz/sorter/SpecimenSorterRelabelService.java` — interface only (WP4).
- `src/main/java/hk/org/ha/lis/crs/hub/biz/sorter/SpecimenSorterSendOutResolver.java` — interface only (WP4).
- `src/main/java/hk/org/ha/lis/crs/hub/biz/sorter/SpecimenSorterPostProcessService.java` — interface only (WP5).
- `src/main/java/hk/org/ha/lis/crs/hub/model/dto/sorter/SpecimenSorterAutoRegisterRequestDto.java` — `usid`, `sorterId`, optional `hospital` / `hkid` / `patientName`.
- `src/main/java/hk/org/ha/lis/crs/hub/model/dto/sorter/SpecimenSorterAutoRegisterResponseDto.java` — `status` + optional `code` / `message` for Failure.
- `src/main/java/hk/org/ha/lis/crs/hub/model/udt/SpecimenSorterStatus.java` — `REGISTERED` / `SEND_OUT` / `RELABEL` / `FAILURE`.
- `src/test/java/hk/org/ha/lis/crs/hub/biz/sorter/SpecimenSorterAutoRegisterServiceTest.java` — missing usid/sorterId; map miss; retrieve not found; APS/BBS/MBS; HKID mismatch; HTTP envelope is 200 + `FAILURE`.

**Files to modify:**
- `src/main/java/hk/org/ha/lis/crs/hub/common/constant/CrsConstants.java` — `API_SORTER_AUTO_REGISTER = "/sorter/auto-register"` plus Operation summary strings. Do not add this path onto `API_REGISTER`.
- Do **not** add the method to `CrsSpecAckController` (already 900+ lines). Staff endpoints stay there.

**Orchestrator order (WP1 implements the gates in bold):**
1. **usid / sorterId missing → FAILURE**, no retrieve.
2. Map `sorterId` → user + workbench (stub until WP2). Miss → FAILURE.
3. Hospital omitted → use map / workbench hosp. Hospital sent and mismatch → FAILURE.
4. Build `ServiceParameterVo` (user = `loesort_usercode`, hosp/lab/serverName from map + workbench). `CrsContext.setCurrentServiceParameter`. Never set user `ltc611`.
5. **In-process** `GcrUIAppServiceInterface.retrieveGcrOrder(GcrUIPackingVo)` with USID only as that user. Do not HTTP-loop to GET `/retrieveGcrOrder`.
6. Not found / retrieve error → FAILURE.
7. Lab not CPS (`CommonConstants.LAB_NO_CPS`) or HMS (`LAB_NO_HMS`) → FAILURE (APS/BBS/MBS/VRS).
8. Optional HKID / `patientName` present and mismatch GCRS patient → FAILURE. Mask HKID in logs.
9. Call packing / validation / relabel / send-out / register collaborators (stubs). Mixed / relabel / send-out / register writes are WP3–WP5.
10. Return `ResultDataResponse.success(response)` with HTTP 200 for all four statuses. Transport exceptions only → 500 via existing `ResultDataResponse.fail(INTERNAL_SERVER_ERROR, …)` + `warn("SPEC_ACK", …)`.
11. Soft alerts: never put them on the response body.

**Shared library components (`@lis/lis-hub-lib`):**
- None — Java service. No React.

**Dictionary data needed:**
- None in WP1. Convertor/validator in later WPs load Spec Ack dictionary the same way `retrieveGcrOrder` already does (`constructGcrSpecAckDictionaryParameterVo`).

**API calls:**
- New: `POST /api/specack/sorter/auto-register`
- Body: `{ "usid", "sorterId", "hospital?", "hkid?", "patientName?" }`
- Reuse in-process: `GcrUIAppServiceInterface.retrieveGcrOrder`
- Do not call: GET `/retrieveGcrOrder`, POST `/gcrSpecAckRegister`, PATCH `/v1/ecpath5-register`, `/api/dftreg/register`

## Architecture checklist

- [ ] New POST on `lis-crs-spec-ack-svc`; do not overload `/gcrSpecAckRegister` or `/v1/ecpath5-register`
- [ ] Do not call GET `/retrieveGcrOrder` (hard-coded `ltc611`)
- [ ] In-process retrieve with mapped sorter user via `GcrUIAppServiceInterface`
- [ ] `ServiceParameterVo` + `CrsContext.setCurrentServiceParameter` before retrieve
- [ ] No auth header / JWT / API key (D1)
- [ ] HTTP 200 for `REGISTERED` / `SEND_OUT` / `RELABEL` / `FAILURE`; 500 only for transport
- [ ] Soft alerts ALS `warn("SPEC_ACK", …)` only — not in body
- [ ] Mask HKID in logs
- [ ] Do not compare workbench lab to retrieved test lab (D10)
- [ ] DFT stays on Spec Ack `register()` later (D8) — WP1 must not call `/api/dftreg`
- [ ] Print / PHLC not in this task (D11) — collaborator stub only
- [ ] No new microservice; security starter stays commented out

## Acceptance criteria

- [ ] `POST /api/specack/sorter/auto-register` exists and is documented on Swagger (`@Operation`)
- [ ] Missing `usid` or `sorterId` returns HTTP 200 + `FAILURE` without calling retrieve
- [ ] Retrieve uses mapped user, not `ltc611`
- [ ] APS / BBS / MBS (and other non CPS/HMS) → `FAILURE`
- [ ] Optional HKID / name mismatch → `FAILURE`
- [ ] Staff GET retrieve and `/gcrSpecAckRegister` unchanged
- [ ] Collaborator interfaces exist; packing / validator / print / DDL / `SORT_*` not implemented
- [ ] Unit test class present; at least the missing-field and unsupported-lab cases pass
- [ ] Module compiles (`mvn -q -DskipTests compile` or project equivalent)
- [ ] Phase constraint respected — no Flex convertor port, no Oracle DDL

## Notes

- Design class names in [[02 System Design]] Component table are the target. Keep `SpecimenSorterController` separate from `CrsSpecAckController`.
- Map stub: if a test needs a hit, inject a fake that returns a dedicated user + workbench id. Do not hard-code `ltc611` in that fake.
- Hospital derive-when-omitted is orchestrator logic (R10 / D7) — implement in WP1 even though the table is WP2.
- Relabel / send-out / register branches in the 02 flowchart stay as method calls that WP1 may short-circuit to `FAILURE` with a clear internal code until those WPs land. Do not fake `REGISTERED` without `register()`.
- p95 &lt; 4 s is WP8. Do not add sync print on the HTTP thread here.

## Unlocks

After completing this task, the following tasks become unblocked:
- WP2 — `loe_specimen_sorter_map` DDL + real `SpecimenSorterMapService`
- WP3 — packing convertor can plug into the orchestrator
- WP4 — validation / relabel / send-out resolver
- WP5 — worksheet + PHLC after Registered (post-process stub)
- WP6 — `SORT_*` audit on the same orchestrator exits
