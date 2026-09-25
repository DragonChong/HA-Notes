---
agent_assisted: true
generated_by: design-review-pptx
generated_on: '2026-09-25'
profile: incremental
reviewed_by: ''
tags:
  - sdlc
  - slide-brief
title: 03 Slide Brief — Oracle route lookup
---
# 03 Slide Brief — Oracle route lookup

Facts come from [[02 System Design]], plus the requester's room wording for the LIS-10723 trigger. Presentational only.

**Profile:** incremental
**JIRA key:** TMP-oracle-route-lookup (related upgrade LIS-10723)
**Service:** lis-patient-pmi-sync-svc, library data-source
**Review forum:** CP3
**Review date:** 25 Sep 2026
**Prior review:** none

---

### Cover
**Archetype:** title-hero
**Headline:** Chinese characters reach Sybase when the Oracle flag is not read
**Notes:** Patient sync is supposed to strip Chinese characters when the hospital is on Sybase. After the LIS-10723 data-source upgrade, the flag check does not reach Oracle, so the strip never runs.

### Slide: Agenda
**Archetype:** agenda
**Items:** Background, Existing Design, Proposed Change, Promotion and fallback, Open Questions
**Notes:** Five stops. Promotion and fallback sit on one slide: ship the library, or put the previous one back.

### Slide: Background
**Eyebrow:** Background
**Title:** The strip is skipped, so Chinese characters land in Sybase
**Archetype:** evolution
**Body:** Patient sync strips Chinese characters for a Sybase hospital. LIS-10723 upgraded data-source for transaction locking. The Oracle flag check then fails, and the strip does not run.
**Notes:** The flag is the only thing that turns the strip on. When the check fails, the program skips the replace and Sybase gets the Chinese characters.

### Slide: Existing Design
**Eyebrow:** Existing Design
**Title:** The flag check does not reach Oracle
**Archetype:** compare
**Body:** Today the read follows the hospital route and is refused, so the strip is skipped. After the change, the flag is read on Oracle. If the hospital is Sybase, the Chinese characters are replaced.
**Notes:** We do not move the hospital transaction onto Oracle. That would commit hospital work already done. Only the flag read uses the Oracle connection.

### Slide: Proposed Change
**Eyebrow:** Proposed Change
**Title:** Read the Oracle flag, then strip when the hospital is Sybase
**Archetype:** cards
**Body:** Connect to Oracle and read the flag. If it says Sybase, replace the Chinese characters. Patient sync source stays as it is.
**Notes:** The replace logic is already in lis-patient-pmi-sync-svc. The library fix is what lets that check succeed.

### Slide: Promotion and fallback
**Eyebrow:** Promotion and fallback
**Title:** Ship the new library, or put the previous one back
**Archetype:** compare
**Body:** Left, promotion: new data-source build, JDBC unchanged in DEVQA, SIT, and PROD, patient sync rebuilds only. Right, fallback: previous build and restart, on Sybase the log says `defaulting to PostgreSQL`, then clear one cached type check.
**Notes:** DEVQA, SIT, and PROD keep the same JDBC settings. What changes is the library binary. You know the rollback worked when the old warning is back. A wrong saved answer is cleared with `DELETE /api/clearCachedDBConn/{hospital}/{lab}`.

### Slide: Open Questions
**Eyebrow:** Open Questions
**Title:** Two questions before we build
**Archetype:** asks
1. Is LOE / lab 1 / LOE_DB the only Oracle database?
2. If a distributed transaction is already open, may this Oracle read join it?
**Notes:** The first question is whether a second Oracle database is registered. The second is enlistment only. We are not redesigning transaction locking.

### Slide: Q&A
**Archetype:** statement
**Headline:** Q&A
**Notes:** Likely question: does patient sync source change? No. The strip is already there. It runs again once the Oracle flag can be read.

### Close
**Archetype:** closing
**Notes:** After the room, write any CP3 actions back onto the design note. This deck does not close the review gate.
