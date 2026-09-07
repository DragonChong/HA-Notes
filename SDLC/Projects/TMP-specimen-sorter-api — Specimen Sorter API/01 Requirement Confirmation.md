---
title: 01 Requirement Confirmation — Specimen Sorter API
tags:
  - sdlc
  - requirement
generated_by: requirement-confirmation
generated_on: '2026-09-07'
reviewed_by: ''
review_date: ''
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

## Background and trigger

Labs (KTH/QEH, UCH first; PWH later) will load tubes onto a specimen sorter. Today a staff member scans the specimen label on **Specimen Acknowledgement** and clicks Send-out or Registration. The sorter should scan the USID, call LIS, then sort/move the tube.

**Current behaviour (as-is)**

1. Staff enter or scan Specimen No. / Lab# / Order# on Specimen Acknowledgement (`lab-crs-app`).
2. LIS validates GCRS Specimen Number format, allowed sending hospital (`SP_ALLOW_HOSP`), and check digit, then loads the GCRS order from `LOE_SPECIMEN_DETAIL` ([[Retrieve Order Information by Specimen Number]]). Invalid format / hospital / check digit / not found stops retrieval (messages 1336, 1337, 1338, 1377).
3. Soft alerts can fire after retrieve: missing collection date, overnight specimen, test validity / valid period, duplicate reason / A-A-R, private patient / patient tag, mixed local + send-out, unboxed specimen, BBS blood requirement / category / T&S remark.
4. Hard checks can stop registration: datetime rules, unmapped doctor / location / specialty / report destination, test check, MBS/VRS specimen setup, patient demographic mismatch, unexpected error.
5. APS / BBS registration still needs staff-entered fields (spec type, path/tech, auth, macro; BBS request comment, date required, type, unit).
6. Send-out is a staff click. Backend `/sendOutSpecimen` acknowledges a Printed/Collected specimen, writes SMART/specimen-tracking, and writes `LOE_AUDIT_TRAIL`. Send-out destination, fee, referral, and print-form fields are collected in the [[Send Out Information Dialogue]] when the Registration Send Out checkbox is used.
7. Register is a staff click. Backend `/gcrSpecAckRegister` takes a full `GcrsSpecAckPackingDto` assembled by the UI and calls `specAckAppService.register()`. There is also `/v1/ecpath5-register` for ECPath5 — not a sorter contract.
8. Relabel is decided in the UI (`useCheckAutoAssignReqNo`): more than one request test group; more than one specimen / suffix A/B/C mapped to the same test; several DFT specimens for one time flag; force relabel (`LOE_TEST_MAP` / workstation relabel). USID is then not used as the request number.
9. After a successful register, Spec Ack can print GCRS worksheet, send-out form, SH form, request-no / aliquot / second-tube labels, and can create a PHLC electronic order when `CREATE_PHLC_LAB_ORDER_REG` is on.
10. Spec Ack already writes `LOE_AUDIT_TRAIL` (including send-out). Staff can search specimen actions on Specimen Audit Trail. **No sorter / USID auto-registration API exists.**

**Trigger**

Replace the manual scan + button clicks with a middleware-called LIS API so the sorter can route the tube from the API result.

## In scope

- A LIS API (or small set of APIs) that sorter **middleware** calls. Middleware-to-LIS is API. LIS does not speak HL7 / FHIR / ASTM to the sorter in this work.
- Look up the GCRS order by **USID / GCRS Specimen Number** and either continue or return Failure / order not found.
- For in-house tests: run the current Spec Ack hard checks (no staff at the keyboard) and return one of **Registered**, **Relabel**, or **Failure**.
- For send-out tests: acknowledge send-out using the existing send-out path and return a send-out status the sorter can use to bin the tube.
- On Registered: return enough data for routing (at least lab discipline / LIS lab code, and test / GCRS code).
- Apply current Spec Ack hard-check logic on the API path (location / doctor not found, datetime rules, test check, patient discrepancy, specimen not registrable).
- Persist an auto-registration outcome so staff can later find the USID and see Registered / Relabel / Failure and a remark or reject reason.
- First intended users: KTH/QEH and UCH Chemistry & Haematology. Performing-hospital / lab context is required for send-out and registration (how it is supplied is Q2).

## Out of scope

> Explicitly excluded. Confirm or move an item into scope by answering the matching open question.

- Sorter hardware, vendor firmware, drawer/channel design, pneumatic tube, and TLA connectivity.
- LIS protocol talking HL7 / FHIR / ASTM to the sorter (middleware owns that).
- Changing the existing staff Specimen Acknowledgement scan-and-click workflow, except where an existing screen is reused to show auto-registration status.
- Retrieval by **order number** or **request number** on the sorter API (those remain staff Spec Ack only). Multiple specimens can share one request number; the API has no specimen picker.
- A dedicated new frontend list — not decided. See Q8. The *need* to check status is in scope; a new screen is not assumed.
- APS / BBS / MBS / VRS / STAR / DFT special panels and their input dialogues (spec type, path/tech, BBS units, DFT time-flag picker, unboxed workbench). Reject as unsupported unless Q5 overrides.
- Auto-creating unmapped doctors or locations from dictionary.
- Delete investigation, revise urgency, or other CRS functions named in SEM20260612 that are not send-out / register.
- Tube type / colour as a required sorter field (PWH request; later wave).
- A background retry job or monitoring console for failed USIDs. Sorter or staff may re-present the same USID (Q16).
- ECPath5 `/v1/ecpath5-register` contract changes.
- PWH all-discipline / 4000 specimens per hour as a v1 non-functional target (record as later wave).

## Functional requirements

| ID | Requirement | Acceptance criteria |
|---|---|---|
| R1 | Sorter middleware can call a LIS auto-registration API with a USID (and optional identity fields). | Given a reachable LIS environment and a valid service/lab context, a request that contains only a USID is accepted. A request with no USID is rejected without touching GCRS or lab-request data. |
| R2 | The API looks up the GCRS order by USID using the same format, allowed-hospital, and check-digit rules as Spec Ack specimen-number retrieve. | Valid USID with a matching `LOE_SPECIMEN_DETAIL` proceeds. Invalid format, disallowed sending hospital, bad check digit, or no record returns **Failure** and does not register or send out. Messages equivalent to 1336 / 1337 / 1338 / 1377 are available to staff on the status record (Q7). |
| R3 | In-house registration has exactly three outcomes: **Registered**, **Relabel**, **Failure**. | Registered writes the lab request and returns test code + lab discipline. Relabel does **not** write a lab request. Failure does **not** write a lab request. Relabel is never reported as Failure. |
| R4 | Relabel is returned when USID cannot be the request number. | Each of these returns Relabel, not Failure and not Registered: (a) more than one request test group in `LOE_TEST_MAP`; (b) more than one specimen mapped to the same test, including suffix A/B/C; (c) more than one DFT specimen for the same time flag; (d) force relabel from test / workstation setup. |
| R5 | Hard checks that stop Spec Ack registration also stop the API. | Date/time rules, unmapped request doctor / location / specialty / report destination / report copy, test check failed, MBS/VRS specimen setup (if that lab is ever in scope), patient demographic mismatch, and unexpected error each return **Failure** and do not register. Specimen already used, all tests registered, all tests deleted, or specimen deleted/rejected return **Failure**. |
| R6 | Soft Spec Ack alerts do not block the API. | Overnight, test validity / valid period, duplicate-reason prompt, patient tag / private patient, mixed local + send-out, and missing-collection-date *dialogue* do not return Relabel or Failure by themselves. Each skipped alert is logged (Q9). Unboxed / STAR / BBS / DFT dialogues are out of scope (unsupported Failure) unless Q5 / Q12 override. |
| R7 | Send-out tests are acknowledged on the send-out path and the API returns a send-out status. | When the specimen is a send-out (rule in Q3), LIS acknowledges via the existing send-out behaviour (`/sendOutSpecimen`: ack if Printed/Collected, tracking log, `LOE_AUDIT_TRAIL`) and returns a send-out status. The specimen is not registered in-house. How send-out is decided is Q3 — this requirement does not invent a new rule. |
| R8 | A successful Registered response includes routing data for the sorter. | Response includes at least LIS lab code / lab discipline and GCRS / test code. Registration status is returned to middleware (overrides the older SEM line “status NO need to return”; Q11). |
| R9 | Staff can find an auto-registration attempt after the sorter has processed the tube. | For each API call that reaches a terminal outcome, staff can search by USID and see status (Registered / Relabel / Failure / send-out), plus remark or reject reason. Search by datetime and status is required if a list is built; if Specimen Audit Trail is reused (Q8), existing search-by specimen number / action / action date must show the new action. Fields asked for: USID, status, HKID, encounter, patient name, GCRS code, collection datetime, registration datetime, remark/reject reason. |
| R10 | Performing hospital / receiving lab is known before send-out or register. | The API does not register or send out if performing hospital / lab context is missing. Source of that context is Q2. |
| R11 | Request number on Registered is USID when USID is eligible; Relabel cases do not consume USID as request number. | Eligible single-specimen, single-group, suffix `0`, not force-relabel → request number = USID. Relabel cases do not assign a request number and do not register. Caller-supplied request number is not in v1 unless Q13 overrides. |
| R12 | Acknowledgement and registration datetime default to server current time. | Unless an override is later agreed (Q14), ack/register datetime is server now. Existing datetime hard rules in R5 still apply against collection date, DOB, and request date. |

## Non-functional requirements

| Area | Requirement |
|---|---|
| Volume | v1 sized for UCH ~500–600 samples/hour peak and KTH/QEH ~1200 samples/hour (~20/min). PWH ~2000/hour × 2 sorters / 4000/hour is a later wave, not a v1 pass criterion. |
| Latency | Synchronous enough for the sorter to route after the response. UCH asked for about 3–4 seconds LIS time inside a ~6 second sorter cycle. Proposed default: **p95 < 4 s** per USID for retrieve + send-out or register, excluding printer and PHLC. Confirm Q17. |
| Retention | Outcome rows follow the same retention as existing `LOE_AUDIT_TRAIL` / specimen action search. No new retention policy. |
| Audit | Every terminal API outcome writes an auditable action (proposed: `LOE_AUDIT_TRAIL` Action column, same table Spec Ack already uses). Soft-skipped alerts are ALS/warn logged (Q9). No PHI in API logs beyond what Spec Ack already writes. |

## Impact

| Affected | Detail |
|---|---|
| Services | **`lis-crs-spec-ack-svc`** — new sorter-facing API; reuses `specAckAppService.register()` and `sendOutSpecimen()`. Existing UI contracts `/gcrSpecAckRegister`, `/sendOutSpecimen`, `/gcrSendOutWorkSheet`, `/v1/ecpath5-register` stay. **`lis-hub-svc`** — only if CMS/Hub must front the sorter (likely not; middleware may call the domain service). **`lab-crs-app`** — only if Q8 requires a new list or extra Audit Trail filter. |
| Screens | Specimen Acknowledgement (staff fallback, unchanged happy path). Specimen Audit Trail (if reused for R9). Possible new status list — not assumed. Registration screen Send Out Information Dialogue is **not** shown to the sorter; send-out field defaults would have to come from existing `SEND_OUT` lab options. |
| Tables | Read: `LOE_SPECIMEN_DETAIL`, GCRS order/test, `LOE_TEST_MAP`, hospital/location/doctor dictionary, `LOE_CONTROL` (`SP_ALLOW_HOSP`, send-out / PHLC options). Write: lab request / GCRS update on Registered; send-out + specimen tracking on send-out; `LOE_AUDIT_TRAIL` on terminal outcomes. |
| Interfaces / partners | Sorter **middleware** (not the instrument). Labs: KTH/QEH, UCH (v1); PWH later. Existing ECPath5 register path is a separate caller and must not break. |

**Callers the requester may have missed**

- `lab-crs-app` Spec Ack already owns relabel (`useCheckAutoAssignReqNo`), send-out hospital check (`checkSpecimensendOutHospitals`), worksheet / label / PHLC (`PrintWorksSheet.ts`). Those stay on the staff path. If the API skips print/PHLC (Q10), TLA sites that expect a printed request-no label before the analyser will still need a later print step.
- `/v1/ecpath5-register` is another machine register. Do not overload it as the sorter contract.
- Registration packing (`lis-request-app` / [[Register Request]]) is a different save path (staff Registration screen). Sorter work is Spec Ack, not that screen.
- SMART / specimen-tracking is already written on staff send-out. Auto send-out should keep that write so downstream tracking does not go silent.

## Assumptions

1. Work type is a **project** (new external interface + multi-hospital rollout), not a defect fix.
2. Middleware talks REST/API to LIS; LIS does not implement sorter vendor protocol.
3. v1 lookup key is USID only.
4. Performing hospital / lab is taken from the API session (service parameter / lab login), not from the tube.
5. Send-out vs in-house follows existing GCRS / Spec Ack send-out-hospital mapping (`sendOutHospitals`), not a sorter flag.
6. Soft alerts are skip-and-log; they do not need a Yes/No from the sorter.
7. Relabel is a first-class outcome so the sorter can use a sample-in-question / relabel bin.
8. Status check reuses Specimen Audit Trail + `LOE_AUDIT_TRAIL`; no new screen in v1.
9. Worksheet, label, and PHLC are **not** run on the auto-register path in v1.
10. Registration status **is** returned to middleware so the sorter can route Relabel / Failure without a second poll.
11. Sync API (one call per tube, one terminal outcome).
12. HKID / name / encounter / tube colour are optional; missing optional fields do not fail retrieve.

Every assumption is an open question below.

## Open questions

Answer in the **Answer** column (or “defer — owner”). Proposed defaults are what design will use if you agree.

| # | Question | Proposed default | Owner | Answer |
|---|---|---|---|---|
| Q1 | Can the sorter send HKID and/or patient name for cross-check? The sorter scans the label USID; those fields may not be on the label. | Optional. If present, mismatch → **Failure** (PWH later wants name + HKID + USID + specimen type). If absent, do not fail. QEH/UCH had no strong preference. | Requester | |
| Q2 | Does the sorter provide performing / receiving hospital? Send-out and registration need it. | No. Hospital/lab comes from the API service parameter (same as a Spec Ack session). Middleware is configured per sorter/lab. | Requester | |
| Q3 | How does the system know the specimen should be sent out? | Use existing Spec Ack rule: specimen/tests have send-out hospital(s) (`sendOutHospitals`). If yes → send-out path (R7). If no → in-house register path (R3). Do **not** add a sorter “send-out” flag. Mixed local + send-out: skip the mixed *warning* (R6) and send out only the send-out tests; in-house tests follow R3. Confirm if mixed should instead be **Failure** or **Relabel**. | Requester | |
| Q4 | Is retrieval by order no. / request no. on the sorter API required? | **No** (out of scope). USID only. Multi-specimen on one request no. has no picker. | Requester | |
| Q5 | Which labs are in v1? APS / BBS / MBS / DFT / STAR? | v1 = GCRS Chemistry & Haematology only. APS / BBS / MBS / VRS / DFT / STAR → **Failure** (unsupported), even if retrieve succeeds. PWH “all except AP” is a later wave. | Requester | |
| Q6 | Return Failure when GCRS order is not found, USID already used, or no test is registrable? | **Yes.** Not found, USID already used, all tests registered, all tests deleted, specimen deleted/rejected → **Failure**. | Requester | |
| Q7 | One Failure status for all hard fails, or typed codes? | Single status **Failure**, plus existing LIS message code and text (1336 / 1337 / 1338 / 1377 / location-doctor codes / `INVALID_PATIENT_DATA`, etc.) on the response and on the audit remark. | Requester | |
| Q8 | Can Specimen Audit Trail / `LOE_AUDIT_TRAIL` cover staff status check (R9), or is a new list required? | **Reuse** Specimen Audit Trail. API writes Action = auto-registration outcome. No new frontend list in v1. SEM asked for a new list — reject unless this answer says build it. | Requester | |
| Q9 | Log Spec Ack alert / confirmation messages on the API path? | Soft alerts: ALS/warn only, not in the API body, not a block. Hard-fail messages: on the Failure response and audit remark. | Requester | |
| Q10 | After auto-register, print worksheets / labels and create PHLC electronic order? | **No** in v1. Print and PHLC stay on staff Spec Ack. Risk: TLA sites may need a request-no label before the analyser — confirm KTH/UCH can print later or from the sorter. | Requester | |
| Q11 | Return registration status to the sorter, or only lab/GCRS codes? | **Return** Registered / Relabel / Failure / send-out status in the same response (sync). Do not require a second status-poll API in v1. | Requester | |
| Q12 | Specimen not unboxed? | **Failure** (unsupported). Do not auto-confirm the unboxed dialogue. | Requester | |
| Q13 | Who assigns request number? Caller, USID, or auto-gen? | USID when eligible (R11). Relabel cases assign nothing. No caller `assignedRequestNo` in v1. If auto-gen is the only remaining option, still **Relabel** (do not silently mint a number the tube does not carry). | Requester | |
| Q14 | Ack / register datetime = server now? Fail when datetime rules fail? | **Yes** and **Yes.** Collection date missing: proceed (soft), do not invent a collection date. Collection date < DOB, ack < collection, ack < request date, ack in the future → **Failure**. | Requester | |
| Q15 | Partial registration (some tests/specimens already registered; remaining could register)? | **Relabel** / do not auto-register the remainder. Staff finish on Spec Ack. | Requester | |
| Q16 | Fail-case retry and monitoring? | No new retry job. Middleware may POST the same USID again. Already Registered → **Failure** (already used). Staff handle persistent fails from the audit/status view. | Requester | |
| Q17 | Latency / volume pass mark for v1? | p95 < 4 s; design for 20 specimens/min per lab. Async register-behind-the-sorter is **out** unless this answer says async. | Requester | |
| Q18 | Encounter and tube type/colour? | Optional, ignored in v1 except stored on the audit remark if supplied. Not used for routing. | Requester | |

Design-level follow-ups (dictionary auto-create doctor, `duplicateReason` override, AAR off, urgent workstation off, `LisErrorConstants` vs new codes) stay on [[LIS/Project Plans/Specimen Sorter/Requirement Confirmation]] and are picked up in `/system-design` after this gate.

## Confirmation

> Quote or link the requester's written confirmation here. The gate does not close without it.

- Confirmed by:
- Date:
- Statement:
