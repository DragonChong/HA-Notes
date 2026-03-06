---
created: '2026-03-06'
status: final
tags:
  - architecture
  - system
  - LIS
  - ECP
---
# 01 — System Architecture

## 1.1 Repository Structure

`lis-hub-app` is a **single polyrepo** — not a Monorepo (no Nx, Lerna, Turborepo, or Yarn workspaces). It contains **only the Shell / Host application**. Each lab sub-application (CRS, APS, etc.) lives in a **separate repository** and is referenced at runtime via Module Federation remote entry URLs.

```mermaid
graph LR
    subgraph "Polyrepo Model"
        R1["lis-hub-app\n(this repo — Shell)"]
        R2["lis-crs-app\n(separate repo)"]
        R3["lis-aps-app\n(separate repo)"]
        R4["lis-hub-svc\n(separate repo — backend)"]
        R5["lis-reference-svc\n(separate repo)"]
        R6["lis-lab-order-svc\n(separate repo)"]
        R7["...other svc repos"]
    end
    R1 -.->|"runtime Module Federation"| R2
    R1 -.->|"runtime Module Federation"| R3
    R1 -->|"REST API (Axios)"| R4
```

---

## 1.2 Repository Layout

```
lis-hub-app/
├── src/
│   └── modules/
│       ├── api/
│       │   ├── generated/           # Auto-generated Axios API (restful-react)
│       │   │   ├── lis-common-svc.tsx   # 2000+ line contract with lis-hub-svc
│       │   │   └── lis-common-svc-enum.ts
│       │   ├── request/             # Typed service classes (menu, user, dict…)
│       │   └── utils/               # Axios instance + interceptors + error handling
│       ├── components/              # React component tree (Shell UI)
│       │   ├── Hub/                 # Plugin orchestration host
│       │   ├── System/              # Per-lab MFE loader + init sequencer
│       │   ├── Router/              # React Router v6 config
│       │   ├── ViewHandler/         # URL-driven view lifecycle
│       │   ├── RootTabs/            # Tab management for open views
│       │   ├── Auth/                # Keycloak init
│       │   └── ...
│       ├── states/                  # Zustand stores (global, auth, session, …)
│       ├── lis-hub-buildin-plugin/  # Built-in plugin (patient, audit, worksheet)
│       └── lis-js/                  # LisApiContext type definition
├── Dockerfile                       # Production: pre-built artifact → nginx
├── .devops/config/Dockerfile        # CI: two-stage build-then-package
├── nginx-spa.conf                   # nginx SPA + reverse-proxy config
├── craco.config.js                  # Webpack 5 + Module Federation config
├── restful-react.config.js          # API code generation from Swagger
├── localproxy.js                    # Dev-server reverse proxy rules
├── values-DEV.yaml                  # Helm values for DEV environment
├── values-DEVQA.yaml                # Helm values for DEVQA environment
├── values-SIT.yaml                  # Helm values for SIT environment
├── values-DEMO.yaml                 # Helm values for DEMO environment
└── .github/workflows/               # GitHub Actions CI/CD pipelines
```

---

## 1.3 Technology Stack

| Layer | Technology | Version |
|---|---|---|
| Frontend framework | React | 18.2.0 |
| State management | Zustand | 4.5.1 |
| Routing | React Router | 6.18.0 |
| UI components | MUI (Material UI) | 5.14.18 |
| MFE orchestration | Webpack 5 Module Federation | via CRACO 7.1.0 |
| API client | Axios | 1.11.0 |
| Form handling | React Hook Form | 7.48.2 |
| Authentication | keycloak-js | 22.0.5 |
| Internationalisation | i18next / react-i18next | 23.2.3 / 15.4.0 |
| Client-side cache | localforage (IndexedDB) | 1.10.0 |
| CMS Chassis | @cmschassis/react-spa, cms-js, react-ui | internal |
| LIS shared lib | @lis/lis-hub-lib | 0.1.73 |
| HTTP server | Bitnami nginx | 1.16.1 |
| Container orchestration | Red Hat OpenShift (ECP) | — |
| Package registry | JFrog Artifactory | internal |

---

## 1.4 Component Hierarchy

```mermaid
graph TB
    A["Root"]
    B["MainRoute\n(RouterProvider)"]
    C["GlobalStateWrap\n(Auth guard)"]
    D["System\n(MFE loader per lab)"]
    E["Hub\n(PluginHost + PluginDescriptors)"]
    F["Outlet / ViewHandler"]
    G["RootTabs\n(TabsContainer)"]
    H["PluginHost\n(@cmschassis/react-spa)"]
    I["Built-in Plugin\nDOM root 1"]
    J["Remote MFE Plugin\nDOM root 2"]
    K["Remote MFE Plugin\nDOM root N"]

    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    E --> H
    F --> G
    H --> I
    H --> J
    H --> K
```

Each plugin view gets its own **independently-rooted React tree** (`createRoot` on a new `<div>`) managed by `useViewStore`. Views are shown/hidden via CSS without unmounting, preserving component state across tab switches.

---

## 1.5 Environment Topology

```mermaid
graph LR
    subgraph "HA Internal Network"
        Dev["DEV\ntstcld61 C1\n(feature branches)"]
        DevQA["DEVQA\ntstcld61 C1\n(release pre-validation)"]
        SIT_C1["SIT C1\ntstcld61\n(integration test)"]
        SIT_C2["SIT C2\ntstcld61\n(integration test)"]
        DEMO["DEMO\ntstcld61\n(UAT/stakeholders)"]
        LPT["LPT C2\n(load performance)"]
    end

    SAM3_DEV["SAM3 DEV\nKeycloak"]
    SAM3_SIT["SAM3 SIT\nKeycloak"]

    Dev --> SAM3_DEV
    DevQA --> SAM3_DEV
    SIT_C1 --> SAM3_SIT
    SIT_C2 --> SAM3_SIT
```
