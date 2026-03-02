---
epic: LISP-222
status: draft
---
# Urgency Color

## Overview

The **Urgency** dropdown on the Request Information Panel uses a colour indicator to give registration staff an immediate visual signal of the urgency level of a request. When the urgency is set to **Urgent**, the dropdown is highlighted in red. For all other urgency values (Non-Urgent, Desperate, Reserve for OT, T&S, etc.), the dropdown is shown with a white background. This colour change applies both when staff select a new urgency value and when the screen first loads a retrieved request.

---

## Related User Stories

- **[[CRST-788]]** - Amend Request - Urgency Color
- **[[CRST-101]]** - Registration - Urgency Color *(reference — same pattern)*
- **[[CRST-455]]** *(reference)*

**Epic:** LISP-222 [CRST][DEV] Amend Request - Screen Object Interaction

---

## Key Concepts

### Urgency Values
Urgency values are defined in the laboratory's keyword configuration. The keyword group is **URGENCY**. Each urgency keyword has a numeric alpha code stored in `REQUEST.req_urgency`. The **Urgent** status corresponds to `key_alpha = '1'`.

### Colour Rule
Only the **Urgent** status (`key_alpha = '1'`) triggers a red highlight. All other urgency statuses display with a white background, regardless of their clinical significance.

---

## Colour Behaviour

### On User Selection

| Selected Urgency | Dropdown Background Colour |
|------------------|---------------------------|
| Urgent | Red |
| Non-Urgent (or any other non-Urgent value) | White |

The colour updates immediately when the user selects a value from the **Urgency** dropdown — no confirmation or save action is required for the colour change to take effect.

### On Request Retrieval

When a request is retrieved, the **Urgency** dropdown is populated with the stored urgency value and the background colour reflects the urgency status immediately:

| Stored Urgency Value | Dropdown Background Colour |
|----------------------|---------------------------|
| Urgent (`key_alpha = '1'`) | Red |
| Non-Urgent (`key_alpha = '2'`) | White |
| Desperate (`key_alpha = '3'`) | White |
| Reserve for OT (`key_alpha = '4'`) | White |
| T&S (`key_alpha = '5'`) | White |
| Any other non-Urgent value | White |

---

## Configuration

| Setting | Source | Purpose | Effect |
|---------|--------|---------|--------|
| Urgency Keywords | `KEYWORD_GROUP` / `KEYWORD_LIST` (keyed by `URGENCY` group) | Defines the available urgency values | All active, lab-wide (`key_labno = 0`) urgency keywords are offered in the dropdown |

---

## Related Workflows

- [[Retrieve Request]] — Urgency colour is applied as part of request retrieval when the retrieved urgency value is loaded onto the screen.
