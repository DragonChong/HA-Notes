# Dictionary Loading

## Overview

The Dictionary Loading system is the mechanism by which `lis-hub-app` fetches and caches lookup data from the backend at startup and on-demand. It loads all reference data that LIS plug-in applications need to operate — test lists, keyword groups, constant tables, hospital lists, location tables, patient tag setups, and lab-specific reference data — in a single batched API call. The loaded data is held in a Zustand store and exposed to plug-in applications through a shared API context. Plug-in applications do not make their own dictionary API calls to the backend; they read from the data that `lis-hub-app` has already loaded.

> The original system equivalent is `CachedDictionary.as` in `/lisFlexLib/flex_src/hk/org/ha/lis/common/util/`.

---

## Related User Stories

*(No dedicated user story — this is a platform capability.)*

---

## Architecture Overview

```
lis-hub-app on startup
  │
  ▼
useDictionaryStore.updateVos(initVos)     ← Zustand store, loads all init-time VOs
  │
  ▼
Dictionary.loadDictionaryList(vosList)    ← Core class
  │
  ▼
selectDictionaries API (lis-common-svc)   ← Single batched HTTP POST, 30 s timeout
  │
  ▼
Data stored in useDictionaryStore (Zustand)
  │
  ├─► Persisted to IndexedDB (keyed by hospital + application name)
  │
  └─► Exposed to plug-ins via dictionaryExposeToPlugins.get()
```

---

## Dictionary VO Registry

Every cacheable reference table is registered as a `DictionaryVo` enum value. Each entry is paired with a configuration record in `dictionaryMap` that governs when and how it is loaded.

### Configuration Properties

| Property | Type | Purpose |
|---|---|---|
| `waitForDictionaryLoad` | boolean | When `true`, the application waits for this VO before marking the dictionary load complete. When `false`, the VO is loaded opportunistically and does not block readiness. |
| `specificLabData` | number[] | If non-empty, the VO is only requested when the current lab number matches one of the values in the array. An empty array means the VO is loaded for all labs. |
| `isRetrieveInRuntime` | boolean | When `true`, the VO is treated as a **runtime VO** — it is refreshed on demand rather than at startup. When `false`, it is an **init VO** loaded once at startup. |
| `specificServiceData` | string[] | When non-empty, the VO is also requested with a service-code prefix (e.g., `GNS_KeywordVo`, `SOS_KeywordVo`). The prefixed keys hold data scoped to that service. |

### Init-time VOs (loaded once at startup)

All `DictionaryVo` entries where `isRetrieveInRuntime = false`.

**Universal (all labs):**

| VO Key | Description |
|---|---|
| `MessageDictionaryVo` | System message definitions (does not block load) |
| `PublicHolidayVo` | Public holiday calendar (does not block load) |
| `KeywordVo` | Keyword lookup groups (with GNS/SOS service prefix) |
| `LocationDictionaryVo` | Location / ward lookup (with GNS/SOS service prefix) |
| `HospitalVo` | Hospital list |
| `SystemDateVo` | System date reference |
| `RequestFormatVo` | Request format definitions (with GNS/SOS prefix) |
| `TestMapMasterVo` | Test map master records |
| `RegistrableTestVo` | Tests available for registration (with GNS/SOS prefix) |
| `TestDictVo` | Test dictionary (with GNS/SOS prefix) |
| `OptionValueDetailVo` | Option value details (with GNS/SOS prefix) |
| `CommentVo` | Free-text comment templates (with GNS/SOS prefix) |
| `TestValidVo` | Test validity rules (with GNS/SOS prefix) |
| `ConstantDetailVo` | Constant/dropdown values (with GNS/SOS prefix) |
| `WorksheetPropertyVo` | Worksheet properties |
| `PatientTagDictionaryVo` | Patient tag types |
| `PatientAlertDictionaryVo` | Patient alert types |
| `ObjectClassMapVo` | Object class mappings |
| `CccBig5Vo` | CCC Big5 encoding table |
| `ObjectAttributeVo` | Object attribute definitions |
| `RetainMasterVo` | Specimen retain configurations |
| `PatientTagSetupVo` | Patient tag setup definitions |
| `SendOutRegistrableTestVo` | Tests available for send-out registration |
| `UserAccountVo` | User account lookup |
| `CommonDropDownDataVo` | General-purpose dropdown data (does not block load) |

**Lab-specific (init-time):**

| VO Key | Lab Numbers | Description |
|---|---|---|
| `LabMapVo` | 9 (CRS) | Lab mapping table |
| `BbIndicationCodeDictionaryVo` | 6 (BBS), 9 (CRS) | Blood bank indication codes |
| `BbOperationCodeDictionaryVo` | 6 (BBS), 9 (CRS) | Blood bank operation codes |
| `BbBtsProductVo` | 6 (BBS) | BTS blood products |
| `BbCompatibilityTransitionDictionaryVo` | 6 (BBS) | Blood bank compatibility transitions |
| `SnomedVo` | 5 (APS), 9 (CRS) | SNOMED coding lookup |
| `TestMapVo` | 3 (HMS) | Test map records |
| `Stopword` | 5 (APS) | Spell-check stopwords |
| `TestlinkVo` | 5 (APS) | Test link definitions |
| `FieldVo` | 5 (APS) | Result entry field definitions |
| `TestFieldCorpMapVo` | 5 (APS) | Field-to-test corpus mappings |
| `pdfTestRegistrable` | 5 (APS) | PDF-registrable test list |
| `HistoSetupVo` | 5 (APS), 9 (CRS) | Histology setup |
| `ApsTestVo` | 5 (APS), 9 (CRS) | APS test definitions |
| `ApKeywordVo` | 5 (APS), 9 (CRS) | APS keyword results |
| `BenchTestVo` | 5 (APS), 9 (CRS) | Bench-to-test mapping |
| `BenchVo` | 5 (APS), 9 (CRS) | Bench definitions |
| `LoeGlobalCtrVo` | 9 (CRS) | LOE global counter |
| `ApsRegistrableGroupVo` | 5 (APS) | APS registrable groups |
| `ApComplexityFactorVo` | 5 (APS), 9 (CRS) | Complexity factor lookup |
| `QcSearchVo` | 1–8 (all except CRS) | QC search definitions |
| `MbAntibioticsVo` | 7 (MBS) | Microbiology antibiotics |
| `GcrConstantDetailVo` | 9 (CRS) | GCR constant details |
| `AnalyserVo` | 1–8 (all except CRS) | Analyser definitions |
| `MbAutoPanelVo` | 7 (MBS) | MB auto panel |
| `MbSpecimenVo` | 7 (MBS) | MB specimen types |
| `MbOrganismVo` | 7 (MBS) | MB organism lookup |
| `MbSenspanelProfileVo` | 7 (MBS) | MB sensitivity panel profile |
| `ApCheckListDetailVo` | 5 (APS) | AP checklist details |
| `ApGynaeVo` | 5 (APS), 9 (CRS) | Gynaecology test settings |
| `MbZoneSizeVo` | 7 (MBS) | MB zone size |
| `GcrPrintSetupVo` | 9 (CRS) | GCR print setup |
| `GcrLabInfoVo` | 9 (CRS) | GCR lab info |
| `GcrWorksheetSetupVo` | 9 (CRS) | GCR worksheet setup |
| `GcrTestInfoResultMapVo` | 9 (CRS) | GCR test-result map |
| `MbCorrectPlateCountVo` | 7 (MBS) | MB correct plate count |
| `DftPrintAttributeVo` | 9 (CRS) | Default print attributes |
| `GcrSendoutTestVo` | 9 (CRS) | GCR send-out tests |
| `GcrTestMapVo` | 9 (CRS) | GCR test map |
| `GcrAddRequestPrintSetupVo` | 9 (CRS) | GCR add-request print setup |
| `TestSpecimenTypeMapVo` | 3 (HMS) | Test-to-specimen-type map |
| `ExtraTestProfileMapVo` | 3 (HMS) | Extra test profile map |
| `ApStandardListVo` | 5 (APS) | AP standard list |
| `ApOperationListVo` | 5 (APS) | AP operation list |
| `TestProfileAutoPanelVo` | 3 (HMS) | Test profile auto panel |
| `histoCheckByPerson` | 5 (APS) | Histology check-by person lookup |
| `BbOtMessageVo` | 6 (BBS) | BB OT message definitions |
| `LoeSpecodeMapVo` | 1 (CPS), 3 (HMS) | LOE specimen code map |
| `LoeCplcTestMapVo` | 3 (HMS) | LOE CPLC test map |
| `GcrWorkstationConfigVo` | 9 (CRS) | GCR workstation configuration |

### Runtime VOs (refreshed on demand)

These VOs are excluded from the startup load and are fetched when a plug-in explicitly requests them:

| VO Key | Lab Numbers | Description |
|---|---|---|
| `GcrOptionValueDetailVo` | 9 (CRS) | GCR option value details |
| `LoeBbnkMapVo` | 9 (CRS) | LOE blood bank mapping |
| `ApStandardListAliasVo` | 5 (APS) | AP standard list aliases |
| `ApOperationListMasterVo` | 5 (APS) | AP operation list master |
| `histoResponsiblePerson` | 5 (APS) | Histology responsible person lookup |
| `histoAuthByPerson` | 5 (APS) | Histology authorised-by person lookup |
| `histoAuthByPersonFpa` | 5 (APS) | Histology FPA authorised-by person |
| `MbWorksheetMappings` | 7 (MBS) | MB worksheet mappings |
| `MbWorksheets` | 7 (MBS) | MB worksheets |

---

## Loading Process

### Startup Load

On application startup, `useDictionaryStore.updateVos()` is called with `initVos` — the set of all VOs where `isRetrieveInRuntime = false`.

1. The current lab number is read from the global store.
2. VOs whose `specificLabData` list does not include the current lab number are filtered out and not sent to the backend.
3. VOs with non-empty `specificServiceData` are expanded: for each service code (e.g., `GNS`, `SOS`), an additional key is added to the request (e.g., `GNS_KeywordVo`, `SOS_KeywordVo`). These represent service-scoped overrides of the base VO.
4. A single API call is made to `selectDictionaries` (via `lis-common-svc`) with a 30-second timeout.
5. The response is a map of VO key → record array.
6. Each returned key is stored in both the Zustand store and the browser's IndexedDB, keyed by hospital code and application name.

### Empty Dictionary Handling

If the API returns an empty array for any VO:
- The VO key is added to an internal `emptyDictionaryArray`.
- After all VOs are processed, if the current lab is **CRS (lab 9)**:
  - If the VO key contains a service-prefix (format `SERVICE_VO`): the service is marked as down and message **4136** ("[@PARM1] service is down") is displayed with an OK button.
  - Otherwise, message **3466** ("Warning: [@PARM1] has no records!") is logged to monitor and ALS (no user pop-up).
- For non-CRS labs, message **3466** is shown.

### On-Demand (Runtime) Load

When a plug-in calls `cms.api.dictionary.get([voKey1, voKey2, ...])` and any requested key resolves to an empty array, the system calls `updateVos([voKey1, voKey2, ...])` to fetch those specific VOs from the backend. The result is merged into the store and returned to the caller as a `Promise`.

---

## Exposed API to Plug-in Applications

`lis-hub-app` exposes the dictionary to plug-in applications via two channels:

### 1. CMS API Context (`cms.api.dictionary`)

Available to apps loaded as CMS micro-frontend plug-ins (e.g., `lis-aps-app`):

| Method | Signature | Behaviour |
|---|---|---|
| `get()` | `() → DictionaryState` | Returns the entire current dictionary store synchronously |
| `get(voKey)` | `(DictionaryVo) → Promise<Record[]>` | Returns a single VO's array; triggers a runtime fetch if the VO is empty |
| `get(voKeys[])` | `(DictionaryVo[]) → Promise<DictionaryState>` | Returns multiple VOs; triggers runtime fetches for any that are empty |
| `getDictionaryTime()` | `() → Record<string,Date>` | Returns the cache timestamp for each VO |

### 2. Window Global (`window.$lisHubApp`)

Available to apps that read from the window object (e.g., `lab-crs-app` via `ContextProvider`):

| Property | Behaviour |
|---|---|
| `getDictionary` | Alias for `dictionaryExposeToPlugins.get` |
| `getDictionaryTime` | Alias for `dictionaryExposeToPlugins.getDictionaryTime` |

---

## Service Data Prefix Expansion

VOs with a non-empty `specificServiceData` list are automatically expanded. For example, `KeywordVo` with `specificServiceData: ['GNS', 'SOS']` produces three keys in the store:

| Key | Meaning |
|---|---|
| `KeywordVo` | Base keyword data (all services) |
| `GNS_KeywordVo` | Keyword data scoped to GNS service |
| `SOS_KeywordVo` | Keyword data scoped to SOS service |

VOs affected by service-prefix expansion:

| VO | Service Codes |
|---|---|
| `KeywordVo` | GNS, SOS |
| `LocationDictionaryVo` | GNS, SOS |
| `RequestFormatVo` | GNS, SOS |
| `TestMapMasterVo` | GNS, SOS |
| `RegistrableTestVo` | GNS, SOS |
| `TestDictVo` | GNS, SOS |
| `OptionValueDetailVo` | GNS, SOS |
| `CommentVo` | GNS, SOS |
| `TestValidVo` | GNS, SOS |
| `ConstantDetailVo` | GNS, SOS |

---

## Error Messages

| Code | Text | Trigger | Display |
|---|---|---|---|
| 3466 | "Warning: [@PARM1] has no records!" | A VO returned an empty array | Logged to monitor and ALS; no user pop-up |
| 4136 | "Warning: [@PARM1] service is down." | A service-prefixed VO returned empty (CRS lab only) | Message box with OK; logged to monitor and ALS |
| 4137 | *(service not ready notice)* | Service prefix resolution fails in `lab-crs-app` (see [[Dictionary Usage in Plugin Apps]]) | Awaited message in `lab-crs-app` |

---

## Related Workflows

- [[Dictionary Usage in Plugin Apps]] — How `lis-aps-app` and `lab-crs-app` consume dictionary data exposed by this system.
