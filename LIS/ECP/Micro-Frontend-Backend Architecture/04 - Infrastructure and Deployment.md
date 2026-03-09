---
created: '2026-03-06'
status: final
tags:
  - architecture
  - infrastructure
  - deployment
  - CI/CD
  - Kubernetes
  - OpenShift
  - LIS
---
# 04 — Infrastructure & Deployment

---

## 4.1 Container Strategy

### Two-Dockerfile Design

| Dockerfile | Location | Stage | Purpose |
|---|---|---|---|
| **Release image** | `Dockerfile` (root) | Single-stage | Pre-built artifact intake; used by CI/CD pipeline |
| **Dev build image** | `.devops/config/Dockerfile` | Two-stage (build → runtime) | Full in-container build; used for initial scaffolding / reference |

Both produce the same runtime image: `bitnami/nginx` serving `build/` as an SPA with runtime URL injection.

#### Runtime URL Injection

The compiled JavaScript bundle contains placeholder strings. At container start, `sed` replaces them with values sourced from K8s ConfigMap environment variables:

```bash
sed -i "s|__REACT_APP_LIS_COMMON_URL__|${LIS_COMMON_ROOT_URL}|g"       /html/static/js/*.js
sed -i "s|__REACT_APP_KEYCLOAK_SERVER_URL__|${KEYCLOAK_SERVER_URL}|g"  /html/static/js/*.js
# ... repeated for each LIS_*_ROOT_URL
```

This allows a **single Docker image** to be promoted across DEV → DEVQA → SIT → DEMO without rebuilds.

---

## 4.2 Environment Variable Model (Three-Tier)

```mermaid
flowchart TD
    A["Tier 1: Build-time\n.env / .env.local\nREACT_APP_* baked at npm run build\n(fixed: feature flags, app version)"]
    B["Tier 2: Runtime Injection\nnginx startup sed\nReplaces __PLACEHOLDER__ with actual URL\n(varies per environment)"]
    C["Tier 3: K8s ConfigMap\nvalues-{ENV}.yaml configmap.data\n(source of truth for URLs per env)"]

    C -->|"injected as env vars"| B
    A --> Build["Compiled JS bundle"]
    B --> Deploy["Running container"]
    C --> Deploy
```

### `.env` Variables (Build-time)

| Variable | Example Value |
|---|---|
| `REACT_APP_VER` | `local` |
| `REACT_APP_ENV` | `local` |
| `REACT_APP_LIS_COMMON_URL` | proxied locally; sed-replaced in prod |
| `REACT_APP_KEYCLOAK_SERVER_URL` | Keycloak OIDC endpoint |
| `REACT_APP_SESSION_TIMEOUT` | `900000` ms |

### `values-{ENV}.yaml` ConfigMap Keys (Runtime)

| Key | DEV | SIT |
|---|---|---|
| `LIS_COMMON_ROOT_URL` | `http://lis-hub-svc:5000` | `http://lis-hub-svc-sit:5000` |
| `KEYCLOAK_SERVER_URL` | `https://sam3-dev.ha.org.hk/auth` | `https://sam3-sit.ha.org.hk/auth` |
| `LIS_CRS_ROOT_URL` | `http://crs-be-svc:5001` | `http://crs-be-svc-sit:5001` |
| `LIS_APS_ROOT_URL` | `http://aps-be-svc:5002` | `http://aps-be-svc-sit:5002` |

---

## 4.3 Container Registry

```
Registry: artifactrepo.server.ha.org.hk:55743   (JFrog Artifactory — air-gapped)

DEV builds  → docker-dev-lis/lis-hub-app:{branch-name}
REL builds  → docker-rel-lis/lis-hub-app:{branch-name}
```

- Separate Artifactory credentials for dev vs release builds
- npm packages served from Artifactory npm proxy repo (`HA_UI_NPM_TOKEN`)
- HA internal CA cert injected at build time via `CERT_HA_ROOT_CA` secret

---

## 4.4 CI/CD Pipeline

All pipelines use shared reusable workflows from `CDRA/workflow-template@v1.6.1`.

### Feature Branch Pipeline

```mermaid
flowchart LR
    Push["Push to feature/*"] --> Build["1. Build\nnpm ci + npm run build"]
    Build --> Test["2. Test\nnpm run test"]
    Test --> Container["3. BuildContainer\ndocker build + push\ndocker-dev-lis/:{branch}"]
    Container --> DeployDEV["4. Deploy DEV\nhelm upgrade --install\nC1 lis-dev namespace"]
```

### Release Pipeline

```mermaid
flowchart LR
    Tag["Push release tag"] --> Build["1. Build"]
    Build --> Test["2. Test"]
    Test --> ScanCode["3. ScanCode\nSonarQube SAST"]
    ScanCode --> ScanOSS["4. ScanOSS\nLicense + CVE scan"]
    ScanOSS --> Container["5. BuildContainer\ndocker-rel-lis/:{tag}"]
    Container --> Multi["6. Deploy\nDEVQA + SIT C1\n+ SIT C2 + LPT"]
```

### Dev Hotfix Pipeline

Direct deploy-only; skips build using a pre-existing image tag from Artifactory.

---

## 4.5 Kubernetes / OpenShift Deployment

```mermaid
graph TB
    subgraph "GitHub Actions"
        GH["Workflow Runner"]
    end

    subgraph "JFrog Artifactory"
        Reg["docker-dev-lis / docker-rel-lis"]
    end

    subgraph "OpenShift ECP — Cluster C1"
        NS_DEV["lis-dev"]
        NS_SIT1["lis-sit"]
    end

    subgraph "OpenShift ECP — Cluster C2"
        NS_SIT2["lis-sit"]
        NS_LPT["lis-lpt"]
        NS_DEVQA["lis-devqa"]
    end

    GH -->|"oc login SA token\nhelm upgrade"| NS_DEV
    GH -->|"values-SIT C1"| NS_SIT1
    GH -->|"values-SIT C2"| NS_SIT2
    GH -->|"values-DEVQA"| NS_DEVQA
    GH -->|"push image"| Reg
    Reg -->|"imagePull"| NS_DEV
    Reg -->|"imagePull"| NS_SIT1
```

### Helm Deployment

```
helm upgrade --install lis-hub-app ha-app \
     -f values-{ENV}.yaml \
     --set image.tag={branch-or-tag}
```

### Environment Matrix

| Env | Cluster | Namespace | Trigger |
|---|---|---|---|
| **DEV** | C1 | `lis-dev` | feature push |
| **DEVQA** | C2 | `lis-devqa` | release tag |
| **SIT** | C1 + C2 | `lis-sit` | release tag (HA) |
| **LPT** | C2 | `lis-lpt` | release tag |
| **DEMO** | — | — | manual |

---

## 4.6 GitHub Actions Secrets

| Secret | Purpose |
|---|---|
| `ECP_SA_TOKEN_DEV` | OpenShift SA token — DEV namespace |
| `ECP_SA_TOKEN_REL` | OpenShift SA token — SIT/DEVQA/LPT namespaces |
| `ARTIFACTORY_USER_DEV` / `ARTIFACTORY_CRD_DEV` | JFrog docker-dev-lis push |
| `ARTIFACTORY_USER_REL` / `ARTIFACTORY_CRD_REL` | JFrog docker-rel-lis push |
| `HA_UI_NPM_TOKEN` | JFrog npm proxy auth |
| `CERT_HA_ROOT_CA` | Internal CA cert for docker build |
| `SONAR_TOKEN` | SonarQube SAST auth |

---

## 4.7 Local Development

```mermaid
flowchart LR
    Dev["npm start\nCRACO dev-server\nport 3000"] -->|"/api/* proxy"| BE["lis-hub-svc\nremote dev machine\nhttp://lis-chongkw-01:5000"]
    Dev -->|"Module Federation\nremoteEntry.js"| CRS["CRS sub-app\nlocalhost:3010"]
    Dev -->|"Module Federation\nremoteEntry.js"| APS["APS sub-app\nlocalhost:3011"]
```

- `.env.local` overrides backend URLs to dev machine
- `localproxy.js` drives `devServer.proxy`: `{ '/api': process.env.REACT_APP_LIS_COMMON_URL }`
- Each sub-app MFE runs independently on its own port
- `getHospLocalDev(labName)` in `plugins.ts` maps lab name to localhost port

---

## 4.8 Quality Gates

| Tool | Stage | Config |
|---|---|---|
| **SonarQube** | Release `ScanCode` | `sonar-project.properties`; excludes `src/modules/api/generated/**` |
| **OSSS** | Release `ScanOSS` | Dependency license + CVE scanning |
| **ESLint** | Dev + CI | CRA built-in |
| **TypeScript** | Dev + CI Build | `tsconfig.json` strict mode |
| **commitlint** | Pre-push (husky) | `commitlint.config.js` — conventional commits |

---

## 4.9 nginx Configuration Highlights

| Rule | Purpose |
|---|---|
| `try_files $uri /index.html` | SPA client-side routing fallback |
| `remoteEntry.js` → `no-store no-cache` | Module Federation remote always re-fetched on app load |
| `OPTIONS` → `204` | CORS preflight handling |
| `X-Frame-Options: SAMEORIGIN` | Clickjacking protection |
