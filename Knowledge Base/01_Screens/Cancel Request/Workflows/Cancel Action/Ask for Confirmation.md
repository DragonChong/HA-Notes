---
epic: LISP-247
status: draft
---
# Ask for Confirmation

## Overview

Step 5 of the eight-step cancel pipeline runs after user validation and before the server call. For the Cancel Request screen, no additional confirmation prompts are required at this stage. The step executes and proceeds immediately to the server save step without displaying any message to the operator.

---

## Related User Stories

- **[[CRST-940]]** — Cancel Request — Ask for Confirmation

**Epic:** LISP-247 [CRST][DEV] Cancel Request - Cancel Action

---

## Trigger Point

Step 5 of the eight-step cancel pipeline, immediately after [[User Validation]] (step 4) passes. Passes control directly to [[Cancel Request (Action)]] (step 6).

---

## Behaviour

The system evaluates whether any lab-specific confirmation messages need to be shown before committing the cancel action. For the Cancel Request screen, no such confirmation messages are defined. The step completes without displaying any prompt and the pipeline advances automatically.

> **Note:** Although the pipeline architecture supports lab-specific confirmation messages at this step (for example, Blood Bank modules may inject additional confirmations), the standard Cancel Request workflow defines none. The step is present in the pipeline for extensibility but is a no-op for all standard labs.

---

## Business Rules

1. No confirmation prompt is shown to the operator at this step for any standard lab workflow.
2. Special lab modules (such as Blood Bank) may extend this step to add lab-specific confirmations.

---

## Related Workflows

- [[User Validation]] — Step 4; runs immediately before this step.
- [[Cancel Request (Action)]] — Step 6; the server save that this step leads into.
