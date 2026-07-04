---
name: lis-architecture
description: >
  Comprehensive architectural reference for the LIS CRS Revamp ecosystem — 5 co-located
  polyrepos: lis-hub-app (shell MFE), lis-crs-common-app (CRS plugin remote),
  lab-crs-app (specimen-ack sub-remote), lis-hub-svc (Hub BFF, Spring Boot 3.3.13),
  lis-crs-spec-ack-svc (CRS domain service). Covers Webpack 5 Module Federation,
  @cmschassis plugin lifecycle (declare/activate), Zustand state management, multi-DB
  ThreadLocal routing (PostgreSQL/Oracle/Sybase), Keycloak/SAM3 JWT auth, CyberArk Conjur
  secrets injection, and GitHub Actions + Helm ECP deployment.
  Use this skill whenever a code change touches: adding/modifying a plugin or MFE remote,
  cross-MFE communication (LisApiContext, command bus, window.$lisHubApp), API layer
  (Axios interceptors, ServiceParameterVo, generated clients), auth/token flow (Keycloak,
  per-lab scopes, JWT validation in hub-svc), database routing (DataSourceContextHolder,
  Oracle/Sybase/PostgreSQL DataSource config), Spring Boot service configuration,
  environment variables or config injection (nginx sed, values-*.yaml, ConfigMap, Conjur),
  CI/CD workflows (.github/workflows/), Dockerfile or nginx-spa.conf, craco.config.js
  or Module Federation config, Zustand stores (states/), or routing (Router/routes-config.tsx).
  Even if the user doesn't mention "architecture", use this skill for any change that spans
  multiple repos, crosses the shell-plugin contract, or touches backend security/database config.
---

# LIS CRS Revamp — Architecture Reference

This skill is your architectural compass for the **CRS Revamp 5-repo ecosystem**.
Before making any change that crosses module/repo boundaries, read the relevant section below.

## Table of Contents

| Section | Topic |
|---|---|
| [1. Quick Orientation](#1-quick-orientation) | 5-repo model, core pattern summary |
| [2. MFE Shell–Plugin Contract](#2-mfe-shellplugin-contract) | Module Federation, lifecycle, shared deps |
| [3. Cross-MFE Communication](#3-cross-mfe-communication) | LisApiContext, command bus, window.$lisHubApp |
| [4. API Layer & Multi-tenancy](#4-api-layer--multi-tenancy) | Axios, ServiceParameterVo, generated clients |
| [5. Auth & Tokens](#5-auth--tokens) | Keycloak OIDC, per-lab scopes, interceptors |
| [6. Backend Services](#6-backend-services) | lis-hub-svc vs lis-crs-spec-ack-svc, security asymmetry |
| [7. Database Routing](#7-database-routing) | DataSourceContextHolder, PostgreSQL/Oracle/Sybase |
| [8. State Management](#8-state-management) | Zustand store map, what lives where |
| [9. Routing](#9-routing) | React Router v6, URL→view lifecycle |
| [10. Config & Environment Variables](#10-config--environment-variables) | Four-tier model, .env / nginx sed / ConfigMap / Conjur |
| [11. CI/CD & Deployment](#11-cicd--deployment) | GitHub Actions pipelines, Helm, OpenShift |
| [Reference Files](#reference-files) | Full detail in references/ |

---

## 1. Quick Orientation

The CRS Revamp workspace contains **5 co-located polyrepos**:

```
crs-revamp/
  lis-hub-app          Shell Host MFE — portal entry point, owns routing & auth
  lis-crs-common-app   CRS Plugin Remote — contributes CRS views/menus to Hub
  lab-crs-app          Specimen Ack Sub-Remote — consumed by lis-crs-common-app
  lis-hub-svc          Hub BFF — Spring Boot 3.3.13, port 5000, fully secured
  lis-crs-spec-ack-svc CRS Domain Service — Spring Boot, port 8118, ⚠️ security DISABLED
```

**Module Federation chain:**
```
lis-hub-app (LisHubAppModule, port 3000)
  └─ lis-crs-common-app (pluginId=CRS, port 3010)      ← Level-1 remote
       └─ lab-crs-app (LabCrsSpecimenApp, port 3001)   ← Level-2 sub-remote
  └─ other lab remotes (hospMFUrl — dynamic from BFF)
```

**Core technology choices:**
- **Webpack 5 Module Federation** (via CRACO 7.1.0) — runtime plugin loading, no Single-SPA
- **`@cmschassis/react-spa`** — plugin lifecycle: `declare()` contributes, `activate()` mounts
- **React 18 + React Router v6** — shell owns ALL routing; remotes use MemoryRouter if needed
- **Zustand 4.5.1** — shell state; remotes access **only** via `LisApiContext`
- **Scoped Emotion cache** (`key: pluginId.toLowerCase()`) — each plugin gets its own CSS namespace
- **All frontend HTTP is POST via Axios** — every backend call carries `ServiceParameterVo`
- **Keycloak (SAM3)** — OIDC per-lab scoped tokens
- **nginx startup `sed`** — single image, URL injection at container start
- **CyberArk Conjur** — runtime secrets injection in backend pods (base image: `conjur-13.0`)

⚠️ **Security asymmetry:** `lis-hub-svc` is fully OAuth2/JWT secured. `lis-crs-spec-ack-svc`
has `ha-spring-boot-starter-security` **commented out** — open `@CrossOrigin(origins = "*")`.
Relies on K8s NetworkPolicy for isolation. Only the BFF (`lis-hub-svc`) validates JWTs.

Full topology: see [references/01-system-architecture.md](references/01-system-architecture.md).

---

## 2. MFE Shell–Plugin Contract

### How remotes are loaded

1. After login, `lis-hub-svc` returns `hospMFUrl` per lab in `Sam3LisApplicationVo`
2. This URL is stored in `useGlobalStore.hospMFUrl`
3. `System.tsx` passes it as a `PluginDescriptor` to `<Hub>`
4. `Hub/useHubApp.ts` calls `pluginLoader.loadPlugin(manifestModule)` on each loaded remote
5. Every plugin **must** export two functions from its manifest:
   - `declare()` — contributes menus, views, commands to the manifest stores
   - `activate(apiContext: LisApiContext)` — registers command handlers, mounts React trees

```
Remote URL (hospMFUrl)
  └─ /remoteEntry.js        ← always no-cache (nginx rule)
       └─ .../Manifest      ← CmsPlugin module
            ├─ declare()    ← contributes to useMenuStore / useViewStore / useCmdStore
            └─ activate()   ← gets LisApiContext, mounts React
```

**nginx cache rule is critical:** `remoteEntry.js` is served with `no-store, no-cache`.
Never cache this file — it is the plugin discovery entry point.

### Shared dependencies (singleton)

`react` and `react-dom` are **singleton** in Module Federation — mismatching versions
between shell and remote will cause runtime errors. Keep them aligned.

Also shared (must match across shell and all remotes):
`@cmschassis/react-spa`, `@cmschassis/cms-js`, `@cmschassis/react-ui`, `@lis/lis-hub-lib`, `@mui/material`, `zustand`, `axios`

Full details: [references/02-mfe-architecture.md](references/02-mfe-architecture.md).

---

## 3. Cross-MFE Communication

There are **three** mechanisms. Use the right one for the context:

| Mechanism | Use when |
|---|---|
| `LisApiContext` (via `activate(context)`) | Normal plugin→shell interaction; state reads/writes |
| `context.command.execute(id, arg)` | Cross-plugin actions without direct imports |
| `window.$lisHubApp` | Legacy packages that can't use Module Federation |

### LisApiContext namespaces

| Namespace | Purpose |
|---|---|
| `context.patient` | Patient selection, HKID lookup |
| `context.ui` | Open/close views, MessageBox, loading spinner |
| `context.auth` | User roles, access rights |
| `context.session` | Hospital, workstation, login ID |
| `context.command` | `register(id, fn)` + `execute(id, arg)` |
| `context.dictionary` | LIS reference data (IndexedDB cached) |
| `context.global` | Lab API URL, service params, profile code |
| `context.request` | Configured Axios instance |
| `context.globalRequest` | Pre-wired error-handling request wrapper |

**Do not** import Zustand stores directly from a remote plugin. Only use `LisApiContext`.
Source: `src/modules/states/api-provider.ts` and `src/modules/lis-js/index.ts`.

---

## 4. API Layer & Multi-tenancy

### Every API call must carry `ServiceParameterVo`

`lis-hub-svc` is **multi-tenant**: it routes to the correct hospital+lab database using
fields from `ServiceParameterVo` on every request:

```typescript
interface ServiceParameterVo {
  serverName: string;   // e.g. "QEH-CRS"  — routes to correct DB
  serverLab:  number;   // lab number
  hospital:   string;   // hospital code ("QEH", "PMH", …)
  userKey:    string;
  functionId: string;
  corpUserCode?: string;
}
```

Get the current values from `context.global.getServiceParams()` — never hardcode them.

### Axios interceptors (do not bypass)

`src/modules/api/utils/fetchers.ts` injects on every request:
- `Authorization: Bearer {token}`
- `X-HA-ProfileCode: {profileCode}`
- `ServiceParameterVo` fields
- `correlationId` (per-route), `transactionId` (per-request)

Response interceptor handles:
- **401** → `keycloak.logout()`
- **message code `1024`** → redirect to `/system-list`
- **500/503/400/403** → error dialog

### Generated API client

`src/modules/api/generated/lis-common-svc.tsx` is **auto-generated** from Swagger.
Do not edit it manually. To regenerate: `npm run genapi` (uses `restful-react.config.js`
pointing at `/v3/api-docs/public-api` on `lis-hub-svc`).

Full patterns: [references/03-backend-microservices.md](references/03-backend-microservices.md).

---

## 5. Auth & Tokens

**Provider:** Keycloak / SAM3, realm `lis`, client `lis-hub-app`.

**Login flow:** OIDC Authorization Code Flow (keycloak-js 22.0.5).

**Per-lab scope:** Switching labs triggers a silent token re-acquisition with scope
`lis:lis-{hosCode}-{labName}`. Never store the token outside `useKeycloakStore`.

**Token lifecycle events:**

| Event | Action |
|---|---|
| 401 response | Axios interceptor → `keycloak.logout()` |
| User idle | `react-idle-timer` → session timeout warning |
| Token near-expiry | `keycloak-js` auto-refresh |
| Logout | `removeDictionaryIndexDB()` + Keycloak redirect |

**Authorization:** call `selectAccessRight()` at login to populate the permission map.
Check `isGranted(destination, method)` before rendering sensitive UI.
`MenuVo.security` controls menu item visibility.

---

## 6. Backend Services

Two Spring Boot services with intentional security asymmetry:

| | `lis-hub-svc` (Port 5000) | `lis-crs-spec-ack-svc` (Port 8118) |
|---|---|---|
| **Role** | Hub BFF; auth gateway; multi-DB routing | CRS domain service; spec-ack, registration, search |
| **Security** | ✅ Fully secured (`ha-spring-boot-starter-security`) | ❌ Disabled (commented out in pom.xml) |
| **Auth** | JWT validation + OAuth2 Client Credentials to UAM | `@CrossOrigin(origins = "*")` — no auth |
| **Databases** | PostgreSQL + Oracle + Sybase + Redis | Oracle + Sybase only |
| **ACL** | `SecurityServiceImpl` (812 lines) — `isGranted()`, `hasRight()` | None |

**Why this asymmetry?** `lis-hub-svc` is the validated entry point for all browser traffic.
`lis-crs-spec-ack-svc` is only reachable within the K8s cluster (NetworkPolicy). The BFF acts
as the security boundary. When working on either backend, respect this design.

Full backend detail: [references/03-backend-microservices.md](references/03-backend-microservices.md).

---

## 7. Database Routing

`lis-hub-svc` routes each request to the correct hospital+lab database using a **ThreadLocal** pattern:

```java
// DataSourceContextHolder.java
// Set from ServiceParameterVo before each JDBC call:
DataSourceContextHolder.setServerInfo(new ServerInfo(serverName, labNo));
// dataSourceMap.get(key) returns the matching DataSource (PG / Oracle / Sybase)

// Labs routed to PostgreSQL (COMMON_USED_LAB):
// CPS, HMS, IMS, APS, BBS, MBS, VRS, CRS
```

`DataSourceAspect` uses `@Around` AOP to override the ThreadLocal for `QueueConfigRepository`
and `GlobalCtrRepository` specifically.

`lis-crs-spec-ack-svc` uses Oracle + Sybase. A `repository/temp/` package is an active
**Sybase→PostgreSQL migration** in progress — add new methods to both packages.

---

## 8. State Management

All application state lives in Zustand stores under `src/modules/states/`.
Shell-owned stores — never import these directly from a remote plugin:

| Store | File | Owns |
|---|---|---|
| `useGlobalStore` | `states/global/` | hospMFUrl, serviceParams, profileCode |
| `useAuthStore` | `states/auth/` | Keycloak instance, token, user info |
| `useSessionStore` | `states/session/` | hospital, workstation, labCode |
| `usePatientStore` | `states/patient/` | selected patient, HKID |
| `useDictionaryStore` | `states/dictionary/` | LIS reference data (IndexedDB cached) |
| `useViewStore` | `states/view/` | DOM nodes per view, tab list |
| `useMenuStore` | `states/manifest-store.ts` | contributed menus, commands, views |
| `useCmdStore` | `states/command-store.ts` | command bus handlers |
| `usePreferenceStore` | `states/preference-store.ts` | theme, language |
| `useCorrelation` | `states/correlation-store.ts` | correlationId per route |

Remote plugins access all of the above through `LisApiContext` namespaces.

---

## 9. Routing

The **shell owns all routing**. Remotes do not have their own router.

```
/                          → redirect → /system-list
/system-list               → hospital/lab selector
/land/:labCode/:hosCode    → SimpleLandingPage (login to lab)
/land/:labCode/:hosCode/:viewId  → ViewHandler → RootTabs → active DOM node
```

**Opening a view from a plugin:**
1. Call `context.command.execute("open.{viewId}", payload)` — or —
2. Call `context.ui.openView(viewId, label)`
   → `useViewStore.createView()` creates a raw `<div>`
   → Plugin mounts `createRoot(div).render(<MyPage />)`
   → Shell updates URL + RootTabs

Views remain **mounted but CSS-hidden** on tab switch — never unmounted. State is preserved.

---

## 10. Config & Environment Variables

### Four-tier model

```
Tier 1 (build-time)  → .env / .env.local   →  REACT_APP_* baked into JS bundle (frontend)
Tier 2 (runtime)     → nginx startup sed    →  __PLACEHOLDER__ → actual URL in JS bundle
Tier 3 (deploy-time) → K8s ConfigMap/Secret →  values-{ENV}.yaml envFrom → container env vars
Tier 4 (runtime-JVM) → CyberArk Conjur      →  conjur-13.0 base image injects secrets at pod start
```

**Frontend key rule:** URLs that differ per environment go in `values-{ENV}.yaml` as
ConfigMap data. The nginx startup script performs `sed` substitution at container start.

**Backend key rule:** Sensitive credentials (DB passwords, OAuth secrets, PAS API key)
are NOT in ConfigMap — they are injected by the Conjur sidecar from the
`openjdk17:ecp-v25.11-openjdk17-17.0.17-conjur-13.0` base image. Non-sensitive config
(DB host, port, feature flags) lives in `values-{ENV}.yaml`.

**Adding a new backend URL (frontend consumption):**
1. Add `__REACT_APP_NEW_SVC_URL__` placeholder in `.env`
2. Add `LIS_NEW_SVC_ROOT_URL` to all `values-*.yaml` ConfigMap data sections
3. Add `sed` line in the nginx startup script for the new placeholder
4. Add `REACT_APP_NEW_SVC_URL` to `.env.local` for local dev

### Local development

No Docker needed for frontends. `npm start` uses the CRACO dev-server.

| App | Port | Start command |
|---|---|---|
| `lis-hub-app` | 3000 | `npm start` — shell host |
| `lis-crs-common-app` | 3010 | `npm start` — CRS shell remote |
| `lab-crs-app` | 3011 | `npm start` — CRS plugin sub-remote |
| `lis-hub-svc` | 8080 | `mvn spring-boot:run` |
| `lis-crs-spec-ack-svc` | 8090 | `mvn spring-boot:run` |

Configure `.env.local` in each frontend repo with backend URLs pointed at localhost ports.

---

## 11. CI/CD & Deployment

### Pipeline summary

| Trigger | Pipeline | Stages |
|---|---|---|
| Push to `feature/*` | Feature branch | Build → Test → ContainerBuild → DeployDEV |
| Push to `release/*` | Release | Build → Test → ScanCode (Sonar) → ScanOSS → ContainerBuild → DeploySIT+DEVQA+LPT |
| Manual | Hotfix deploy | Deploy only (existing image tag) |

All pipelines delegate to `CDRA/workflow-template@v1.6.1` reusable workflows.

**Image tags:** `docker-dev-lis/{service}:{branch}-{sha}` for dev; `docker-rel-lis/{service}:{tag}` for release.

**Frontend base image:** `nginx:ecp-...` (standard ECP nginx)
**Backend base image:** `openjdk17:ecp-v25.11-openjdk17-17.0.17-conjur-13.0` (Conjur-enabled JVM)

**Deploy command:**
```bash
helm upgrade --install lis-hub-app ha-app \
     -f values-{ENV}.yaml \
     --set image.tag={branch-or-tag}
```

**Environment matrix:**

| Env | Cluster | Namespace | Trigger |
|---|---|---|---|
| DEV | C1 | `lis-dev` | feature push |
| DEVQA | C2 | `lis-devqa` | release tag |
| SIT | C1 + C2 | `lis-sit` | release tag (HA pair) |
| LPT | C2 | `lis-lpt` | release tag |
| DEMO | — | — | manual |

Full pipeline and secrets details: [references/04-infrastructure-deployment.md](references/04-infrastructure-deployment.md).

---

## Reference Files

Read these only when you need full detail for a specific area:

| File | Contents |
|---|---|
| [references/01-system-architecture.md](references/01-system-architecture.md) | 5-repo polyrepo topology, full tech stack table, MF loading chain, env topology, security asymmetry |
| [references/02-mfe-architecture.md](references/02-mfe-architecture.md) | Module Federation config, plugin lifecycle (declare/activate), scoped Emotion, routing, command bus, Zustand store catalog |
| [references/03-backend-microservices.md](references/03-backend-microservices.md) | Both Spring Boot services from source: DataSourceContextHolder, SecurityServiceImpl, CustomOAuthClientService, controller catalogue, Redis, Micrometer |
| [references/04-infrastructure-deployment.md](references/04-infrastructure-deployment.md) | Dockerfiles (frontend nginx + backend Conjur JVM), four-tier env model, full CI/CD pipelines, Helm values, K8s secrets, Conjur injection |
