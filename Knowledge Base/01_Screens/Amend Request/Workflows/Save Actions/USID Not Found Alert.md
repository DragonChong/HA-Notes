---
epic: LISP-225
status: draft
---
# USID Not Found Alert

## Overview

The **USID Not Found Alert** is a warning prompt displayed during the Amend Request pre-save process when the system detects that a USID entered in the Input Specimen Number Dialogue does not exist in the system. It warns staff before the amendment is committed, giving them the option to proceed with saving the unrecognised USID or to abort and correct the entry. The alert can be suppressed for the remainder of the screen session by checking an **Inactive** checkbox.

---

## Related User Stories

- **[[CRST-818]]** - Amend Request - USID Not Found Alert

**Epic:** LISP-225 [CRST][DEV] Amend Request - USID

---

## Trigger

This alert is evaluated during the **Amend button** pre-save process. It is shown when:

- The specimen number input is in **USID format**, **and**
- The USID **cannot be found** in the system

> **Not triggered when:**
> - The specimen number is in Specimen No. (non-USID) format — no existence check is performed
> - The USID exists in the system
> - The Inactive checkbox has been checked in the current screen session

---

## Alert Content

The alert displays **message 4074** with the corresponding USID value as a parameter. An **Inactive** checkbox is shown on the message prompt.

---

## Buttons and Actions

#### OK
The amendment pre-save process continues. The specimen relation containing the non-existent USID is saved for the request.

#### Close (×)
The amendment process is **aborted**. The request data remains unchanged on the Amend Request screen; no data is saved.

#### Inactive Checkbox
When checked — regardless of whether the user then clicks OK or ×:
- The alert is **suppressed for the remainder of the current screen session**; it will not appear for any subsequent requests amended until the Amend Request screen is closed and reopened.
- On the next amendment with a non-existent USID, the system proceeds as if the user clicked OK: the specimen relation is saved without prompting.

---

## Interaction Behaviours

#### USID not found, alert shown — user clicks OK
The USID is saved with the specimen relation. The amendment continues to the next stage of the save process.

#### USID not found, alert shown — user clicks ×
The amendment is aborted. The request data remains on screen unchanged.

#### Inactive checkbox checked (either button clicked)
The alert is inactivated for the session. On all subsequent amendments in the same session where a non-existent USID is encountered, the specimen relation is saved automatically without prompting.

---

## Related Workflows

- [[USID Input Dialogue]] — Staff enter the USID in this dialogue; the existence check is run at the point the Amend button is clicked.
- [[USID Data Conversion]] — Runs after this alert is resolved (OK or inactivated); converts specimen relations to request info for saving.
- [[USID Audit]] — Audit records are inserted after a successful save, including when the USID was not found but the user proceeded.
