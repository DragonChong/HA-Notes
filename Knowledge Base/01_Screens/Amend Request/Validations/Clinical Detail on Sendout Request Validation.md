---
epic: LISP-223
status: draft
---
# Clinical Detail on Sendout Request Validation

## Overview

For sendout requests, the system can enforce that **Clinical Detail** is mandatory when the sendout destination matches a configured location. When this option is enabled and the retrieved request is a sendout request with a matching destination, clicking **Amend** without clinical detail entered produces a blocking error message. This ensures that clinical context is always provided when requests are sent to designated external destinations.

---

## Related User Stories

- **[[CRST-900]]** - Amend Request - Clinical Detail on Sendout Request Validation Checking
- **[[CRST-797]]** - Amend Request - Validation (AmendRequestDataValidator) *(parent validation story)*

**Epic:** LISP-223 [CRST][DEV] Amend Request - Amend Action

---

## Key Concepts

### Sendout Request
A request that is directed to an external laboratory or service destination. Sendout destinations are defined in the laboratory keyword configuration under the **SENDOUT** keyword group.

### Destination Matching
The option is configured per-laboratory with a specific sendout destination keyword key (`option_text`). The clinical detail check only triggers when the request's sendout destination matches the key defined in the option.

---

## Validation Rule and Message

| Message | Text | Condition | User Options | On OK |
|---------|------|-----------|-------------|-------|
| 490 | "This request sendout to DH, clinical detail must not be blank." | Request is a sendout request AND sendout destination matches `option_text` AND Clinical Detail is empty AND `SENDOUT_LOCATION_FORCE_CDETAIL_MANDATORY` = 1 | OK | Message closes; amendment undone |

---

## Configuration

| Setting | Option Code | Purpose | Effect when enabled | Effect when disabled |
|---------|------------|---------|--------------------|--------------------|
| Sendout Location Force Clinical Detail Mandatory | `SENDOUT_LOCATION_FORCE_CDETAIL_MANDATORY` | Enforces Clinical Detail as mandatory for sendout requests to a specific destination | Clinical Detail blank → message 490 blocks and undoes amendment when destination matches `option_text` | No Clinical Detail requirement for sendout requests |

*Source: `LAB_OPTION` table, `option_group = 'REQUEST_REGISTRATION'`. The `option_text` value contains the `KEYWORD_LIST.key_ckey` of the required sendout destination.*

---

## Data Source

Sendout destinations are defined in the hospital keyword configuration:

| Data | Source Table | Column |
|------|-------------|--------|
| Sendout keyword group | `KEYWORD_GROUP` | `keygp_code = 'SENDOUT'`, `keygp_item` |
| Sendout destination description | `KEYWORD_LIST` | `key_ckey`, `key_desc` |

---

## Related Workflows

- [[Amend Request Validation]] — Sendout clinical detail validation runs as part of the overall validation sequence when the Amend button is clicked.
