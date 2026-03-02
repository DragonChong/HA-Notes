---
epic: LISP-223
status: draft
---
# Change Reason Dialogue

## Overview

When the `POPUP_CHANGE_REASON` option is enabled, amending certain request fields triggers a **Change Reason Dialogue** before the amendment is saved. The user must select a reason category and, for some categories, provide a free-text comment. The selected reason and comment are appended to the change audit entry in `TESTRSLT_AUDIT`. If the user cancels, the amendment is undone.

---

## Related User Stories

- **[[CRST-800]]** - Amend Request - Change Reason Dialogue
- **[[CRST-797]]** - Amend Request - Validation (AmendRequestDataValidator) *(parent validation story)*

**Epic:** LISP-223 [CRST][DEV] Amend Request - Amend Action

---

## Trigger Conditions

The Change Reason Dialogue is displayed when the **Amend** button is clicked, `POPUP_CHANGE_REASON` is enabled, and **any** of the following fields has been changed:

| Field Changed |
|--------------|
| Urgency |
| Request Doctor (Doctor Code) |
| Report Location |
| Specimen Collection Datetime |

If none of these four fields is changed, the dialogue is not shown regardless of the option setting.

---

## Configuration

| Setting | Option Code | Purpose | Effect when enabled (= 1) | Effect when disabled (= 0) |
|---------|------------|---------|--------------------------|---------------------------|
| Popup Change Reason | `POPUP_CHANGE_REASON` | Controls whether the Change Reason Dialogue is prompted for specific field changes | Dialogue is displayed when a trigger field is changed | No dialogue; amendment proceeds directly |

*Source: `LAB_OPTION` table, `option_group = 'REQUEST_REGISTRATION'`.*

---

## Dialogue Layout

The dialogue contains:
- A **Reason of Change** dropdown (combobox) with three options
- A **comment** textarea (maximum 150 characters)
- **OK** and **Cancel** buttons

### Reason of Change Options

| Option | Default | Comment Required |
|--------|---------|-----------------|
| Typo mistake at registration | ✅ Yes (default) | No — OK enabled without comment |
| Information clarified | No | Yes — OK disabled until comment is entered |
| Other | No | Yes — OK disabled until comment is entered |

---

## Dialogue Behaviour

| Reason Selected | Comment Empty | OK Button |
|----------------|---------------|-----------|
| Typo mistake at registration | Yes | **Enabled** |
| Typo mistake at registration | No | **Enabled** |
| Information clarified | Yes | **Disabled** |
| Information clarified | No | **Enabled** |
| Other | Yes | **Disabled** |
| Other | No | **Enabled** |
| Blank (removed) | — | Blocked by message 490 |
| Invalid value | — | Blocked by message 497 |

The comment textarea accepts a maximum of 150 characters; input beyond that limit is not accepted.

---

## Validation Messages

| Message | Text | Condition | User Options |
|---------|------|-----------|-------------|
| 490 | "Reason of Change must not be blank." | Reason of Change combobox is left blank | OK (dismiss) |
| 497 | "Invalid Change Reason" | An invalid value is entered in the Reason of Change field | OK (dismiss) |

---

## Interaction Behaviours

#### User selects "Typo mistake at registration" (default)
The **OK** button is immediately enabled. A comment is optional.

#### User selects "Information clarified" or "Other" with empty comment
The **OK** button remains disabled. The user must enter a comment before proceeding.

#### User enters a comment
Once text is added, the **OK** button becomes enabled for all reason types.

#### User clicks OK (reason and comment ready)
The amendment proceeds. The registered lab request is updated. A `TESTRSLT_AUDIT` record is inserted. The reason and comment are appended to the audit text in square brackets (e.g., `Urgency : Non-urgent -> Urgent [Amend Urgency]`).

#### User clicks Cancel
The amendment is undone. The screen returns to its pre-amend state.

---

## Effect on Change Audit

When a reason and comment are provided, the change audit text appended to `TESTRSLT_AUDIT.testaud_varchar` includes the reason in square brackets:

| Example | Audit Text |
|---------|-----------|
| Urgency changed with reason | `Urgency : Non-urgent -> Urgent [Amend Urgency]` |
| Report Location changed with reason | `Report destination : PWH// -> PWH/PATH/%MICRUR [Amend Report Location]` |
| No change reason (option disabled) | `Urgency : Non-urgent -> Urgent` *(no bracket)* |

See [[Change Audit]] for the full set of audit text formats.

---

## Related Workflows

- [[Change Audit]] — The reason text from this dialogue is embedded in the `TESTRSLT_AUDIT` audit entries for the affected fields.
- [[Amend Request Validation]] — The dialogue appears as part of the save action sequence after all validations pass.
