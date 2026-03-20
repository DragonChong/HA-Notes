# Dictionary Usage in Plugin Apps

## Overview

Plug-in applications loaded within `lis-hub-app` do not load dictionary data themselves. Instead, they read from data that `lis-hub-app` has already fetched and cached. The dictionary is passed to plug-in apps through the CMS API context or via the `window.$lisHubApp` global object, depending on how the plug-in app is integrated. This document describes the specific patterns used in `lis-aps-app` and `lab-crs-app`.

> The authoritative description of the dictionary loading mechanism is in [[Dictionary Loading]].

---

## How the Bridge Works

When `lis-hub-app` initialises, it builds an `apiProvider` object and passes it to the CMS module loader. Each plug-in app receives this context as `cms.api`. The `dictionary` property on that context is the `dictionaryExposeToPlugins` object, which reads live from the `useDictionaryStore` Zustand store.

```
lis-hub-app
  useDictionaryStore (Zustand)
         │
         └──► dictionaryExposeToPlugins
                    │
         ┌──────────┤
         │          │
  lis-aps-app   lab-crs-app
  cms.api       window.$lisHubApp
  .dictionary   .getDictionary
```

Plug-in apps **must not** call `lis-common-svc` dictionary endpoints directly. All dictionary access should go through the context API.

---

## lis-aps-app — APS Result Entry Module

### Integration Approach

`lis-aps-app` is a CMS micro-frontend plug-in. It accesses the dictionary through a module-level CMS instance:

```ts
// cms-api-provider.ts
class CmsInstance {
  get api() { return apiContext; }
  set api(context) { apiContext = context; }
}
```

The shared instance is imported as `cms` and used as `cms.api.dictionary`.

### How Dictionary Data is Loaded

When the APS Result Entry screen opens, the `getAllInitData` function fires. It calls `cms.api.dictionary.get()` in two calls:

**Call 1 — synchronous (init-time data already loaded by lis-hub-app):**
```
cms.api.dictionary.get()
```
Returns the entire dictionary store synchronously. The following VOs are destructured from this call:

| VO | How It Is Used |
|---|---|
| `BenchTestVo` | Stored as `testData` in `baseData` Redux store |
| `ApsTestVo` | Filtered to registration-enabled entries; stored as `apsTestData` |
| `TestlinkVo` | Stored as `testLinksData` |
| `FieldVo` | Stored as `fieldData` |
| `ApKeywordVo` | Stored as `specData` |
| `ApGynaeVo` | Stored as `gynaeData` |
| `SnomedVo` | Stored as `snomedData` |
| `HistoSetupVo` | Stored as `histoData` |
| `ApsRegistrableGroupVo` | Stored as `groupsData` |
| `OptionValueDetailVo` | Stored as `detailData` |
| `ApStandardListVo` | Stored as `apsData` |
| `ApOperationListVo` | Stored as `apoData` |
| `TestDictVo` | Stored as `testsData` |
| `LocationDictionaryVo` | Stored as `locationDictionaryData` |
| `Stopword` | Stored as `stopwordData` |
| `CommentVo` | Stored as `commentData` |
| `RequestFormatVo` | Stored as `formatData` |
| `KeywordVo` | Stored as `keywordData` |

**Call 2 — asynchronous (runtime VOs, fetched on demand):**
```
await cms.api.dictionary.get([
  "histoResponsiblePerson",
  "histoAuthByPerson",
  "ApOperationListMasterVo",
  "ApCheckListDetailVo",
  "ApStandardListAliasVo",
  "histoCheckByPerson",
])
```
Because these VOs have `isRetrieveInRuntime = true`, they are not present in the store at startup. Calling `get([...])` with empty store values triggers `updateVos([...])` inside `lis-hub-app`, which fetches them from the backend and resolves the promise.

| VO (runtime) | How It Is Used |
|---|---|
| `histoResponsiblePerson` | Mapped to `{value, label}` shape; stored as `pathData` |
| `histoAuthByPerson` | Mapped to `{value, label}` shape; stored as `authData` |
| `ApOperationListMasterVo` | Stored as `apOperationListMasterData` |
| `ApCheckListDetailVo` | Stored as `checkListDetailData` |
| `ApStandardListAliasVo` | Stored as `apStandardListAliasData` |
| `histoCheckByPerson` | Stored as `histoCheckByPersonData` |

### Redux Store Structure (`baseData`)

All resolved dictionary data is dispatched to the Redux `baseData` slice via a single `UPDATE_BASE_DATA` action. Components read from this store using `useSelector`:

```ts
const { testsData, pathData, locationDictionaryData, ... } = useSelector(
  (state: any) => state.baseData
);
```

#### `baseData` Store Fields

| Field | Source VO | Description |
|---|---|---|
| `testData` | `BenchTestVo` | Bench-to-test mapping |
| `testsData` | `TestDictVo` | Test dictionary |
| `apsTestData` | `ApsTestVo` (filtered) | Registration-enabled APS tests |
| `pathData` | `histoResponsiblePerson` | Responsible pathologist list (value/label) |
| `authData` | `histoAuthByPerson` | Authorised-by person list (value/label) |
| `testLinksData` | `TestlinkVo` | Test link definitions |
| `fieldData` | `FieldVo` | Result entry field definitions |
| `specData` | `ApKeywordVo` | APS keyword results |
| `snomedData` | `SnomedVo` | SNOMED coding data |
| `histoData` | `HistoSetupVo` | Histology setup |
| `groupsData` | `ApsRegistrableGroupVo` | Registrable groups |
| `detailData` | `OptionValueDetailVo` | Option value details |
| `apsData` | `ApStandardListVo` | Standard lists |
| `apoData` | `ApOperationListVo` | Operation lists |
| `locationDictionaryData` | `LocationDictionaryVo` | Location/ward lookup |
| `apOperationListMasterData` | `ApOperationListMasterVo` | Operation list master |
| `apStandardListAliasData` | `ApStandardListAliasVo` | Standard list aliases |
| `stopwordData` | `Stopword` | Spell-check stopwords |
| `histoCheckByPersonData` | `histoCheckByPerson` | Check-by person list |
| `commentData` | `CommentVo` | Comment templates |
| `keywordData` | `KeywordVo` | Keyword groups |

### Individual Component Access

Some components also call `cms.api.dictionary.get()` directly for single VOs at the point of use (e.g., `BatchAssign`, `OutstandingCase`), rather than relying on the `baseData` store:

```ts
const { OptionValueDetailVo } = cms.api.dictionary.get();
```

This is a synchronous call returning the already-loaded VO from the store.

---

## lab-crs-app — CRS Specimen Acknowledgement Module

### Integration Approach

`lab-crs-app` is integrated as a Module Federation remote. It accesses the exposed `window.$lisHubApp` object through a local bridge module called `ContextProvider`. It does **not** use `cms.api.dictionary` directly; instead it calls `ContextProvider.api.dictionary.get(...)`.

### How Dictionary Data is Loaded

`lab-crs-app` uses a custom React context, `DictionaryContextContainer`, built with `unstated-next`. Dictionary data is fetched by calling `fetchDictionaries(serviceType)`.

#### Step 1 — Build the VO Request List

A fixed collection (`DICT_COLLECTION`) of VO keys is defined for this app:

| VO | Description |
|---|---|
| `GcrAddRequestPrintSetupVo` | GCR add-request print setup |
| `GcrPrintSetupVo` | GCR print setup |
| `GcrWorksheetSetupVo` | GCR worksheet setup |
| `HospitalVo` | Hospital list |
| `TestDictVo` | Test dictionary |
| `GcrTestInfoResultMapVo` | GCR test-result mapping |
| `GcrOptionValueDetailVo` | GCR option values |
| `CommonDropDownDataVo` | General dropdown data |
| `RegistrableTestVo` | Registrable tests |
| `GcrTestMapVo` | GCR test map |
| `GcrLabInfoVo` | GCR lab info |
| `CccBig5Vo` | CCC Big5 encoding |
| `KeywordVo` | Keyword groups |
| `ConstantDetailVo` | Constant / dropdown values |
| `LocationDictionaryVo` | Location/ward lookup |
| `TestValidVo` | Test validity rules |
| `RequestFormatVo` | Request format definitions |
| `LabMapVo` | Lab mapping |
| `LoeBbnkMapVo` | LOE blood bank mapping |
| `PatientTagDictionaryVo` | Patient tag types |
| `PatientAlertDictionaryVo` | Patient alert types |
| `PatientTagSetupVo` | Patient tag setup |
| `HistoSetupVo` | Histology setup |
| `BenchTestVo` | Bench-to-test mapping |
| `ApsTestVo` | APS test definitions |
| `ApKeywordVo` | AP keyword results |
| `UserAccountVo` | User account lookup |
| `SnomedVo` | SNOMED coding |
| `LoeGlobalCtrVo` | LOE global counter |
| `DftPrintAttributeVo` | Default print attributes |
| `BenchVo` | Bench definitions |
| `BbIndicationCodeDictionaryVo` | BB indication codes |
| `BbOperationCodeDictionaryVo` | BB operation codes |
| `MessageDictionaryVo` | System messages |

#### Step 2 — Service Prefix Expansion

If a `serviceType` argument is passed to `fetchDictionaries` (e.g., `"GNS"`), the app checks for each VO whether a `GNS_{VO}` prefixed entry exists in `allVosWithSpecificServiceData`. If so, the prefixed key is added alongside the base key in the request.

#### Step 3 — Call `ContextProvider.api.dictionary.get()`

The merged list of base and prefixed VO keys is sent as a single call. The response is a flat map of key → record array.

#### Step 4 — Service Readiness Check

After receiving the response, if a `serviceType` was specified:
- The app iterates over `DICT_COLLECTION` looking for prefixed results (e.g., `GNS_KeywordVo`).
- If any prefixed result contains records, `isServiceReady = true`.
- For each VO, the prefixed result is used if present; otherwise the base result is used.
- If **no** prefixed result has records, message **4137** is shown to the user (service not ready).

#### Step 5 — Store in Context State

The resolved data is stored in the `DictionaryContextContainer` React context as a map of VO key → record array. Components access it via:

```ts
const { dictionaryData } = DictionaryContextContainer.useContainer();
// dictionaryData.KeywordVo, dictionaryData.LocationDictionaryVo, etc.
```

### Comparison: lis-aps-app vs lab-crs-app

| Aspect | lis-aps-app | lab-crs-app |
|---|---|---|
| Integration type | CMS micro-frontend plug-in | Module Federation remote |
| Dictionary access | `cms.api.dictionary.get()` | `ContextProvider.api.dictionary.get()` |
| State management | Redux `baseData` slice | `unstated-next` container (React context) |
| Runtime VO handling | Awaits `get([voKeys])` Promise | Not separately distinguished — full fetch on each `fetchDictionaries` call |
| Service prefix handling | Not applicable (uses global lab number) | Explicit `serviceType` argument; falls back to base VO if prefixed not available |
| Service readiness check | Not applicable | Yes — warns user via message 4137 if prefixed data is empty |
| Load trigger | `useEffect` → `getAllInitData()` on mount | Called by component when it needs dictionary data |

---

## Error Messages

| Code | Text | Application | Trigger |
|---|---|---|---|
| 4136 | "Warning: [@PARM1] service is down." | `lis-hub-app` | Service-prefixed VO has no records (CRS lab) |
| 3466 | "Warning: [@PARM1] has no records!" | `lis-hub-app` | Any VO returned an empty array |
| 4137 | Service not ready notice | `lab-crs-app` | No prefixed records found after service-type resolution |

---

## Related Workflows

- [[Dictionary Loading]] — Core dictionary loading mechanism in `lis-hub-app`, including VO registry and loading lifecycle.
