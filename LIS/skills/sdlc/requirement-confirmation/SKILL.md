---
name: requirement-confirmation
description: >
  Use when scoping a change, confirming requirements, starting a dossier,
  turning an SM email / defect / verbal request into stage 01, or when
  sdlc-orchestrator delegates the requirement stage. Do not use for a
  technical design or a JIRA change-request log.
---

# Requirement confirmation

You ask and draft. The requester confirms. The **open-question list**
is the deliverable. Template:
`SDLC/Templates/Requirement Confirmation Template.md`.

## Reply shape

1. Strip PHI from the request (HKID, name, episode). Use synthetic
   samples. If the paste still has PHI, redact it in the note — do not
   refuse the draft, and do not keep real identifiers "as evidence".
2. Resolve the existing dossier (orchestrator path, or the single
   `status: active` one). Create one only if none exists. Do not invent
   a second folder name.
3. Summarise current behaviour from the vault **before** scope. If Ka
   says skip search, write one open question: "context not retrieved —
   confirm current behaviour" with a proposed default. Still no design.
4. Fill every template section. Then stop.

Show In scope, Out of scope, `Rn`, and Open questions unless Ka asked
to skip review. Then write the note and dossier write-back.

## Required slots

| Slot | Rule |
|---|---|
| Out of scope | At least one explicit exclusion. "Obvious" / blank is not a list. |
| `Rn` | Numbered. Each has acceptance criteria. Status starts `proposed`. |
| Open questions | At least one row, each with a **proposed default**. Every assumption is a row. |
| Confirmation | Empty on first draft. |
| `reviewed_by` | Empty on first draft. |
| `gates_passed` | Do not append `requirement`. |

Verbal "SM already told me" is not confirmation. Closing the gate is
the orchestrator's job after Ka pastes written confirmation **or**
says **proceed on assumptions**.

## Write-back

`requirement: "[[01 Requirement Confirmation]]"`, `services`, Artifacts
`draft`, one Decision Log line, Status next action = wait for
confirmation or proceed-on-assumptions. Set `updated`.

## Later confirmation

Update Answer / `Rn` status / Confirmation in place. Tick Open Items.
Wrong default → Decision Log + which design sections change; hand back
to `sdlc-orchestrator`. Do not edit the design unless asked.

## Rationalizations

| Excuse | Reality |
|---|---|
| "Ka said close the gate / mark confirmed" | Draft only. Orchestrator closes. Verbal is not Confirmation. |
| "SM email is the request so Rn is confirmed" | Email is the trigger. Status stays `proposed`. |
| "No time for open questions" | Questions *are* the artifact. Guess → row + default. |
| "Out of scope is obvious — leave blank" | Blank means scope was not thought about. Write one exclusion. |
| "Also write the design, CP3 is tomorrow" | Second stage. Stop. Tell the orchestrator. |
| "Skip vault search" | One open question that context was skipped. Still no design. |

## Red flags

- HKID, patient name, or episode number in the note
- Empty Out of scope
- Zero open questions
- `reviewed_by` or `gates_passed` set on first draft
- `02 System Design.md` written in this turn
