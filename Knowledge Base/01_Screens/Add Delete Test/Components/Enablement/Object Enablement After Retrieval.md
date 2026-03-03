---
epic: LISP-263
status: draft
---
# Object Enablement After Retrieval

## Overview

When a request is successfully retrieved on the Add/Delete Test screen, the screen transitions from its default locked state to an active state where the appropriate buttons, the Test Panel, and the Input Specimen No. button become available. This document describes the complete enablement rules for each screen object across all three operational states: initial (before retrieval), ready (after retrieval), and saving (during submit processing).

---

## Related User Stories

- **[[CRST-1024]]** — Add Delete Test — Screen Object Enablement

**Epic:** LISP-263 [CRST][DEV] Add/Delete Test — Screen Object Enablement

---

## Screen Object States

### Initial State (Before Retrieval)

When the Add/Delete Test screen first opens, only the **Request No.** field is active:

| Screen Object | State |
|---|---|
| Request No. Text Input | Enabled, visible, **editable** |
| Input Specimen No. button | Disabled and visible |
| Submit button | Disabled and visible |
| Clear button | Disabled and visible |
| Test Panel | Disabled and visible |
| Pay Code field | Visible, **always read-only** |
| Discharged text indicator | Visible, **always read-only** |

---

### Ready State (After Retrieval)

Once a request has been successfully retrieved, the screen becomes fully active:

| Screen Object | State |
|---|---|
| Request No. Text Input | Visible, enabled, **non-editable** (request number is locked) |
| Input Specimen No. button | Enabled *(if USID is enabled for the lab and request — see below)* |
| Submit button | **Enabled** |
| Clear button | **Enabled** |
| Test Panel | **Enabled and editable** |
| Pay Code field | Visible, **always read-only** |
| Discharged text indicator | Visible, **always read-only** |

---

### Saving State (During Submit)

While the add/delete test submission is being processed, all interactive controls are locked to prevent concurrent changes:

| Screen Object | State |
|---|---|
| Input Specimen No. button | Disabled |
| Submit button | Disabled |
| Clear button | Disabled |
| Test Panel | Disabled |

---

## Input Specimen No. Button Enablement

The **Input Specimen No.** button uses additional logic to determine whether it becomes enabled in the Ready state. It is enabled only when the USID option is active for the lab **and** the request number entered is not itself already in USID format:

| USID Option Enabled | Request Number Format | Input Specimen No. Button |
|---|---|---|
| Yes | Non-USID format | **Enabled** |
| Yes | USID format | Disabled |
| No | Any | Disabled |

> **USID lab option:** `LAB_OPTION` where `option_group = 'USID'` and `option_code = 'ENABLE'` and `option_value = 1`.

For BTH specimen ID type requests, the **Input Specimen No.** button is always enabled in the Ready state regardless of the USID option setting.

---

## Patient Demographics Loaded on Retrieval

The following patient data fields are populated when a request is retrieved:

| Field |
|---|
| Patient HKID |
| Patient Encounter No. |
| Patient Name (English) |
| Patient Name (Chinese) |
| Request Doctor Code |
| Sex |
| Age |
| Age Unit |
| Request Location |
| Bed |
| Report Location |
| Report Copy Location |
| Pay Code |

---

## Test Grid Data Loaded on Retrieval

The following test data fields are populated in the Test Grid for each retrieved test:

| Column | Data Source |
|---|---|
| Specimen | Specimen No. associated with the test |
| Test Profile | `TEST_REGISTRABLE.testreg_profile_desc` |
| Group | `TEST_DICT.test_alpha_code` with group key from `TEST_REGISTRABLE.testreg_header` |
| Test Code | Derived from the test group (see [[Retrieve Request]]) |
| Test Name | `TEST_DICT.test_full_name` |
| Status Date | `TESTRSLT.testrslt_status_date` |
| Optional | `TESTRSLT.testrslt_optional` |

---

## Configuration

| Setting | Option Code | Source Table | Purpose | Effect When Enabled | Effect When Disabled |
|---------|------------|--------------|---------|--------------------|--------------------|
| USID Enable | `ENABLE` | `LAB_OPTION` (`option_group = 'USID'`) | Controls whether the USID specimen input feature is active for the lab | Input Specimen No. button enabled in Ready state (subject to request format check) | Input Specimen No. button always disabled |

---

## Business Rules

1. The **Pay Code** and **Discharged** fields are always read-only and are never editable on this screen, regardless of state.
2. The **Request No.** field becomes non-editable after retrieval — the request number cannot be changed while a request is loaded.
3. The **Exit** button is always enabled in all states.
4. The **Input Specimen No.** button is only enabled in the Ready state, and only when the USID lab option is active and the entered request number is not itself a USID-format number.
5. During the Saving state, the Submit, Clear, Test Panel, and Input Specimen No. controls are all disabled until the server response is received.

---

## Related Components

- [[Default Screen Behavior]] — The initial screen state before any retrieval occurs.
- [[Clear Button]] — Clicking Clear returns the screen to the Initial state.

## Related Workflows

- [[Retrieve Request]] — The trigger for the state transition from Initial to Ready.
