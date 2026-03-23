### Foundational decisions that apply to every task in this phase

Before writing any panel component, establish these three building blocks first. Every panel depends on them.

**2.0.A — `RegistrationThemeProvider`** The styled `ThemeProvider` wrapper described in the previous conversation. Wraps the entire screen. Injects `buildRegistrationTheme(base, fontSize)` with `MuiTextField` / `MuiAutocomplete` `defaultProps: { size: 'small' }` so every field in every panel is compact without explicit `size` props.

**2.0.B — `FontSizeContext`** `'normal' | 'large'` context driven from the `fontSizeVariant` prop passed into `renderReactComponent` at plugin activation. Consumed by panels that need to conditionally size container padding or panel heading text. The theme overrides already handle field-level font size — this context is for structural sizing decisions.

**2.0.C — `RegistrationScreenState` type and `useRegistrationState` hook** Phase 2 is layout only, but panel enable/disable states (Phase 3) need a home. Define the state shape now so panel components accept `disabled` props from the start. Avoids a round of refactoring when Phase 3 begins.

typescript

```typescript
type ScreenMode = 'initial' | 'patient-ready' | 'request-ready';

interface RegistrationScreenState {
  screenMode: ScreenMode;
  fontSizeVariant: 'normal' | 'large';
  // expanded in Phase 3
}
```

---

### Task-by-task breakdown

#### Task 2.1 — Registration Keys Panel

**Component:** `RegistrationKeysPanel`

**Layout:** Single horizontal row — `Enc No.` | `Req No.` (read-only) | `HKID`. No two-column split; this panel is always a compact top strip.

**Fields:**

|Field|Component|Notes|
|---|---|---|
|Enc No.|`EncounterNumber` from `@lis/lis-hub-lib`|Editable on open; locks after patient-ready|
|Req No.|`RequestNumberInput` from `@lis/lis-hub-lib`|Non-editable on open; editable in patient-ready state|
|HKID|`HkidInput` from `@lis/lis-hub-lib`|Editable on open; locks after patient-ready|

**Keyboard shortcuts** (all handled at panel level via `useEffect` + `keydown`):

|Shortcut|Action|
|---|---|
|`Ctrl+Shift+E`|Focus Enc No.|
|`Ctrl+Shift+H`|Focus HKID|
|`Ctrl+Shift+A`|Trigger Clear (fires message 648)|
|`Ctrl+Shift+X`|Trigger Exit|

**Styling notes:**

- Panel background: `theme.palette.background.paper` — panel header label "Registration Keys" using `FontSizeContext` heading size
- Initial focus: driven by `DEFAULT_TAB_ORDER_HKID` lab option from `ObjectAttributeVo` — read at mount, set `autoFocus` on the correct field
- All three shared-lib components accept `size="small"` via theme `defaultProps` — no explicit prop needed

**Phase 3 dependency:** Accept `disabled` prop per field. In Phase 2, wire it as static — all fields enabled at render. Phase 3 will connect it to `screenMode`.

---

#### Task 2.2 — Patient Demographics Panel

**Component:** `PatientDemographicsPanel`

**Layout:** Two-column `Grid` — left column and right column, with the `LisLocationBox` spanning full width where it logically belongs.

Left column fields:

|Field|Component|
|---|---|
|Name|`TextField` (multiline=false)|
|Chinese Name|`TextField`|
|Location (Hospital / Specialty / Ward)|`LisLocationBox` from `@lis/lis-hub-lib`|
|Bed|`TextField`|
|Admitted|`DateTimeInput` (Task 1.7 custom component)|
|MRN|`TextField`|

Right column fields:

|Field|Component|
|---|---|
|Sex|`KeywordDropdown` — group: `SEX`|
|Pay Code|`TextField` disabled (always)|
|DOB|`DateInput` + "Exact" `Checkbox`|
|Age|`TextField` (numeric) + `KeywordDropdown` (group: `AGE_UNIT`) side-by-side|
|Category|`KeywordDropdown` — group: `CATEGORY`|
|Race|`ConstantDropdown` — group: `RACE` (per Blocker D.2 — confirm constant group name)|

**Styling notes:**

- Entire panel wrapped in a `fieldset`-style `Box` with `border`, `borderRadius`, and a `legend` title — rendered at `fontSize` from `FontSizeContext`
- `LisLocationBox` label row: Hospital label is **bold** per the screenshot (active Hospital field has a black border + bold label)
- DOB + "Exact" checkbox: horizontal `Stack` — checkbox label font-size matches field font-size via `FormControlLabel sx`
- Age + Age Unit: horizontal `Stack`, Age field ~60px wide, dropdown ~90px wide

**Blocker:** D.2 — confirm `AGE_UNIT` and `RACE` dictionary group codes before wiring dropdowns.

---

#### Task 2.3 — Request Information Panel

**Component:** `RequestInfoPanel`

**Layout:** Two-column `Grid`. Left column is form fields; right column is dropdowns and datetime fields. The `LisLocationBox` rows each span the full left column width.

Left column fields:

|Field|Component|
|---|---|
|Clin Dtl|`TextField` multiline, min 2 rows|
|Req Dr.|`LisDoctorSingleBox` from `@lis/lis-hub-lib` + "Create New Doctor" `Button`|
|Req Loc|`LisLocationBox`|
|Rpt Loc|`LisLocationBox` (Specialty sub-field always disabled)|
|Copy|`LisLocationBox` (Specialty sub-field always disabled) + "Add Extra Copy" `IconButton`|
|Reference|`TextField`|
|Comment|`TextField`|

Right column fields:

|Field|Component|
|---|---|
|Category|`KeywordDropdown` — group: `CATEGORY`|
|Confidential|`KeywordDropdown` — group: `CONFIDENTIAL`|
|Private|`KeywordDropdown` — group: `LAB_ONLY`|
|Bill|`KeywordDropdown` — group: `BILL` (confirm D.2)|
|Urgency|`KeywordDropdown` — group: `URGENCY` — **urgency color styling applies here** (Task 2.11)|
|Collect|`DateTimeInput` (Task 1.7) — visibility driven by `DATE_ATTRIBUTE`|
|Arrived|`DateTimeInput` — visibility driven by `DATE_ATTRIBUTE`|
|Request|`DateTimeInput` — visibility driven by `DATE_ATTRIBUTE`|

**Styling notes:**

- Panel border + legend title, same pattern as Demographics panel
- `Rpt Loc` and `Copy` Specialty sub-fields: pass `specialtyDisabled={true}` to `LisLocationBox`
- Req Dr. Doctor Name display: read-only `TextField` placed inline after the doctor code input — not editable, populated reactively when doctor code resolves

**Blocker:** D.2 — confirm `BILL` keyword group code. D.2 also for `CONFIDENTIAL` and `LAB_ONLY` group names.

---

#### Task 2.4 — Test Panel

**Component:** `TestPanel`

**Layout:** Single header row with "Add Test" input, followed by a `DataGrid` or `Table` listing added tests.

|Element|Component|
|---|---|
|Add Test input|Task 1.6 `TestCodeInput` (custom autocomplete from `RegistrableTestVo`)|
|Test list|MUI `Table` — columns: Test Code, Test Name, Lab, actions (remove row)|

**Styling notes:**

- Panel is **invisible** on initial screen open (`display: none` when `screenMode === 'initial'`); becomes visible in `request-ready` state
- Since views are never unmounted, use `visibility` / `display:none` not conditional rendering — consistent with the platform rule
- Table rows: compact row height (`dense` MUI table), font-size from `FontSizeContext`

---

#### Task 2.5 — Retain Panel

**Component:** `RetainPanel`

**Layout:** Compact horizontal strip of `Radio` buttons, conditionally rendered only when `RetainMasterVo` has entries for the current lab.

**Data source:** `RetainMasterVo` from `apiContext.dictionary.get()` — synchronous at mount.

typescript

```typescript
const dict = apiContext.dictionary.get();
const retainGroups: RetainMasterVo[] = dict['RetainMasterVo'] ?? [];
// if empty → render null
```

**Behaviour in Phase 2:** Render the radio buttons with the first group selected by default. The retain logic itself (field restoration on Clear) is Phase 4 Task 4.5.

**Styling notes:**

- `RadioGroup` `row` orientation
- Label font-size from `FontSizeContext`
- Hidden when `retainGroups.length === 0`

---

#### Task 2.6 — Action Buttons Bar

**Component:** `ActionButtonBar`

**Layout:** Right-aligned horizontal `Stack` — Save | Clear | Exit. Retain panel sits to the left of the button group in the same bar.

|Button|Initial state|Shortcut|
|---|---|---|
|Save|Disabled|—|
|Clear|Enabled|`Ctrl+Shift+A`|
|Exit|Enabled|`Ctrl+Shift+X`|

**Styling notes:**

- Save button: `variant="contained"` — greyed via `disabled` prop (not `sx` colour override)
- Clear / Exit: `variant="outlined"`
- Button font-size from `FontSizeContext` via theme `MuiButton` component override — already handled by `buildRegistrationTheme`

---

#### Task 2.7 — No. of Label Panel

**Component:** `NoOfLabelPanel`

**Layout:** Small inline panel — label count `TextField` (numeric), optional label type selector.

**Visibility:** Controlled by lab option (to be confirmed). In Phase 2: render with a `show` boolean prop hardcoded `true`. Phase 3 will wire to the lab option.

---

#### Task 2.8 — Print Tube Label Panel

**Component:** `PrintTubeLabelPanel`

**Layout:** Similar to No. of Label — checkbox or button to trigger tube label printing.

**Visibility:** Workstation-authorised flag from `apiContext.auth`. Same approach as 2.7 — prop-driven, hardcoded visible in Phase 2.

---

#### Task 2.9 — Sendout Button

**Component:** `SendoutButton`

A single `Button` component, conditionally rendered. Lab-option-driven in Phase 3. In Phase 2: render as disabled placeholder, visible.

---

#### Task 2.10 — Screen Font Size

**Not a separate component.** This is the `fontSizeVariant` prop threading described in 2.0.B above.

Concretely, in `lis-crs-common-app`'s `plugin-manifest.module.ts`:

typescript

```typescript
cms.api.ui.onWillDisplayView('crs-registration', (container, params) => {
  // params.menuItemClass determines Normal vs Large
  const fontSizeVariant: FontSizeVariant =
    params?.menuItemClass?.includes('Large') ? 'large' : 'normal';

  const Component = await import('LisRequestApp/RegistrationPage');
  renderReactComponent(container, apiContext, fontSizeVariant);
});
```

The `fontSizeVariant` flows into `buildRegistrationTheme` and `FontSizeContext`. All panels inherit it automatically — no per-panel changes needed.

**Deliverable for this task:** Confirm the `params` shape available in `onWillDisplayView` to read the menu item class. This may need a blocker raised if `params` does not carry it.

---

#### Task 2.11 — Urgency Color

**Not a separate component.** Implemented as an `sx` prop on the `KeywordDropdown` for Urgency inside `RequestInfoPanel`.

typescript

````typescript
const [urgencyAlpha, setUrgencyAlpha] = useState<string | null>(null);

const urgencyBg = urgencyAlpha === '1'
  ? '#FF0000'
  : theme.palette.background.paper;

// On the KeywordDropdown:
getCurrentKeyword={(kw) => setUrgencyAlpha(kw?.alpha1 ?? null)}

// sx on the dropdown's root:
sx={{ '& .MuiInputBase-root': { backgroundColor: urgencyBg } }}
```

The `key_alpha = '1'` rule (Urgent = red, all others = white) is from the knowledge base. This also fires when the system programmatically sets Urgency from a request number urgent-lab prefix — as long as `getCurrentKeyword` is called on programmatic value set, the colour updates automatically.

---

### Screen composition

All panels assemble in `RegistrationPage`:
```
RegistrationPage
├── RegistrationThemeProvider (wraps all)
│   ├── FontSizeContext.Provider
│   │   ├── RegistrationKeysPanel
│   │   ├── PatientDemographicsPanel  (disabled initially)
│   │   ├── RequestInfoPanel          (disabled initially)
│   │   ├── TestPanel                 (hidden initially)
│   │   ├── [LabSpecificPanels]       (Phase 5 slots — render null)
│   │   └── ActionButtonBar
│   │       ├── RetainPanel
│   │       ├── NoOfLabelPanel        (optional)
│   │       ├── PrintTubeLabelPanel   (optional)
│   │       ├── SendoutButton         (optional)
│   │       └── Save / Clear / Exit
```

---

### Task sequence and dependencies
```
2.0.A  RegistrationThemeProvider ──────────────────────────────────────┐
2.0.B  FontSizeContext                                                  │ all panels depend on these
2.0.C  RegistrationScreenState                                          │
       │                                                                │
       ├── 2.10  Font size threading  ──────────────────────────────────┘
       │
       ├── 2.1   Keys Panel           (needs Phase 1: 1.1 HkidInput, 1.2 EncNo, 1.3 ReqNo)
       ├── 2.2   Demographics Panel   (needs Phase 1: 1.4 LisLocationBox, 1.7 DateTime)
       ├── 2.3   Request Info Panel   (needs Phase 1: 1.4, 1.5 Doctor, 1.7 DateTime)
       ├── 2.4   Test Panel           (needs Phase 1: 1.6 TestCodeInput)
       ├── 2.11  Urgency Color        (part of 2.3 — no separate ticket needed)
       ├── 2.5   Retain Panel         (standalone, only needs RetainMasterVo access)
       ├── 2.6   Action Buttons       (standalone)
       ├── 2.7   No. of Label         (standalone placeholder)
       ├── 2.8   Print Tube Label     (standalone placeholder)
       └── 2.9   Sendout Button       (standalone placeholder)
````

Tasks 2.7, 2.8, 2.9 are placeholders in Phase 2 — render the component shells with hardcoded `visible + disabled`. Full wiring is Phase 3.

---

### Open items for Phase 2

| #   | Item                                                                                                                              | Blocks   |
| --- | --------------------------------------------------------------------------------------------------------------------------------- | -------- |
| D.2 | Confirm keyword group codes: `AGE_UNIT`, `RACE` (constant or keyword?), `BILL`, `CONFIDENTIAL`, `LAB_ONLY`                        | 2.2, 2.3 |
| New | Confirm `onWillDisplayView` params shape — does it carry `menuItemClass` to determine font size variant?                          | 2.10     |
| New | Confirm `DATE_ATTRIBUTE` option parsing — which positional flags control visibility of Collect / Arrive / Request datetime fields | 2.3      |
