---
name: task-update
description: Update the status of one or more tasks in both the per-screen migration plan and the Central Task List (CRS/Revamp/Central Task List.md). Accepts a global Task ID (TASK-001) or a local task number (2.1). Recalculates Progress Summary in both files and appends Changelog entries in both files.
argument-hint: "[TASK-ID or local task number(s) e.g. TASK-007 or 2.1] [start|done|skip|block] [optional: which plan if ambiguous]"
---

# Update Task Status in Migration Plan + Central Task List

You are updating task status in **two places simultaneously**:
1. The per-screen migration plan (e.g. `CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan.md`)
2. The Central Task List at `CRS/Revamp/Central Task List.md`

---

## Step 1 — Parse the request

Accept one or more task identifiers and a target status. Supported input forms:

| User says | Identifier type | Target status |
|---|---|---|
| "start TASK-007" | Global Task ID | In Progress |
| "done with TASK-007, TASK-008" | Global Task IDs | Completed |
| "start task 2.1" | Local number | In Progress |
| "done with 2.1, 2.2, 2.3" | Local numbers | Completed |
| "mark 0A.1 complete" | Local number | Completed |
| "skip 6.15" | Local number | Skipped |
| "block 4.1 on D.4" | Local number | Blocked (add note) |
| "Phase 2 is done" | Natural language | Completed (all Phase 2 tasks) |

**Resolution when a global Task ID is given:**
1. Find the row in `CRS/Revamp/Central Task List.md` Task Registry where Task ID matches
2. Read the Reference column to identify which migration plan and local task number it maps to
3. Update both files using that information

**Resolution when a local task number is given:**
1. Default to `Registration Migration Plan.md` unless the user specifies another plan
2. Find the row in the migration plan matching that number
3. Read the Notes/Reference cell and extract the `TASK-\d+` tag (e.g. `` `TASK-007` ``)
4. Use that Task ID to locate and update the matching row in the Central Task List
5. If no Task ID tag is found (task predates centralization), see Graceful Degradation below

---

## Step 2 — Status symbol mapping

| Input | Symbol | Meaning |
|---|---|---|
| `start` | `[/]` | In Progress |
| `done` | `[x]` | Completed |
| `skip` | `[-]` | Skipped / N/A |
| `block` | `[!]` | Blocked — add blocker ID to Notes |

> Note: `[!]` for Blocked is an extension of the standard legend. If `[!]` is not already in the Status Legend callout in the file, add it:
> ```markdown
> > - `[!]` — Blocked (pending resolution of a dependency)
> ```

---

## Step 3 — Locate and update each task row

For each task, update **both files**:

**In the migration plan:**
1. Find the row matching the local task number exactly
2. Replace the status cell with the new symbol
3. If Blocked, append blocker reference to the Notes/Reference cell: ` — Blocked: D.x`
4. If In Progress and a date note is useful, append `(started {YYYY-MM-DD})` to Notes

**In the Central Task List:**
1. Find the row in the Task Registry where Task ID matches
2. Replace the status cell with the same new symbol
3. If Blocked, append the blocker reference to the Notes cell: ` — Blocked: D.x`

Do not modify any other content in the rows.

---

## Step 4 — Recalculate Progress Summary in both files

After all row updates, recount actual status values — do not estimate.

**Migration plan Progress Summary** (by phase — existing logic, unchanged):
```markdown
| Phase X — {Name} | {total} | {count [x]} | {count [/]} | {count [ ] + [!]} |
```
Recalculate the Total row as well.

**Central Task List Progress Summary** (by repository):
For each Repository row, scan the Task Registry and count rows where the Repository column matches:
- `[x]` → Completed
- `[/]` → In Progress
- `[ ]` + `[!]` → Pending

Update the **Total** row at the bottom.

> The Pending column counts both `[ ]` (Pending) and `[!]` (Blocked) — tasks not yet done.

---

## Step 5 — Append to Changelog in both files

**Migration plan Changelog:**
```markdown
| {YYYY-MM-DD} | Task {local-number} ({TASK-ID}) status → {status}: {Task Name} |
| {YYYY-MM-DD} | Phase {X} tasks {range} marked complete ({count} tasks) |
```

**Central Task List Changelog:**
```markdown
| {YYYY-MM-DD} | {TASK-ID} status → {status}: {Task Name} |
```

---

## Step 6 — Confirm with summary

Show the user a confirmation block:

```
Updated:
  TASK-007  Task 2.1 — Patient Demographics Panel    [ ] → [x]
  TASK-008  Task 2.2 — Request Info Panel            [ ] → [x]

Migration plan — Phase 2 progress: 2 / 11 completed
Central Task List — lis-request-app: 2 / 146 completed (1.4%)
Overall progress: 2 / 146 completed (1.4%)
```

---

## Graceful Degradation (tasks without a Task ID)

If a task row in the migration plan has no `` `TASK-NNN` `` tag (created before centralization):

1. Update the migration plan row normally
2. Warn the user:
   ```
   ⚠ Task {number} has no Task ID — updating migration plan only.
     To register it in the Central Task List, run /task-add for this task.
   ```
3. Optionally offer: "Would you like me to register this task in the Central Task List now? I'll need the repository name."

If any task number was not found in the file at all:
```
⚠ Task 9.99 not found in Registration Migration Plan.md — check the task number.
```
