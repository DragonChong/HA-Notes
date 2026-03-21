I want to scaffold the folder structure for `lis-request-app` — a new **Webpack 5 Module Federation Level-2 Remote MFE** (not a standalone app) built with CRACO + React 18 + TypeScript. Apply the feature-based structure from the react-project-structure skill, adapted for these constraints:

**MFE-specific constraints:**

- This is NOT a routed SPA. There are no pages or layouts in the traditional sense. The entry point is a single exposed component: `./RegistrationPage` (mounted by the parent `lis-crs-common-app` into a Shell-managed DOM node).
- There is no local routing — the Shell owns all routing. Skip `pages/` and `layouts/`.
- There is no local Axios instance — all API calls go via `apiContext.request.post<ResultDataResponse<T>>()`. Skip `lib/` (no Axios setup needed). Skip `services/` at the top level — API calls live inside features.
- There is no global auth/session state — that all comes through `apiContext`. Skip `stores/` at the top level.
- The MFE entry point is `src/cms-plugin/` — this is the Module Federation plugin harness (not a feature). It contains: `view-handler.tsx` (renderReactComponent with `createCache({ key: "request" })`), `ContextProvider.tsx` (provides `apiContext` via React Context), and `index.ts` (exposes `./RegistrationPage`).

**Features to scaffold (domain-driven):**

- `registration` — the main screen (Registration Keys, Patient Demographics, Request Info, Test, Action Buttons panels). This is the primary feature and will have sub-components for each panel.
- No other features for now — future screens (amend, enquiry) will be added as separate features later.

**Shared components (used across future features, so they go in top-level `components/`):**

- These wrap `@lis/lis-hub-lib` shared library components for use within this MFE:
    - `HkidInputWrapper` → wraps `HkidInput`
    - `EncounterNumberWrapper` → wraps `EncounterNumber`
    - `RequestNumberWrapper` → wraps `RequestNumberInput`
    - `LocationInputWrapper` → wraps `LisLocationBox`
    - `DoctorInputWrapper` → wraps `LisDoctorSingleBox`
    - `DateTimeInput` → custom (no shared lib equivalent)
    - `TestCodeInput` → custom (no shared lib equivalent)

**Global types (top-level `types/`):**

- `ResultDataResponse<T>` — standard API response envelope
- `LisApiContext` — type re-export or augmentation of the apiContext interface
- `RegistrationPacking` — the save payload root type (and its nested types: `PatientIdentity`, `EncounterIdentity`, `RequestProfileDetails`, etc.)

**Global utils (top-level `utils/`):**

- `formatDate.ts`, `hkidCheckDigit.ts`, `retainHelpers.ts`

**Config (`config/`):**

- `env.ts` — `__PLACEHOLDER_*__` token accessors (runtime env injection pattern)
- `constants.ts` — screen-level constants (panel IDs, keyboard shortcut keys)

**Output requested:**

1. Full annotated folder tree for `src/` adapted to these constraints
2. Note any standard skill folders that are dropped and why (e.g., `pages/`, `lib/`)
3. Note any MFE-specific folders added beyond the standard skill (e.g., `cms-plugin/`)
4. Suggested barrel export strategy for `features/registration/index.ts`
5. Where the Zustand store for Registration local state lives (inside `features/registration/store/` — NOT top-level `stores/`)
---
## Revised recommendation per component

| Component            | Wrapper?  | Reason                                                                                                                                                                         |
| -------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `HkidInput`          | **Maybe** | Only if you want to pre-bind `hkidMergeEnabled` from `apiContext` lab options and standardise the merge callback                                                               |
| `EncounterNumber`    | **No**    | Simple enough; use directly with `onModifiedAndBlur` wired in the panel                                                                                                        |
| `RequestNumberInput` | **No**    | The ref API (`verifyAndFormatRequestNo`) is called procedurally at save time — a wrapper doesn't simplify this                                                                 |
| `LisLocationBox`     | **Yes**   | Used in 4 places with shared ref pattern; a typed variant prop (`"patient" \| "request" \| "report" \| "copy"`) that sets the right disabled/display props is genuinely useful |
| `LisDoctorSingleBox` | **Maybe** | Only if you need to pre-bind hospital context or normalise the `getDataSource()` caveat (it doesn't update on programmatic `setDoctor()`)                                      |
| `DateTimeInput`      | **N/A**   | Custom build — this IS the component                                                                                                                                           |
| `TestCodeInput`      | **N/A**   | Custom build — this IS the component                                                                                                                                           |
