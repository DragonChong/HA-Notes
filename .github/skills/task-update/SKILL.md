---
name: task-update
description: Update the status of one or more tasks in the CRS Revamp Registration migration plan in the Obsidian vault. Use this when starting, completing, skipping, or blocking a task. Automatically recalculates the Progress Summary table and appends to the Changelog.
argument-hint: "[task number(s) e.g. 2.1 or 2.1 2.2 2.3] [new status: start | done | skip | block]"
---

# Update Task Status in Migration Plan

You are updating task status in the CRS Revamp Registration migration plan at:
`CRS/Revamp/Migration Plan/Registration Migration Plan.md`

---

## Step 1 — Parse the request

Accept one or more task numbers and a target status. Common natural language inputs:

| User says | Task numbers | Target status |
|---|---|---|
| "start task 2.1" | `2.1` | In Progress |
| "done with 2.1, 2.2, 2.3" | `2.1`, `2.2`, `2.3` | Completed |
| "mark 0A.1 complete" | `0A.1` | Completed |
| "skip 6.15" | `6.15` | Skipped |
| "block 4.1 on D.4" | `4.1` | Blocked (add note) |
| "Phase 2 is done" | all Phase 2 tasks | Completed |

---

## Step 2 — Status symbol mapping

| Status | Symbol | When to use |
|---|---|---|
| Pending | `[ ]` | Not yet started |
| In Progress | `[/]` | Actively being worked on |
| Completed | `[x]` | Implementation done, type-check passes |
| Skipped | `[-]` | Not applicable for this project/lab |
| Blocked | `[!]` | Cannot proceed — add blocker ID in Notes column |

> Note: `[!]` for Blocked is an extension of the standard legend. If `[!]` is not already in the Status Legend callout in the file, add it:
> ```markdown
> > - `[!]` — Blocked (pending resolution of a dependency)
> ```

---

## Step 3 — Locate and update each task row

For each task number provided:

1. Find the row in the task table matching that number exactly
2. Replace the status cell: change `| \`[ ]\` |` → `| \`[x]\` |` (or the appropriate symbol)
3. If status is **Blocked**, also append the blocker reference to the Notes column:
   - `| 4.1 | **Screen Object Tab Sequence** | \`[!]\` | [[...]] — Blocked: D.4 |`
4. If status is **In Progress** and a date note is useful, append `(started {YYYY-MM-DD})` to Notes

Do not modify any other content in the row.

---

## Step 4 — Recalculate the Progress Summary table

After all row updates, recount the actual status values in each phase section by scanning the task tables. Do not estimate — count precisely.

Update the Progress Summary table with the accurate counts:

```markdown
| Phase X — {Name} | {total} | {count [x]} | {count [/]} | {count [ ] + [!]} |
```

Recalculate the **Total** row as well.

> The Pending column counts both `[ ]` (Pending) and `[!]` (Blocked) — tasks that are not yet done.

---

## Step 5 — Append to the Changelog

Add one row per status change (or one row summarising a batch update):

```markdown
| {YYYY-MM-DD} | Task {number} status → {status}: {Task Name} |
| {YYYY-MM-DD} | Phase {X} tasks {range} marked complete ({count} tasks) |
```

---

## Step 6 — Confirm with summary

Show the user a confirmation block:

```
Updated:
  Task 2.1 — Patient Demographics Panel    [ ] → [x]
  Task 2.2 — Request Info Panel            [ ] → [x]

Phase 2 progress: 2 / 11 completed
Overall progress: 2 / 146 completed (1.4%)
```

If any task number was not found in the file, report it clearly:
```
⚠ Task 9.99 not found in Registration Migration Plan.md — check the task number.
```
