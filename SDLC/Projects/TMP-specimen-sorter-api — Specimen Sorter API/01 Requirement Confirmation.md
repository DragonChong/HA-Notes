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
- Current behaviour: [[Retrieve Order Information by Specimen Number]], [[Register Request]], [[Send Out Information Dialogue]], Spec Ack STAR unbox (`useUnboxChecking`, message `4422`), register/send-out APIs in `lis-crs-spec-ack-svc`
- Requester answers: 2026-09-07 (this note, Confirmation)

## Background and trigger

Labs (KTH/QEH, UCH first; PWH later) will load tubes onto a specimen sorter. Today a staff member scans the specimen label on **Specimen Acknowledgement** and clicks Send-out or Registration. The sorter should scan the USID, call LIS, then sort/move the tube.

**Current behaviour (as-is)**

1. Staff enter or scan Specimen No. / Lab# / Order# on Specimen Acknowledgement (`lab-crs-app`).
2. LIS validates GCRS Specimen Number format, allowed sending hospital (`SP_ALLOW_HOSP`), and check digit, then loads the GCRS order from `LOE_SPECIMEN_DETAIL` ([[Retrieve Order Information by Specimen Number]]). Invalid format / hospital / check digit / not found stops retrieval (messages 1336, 1337, 1338, 1377).
3. Soft alerts can fire after retrieve: missing collection date, overnight specimen, test validity / valid period, duplicate reason / A-A-R, private patient / patient tag, mixed local + send-out, unboxed specimen, BBS blood requirement / category / T&S remark.
4. Hard checks can stop registration: datetime rules, unmapped doctor / location / specialty / report destination, test check, MBS/VRS specimen setup, patient demographic mismatch, unexpected error.
5. APS / BBS registration still needs staff-entered fields (spec type, path/tech, auth, macro; BBS request comment, date required, type, unit).
6. Send-out is a staff click. A GCRS test is treated as send-out when its test / cluster code is listed in `LOE_SENDOUT_TEST.LOESEND_CLUSTER_CODE` (scoped by `LOESEND_LABNO` and `LOESEND_HOSP`). Backend `/sendOutSpecimen` acknowledges a Printed/Collected specimen, writes SMART/specimen-tracking, and writes `LOE_AUDIT_TRAIL`.
7. Register is a staff click via `/gcrSpecAckRegister`. `/v1/ecpath5-register` is ECPath5 — not a sorter contract.
8. Relabel is decided in the UI (`useCheckAutoAssignReqNo`): more than one request test group; more than one specimen / suffix A/B/C; several DFT specimens for one time flag; force relabel.
9. STAR unbox: Spec Ack checks `starSpecimenInfo` before ack/register/send-out (`useUnboxChecking`). Missing workbench location shows message `4422` and blocks. Register already posts `GCR_STAR_UNBOX_ACTION_REQUEST_REGISTERED`.
10. After register, Spec Ack can print worksheets / labels and create a PHLC electronic order. **No sorter / USID auto-registration API exists.**

**Trigger**

Replace the manual scan + button clicks with a middleware-called LIS API so the sorter can route the tube from the API result.

## In scope

- A LIS API that sorter **middleware** calls. Middleware-to-LIS is API. LIS does not speak HL7 / FHIR / ASTM to the sorter.
- Look up the GCRS order by **USID / GCRS Specimen Number**.
- v1 labs: **CPS** and **HMS**. **DFT** and **STAR** cases on those labs are in.
- In-house: current Spec Ack hard checks; outcomes **Registered**, **Relabel**, or **Failure**.
- Send-out: GCRS cluster code in `LOE_SENDOUT_TEST`; existing `/sendOutSpecimen` path; return send-out status.
- Performing hospital is **sent by the sorter**. If omitted, map by specimen-sorter identifier from a maintained table.
- Routing payload + status on the same response.
- Soft alerts do not block; log **ALS only**.
- STAR unbox uses the existing STAR Spec Ack unbox rules (not an unsupported-lab reject). Message `4422` (no workbench location) remains a hard Failure.
- DFT multi-specimen / same time-flag follows Relabel (R4). Partial DFT remainder is Relabel (Q15).
- After success: **worksheets** and **PHLC** when Spec Ack would; **no labels**.
- Persist outcome on Specimen Audit Trail / `LOE_AUDIT_TRAIL`.

## Out of scope

> Explicitly excluded.

- Sorter hardware, vendor firmware, drawer/channel design, pneumatic tube, and TLA connectivity.
- LIS protocol talking HL7 / FHIR / ASTM to the sorter.
- Changing the staff Specimen Acknowledgement click path, except reuse of Specimen Audit Trail.
- Retrieval by **order number** or **request number** on the sorter API.
- A dedicated new frontend list.
- **APS / BBS / MBS** (and VRS) special panels and their input dialogues.
- **Label printing** on the auto-register path.
- Auto-creating unmapped doctors or locations.
- Delete investigation, revise urgency, or other SEM functions that are not send-out / register.
- Tube type / colour as a required field (optional, ignored for routing).
- A retry job or monitoring console. Middleware may re-POST the same USID.
- Caller-supplied request number. Relabel does not auto-generate a number the tube does not carry.
- Soft-alert text in the API response body (ALS only).
- ECPath5 `/v1/ecpath5-register` contract changes.
- PWH all-discipline / 4000 specimens per hour as a v1 pass mark.
- Async register-behind-the-sorter.

## Functional requirements

| ID | Status | Requirement | Acceptance criteria |
|---|---|---|---|
| R1 | confirmed | Sorter middleware can call a LIS auto-registration API with a USID (and optional identity fields). | A request that contains only a USID is accepted when lab/hospital context is present. No USID → rejected, no GCRS or lab-request writes. |
| R2 | confirmed | Lookup GCRS order by USID with the same format, allowed-hospital, and check-digit rules as Spec Ack. | Valid matching `LOE_SPECIMEN_DETAIL` proceeds. Invalid format / hospital / check digit / not found → **Failure** (1336 / 1337 / 1338 / 1377 on response and audit remark). |
| R3 | confirmed | In-house outcomes are **Registered**, **Relabel**, **Failure** only. | Registered writes the lab request and returns test code + lab discipline. Relabel and Failure do not write a lab request. Relabel is never reported as Failure. |
| R4 | confirmed | Relabel when USID cannot be the request number. | Relabel (not Failure, not Registered) for: (a) more than one request test group; (b) more than one specimen mapped to the same test, including suffix A/B/C; (c) more than one **DFT** specimen for the same time flag; (d) force relabel. |
| R5 | confirmed | Spec Ack hard checks stop the API. | Datetime rules, unmapped doctor / location / specialty / report destination / report copy, test check failed, patient mismatch, unexpected error → **Failure**. Already used / all tests registered / all deleted / specimen deleted or rejected → **Failure**. APS / BBS / MBS → **Failure** (unsupported). STAR missing workbench location (message `4422`) → **Failure**. |
| R6 | confirmed | Soft Spec Ack alerts do not block; **ALS only**. | Overnight, test validity / valid period, duplicate-reason prompt, patient tag / private patient, mixed local + send-out, missing collection-date dialogue, and STAR unbox *alert* (when `4422` does not fire) do not return Relabel or Failure. Each is ALS/warn logged. Not written on the API body. Hard-fail messages stay on the Failure response and audit remark. |
| R7 | confirmed | Send-out when the GCRS cluster code is in `LOE_SENDOUT_TEST`. | Match `loereqtst_test_code` to `LOESEND_CLUSTER_CODE` for `LOESEND_LABNO` + `LOESEND_HOSP`. Those tests use `/sendOutSpecimen` and return send-out status. Others take R3. No sorter send-out flag. |
| R8 | confirmed | Response includes routing data and status. | Lab code / discipline, GCRS / test code, and status Registered / Relabel / Failure / send-out on the same call. No status-poll API in v1. |
| R9 | confirmed | Staff find the attempt on Specimen Audit Trail. | `LOE_AUDIT_TRAIL` Action = outcome. Search by specimen number / action / action date. No new list. |
| R10 | confirmed | Performing hospital is sent by the sorter. | Use hospital/lab from the request. If omitted, map specimen-sorter identifier → hospital/lab from a maintained table. If neither is available → **Failure**. |
| R11 | confirmed | Request number = USID when eligible. | Single-specimen, single-group, suffix `0`, not force-relabel → request number = USID. Relabel assigns nothing. No caller `assignedRequestNo`. Auto-gen-only → still Relabel. |
| R12 | confirmed | Ack/register datetime = server now. | Missing collection date: proceed (soft), do not invent a date. Collection < DOB, ack < collection, ack < request date, ack in the future → **Failure**. |
| R13 | confirmed | Worksheets and PHLC after success; no labels. | GCRS worksheet, send-out form, SH form when Spec Ack would. PHLC when the lab option is on and destination matches. No request-no / aliquot / second-tube labels. |
| R14 | confirmed | DFT and STAR on CPS/HMS are in. Unbox follows STAR. | DFT orders retrieved by USID are processed. DFT same-time-flag multi-specimen → Relabel (R4c). Partial remainder → Relabel (Q15). STAR specimens are not rejected as unsupported. STAR unbox uses the existing Spec Ack STAR unbox path (including `GCR_STAR_UNBOX_ACTION_REQUEST_REGISTERED` on register). Unbox alert → ALS only (R6). No workbench location → Failure `4422` (R5). |

## Non-functional requirements

| Area | Requirement |
|---|---|
| Volume | v1 pass mark **~20 specimens/min** per lab (KTH/QEH ~1200/hour, UCH ~500–600/hour peak). PWH 4000/hour is a later wave, not a v1 criterion. |
| Latency | **Sync**, one call per tube. **p95 < 4 s** for the sorter-facing response (retrieve + send-out or register). Worksheet and PHLC must not push that response over 4 s — produce them after the status is ready to return, or off the sorter wait path. |
| Retention | Same as existing `LOE_AUDIT_TRAIL` / specimen action search. |
| Audit | Terminal outcome → `LOE_AUDIT_TRAIL`. Soft alerts → **ALS only**. No extra PHI in API logs. |

## Impact

| Affected | Detail |
|---|---|
| Services | **`lis-crs-spec-ack-svc`** — new sorter API; reuses register, send-out, worksheet, PHLC, STAR unbox actions. **`lab-crs-app`** — Audit Trail only. **`lis-hub-svc`** — only if Hub fronts the sorter. |
| Screens | Specimen Acknowledgement (staff fallback). Specimen Audit Trail (R9). No new list. |
| Tables | Read: `LOE_SPECIMEN_DETAIL`, GCRS order/test, `LOE_TEST_MAP`, `LOE_SENDOUT_TEST`, DFT rows, STAR specimen info, dictionary, `LOE_CONTROL`. Write: lab request; send-out + tracking; `LOE_AUDIT_TRAIL`; PHLC; STAR unbox action. Fallback: sorter-identifier → hospital/lab mapping table. |
| Interfaces / partners | Sorter middleware (sends USID + performing hospital). Labs: KTH/QEH, UCH CPS & HMS including DFT/STAR. ECPath5 path must not break. |

**Callers the requester may have missed**

- Worksheet + PHLC on a 4 s sync budget: print/PHLC services must not block the sorter response.
- STAR unbox needs a workbench/location (message `4422`). A sorter session still needs a resolvable location — hospital from the sorter plus workbench/default location in design.
- `/v1/ecpath5-register` is a different machine caller.
- Registration packing (`lis-request-app`) is a different save path.

## Assumptions

Working defaults the design will use. All Qs now have a written answer.

1. Work type is a **project**.
2. Middleware talks REST/API to LIS.
3. v1 lookup key is USID only.
4. Sorter **sends performing hospital**. Mapping table is fallback only if hospital is omitted.
5. Send-out = `LOE_SENDOUT_TEST.LOESEND_CLUSTER_CODE`.
6. Soft alerts skip and **ALS only**.
7. Relabel is a first-class outcome.
8. Status check reuses Specimen Audit Trail + `LOE_AUDIT_TRAIL`.
9. Worksheets yes, labels no, PHLC yes.
10. Status returned on the same call.
11. Sync; p95 < 4 s; ~20/min.
12. HKID / name optional; mismatch fails. Encounter / tube colour ignored for routing.
13. v1 labs CPS and HMS. DFT and STAR in. APS / BBS / MBS out.
14. Unbox is the STAR unbox path, not an unsupported reject.

## Open questions

| # | Question | Proposed default | Owner | Answer |
|---|---|---|---|---|
| Q1 | Sorter send HKID / patient name? | Optional. Mismatch → Failure. Absent → do not fail. | Requester | **Agree.** |
| Q2 | Sorter provide performing hospital? | Sorter sends hospital. If omitted, map by sorter identifier. | Requester | **Sorter send hospital.** (Fallback mapping from 2026-09-07 still stands.) |
| Q3 | How is send-out known? | `LOE_SENDOUT_TEST.LOESEND_CLUSTER_CODE`. | Requester | **Cluster code in `LOE_SENDOUT_TEST`.** |
| Q4 | Retrieve by order / request no.? | No. USID only. | Requester | **Agree.** |
| Q5 | Which labs / case types in v1? | CPS and HMS. DFT and STAR in. APS / BBS / MBS out. | Requester | **APS/BBS/MBS: No. CPS and HMS. DFT / STAR: in.** |
| Q6 | Failure when not found / already used / nothing registrable? | Yes. | Requester | **Agree.** |
| Q7 | One Failure + message code? | Yes. | Requester | **Agree.** |
| Q8 | New list vs Audit Trail? | Reuse Audit Trail. | Requester | **Agree.** |
| Q9 | Log soft alerts how? | ALS only. | Requester | **ALS only.** |
| Q10 | Worksheet / label / PHLC? | Worksheet yes. Label no. PHLC yes. | Requester | **Worksheet: Yes. Label: No. PHLC: Yes.** |
| Q11 | Return status to sorter? | Yes, same response. | Requester | **Agree.** |
| Q12 | Specimen not unboxed? | STAR unbox path (STAR is in). `4422` remains Failure. Unbox alert → ALS only. | Requester | **Unbox (as STAR in).** |
| Q13 | Who assigns request number? | USID when eligible; else Relabel. | Requester | **Agree.** |
| Q14 | Datetime = now? Fail hard rules? | Yes / Yes. | Requester | **Yes.** |
| Q15 | Partial registration? | Relabel. | Requester | **Agree.** |
| Q16 | Retry / monitoring? | Re-POST only. | Requester | **Agree.** |
| Q17 | Latency / volume? | p95 < 4 s; ~20/min; sync. | Requester | **p95 < 4 s; ~20/min; sync.** |
| Q18 | Encounter / tube colour? | Optional, ignored for routing. | Requester | **Agree.** |

No unanswered questions remain. Design-level follow-ups stay on [[LIS/Project Plans/Specimen Sorter/Requirement Confirmation]] for `/system-design`.

## Confirmation

- Confirmed by: Requester (chat)
- Date: 2026-09-07
- Verdict for orchestrator: **`pass`** (do not close the gate in this skill)
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

Follow-up (same day), quoted:

> Assumptions:  
> Q2: sorter send hospital  
> Q5: DFT / STAR in  
> Q9: ALS only  
> Q12 unbox (as STAR in)  
> Q17: p95 < 4 s; ~20/min; sync
