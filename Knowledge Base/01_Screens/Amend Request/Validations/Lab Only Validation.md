---
epic: LISP-223
status: draft
---
# Lab Only Validation

## Overview

When the **Amend** button is clicked and the Lab Only option is enabled for the laboratory, the system validates the **Private** field (which carries the Lab Only / Private Referral selection). The field must not be blank and must contain a recognised keyword value. These checks are only active when the Lab Only feature is enabled by a laboratory option.

---

## Related User Stories

- **[[CRST-899]]** - Amend Request - Lab Only Validation Checking
- **[[CRST-797]]** - Amend Request - Validation (AmendRequestDataValidator) *(parent validation story)*

**Epic:** LISP-223 [CRST][DEV] Amend Request - Amend Action

---

## Validation Rules and Messages

Both rules apply only when `LAB_ONLY_REQUEST_ENABLED` = 1 for the laboratory.

| Message | Text | Condition | User Options | On OK |
|---------|------|-----------|-------------|-------|
| 490 | "Lab Only must not be blank." | Private field is empty | OK | Message closes; amendment undone |
| 3935 | "Keyword setup error. *[invalid keyword]* does not exist. Please contact LIS Support." | Private field contains an unrecognised keyword | OK | Message closes; amendment undone |

> Unlike most 490 / 497 errors which block and allow correction, both Lab Only validation errors result in the amendment being **undone** (the screen is reset) when OK is clicked.

---

## Configuration

| Setting | Option Code | Purpose | Effect when enabled | Effect when disabled |
|---------|------------|---------|--------------------|--------------------|
| Lab Only Request | `LAB_ONLY_REQUEST_ENABLED` | Activates the Lab Only feature and its validation rules | Lab Only blank and invalid keyword checks are active | Validation rules not applied to the Private field |

*Source: `LAB_OPTION` table, `option_group = 'REQUEST_REGISTRATION'`*

---

## Related Workflows

- [[Amend Request Validation]] — Lab Only validation runs as part of the overall validation sequence when the Amend button is clicked. The Lab Only confirmation flow (messages 2599 → 3840) is documented there.
