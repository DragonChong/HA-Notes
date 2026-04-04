---
title: Path-Specific Instructions
tags:
  - tooling
  - copilot
  - crs-revamp
created: 2026-04-04
updated: 2026-04-04
status: active
---

# Path-Specific Instructions

Path-specific instruction files (`.instructions.md`) activate automatically when Copilot works on files matching a glob pattern. They live in `.github/instructions/` within each repo and complement the always-on [[Copilot Workflow Optimization#Layer 2 — Per-Repo Custom Instructions|`copilot-instructions.md`]].

---

## Files to create in `lis-request-app`

### `.github/instructions/features-registration.instructions.md`

```markdown
---
applyTo: "src/features/registration/**"
---
- Zustand store lives in store/ within this feature — never import from Hub or @lis/lis-hub-lib stores
- API calls: apiContext.request.post<ResultDataResponse<T>>() only — no direct Axios imports
- Tab/panel visibility: style={{ display: isVisible ? '' : 'none' }} — never conditional unmount
- Dictionary access: apiContext.dictionary.get() — never call dictionary API endpoints directly
- Use @lis/lis-hub-lib components: HkidInput, EncounterNumber, LisLocationBox, LisDoctorSingleBox, KeywordDropdown, ConstantDropdown, PatientPanel — never re-implement these
- Tab sequence is driven by ObjectAttributeVo from apiContext.dictionary.get('ObjectAttributeVo'), not hardcoded
- Phase 2 scope: layout and structural scaffolding only — no event handlers, API calls, or business logic
```

### `.github/instructions/cms-plugin.instructions.md`

```markdown
---
applyTo: "src/cms-plugin/**"
---
- This is the MFE entry point — view-handler.tsx, ContextProvider.tsx, index.ts
- Emotion cache key must be "request": const cache = createCache({ key: 'request' })
- Component root order: CacheProvider > StyledEngineProvider injectFirst > ThemeProvider > ContextProvider
- No direct Hub Zustand store imports
- apiContext is received via activate(cms) and passed through ContextProvider — never imported directly
```

### `.github/instructions/testing.instructions.md`

```markdown
---
applyTo: "**/*.test.tsx"
---
- Every Registration component test file must include the display:none visibility test (mandatory architecture rule verification)
- Use renderWithContext() wrapper with RegistrationContext.Provider and mockApiContext
- mockApiContext lives at src/test-utils/mockApiContext.ts — create if absent
- Never use the real apiContext in unit tests
- Test groups: rendering, props, user interactions (in that order)
```

---

## Files to create in `lis-hub-svc`

### `.github/instructions/controllers.instructions.md`

```markdown
---
applyTo: "src/main/java/**/controller/**/*.java"
---
- All endpoints use POST — no GET for data mutations
- Response envelope is always ResultDataResponse<T>
- lis-hub-svc is fully JWT-secured via ha-spring-boot-starter-security
- Do not suggest removing or bypassing security annotations
- Multi-DB routing uses DataSourceContextHolder (ThreadLocal) — incompatible with reactive/async code
- Do not suggest WebFlux or reactive patterns
```

---

## Related Notes

- [[Copilot Workflow Optimization]]
- [[Agent Skills Reference]]
