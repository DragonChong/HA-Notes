---
epic: LISP-247
status: draft
---
# Confirmation Message

## Overview

When the user clicks the **Cancel Request** button, the system immediately prompts for confirmation before taking any action. This is the first step in the cancellation pipeline — no validation, server call, or data change occurs until the user confirms. If the user declines, the screen remains exactly as it was with all retrieved data intact. If the user confirms, the cancellation process continues through its remaining steps.

---

## Related User Stories

- **[[CRST-937]]** - Cancel Request - Confirmation Message

**Epic:** LISP-247 [CRST][DEV] Cancel Request - Cancel Action

---

## Trigger

The confirmation prompt appears immediately when the **Cancel Request** button is clicked, provided a request has been retrieved and the button is enabled. No pre-processing, validation, or server communication occurs before this prompt.

---

## Confirmation Prompt

| Message | Text | Default Focus | User Options |
|---------|------|---------------|-------------|
| 672 | "Are you sure?" | **No** button | Yes / No |

> The default focus is on the **No** button, making it the safer default — the user must actively choose **Yes** to proceed.

---

## Response Behaviour

### User Clicks No

The confirmation prompt closes. The cancellation action is abandoned. The Cancel Request screen remains unchanged — the retrieved request data is still displayed and all buttons remain in their current enabled state. No data is modified.

### User Clicks Yes

The confirmation prompt closes. The cancellation process continues to the next step in the pipeline:

1. ~~**Confirmation** (this step)~~ ✅
2. Gather server information for validation
3. Validate the request (test statuses, security checks)
4. Validate user access rights
5. Ask for confirmation of specific conditions
6. Submit the cancellation to the server
7. Display the result message
8. Clear the screen

---

## Business Rules

1. The confirmation prompt always appears when the **Cancel Request** button is clicked — it cannot be bypassed.
2. The default focus is on **No**, meaning pressing Enter without moving focus will abort the cancellation.
3. Clicking **No** leaves all data on screen exactly as it was; no state changes occur.
4. The cancellation only proceeds if the user explicitly clicks **Yes**.
5. The **Cancel Request** button is only enabled when a request has been retrieved and no saved cancel comment exists — see [[Object Enablement After Retrieval]].

---

## Related Workflows

- [[Object Enablement After Retrieval]] — Defines when the Cancel Request Button is enabled, which is the prerequisite for this prompt to appear.
- [[Validation]] — The next substantive step after the user confirms.
- [[Ask for Confirmation]] — A subsequent confirmation step that follows validation.
- [[Cancel Request (Action)]] — The full cancellation pipeline of which this confirmation is the first step.
