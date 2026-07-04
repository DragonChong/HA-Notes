---
name: lis-dictionary-usage
description: >
  Guides correct implementation of dictionary data access in LIS plugin/frontend
  applications (lis-request-app, lab-crs-app, lis-aps-app, and any other app
  loaded within lis-hub-app). Use this skill whenever a task involves reading
  lookup/reference data such as keyword groups, constant dropdowns, location
  lists, test dictionaries, hospital lists, user account lists, or any other
  DictionaryVo data. Triggers include: passing a dataSource prop to LisKeyword,
  LisConstant, or LisLocationBox; initialising a form that needs dropdown
  options; writing a hook that loads reference data on mount; any mention of
  "dictionary", "DictionaryVo", "apiContext.dictionary", or "cms.api.dictionary".
  Also use this skill when a developer asks how to get keyword/constant/location
  data into a component, or when a code review reveals a direct call to
  selectDictionaries or any lis-common-svc dictionary endpoint from a plugin app.
---

# LIS Dictionary Usage in Frontend Applications

## Core Principle

`lis-hub-app` owns the dictionary. It loads all reference data at startup and
holds it in a Zustand store. Plugin apps **read** from that store — they never
call dictionary API endpoints themselves. This keeps network usage minimal and
ensures all apps share a single consistent cache.

> Full reference: `LIS/ECP/lis-hub-app/Dictionary Loading.md` and
> `LIS/ECP/lis-hub-app/Dictionary Usage in Plugin Apps.md` in the Obsidian vault.

---

## Access Patterns by App Type

### CMS Micro-Frontend Plugins (e.g., lis-request-app, lis-aps-app)

Access through `LisApiContext` / `cms.api.dictionary`:

```typescript
// Synchronous — safe to call any time; returns already-loaded data instantly
const {
  KeywordVo,
  ConstantDetailVo,
  LocationDictionaryVo,
  TestDictVo,
  HospitalVo,
} = apiContext.dictionary.get();

// Async overload — triggers a runtime fetch for VOs that have
// isRetrieveInRuntime = true (e.g. histoResponsiblePerson, ApOperationListMasterVo)
const { histoResponsiblePerson, ApOperationListMasterVo } =
  await apiContext.dictionary.get([
    'histoResponsiblePerson',
    'ApOperationListMasterVo',
  ]);
```

Never call `selectDictionaries` or any `lis-common-svc` dictionary endpoint
from a plugin app. All dictionary access must go through the context API.

### Module Federation Remotes using ContextProvider (e.g., lab-crs-app)

Access via `ContextProvider.api.dictionary.get(dict.concat(prefixDict))`,
passing both base VO keys and service-prefixed keys. The typical wrapper is
a `DictionaryContext` that calls `fetchDictionaries(serviceType)` on mount
and stores the result in an `unstated-next` container. Components consume it
via `DictionaryContextContainer.useContainer()`.

---

## Deciding Sync vs Async

| VO type | `isRetrieveInRuntime` | How to fetch |
|---|---|---|
| Most universal VOs (KeywordVo, ConstantDetailVo, LocationDictionaryVo, etc.) | `false` | Synchronous `get()` — data is ready at app mount |
| Runtime VOs (histoResponsiblePerson, ApOperationListMasterVo, LoeBbnkMapVo, etc.) | `true` | Async `await get([voKey])` — triggers a background fetch if store is empty |

When in doubt, check `LIS/ECP/lis-hub-app/Dictionary Loading.md` — the full
VO registry lists `isRetrieveInRuntime` for every VO.

---

## Loading Pattern in a Component or Hook

The standard approach in `lis-aps-app` (and the pattern to follow in new apps)
is to load all needed VOs once when the screen mounts and dispatch them into a
local store or state. Do not call `get()` inside render — call it inside a
`useEffect` or `useCallback`:

```typescript
const getAllInitData = useCallback(async () => {
  // Step 1: read init-time VOs synchronously
  const {
    KeywordVo,
    ConstantDetailVo,
    LocationDictionaryVo,
    RequestFormatVo,
    TestDictVo,
  } = apiContext.dictionary.get();

  // Step 2: fetch runtime VOs asynchronously
  const { histoResponsiblePerson } = await apiContext.dictionary.get([
    'histoResponsiblePerson',
  ]);

  // Step 3: shape and store
  setDictionaryData({
    keywords: KeywordVo,
    constants: ConstantDetailVo,
    locations: LocationDictionaryVo,
    pathologists: histoResponsiblePerson?.map((p: any) => ({
      value: p.userCode,
      label: p.userName,
    })),
  });
}, [apiContext]);

useEffect(() => {
  getAllInitData();
}, [getAllInitData]);
```

---

## Passing Dictionary Data to lis-hub-lib Components

The shared components (`LisKeyword`, `LisConstant`, `LisLocationBox`) expect
the raw VO array as their `dataSource` prop. The parent component is responsible
for passing the right VO:

```typescript
// Keyword dropdown — pass KeywordVo
<LisKeyword
  dataSource={dictionaryData.keywords}   // KeywordVo array
  group="URGENCY"
  labNo={labNo}
  value={urgency}
  getCurrentKeyword={(kw) => setUrgency(kw)}
/>

// Constant dropdown — pass ConstantDetailVo
<LisConstant
  dataSource={dictionaryData.constants}  // ConstantDetailVo array
  group="ABO"
  format={labFormat}
  value={abo}
  getCurrentConstant={(c) => setAbo(c)}
/>

// Location input — pass LocationDictionaryVo
<LisLocationBox
  dataSource={dictionaryData.locations}  // LocationDictionaryVo array
  value={location}
  onChange={(loc) => setLocation(loc)}
/>
```

See the individual component docs in `LIS/ECP/lis-hub-lib/` for full prop
details on each component.

---

## Service-Prefixed VOs (GNS_, SOS_)

Some VOs carry service-scoped overrides. `KeywordVo`, `ConstantDetailVo`,
`LocationDictionaryVo`, `RequestFormatVo`, `TestDictVo`, and several others
are also stored under keys like `GNS_KeywordVo` and `SOS_KeywordVo`.

When a plugin app is handling data for a specific service (e.g., GNS), prefer
the prefixed VO over the base VO — it contains service-scoped records:

```typescript
const { GNS_KeywordVo, KeywordVo } = apiContext.dictionary.get();
const keywords = GNS_KeywordVo?.length ? GNS_KeywordVo : KeywordVo;
```

In `lab-crs-app`, this fallback logic is handled by `DictionaryContext`'s
`filterPreTemp` function automatically. In new plugin apps, apply the same
pattern manually when service-scoped data is needed.

---

## CRS Lab-Specific VOs (Lab 9)

When developing for CRS (`LabNumbers.CRS = 9`), the following VOs are
available that are not loaded for other labs:

| VO | Purpose |
|---|---|
| `LabMapVo` | Lab mapping |
| `SnomedVo` | SNOMED coding |
| `HistoSetupVo` | Histology setup |
| `ApsTestVo` | APS test definitions |
| `BenchVo` / `BenchTestVo` | Bench definitions |
| `LoeGlobalCtrVo` | LOE global counter |
| `GcrPrintSetupVo` | GCR print setup |
| `GcrLabInfoVo` | GCR lab info |
| `GcrWorksheetSetupVo` | GCR worksheet setup |
| `GcrTestInfoResultMapVo` | GCR test-result map |
| `DftPrintAttributeVo` | Default print attributes |
| `GcrTestMapVo` / `GcrSendoutTestVo` | GCR test mappings |
| `GcrAddRequestPrintSetupVo` | GCR add-request print |
| `GcrWorkstationConfigVo` | GCR workstation config |
| `BbIndicationCodeDictionaryVo` | BB indication codes |
| `BbOperationCodeDictionaryVo` | BB operation codes |

These are already in the store when the plugin mounts — no special fetch needed.

---

## Empty Dictionary Handling

If `apiContext.dictionary.get()` returns an empty array for a VO, do not
silently proceed. Returning empty data from a VO the component depends on will
cause the component to render with no options. Log a warning and either:
- Show a disabled state on the control with an explanatory tooltip, or
- Display an `AlertBox` (server-side error surface) if the empty VO is critical
  to the screen's function.

The hub will have already logged message 3466 or 4136 to the monitor/ALS when
the VO was first loaded empty — the plugin app does not need to repeat that
logging, but it does need to guard its UI against empty arrays.

---

## Common Mistakes

| Mistake | Correct approach |
|---|---|
| `import { useDictionaryStore } from 'lis-hub-app'` | Use `apiContext.dictionary.get()` |
| Calling `selectDictionaries(...)` directly | Never call dictionary endpoints from plugin apps |
| Reading dictionary data inside render | Load in `useEffect` / `useCallback`, store in state |
| Passing the entire `get()` result object as `dataSource` | Pass the specific VO array (e.g., `KeywordVo`, not the whole state) |
| Using `await get()` for an init-time VO that's already loaded | Use the synchronous overload — no need to await; it resolves instantly from the store |
| Not handling the empty-array case | Always check `Array.isArray(vo) && vo.length > 0` before rendering option lists |
