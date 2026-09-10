---
name: phase-review
description: Audit completed Registration screen work in lis-request-app against CRS Revamp architecture rules. Use this after completing a batch of tasks or a full phase to catch violations before they compound. Reports critical violations and warnings with file locations and fix suggestions.
argument-hint: "[phase number or 'all'] [optional: specific folder to scan]"
---

# Phase Architecture Audit

You are auditing recently completed work in `lis-request-app` against the CRS Revamp architecture rules. Scan `src/features/registration/` (or the path specified) systematically.

---

## Critical violations — flag immediately, block progress

Search the codebase for each of these patterns:

### V1 — Direct Axios import
**Find:** any `import axios` or `import { ... } from 'axios'` in `src/features/` or `src/cms-plugin/`
**Rule:** All HTTP calls must go through `apiContext.request.post<ResultDataResponse<T>>()`
**Fix:** Replace with `const result = await apiContext.request.post<ResultDataResponse<T>>(url, payload)`

### V2 — Hub Zustand store import
**Find:** any import containing `lis-hub-lib/store`, `useHubStore`, `useAuthStore`, `useSessionStore`, `useDictionaryStore`, `useGlobalStore` in remote app files
**Rule:** Plugin API boundary — remote MFEs access shell state ONLY via `apiContext`
**Fix:** Replace with the corresponding `apiContext.*` accessor

### V3 — Wrong Emotion cache key
**Find:** any `createCache(` where the `key` property is not `"request"`
**Rule:** `lis-request-app` must use `key: "request"` to prevent CSS class collisions
**Fix:** `const cache = createCache({ key: 'request' })`

### V4 — Conditional unmount of panels or tabs
**Find:** patterns like `{isVisible && <Panel />}` or `{condition && <TestPanel />}` for top-level screen panels
**Rule:** Views are never unmounted — use `style={{ display: isVisible ? '' : 'none' }}`
**Fix:** Replace with `<Panel style={{ display: isVisible ? '' : 'none' }} />`

### V5 — Direct dictionary endpoint call
**Find:** any `apiContext.request.post(` where the URL contains `/dictionary`, `/selectDictionaries`, or similar
**Rule:** Dictionary data is pre-loaded by the Shell — access via `apiContext.dictionary.get()`
**Fix:** `const dict = apiContext.dictionary.get(); const data = dict['RetainMasterVo'];`

### V6 — MessageBoxProvider instantiation
**Find:** any `<MessageBoxProvider` in component files
**Rule:** Plugin apps do not instantiate their own MessageBoxProvider
**Fix:** Use `(cms.api.ui as any).MessageBoxApi.open({ code, tag, params })`

### V7 — Hardcoded environment values
**Find:** hardcoded URLs (e.g. `http://localhost`, `lis-chongkw`), lab numbers (e.g. `labNo: 9`), or hospital codes in source files
**Rule:** All env-specific values come from config or apiContext
**Fix:** Use `apiContext.session.getHospital()`, `apiContext.global.*`, or env placeholder tokens

### V8 — Re-implemented shared library component
**Find:** custom implementations of HKID input, encounter number input, request number input, location composite, doctor lookup, keyword dropdown, constant dropdown, or patient banner
**Rule:** These all exist in `@lis/lis-hub-lib` and must be imported, not rebuilt
**Fix:** Replace with the appropriate `@lis/lis-hub-lib` component

---

## Warnings — flag with severity, do not block

### W1 — Missing TypeScript return type
Any exported function without an explicit return type annotation.

### W2 — Missing test file
Any component in `src/features/registration/components/` without a corresponding `.test.tsx` file.

### W3 — useEffect with missing dependencies
Any `useEffect` call where the dependency array is missing or visibly incomplete.

### W4 — TODO blocker comments unresolved
Any `// TODO [BLOCKER D.x]` comment — list them with their blocker ID so they can be tracked.

### W5 — Phase constraint violated
Any Phase 2 component file containing API calls, event handlers beyond structural wiring, or business logic. Phase 2 = layout/scaffolding only.

---

## Output format

For each finding:

```
[CRITICAL | WARNING] {violation code} — {ComponentName or file}
File: src/features/registration/...
Issue: <what was found>
Fix: <specific corrected code or approach>
```

End with:

```
Summary
-------
Critical: N  Warning: N
Unresolved blockers: D.x, D.y
Recommendation: GO / NO-GO for next phase
```
