---
title: "WP3 — Move packing to the API"
task-id: TASK-002
phase: WP3
task: "WP3"
repo: lis-crs-spec-ack-svc
status: pending
estimate: XL
blockers:
  - none
tags:
  - specimen-sorter
  - backend
  - wp3
created: 2026-09-15
---
# WP3 — Move packing to the API

> [!info] Phase Constraint
> **WP3** — Implement `SpecimenSorterPackingService`: Java port of Spec Ack packing (test groups, request number, ward/doctor, sorter defaults). Output is `GcrSpecAckPackingVo` the orchestrator can hand to later register / print.
> Do **not** port hard/soft validator, relabel decision, send-out resolver, `register()` write, worksheet/PHLC HTTP, `SORT_*` audit, or map DDL. APS/BBS panel convertors stay out (unsupported labs).

## Context

Staff packing lives on the Specimen Acknowledgement screen. Middleware cannot call `/gcrSpecAckRegister` without that packing. WP1 declares `SpecimenSorterPackingService` as an injected stub. This task fills the impl so WP4–WP5 can validate, relabel, send-out, register, and print against a real packing Vo.

Legacy source: Flex `GcrSpecAckDataConvertor`. Revamp: `lab-crs-app` `useDataConvertor.ts`, `useHandleRegister.getUniqueCurrSpecTestGroup` / `getRequestTestGroup`, `useCheckAutoAssignReqNo`, `RegisterButton` ward convert. Worksheet Ro comments in `PrintWorksSheet.ts` (`convertToWorksheetRo` / send-out / SH) — **build Ro helpers here if they belong on packing; do not print** (WP5).

Related notes:
- [[02 System Design]] — `SpecimenSorterPackingService`
- [[05 Project Plan]] — WP3 XL 10d
- [[WP1 — Auto-register POST and orchestrator]] — interface only
- [[API Specification]]
- [[Knowledge Base/01_Screens/Specimen Acknowledgement/Workflows/Retrieve Order Information by Specimen Number]]
- [[Knowledge Base/01_Screens/Specimen Acknowledgement/Workflows/Open and Navigate Specimen Acknowledgement Screen]]

## Blockers

None from D1–D12. CRS Registration D.1–D.6 do not apply.

Depends on WP1 packing **interface** (TASK-001). WP1 need not be done if the interface type is agreed; if the stub is missing, add the interface in this task using the WP1 name.

> [!warning] Relabel vs packing
> **Unknown until WP4:** `SpecimenSorterRelabelService` owns Relabel (R4) **without** `userCheckedRelabel`.
> **Assumption to proceed:** packing still **groups** tests and sets `requestNoAssigned` = USID only when R11 eligibility is already true (single specimen, single group, suffix `0`). Multi-group / multi-specimen / DFT same time-flag: leave request number empty; do not invent a number (R11). WP4 marks Relabel and must not get a fake Registered packing.
> **Risk if wrong:** WP4 adjusts who sets `requestNoAssigned`; keep grouping in packing.

## Technical Approach

**Files to create/modify:**
- `src/main/java/hk/org/ha/lis/crs/hub/biz/sorter/SpecimenSorterPackingService.java` — interface if WP1 has not landed; otherwise keep WP1 signature.
- `src/main/java/hk/org/ha/lis/crs/hub/biz/sorter/impl/SpecimenSorterPackingServiceImpl.java` — port from `useDataConvertor` / `useHandleRegister` grouping.
- Split helpers only if the impl is unreadable (ward map, test-group, defaults). Do not copy APS `useApsRegistrationDataConvertor` or BBS extra fields.
- `src/test/java/hk/org/ha/lis/crs/hub/biz/sorter/SpecimenSorterPackingServiceTest.java` — grouping, USID-as-request-no, defaults, unmapped location without auto-create.
- Wire the impl into the WP1 orchestrator call that is currently a stub. If WP1 is not in the clone yet, implement the service so WP1 can inject it; do not invent a second POST.

**Port map (screen → sorter):**

| Screen | Sorter packing |
|---|---|
| `getUniqueCurrSpecTestGroup` | Group `orderTests` by `labRequestGroup` for the scanned USID. AAR **off** — do not pull other specimens into the same request. |
| `convertRequestTestGroupDataToParam` | No AAR specimen list. |
| `convertWardDataToParam` | Map request doctor / location / report dest / copy from dictionary the same way retrieve already loads (`constructGcrSpecAckDictionaryParameterVo`). **Do not** call create-doctor. Unmapped locId → packing result that WP4 turns into Failure (R5). |
| Flex `convertUserInputDataToParam` | Ack/register datetime = **server now** (R12). Collection date from specimen only — do not invent a date if missing (soft later). Urgent workstation **off**. Label flags **off**. No user relabel checkbox. |
| `useCheckAutoAssignReqNo` assign path | `requestNoAssigned` = USID when R11 eligible. Else leave unset. |
| `PrintWorksSheet` convertTo*Ro | Optional methods on packing for WP5; **no** `WorksheetPrintService` / PHLC in this task. |

**DFT (R14, D8):** Same Spec Ack `register()` packing shape. Do **not** call `/api/dftreg/register`. Multi-specimen same time-flag does not get a request number here.

**Shared library components (`@lis/lis-hub-lib`):**
- None — Java service.

**Dictionary data needed:**
- Same dictionary already on retrieve (`constructGcrSpecAckDictionaryParameterVo` / location dictionary). Access via existing Spec Ack services — no new HTTP dictionary endpoint, no hardcoded hosp/lab.

**API calls:**
- None new. In-process only. Do not HTTP-loop `/gcrSpecAckRegister` or `/convertGcrSpecAckPackingVo`.

## Architecture checklist

- [ ] Packing on `lis-crs-spec-ack-svc` as `SpecimenSorterPackingService` impl
- [ ] No `CrsContext` on the sorter packing path
- [ ] `ServiceParameterContextHolder` already set by orchestrator; packing does not switch user to `ltc611`
- [ ] Lab allow-list stays on orchestrator (`hk.org.ha.lis.enums.Lab`); packing does not re-introduce `CommonConstants.LAB_NO_*`
- [ ] No auto-create doctor / location (requirement out of scope)
- [ ] AAR off; no user relabel checkbox
- [ ] No `register()` / send-out / print / PHLC / `SORT_*` / map DDL
- [ ] No new microservice; do not overload staff register URL
- [ ] Mask HKID if packing logs patient identity

## Acceptance criteria

- [ ] Impl builds `GcrSpecAckPackingVo` (or the WP1 interface return type) from a retrieved GCRS order + USID
- [ ] Single-group, single-specimen, suffix `0` → `requestNoAssigned` equals USID (R11)
- [ ] Multi-group / extra specimens → groups present, request number not invented
- [ ] Ward/doctor/report dest filled from dictionary when mapped; unmapped does not create master data
- [ ] Datetime defaults = server now; missing collection date not invented
- [ ] AAR, urgent workstation, labels, relabel checkbox off
- [ ] Unit tests for grouping, USID request no., and unmapped location
- [ ] Module compiles (`mvn -q -DskipTests compile` or project equivalent)
- [ ] Phase constraint respected — no validator, relabel service, print, or register write

## Notes

- Staff `RegisterButton` / `useHandleRegister` stay. Do not change `lab-crs-app` except if a shared type comment is needed — prefer Java-only.
- `CrsSpecAckController.convertGcrSpecAckPackingVo` is a staff DTO round-trip. Sorter packing must not depend on that HTTP method.
- If convertor cannot map ward/doctor, return a structured miss (empty locId / flag) so WP4 Failure codes `0001162`… stay in one place — do not swallow as Registered packing.
- Worksheet Ro on this service is for WP5 reuse, not HTTP.

## Unlocks

After completing this task, the following tasks become unblocked:
- WP4 — validation / relabel / send-out resolver (needs packing Vo)
- WP5 — worksheet + PHLC after Registered (needs packing / Ro helpers)
