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

Voice: scheduler CP3 sample. Identifiers left as in `02`.

---

### Cover
**Archetype:** title-hero
**Headline:** One POST on Specimen Acknowledgement registers or sends out a USID
**Lede:** Sorter middleware calls `lis-crs-spec-ack-svc`. Flex packing, alerts, and hard checks move behind that call. Staff Spec Ack stays as the fallback.
**Notes:** Cover is identity only. Production JIRA is not assigned; TMP-000 is the dossier stand-in so the cover carries a ticket shape. Reference SEM20260612. Tony Chong reviewed [[02 System Design]].

### Slide: Background
**Eyebrow:** Background
**Title:** The sorter needs the staff click path in one call
**Archetype:** evolution
**Body:**
1. Staff scan a USID on Specimen Acknowledgement and click Send-out or Register.
2. Order lookup and writes already live in `lis-crs-spec-ack-svc`. Packing still sits in Flex `GcrSpecAckDataConvertor`.
3. The sorter must bin the tube from one LIS response in under four seconds.
**Callout:** GET `/retrieveGcrOrder` hard-codes user `ltc611`. The sorter must not use that GET.
**Notes:** Writes are not the gap. Middleware cannot call `/gcrSpecAckRegister` without the packing object the screen builds today.

### Slide: Existing Design - packing still lives on the screen
**Eyebrow:** Existing Design
**Title:** Packing still lives on the screen
**Archetype:** compare
**Body:**
Today: Flex owns `promptAlert`, `GcrSpecAckDataValidator`, and `GcrSpecAckDataConvertor`. Staff click send-out or register with that packing.
Proposed: New POST. Same retrieve, send-out, register, worksheet, and PHLC app services. Convertor, validator, and ALS alerts run on the server.
**Notes:** Overloading `/gcrSpecAckRegister` would keep the staff packing contract. Overloading ECPath5 register would keep a hard-coded user. The convertor has to move or the caller invents a second packing shape.

### Slide: Proposed Change - Overview
**Eyebrow:** Proposed Change
**Title:** A new POST orchestrates retrieve, convert, then write
**Archetype:** decision-flow
**Body:** POST `/api/specack/sorter/auto-register`. Sorter id from `loe_sorter_map` plus `workbench`. Mixed local and send-out is Failure. Relabel writes nothing. Print only after Registered.
**Notes:** STAR with no `wkbh_location` is Failure `4422`. DFT uses the same Spec Ack `register()` packing, not `/api/dftreg`. Do not compare workbench lab to the retrieved test lab.

### Slide: Proposed Change - packing convertor
**Eyebrow:** Proposed Change
**Title:** The Flex convertor moves behind the API
**Archetype:** code-findings
**Body:** Port grouping from GCRS tests, request-no assignment, ward and doctor mapping, and worksheet / send-out Ro builders. Screen checkboxes become defaults: ack time is server now, AAR off, urgent workstation off, labels off, no relabel checkbox.
**Notes:** `register()` already assumes this packing. Skipping the convertor and porting only the validator still leaves an empty test-group list.

### Slide: Proposed Change - outcomes
**Eyebrow:** Proposed Change
**Title:** Print only after Registered
**Archetype:** matrix
**Body:** REGISTERED writes packing then prints every worksheet and PHLC after the HTTP return. SEND_OUT uses `sendOutSpecimen` and prints nothing. RELABEL and FAILURE write no lab request. Late print does not change a status already returned.
**Notes:** Spec Ack `sendOutActions` never prints. The ack auto-print flag is not used. Staff picker goes away: print all on the registration path.

### Slide: Promotion
**Eyebrow:** Promotion
**Title:** Seed user, workbench, and map, then deploy
**Archetype:** cards
**Body:**
1. Create a dedicated sorter LIS user for `LOE_AUDIT_TRAIL.loeaud_usercode`.
2. Seed a `workbench` row per physical sorter: hosp, lab, station name, location, printer.
3. Insert `loe_sorter_map`: sorter id, user, workbench id, lab, hosp, server name.
4. Deploy `lis-crs-spec-ack-svc`. Open NetworkPolicy for middleware. No API key in v1. Add `SORT_*` to the Audit Trail action filter.
**Notes:** Printer and STAR location come from `workbench`, not copied onto the map. Audit workstation is `wkbh_station_name`. Pilot CPS and HMS; Relabel and Failure bins go back to staff Spec Ack.

### Slide: Fallback
**Eyebrow:** Fallback
**Title:** Stop middleware. Staff Spec Ack is unchanged
**Archetype:** cards
**Body:**
1. Stop middleware. Staff clicks still retrieve, send-out, and register.
2. `DROP TABLE loe_sorter_map` on full rollback. Leave or disable the workbench and user.
3. No conversion of historical requests.
**Notes:** The staff APIs are untouched. Fallback is operational, not a data rewrite.

### Slide: Open Questions
**Eyebrow:** Open Questions
**Title:** Four decisions to ratify before build
**Archetype:** asks
1. Leave v1 with NetworkPolicy only, no API key or Hub JWT? (D1)
2. Fail the tube when the USID has both local and send-out tests? (D3)
3. Print worksheets and PHLC only after Registered, after the HTTP return? (D11, D4, D5)
4. Show `SORT_REG`, `SORT_SO`, `SORT_RELABEL`, `SORT_FAIL` on the Audit Trail filter, still writing `REG` / `SEND_OUT`? (D6)
**Notes:** Requester already answered D1-D11 on [[02 System Design]]. This room is the ratification, not a new design pass.

### Slide: Q&A
**Archetype:** statement
**Headline:** Q&A
**Notes:** Likely questions: why not overload `/gcrSpecAckRegister`; why DFT skips `/api/dftreg`; why workbench lab is not checked against the test lab.

### Close
**Archetype:** closing
**Headline:** Target latency
**Stat:** P95 < 4 S
**Next steps:** Assign a production JIRA. Implement the POST on `lis-crs-spec-ack-svc`. Seed map and workbench in SIT.
**Notes:** Volume pass mark is about 20 specimens a minute per lab. Worksheet and PHLC sit after the sorter wait path.
