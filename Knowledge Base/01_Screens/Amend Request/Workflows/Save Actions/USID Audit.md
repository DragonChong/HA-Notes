---
epic: LISP-225
status: draft
---
# USID Audit

## Overview

The **USID Audit** step records operation audit entries whenever specimen-to-test-profile relations are created, updated, or removed during an amendment. Four distinct audit types capture different aspects of the change — the remap action, the full relation state, additions, and deletions — providing a complete trace of how specimen assignments have changed for each request.

---

## Related User Stories

- **[[CRST-820]]** - Amend Request - USID Audit

**Epic:** LISP-225 [CRST][DEV] Amend Request - USID

---

## Trigger

Audit records are inserted to `operation_audit` during the **Amend button** save sequence, after specimen relation data has been converted and saved.

---

## Audit Types

All audit types are defined in `lis_constant` (`const_group = 'AUDIT_TYPE'`).

### Audit Type 559 — Remap Specimen by User

Recorded for every profile code affected by the amendment.

**Format:**
```
Profile Code : USID[Profile Specimen]
```

- *Profile Specimen* is the Specimen No. or USID mapped to that profile.
- If multiple specimens are mapped to one Profile Code, they are concatenated with ", ".
- If multiple Profile Codes are affected, the audit text for each is joined with a new line.

**Examples:**

Single profile, single specimen:
```
LFT : USID[PW22CAA0126C]
```

Multiple profiles, multiple specimens each:
```
NA : USID[PWHSP2200002311, PWHSP2200014254]
K : USID[PWHSP2200002311, PWHSP2200014254]
CA : USID[PWHSP2200002311, PWHSP2200014254]
```

---

### Audit Type 560 — Specimen Relation Mapping

Records the full state of the specimen-to-profile relation after the amendment.

**Format:**
```
USID[Profile Specimen]

Profile Code: USID[Profile Specimen]
```

- First line: all specimens (concatenated with ", " if multiple).
- Followed by a blank line, then one line per Profile Code.

**Examples:**

Single specimen, single profile:
```
USID[PWHSP2200014262]

RFT: USID[PWHSP2200014262]
```

Single specimen, multiple profiles:
```
USID[PWHSP2200014254]

NA: USID[PWHSP2200014254]
K: USID[PWHSP2200014254]
CA: USID[PWHSP2200014254]
```

---

### Audit Type 564 — Add Specimen

Recorded when one or more specimens are added to the request.

**Format:**
```
USID[Added Profile Specimen]
```

- If multiple specimens are added, they are concatenated with ", ".

**Examples:**

Single addition:
```
USID[PWHSP2200002311]
```

Multiple additions:
```
USID[PW22CAA0125E, PW22CAA01296]
```

---

### Audit Type 565 — Delete Specimen

Recorded when one or more specimens are removed from the request.

**Format:**
```
USID[Deleted Profile Specimen]
```

- If multiple specimens are deleted, they are concatenated with ", ".

**Examples:**

Single deletion:
```
USID[PW22CAA01296]
```

Multiple deletions:
```
USID[PW22CAA0125E, PW22CAA01296]
```

---

## Audit Types by Scenario

| Amendment Scenario | Audit Types Recorded |
|-------------------|---------------------|
| Update from no mapping to have specimen mapping | 559, 560, 564 |
| Update from Specimen No. to USID | 559, 560, 564, 565 |
| Update from USID to Specimen No. | 559, 560, 564, 565 |
| Add specimen to request with multiple test profiles | 559, 560, 564 |
| Remove specimen from request with multiple test profiles | 559, 560, 565 |

---

## Related Workflows

- [[USID Data Conversion]] — The changes recorded here are determined by the conversion step; audit types reflect what was added, updated, or removed.
- [[USID Input Dialogue]] — The source of the specimen relation changes that drive the audit entries.
- [[Operation Audit]] — General operation audit recording used alongside USID-specific audit types.
