---
name: blocker-check
description: Check which CRS Revamp open blockers affect a given Registration task before implementation starts. Use this before starting any task to surface unknowns, decide whether to proceed with assumptions, and insert the correct TODO comments. Prevents wasted implementation effort on blocked tasks.
argument-hint: "[phase.task number or task description]"
---

# Blocker Pre-Check

Before implementing a Registration task, identify which open blockers apply and decide the safest path forward.

---

## Open Blockers Registry

| ID | Description | Affects | Status |
|---|---|---|---|
| D.1 | `CrsRegController` endpoint contracts — request/response DTOs not yet confirmed | Phase 9 (all backend endpoints), Phase 8C (Register Request save) | Open |
| D.2 | Dictionary keyword group codes not confirmed — `AGE_UNIT`, `RACE`, `BILL`, `CONFIDENTIAL`, `LAB_ONLY` | Phases 2–3: Patient Demographics Panel, Request Info Panel dropdowns | Open |
| D.3 | HKID lookup service: PAS API integration (`PasApiServiceImpl`) vs local CRS data — not decided | Phase 8A: patient retrieval workflow | Open |
| D.4 | `OBJECT_ATTRIBUTE` table access route: Hub BFF (`selectDictionaries`) or `lis-crs-spec-ack-svc` directly? Affects whether `ObjectAttributeVo` is available in `apiContext.dictionary.get()` | Phase 4: tab sequence, default focus field | Open |
| D.5 | Worksheet printing integration — print service API endpoint and payload not confirmed | Phase 8D.1: Registration Worksheet Printing | Open |
| D.6 | Label printing integration — label print service API not confirmed | Phase 8D.2: Request No Label Printing | Open |

---

## Analysis steps

Given the task provided by the user:

1. **Identify affected blockers** — which of D.1–D.6 (if any) affect this task?

2. **For each affected blocker, state:**
   - Exactly what is unknown
   - What assumption would be needed to proceed
   - What the risk is if the assumption turns out to be wrong

3. **Recommend one of:**
   - **PROCEED** — No blockers affect this task. Implement fully.
   - **PROCEED WITH ASSUMPTION** — Blocker exists but a safe assumption allows progress. State the assumption explicitly.
   - **PARTIAL** — Some aspects can be implemented, others must wait. Specify what can and cannot be done.
   - **BLOCKED** — Cannot meaningfully proceed without resolution. Recommend what to resolve first.

---

## If proceeding with assumption

Insert a `TODO` comment at every point in the generated code where the assumption is applied:

```typescript
// TODO [BLOCKER D.2]: Assuming keyword group code for AGE_UNIT is 'AGE_UNIT' —
// confirm with team before release
<KeywordDropdown group="AGE_UNIT" labNo={null} ... />
```

This makes all assumption points searchable across the codebase via `grep "BLOCKER D."`.

---

## Output format

```
Task: {task name}
Affected blockers: D.x, D.y  (or "None")

For each blocker:
  Blocker D.x
  Unknown: <what is not yet confirmed>
  Assumption to proceed: <specific assumption>
  Risk if wrong: <what would need to change>

Recommendation: PROCEED | PROCEED WITH ASSUMPTION | PARTIAL | BLOCKED
Reason: <one sentence>
```
