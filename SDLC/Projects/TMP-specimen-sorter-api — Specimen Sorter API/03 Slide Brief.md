---
agent_assisted: true
generated_by: design-review-pptx
generated_on: '2026-09-09'
profile: incremental
reviewed_by: ''
tags:
  - sdlc
  - slide-brief
title: 03 Slide Brief — Specimen Sorter API
---
# 03 Slide Brief — Specimen Sorter API

Facts come from [[02 System Design]]. This note is presentational only. Do not invent a class, table, API, or ConfigMap key that is not in `02`.

**Profile:** incremental
**JIRA key:** TMP-000 (dossier `TMP-specimen-sorter-api`; production JIRA not assigned; reference SEM20260612)
**Service:** lis-crs-spec-ack-svc
**Review forum:** CP3
**Review date:** 09 Sep 2026
**Prior review:** none
**Presenters:** Ka
**Reviewers:** Tony Chong, CP3 panel

Voice: scheduler CP3 sample. Slide copy uses plain English for screen behaviour. Keep service, table, endpoint, and outcome names that the room must ratify.

---

### Cover
**Archetype:** title-hero
**Headline:** One POST on Specimen Acknowledgement registers or sends out a USID
**Lede:** Sorter middleware calls the Specimen Acknowledgement service. Soft alerts, hard checks, and packing move behind that call. Staff Spec Ack stays as the fallback.
**Notes:** Cover is identity only. Production JIRA is not assigned; TMP-000 is the dossier stand-in. Reference SEM20260612. Tony Chong reviewed [[02 System Design]].

### Slide: Background
**Eyebrow:** Background
**Title:** The sorter needs the staff click path in one call
**Archetype:** evolution
**Body:**
1. Staff scan a USID, then click Send-out or Register.
2. Lookup and writes already live in the Spec Ack service. The screen still builds the register payload.
3. The sorter bins the tube from one LIS response in under four seconds.
**Callout:** Do not reuse the staff retrieve. That call is tied to a fixed user.
**Notes:** Writes are not the gap. Middleware cannot call the staff register API without the payload the screen builds today.

### Slide: Existing Design - packing still lives on the screen
**Eyebrow:** Existing Design
**Title:** Packing still lives on the screen
**Archetype:** compare
**Body:**
Today: the screen owns soft alerts, hard checks, and register packing. Staff click send-out or register after that payload is built. Workbench comes from the PC login. Staff retrieve is tied to a fixed user.
Proposed: one new POST. Alerts, hard checks, and packing run on the server. Reuse existing retrieve, send-out, register, worksheet, and PHLC. Staff screen stays as it is.
**Notes:** Reusing the staff register API would keep the screen packing contract. Reusing ECPath5 register would keep a hard-coded user.

### Slide: Proposed Change - Overview
**Eyebrow:** Proposed Change
**Title:** A new POST looks up, packs, then writes
**Archetype:** decision-flow
**Body:** POST auto-register with USID and sorter id. Mixed local and send-out is Failure. Relabel writes nothing. Print only after Registered. DFT uses ordinary Spec Ack register, not a separate DFT API.
**Notes:** STAR with no workbench location is Failure. Do not compare workbench lab to the retrieved test lab.

### Slide: Proposed Change - packing
**Eyebrow:** Proposed Change
**Title:** What the screen packs today moves behind the API
**Archetype:** steps-sidebar
**Body:**
1. Group tests and assign the request number. The USID is used when it is eligible.
2. Map ward and doctor on the server.
3. Screen ticks become defaults: ack time is now, AAR off, urgent workstation off, labels off, no relabel tick.
**Sidebar:** Pack first. If we only move the hard checks, the write has no test groups. Soft alerts go to ALS only.
**Notes:** Moving only the hard checks still leaves an empty test-group list.

### Slide: Proposed Change - outcomes
**Eyebrow:** Proposed Change
**Title:** Print only after Registered
**Archetype:** matrix
**Body:** REGISTERED creates the lab request, then prints every worksheet and PHLC after the HTTP return. SEND_OUT writes send-out and prints nothing. RELABEL and FAILURE write no lab request. Late print does not change a status already returned.
**Notes:** Send-out never prints. The ack auto-print flag is not used. Print all on the registration path.

### Slide: Promotion
**Eyebrow:** Promotion
**Title:** Seed user, workbench, and map, then deploy
**Archetype:** cards
**Body:**
1. Create a dedicated sorter LIS user on the audit trail. Not a shared staff login.
2. Seed a workbench row per physical sorter: hosp, lab, station name, location, printer.
3. Insert the sorter map row: sorter id, user, workbench id, lab, hosp, server name.
4. Deploy lis-crs-spec-ack-svc. NetworkPolicy only. Add SORT_* to the Audit Trail filter.
**Notes:** Printer and STAR location come from workbench, not copied onto the map. Still write REG and SEND_OUT. Pilot CPS and HMS.

### Slide: Fallback
**Eyebrow:** Fallback
**Title:** Stop middleware. Staff Spec Ack is unchanged
**Archetype:** cards
**Body:**
1. Stop middleware. Staff clicks still retrieve, send-out, and register.
2. Drop the map table on full rollback. Leave or disable the workbench and user.
3. No conversion of historical requests.
**Notes:** The staff path is the fallback. Drop only the map table.

### Slide: Open Questions
**Eyebrow:** Open Questions
**Title:** Four decisions to ratify before build
**Archetype:** asks
1. Leave v1 with NetworkPolicy only, no API key or Hub JWT? (D1)
2. Fail the tube when the USID has both local and send-out tests? (D3)
3. Print worksheets and PHLC only after Registered, after HTTP return? (D11, D4, D5)
4. Show SORT_* actions on the Audit Trail filter? (D6)
**Notes:** Requester already answered D1-D11 on [[02 System Design]]. This room is the ratification, not a new design pass.

### Slide: Q&A
**Archetype:** statement
**Headline:** Q&A
**Notes:** Likely questions: why not reuse the staff register API; why DFT does not use a separate DFT API; why workbench lab is not checked against the test lab.

### Close
**Archetype:** closing
**Headline:** Target latency
**Stat:** P95 < 4 S
**Next steps:** Assign a production JIRA. Implement the POST, including the packing the screen does today. Seed map and workbench in SIT.
**Notes:** Volume pass mark is about 20 specimens a minute per lab. Worksheet and PHLC sit after the sorter wait path.
