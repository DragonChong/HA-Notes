---
name: task-plan
description: Generate a detailed implementation plan for a CRS Revamp Registration task, saved as an Obsidian note in the vault. Use this before starting a task to capture business rules, technical approach, acceptance criteria, and effort estimate. Replaces JIRA sub-task creation for planning purposes.
argument-hint: "[phase.task e.g. 2.3] [task name]"
---

# Generate Task Implementation Plan

You are generating an Obsidian implementation plan note for a CRS Revamp Registration task. The note is saved at:
`CRS/Revamp/Task Plans/{phase.task} — {Task Name}.md`

---

## Step 1 — Gather information

If not already provided, ask for:
1. **Phase and task number** (e.g. `2.3`)
2. **Task name** (e.g. `Patient Demographics Panel`)
3. **Blockers that apply** (D.1–D.6, or "None")
4. **Effort estimate**: `S` (1 — trivial wiring), `M` (2 — moderate), `L` (3 — new component), `XL` (5 — complex/blocked)

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
phase: {X}
task: "{phase.task}"
status: pending
estimate: {S|M|L|XL}
blockers:
  - {D.x or none}
tags:
  - crs-revamp
  - registration
  - phase-{X}
created: {YYYY-MM-DD}
---

# {phase.task} — {Task Name}

> [!info] Phase Constraint
> **Phase {X}** — {scope description, e.g. "Layout and structural scaffolding only. No event handlers, API calls, or business logic."}
> Business logic deferred to Phase {X+1}.

## Context

{1–2 sentences describing what this task is and where it fits in the Registration screen.}

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

After creating the note, update the corresponding task row in `Registration Migration Plan.md` to add a wikilink to this plan note in the Notes/Reference column:

```markdown
| 2.3 | **Patient Demographics Panel** | `[ ]` | [[CRS/Revamp/Task Plans/2.3 — Patient Demographics Panel]] |
```

---

## Step 4 — Confirm

Show the user:
1. The path where the note was saved
2. The frontmatter summary (task, phase, estimate, blockers)
3. Prompt: "Run `/task-update 2.3 start` when you begin this task."
