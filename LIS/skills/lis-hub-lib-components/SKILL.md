---
name: lis-hub-lib-components
description: >
  Usage guide for all shared UI components from @lis/lis-hub-lib used in LIS CRS plugin apps.
  Use this skill whenever the user is working with or asking about LisKeyword, LisConstant,
  HkidInput, EncounterNumber, RequestNumberInput, LisLocationBox, LisDoctorSingleBox,
  LisDoctorBox, LisDataTable, SiteComboBox, PatientPanel, or the LIS MUI theme (lisBaseTheme).
  Triggers include: adding a dropdown for urgency/blood group/sendout/any keyword or constant,
  a site/specimen-site selector, a data/result table, wiring up a patient HKID or encounter
  number field, implementing request number entry with validation, capturing a clinical location
  (hospital/ward), a doctor lookup (single-field or hospital+doctor two-field), rendering the
  patient info banner at the top of a screen, or applying the shared LIS MUI theme. Also
  triggers when the user asks how to get the selected value from any of these components, how
  to pre-fill them programmatically, how to disable/hide individual sub-fields, or how to
  prevent a table from not re-rendering.
---

# lis-hub-lib Common Components

## Core Principle

All shared clinical UI components come from `@lis/lis-hub-lib`. They are pre-wired to the LIS
dictionary and location data loaded at startup by `lis-hub-app`. Your job is to:

1. Pass `dataSource` (the dictionary object from `apiContext.dictionary.get()`) into dropdown
   and display components — they do **not** self-fetch.
2. Wire callbacks or refs to read selected values back out — depends on the component (see table
   below).
3. Never re-implement lookup, validation, or formatting logic that these components already
   provide (check digit, HKID merge, request number format expansion, location cascade).

---

## Quick Reference

| Component | Import Name | Value Access | Requires `dataSource` |
|---|---|---|:---:|
| Keyword Dropdown | `LisKeyword` | `getCurrentKeyword` callback (controlled `value`) | Yes |
| Constant Dropdown | `LisConstant` | `getCurrentConstant` callback (controlled `value`) | Yes |
| HKID Input | `HkidInput` | `onChange` + `ref.getValue()` | No |
| Encounter Number | `EncounterNumber` | `onChange` + `onModifiedAndBlur` | No |
| Request Number Input | `RequestNumberInput` | `ref.verifyAndFormatRequestNo()` → `ref.getRequestNo()` | No |
| Location Input | `LisLocationBox` | `ref.getDataSource()` / individual getters | No* |
| Doctor Input (Single) | `LisDoctorSingleBox` | `ref.getDoctor()` + `ref.getDataSource()` | No |
| Doctor Input (with Hospital) | `LisDoctorBox` | `ref.getDoctor()` + `ref.gethospitalValue()` + `ref.getDataSource()` | No |
| Data Table | `LisDataTable` | `onRowClick` / `onRowDoubleClick` callbacks | No |
| Site Combo Box | `SiteComboBox` | `onChange` callback (controlled `value`) | No** |
| Patient Panel | `PatientPanel` | read-only display | Yes |
| Masked Text Input | `MaskedTextInput` | ⚠ Not yet implemented | — |

> \* `LisLocationBox` does not need `dataSource` for its own lookup, but `PatientPanel` does to
> decode Chinese names and location labels.
>
> \*\* `SiteComboBox` self-fetches from `window.$lisHubApp` dictionaries. Only active for APS (lab 5)
> and CRS (lab 9) — renders empty for all other labs.

All components import from `@lis/lis-hub-lib`.

---

## Dropdown Components

### Keyword Dropdown (`LisKeyword`)

Searchable single-select populated from the keyword dictionary. Shows keyword `description` to
the user; the full keyword record comes back through the callback.

```tsx
const [urgency, setUrgency] = useState<any>(null);

<LisKeyword
  dataSource={dictionary}        // from apiContext.dictionary.get([...]) or DictionaryContext
  group="URGENCY"
  labNo={labNo}                  // null for lab-independent (global) keywords
  value={urgency}
  getCurrentKeyword={setUrgency}
  popperWidth="300px"            // optional: override popup width
  disabled={isReadOnly}
/>
```

**Reading for submission:** `urgency?.enterCode` for the code, `urgency?.description` for display.

**`labNo` rules:**
- `null` → all active keywords in the group regardless of lab
- `7` or `8` → recursive group expansion (sub-group forwarding via `alpha2`)
- Any other number → must match both `group` and `labNo` exactly

**When `group` / `labNo` change:** component reloads options automatically but does **not** clear
`value` — reset it yourself if the previous selection is no longer valid.

---

### Constant Dropdown (`LisConstant`)

For coded constants organised by group (e.g. blood group `ABO`, sendout units
`SENDOUT_REQ_UNIT`). Two-column table dropdown (Code + Description). Input shows the constant's
short code (`constAlpha`).

```tsx
const [bloodGroup, setBloodGroup] = useState<any>(null);

<LisConstant
  dataSource={dictionary}
  group="ABO"
  format={labSiteCode}           // optional; only entries matching format OR constFormat='0'
  value={bloodGroup}
  getCurrentConstant={setBloodGroup}
  width="300px"
  popperWidth="400px"
/>
```

**`format` prop:** when provided, entries where `constFormat === format` **or**
`constFormat === '0'` (universal) are shown. Omit to show all entries in the group.

---

## Input Components

### HKID Input (`HkidInput`)

Auto-uppercases input (12-char max), validates check digit on blur/Enter, and optionally runs
a PAS merge check (chasing linked/changed identities through the amendment log).

```tsx
const hkidRef = useRef<any>(null);

<HkidInput
  ref={hkidRef}
  label="HKID"
  onChange={setHkidValue}          // fired on each keystroke with uppercase value
  autoVerifyCheckDigit={true}      // default; set false to skip check digit
  hkidMergeEnabled={true}          // default; set false on screens that should not merge-check
  hkidMergeForceCheckEnabled={false} // set true to force merge regardless of lab option
/>
```

**Reading the value:** `hkidRef.current.getValue()`. Use `setValue(val)` to set
programmatically (also triggers check digit validation immediately).

**Ref methods:** `getValue()`, `setValue(val)`, `focus()`.

**Internal messages:**
- `2643` — invalid check digit
- `2155` — HKID linked/changed; user prompted Yes (follow chain) / No (keep entered)

**External error state:** set `customError={true}` and pass `error` + `helperText` props to
suppress the component's own inline validation in favour of your form's error display.

---

### Encounter Number Input (`EncounterNumber`)

15-char max, auto-uppercase. Key behaviour: `onModifiedAndBlur` fires **only** when the value
actually changed since the last event — this prevents redundant server calls when the user
tabs through the field without editing.

```tsx
<EncounterNumber
  value={encounterNo}
  onChange={setEncounterNo}
  onModifiedAndBlur={async () => {
    // Fires on blur OR Enter, but only when the value changed
    const result = await checkHkidOfEncounterNo(
      encounterNo, hkid, hospitalCode, serviceParam
    );
    if (result?.error) { /* handle cross-check failure */ }
  }}
  onBlur={() => { /* pure focus-loss; use for field-navigation logic */ }}
  label="Encounter No"
/>
```

**Cross-check utility:** import `checkHkidOfEncounterNo` from `@lis/lis-hub-lib`. Verifies
the encounter belongs to the patient whose HKID is already on screen. Uses
`skipErrorDialog: true` — you handle the error response.

---

### Request Number Input (`RequestNumberInput`)

Auto-formats and server-validates a request number. The parent drives verification explicitly —
the component does **not** self-validate on blur. Call `verifyAndFormatRequestNo()` via ref,
typically on Enter.

```tsx
const reqNoRef = useRef<any>(null);

<RequestNumberInput
  ref={reqNoRef}
  value={requestNo}
  onChange={setRequestNo}
  handleKeyDown={(e) => { if (e.key === 'Enter') handleVerify(); }}
  popupMessageOnError={true}     // default; set false for silent validation
  isCrossLabReq={false}          // set true for cross-lab retrieval
/>

const handleVerify = async () => {
  const ok = await reqNoRef.current.verifyAndFormatRequestNo(requestNo);
  if (ok) {
    loadRequest(reqNoRef.current.getRequestNo()); // fully formatted number
  }
  // On failure: component already showed message and returned focus to field
};
```

**Ref methods:** `verifyAndFormatRequestNo(input)` → `Promise<boolean>`,
`setRequestNo(val)`, `getRequestNo()`, `setcurrentRequestLab(labNo)`, `getErrorCode()`.

**Error codes returned by `getErrorCode()`:** `774` invalid format, `885` bad check digit,
`1522` archived request, `2772` unrecognised lab prefix.

**Empty field:** treated as valid — resolves `true` without calling the server. Supports forms
where request number is optional.

---

### Masked Text Input (`MaskedTextInput`)

> **⚠ Not yet implemented.** Exported from `@lis/lis-hub-lib` but renders no functional UI.
> Do not use in production screens.

---

## Composite Components

### Location Input (`LisLocationBox`)

Three cascading fields: Hospital → Specialty → Location. Selecting a hospital filters the
other two; selecting a location back-fills hospital and specialty. Access values **only via
ref** — there are no onChange callbacks.

```tsx
const locationRef = useRef<any>(null);

<LisLocationBox
  ref={locationRef}
  hospitalDisplay={true}            // show Hospital field (default: false = hidden)
  specialtyDisplay={false}          // hide Specialty
  locationDisplay={true}            // show Location field
  hospitalDisabled={true}           // lock Hospital (e.g. pre-filled from session)
  inDefaultHospital={sessionHosp}   // pre-filter all dropdowns to this hospital on mount
  width={200}                       // input width in px (default 200)
  popperWidth={700}                 // dropdown popup width in px (default 700)
/>

// Reading values for submission:
const dataSource = locationRef.current.getDataSource(); // LocationDictionaryVo | null
const hospital  = locationRef.current.gethospitalValue();  // note: lowercase 'h'
const specialty = locationRef.current.getspecialtyValue(); // note: lowercase 's'
const location  = locationRef.current.getlocationValue();  // note: lowercase 'l'
```

**`getDataSource()` returns `null`** when either Hospital or Location is empty. Specialty is
optional — the component does not require it for `getDataSource()` to return a result.

**Programmatic pre-fill on load:** `setHospital(val)`, `setSpecialty(val)`, `setLocation(val)`.

**Error message `1493`** fires when the user types an invalid code and blurs — the invalid
field is cleared automatically.

---

### Doctor Input Single (`LisDoctorSingleBox`)

Single-field doctor lookup without hospital filtering. Searches by code or name in real time.

```tsx
const doctorRef = useRef<any>(null);

<LisDoctorSingleBox
  ref={doctorRef}
  label="Requesting Doctor"
  width={200}
  popperWidth={700}
  onDoctorChange={(codeOrNull) => {
    // Fires on every keystroke; null when field is cleared
    setDoctorCode(codeOrNull);
  }}
/>

// Reading for submission:
const code   = doctorRef.current.getDoctor();       // raw input text (always current)
const record = doctorRef.current.getDataSource();   // LocationDictionaryVo | null
```

**`getDataSource()` only reflects an explicit dropdown selection.** If the value was set via
`setDoctor()` or typed without a pick, it returns the last selected record (which may be
stale). Always use `getDoctor()` for the authoritative current text value.

**Key `LocationDictionaryVo` fields:** `code`, `name`, `hospital`, `specialty`, `displayType`.

Prop `locationDisabled` disables the field. Props `inDefaultHospital`, `hospitalDisabled`,
`specialtyDisabled` are accepted but not currently applied.

---

### Doctor Input with Hospital (`LisDoctorBox`)

Two-field component — **Hospital** (left) + **Doctor** (right) displayed as a horizontal row.
Selecting a hospital filters the doctor dropdown to that hospital only. Blur validation on both
fields shows message box errors and can auto-fill canonical values when a single match is found.

```tsx
const doctorRef = useRef<any>(null);

<LisDoctorBox
  ref={doctorRef}
  width={200}
  popperWidth={500}
  hospitalDisabled={false}   // lock the Hospital field independently
  doctorDisabled={false}     // lock the Doctor field independently
/>

// Reading for submission:
const hospital = doctorRef.current.gethospitalValue();
const doctor   = doctorRef.current.getDoctor();
const record   = doctorRef.current.getDataSource();   // LocationDictionaryVo | null
```

**Programmatic pre-fill:** `setHospital(val)` and `setDoctor(val)` — neither triggers
validation nor updates the doctor filter.

**`getDataSource()` behaviour:** first checks whether the internally stored selected record
matches the current Hospital + Doctor field values. If not, performs a linear search through
`allRows`. Returns `null` if either field is empty.

**Validation messages fired on blur:**

| Code | Trigger | Outcome |
|------|---------|---------|
| 0001493 | Hospital code not in dictionary | Hospital field cleared |
| 0004095 | Doctor not found for hospital/doctor combination | Doctor field NOT cleared |
| 0004101 | Doctor code is ambiguous (multiple hospital matches, hospital filter inactive) | Doctor field cleared |

When exactly one doctor match is found, both Hospital and Doctor fields are auto-filled with
canonical values from the dictionary entry.

---

## Table Component

### Data Table (`LisDataTable`)

Standard LIS result/list table. Wraps the CMS `DataTable` with a built-in "No Records"
illustration when `rows` is empty, sticky headers, compact row height, and automatic
locale-aware sort for any column that doesn't supply a `customSort`.

```tsx
<LisDataTable
  columns={columns}              // useMemo — see warning below
  rows={rows}                    // useMemo — see warning below
  height="100%"
  showNumOfRecords
  onRowClick={(rowIndex) => handleSelect(rowIndex)}
  onRowDoubleClick={(rowIndex) => handleOpen(rowIndex)}
  selectedRowIndexList={selectedIndexes}   // controlled highlight
  sortOrders={sortOrders}                  // controlled sort — optional
  onChangeSortOrders={setSortOrders}
/>
```

**⚠ Re-render warning:** The component uses `memo` with strict reference equality. Always
stabilise `columns`, `rows`, and callback props with `useMemo`/`useCallback`. Passing new
literals inline will silently prevent updates.

All other CMS `DataTable` props (e.g. `allSortable`) are forwarded as-is.

---

## Dropdown Component (Self-fetching)

### Site Combo Box (`SiteComboBox`)

Searchable multi-select (default) for anatomical specimen collection sites. Self-fetches from
`window.$lisHubApp` dictionaries. **Only renders options for APS (lab 5) and CRS (lab 9)**;
renders nothing for all other labs.

Automatically chooses between two operating modes at startup:

| Mode | Condition | Columns | Creatable |
|------|-----------|---------|-----------|
| **SNOMED** (default) | `SPECIMEN/TEXT` option ≠ 1 for APS | Code, Class, Seq, Description | No |
| **Free-text (Keyword)** | `SPECIMEN/TEXT` option = 1 for APS | Description only | Yes |

```tsx
<SiteComboBox
  bench="AC"                   // bench code for REG_SPEC_NATURE priority ordering
  value={siteValue}            // controlled; array for multi-select
  onChange={(e, v) => setSiteValue(v)}
  width={300}
  multiple={true}              // default — set false for single-select
  disabled={isReadOnly}
  allSortable                  // make dropdown columns user-sortable
  TextFieldProps={{ placeholder: 'search' }}
/>
```

**`bench` prop:** required in Free-text Mode for correct keyword filtering; recommended in
SNOMED Mode so that bench-priority entries appear at the top of the list.

**Creatable entries** (Free-text Mode only): the user can type a value not in the list and
confirm it — `onChange` fires with the new string value.

---

### Patient Panel (`PatientPanel`)

Read-only patient/request info banner, typically at the top of a screen. The mode is
determined automatically by which data prop is provided.

```tsx
// Request mode (most common in CRS):
<PatientPanel
  requestInfo={requestVo}          // drives Request mode
  latestPatient={currentPatient}   // enables snapshot ⇄ live toggle button
  dataSource={dictionary}          // decodes Chinese names + location labels
  requestShowDetail={true}         // default; set false to hide right-side detail block
  maxWidth={1200}                  // optional
/>

// Patient-only mode (no request context):
<PatientPanel patient={patientVo} dataSource={dictionary} />

// Order mode:
<PatientPanel orderInfo={gcrsOrderDto} dataSource={dictionary} />
```

**Mode priority:** `orderInfo` > `requestInfo` > `patient`. Renders nothing if no data prop
is provided — safe to render before data loads.

**Deceased patient styling** is applied automatically when `dateOfDeath` is populated — no
extra prop needed.

**Source toggle** (snapshot vs live) appears only in Request mode when `latestPatient` is
provided. It lets staff switch between the demographics as recorded on the request vs. the
current PAS record.

**Action buttons** (EPR, Patient Album) are controlled by security rights and application-level
integrations (`inquireEpr`, `openPatientAlbum`) — they require no props.

---

## Common Mistakes

| Mistake | Fix |
|---|---|
| Reading `LisLocationBox` values via an `onChange` callback | No such callback exists — use `ref.getDataSource()` or the individual `get*Value()` refs |
| Calling `LisDoctorSingleBox.getDataSource()` after programmatic `setDoctor()` | Returns the last dropdown-picked record, not the set value; pair with `getDoctor()` for the current text |
| Calling `LisDoctorBox.setHospital()` and expecting the doctor filter to update | `setHospital()` sets the field text only — it does not update the doctor dropdown filter; the filter is driven by actual user selection via the Hospital dropdown |
| Calling `LisDoctorBox.setDoctor()` and expecting `getDataSource()` to reflect it | `setDoctor()` sets text only; `getDataSource()` searches `allRows` at call time — both fields must be non-empty |
| Passing `labNo={undefined}` to `LisKeyword` | Use `null` for global keywords; `undefined` may cause a crash or return no options |
| Expecting `EncounterNumber.onModifiedAndBlur` to fire on every blur | It fires **only** when the value changed — use `onBlur` for pure focus-loss logic |
| Triggering `RequestNumberInput` validation on blur | The component does not self-validate — parent must explicitly call `ref.verifyAndFormatRequestNo()` |
| Not `await`-ing `verifyAndFormatRequestNo()` | It returns `Promise<boolean>` — always await it before calling `getRequestNo()` |
| Omitting `dataSource` from `LisKeyword` or `LisConstant` | These components do not fetch dictionary data; they render nothing (or crash) without it |
| Providing both `requestInfo` and `orderInfo` to `PatientPanel` | `orderInfo` silently takes precedence — the request display is suppressed |
| Using `MaskedTextInput` in a production screen | Not yet implemented; renders no functional UI |
| Passing inline `columns` or `rows` literals directly to `LisDataTable` | `memo` uses reference equality — inline literals always look "new" and may silently prevent re-renders; use `useMemo` |
| Using `SiteComboBox` on a screen for a lab other than APS (5) or CRS (9) | The component renders empty and loads no options for other labs — verify `window.$lisHubApp.getServiceParams().requestLab` at mount |
| Omitting `bench` from `SiteComboBox` in Free-text Mode | `bench` is required — without it, no keyword entries are returned and the dropdown is empty |
