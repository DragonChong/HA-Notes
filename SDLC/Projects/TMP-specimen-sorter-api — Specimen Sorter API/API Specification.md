---
title: API Specification — Specimen Sorter Auto-register
tags:
  - sdlc
  - api
  - specimen-sorter
generated_on: 2026-09-15
status: draft
traces:
  - "[[01 Requirement Confirmation]]"
  - "[[02 System Design]]"
service: lis-crs-spec-ack-svc
version: v1
---

# API Specification — Specimen Sorter Auto-register

Traces to: [[01 Requirement Confirmation]] R1–R14 · [[02 System Design]]

Gateway pattern copied from *GCRS-LIS API specification v1.0* (HOIT&HI CP1, Jan 2026): consumer registers on APIM, calls `apim-gateway-{env}.server.ha.org.hk`, sends `x-gateway-apikey`. That document is **LIS → GCRS** (`cms-gcrs-lisApiServices/v1`). This note is **sorter middleware → LIS**. Same gateway; **different API product** (name assigned when the usage form is approved).

Companion OpenAPI: [[assets/specimen-sorter-auto-register.openapi.yaml]]

This is the **v1 middleware contract**. Staff Specimen Acknowledgement endpoints (`/retrieveGcrOrder`, `/gcrSpecAckRegister`, `/sendOutSpecimen`, `/v1/ecpath5-register`) are unchanged and are **not** this API.

## Access — API gateway

Sorter middleware does **not** call `lis-crs-spec-ack-svc` on the OpenShift route. It calls **HA API Management (APIM)** the same way GCRS-LIS consumers do.

1. Register the consumer: [API usage form](http://ea.home/apim/API%20Management%20Forms/apiUsageForm.html).
2. Requested API: the **specimen sorter / Spec Ack** product (not `cms-gcrs-lisApiServices/v1`). Product id is filled in when APIM publishes it.
3. Per environment, APIM issues `x-gateway-apikey`. Do not put the key in source control or in the JSON body.

### Consumer base URL (pattern)

Same hosts as GCRS-LIS v1.0. Path after `/gateway/` is the **new** product + version.

| Env | Gateway host (from GCRS-LIS v1.0) | Method (LIS) |
|---|---|---|
| SIT | `https://apim-gateway-sit.server.ha.org.hk/gateway/{product}/v1/` | `POST …/sorter/auto-register` |
| PPM | `https://apim-gateway-ppm.server.ha.org.hk/gateway/{product}/v1/` | same |
| AAT | `https://apim-gateway-aat.server.ha.org.hk/gateway/{product}/v1/` | same |
| PRD | Refer to production APIM setup | same |

`{product}` is unverified until APIM publish (example shape only: `lis-crs-spec-ack` or similar). Gateway may strip `/api/specack`; the **resource** is still `sorter/auto-register`. Confirm the published path on the usage-form response.

Behind the gateway, LIS remains `lis-crs-spec-ack-svc`, root `/api/specack`. NetworkPolicy is gateway → service, not sorter → the service directly.

**D1 update (consumer):** D1 “no auth header / NetworkPolicy only” applied to a direct call. The **sorter path is APIM**. Gateway enforces the API key. Do not send Hub JWT. LIS still does not treat Hub login as the caller.

## Service

| Item          | Value                                                                    |
| ------------- | ------------------------------------------------------------------------ |
| Service       | `lis-crs-spec-ack-svc` (behind APIM)                                     |
| Internal root | `/api/specack`                                                           |
| Consumer      | APIM `https://apim-gateway-{env}.server.ha.org.hk/gateway/{product}/v1/` |
| Content-Type  | `application/json`                                                       |
| Auth          | Gateway: `x-gateway-apikey` (mandatory).                                 |
| HTTP Method   | POST                                                                     |

## Endpoint

`POST …/sorter/auto-register` on the **APIM** product (internal: `POST /api/specack/sorter/auto-register`).

Looks up the GCRS order by **USID**, runs Spec Ack retrieve / validate / pack / send-out or register as the mapped sorter user, and returns a bin status on the same response.

## Request

### Headers

| Header             | Required         | Rule                                                        |
| ------------------ | ---------------- | ----------------------------------------------------------- |
| `Content-Type`     | Yes              | `application/json`                                          |
| `x-gateway-apikey` | Yes              | APIM key for that env (UUID string). Per consumer, per env. |
| `x-ha-hospcode`    | Yes if available | Performing hospital (e.g. `QEH`).                           |

LIS body rules for omitted `hospital` (derive from `loe_specimen_sorter_map`) still apply **after** the gateway accepts the call.

### Body

```json
{
  "usid": "QHSP2500000012",
  "sorterId": "KTH-SORTER-01",
  "hospital": "QEH",
  "hkid": null,
  "patientName": null
}
```

| Field         | Type   | Required | Rule                                                                                                                                                                                               |
| ------------- | ------ | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `usid`        | string | Yes      | GCRS Specimen Number / USID. Missing or blank → HTTP 200 + `FAILURE`, no retrieve, no write (R1). Format / allowed hospital / check digit follow Spec Ack retrieve (R2).                           |
| `sorterId`    | string | Yes      | Key on `loe_specimen_sorter_map`. Missing or unknown → HTTP 200 + `FAILURE`. Derives LIS user, hospital, server name, workbench id. **Not** a lab. One sorter may process more than one lab (D12). |
| `hospital`    | string | No       | Performing hospital. If omitted, use `loesort_hosp`. If sent and it does not match the map hospital → `FAILURE` (R10).                                                                             |
| `hkid`        | string | No       | If present and it does not match the GCRS patient → `FAILURE`. Mask in logs.                                                                                                                       |
| `patientName` | string | No       | If present and it does not match the GCRS patient → `FAILURE`.                                                                                                                                     |

## Response envelope

Same `ResultDataResponse` as other Spec Ack APIs (`hk.org.ha.lis.model.response.ResultDataResponse`).

| Field | Type | When |
|---|---|---|
| `code` | integer | `200` on a completed sorter decision. Transport / unexpected → `500` (`LisErrorConstants.INTERNAL_SERVER_ERROR`). |
| `message` | string | `"Success"` when `code` is 200. Transport text when `code` is 500. |
| `data` | object or null | Sorter payload when `code` is 200. Usually null on 500. |
| `timestamp` | long | Epoch millis. |

**Middleware rule:** treat `data.status` as the bin. Do **not** treat HTTP 200 as Registered. Soft alerts are never in this body (R6).

### HTTP status

| HTTP      | Envelope `code` | Meaning                                                                                                    |
| --------- | --------------- | ---------------------------------------------------------------------------------------------------------- |
| 200       | 200             | Decision finished. Read `data.status`: `REGISTERED` / `SEND_OUT` / `RELABEL` / `FAILURE`.                  |
| 401 / 403 | (gateway)       | Bad or missing `x-gateway-apikey`, or consumer not subscribed. **Not** a sorter bin. Fix key / usage form. |
| 500       | 500             | Transport / unhandled exception **after** gateway. Middleware may retry the same USID                      |

Do not use HTTP 4xx from **LIS** for unknown sorter, bad USID, or hard Spec Ack checks — those are HTTP 200 + `FAILURE`. Gateway 4xx is auth/subscription only.

## `data` payload

```json
{
  "status": "REGISTERED",
  "code": null,
  "message": null,
  "usid": "QHSP2500000012",
  "hospital": "QEH",
  "labCode": "CPS",
  "labNo": 1,
  "testCode": "LFT"
}
```

| Field      | Type    | When present                                                                                                                                                                    |
| ---------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `status`   | enum    | Always on HTTP 200. `REGISTERED` / `SEND_OUT` / `RELABEL` / `FAILURE`.                                                                                                          |
| `code`     | string  | `FAILURE`: Spec Ack / retrieve message id when known (`1336`, `1337`, `1338`, `1377`, `0001162`…`0001170`, `1090`, `4422`, or an internal sorter code). Null on other statuses. |
| `message`  | string  | `FAILURE`: short text for audit / support. Not soft-alert copy. Null on other statuses.                                                                                         |
| `usid`     | string  | Echo when a USID was supplied.                                                                                                                                                  |
| `hospital` | string  | Hospital actually used (request or map).                                                                                                                                        |
| `labCode`  | string  | `Lab` code from the order when retrieve succeeded (`CPS`, `HMS`, …) (R8).                                                                                                       |
| `labNo`    | integer | `Lab.getLabNo()` when retrieve succeeded.                                                                                                                                       |
| `testCode` | string  | GCRS / test / cluster code used for routing when known (R8). May be omitted on early Failure (missing usid, unknown sorter).                                                    |

`REGISTERED` writes the lab request. `SEND_OUT` uses existing send-out. `RELABEL` and `FAILURE` do not write a lab request (R3). Relabel is never reported as Failure (R4).

## Status meanings (sorter bin)

| `status`     | Write                                        | Worksheet / PHLC                                                      | Sorter action            |
| ------------ | -------------------------------------------- | --------------------------------------------------------------------- | ------------------------ |
| `REGISTERED` | Lab request + `SORT_REG` / `REG`             | After HTTP return (D11). Late print does not change this status (D4). | In-house bin             |
| `SEND_OUT`   | Send-out + tracking + `SORT_SO` / `SEND_OUT` | None                                                                  | Send-out bin             |
| `RELABEL`    | Audit `SORT_RELABEL` only                    | None                                                                  | Relabel / staff Spec Ack |
| `FAILURE`    | Audit `SORT_FAIL` only                       | None                                                                  | Failure / staff Spec Ack |

Mixed local + send-out on the same USID → `FAILURE` (D3), not send-out of a subset.

## Decision summary (middleware does not implement these)

1. Missing `usid` or `sorterId` → `FAILURE`.
2. Unknown `sorterId` → `FAILURE`.
3. Hospital sent and mismatch map → `FAILURE`.
4. Retrieve as mapped user. Not found / 1336 / 1337 / 1338 / 1377 → `FAILURE`.
5. Order lab not CPS or HMS → `FAILURE`.
6. Optional HKID / name mismatch → `FAILURE`.
7. Mixed local + send-out → `FAILURE`.
8. Hard validator / datetime / unmapped doctor-location / used or deleted specimen / STAR no workbench location (`4422`) → `FAILURE`.
9. Relabel rules (multi-group, multi-specimen / suffix, DFT same time-flag, force relabel) → `RELABEL`.
10. All tests in `LOE_SENDOUT_TEST` → `SEND_OUT`.
11. Else register → `REGISTERED`.

Soft alerts (overnight, valid period, missing collection date, duplicate/A-A-R, patient tag, STAR unbox *alert*) → ALS only. Status is still one of the four above.

## Examples

### Registered

```json
{
  "code": 200,
  "message": "Success",
  "timestamp": 1778800000000,
  "data": {
    "status": "REGISTERED",
    "usid": "QHSP2500000012",
    "hospital": "QEH",
    "labCode": "CPS",
    "labNo": 1,
    "testCode": "LFT"
  }
}
```

### Send-out

```json
{
  "code": 200,
  "message": "Success",
  "timestamp": 1778800000000,
  "data": {
    "status": "SEND_OUT",
    "usid": "QHSP2500000012",
    "hospital": "QEH",
    "labCode": "HMS",
    "labNo": 3,
    "testCode": "SO_CLUSTER"
  }
}
```

### Relabel

```json
{
  "code": 200,
  "message": "Success",
  "timestamp": 1778800000000,
  "data": {
    "status": "RELABEL",
    "usid": "QHSP2500000012",
    "hospital": "QEH",
    "labCode": "CPS",
    "labNo": 1
  }
}
```

### Failure — missing USID

```json
{
  "code": 200,
  "message": "Success",
  "timestamp": 1778800000000,
  "data": {
    "status": "FAILURE",
    "code": "MISSING_USID",
    "message": "usid is required"
  }
}
```

### Failure — retrieve not found

```json
{
  "code": 200,
  "message": "Success",
  "timestamp": 1778800000000,
  "data": {
    "status": "FAILURE",
    "code": "1377",
    "message": "Specimen not found",
    "usid": "QHSP2500000012",
    "hospital": "QEH"
  }
}
```

### Failure — STAR no workbench location

```json
{
  "code": 200,
  "message": "Success",
  "timestamp": 1778800000000,
  "data": {
    "status": "FAILURE",
    "code": "4422",
    "message": "Workbench location is not set",
    "usid": "QHSP2500000012",
    "hospital": "QEH",
    "labCode": "CPS",
    "labNo": 1
  }
}
```

### Transport error

```json
{
  "code": 500,
  "message": "<internal text — do not parse for binning>",
  "timestamp": 1778800000000,
  "data": null
}
```

HTTP 500. Middleware may retry. Do not bin as Relabel or Failure from this body.

## Failure `code` catalogue (v1)

Business codes sit on **`data.code`**, not envelope `code`.

| `data.code` | Typical cause |
|---|---|
| `MISSING_USID` / `MISSING_SORTER_ID` | Required field blank |
| `UNKNOWN_SORTER` | `sorterId` not on `loe_specimen_sorter_map` |
| `HOSPITAL_MISMATCH` | Request hospital ≠ map `loesort_hosp` |
| `UNSUPPORTED_LAB` | Order lab not CPS / HMS |
| `HKID_MISMATCH` / `NAME_MISMATCH` | Optional identity fields do not match GCRS |
| `MIXED_SENDOUT` | Local and send-out on the same USID (D3) |
| `1336` / `1337` / `1338` / `1377` | USID format / allowed hospital / check digit / not found (R2) |
| `0001162` … `0001170`, `1090` | Spec Ack hard validator / mapping |
| `4422` | STAR, no workbench location (D9) |
| `WORKBENCH_MISSING` | No `workbench` row for map `wkbh_id` + retrieved lab |

Exact string constants for the sorter-internal codes are set at implement (WP1). Spec Ack numeric codes stay as today.

## Idempotency and retry

- Middleware may re-POST the same USID (requirement).
- Already used / already registered / deleted specimen → `FAILURE` (R5), HTTP 200.
- HTTP 500 from **LIS** (envelope `code` 500) is a transport retry. Gateway 401/403 is not. Cap retries (GCRS-LIS: e.g. max 2).

## What this API does not do

- Direct OpenShift call to `lis-crs-spec-ack-svc` from the sorter (consumer = APIM)
- Hub JWT as the sorter credential
- Soft-alert text on the body (R6)
- Label print
- Caller-assigned request number
- Retrieve by order number or request number
- Overload `/gcrSpecAckRegister` or `/v1/ecpath5-register`
- Reuse `cms-gcrs-lisApiServices/v1` (that product is LIS → GCRS `updateLabOrderStatus` only)
- Return worksheet / PHLC payload (those run after `REGISTERED` on the server)

## Environments

| Env | Sorter consumer | Internal LIS |
|---|---|---|
| SIT | `apim-gateway-sit.server.ha.org.hk` + `{product}/v1` | `lis-crs-spec-ack-svc` |
| PPM | `apim-gateway-ppm.server.ha.org.hk` | same service |
| AAT | `apim-gateway-aat.server.ha.org.hk` | same service |
| PRD | production APIM host | same service |

`sorterId` values are data (`loe_specimen_sorter_map`), not ConfigMap keys. Gateway keys are APIM secrets per env.

DEVQA / local may call the service without APIM. That is not the production sorter path.

## Revision

| Date | Change |
|---|---|
| 2026-09-14 | First draft from 01 + 02. No `loesort_labno`. Envelope is `ResultDataResponse`. |
| 2026-09-15 | Consumer is HA APIM (same hosts/headers as GCRS-LIS API specification v1.0). New product, not `cms-gcrs-lisApiServices`. |
| 2026-09-15 | Dropped port numbers from this consumer spec. |
