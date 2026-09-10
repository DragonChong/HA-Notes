---
agent_assisted: true
generated_by: design-review-pptx
generated_on: '2026-09-10'
profile: incremental
reviewed_by: ''
tags:
  - sdlc
  - slide-brief
title: 03 Slide Brief — Specimen Sorter API
---
# 03 Slide Brief — Specimen Sorter API

Facts come from [[02 System Design]]. Presentational only. Table name on slides is `loe_sorter_map` (D7), not a new name.

**Profile:** incremental
**JIRA key:** TMP-000 (dossier `TMP-specimen-sorter-api`; production JIRA not assigned; reference SEM20260612)
**Service:** lis-crs-spec-ack-svc
**Review forum:** CP3
**Review date:** 10 Sep 2026
**Prior review:** none
**Presenters:** Ka
**Reviewers:** Tony Chong, CP3 panel

---

### Cover
**Archetype:** title-hero
**Headline:** One POST on Specimen Acknowledgement registers or sends out a USID
**Lede:** Today staff scan a label and click Send-out or Register. The sorter will scan the tube and call LIS for those same actions.
**Notes:** Cover is identity only. TMP-000 is the dossier stand-in. Tony Chong reviewed [[02 System Design]].

### Slide: Background
**Eyebrow:** Background
**Title:** Staff click today. The sorter will call LIS
**Archetype:** evolution
**Body:**
1. Staff scan the specimen label on Specimen Acknowledgement and press Send-out or Register.
2. Labs will load tubes onto a sorter for scan, sort, and transport.
3. Middleware calls one LIS API so the sorter can bin from send-out or registration status.
**Notes:** The staff screen stays as fallback. The gap is that validation and packing still sit on the screen.

### Slide: Existing Design - Spec Ack screen
**Eyebrow:** Existing Design
**Title:** The Spec Ack screen still owns validation and packing
**Archetype:** matrix
**Body:**
| Action | On the screen | Backend |
| Retrieve GCRS | Looks up the order | Calls backend |
| Send-out | Presses Send-out | Calls backend |
| Registration | Validates and converts | Writes |
| Worksheet | Groups tests, request no., ward and doctor | Prints |
| PHLC order | None | Calls backend |
**Notes:** Amber rows are the gap. Retrieve, send-out, and PHLC already hit the service. Register and worksheet cannot leave the screen until packing moves.

### Slide: Proposed Change - New API
**Eyebrow:** Proposed Change
**Title:** One new POST on the Spec Ack service
**Archetype:** code-findings
**Body:** Path `POST /api/specack/sorter/auto-register`. Body: `usid`, `sorterId`, optional `hospital`, `hkid`, `patientName`. Response status `REGISTERED` / `SEND_OUT` / `RELABEL` / `FAILURE` on the same call.
**Notes:** Do not reuse the staff register endpoint. No auth header in v1. Soft alerts stay off the body.

### Slide: Proposed Change - what moves
**Eyebrow:** Proposed Change
**Title:** Screen logic moves behind that POST
**Archetype:** compare
**Body:**
Today: validation, test grouping, request-no assignment, and ward/doctor mapping run on the screen before register or print.
Proposed: the new API does that work, then calls the same backend register, print, and PHLC paths. Print and PHLC only after Registered.
**Notes:** Send-out, Relabel, and Failure print nothing. Late worksheet does not change a status already returned.

### Slide: Proposed Change - map and audit
**Eyebrow:** Proposed Change
**Title:** A map table supplies user and workbench. Audit stays on LOE_AUDIT_TRAIL
**Archetype:** cards
**Body:**
1. New table `loe_sorter_map`: sorter id to dedicated LIS user and workbench.
2. If hospital is omitted, take it from the map. Workstation, printer, and STAR location come from `workbench`.
3. Write `SORT_REG` / `SORT_SO` / `SORT_RELABEL` / `SORT_FAIL`, plus existing `REG` / `SEND_OUT`. Add `SORT_*` to the Audit Trail filter.
**Notes:** Unknown sorter id is Failure. Do not copy printer onto the map. Do not compare workbench lab to the test lab.

### Slide: Promotion
**Eyebrow:** Promotion
**Title:** Seed user, workbench, and map, then deploy
**Archetype:** cards
**Body:** Create sorter user. Seed workbench. Insert map row. Deploy lis-crs-spec-ack-svc. NetworkPolicy only.
**Notes:** Pilot CPS and HMS. Relabel and Failure bins go back to staff Spec Ack.

### Slide: Fallback
**Eyebrow:** Fallback
**Title:** Stop middleware. Staff Spec Ack is unchanged
**Archetype:** cards
**Body:** Stop middleware. Drop `loe_sorter_map` on full rollback. No history rewrite.
**Notes:** Staff clicks still retrieve, send-out, and register.

### Slide: Open Questions
**Eyebrow:** Open Questions
**Title:** Four decisions to ratify before build
**Archetype:** asks
1. Leave v1 with NetworkPolicy only, no API key or Hub JWT? (D1)
2. Fail the tube when the USID has both local and send-out tests? (D3)
3. Print worksheets and PHLC only after Registered, after HTTP return? (D11, D4, D5)
4. Show SORT_* actions on the Audit Trail filter? (D6)
**Notes:** Requester already answered D1-D11. This room ratifies.

### Slide: Q&A
**Archetype:** statement
**Headline:** Q&A
**Notes:** Likely questions: why a new POST; why hospital can be omitted; why DFT uses the same register path.

### Close
**Archetype:** closing
**Headline:** Target latency
**Stat:** P95 < 4 S
**Next steps:** Assign a production JIRA. Implement the POST. Seed map and workbench in SIT.
**Notes:** About 20 specimens a minute per lab. Print sits after the sorter wait path.
