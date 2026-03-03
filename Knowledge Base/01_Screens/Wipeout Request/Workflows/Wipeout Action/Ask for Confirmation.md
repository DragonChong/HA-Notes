---
epic: LISP-255
status: draft
---
# Ask for Confirmation

## Overview

Step 5 of the wipeout pipeline runs after user validation and before the server call. For the standard Wipeout Request workflow, no additional confirmation prompts are required at this stage. The step executes and proceeds immediately to the server save step without displaying any message to the operator.

> **Shared logic:** This behaviour is identical to Cancel Request. See [[Cancel Request/Workflows/Cancel Action/Ask for Confirmation|Ask for Confirmation (Cancel Request)]] for the equivalent Cancel Request document.

---

## Related User Stories

- **[[CRST-995]]** — Wipeout Request — Ask for Confirmation
- Full logic reference: **[[CRST-940]]** (Cancel Request - Ask for Confirmation)

**Epic:** LISP-255 [CRST][DEV] Wipeout Request — Wipeout Action

---

## Trigger Point

Step 5 of the wipeout pipeline, immediately after [[User Validation]] (step 4) passes. Passes control directly to the wipeout server action (step 6).

---

## Behaviour

The system evaluates whether any lab-specific confirmation messages need to be shown before committing the wipeout action. For the standard Wipeout Request workflow, no such confirmation messages are defined. The step completes without displaying any prompt and the pipeline advances automatically.

> **Note:** Although the pipeline architecture supports lab-specific confirmation messages at this step, the standard Wipeout Request workflow defines none. Special lab modules (such as Blood Bank) may extend this step to add lab-specific confirmations. For BBNK, the blood inventory validation occurs at step 2 (gather server information), and the BBNK-specific ask-for-confirmation is handled separately — see [[Blood Inventory Validation]].

---

## Business Rules

1. No confirmation prompt is shown to the operator at this step for any standard lab workflow.
2. Special lab modules (such as Blood Bank) may extend this step to add lab-specific confirmations.

---

## Related Workflows

- [[User Validation]] — Step 4; runs immediately before this step.
- [[Blood Inventory Validation]] — The BBNK blood inventory check that runs at step 2 of the pipeline.
