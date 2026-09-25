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

Facts come from [[02 System Design]]. Presentational only.

**Profile:** incremental
**JIRA key:** TMP-oracle-route-lookup
**Service:** data-source
**Review forum:** CP3
**Review date:** 25 Sep 2026
**Prior review:** none
**Reviewed by (design):** Tony Chong

High-level room copy. No class walk-through.

---

### Cover
**Archetype:** title-hero
**Headline:** Oracle lookup stays on Oracle while hospital work continues
**Notes:** Patient sync already has the hospital database open. The Sybase-or-PostgreSQL check then asks Oracle on that same route, and Oracle refuses it.

### Slide: Background
**Eyebrow:** Background
**Title:** The type check fails, and the failure sticks
**Archetype:** evolution
**Body:** Hospital database is selected. The `loe_control` read still uses that route. The miss is stored as PostgreSQL.
**Notes:** The cache is the part that hurts. One miss is stored as PostgreSQL, so later messages never ask Oracle again. Chinese characters then stay in a message for a Sybase hospital.

### Slide: Existing Design - route
**Eyebrow:** Existing Design
**Title:** Oracle is asked on the hospital route
**Archetype:** compare
**Body:** Today the read follows the hospital route and is refused. After the change, the Oracle read uses the Oracle connection and the hospital transaction stays open.
**Notes:** We do not point the whole thread at Oracle. That would commit hospital work already done. Only the Oracle read uses the Oracle connection.

### Slide: Proposed Change - behaviour
**Eyebrow:** Proposed Change
**Title:** Three outcomes, and patient sync code stays as it is
**Archetype:** cards
**Body:** The Oracle read succeeds. Hospital work is not committed early. If Oracle is down, this call is Sybase and is not saved.
**Notes:** `lis-patient-pmi-sync-svc` still calls the same check. The library changes underneath it.

### Slide: Promotion
**Eyebrow:** Promotion
**Title:** Ship the library and leave config alone
**Archetype:** cards
**Body:** New `data-source` build. JDBC settings unchanged in DEVQA, SIT, and PROD. Patient sync rebuilds to take the library.
**Notes:** DEVQA, SIT, and PROD keep the same JDBC settings. What changes is the library binary.

### Slide: Fallback
**Eyebrow:** Fallback
**Title:** Put the previous library back
**Archetype:** cards
**Body:** Redeploy the previous `data-source` build and restart. The old warning `defaulting to PostgreSQL` should return. A wrong saved answer is cleared with `DELETE /api/clearCachedDBConn/{hospital}/{lab}`.
**Notes:** You know the rollback worked when that old warning is back on a Sybase hospital.

### Slide: Open Questions
**Eyebrow:** Open Questions
**Title:** Two questions before we build
**Archetype:** asks
1. Is `LOE` / lab `1` / `LOE_DB` the only Oracle database?
2. If a distributed transaction is already open, may this Oracle read join it? Hospital work will not be committed early.
**Notes:** The first question is whether a second Oracle database is registered. The second is enlistment only. We are not redesigning distributed transactions.

### Slide: Q&A
**Archetype:** statement
**Headline:** Q&A
**Notes:** Likely questions: does patient sync source change (no), and what happens when Oracle is down (this call is Sybase, and that answer is not saved).

### Close
**Archetype:** closing
**Notes:** After the room, write any CP3 actions back onto the design note. This deck does not close the review gate.
