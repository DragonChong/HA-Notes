---
agent_assisted: true
generated_by: design-review-pptx
generated_on: '2026-09-21'
profile: full
reviewed_by: ''
tags:
  - sdlc
  - slide-brief
title: 03 Slide Brief — Specimen Sorter API
---
# 03 Slide Brief — Specimen Sorter API

Facts come from [[02 System Design]] (reviewed Tony Chong; D15 and D16 22 Sep) and the consumer contract it links, [[API Specification]]. Dates from [[05 Project Plan]]. Presentational only. Deck: `assets/Specimen Sorter API v3.deck.json`.

**Profile:** full (new API, risk high)
**JIRA key:** TMP-000 stand-in — Change Request not created yet (reference SEM20260612)
**Service:** lis-crs-spec-ack-svc
**Review forum:** CP3
**Review date:** not scheduled (design-review exception 2026-09-10); deck dated 21 Sep 2026
**Presenters:** Ka
**Reviewers:** Tony Chong, CP3 panel

---

### Cover
**Archetype:** title-hero
**Eyebrow:** CP3 · Design review · 21 Sep 2026
**Headline:** Specimen Sorter API
**Lede:** Sorter middleware calls one POST on lis-crs-spec-ack-svc. It sends out or registers the tube by USID, with the checks and packing Specimen Acknowledgement runs today.
**Stats:** Service lis-crs-spec-ack-svc · Change TMP-000 (key pending) · Target 30 May 2027 · Design approved
**Notes:** Tony Chong reviewed the design on 10 Sep. Since then: no lab on the map (14 Sep), HA APIM as the consumer (15 Sep), and the map PK / column lengths (21 Sep). The Change Request key still has to be created by hand.

### Agenda
**Archetype:** agenda
1. Background — staff clicks today, sorter calls tomorrow
2. Existing design — what the Spec Ack screen owns
3. Proposed change — one POST, four outcomes
4. Send-out, validation, relabel — flow locator then detail
5. Contract and data — APIM call, sorter map, audit
6. Promotion and fallback
6. Open questions
**Notes:** Spend the time on the four statuses and the sorter map. Those are the decisions.

### Slide: Background
**Eyebrow:** 01. Background
**Title:** Staff scan and click today. The sorter will call LIS
**Archetype:** compare
- As-is (danger): Staff scan and press. Where: Specimen Acknowledgement in lab-crs-app. Action: scan the label, then Send-out or Register. Checks and packing: run on the screen.
- To-be (accent): Sorter scans, LIS decides. Where: sorter middleware through HA APIM. Action: one POST with the USID. Result: status on the same call, sorter bins the tube.
**Notes:** Middleware cannot call the staff register endpoint on its own, because the packing is built on the screen first. That is why there is a new API.

### Slide: Existing Design
**Eyebrow:** 02. Existing design
**Title:** The Spec Ack screen owns validation and packing
**Archetype:** matrix
| Action | Screen does | Service does | Sorter API |
| Retrieve GCRS order | Scans USID, calls retrieve | retrieveGcrOrder (GET hard-codes ltc611) | Retrieve as the mapped user |
| Send-out | Staff click | sendOutSpecimen, SEND_OUT | Same path |
| Validation | Soft prompts, hard validator | Assumes checks passed | Soft to ALS, hard to Failure |
| Packing | Groups tests, request no., ward and doctor | register() needs the packing | Server-side convertor |
| Worksheet | Builds Ro, staff pick | Three print methods | Print all, after Registered |
| PHLC | Calls after register | createPhlcLabOrder | After Registered |
**Notes:** The service only runs the writes. The second column is what moves behind the POST.

### Slide: Proposed Change - overview
**Eyebrow:** 03. Proposed change
**Title:** One POST, the screen logic behind it, workbench first
**Archetype:** cards (4-up, icons)
1. New API — `POST /api/sorter/auto-register` on lis-crs-spec-ack-svc. Staff `/api/specack` is unchanged.
2. Move screen logic — retrieve, validation and packing run server-side, then the existing send-out, register, print and PHLC.
3. Workbench first — `sorterId` = `wkbh_station_name`; user = `wkbh_id`. Map only if hospital is omitted (D15).
4. Audit — `SORT_*` plus today's `REG` and `SEND_OUT`. Print or PHLC fail writes `SORT_WS_FAIL` / `SORT_PHLC_FAIL`; status stays Registered.
**Notes:** No new service and no DDL on workbench. Staff Spec Ack stays as the Relabel and Failure bin.

### Slide: Proposed Change - outcome flow
**Eyebrow:** 03A. Outcome flow
**Title:** Every tube ends in one of four statuses
**Archetype:** decision-flow
Start: POST with USID and sorterId → Checks pass? (No → FAILURE: unknown sorter, not CPS or HMS, mixed, hard check, 4422) → Relabel rules? (Yes → RELABEL: multi-group, suffix, DFT time flag) → All tests send-out? (Yes → SEND_OUT) → No → REGISTERED.
Condition strip: `data.status` REGISTERED | SEND_OUT | RELABEL | FAILURE. HTTP 200 on every decision; soft alerts go to ALS.
**Notes:** A tube with both local and send-out tests fails rather than splitting (D3). Relabel is not reported as Failure.

### Slide: Send-out locator
**Eyebrow:** 03B. Send-out
**Title:** This decision: are all tests send-out?
**Archetype:** decision-flow (highlight first hexagon)
**Notes:** Next slide is LOESEND_HOSP and LOESEND_CLUSTER_CODE.

### Slide: Send-out detail
**Eyebrow:** 03C. Send-out
**Title:** A send-out test is a cluster code at that hospital
**Archetype:** code-findings
Match `loereqtst_test_code` to `LOESEND_CLUSTER_CODE` and send hospital to `LOESEND_HOSP`. All match → SEND_OUT. Mixed → FAILURE (D3). No sorter send-out flag.
**Notes:** Same join Spec Ack uses today. No print after SEND_OUT (D11).

### Slide: Validation locator
**Eyebrow:** 03D. Validation
**Title:** This decision: do hard checks pass?
**Archetype:** decision-flow (highlight second hexagon)
**Notes:** Next slide is hard Failure vs soft ALS.

### Slide: Validation detail
**Eyebrow:** 03E. Validation
**Title:** Hard Spec Ack checks stop the API as Failure
**Archetype:** matrix
Dates · doctor/location · test/specimen · patient · STAR 4422 · mixed send-out → FAILURE. Soft alerts ALS only (R6).
**Notes:** Relabel is a different node.

### Slide: Relabel locator
**Eyebrow:** 03F. Relabel
**Title:** This decision: can USID be the request number?
**Archetype:** decision-flow (highlight third hexagon)
**Notes:** Next slide is Assign-USID without the checkbox.

### Slide: Relabel detail
**Eyebrow:** 03G. Relabel
**Title:** Relabel when USID cannot be the request number
**Archetype:** cards (3-up)
Multiple request groups · multiple specimens / suffix / DFT time flag · force relabel / auto-gen-only. Return RELABEL. No write.
**Notes:** Same getAutoAssignUsid rules, no RelabelUisdSpecimenCheckboxId.

### Slide: Contract
**Eyebrow:** 04. API contract
**Title:** Middleware calls through HA APIM with a gateway key
**Archetype:** code-findings (JSON request and data)
JSON `data`: `status`, `labCode` (`CPS`/`HMS`), `testCode` — no `labNo`.
Findings: Gateway headers (`x-gateway-apikey`, `x-ha-hospcode`; no Hub JWT). Hospital sent → skip the map; omitted → `loesort_hosp`. Bin from `data.status` (HTTP 200 is not Registered; 401/403 are gateway, 500 retry).
**Notes:** Same hosts and headers as the GCRS-LIS API specification v1.0, but a new APIM product. Business failure codes sit on data.code, never as an HTTP 4xx from LIS.

### Slide: Identity
**Eyebrow:** 04A. Sorter identity
**Title:** User and workbench come from station name, not a PC
**Archetype:** compare
- Staff today (neutral): Login: staff LIS account. Workbench: selectWorkbench by PC name or IP. Retrieve GET: hard-codes user ltc611.
- Sorter POST (accent): User: wkbh_id. Workbench: wkbh_station_name = sorterId plus hosp and order lab. Hospital sent: no map. Omitted: loesort_hosp. Server: HospitalService / LisLabServer.
**Notes:** The sorter must never use the retrieve GET, because of the hard-coded user. Audit rows carry wkbh_id and wkbh_station_name.

### Slide: Data
**Eyebrow:** 04B. Data model
**Title:** Hospital sent: workbench only. Map is hospital fallback
**Archetype:** matrix + takeaway
Happy path: wkbh_station_name = sorterId · wkbh_id = LIS user · wkbh_hosp matches request · one row per lab.
Fallback map: loesort_sorter_id PK · loesort_hosp only. No usercode, workbench id, lab, or server columns.
Takeaway: One sorter, more than one lab — seed one workbench row per lab (D12). Map unused when hospital is always sent (D15).
**Notes:** Rollback is DROP TABLE if the fallback table was created. Location and printer stay on workbench.

### Slide: Status and audit
**Eyebrow:** 04C. Status and audit
**Title:** Each status writes an audit action
**Archetype:** matrix
| Status | Writes | Audit Action | Sorter bin |
| REGISTERED | Lab request | SORT_REG and REG | In-house |
| SEND_OUT | Send-out, tracking logs | SORT_SO and SEND_OUT | Send-out |
| RELABEL | None | SORT_RELABEL | Staff Spec Ack |
| FAILURE | None | SORT_FAIL with message code | Staff Spec Ack |
**Notes:** SORT_* plus today's REG and SEND_OUT sit on LOE_AUDIT_TRAIL. Print and PHLC fail are extra rows, not a fifth status.

### Slide: Worksheet and PHLC
**Eyebrow:** 04D. Worksheet and PHLC
**Title:** Only REGISTERED prints, and only after the response
**Archetype:** cards
- Worksheets — all after return. Fail writes SORT_WS_FAIL.
- PHLC electronic order — createPhlcLabOrder after return. Fail writes SORT_PHLC_FAIL.
- Status stays REGISTERED. ALS still warns. Put both codes on the Audit Trail filter.
**Notes:** Print sits outside the response. A late or failed worksheet does not change a status already returned.

### Slide: Non-functional
**Eyebrow:** 05. Non-functional
**Title:** One synchronous call per tube
**Archetype:** stats
< 4 s p95 through audit commit, print excluded · ~20/min per lab in v1 · CPS and HMS on the order; APS, BBS, MBS fail.
**Notes:** Print sits outside the 4 second budget, which is why it runs after the response.

### Slide: Promotion and fallback
**Eyebrow:** 06. Promotion and fallback
**Title:** Seed workbench, open the gateway path, pilot CPS and HMS
**Archetype:** compare (steps)
- Promotion: seed workbench per lab (station name = sorter id, user = wkbh_id) · map row only if hospital can be omitted · deploy service · APIM product and NetworkPolicy · pilot CPS and HMS.
- Fallback: stop middleware, staff Spec Ack unchanged · drop the map table if it was created · no conversion of historical requests.
**Notes:** Confirm the Audit Trail filter shows SORT_* including SORT_WS_FAIL and SORT_PHLC_FAIL, or staff cannot find a print or PHLC fail.

### Slide: Open Questions
**Eyebrow:** 07. Open questions
**Title:** Three things to settle before SIT
**Archetype:** asks
1. Does in-process retrieveGcrOrder need the lab before the USID lookup? — D13. If yes, fix the retrieve, not the map. Do not put lab or server name on the map.
2. Who creates the Change Request key? — SIT evidence has no ticket yet.
3. Which 2027 promotion window do we file under? — Target 30 May 2027; June and July 2027 are past the published calendar.
**Notes:** D1 to D12 and D14 are answered. D13 is the only open design point; the other two are delivery.

### Slide: Q&A
**Archetype:** statement (dark, centred)
**Headline:** Q&A
**Notes:** Likely: why not let middleware call the staff register; why hospital can be omitted; why mixed tubes fail; why server name is not on the map.

### Close
**Archetype:** closing
**Headline:** Next for Specimen Sorter API
**Stat:** 30 MAY 2027
**Body:** Target completion. Development runs to 31 Dec 2026, SIT from January.
**Next steps:** Create the Change Request · Close D13 in WP1 · Seed SIT user, workbench and map
**Notes:** The date is promotion preparation end. Submission is June and pilot July 2027 per the project plan.
