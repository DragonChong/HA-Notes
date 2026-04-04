---
name: implement-task
description: Implement a CRS Revamp Registration screen task in lis-request-app. Use this when asked to implement, build, scaffold, or code any phase task (Phase 0–9) for the Registration migration. Covers component creation, hook wiring, type definitions, and test scaffolding.
argument-hint: "[phase.task e.g. 2.3] [task name e.g. Patient Demographics Panel]"
---

# Implement Registration Task

You are implementing a task for the CRS Revamp Registration screen migration in `lis-request-app` (Level-2 Remote MFE). The legacy source is Adobe Flex (ActionScript/MXML).

---

## Step 1 — Pre-flight: shared library check

Before writing any code, check whether a component from `@lis/lis-hub-lib` covers this task:

| Need | Use from @lis/lis-hub-lib | Never re-implement |
|---|---|---|
| HKID entry field | `HkidInput` | ✗ |
| Encounter number field | `EncounterNumber` | ✗ |
| Request number field | `RequestNumberInput` | ✗ |
| Location (Hospital/Specialty/Ward) | `LisLocationBox` | ✗ |
| Doctor lookup | `LisDoctorSingleBox` | ✗ |
| Keyword dropdown (urgency, category…) | `KeywordDropdown` | ✗ |
| Constant dropdown (blood group…) | `ConstantDropdown` | ✗ |
| Patient demographics banner | `PatientPanel` | ✗ |

If a shared component covers the task: **wire it up, do not re-implement it.**

---

## Step 2 — Pre-flight: phase constraint

Confirm which phase this task belongs to and respect its scope:

| Phase | Scope — do this | Do NOT do this yet |
|---|---|---|
| Phase 0 | Repo scaffolding, MF config, entry point wiring | Any screen UI |
| Phase 1 | Wrap/wire shared lib components only | Business logic |
| Phase 2 | Layout and structural scaffolding only | Event handlers, API calls, enable/disable logic |
| Phase 3 | Enable/disable states driven by screen state machine | Cross-field interactions |
| Phase 4 | Cross-field interaction logic, tab sequence wiring | Dialogues, validations |
| Phase 5+ | Lab panels, dialogues, validations, workflows, backend | — |

---

## Step 3 — Pre-flight: blocker check

Check `docs/blockers.md` (or the list below) for any blocker affecting this task. If blocked, state the assumption being made and add a `// TODO [BLOCKER D.x]: <assumption>` comment in generated code.

| ID | Affects |
|---|---|
| D.1 | Phase 9 — CrsRegController DTOs |
| D.2 | Phases 2–3 — keyword group codes (AGE_UNIT, RACE, BILL, CONFIDENTIAL, LAB_ONLY) |
| D.3 | Phase 8A — HKID lookup PAS vs local |
| D.4 | Phase 4 — OBJECT_ATTRIBUTE table access route |
| D.5 | Phase 8D — worksheet printing API |
| D.6 | Phase 8D — label printing API |

---

## Step 4 — Architecture rules (enforce in every file generated)

### Mandatory
- **Emotion cache key** — `key: "request"` in `createCache`. Never `"css"` or any other value.
- **API calls** — `apiContext.request.post<ResultDataResponse<T>>(url, payload)` only. Never import Axios directly.
- **Zustand store** — lives exclusively in `src/features/registration/store/`. Never import from Hub or `@lis/lis-hub-lib` stores.
- **Tab/panel visibility** — `style={{ display: isVisible ? '' : 'none' }}`. Never conditional unmount `{isVisible && <Panel />}`.
- **Message box** — `(cms.api.ui as any).MessageBoxApi.open({...})`. Never instantiate `<MessageBoxProvider>`.
- **Dictionary access** — `apiContext.dictionary.get()` or `apiContext.dictionary.get('VoKey')`. Never call dictionary API endpoints directly.
- **No hardcoded env values** — URLs, lab numbers, hospital codes must come from config or `apiContext`.

### TypeScript
- Strict mode throughout. All exported functions must have explicit return types.
- Props interfaces defined as `interface`, not `type`, unless union/intersection needed.

---

## Step 5 — File output

Generate all of the following that are relevant to the task:

```
src/features/registration/
├── components/
│   ├── {ComponentName}.tsx           ← main component
│   └── {ComponentName}.test.tsx      ← test scaffold (see test-scaffold skill)
├── hooks/
│   └── use{ComponentName}.ts         ← if the component needs local state/effects
├── types/
│   └── {componentName}.types.ts      ← if new types are introduced
└── index.ts                          ← add barrel export for new component
```

For Phase 0 tasks, output goes to `src/cms-plugin/` instead.

### Component file structure

```tsx
// src/features/registration/components/{ComponentName}.tsx
import React from 'react';
// MUI imports
// @lis/lis-hub-lib imports (if applicable)
// Local imports

interface {ComponentName}Props {
  // explicit prop types
}

export const {ComponentName}: React.FC<{ComponentName}Props> = ({ ... }) => {
  // Phase 2: structure only — no business logic
  return (
    // JSX
  );
};
```

---

## Step 6 — After generating

1. Run `npm run type-check` in the terminal. Report and fix any TypeScript errors before finishing.
2. Update `src/features/registration/index.ts` with the new barrel export.
3. State which tasks this implementation unlocks next.
