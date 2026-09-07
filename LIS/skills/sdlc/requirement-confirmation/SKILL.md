---
name: requirement-confirmation
description: >
  Turns an ambiguous request (SM email, defect, verbal) into a numbered
  requirement note in the project dossier. Use when the user asks to confirm
  requirements, start a dossier, scope a change, or run stage 01. Also use
  when sdlc-orchestrator delegates the requirement stage. Do not use to write
  a technical design (that is system-design) or a JIRA log
  (lis-jira-log-creator). Do not mark the requirement gate passed.
---

# Requirement confirmation

Level **C** — you ask and draft; the requester confirms. The clarification
list is the deliverable. Vault template:
`SDLC/Templates/Requirement Confirmation Template.md`.
Stage contract: `SDLC/Stages/01 Requirement Confirmation.md`.

## Inputs

| Input | Required |
|---|---|
| Raw request text | Yes |
| `work_type` (`project` / `enhancement` / `fix`) | Yes |
| Affected service(s) | Yes — infer if obvious, then confirm |

Strip HKID, name, episode number and any PHI before text enters a prompt
or a note. Replace with synthetic examples.

## Procedure

1. **Resolve or create the dossier** under `SDLC/Projects/<key> — <Short Name>/`.
   Provisional key `TMP-<slug>` if no JIRA key yet. Use
   `SDLC/Templates/Dossier.md`. If `sdlc-orchestrator` already resolved a
   dossier, use that path — do not create a second one.
2. **Retrieve context first.** Search the vault (`Knowledge Base/`,
   `LIS/ECP/<service>/`, `Study/`, `LIS/JIRA/`, past `SDLC/Projects/`) and
   summarise current behaviour *before* proposing scope.
3. **Impact scan.** Search repos and the vault for other callers of the
   changed behaviour. Surface anything the requester probably missed.
4. **Draft** `01 Requirement Confirmation.md` from the template. Every
   assumption becomes an open question with a proposed default.
5. **Show the draft** (especially In scope, Out of scope, `Rn`, and Open
   questions) unless the user asked to skip review.
6. **Write** the note and write back to `_Dossier.md`. Stop. Do not start
   `system-design` unless the user has already said **proceed on
   assumptions** (or pasted confirmation) — then tell the orchestrator
   the gate is ready; still do not close it yourself.

## Output

`SDLC/Projects/<key>/01 Requirement Confirmation.md`

- Background and trigger
- In scope / **Out of scope** (out-of-scope list must be non-empty)
- Functional requirements `R1…Rn`, each with acceptance criteria and
  Status `proposed` | `assumed` | `confirmed`
- Non-functional: volume, latency, retention, audit
- Impact: services, screens, tables, interfaces
- Assumptions (working defaults you are designing against)
- Open questions with proposed defaults — this list is the SM send-back
- Confirmation: empty, quoted, or "Proceed on assumptions, <date>"

Frontmatter provenance:

```yaml
generated_by: requirement-confirmation
generated_on: '<today>'
reviewed_by: ''
review_date: ''
agent_assisted: true
```

## Dossier write-back

- `requirement: "[[01 Requirement Confirmation]]"`
- `services` from the impact table
- Artifacts row: `01 Requirement` → `[[01 Requirement Confirmation]]` → `draft`
- One Decision Log line
- `## Status` next action: wait for confirmation **or** "proceed on
  assumptions", then `/system-design`
- Set `updated`
- **Do not** append `requirement` to `gates_passed`
- **Do not** set `reviewed_by`

## Exit gate (human) — two verdicts

Shared checks, both verdicts:

- Out-of-scope list is non-empty
- Each `Rn` has at least one acceptance criterion
- Every open question has an answer **or** a proposed default

Then one of:

1. **`pass`** — Confirmation quotes or links the requester's written
   confirmation. Set `reviewed_by`. Flip each `Rn` to `confirmed`.
2. **`pass with assumptions`** — the user says to proceed without that
   confirmation. Every unanswered question keeps its proposed default;
   set those `Rn` to `assumed`; write `A1…An` into dossier Open Items;
   Confirmation says "Proceed on assumptions, <date>". Leave
   `reviewed_by` empty.

Tell the orchestrator which verdict is ready. Do not close the gate
yourself.

## When confirmation arrives later

Update the requirement note in place: Answer column, `Rn` Status,
Confirmation. Tick the matching Open Items.

If a default was **wrong**: Decision Log the delta, list which design
(and later JIRA) sections are affected, and hand back to the
orchestrator — it may reopen `design`. Do not silently rewrite the
design in this turn unless the user asked for that edit.

## Related

- Orchestrator: `sdlc-orchestrator`
- Next: `system-design` — not this skill
- JIRA log: `lis-jira-log-creator` — later, after design (except `work_type: fix`)
