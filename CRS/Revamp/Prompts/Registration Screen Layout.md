Task: Phase 2 — Registration Screen Layout (Tasks 2.1–2.11)
Repo: lis-request-app
Epic: LISP-21

I am providing the legacy Adobe Flex screen layout and source code for the Manual Registration
screen. Analyse the layout and implement the React shell for RegistrationPage, covering all
Phase 2 tasks. Do NOT implement behaviour yet (that is Phase 3–4). This task is structural
only: correct panel arrangement, correct fields in correct positions, correct component
wiring to shared library components from Phase 1.

---

## Screen Structure (from knowledge base)

The screen has this vertical layout:

  ┌─────────────────────────────────────────────────────┐
  │  Registration Keys Panel                            │  ← Enc No / Req No (read-only) / HKID
  ├────────────────────────┬────────────────────────────┤
  │  Patient Demographics  │  (col 2)                   │
  │  Name                  │  Sex                       │
  │  Chinese Name          │  DOB + "Exact DOB" chk     │
  │  Loc (Hosp/Spec/Sub)   │  Age + unit dropdown       │
  │  Ward                  │  Race                      │
  │  Bed                   │                            │
  │  Admitted (DateTime)   │                            │
  ├────────────────────────┼────────────────────────────┤
  │  Request Info (col 1)  │  Request Info (col 2)      │
  │  Clin Dtl              │  Category                  │
  │  Req Dr (Hosp+Dr)      │  Confidential              │
  │  Req Loc (H/Sp/Sub)    │  Private                   │
  │  Rpt Loc (H/Sp/Sub)    │  Bill                      │
  │  Copy (H/Sp/Sub)       │  Urgency                   │
  │  Reference             │  Collect (DT + exact chk)  │
  │  Comment               │  Arrived (DT + exact chk)  │
  │                        │  Request (DT + exact chk)  │
  ├─────────────────────────────────────────────────────┤
  │  Lab-Specific Panel (ANAT | BBNK | MICR VIRO)       │  ← conditionally rendered
  ├─────────────────────────────────────────────────────┤
  │  Test Panel                                         │
  │  [Add Test input]  [test list / grid]               │
  ├──────────────────────────────┬──────────────────────┤
  │  Retain checkboxes           │  [Save] [Clear] [Exit]│  ← Task 2.5 + 2.6
  │  (from RetainMasterVo)       │  + optional [Sendout] │
  └──────────────────────────────┴──────────────────────┘

---

## Architecture Rules to Follow

1. This component lives in `lis-request-app` — a Level-2 MFE Remote.
2. All state and API access via `apiContext` from `LisApiContext` (React context).
   Never import Hub Zustand stores directly.
3. Emotion cache key for this app: `"request"` (already set at renderReactComponent root —
   no need to re-wrap here).
4. Use MUI v5 with `lisBaseThemeLight` from `@lis/lis-hub-lib` (already provided by the
   ThemeProvider at app root — do not re-wrap).
5. Views are NEVER unmounted — tab switching uses `display:none`. Design layout to
   tolerate this (no mount-only side effects that won't survive hide/show).
6. Keyboard shortcuts: Ctrl+Shift+E (focus Enc No), Ctrl+Shift+H (focus HKID),
   Ctrl+Shift+A (focus Add Test), Ctrl+Shift+X (Exit). Attach at RegistrationPage level.

---

## Shared Components Available (already built in Phase 1)

Use these — do not re-implement them:

| Field                                    | Component          | Source            |
| ---------------------------------------- | ------------------ | ----------------- |
| HKID input                               | HkidInput          | @lis/lis-hub-lib  |
| Encounter No.                            | EncounterNumber    | @lis/lis-hub-lib  |
| Request No. (read-only)                  | RequestNumberInput | @lis/lis-hub-lib  |
| Patient Location                         | LisLocationBox     | @lis/lis-hub-lib  |
| Req Loc / Rpt Loc / Copy                 | LisLocationBox     | @lis/lis-hub-lib  |
| Doctor                                   | LisDoctorSingleBox | @lis/lis-hub-lib  |
| Urgency                                  | KeywordDropdown    | @lis/lis-hub-lib  |
| Category / Confidential / Private / Bill | ConstantDropdown   | @lis/lis-hub-lib  |
| Test Code input                          | TestCodeInput      | local (Phase 1.6) |
| DateTime + exact checkbox                | DateTimeInput      | local (Phase 1.7) |

---

## Dictionary Access (layout-time only)

For the Retain checkboxes panel, read `RetainMasterVo` from the dictionary synchronously
at mount time — this VO is an init-time dictionary:

  const dict = apiContext.dictionary.get();
  const retainConfig: RetainMasterVo[] = dict['RetainMasterVo'] ?? [];

Render one checkbox per retain item, keyed on `retainConfig[i].retainCode`.
Make checkbox state local for now (Phase 4 wires retain persistence behaviour).

---

## Optional / Conditional Panels (Task 2.7–2.9)

Scaffold these as visible=false placeholders for now:
- No. of Label Panel (Task 2.7) — `showLabelCount` prop, default false
- Print Tube Label Panel (Task 2.8) — `showPrintLabel` prop, default false
- Sendout Button (Task 2.9) — `showSendout` prop, default false

These will be driven by lab option checks wired in Phase 3.

---

## Font Size Support (Task 2.10)

Accept a `fontSize: 'normal' | 'large'` prop on RegistrationPage.
Pass it as a MUI `sx` override or CSS variable down to panels.
Default: `'normal'`.

---

## Urgency Colour (Task 2.11)

The screen background or a visible highlight area changes colour based on urgency.
Scaffold a `urgencyColor` state variable (string | undefined).
Apply it as a background highlight on the Request Info panel (or a coloured border/strip).
The actual colour lookup from KeywordVo will be wired in Phase 4.

---

## What to Produce

1. `RegistrationPage.tsx` — top-level screen component. Accepts:
   - `apiContext: LisApiContext`
   - `fontSize?: 'normal' | 'large'`
   - `showLabelCount?: boolean`
   - `showPrintLabel?: boolean`
   - `showSendout?: boolean`

2. `RegistrationKeysPanel.tsx` — Enc No / Req No (read-only) / HKID, keyboard shortcut
   listeners, Ctrl+Shift+E/H wired to refs.

3. `PatientDemographicsPanel.tsx` — two-column MUI Grid layout as per field table above.

4. `RequestInfoPanel.tsx` — two-column MUI Grid layout as per field table above.
   Urgency field passes `urgencyColor` setter up via callback prop.

5. `TestPanel.tsx` — TestCodeInput + placeholder test list (empty MUI Table or Box for now).

6. `RetainPanel.tsx` — renders checkboxes from `RetainMasterVo`; accepts `retainConfig`
   as prop.

7. `ActionButtonsPanel.tsx` — Save (disabled), Clear, Exit buttons + optional Sendout.

8. `useRegistrationState.ts` — top-level state hook. For Phase 2, just holds:
   - `urgencyColor: string | undefined`
   - `retainChecked: Record<string, boolean>`
   - `fontSize: 'normal' | 'large'`
   No behaviour logic yet.

---

## Legacy Source Reference

Analyse the legacy source to verify:
- Exact field order within each column
- Any non-obvious field groupings or visual separators
- Panel visibility flags already present in legacy code
- Any fields present in the legacy source but NOT listed above (flag these as gaps)
- The legacy keyboard shortcut implementation (translate to React useEffect/useRef pattern)

Do not copy ActionScript logic. Extract layout structure only.

---

## Acceptance Criteria

- All 11 Phase 2 tasks are covered in the produced files.
- No placeholder `TODO` comments for layout items — the structure must be complete.
- All shared library components are imported from `@lis/lis-hub-lib` (not re-implemented).
- No direct Axios imports; no direct Hub store imports.
- All fields are rendered disabled (Phase 3 will wire enablement).
- TypeScript strict mode; no `any` except where required by apiContext bridge types.
- Each file is self-contained and importable without circular deps.