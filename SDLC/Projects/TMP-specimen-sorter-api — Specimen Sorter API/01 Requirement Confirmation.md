---
title: 01 Requirement Confirmation — Specimen Sorter API
tags:
  - sdlc
  - requirement
generated_by: requirement-confirmation
generated_on: '2026-09-07'
reviewed_by: Requester
review_date: '2026-09-07'
agent_assisted: true
---
# 01 Requirement Confirmation — Specimen Sorter API

Sources used (no PHI):

- Deck: `USID Auto-Registration Flow.deck.json` (Specimen Sorter API Proposal, 28 Aug 2026)
- Earlier confirmation slides: `Requirement Confirmation.pptx.md` (14 Jul 2026)
- 16-row questionnaire: `Specimen Sorter Requirement Confirmation.xlsx.md`
- User requirement / SEM: `User requirement for LIS API to support auto registration (SEM20260612).pptx.md` and `Specimen Sorter v0.3.md`
- Longer technical questionnaire: [[LIS/Project Plans/Specimen Sorter/Requirement Confirmation]]
- Current behaviour: [[Retrieve Order Information by Specimen Number]], [[Register Request]], [[Send Out Information Dialogue]], Spec Ack UI in `lab-crs-app`, register/send-out APIs in `lis-crs-spec-ack-svc`
- Requester answers: 2026-09-07 (this note, Confirmation)

## Background and trigger

Labs (KTH/QEH, UCH first; PWH later) will load tubes onto a specimen sorter. Today a staff member scans the specimen label on **Specimen Acknowledgement** and clicks Send-out or Registration. The sorter should scan the USID, call LIS, then sort/move the tube.

**Current behaviour (as-is)**

1. Staff enter or scan Specimen No. / Lab# / Order# on Specimen Acknowledgement (`lab-crs-app`).
2. LIS validates GCRS Specimen Number format, allowed sending hospital (`SP_ALLOW_HOSP`), and check digit, then loads the GCRS order from `LOE_SPECIMEN_DETAIL` ([[Retrieve Order Information by Specimen Number]]). Invalid format / hospital / check digit / not found stops retrieval (messages 1336, 1337, 1338, 1377).
3. Soft alerts can fire after retrieve: missing collection date, overnight specimen, test validity / valid period, duplicate reason / A-A-R, private patient / patient tag, mixed local + send-out, unboxed specimen, BBS blood requirement / category / T&S remark.
4. Hard checks can stop registration: datetime rules, unmapped doctor / location / specialty / report destination, test check, MBS/VRS specimen setup, patient demographic mismatch, unexpected error.
5. APS / BBS registration still needs staff-entered fields (spec type, path/tech, auth, macro; BBS request comment, date required, type, unit).
6. Send-out is a staff click. A GCRS test is treated as send-out when its test / cluster code is listed in `LOE_SENDOUT_TEST.LOESEND_CLUSTER_CODE` (scoped by `LOESEND_LABNO` and `LOESEND_HOSP`). Spec Ack search already inner-joins `loe_request_test.loereqtst_test_code` to that column. Backend `/sendOutSpecimen` acknowledges a Printed/Collected specimen, writes SMART/specimen-tracking, and writes `LOE_AUDIT_TRAIL`.
7. Register is a staff click. Backend `/gcrSpecAckRegister` takes a full `GcrsSpecAckPackingDto` assembled by the UI and calls `specAckAppService.register()`. There is also `/v1/ecpath5-register` for ECPath5 — not a sorter contract.
8. Relabel is decided in the UI (`useCheckAutoAssignReqNo`): more than one request test group; more than one specimen / suffix A/B/C mapped to the same test; several DFT specimens for one time flag; force relabel (`LOE_TEST_MAP` / workstation relabel). USID is then not used as the request number.
9. After a successful register, Spec Ack can print GCRS worksheet, send-out form, SH form, request-no / aliquot / second-tube labels, and can create a PHLC electronic order when `CREATE_PHLC_LAB_ORDER_REG` is on.
10. Spec Ack already writes `LOE_AUDIT_TRAIL` (including send-out). Staff can search specimen actions on Specimen Audit Trail. **No sorter / USID auto-registration API exists.**

**Trigger**

Replace the manual scan + button clicks with a middleware-called LIS API so the sorter can route the tube from the API result.

## In scope

- A LIS API (or small set of APIs) that sorter **middleware** calls. Middleware-to-LIS is API. LIS does not speak HL7 / FHIR / ASTM to the sorter in this work.
- Look up the GCRS order by **USID / GCRS Specimen Number** and either continue or return Failure / order not found.
- v1 labs: **CPS** and **HMS** only.
- For in-house tests: run the current Spec Ack hard checks (no staff at the keyboard) and return one of **Registered**, **Relabel**, or **Failure**.
- For send-out tests: a test is send-out when its GCRS cluster code exists in `LOE_SENDOUT_TEST` (`LOESEND_CLUSTER_CODE`, scoped by lab and hospital). Acknowledge via the existing send-out path and return a send-out status.
- On Registered: return enough data for routing (at least lab discipline / LIS lab code, and test / GCRS code) **and** the registration status.
- Apply current Spec Ack hard-check logic on the API path (location / doctor not found, datetime rules, test check, patient discrepancy, specimen not registrable).
- After auto-register / send-out: print **worksheets** (GCRS worksheet, send-out form, SH form when Spec Ack would) and create **PHLC electronic order** when the lab option is on.
- Persist an auto-registration outcome on Specimen Audit Trail / `LOE_AUDIT_TRAIL` so staff can find the USID and see Registered / Relabel / Failure / send-out and a remark or reject reason.
- Performing hospital / lab: supplied on the call **or**, if missing, mapped from a **specimen-sorter identifier** held in a mapping table (table design in `/system-design`; whether the sorter sends hospital is still Q2).

## Out of scope

> Explicitly excluded.

- Sorter hardware, vendor firmware, drawer/channel design, pneumatic tube, and TLA connectivity.
- LIS protocol talking HL7 / FHIR / ASTM to the sorter (middleware owns that).
- Changing the existing staff Specimen Acknowledgement scan-and-click workflow, except reuse of Specimen Audit Trail for status.
- Retrieval by **order number** or **request number** on the sorter API.
- A dedicated new frontend list. Status check reuses Specimen Audit Trail + `LOE_AUDIT_TRAIL`.
- **APS / BBS / MBS** (and VRS) special panels and their input dialogues.
- **Label printing** on the auto-register path (request-no, aliquot, second-tube). Labels stay on staff Spec Ack.
- Auto-creating unmapped doctors or locations from dictionary.
- Delete investigation, revise urgency, or other CRS functions named in SEM20260612 that are not send-out / register.
- Tube type / colour as a required sorter field (optional, ignored for routing).
- A background retry job or monitoring console. Middleware may re-POST the same USID.
- Caller-supplied request number. Relabel does not auto-generate a number the tube does not carry.
- ECPath5 `/v1/ecpath5-register` contract changes.
- PWH all-discipline / 4000 specimens per hour as a v1 non-functional target.
- **DFT / STAR** — still TBC (Q5). Until answered, treat as unsupported **Failure** (same as APS/BBS/MBS).

## Functional requirements

| ID | Requirement | Acceptance criteria |
|---|---|---|
| R1 | Sorter middleware can call a LIS auto-registration API with a USID (and optional identity fields). | Given a reachable LIS environment and a valid service/lab context, a request that contains only a USID is accepted. A request with no USID is rejected without touching GCRS or lab-request data. |
| R2 | The API looks up the GCRS order by USID using the same format, allowed-hospital, and check-digit rules as Spec Ack specimen-number retrieve. | Valid USID with a matching `LOE_SPECIMEN_DETAIL` proceeds. Invalid format, disallowed sending hospital, bad check digit, or no record returns **Failure** and does not register or send out. Messages equivalent to 1336 / 1337 / 1338 / 1377 appear on the Failure response and audit remark. |
| R3 | In-house registration has exactly three outcomes: **Registered**, **Relabel**, **Failure**. | Registered writes the lab request and returns test code + lab discipline. Relabel does **not** write a lab request. Failure does **not** write a lab request. Relabel is never reported as Failure. |
| R4 | Relabel is returned when USID cannot be the request number. | Each of these returns Relabel, not Failure and not Registered: (a) more than one request test group in `LOE_TEST_MAP`; (b) more than one specimen mapped to the same test, including suffix A/B/C; (c) more than one DFT specimen for the same time flag (only if DFT is later brought in scope); (d) force relabel from test / workstation setup. |
| R5 | Hard checks that stop Spec Ack registration also stop the API. | Date/time rules, unmapped request doctor / location / specialty / report destination / report copy, test check failed, patient demographic mismatch, and unexpected error each return **Failure** and do not register. Specimen already used, all tests registered, all tests deleted, or specimen deleted/rejected return **Failure**. APS / BBS / MBS (and DFT / STAR until Q5) return **Failure** (unsupported). |
| R6 | Soft Spec Ack alerts do not block the API. | Overnight, test validity / valid period, duplicate-reason prompt, patient tag / private patient, mixed local + send-out, and missing-collection-date *dialogue* do not return Relabel or Failure by themselves. How they are logged is Q9 (TBC). Unboxed handling is Q12 (TBC). |
| R7 | A test is send-out when its GCRS cluster code is in `LOE_SENDOUT_TEST`. | Match `loe_request_test.loereqtst_test_code` to `LOE_SENDOUT_TEST.LOESEND_CLUSTER_CODE` for the performing lab (`LOESEND_LABNO`) and hospital (`LOESEND_HOSP`). Those tests take the existing `/sendOutSpecimen` path (ack if Printed/Collected, tracking log, `LOE_AUDIT_TRAIL`) and the API returns a send-out status. Tests not in that table take the in-house path (R3). No sorter send-out flag. |
| R8 | A successful Registered (or send-out) response includes routing data and status. | Response includes at least LIS lab code / lab discipline, GCRS / test code, and status Registered / Relabel / Failure / send-out in the same call. No second status-poll API in v1. |
| R9 | Staff can find an auto-registration attempt on Specimen Audit Trail. | API writes `LOE_AUDIT_TRAIL` Action = outcome. Staff search by specimen number / action / action date and see status plus remark or reject reason. No new frontend list. |
| R10 | Performing hospital / receiving lab is known before send-out or register. | If the caller supplies hospital/lab, use it. If not, resolve from a maintained mapping of **specimen-sorter identifier → hospital/lab**. If neither is available, do not register or send out (Failure). Mapping-table shape is design; whether the sorter sends hospital is still Q2. |
| R11 | Request number on Registered is USID when USID is eligible; Relabel cases do not consume USID as request number. | Eligible single-specimen, single-group, suffix `0`, not force-relabel → request number = USID. Relabel cases do not assign a request number and do not register. No caller `assignedRequestNo`. If auto-gen would be the only option, still **Relabel**. |
| R12 | Acknowledgement and registration datetime default to server current time. | Ack/register datetime is server now. Collection date missing: proceed (soft), do not invent a collection date. Collection date < DOB, ack < collection, ack < request date, ack in the future → **Failure**. |
| R13 | After a successful auto-register or send-out, print worksheets and create PHLC order as Spec Ack would; do not print labels. | Worksheets (GCRS worksheet, send-out form, SH form when applicable) are produced on the API path. PHLC electronic order is created when `CREATE_PHLC_LAB_ORDER_REG` (or the Spec Ack equivalent) is on and the destination matches. Request-no / aliquot / second-tube labels are **not** printed. |

## Non-functional requirements

| Area | Requirement |
|---|---|
| Volume | v1 sized for UCH ~500–600 samples/hour peak and KTH/QEH ~1200 samples/hour (~20/min). PWH ~2000/hour × 2 sorters / 4000/hour is a later wave, not a v1 pass criterion. **Pass mark still Q17 (TBC).** |
| Latency | Synchronous one-call-per-tube. UCH asked for about 3–4 seconds LIS time inside a ~6 second sorter cycle. Proposed default remains p95 < 4 s **excluding** printer and PHLC wait — **Q17 TBC**. Async register-behind-the-sorter is out unless Q17 says otherwise. |
| Retention | Outcome rows follow the same retention as existing `LOE_AUDIT_TRAIL` / specimen action search. No new retention policy. |
| Audit | Every terminal API outcome writes `LOE_AUDIT_TRAIL`. Soft-alert logging is Q9 (TBC). No PHI in API logs beyond what Spec Ack already writes. |

## Impact

| Affected | Detail |
|---|---|
| Services | **`lis-crs-spec-ack-svc`** — new sorter-facing API; reuses `specAckAppService.register()`, `sendOutSpecimen()`, worksheet generation, PHLC create. Existing UI contracts stay. **`lab-crs-app`** — Audit Trail only (no new list). Print/PHLC on API path may still use the same backend calls Spec Ack uses today (`PrintWorksSheet.ts` / `/gcrSendOutWorkSheet`). **`lis-hub-svc`** — only if Hub must front the sorter. |
| Screens | Specimen Acknowledgement (staff fallback). Specimen Audit Trail (R9). No new status list. Send Out Information Dialogue is not shown to the sorter. |
| Tables | Read: `LOE_SPECIMEN_DETAIL`, GCRS order/test, `LOE_TEST_MAP`, `LOE_SENDOUT_TEST` (`LOESEND_CLUSTER_CODE`, `LOESEND_LABNO`, `LOESEND_HOSP`), hospital/location/doctor dictionary, `LOE_CONTROL`. Write: lab request / GCRS update on Registered; send-out + specimen tracking; `LOE_AUDIT_TRAIL`; PHLC order when required. **New:** sorter-identifier → hospital/lab mapping table (Q2). |
| Interfaces / partners | Sorter **middleware**. Labs: KTH/QEH, UCH CPS & HMS (v1). ECPath5 register path must not break. |

**Callers the requester may have missed**

- Worksheet + PHLC on the API path (R13) will touch the same print/PHLC services Spec Ack uses after register. Label printers stay unused on this path — TLA sites that need a request-no label before the analyser still print from staff Spec Ack or the sorter.
- `/v1/ecpath5-register` is another machine register. Do not overload it as the sorter contract.
- Registration packing (`lis-request-app` / [[Register Request]]) is a different save path.
- SMART / specimen-tracking must still be written on auto send-out.

## Assumptions

Updated 2026-09-07 from requester answers. Struck items were replaced.

1. Work type is a **project**.
2. Middleware talks REST/API to LIS.
3. v1 lookup key is USID only. *(Q4 agreed)*
4. Hospital/lab comes from the call, or from a sorter-identifier mapping table if omitted. *(Q2 TBC)*
5. Send-out vs in-house is `LOE_SENDOUT_TEST.LOESEND_CLUSTER_CODE`, not a sorter flag and not `sendOutHospitals` alone. *(Q3)*
6. Soft alerts do not block. Logging method is Q9 (TBC).
7. Relabel is a first-class outcome.
8. Status check reuses Specimen Audit Trail + `LOE_AUDIT_TRAIL`. *(Q8 agreed)*
9. Worksheets **yes**, labels **no**, PHLC **yes**. *(Q10)*
10. Registration status **is** returned to middleware. *(Q11 agreed)*
11. Sync API (one call per tube) unless Q17 changes it.
12. HKID / name optional; mismatch fails; missing does not. Encounter / tube colour optional and not used for routing. *(Q1, Q18 agreed)*
13. v1 labs are CPS and HMS only. APS / BBS / MBS out. DFT / STAR TBC. *(Q5)*

## Open questions

| # | Question | Proposed default | Owner | Answer |
|---|---|---|---|---|
| Q1 | Can the sorter send HKID and/or patient name for cross-check? | Optional. Present + mismatch → Failure. Absent → do not fail. | Requester | **Agree** (2026-09-07). |
| Q2 | Does the sorter provide performing / receiving hospital? | If provided, use it. If not, map by specimen-sorter identifier from a maintained table. | Requester | **TBC.** Fallback mapping agreed. Whether the sorter sends hospital is still open. |
| Q3 | How does the system know the specimen should be sent out? | Cluster code in `LOE_SENDOUT_TEST` (`LOESEND_CLUSTER_CODE`, scoped by lab/hospital). | Requester | **Cluster code defined in `LOE_SENDOUT_TEST`.** |
| Q4 | Retrieval by order no. / request no. on the sorter API? | No. USID only. | Requester | **Agree**. |
| Q5 | Which labs are in v1? APS / BBS / MBS / DFT / STAR? | CPS and HMS only. APS / BBS / MBS out. DFT / STAR unsupported Failure until decided. | Requester | **APS/BBS/MBS: No. Only CPS and HMS. DFT/STAR: TBC.** |
| Q6 | Failure when order not found, USID already used, or nothing registrable? | Yes. | Requester | **Agree**. |
| Q7 | One Failure status plus message code? | Yes. | Requester | **Agree**. |
| Q8 | New status list vs Audit Trail? | Reuse Specimen Audit Trail + `LOE_AUDIT_TRAIL`. | Requester | **Agree**. |
| Q9 | Log Spec Ack alert / confirmation messages on the API path? | Soft alerts: ALS/warn only; hard-fail messages on response and audit remark. | Requester | **TBC.** |
| Q10 | Worksheets / labels / PHLC after auto-register? | Worksheet yes. Label no. PHLC yes. | Requester | **Worksheet: Yes. Label: No. PHLC: Yes.** |
| Q11 | Return registration status to the sorter? | Yes, same response. | Requester | **Agree**. |
| Q12 | Specimen not unboxed? | Failure (unsupported). Do not auto-confirm. | Requester | **TBC.** |
| Q13 | Who assigns request number? | USID when eligible; else Relabel. | Requester | **Agree**. |
| Q14 | Ack / register datetime = server now? Fail datetime rules? | Yes / Yes. Missing collection date is soft. | Requester | **Yes.** |
| Q15 | Partial registration? | Relabel — staff finish on Spec Ack. | Requester | **Agree**. |
| Q16 | Fail-case retry and monitoring? | Re-POST same USID; no new job. | Requester | **Agree**. |
| Q17 | Latency / volume pass mark for v1? | p95 < 4 s; ~20/min; sync. | Requester | **TBC.** |
| Q18 | Encounter and tube type/colour? | Optional, ignored for routing. | Requester | **Agree**. |

Still open (deferred, owner = Requester): **Q2, Q5 (DFT/STAR only), Q9, Q12, Q17**.

Design-level follow-ups stay on [[LIS/Project Plans/Specimen Sorter/Requirement Confirmation]] for `/system-design`.

## Confirmation

> Quote or link the requester's written confirmation here. The gate does not close without it.

- Confirmed by: Requester (chat)
- Date: 2026-09-07
- Statement (quoted):

> Q1: Agree  
> Q2: TBC, if not provided, shall be mapped by identifier of specimen sorter, where mapping is maintained in a table  
> Q3: cluster code defined in loe_sendout_test table  
> Q4: Agree  
> Q5: APS/BBS/MBS: No, Only CPS and HMS. DFT/STAR: TBC  
> Q6: Agree  
> Q7: Agree  
> Q8: Agree  
> Q9: TBC  
> Q10: Worksheet: Yes. Label: No. PHLC: Yes  
> Q11: Agree  
> Q12: TBC  
> Q13: Agree  
> Q14: Yes  
> Q15: Agree  
> Q16: Agree  
> Q17: TBC  
> Q18: Agree

This is confirmation of the open-question answers, not a close of the requirement gate. Five items remain TBC.
