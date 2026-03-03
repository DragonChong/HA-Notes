---
status: draft
---
# Wipeout Request — Overview

## Purpose

The **Wipeout Request** screen allows authorised lab staff to permanently remove a previously registered laboratory request from the system. Unlike Cancel Request — which records a cancellation reason and leaves an audit trail — Wipeout Request obliterates the request entirely. The screen retrieves an existing request by request number, displays its test results for review, and then — after confirmation and security checks — submits the wipeout action to the server.

---

## Relationship to Cancel Request

Wipeout Request shares the majority of its screen structure, retrieval workflow, validation logic, and interaction behaviour with Cancel Request. Where the two screens are functionally identical, the Wipeout Request documentation notes the shared logic and links back to the corresponding Cancel Request KB article. Only Wipeout-specific behaviour is described in full here.

Key differences from Cancel Request:
- **No cancel reason entry** — there is no **Cancel Reason** text input, no **Cancel Comment** shortcut buttons, and no **Retain Cancel Reason** checkbox.
- **No amend/authorize comment flow** — there are no **Update Reason** or **Authorize Reason** buttons.
- **No cancel comment initialisation check** — the screen does not check for a `CANCEL_COMMENT` lab option on load.
- **Wipeout Request button** replaces the Cancel Request button as the primary action control.
- **VIRO special workflow** — Wipeout Request has a Virology-specific pair specimen check not present in Cancel Request.
- **BBNK: Ask for Confirmation** — Blood Bank has a separate additional confirmation step (not in Cancel Request).
- **TIS Correlation Check** — Wipeout Request includes a TIS correlation check not present in Cancel Request.

---

## Epic Summary

| Epic | Title | Scope |
|------|-------|-------|
| LISP-251 | Wipeout Request — Layout | Screen structure, default control states on open |
| LISP-252 | Wipeout Request — Request Retrieval | Request number entry, lab selection, data loading |
| LISP-253 | Wipeout Request — Screen Object Enablement | Which controls become active after retrieval |
| LISP-254 | Wipeout Request — Screen Object Interaction | Clear button, tab sequence, default focus |
| LISP-255 | Wipeout Request — Wipeout Action | Confirmation, validation, user validation, server action, result messages |
| LISP-256 | Wipeout Request — Special Lab Workflow (BBNK) | Blood Bank blood inventory validation, BBNK-specific confirmation and wipeout |
| LISP-257 | Wipeout Request — Special Lab Workflow (VIRO) | Virology pair specimen check and wipeout |

---

## Screen Structure

The Wipeout Request screen contains the following major zones:

- **Request No. Text Input** — entry point for the request to be wiped out
- **Patient Demographic Panel** — read-only display of patient details for the retrieved request
- **Clinical Detail and Comment** — read-only display of clinical information
- **Test Grid** — displays the tests and their current statuses; shows a Specimen column when USID is enabled for the performing lab
- **Specimen and Site Section** — visible only for MBS and VRS labs; read-only
- **Wipeout Request Button** — the primary action button; disabled until a request is retrieved
- **Clear Button** — resets the screen after a confirmation prompt
- **Exit Button** — closes the screen

---

## Key Workflows (Common with Cancel Request)

- [[Retrieve Request]] — Request retrieval workflow (shared with Cancel Request)
- [[Laboratory Selection]] — Lab resolution on request number entry (shared with Cancel Request)
- [[Not Supported Lab Message]] — CRS-app restriction on unsupported labs (shared with Cancel Request)
- [[Request Not Found Message]] — Message when no matching request exists (shared with Cancel Request)
- [[Test Result]] — Test grid population on retrieval (shared with Cancel Request)
- [[Confirmation Message]] — "Are you sure?" prompt on Wipeout button click (shared with Cancel Request)
- [[Validation]] — Security check and wipeout-specific validation (shared with Cancel Request, excluding cancel comment phase)
- [[User Validation]] — Secondary user authentication (shared with Cancel Request)
- [[Ask for Confirmation]] — Pre-server-call confirmation step (shared with Cancel Request)

---

## Key Components (Common with Cancel Request)

- [[Default Screen Behavior]] — Initial control states on screen open
- [[Laboratory Selection]] — Lab selection component
- [[Object Enablement After Retrieval]] — Control enablement after request retrieval
- [[Clear Button]] — Clear button behaviour
- [[Default Focus - Initial]] — Initial keyboard focus placement
- [[Tab Sequence]] — Keyboard navigation order

---

## Special Lab Workflows

### BBNK (Blood Bank)
- [[Blood Inventory Validation]] — Blood unit state check before wipeout (shared logic with Cancel Request)

### VIRO (Virology)
*(Non-common — to be documented separately)*

---

## Related Screens

- [[Cancel Request/_Cancel_Request_Overview|Cancel Request]] — The primary functional counterpart; most Wipeout Request logic is shared with Cancel Request.
