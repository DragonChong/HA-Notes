---
epic: LISP-222
status: draft
---
# Doctor Description

## Overview

The **Request Doctor Code** field on the Request Information Panel is accompanied by a read-only **Doctor Description** display that shows the full name — and department, if available — of the doctor identified by the entered code. The description updates automatically as the doctor code is entered or changed, providing immediate confirmation that the correct doctor has been selected.

---

## Related User Stories

- **[[CRST-790]]** - Amend Request - Doctor Description
- **[[CRST-511]]** - Manual Registration - Doctor Description *(reference — same pattern)*

**Epic:** LISP-222 [CRST][DEV] Amend Request - Screen Object Interaction

---

## Behaviour

### Doctor Code is Blank or Invalid

If the **Request Doctor Code** field is empty or contains an unrecognised code, the **Doctor Description** field is displayed as blank. No error is raised; the description simply remains empty.

### Doctor Code Entered — Name Only

If the entered doctor code matches a record that has a name but no department, the **Doctor Description** displays the doctor's full name only.

**Example:** Entering doctor code `ABDUV` displays: `ABDULLAH, VICTOR`

### Doctor Code Entered — Name and Department

If the entered doctor code matches a record that has both a name and a department, the **Doctor Description** displays the doctor's full name followed by the department code in square brackets.

**Example:** Entering doctor code `AJM286` displays: `ANG, Jeffray Marc Dungan [SUR]`

---

## Summary Table

| Doctor Code State | Doctor Description Displayed |
|-------------------|------------------------------|
| Blank or invalid | *(empty)* |
| Valid code — no department | Doctor's full name |
| Valid code — with department | Doctor's full name `[Department Code]` |

---

## Data Source

Doctor information is looked up from the hospital's office / doctor directory:

| Data | Source Table | Column |
|------|-------------|--------|
| Doctor code (lookup key) | `OFFICE` | `office_alpha` |
| Doctor full name | `OFFICE` | `office_name` |
| Department code | `OFFICE` | `office_dept` |

---

## Related Workflows

- [[Retrieve Request]] — When a request is retrieved, the stored doctor code is loaded and the Doctor Description is populated automatically from the retrieved code.
