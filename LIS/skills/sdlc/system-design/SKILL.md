---
name: system-design
description: >
  Writes the canonical technical design as its own dossier note
  (02 System Design.md), with a ## Design slide section for CP3.
  Use when the user asks for system design, a design note, or stage 02,
  and when sdlc-orchestrator delegates the design stage. Do not use for
  a JIRA change-request log (lis-jira-log-creator) or a CP3 deck
  (design-review-pptx). Do not write ## Design into a LIS/JIRA note —
  that legacy path is generate-design. Do not mark the design gate passed.
---

# System design

Level **B** — you draft; a person sets `reviewed_by` before any deck.
Refit of `generate-design`: same CP3 writing rules, different home.

Vault template: `SDLC/Templates/System Design Template.md`.
Slide blocks: `LIS/skills/generate-design/design-template.md`.
Stage contract: `SDLC/Stages/02 System Design.md`.

## Entry

- Dossier resolved (from the orchestrator, or the single `status: active` one)
- `requirement` is in `gates_passed`, or the user chose a recorded exception
- `01 Requirement Confirmation.md` has numbered `R1…Rn`

If the requirement gate is unmet, stop and hand back to
`sdlc-orchestrator`. Do not draft around it.

## Procedure

1. Read the requirement note and dossier frontmatter only. Then pull
   architecture from `LIS/ECP/<service>/`, `SpringBoot/`,
   `Knowledge Base/`, and the local clone. Follow `lis-architecture`,
   `data-source-usage`, `lis-audit-logging` when those skills apply.
2. Classify **incremental** (delta) vs **full** (new service / major rework).
3. Draft the **canonical sections** (below). Cite `Rn` on every design
   decision; if that `Rn` is `assumed`, write `R3 (assumed)` and add an
   open design question to confirm it. Record rejected alternatives — a
   design without them cannot survive CP3.
4. Draft `## Design` slide blocks from
   `generate-design/design-template.md`. Derive slides from the canonical
   sections; do not invent facts that are not in the note above.
5. Diagrams via `mermaid-diagrams` (sequence, ER, component).
6. Show the draft unless the user asked to skip review.
7. Write `SDLC/Projects/<key>/02 System Design.md`. Write back to the
   dossier. If a JIRA log note already exists, set its `design` frontmatter
   to `"[[02 System Design]]"`. Stop. Do not start `design-review-pptx`
   unless the user asked for a deck **and** `reviewed_by` is already set.

## Canonical sections

| Section | Incremental | Full |
|---|---|---|
| Context and problem | yes | yes |
| Existing design | yes | yes |
| Proposed change — overview | yes | yes |
| Component / class design | when touched | yes |
| Data model (DDL, indexes, migration + rollback) | when touched | yes |
| Interface / API contract | when touched | yes |
| Configuration (DEVQA / SIT / PROD) | yes | yes |
| Error handling, logging, audit | yes | yes |
| Non-functional | brief | yes |
| Rejected alternatives | yes | yes |
| Promotion impact and fallback | yes | yes |
| Open design questions | yes | yes |
| `## Design` (slide blocks) | yes | yes |

Writing rules for `## Design` are those in `generate-design` (plain
English in prose; identifiers in code/tables; concrete Open Questions;
Promotion + Fallback for production changes).

## Output frontmatter

```yaml
generated_by: system-design
generated_on: '<today>'
reviewed_by: ''
review_date: ''
agent_assisted: true
review_type: incremental   # or full
```

## Dossier write-back

- `design: "[[02 System Design]]"`
- Artifacts row: `02 Design` → `[[02 System Design]]` → `draft`
- One Decision Log line (include the rejected-alternative choice)
- `## Status` next action: human sets `reviewed_by`, then
  `/design-review-pptx`
- Set `updated`
- **Do not** append `design` to `gates_passed`
- **Do not** set `reviewed_by`

## Exit gate (human)

The orchestrator closes `design` only when `reviewed_by` is set and the
stage-note checklist is met (every `Rn` mapped, migration/rollback,
per-env config, fallback, open questions owned).

## Related

- Upstream: `requirement-confirmation`
- Legacy sibling: `generate-design` (## Design inside a JIRA note)
- Downstream: `design-review-pptx` (reads this note first)
- JIRA log: `lis-jira-log-creator`
