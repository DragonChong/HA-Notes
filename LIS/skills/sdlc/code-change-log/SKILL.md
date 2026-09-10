---
name: code-change-log
description: >
  Use when recording what a development change actually touched —
  files, APIs, DB objects, config keys, log markers — writing stage
  06, or when sdlc-orchestrator delegates after implement-task. Do
  not use to write code (implement-task) or to review a PR
  (code-review).
---

# Code change log

You record facts from the diff. Later stages read this note.
Home: `SDLC/Projects/<key>/06 Code Change Log.md`. Template:
`SDLC/Templates/Code Change Log Template.md`.

## Entry

`design` is in `gates_passed` (or a recorded exception). A branch
exists. Compile or type-check has already passed for this change.
Otherwise stop and hand back to `sdlc-orchestrator` or
`implement-task`.

## Reply shape

1. Resolve the dossier. Read `02` and the git diff in dossier
   `repos` (open clones). Do not invent endpoints, tables, or log
   strings.
2. One `###` section per repo / branch / PR.
3. Fill every table. Empty tables get an explicit "none".
4. Grep `TODO [OPEN-` in the diff. List each in Open TODOs and on
   the dossier `## Open Items`.
5. Show the draft. Write the note. Write back. Stop.

## Required slots

| Slot | Rule |
|---|---|
| Commit range | Real SHAs or "uncommitted — SHA after commit" |
| Files / classes | Paths, not "various" |
| New log markers | Exact string + level. Highest leverage for monitoring. |
| DB objects | Rollback statement, not only forward DDL |
| Config keys | DEVQA / SIT / PROD, or "none" |
| `Rn` | At least one requirement id |

A missing log-marker row is a defect. If the change added no logs,
write **none** and why.

## Write-back

`Artifacts` row `06 Code Change Log` → `[[06 Code Change Log]]` →
`draft`. One Decision Log line. Set `updated`. **Do not** append
`development` to `gates_passed` (needs compile, tests, Sonar, PR).

## Rationalizations

| Excuse | Reality |
|---|---|
| "Monitoring can grep later" | Stage 10 writes itself from this table. Fill it now. |
| "Also raise the PR review" | `code-review` is the next stage. Stop. |
| "Uncommitted — skip the note" | Write the note; mark the commit range uncommitted. |

## Red flags

- Invented log strings or ConfigMap keys
- Empty DB rollback
- `gates_passed` includes `development` from this skill
- Code edited in this turn (that is `implement-task`)
