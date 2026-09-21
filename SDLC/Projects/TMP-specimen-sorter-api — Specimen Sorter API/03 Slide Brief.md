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

Facts come from [[02 System Design]] (reviewed Tony Chong; D12 14 Sep, D1 APIM 15 Sep, D14 map 21 Sep) and the consumer contract it links, [[API Specification]]. Dates from [[05 Project Plan]]. Presentational only. Deck: `assets/Specimen Sorter API v3.deck.json`.

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
4. Contract and data — APIM call, sorter map, audit
5. Promotion and fallback
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
**Title:** One POST, the screen logic behind it, one map table
**Archetype:** cards (4-up, icons)
1. New API — `POST /api/sorter/auto-register` on lis-crs-spec-ack-svc. Staff `/api/specack` is unchanged.
2. Move screen logic — retrieve, validation and packing run server-side, then the existing send-out, register, print and PHLC.
3. Sorter map — `loe_specimen_sorter_map`: sorter id (PK) to LIS user, hospital and workbench. No lab. No server name.
4. Audit — `SORT_*` actions plus today's `REG` and `SEND_OUT` on `LOE_AUDIT_TRAIL`.
**Notes:** No new service and no DDL on workbench. Staff Spec Ack stays as the Relabel and Failure bin.

### Slide: Proposed Change - outcome flow
**Eyebrow:** 03A. Outcome flow
**Title:** Every tube ends in one of four statuses
**Archetype:** decision-flow
Start: POST with USID and sorterId → Checks pass? (No → FAILURE: unknown sorter, not CPS or HMS, mixed, hard check, 4422) → Relabel rules? (Yes → RELABEL: multi-group, suffix, DFT time flag) → All tests send-out? (Yes → SEND_OUT) → No → REGISTERED.
Condition strip: `data.status` REGISTERED | SEND_OUT | RELABEL | FAILURE. HTTP 200 on every decision; soft alerts go to ALS.
**Notes:** A tube with both local and send-out tests fails rather than splitting (D3). Relabel is not reported as Failure.

### Slide: Contract
**Eyebrow:** 04. API contract
**Title:** Middleware calls through HA APIM with a gateway key
**Archetype:** code-findings (JSON request and data)
JSON `data`: `status`, `labCode` (`CPS`/`HMS`), `testCode` — no `labNo`.
Findings: Gateway headers (`x-gateway-apikey`, `x-ha-hospcode`; no Hub JWT). Hospital optional (omitted → `loesort_hosp`; sent and different → Failure). Bin from `data.status` (HTTP 200 is not Registered; 401/403 are gateway, 500 retry).
**Notes:** Same hosts and headers as the GCRS-LIS API specification v1.0, but a new APIM product. Business failure codes sit on data.code, never as an HTTP 4xx from LIS.

### Slide: Identity
**Eyebrow:** 04A. Sorter identity
**Title:** User and workbench come from the sorter id, not a PC
**Archetype:** compare
- Staff today (neutral): Login: staff LIS account. Workbench: selectWorkbench by PC name or IP. Retrieve GET: hard-codes user ltc611.
- Sorter POST (accent): User: loesort_usercode on the map. Workbench: map wkbh_id plus the lab from the retrieved order. Hospital: request value, else loesort_hosp. Server: HospitalService / LisLabServer, not a map column.
**Notes:** The sorter must never use the retrieve GET, because of the hard-coded user. Audit rows carry the map user and the workbench station name.

### Slide: Data
**Eyebrow:** 04B. Data model
**Title:** Sorter id is the PK. Lab and server stay off the map
**Archetype:** matrix + takeaway
Columns: loesort_sorter_id VARCHAR2(64) PK · loesort_hosp VARCHAR2(8) · loesort_usercode VARCHAR2(12) · loesort_workbench_id VARCHAR2(8).
Takeaway: One sorter, more than one lab — lab from the order; seed one workbench row per lab (D12). Server name from HospitalService, not loesort_server_name (D14).
**Notes:** Rollback is DROP TABLE. No loesort_key. Location, station name and printer stay on workbench.

### Slide: Status and side effects
**Eyebrow:** 04C. Status and audit
**Title:** Only REGISTERED prints, and only after the response
**Archetype:** matrix
| Status | Writes | Worksheet and PHLC | Sorter bin |
| REGISTERED | Lab request, SORT_REG and REG | All worksheets, then PHLC, after return | In-house |
| SEND_OUT | Send-out, tracking, SORT_SO and SEND_OUT | None | Send-out |
| RELABEL | SORT_RELABEL only | None | Staff Spec Ack |
| FAILURE | SORT_FAIL with message code | None | Staff Spec Ack |
**Notes:** A late worksheet does not change a status already returned (D4). Print failure is an ALS warning, nothing more.

### Slide: Non-functional
**Eyebrow:** 05. Non-functional
**Title:** One synchronous call per tube
**Archetype:** stats
< 4 s p95 through audit commit, print excluded · ~20/min per lab in v1 · CPS and HMS on the order; APS, BBS, MBS fail.
**Notes:** Print sits outside the 4 second budget, which is why it runs after the response.

### Slide: Promotion and fallback
**Eyebrow:** 06. Promotion and fallback
**Title:** Seed the map, open the gateway path, pilot CPS and HMS
**Archetype:** compare (steps)
- Promotion: create sorter LIS user · seed workbench per lab · insert map row (PK sorter id, no lab, no server name) · deploy service · APIM product and NetworkPolicy · pilot CPS and HMS.
- Fallback: stop middleware, staff Spec Ack unchanged · drop the map table on full rollback · no conversion of historical requests.
**Notes:** Confirm the Audit Trail filter shows SORT_* before the pilot, or staff cannot find the sorter's attempts.

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
