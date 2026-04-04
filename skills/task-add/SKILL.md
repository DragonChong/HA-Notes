---
name: task-add
description: Add a new task to the CRS Revamp project — registers it in the Central Task List (CRS/Revamp/Central Task List.md) with a global Task ID, and also adds a row to the correct per-screen migration plan. Use when planning a new task, discovering a missing task, or splitting an existing task. Updates Progress Summary and Changelog in both files.
argument-hint: "[repo e.g. lis-request-app] [migration plan e.g. Registration] [phase e.g. 2] [task name] [optional: notes]"
---

# Add Task to Migration Plan + Central Task List

You are adding a new task to the CRS Revamp project. The task is registered in **two places**:
1. The per-screen migration plan (e.g. `CRS/Revamp/Migration Plan/Frontend/Registration Migration Plan.md`)
2. The Central Task List at `CRS/Revamp/Central Task List.md`

---

## Step 1 — Gather required information

If the user has not provided all of the following, ask before proceeding:

1. **Repository** — which repository does this task belong to?
   - `lis-hub-app` / `lis-request-app` / `lis-crs-common-app` / `lis-request-svc` / `lis-patient-svc` / `lis-hub-svc`
2. **Migration plan** — which per-screen migration plan does this task belong to?
   - e.g. `Registration Migration Plan`, `Amend Request Migration Plan`, `Registration Backend Migration Plan`
   - If no per-screen plan applies, say `"None — Central List only"`
3. **Phase** — which phase does this task belong to? (0–10)
4. **Sub-section** — which sub-section within the phase? (e.g. `0A`, `0B`, `2`, `8C`)
5. **Task name** — concise name matching the style of existing entries (bold noun phrase, e.g. `**Patient Demographics Panel layout**`)
6. **Notes** — any implementation notes, constraints, or blocker references (e.g. `Blocked by D.2`)
7. **Reference** — Obsidian wikilink to the relevant Knowledge Base note, if it exists

---

## Step 2 — Generate a global Task ID

1. Read `CRS/Revamp/Central Task List.md`
2. Scan the Task Registry table for all existing Task IDs matching the pattern `TASK-\d+`
3. Extract the numeric parts; find the maximum value
4. New Task ID = maximum + 1, zero-padded to 3 digits (e.g. `TASK-007`)
5. If no rows exist yet, assign `TASK-001`
6. Hold this ID — it will be written to both files in the steps below

---

## Step 3 — Determine the local task number

1. Read the target phase section in the migration plan file
2. Find the last existing task number in that section
3. Assign the next sequential number following the existing pattern:
   - Phase-level tasks: `2.1`, `2.2`, `2.3` …
   - Sub-section tasks: `0A.1`, `0A.2` … or `8C.1`, `8C.2` …
4. If no migration plan applies, skip this step

---

## Step 4 — Insert the task row in the migration plan

> Skip this step if migration plan is "None — Central List only".

Find the correct table in the migration plan and append the new row in this exact format:

```markdown
| {number} | **{Task Name}** — {brief description if needed} | `[ ]` | {[[wikilink]] or notes} · `{TASK-ID}` |
```

Examples:
```markdown
| 2.5 | **Action Buttons Panel** — Save / Clear / Exit layout + Retain checkboxes | `[ ]` | [[Knowledge Base/01_Screens/Registration/Components/Action Buttons Panel]] · `TASK-042` |
| 0A.9 | **Configure ESLint and Prettier** | `[ ]` | Mirror `lab-crs-app` config · `TASK-043` |
| 8C.4 | **Register BBNK Request** — BBNK-specific save path | `[ ]` | Blocked by D.1 · `TASK-044` |
```

Rules:
- Status is always `[ ]` for a new task
- Task name is always **bold**
- The Task ID tag (`` `TASK-NNN` ``) is appended to the Reference/Notes cell after a ` · ` separator
- This tag allows `task-update` to find the Task ID when given a local task number

---

## Step 5 — Register in Central Task List

Append a new row to the **Task Registry** table in `CRS/Revamp/Central Task List.md`:

```markdown
| {TASK-ID} | `{repository}` | **{Task Name}** — {brief description} | `[ ]` | {notes or blocker refs} | [[CRS/Revamp/Migration Plan/{path to plan}]] §{local-number} |
```

If migration plan is "None — Central List only", omit the `§` reference and use `—` for Reference:
```markdown
| {TASK-ID} | `{repository}` | **{Task Name}** | `[ ]` | {notes} | — |
```

Rules:
- Status is always `[ ]`
- Task name is always **bold**
- Reference uses `§{local-number}` notation pointing to the migration plan section until `/task-plan` upgrades it to a direct implementation plan note link

Then update the **Progress Summary** table in `CRS/Revamp/Central Task List.md`:
- Increment **Total** and **Pending** for the matching Repository row
- Recalculate the **Total** row at the bottom

---

## Step 6 — Update the migration plan Progress Summary

> Skip if migration plan is "None — Central List only".

Locate the Progress Summary table in the migration plan and increment the **Pending** count and **Total Tasks** count for the affected phase row, then update the **Total** row.

---

## Step 7 — Update Changelogs

Append to the Changelog in **both** files.

**Migration plan Changelog:**
```markdown
| {YYYY-MM-DD} | Added task {local-number} ({TASK-ID}): {Task Name} |
```

**Central Task List Changelog:**
```markdown
| {YYYY-MM-DD} | Added {TASK-ID}: {Task Name} ({repository}) |
```

---

## Step 8 — Confirm

Show the user:
1. The exact row inserted in the migration plan (if applicable)
2. The exact row inserted in the Central Task List
3. The updated Progress Summary row for the affected phase (migration plan)
4. The updated Progress Summary row for the affected repository (Central Task List)
5. The assigned Task ID

Do not modify any other part of either file.
