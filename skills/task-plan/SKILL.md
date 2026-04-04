---
name: task-plan
description: Generate a detailed implementation plan for a CRS Revamp task, saved as an Obsidian note in the vault. Updates the Central Task List Reference column to point directly to the new plan note. Use this before starting a task to capture business rules, technical approach, acceptance criteria, and effort estimate.
argument-hint: "[TASK-ID or phase.task e.g. TASK-007 or 2.3] [task name] [optional: repo]"
---

# Generate Task Implementation Plan

You are generating an Obsidian implementation plan note for a CRS Revamp task. The note is saved at:
`CRS/Revamp/Migration Plan/Frontend/Implementation Plans/{phase.task} — {Task Name}.md`

---

## Step 1 — Gather information

If not already provided, ask for:
1. **Task ID** — the global `TASK-NNN` identifier from the Central Task List
   - If the user provides a local task number (e.g. `2.3`) instead, find the Task ID by reading the `` `TASK-NNN` `` tag in that row's Notes/Reference cell in the migration plan
2. **Phase and task number** (e.g. `2.3`)
3. **Task name** (e.g. `Patient Demographics Panel`)
4. **Repository** — which repo this task targets (default: `lis-request-app`)
5. **Screen slug** — short tag for the screen (e.g. `registration`, `amend-request`, `backend`)
6. **Blockers that apply** (D.1–D.6, or "None")
7. **Effort estimate**: `S` (1 — trivial wiring), `M` (2 — moderate), `L` (3 — new component), `XL` (5 — complex/blocked)

Then search `@workspace` in the knowledge base for relevant documents:
- Knowledge Base notes for this panel/component/workflow
- Legacy Flex component references
- Any related workflow, validation, or interaction notes

---

## Step 2 — Generate the Obsidian note

Use this exact structure:

```markdown
---
title: "{phase.task} — {Task Name}"
task-id: {TASK-ID}
phase: {X}
task: "{phase.task}"
repo: {repository}
status: pending
estimate: {S|M|L|XL}
blockers:
  - {D.x or none}
tags:
  - crs-revamp
  - {screen-slug}
  - phase-{X}
created: {YYYY-MM-DD}
---

# {phase.task} — {Task Name}

> [!info] Phase Constraint
> **Phase {X}** — {scope description, e.g. "Layout and structural scaffolding only. No event handlers, API calls, or business logic."}
> Business logic deferred to Phase {X+1}.

## Context

{1–2 sentences describing what this task is and where it fits in the screen.}

Legacy source: `{LegacyComponentName.mxml}` / `{LegacyPmName.as}`

Related KB notes:
- [[Knowledge Base/01_Screens/Registration/...]]

## Blockers

{List each blocker with its assumption, or write "None."}

> [!warning] Blocker D.x
> **Unknown:** {what is not confirmed}
> **Assumption to proceed:** {specific assumption being made}
> **Risk if wrong:** {what would need to change}

## Technical Approach

**Files to create/modify:**
- `src/features/registration/components/{ComponentName}.tsx`
- `src/features/registration/hooks/use{ComponentName}.ts` *(if state needed)*
- `src/features/registration/types/{componentName}.types.ts` *(if new types)*
- `src/features/registration/index.ts` *(barrel export)*

**Shared library components (`@lis/lis-hub-lib`):**
- {List: HkidInput / EncounterNumber / LisLocationBox / LisDoctorSingleBox / etc., or "None — custom component"}

**Dictionary data needed:**
- {List VOs: RetainMasterVo / ObjectAttributeVo / etc., or "None"}

**API calls (Phase 4+):**
- {`apiContext.request.post<ResultDataResponse<T>>('/api/crs/reg/...', payload)` or "None in this phase"}

## Architecture checklist

- [ ] Emotion cache key is `"request"`
- [ ] No direct Axios imports — all calls via `apiContext.request.post`
- [ ] No Hub Zustand store imports — access state via `apiContext.*`
- [ ] Tab/panel visibility via `display:none` — never conditional unmount
- [ ] No `<MessageBoxProvider>` — use `(cms.api.ui as any).MessageBoxApi`
- [ ] Dictionary via `apiContext.dictionary.get()` — no direct endpoint calls
- [ ] No hardcoded env values (URLs, lab numbers, hospital codes)

## Acceptance criteria

- [ ] Component renders correctly when loaded in `lis-crs-common-app` integration
- [ ] `npm run type-check` passes with zero errors
- [ ] All architecture checklist items above are satisfied
- [ ] Unit test scaffold present with at least one passing render test
- [ ] Phase constraint respected — no out-of-scope logic present
- [ ] All `// TODO [BLOCKER D.x]` assumptions documented (if any)

## Notes

{Any additional notes, edge cases, or things to watch out for.}

## Unlocks

After completing this task, the following tasks become unblocked:
- {Task number and name}
```

---

## Step 3 — Link from the migration plan

After creating the note, update the corresponding task row in the migration plan to add a wikilink in the Notes/Reference column. Preserve the existing `` `TASK-NNN` `` tag:

```markdown
| 2.3 | **Patient Demographics Panel** | `[ ]` | [[CRS/Revamp/Migration Plan/Frontend/Implementation Plans/2.3 — Patient Demographics Panel]] · `TASK-007` |
```

---

## Step 3A — Update the Central Task List Reference column

1. Open `CRS/Revamp/Central Task List.md`
2. Find the Task Registry row where Task ID = `{TASK-ID}`
3. Replace the Reference cell value:
   - **From:** `[[CRS/Revamp/Migration Plan/.../...]] §{local-number}`
   - **To:** `[[CRS/Revamp/Migration Plan/Frontend/Implementation Plans/{phase.task} — {Task Name}]]`
4. This upgrades the reference from a migration plan section pointer to a direct link to the richer plan note

---

## Step 4 — Confirm

Show the user:
1. The path where the plan note was saved
2. The frontmatter summary (task-id, task, repo, estimate, blockers)
3. The Central Task List Reference column updated for `{TASK-ID}`
4. Prompt: "Run `/task-update {TASK-ID} start` when you begin this task."
