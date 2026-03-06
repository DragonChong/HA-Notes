---
created: '2026-03-06'
status: final
tags:
  - architecture
  - micro-frontend
  - Module Federation
  - LIS
  - ECP
---
# 02 — Micro-Frontend Architecture

## 2.1 Orchestration Framework

The system uses **Webpack 5 Module Federation** configured via **CRACO** (`@craco/craco`). There is no Single-SPA, iframes, or alternative MFE framework. The `@cmschassis/react-spa` chassis library wraps the low-level federation mechanics into a plugin lifecycle (`PluginHost`, `PluginDescriptor`, `loadPlugin`).

```mermaid
graph TB
    subgraph "Shell: lis-hub-app (LisHubAppModule)"
        Craco["CRACO / Webpack 5\nModuleFederationPlugin\nname: LisHubAppModule\nfilename: lisHubAppModule_remote.js"]
        PluginHost["@cmschassis/react-spa\nPluginHost"]
        CmsJs["@cmschassis/cms-js\nmanifest / command / ui API"]
    end

    subgraph "Remote: crs-app"
        CRS["remoteEntry.js\nport 3010 (local)"]
    end
    subgraph "Remote: aps-app"
        APS["remoteEntry.js\nport 3011 (local)"]
    end
    subgraph "Remote: other lab apps"
        Other["remoteEntry.js\n(URL from hospMFUrl)"]
    end

    PluginHost -->|"dynamic import()\nat runtime"| CRS
    PluginHost -->|"dynamic import()\nat runtime"| APS
    PluginHost -->|"dynamic import()\nat runtime"| Other
    Craco --> PluginHost
    PluginHost --> CmsJs
```

**nginx cache-bust rule** in `nginx-spa.conf` always serves `remoteEntry.js` with `no-store, no-cache` headers — ensuring remote updates are picked up on next browser load.

---

## 2.2 Host and Remotes

| Role | Application | Federation Name | Entry |
|---|---|---|---|
| **Host / Shell** | `lis-hub-app` | `LisHubAppModule` | `lisHubAppModule_remote.js` |
| **Built-in Plugin** | `lis-hub-buildin-plugin` | (bundled) | loaded synchronously before remotes |
| **Remote: CRS** | `lis-crs-app` | set by remote | `remoteEntry.js` (port 3010 local) |
| **Remote: APS** | `lis-aps-app` | set by remote | `remoteEntry.js` (port 3011 local) |
| **Remote: Others** | CPS, GNS, HMS, IMS, SOS, TIS, TRL, VRS, BBNK, MICRO | set by remote | `hospMFUrl` from `Sam3LisApplicationVo` |

Remote URLs are **fully dynamic**: after login, `lis-hub-svc` returns `hospMFUrl` per lab-hospital pair in `Sam3LisApplicationVo`. This URL is stored in `useGlobalStore.hospMFUrl` and passed to `PluginHost` — meaning no remote URL is hardcoded in the build.

---

## 2.3 Plugin Lifecycle

```mermaid
sequenceDiagram
    participant User
    participant Shell as Shell (System.tsx)
    participant Hub as Hub.tsx / useHubApp
    participant PH as PluginHost (@cmschassis)
    participant BIP as Built-in Plugin
    participant Remote as Remote MFE (e.g. crs-app)
    participant API as lis-hub-svc

    User->>Shell: navigate /land/:labCode/:hosCode
    Shell->>API: init() — workbench, user, menu, dictionary
    Shell->>BIP: pluginLoader.loadPlugin(hubBuildInManifest)
    Note over BIP: declare()\n contributeMenus/Views/Commands
    Note over BIP: activate(apiContext)\n registers command handlers
    Shell->>Hub: <Hub plugins=[{id, scriptUrl: hospMFUrl}] />
    Hub->>PH: render <PluginHost plugins=... />
    PH->>Remote: dynamic import(hospMFUrl + '/remoteEntry.js')
    Remote-->>PH: CmsPlugin module
    PH->>Hub: onPluginLoaded(descriptor, manifestModule)
    Hub->>Shell: pluginLoader.loadPlugin(manifestModule)
    Note over Remote: declare()\n contributeMenus/Views/Commands
    Note over Remote: activate(apiProvider)\n registers command handlers
    Hub->>Shell: isAllPluginsProcessed = true
    Shell->>User: Render menu + tabs (Outlet → RootTabs)
```

---

## 2.4 Routing Strategy

The shell owns **all routing** via React Router v6. Remote MFEs do **not** have their own router.

```mermaid
graph LR
    A["/"] -->|redirect| B["/system-list"]
    B -->|user selects lab| C["/land/:labCode/:hosCode"]
    C --> D["SimpleLandingPage (index)"]
    C --> E["/land/:labCode/:hosCode/:viewId"]
    E --> F["ViewHandler\n↓\nRootTabs\n↓\nActiveView DOM node"]
```

**How URL-to-view resolution works:**

1. User clicks a menu item → `useCmdStore.execute(commandId)`
2. Command handler calls `useViewStore.createView(viewGroupId, viewId, label)` which creates a raw `<div>` DOM node
3. The remote plugin mounts its React app into that `<div>` via `createRoot`
4. `useViewStore` adds the view to `rootViewGroup.views`
5. React Router updates URL to `/land/:labCode/:hosCode/:viewId`
6. `RootTabs` renders all open views; the active one is shown, others remain mounted (hidden via CSS)

```mermaid
sequenceDiagram
    participant M as Menu Click
    participant CS as useCmdStore
    participant VS as useViewStore
    participant Plugin as Remote Plugin (React)
    participant RB as RootTabs
    participant URL as Browser URL

    M->>CS: execute("open.some.view", {viewId})
    CS->>VS: createView(Root, viewId, label)
    VS-->>Plugin: new <div> element provided
    Plugin->>Plugin: createRoot(div).render(<MyPage />)
    VS->>RB: views updated → render new tab
    RB->>URL: navigate(/land/CRS/QEH/some.view)
```

---

## 2.5 Cross-MFE State Sharing & Communication

### Three mechanisms used concurrently:

#### A. `LisApiContext` — Official Plugin API Contract

The shell constructs `apiProvider` and injects it via `plugin.activate(context)`. Remote MFEs **only** access shell state through this typed interface — direct Zustand store access is forbidden.

```mermaid
graph LR
    subgraph "Shell Zustand Stores"
        GS["useGlobalStore"]
        AS["useAuthStore"]
        SS["useSessionStore"]
        PS["usePatientStore"]
        DS["useDictionaryStore"]
        VS["useViewStore"]
        MS["useMenuStore"]
        CS["useCmdStore"]
    end

    subgraph "LisApiContext (apiProvider)"
        AP["apiProvider\n.patient\n.ui\n.auth\n.session\n.command\n.dictionary\n.global\n.preference\n.request\n.translation"]
    end

    subgraph "Plugins"
        P1["Built-in Plugin"]
        P2["Remote MFE A"]
        P3["Remote MFE B"]
    end

    GS --> AP
    AS --> AP
    SS --> AP
    PS --> AP
    DS --> AP
    VS --> AP
    MS --> AP
    CS --> AP
    AP -->|"inject via activate()"| P1
    AP -->|"inject via activate()"| P2
    AP -->|"inject via activate()"| P3
```

Key namespaces on `LisApiContext`:

| Namespace | Purpose |
|---|---|
| `context.patient` | Patient selection, switching, HKID lookup |
| `context.ui` | Open/close views, menus, MessageBox, loading spinner |
| `context.auth` | Auth state, user roles, access rights |
| `context.session` | Hospital, workstation, user login ID |
| `context.command` | `register(id, fn)` + `execute(id, arg)` — command bus |
| `context.dictionary` | LIS data dictionaries (cached in IndexedDB) |
| `context.global` | Lab API URL, service params, profile code |
| `context.preference` | Theme, language settings |
| `context.request` | Configured Axios instance |
| `context.translation` | i18n function |
| `context.globalRequest` | Pre-wired error-handling request wrapper |

#### B. `window.$lisHubApp` — Global Object Bridge

For legacy sub-systems or packages unable to consume Module Federation directly:

```typescript
window.$lisHubApp = {
  api: { checkHkid, selectAccessRight, MessageBoxApi, ... },
  getServiceParams(),
  getDictionary(), subscribeTheme(), subscribeLanguage(),
  getToken(), getProfileCode(), getCorrelation(),
  request, securityUtils, libHubComUtils, useCommonHooks,
  getViewStore()
}
```

#### C. Command Bus (`useCmdStore.execute`)

Any plugin or the shell can invoke cross-MFE actions without direct imports:

```mermaid
sequenceDiagram
    participant PA as Plugin A
    participant CS as useCmdStore
    participant PB as Plugin B

    Note over PB: activate() → context.command.register("patient.open", handler)
    PA->>CS: context.command.execute("patient.open", {hkid: "A123"})
    CS->>PB: handler({hkid: "A123"})
    PB->>PB: opens patient panel
```

---

## 2.6 Shared Dependencies

```mermaid
graph TB
    subgraph "Webpack Federation Singletons"
        R["react 18.2.0\n(singleton: true)"]
        RD["react-dom 18.2.0\n(singleton: true)"]
    end

    subgraph "Shared via npm (same version expected)"
        CUI["@cmschassis/react-ui\n(MUI component lib)"]
        CMS["@cmschassis/cms-js\n(CMS Chassis core)"]
        RSPA["@cmschassis/react-spa\n(PluginHost runtime)"]
        LIB["@lis/lis-hub-lib\n(LIS shared utils)"]
        MUI["@mui/material v5"]
        ZU["zustand 4.5.1"]
        AX["axios 1.11.0"]
    end

    R -->|"shared singleton"| Shell
    RD -->|"shared singleton"| Shell
    CUI --> Shell
    CUI --> RemoteMFE
    CMS --> Shell
    RSPA --> Shell
    LIB --> RemoteMFE
    MUI --> Shell
    MUI --> RemoteMFE
```
