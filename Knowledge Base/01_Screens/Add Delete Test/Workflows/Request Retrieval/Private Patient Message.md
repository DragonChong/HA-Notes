---
epic: LISP-262
status: draft
---
# Private Patient Message

## Overview

When a request is retrieved on the Add/Delete Test screen, the system checks whether the patient is classified as a private patient type that is configured to trigger an alert. If the patient's type matches one of the configured private patient types, a message is displayed to alert lab staff so they can handle the request appropriately. The specific message shown depends on how the lab option mapping is configured.

---

## Related User Stories

- **[[CRST-1021]]** — Add Delete Test — Private Patient Message

**Epic:** LISP-262 [CRST][DEV] Add/Delete Test — Request Retrieval

---

## Trigger Point

This check is performed immediately after a request is successfully retrieved. The system reads the patient's type from the retrieved request and compares it against the private patient type mapping defined in the `PRIVATE_PATIENT_ALERT_MAP` lab option.

---

## Message Logic

The lab option `PRIVATE_PATIENT_ALERT_MAP` (in `option_group = 'REQUEST_REGISTRATION'`) defines:
- **`option_value`:** The default message code to use when no per-type mapping overrides it.
- **`option_text`:** A mapping of patient types to message codes, supporting two formats:

| Format | `option_text` Pattern | Behaviour |
|--------|----------------------|-----------|
| **Multiple patient type mappings** | `%pat_type1,%message_code1;%pat_type2,%message_code2` | Each patient type maps to its own message code |
| **Single patient type** | `%pat_type1` | The patient type alone is listed; the default message code from `option_value` is used |

If the retrieved patient's type is found in the mapping:
- The corresponding message code (or the default if using single-type format) is displayed as an alert.

If the patient type is **not** found in the mapping, no message is shown and retrieval proceeds normally.

---

## Example

| Lab Option Field | Value |
|---|---|
| `option_group` | `REQUEST_REGISTRATION` |
| `option_code` | `PRIVATE_PATIENT_ALERT_MAP` |
| `option_value` | `4288` (default message code) |
| `option_text` | `POP` (single patient type) |

When a request is retrieved for a patient with type `POP`, message **4288** is shown.
When a request is retrieved for a patient with a different type, no message is shown.

---

## Messages

The message code that is displayed is determined entirely by the lab option configuration — there is no single fixed message code. The message is shown as an alert dialogue; the user dismisses it and retrieval continues normally.

| Trigger | Message Shown | User Options |
|---------|--------------|-------------|
| Patient type matches a configured private patient type | The message code defined for that patient type (or the default message code) | OK (dismiss — retrieval continues) |
| Patient type does not match any configured type | No message | — |

---

## Configuration

| Setting | Option Code | Source Table | Purpose |
|---------|------------|--------------|---------|
| Private Patient Alert Map | `PRIVATE_PATIENT_ALERT_MAP` | `LAB_OPTION` (`option_group = 'REQUEST_REGISTRATION'`) | Defines which patient types trigger a private patient alert and which message code is shown for each type |

---

## Business Rules

1. The private patient check is driven entirely by the `PRIVATE_PATIENT_ALERT_MAP` lab option; if the option is not configured, no message is ever shown.
2. The multiple-mapping format allows different patient types to display different messages; the single-type format uses the default message code from `option_value` for all matching patients.
3. Dismissing the private patient message does not block retrieval — the screen continues to load normally after the alert is acknowledged.
4. If the patient's type does not appear in the configured mapping, no message is shown and no action is taken.

---

## Related Workflows

- [[Retrieve Request]] — The private patient check occurs as part of the post-retrieval sequence.
- [[Patient Discharged Message]] — The discharged patient check may also occur in the same post-retrieval sequence.
