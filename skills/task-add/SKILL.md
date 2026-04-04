---
name: task-add
description: Add a new task entry to the CRS Revamp Registration migration plan in the Obsidian vault. Use this when planning a new task, discovering a missing task, or splitting an existing task into sub-tasks. Updates the task table for the correct phase and recalculates the Progress Summary.
argument-hint: "[phase e.g. 2] [task name] [optional: notes]"
---

# Add Task to Migration Plan

You are adding a new task entry to the CRS Revamp Registration migration plan at:
`CRS/Revamp/Migration Plan/Registration Migration Plan.md`

---

## Step 1 — Gather required information

If the user has not provided all of the following, ask before proceeding:

1. **Phase** — which phase does this task belong to? (0–10)
2. **Sub-section** — which sub-section within the phase? (e.g. `0A`, `0B`, `2`, `8C`)
3. **Task name** — concise name matching the style of existing entries (bold noun phrase, e.g. `**Patient Demographics Panel layout**`)
4. **Notes** — any implementation notes, constraints, or blocker references (e.g. `Blocked by D.2`)
5. **Reference** — Obsidian wikilink to the relevant Knowledge Base note, if it exists (e.g. `[[Knowledge Base/01_Screens/Registration/Components/Patient Demographics Panel]]`)

---

## Step 2 — Determine the task number

1. Read the target phase section in `Registration Migration Plan.md`
2. Find the last existing task number in that section
3. Assign the next sequential number following the existing pattern:
   - Phase-level tasks: `2.1`, `2.2`, `2.3` …
   - Sub-section tasks: `0A.1`, `0A.2` … or `8C.1`, `8C.2` …
4. If inserting between existing tasks (e.g. splitting a task), use the next available number at the end of the section and add a note explaining the relationship

---

## Step 3 — Insert the task row

Find the correct table in the file and append the new row in this exact format:

```markdown
| {number} | **{Task Name}** — {brief description if needed} | `[ ]` | {[[wikilink]] or notes} |
```

Examples matching the existing style:
```markdown
| 2.5 | **Action Buttons Panel** — Save / Clear / Exit layout + Retain checkboxes | `[ ]` | [[Knowledge Base/01_Screens/Registration/Components/Action Buttons Panel]] |
| 0A.9 | **Configure ESLint and Prettier** | `[ ]` | Mirror `lab-crs-app` config |
| 8C.4 | **Register BBNK Request** — BBNK-specific save path | `[ ]` | Blocked by D.1 |
```

Rules:
- Status is always `[ ]` for a new task
- Task name is always **bold**
- Additional description after `—` is optional but encouraged for clarity
- Reference column uses `[[wikilink]]` for KB notes, plain text for notes without a link

---

## Step 4 — Update the Progress Summary table

Locate the Progress Summary table (near the top of the file) and increment the **Pending** count and **Total Tasks** count for the affected phase row, and update the **Total** row.

```markdown
| Phase X — {Name} | {old+1} | 0 | 0 | {old+1} |
```

Also increment the Total row:
```markdown
| **Total** | {old+1} | ... | ... | {old+1} |
```

---

## Step 5 — Update the Changelog

Append a new row to the Changelog table at the bottom of the file:

```markdown
| {YYYY-MM-DD} | Added task {number}: {Task Name} |
```

---

## Step 6 — Confirm

Show the user:
1. The exact row that was inserted
2. The updated Progress Summary row for the affected phase
3. The new total task count

Do not modify any other part of the file.
