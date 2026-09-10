---
agent_assisted: true
generated_by: system-design
generated_on: 2026-09-07
review_date: ""
review_type: incremental
reviewed_by: Tony Chong
tags:
  - sdlc
  - design
title: 02 System Design — Specimen Sorter API
---
# 02 System Design — Specimen Sorter API

Traces to: [[01 Requirement Confirmation]] R1–R14.

**Review type:** incremental  
New endpoint and orchestrator on existing `lis-crs-spec-ack-svc`. Does not create a new service.

**Gate:** `requirement` was confirmed in writing but is not in `gates_passed`. Design proceeds under a recorded exception (requester invoked `/system-design`).

Design answers D1–D11 stand. 2026-09-10: Existing / Proposed restated as the Specimen Acknowledgement screen vs one new API. Map table name is `loe_specimen_sorter_map` (was `loe_sorter_map` on D7). Hospital is derived from that map when the request omits it.

Slides are not this note. After you confirm this delta, `/design-review-pptx` refreshes [[03 Slide Brief]].

## Context and problem

Traces to: R1, R8

Staff currently scan the specimen label and press buttons to perform send-out and registration on Specimen Acknowledgement. Labs will use a specimen sorter to scan the tube, sort it, and move it. Middleware calls a LIS API for the send-out and registration actions so the sorter can bin from the result.

Today those actions are a staff click path. Retrieve, validation, packing (test groups, request no., ward/doctor), worksheet conversion, and PHLC sit in the Flex / revamp **screen**. The service only runs the writes. Middleware cannot call `/gcrSpecAckRegister` without that packing.

## Existing design

Traces to: R2, R5, R6, R7, R11, R13, R14

`lis-crs-spec-ack-svc` port 8118, root `/api/specack`. Security starter commented out; isolation is NetworkPolicy. Dynamic DB routing uses `ServiceParameterVo`. Staff workbench is `LAB_DB.dbo.workbench` (PK `wkbh_id` + `wkbh_labno`). Login today: `WorkbenchEvent.selectWorkbench` by PC name / IP.

### Specimen Acknowledgement screen

| Action | Front-end | Back-end |
|---|---|---|
| **Retrieve GCRS order** | Screen scans / enters USID and calls retrieve | `GcrUIAppServiceImpl.retrieveGcrOrder`. GET `/retrieveGcrOrder` hard-codes user `ltc611` — sorter must not use that GET. Duplicate USID writes audit. |
| **Send-out** | Staff click; screen calls send-out | `sendOutSpecimen`: ack if Printed/Collected; tracking; action `SEND_OUT`. Send-out detection: join `loe_request_test.loereqtst_test_code` to `loe_sendout_test.loesend_cluster_code` + hosp, filter lab no. |
| **Registration — validation** | Flex `promptAlert` (soft) and `GcrSpecAckDataValidator` (hard) | Writes assume validation already passed. Soft: collection date, overnight, valid period, patient tag, duplicate, mixed local + send-out, and the rest of today's list. Hard: unmapped doctor/location/specialty/report dest/copy; datetime; missing test-dict. |
| **Registration — data conversion** | Flex `GcrSpecAckDataConvertor` | `register()` expects already-built `GcrSpecAckPackingVo`. Convertor: group tests and assign request no. (`convertRequestTestGroupDataFromGcrTest` / `ToParam`, `convertRequestNoDataToParam`); map ward and doctor setups (`convertWardDataToParam` / `convertDoctorDataToParam`); checkbox defaults (`convertUserInputDataToParam`). |
| **Registration — write** | Screen calls register | `register`. Relabel stays on the convertor / Assign USID path (multi-group, DFT time-flag, multi-specimen, suffix ≠ `0`, force relabel, user checkbox). |
| **Worksheet printing** | Convertor builds worksheet / send-out / SH Ro; staff pick when more than one | `CrsSpecAckController.gcrWorksheetPrinting`, `gcrShWorksheetPrinting`, `gcrSendOutWorksheetPrinting` → `WorksheetPrintService`. **Registration only** (D11). |
| **PHLC electronic order** | Screen calls PHLC after register | `LisPhlcLabOrderAppServiceImpl.createPhlcLabOrder`. **Registration only** (D11). |

Labs: CPS = 1, HMS = 3, APS = 5, BBS = 6, MBS = 7, VRS = 8. v1 sorter path is CPS / HMS only.

## Proposed change — overview

Traces to: R1–R14

One new POST on Spec Ack. Move the screen logics above onto that API. Staff click path stays.

1. **New API** — path, body, and response below.
2. **Move front-end logics to the API** — retrieve (as the mapped user), validation, packing convertor, then existing send-out / register / print / PHLC in-process.
3. **`LOE_AUDIT_TRAIL` insert** — `SORT_*` plus today's `REG` / `SEND_OUT` (D6).
4. **New table `loe_specimen_sorter_map`** — sorter id → LIS user + workbench. If the request has no hospital, take hospital from the map / workbench. Workstation and user come from the same row.

No Hub JWT. No API key in v1 (D1).

```mermaid
sequenceDiagram
    participant MW as Sorter middleware
    participant API as Auto-register API
    participant Map as loe_specimen_sorter_map
    participant WB as workbench LAB_DB
    participant Ret as retrieveGcrOrder
    participant Cvt as Server-side convertor
    participant Val as Validator and alerts
    participant SO as sendOutSpecimen
    participant Reg as register
    participant Aud as LOE_AUDIT_TRAIL
    participant Prn as Worksheet and PHLC

    MW->>API: POST USID + sorterId + optional hospital HKID name
    API->>Map: sorter id to user and workbench id
    API->>WB: load hosp lab location printer station
    Note over API: hospital omitted → use map / workbench hosp
    API->>Ret: USID only as that user
    alt not found or unsupported or mixed send-out
        API->>Aud: SORT_FAIL
        API-->>MW: Failure
    else
        API->>Cvt: test groups ward doctor request no defaults
        API->>Val: ALS soft alerts hard checks relabel
        alt Relabel
            API->>Aud: SORT_RELABEL
            API-->>MW: Relabel
        else send-out only
            API->>SO: existing send-out
            API-->>MW: SEND_OUT
            Note over Prn: no worksheet, no PHLC
        else in-house
            API->>Reg: converted packing
            API-->>MW: REGISTERED
            API--)Prn: all worksheets and PHLC after return
        end
    end
```

## Component / class design

Traces to: R1, R4, R5, R6, R11, R14

| Piece | Role |
|---|---|
| `SpecimenSorterController` | `POST /api/specack/sorter/auto-register`. Extends `AbstractService`. Does not call GET `/retrieveGcrOrder`. |
| `SpecimenSorterAutoRegisterService` | Orchestrator. Sets `ServiceParameterVo` from map user + workbench hospital/lab/`serverName`. If request `hospital` is empty, use `loesort_hosp` / `wkbh_hosp`. |
| `SpecimenSorterMapService` | `loe_specimen_sorter_map` → user + workbench id/lab. Then `workbench` for hosp, location, station name, default printer. Missing map or workbench → Failure. |
| `SpecimenSorterPackingService` | Java port of `GcrSpecAckDataConvertor` (group tests, request no., ward/doctor, worksheet Ro). `convertUserInputDataToParam` becomes defaults: ack/register datetime = server now (R12); collection date from specimen; AAR off; urgent workstation off; label flags off; no user relabel checkbox. |
| `SpecimenSorterValidationService` | Port of `promptAlert` (ALS only) and `GcrSpecAckDataValidator`. Mixed local + send-out → **Failure**. STAR: no `wkbh_location` → Failure `4422`. |
| `SpecimenSorterRelabelService` | Assign-USID rules **without** `userCheckedRelabel`. |
| `SpecimenSorterSendOutResolver` | `LOE_SENDOUT_TEST` cluster join. Both send-out and in-house on the USID → Failure (D3). |
| `SpecimenSorterPostProcessService` | After HTTP return, **Registered only** (D11): same in-process path as the three staff print methods, every worksheet Ro (no picker), then PHLC via `LisPhlcLabOrderAppServiceImpl.createPhlcLabOrder` when `isSendToPHLC`. No HTTP loopback. Send-out / Relabel / Failure skip this. Print fail → ALS warn only (D4). |

Reuse: `retrieveGcrOrder`, `sendOutSpecimen`, `register`, `GcrPrintReportAppService`, `GcrShWorksheetPrintingAppService`, `GcrSendOutTestFormAppService`, `WorksheetPrintService`, `LisPhlcLabOrderAppServiceImpl.createPhlcLabOrder`, `GcrAuditService`.

DFT: Spec Ack `register()` packing. Do **not** call `/api/dftreg/register` (D8).

APS/BBS/MBS → Failure unsupported.

Do **not** compare workbench lab to the retrieved test lab (D10).

HKID/name: if supplied and mismatch GCRS patient → Failure.

```mermaid
flowchart TD
    start[POST auto-register] --> map{sorterId on loe_specimen_sorter_map?}
    map -->|no| fail[Failure]
    map -->|yes| wb[Load workbench]
    wb --> hosp{hospital in request?}
    hosp -->|no| useMap[Use map / workbench hosp]
    hosp -->|yes| match{Matches map / workbench?}
    match -->|no| fail
    match -->|yes| usid
    useMap --> usid{USID present?}
    usid -->|no| fail
    usid -->|yes| ret[retrieveGcrOrder]
    ret --> found{Order found CPS or HMS?}
    found -->|no / APS BBS MBS| fail
    found -->|yes| mix{Local and send-out on same USID?}
    mix -->|yes| fail
    mix -->|no| cvt[Convertor builds packing]
    cvt --> soft[Soft alerts ALS]
    soft --> hard{Hard validator?}
    hard -->|no| fail
    hard -->|yes| star{STAR and no workbench location?}
    star -->|yes| fail
    star -->|no| relabel{Relabel rules?}
    relabel -->|yes| rel[Relabel no write]
    relabel -->|no| so{All tests in LOE_SENDOUT_TEST?}
    so -->|yes| send[sendOutSpecimen]
    so -->|no| reg[register packing]
    send --> doneSo[Return SEND_OUT no print]
    reg --> post[Return REGISTERED then print all]
```

## Data model

Traces to: R9, R10, D2, D7

### New table — `loe_specimen_sorter_map` (Oracle / LOE)

Maps **sorter identifier → LIS user + workbench**. From that row the API derives:

- **User** — `loesort_usercode` (dedicated sorter LIS user, not `ltc611`)
- **Workstation** — `workbench.wkbh_station_name` (print queue / STAR location still on that workbench row)
- **Hospital** — if the request omits `hospital`, use `loesort_hosp` / `wkbh_hosp`

Hospital, lab, location, station name, and printer are **not** duplicated as the source of truth on the map; they are read from `workbench` after the map hit. The map still stores hosp / lab / server name so `LAB_DB` can be opened.

Forward:

```sql
CREATE TABLE loe_specimen_sorter_map (
  loesort_key           NUMBER        NOT NULL,
  loesort_sorter_id     VARCHAR2(64)  NOT NULL,
  loesort_usercode      VARCHAR2(32)  NOT NULL,
  loesort_hosp          VARCHAR2(8)   NOT NULL,
  loesort_labno         NUMBER        NOT NULL,
  loesort_server_name   VARCHAR2(64)  NOT NULL,
  loesort_workbench_id  VARCHAR2(16)  NOT NULL,
  created_at            TIMESTAMP,
  updated_at            TIMESTAMP,
  CONSTRAINT pk_loe_specimen_sorter_map PRIMARY KEY (loesort_key)
);

CREATE UNIQUE INDEX uk_loe_specimen_sorter_map_id ON loe_specimen_sorter_map (loesort_sorter_id);
```

Rollback:

```sql
DROP TABLE loe_specimen_sorter_map;
```

No DDL on `workbench`. Seed a workbench row per physical sorter plus one LIS user account.

### `LOE_AUDIT_TRAIL` — no DDL

| Action | When |
|---|---|
| `SORT_REG` | Registered from sorter (plus existing `REG`) |
| `SORT_SO` | Send-out from sorter (plus `SEND_OUT`) |
| `SORT_RELABEL` | Relabel |
| `SORT_FAIL` | Failure; description = message code + text |

Function `SPEC_ACK`. Add `SORT_*` to the Specimen Audit Trail action filter (D6).

## Interface / API contract

Traces to: R1, R8, R10

### Path

`POST /api/specack/sorter/auto-register`

No auth header in v1 (D1).

### Request body

```json
{
  "usid": "QHSP2500000012",
  "sorterId": "KTH-SORTER-01",
  "hospital": "QEH",
  "hkid": null,
  "patientName": null
}
```

| Field | Required | Rule |
|---|---|---|
| `usid` | Yes | Else Failure, no write. |
| `sorterId` | Yes | Lookup `loe_specimen_sorter_map` + workbench. Unknown → Failure. Derives user and workstation. |
| `hospital` | No | If omitted, derive from map / workbench. If sent, must match `loesort_hosp` / `wkbh_hosp` or Failure. |
| `hkid`, `patientName` | No | Present + mismatch → Failure. |

### Response

HTTP 200 with status `REGISTERED` / `SEND_OUT` / `RELABEL` / `FAILURE`. Transport errors 500. Soft alerts never in the body.

## Configuration

| Key | DEVQA | SIT | PROD | Type |
|---|---|---|---|
| `loe_specimen_sorter_map` rows | test sorter ids | SIT ids | real sorter ids | Oracle data |
| `workbench` row per sorter (`wkbh_id`, lab, hosp, station_name, location, default_printer) | seed | seed | real | `LAB_DB` data |
| LIS user account for sorter | non-prod user | SIT user | prod user | LIS user admin, not ConfigMap |
| NetworkPolicy middleware → 8118 | DEV | SIT | PROD | OpenShift |
| API key | **not used v1** | — | — | D1 |

Print/PHLC still follow the staff print methods and `LisPhlcLabOrderAppServiceImpl.createPhlcLabOrder`. `httpClient.readTimeOut` 5 s; sorter p95 4 s excluding print.

## Error handling, logging, audit

- Soft alerts: `warn("SPEC_ACK", …)` only.
- Mixed send-out, STAR no location, hard validator, convertor cannot map ward/doctor: `SORT_FAIL` + message code (`0001162` … `4422`).
- Print/PHLC after **Registered** only (D11): ALS warn; status already returned stays (D4).
- Mask HKID in logs as register already does.
- Audit user = map `loesort_usercode`; workstation = `wkbh_station_name`.

## Non-functional

- Sync one call; p95 < 4 s through audit commit.
- ~20/min per lab v1.
- Worksheets + PHLC after return, **Registered only** (D11); print all (D4, D5).

## Rejected alternatives

| Alternative | Why rejected |
|---|---|
| Middleware retrieve then register | Packing still in the caller; convertor would not move. |
| Overload `/gcrSpecAckRegister` | Staff packing contract. |
| Overload ECPath5 register | Different caller; hard-coded user. |
| Skip convertor, only validator | `register()` will not get test groups / USID request no. / mapped locations. |
| `LOE_CONTROL` instead of map table | Requester chose a sorter map table (D7). |
| Keep table name `loe_sorter_map` | Requester 2026-09-10: `loe_specimen_sorter_map`. |
| Duplicate hosp/printer on the map only | Workbench already holds them; map points at workbench (D2). |
| Require hospital on every request | Requirement: derive from sorter id when omitted. |
| API key / Hub JWT in v1 | No authentication currently (D1). |
| Staff worksheet picker | Print all (D5). |
| Sync print in the HTTP call | Breaks 4 s; late worksheet accepted on Registered (D4). |
| Print worksheet after send-out / ack | Registration only (D11). |
| Invent STAR location when workbench has none | Failure (D9). |
| Mixed: send-out subset only | Failure (D3). |
| Fail when workbench lab ≠ test lab | Requester: no check (D10). |

## Promotion impact and fallback

**Promotion**

1. Create sorter LIS user.
2. Seed `workbench` for the physical sorter (lab, hosp, station name, location, printer).
3. `loe_specimen_sorter_map` row: sorter id, user, workbench id, lab, hosp, server name.
4. Deploy `lis-crs-spec-ack-svc`.
5. NetworkPolicy for middleware (no new auth).
6. Pilot CPS/HMS. Relabel/Failure bins → staff Spec Ack. Confirm Specimen Audit Trail action filter includes `SORT_*` (D6).

**Fallback**

1. Stop middleware. Staff Spec Ack unchanged.
2. `DROP TABLE loe_specimen_sorter_map` if full rollback; leave workbench/user or inactivate.
3. No conversion of historical requests.

## Open design questions

| # | Question | Owner | Answer |
|---|---|---|---|
| D1 | Middleware auth? | Requester | **No authentication currently.** NetworkPolicy only. No API key / JWT in v1. |
| D2 | LIS user and workstation? | Requester | **Dedicated sorter User.** Sorter identifier maps to **workbench**. Station name / printer / location from that row. |
| D3 | Mixed local + send-out? | Requester | **Failure.** |
| D4 | Print after HTTP return? | Requester | **OK** if worksheet is late; status already Registered. Does not apply to Send-out (no print). |
| D5 | Multiple worksheets? | Requester | **Print all** (registration path only). |
| D11 | When does the sorter print a worksheet? | Requester | **Registration only.** |
| D6 | `SORT_*` audit codes vs reuse `REG`/`SEND_OUT` only? | Requester | **Agree.** Keep `SORT_*` plus existing writes. Add `SORT_*` to the Audit Trail action filter. |
| D7 | Map table name and vs `LOE_CONTROL`? | Requester | **Sorter map table** `loe_specimen_sorter_map` (2026-09-10; was `loe_sorter_map`). |
| D8 | DFT via Spec Ack `register()` vs `/api/dftreg`? | Requester | **Agree.** Same Spec Ack `register()` packing. |
| D9 | STAR with no workbench location? | Requester | **Failure** (`4422`). |
| D10 | Map / workbench lab vs order test lab? | Requester | **No check.** |
