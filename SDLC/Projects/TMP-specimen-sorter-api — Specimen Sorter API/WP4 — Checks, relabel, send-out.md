---
title: "WP4 — Checks, relabel, send-out"
task-id: TASK-003
phase: WP4
task: "WP4"
repo: lis-crs-spec-ack-svc
status: pending
estimate: XL
blockers:
  - none
tags:
  - specimen-sorter
  - backend
  - wp4
created: 2026-09-21
---
# WP4 — Checks, relabel, send-out

> [!info] Phase Constraint
> **WP4** — Implement `SpecimenSorterValidationService`, `SpecimenSorterRelabelService`, and `SpecimenSorterSendOutResolver`. Wire the WP1 orchestrator so a packed USID can exit as `FAILURE` / `RELABEL` / `SEND_OUT` / `REGISTERED`. Call existing in-process `sendOutSpecimen` and `register`. Fill `labCode` and `testCode` on `data` (no `labNo`).
> Do **not** port packing convertor (WP3), worksheet/PHLC (WP5), `SORT_*` audit (WP6), or map DDL (WP2). Do not HTTP-loop staff `/sendOutSpecimen` or `/gcrSpecAckRegister`. Do not call `/api/dftreg/register` (D8).

## Context

Staff Spec Ack decides Relabel in `useCheckAutoAssignReqNo.getAutoAssignUsid`, hard-stops in `useDataValidation` / datetime helpers, soft-prompts in `useCheckAlertMessage` / `useUnboxChecking`, and send-out from `LOE_SENDOUT_TEST`. WP1 declared the three sorter collaborators as stubs. This task fills them and runs `GcrSpecAckAppServiceInterface.sendOutSpecimen` / `register` so the sorter can bin without the screen.

Legacy source: Flex `promptAlert` / `GcrSpecAckDataValidator` / Assign USID. Revamp: `lab-crs-app` `useCheckAlertMessage.ts`, `useDataValidation.ts`, `DateValidation.ts`, `useUnboxChecking.ts`, `useCheckAutoAssignReqNo.ts` (`getAutoAssignUsid`), `LoeSpecimenDetailDao` send-out join.

Related notes:
- [[02 System Design]] — sequence mix → convertor → soft → hard → STAR `4422` → Relabel → send-out vs register
- [[05 Project Plan]] — WP4 XL 10d
- [[WP1 — Auto-register POST and orchestrator]] — interfaces
- [[WP3 — Move packing to the API]] — packing Vo
- [[API Specification]] — `data.status` / `labCode` / `testCode`
- [[Knowledge Base/01_Screens/Specimen Acknowledgement/Workflows/Retrieve Order Information by Specimen Number]]
- [[Knowledge Base/01_Screens/Specimen Acknowledgement/Workflows/Confirm Overnight Specimen After Retrieval]]
- [[Knowledge Base/01_Screens/Specimen Acknowledgement/Workflows/Handle Tests Exceeding Their Valid Period After Collection]]
- [[Knowledge Base/01_Screens/Specimen Acknowledgement/Workflows/Show Duplicate Reasons and Ward-Assigned Lab Number Alerts]]
- [[Knowledge Base/01_Screens/Specimen Acknowledgement/Workflows/Show Patient-Related Alerts After Order Retrieval]]

## Blockers

None from D1–D12 / D14. CRS Registration D.1–D.6 do not apply. D13 (retrieve lab-before-USID) is WP1 / map, not this task.

Depends on WP1 collaborator **interfaces** and WP3 packing Vo. If the stub types are missing, add them using the WP1 names. If packing is still a stub, validation/relabel tests use a fixture packing Vo.

> [!warning] Mixed send-out vs R6
> **Unknown if someone re-reads R6 only:** R6 listed mixed local + send-out as ALS.
> **Assumption to proceed:** **D3 / 02 flowchart** — mixed on the same USID is **Failure** (`MIXED_SENDOUT`). Soft ALS does not apply to mixed.
> **Risk if wrong:** one `if` in the resolver.

> [!warning] Relabel checkbox
> **Unknown:** staff `RelabelUisdSpecimenCheckboxId` is a UI force.
> **Assumption to proceed:** sorter has **no** checkbox. Relabel only from R4 / `getAutoAssignUsid` without `checkMap` (WP3 same assumption).
> **Risk if wrong:** add a request flag later — not in the current contract.

## Technical Approach

**Files to create/modify:**
- `src/main/java/hk/org/ha/lis/crs/hub/biz/sorter/SpecimenSorterValidationService.java` — interface if WP1 has not landed.
- `src/main/java/hk/org/ha/lis/crs/hub/biz/sorter/impl/SpecimenSorterValidationServiceImpl.java` — soft ALS + hard Failure.
- `src/main/java/hk/org/ha/lis/crs/hub/biz/sorter/SpecimenSorterRelabelService.java` (+ impl).
- `src/main/java/hk/org/ha/lis/crs/hub/biz/sorter/SpecimenSorterSendOutResolver.java` (+ impl).
- `src/main/java/hk/org/ha/lis/crs/hub/biz/sorter/SpecimenSorterAutoRegisterService.java` — replace WP1 short-circuit stubs with the 02 order below.
- `src/main/java/hk/org/ha/lis/crs/hub/model/dto/sorter/SpecimenSorterAutoRegisterResponseDto.java` — add `labCode` / `testCode` if WP1 DTO still only has status. **No `labNo`.**
- Tests: `SpecimenSorterValidationServiceTest`, `SpecimenSorterRelabelServiceTest`, `SpecimenSorterSendOutResolverTest`, plus orchestrator cases for mixed / relabel / send-out / register / `4422`.

**Orchestrator order after retrieve + packing (02 flowchart):**

1. **Send-out mix** (`SpecimenSorterSendOutResolver`) — some tests on `LOE_SENDOUT_TEST` and some local → `FAILURE` `MIXED_SENDOUT` (D3). No write.
2. Packing already ran (WP3). Unmapped locId / doctor from packing → hard Failure `1162` / `1165` / `1167` / `1170` / `1090` (`useDataValidation`).
3. **Soft alerts** — `warn("SPEC_ACK", …)` only (R6). Never on `data`. Port the *logic* of `useCheckAlertMessage` / overnight / valid period / duplicate / patient tag / private / missing collection-date / STAR unbox *alert* (not `4422`). Do not wait for a UI OK.
4. **Hard validator** — datetime R12 (`DateValidation` / register vs collection vs DOB vs request date vs future); already used / all tests registered / all deleted / specimen deleted or rejected; no LIS test map; unexpected. → `FAILURE` with Spec Ack message code on `data.code`.
5. **STAR** — `useUnboxChecking`: STAR specimen and workbench location missing → `FAILURE` `4422` (D9). Unbox alert when location exists → ALS only (R6, R14).
6. **Relabel** (`SpecimenSorterRelabelService`) — port `getAutoAssignUsid` **without** the relabel checkbox:
   - more than one request test group
   - more than one specimen on the same test (suffix A/B/C / `orderSpecimenNums.length > 1`)
   - suffix ≠ `0`
   - DFT same time-flag, extra specimens (R4c, R14)
   - GCRS `relabel` / force relabel flag
   - auto-gen-only lab (R11) — still Relabel, do not call generate-request-no
   - partial DFT remainder (Q15) → Relabel
   Relabel: **no** `register()` / **no** `sendOutSpecimen`. Status `RELABEL`.
7. **All tests send-out** — in-process `GcrSpecAckAppServiceInterface.sendOutSpecimen(packing)`. Status `SEND_OUT`. `testCode` = matched `loesend_cluster_code`. No print (D11).
8. **In-house** — in-process `GcrSpecAckAppServiceInterface.register(packing)` (DFT uses this same `register()`, D8). Status `REGISTERED`. Do **not** start worksheet/PHLC here (WP5).
9. Set `labCode` = `Lab.getCode()` (`CPS` / `HMS`). Set `testCode` when known. HTTP 200 + `ResultDataResponse.success`. Transport exceptions → 500.

**Send-out match (R7):** Reuse the join already in `LoeSpecimenDetailDao` — `loe_request_test.loereqtst_test_code` = `loe_sendout_test.loesend_cluster_code` and send hosp, filter `loesend_labno` (+ service type null vs SOS the same way the DAO does). Do not invent a new table. Do not add a sorter send-out flag on the request.

**Shared library components (`@lis/lis-hub-lib`):**
- None — Java service.

**Dictionary data needed:**
- Same Spec Ack dictionary already on retrieve / packing (`constructGcrSpecAckDictionaryParameterVo`). STAR location from workbench `wkbh_location` via existing location lookup (`useOfficeUtil.getLocationByLocationHosp` equivalent on the service). No new HTTP dictionary endpoint.

**API calls:**
- None new. In-process `sendOutSpecimen` and `register` only. Do not HTTP `CrsSpecAckController.sendOutSpecimen` / `gcrSpecAckRegister`.

## Architecture checklist

- [ ] Three WP1 interfaces implemented on `lis-crs-spec-ack-svc`
- [ ] Orchestrator order matches 02: mix → packing result → soft ALS → hard → STAR `4422` → relabel → send-out vs register
- [ ] Mixed USID → `FAILURE` (D3), not ALS
- [ ] Soft alerts: `warn("SPEC_ACK", …)` only; not in body (R6)
- [ ] Relabel never reported as Failure (R3, R4); no lab-request write
- [ ] No relabel checkbox; no caller `assignedRequestNo`; no auto-gen request no. (R11)
- [ ] STAR no location → `4422` Failure (D9); unbox alert ALS
- [ ] Send-out via existing `sendOutSpecimen`; register via existing `register`; no `/api/dftreg`
- [ ] No `CrsContext`; no `ltc611`; no workbench-vs-test-lab check (D10)
- [ ] `data.labCode` / `data.testCode`; no `labNo` on payload
- [ ] No worksheet / PHLC / `SORT_*` / map DDL in this task
- [ ] Mask HKID in logs
- [ ] No new microservice; staff URLs unchanged

## Acceptance criteria

- [ ] Mixed local + send-out on one USID → HTTP 200 + `FAILURE` `MIXED_SENDOUT`, no send-out/register write
- [ ] Unmapped doctor/location/specialty/report dest/copy → `FAILURE` with `1162` / `1165` / `1167` / `1170` / `1090`
- [ ] Hard datetime (collection &lt; DOB, ack &lt; collection, ack &lt; request date, ack in the future) → `FAILURE`
- [ ] Overnight / valid period / duplicate / private / missing collection date / STAR unbox alert → still proceed; ALS only; not on body
- [ ] STAR, no workbench location → `FAILURE` `4422`
- [ ] Multi-group / multi-specimen / suffix ≠ `0` / DFT same time-flag / force relabel / auto-gen-only → `RELABEL`, no write
- [ ] All tests in `LOE_SENDOUT_TEST` → in-process `sendOutSpecimen`, `SEND_OUT`, `testCode` = cluster code
- [ ] Eligible in-house CPS/HMS → in-process `register`, `REGISTERED`, `labCode` `CPS` or `HMS`
- [ ] Response DTO has no `labNo`
- [ ] Unit tests for mixed, `4422`, relabel (multi-group + DFT time-flag), send-out-all, hard 1162
- [ ] Module compiles (`mvn -q -DskipTests compile` or project equivalent)
- [ ] Phase constraint respected — no print, no `SORT_*`, no packing port, no map DDL

## Notes

- `CrsSpecAckController.sendOutSpecimen` already `warn("SPEC_ACK", …)` on exception — sorter path should call the **app service**, not the controller HTTP method.
- Existing `register` / `sendOutSpecimen` still write today's `REG` / `SEND_OUT` audit. Sorter `SORT_*` rows are WP6.
- Partial registration (Q15) is Relabel, not a half write.
- APS/BBS/MBS stay WP1 unsupported-lab Failure before this task runs.
- p95 &lt; 4 s is WP8; do not add print on this thread.

## Unlocks

After completing this task, the following tasks become unblocked:
- WP5 — worksheet + PHLC after **Registered** only (`SpecimenSorterPostProcessService`)
- WP6 — `SORT_*` on the same Failure / Relabel / Send-out / Registered exits
