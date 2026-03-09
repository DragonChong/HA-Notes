---
created: '2026-03-09'
status: final
tags:
  - architecture
  - LIS
  - ECP
  - infrastructure
  - deployment
  - Docker
  - Kubernetes
  - Helm
  - CI-CD
  - GitHub-Actions
updated: '2026-03-09'
---
# 04 — Infrastructure and Deployment

> **Platform:** HA ECP (OpenShift Kubernetes) with Helm `ha-app` chart, GitHub Actions + CDRA reusable workflow templates, JFrog Artifactory private registry, CyberArk Conjur secrets injection.

---

## 4.1 Container Strategy

### Dockerfile Patterns

Each repo has its Dockerfile in `.devops/config/Dockerfile`.

#### Frontend Apps (lis-hub-app, lis-crs-common-app, lab-crs-app)

```mermaid
graph LR
    subgraph "Stage 1: Builder"
        N["node:18-alpine<br>npm ci<br>npm run build<br>→ /app/build/"]
    end
    subgraph "Stage 2: Runtime"
        NX["nginx:alpine<br>+ custom nginx-spa.conf<br>+ docker-entrypoint.sh<br>→ sed URL injection"]
    end
    N -->|"COPY --from=builder /app/build"| NX
```

**Key technique — `docker-entrypoint.sh` URL injection:**
```bash
#!/bin/sh
# At container start, replace __PLACEHOLDER_*__ tokens in compiled JS/HTML
for var in $(env | grep '^LIS_'); do
  key="__PLACEHOLDER_${var%%=*}__"
  value="${var#*=}"
  find /usr/share/nginx/html -name "*.js" -o -name "*.html" | \
    xargs sed -i "s|${key}|${value}|g"
done
exec nginx -g "daemon off;"
```

This means:
- **Build-time** (`npm run build`): `process.env.REACT_APP_*` values are baked in as `__PLACEHOLDER_LIS_*__` literals
- **Runtime** (container start): `nginx/docker-entrypoint.sh` replaces these tokens with actual K8s ConfigMap env values
- **Result:** A single Docker image works across ALL environments (DEV, SIT, LPT, PROD)

#### Backend Apps (lis-hub-svc, lis-crs-spec-ack-svc)

```mermaid
graph LR
    subgraph "Stage 1: Builder"
        M["maven:3.9-eclipse-temurin-17<br>mvn package -DskipTests<br>→ target/*.jar"]
    end
    subgraph "Stage 2: Runtime"
        JVM["openjdk17:ecp-v25.11-openjdk17-17.0.17-conjur-13.0<br>(HA internal base image)<br>Conjur sidecar agent built-in<br>COPY app.jar<br>ENTRYPOINT java -jar app.jar"]
    end
    M -->|"COPY --from=builder target/*.jar"| JVM
```

**Conjur base image** `ecp-v25.11-openjdk17-17.0.17-conjur-13.0` contains:
- Standard `openjdk17`
- CyberArk Conjur sidecar agent that fetches secrets from Conjur vault before JVM startup
- Secrets are written to env vars, overriding any ConfigMap values

---

## 4.2 nginx Configuration

```nginx
# nginx-spa.conf (lis-hub-app)
server {
    listen 8080;
    root /usr/share/nginx/html;
    index index.html;

    # React Router — serve index.html for all unknown paths
    location / {
        try_files $uri $uri/ /index.html;
    }

    # CRITICAL: Never cache Module Federation entry points
    location ~* remoteEntry\.js$ {
        add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0";
        expires off;
    }

    # Handle CORS preflight with 204
    if ($request_method = OPTIONS) {
        return 204;
    }

    # Static assets — long cache (content-hashed filenames)
    location ~* \.(js|css|png|jpg|gif|ico|woff2?)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## 4.3 CI/CD Pipeline Architecture

### Feature Branch Pipeline (`.github/workflows/feature-branch.yaml`)

```mermaid
flowchart LR
    Push["git push<br>feature/* branch"] --> Setup
    Setup["1. Setup<br>CDRA/workflow-template<br>Setup@v1.6.1\nNode/Java version\nArtifactory credentials"] --> Build
    Build["2. Build<br>CDRA Build@v1.6.1<br>npm ci + npm run build<br>OR mvn package"] --> BuildContainer
    BuildContainer["3. BuildContainer<br>CDRA BuildContainer@v1.6.1\ndocker build<br>docker push<br>→ docker-dev-lis:{branch}-{sha}"] --> Deploy
    Deploy["4. Deploy<br>CDRA Deploy@v1.6.1\nHelm upgrade<br>→ DEV (C1 cluster)<br>values-DEV.yaml"]
```

### Release Branch Pipeline (`.github/workflows/release.yaml`)

```mermaid
flowchart LR
    PushRel["git push<br>release/* branch"] --> Setup
    Setup["1. Setup"] --> Build
    Build["2. Build"] --> Test
    Test["3. Test<br>Unit tests<br>JUnit/Jest"] --> ScanCode
    ScanCode["4. ScanCode<br>SonarQube SAST<br>Code quality gate"] --> ScanOSS
    ScanOSS["5. ScanOSS\nOSS license scan<br>Vulnerability check"] --> BuildContainer
    BuildContainer["6. BuildContainer\ndocker push<br>→ docker-rel-lis:{semver}"] --> DeploySIT
    DeploySIT["7. Deploy SIT C1<br>Helm upgrade<br>values-SIT.yaml"] --> DeploySIT2
    DeploySIT2["8. Deploy SIT C2<br>Helm upgrade<br>values-SIT.yaml"] --> DeployLPT
    DeployLPT["9. Deploy LPT<br>Helm upgrade<br>values-LPT.yaml"] --> DeployDEVQA
    DeployDEVQA["10. Deploy DEVQA<br>Helm upgrade<br>values-DEVQA.yaml"]
```

### Deploy ECP Dev Pipeline (`.github/workflows/deploy-ecp-dev.yaml`)

```mermaid
flowchart LR
    Manual["Manual trigger<br>(workflow_dispatch)\nor PR merge"] --> Deploy
    Deploy["CDRA Deploy@v1.6.1<br>Helm upgrade --install<br>→ DEV cluster<br>values-DEV.yaml"]
```

---

## 4.4 Environment Configuration Strategy (4-Layer Model)

```mermaid
flowchart TB
    L1["Layer 1: .env / .env.local\n(Developer local overrides)\nNever committed to git\nREACT_APP_LIS_COMMON_URL=http://localhost:5000"]

    L2["Layer 2: Build-time (npm run build)\nREACT_APP_* vars baked into JS bundle\nas __PLACEHOLDER_LIS_*__ tokens\n(CRA/CRACO convention)"]

    L3["Layer 3: K8s ConfigMap + Secret\n(values-DEV.yaml / values-SIT.yaml)\nconfigMapRef: lis-hub-app-config\nsecretRef: keycloak-config, redis-config...\nInjected as env vars at pod start"]

    L4["Layer 4: CyberArk Conjur\n(Runtime injection, highest priority)\nConjur sidecar fetches all DB passwords,\nAPI keys, service credentials\nOverrides ConfigMap values\n(openjdk17 base image: conjur-13.0)"]

    L1 -->|"developer machine only"| L2
    L2 -->|"docker image (placeholder tokens)"| L3
    L3 -->|"K8s pod env vars"| L4
    L4 -->|"final JVM / nginx env"| App["Running Application"]
```

---

## 4.5 Kubernetes / Helm Configuration

### `values-DEV.yaml` Structure (lis-hub-svc example)

```yaml
# lis-hub-svc/values-DEV.yaml
image:
  repository: artifactrepo.server.ha.org.hk:55743/docker-dev-lis/lis-hub-svc
  tag: latest

service:
  port: 5000

monitoring:
  enable: true

# Environment variables injected into pod
envFrom:
  - configMapRef:
      name: uam-config          # UAM API URLs
  - secretRef:
      name: uam-secret          # UAM client_id + client_secret
  - secretRef:
      name: keycloak-config     # Keycloak realm + client config
  - secretRef:
      name: redis-config        # Redis connection string
  - secretRef:
      name: postgresql-login    # PG credentials (Conjur-injected)
  - secretRef:
      name: oracle-login        # Oracle credentials (Conjur-injected)
  - secretRef:
      name: sybase-login        # Sybase credentials (Conjur-injected)
  - secretRef:
      name: pas-api-secret      # PAS integration credentials
  - configMapRef:
      name: als-config          # App Logging Service URL
  - configMapRef:
      name: correlation-config  # Correlation service config

# Direct env vars (Kubernetes Downward API)
env:
  - name: MY_POD_NAME
    valueFrom:
      fieldRef:
        fieldPath: metadata.name
  - name: MY_NAMESPACE
    valueFrom:
      fieldRef:
        fieldPath: metadata.namespace
  - name: LOG_PRIVACY
    value: "1"
```

### `values-SIT.yaml` Key Differences

```yaml
image:
  repository: artifactrepo.server.ha.org.hk:55743/docker-rel-lis/lis-hub-svc
  # Uses docker-rel-lis (release) instead of docker-dev-lis
```

### lis-crs-spec-ack-svc Secrets (values-DEV.yaml)

```yaml
envFrom:
  - secretRef:
      name: sybase-login        # Sybase DB credentials
  - secretRef:
      name: postgresql-login    # PostgreSQL credentials (migration target)
  - secretRef:
      name: oracle-login        # Oracle credentials
```

---

## 4.6 JFrog Artifactory Registry

| Registry | Path | Usage |
|---|---|---|
| **Dev registry** | `artifactrepo.server.ha.org.hk:55743/docker-dev-lis/` | Feature branch images; `:{branch}-{sha}` tags |
| **Release registry** | `artifactrepo.server.ha.org.hk:55743/docker-rel-lis/` | Release branch images; `:{semver}` tags |

- Air-gapped private registry (no internet access from ECP cluster)
- GitHub Actions authenticates via `ARTIFACTORY_USER` + `ARTIFACTORY_PASSWORD` secrets
- Maven builds also pull from Artifactory Maven repos (private HA internal jars: `ha-spring-boot-starter-*`)

---

## 4.7 CyberArk Conjur Secrets Management

```mermaid
sequenceDiagram
    participant OCP as OpenShift Pod Scheduler
    participant Base as Conjur Sidecar\n(in base image)
    participant CV as CyberArk Conjur Vault
    participant JVM as Spring Boot JVM

    OCP->>Base: start pod (Conjur sidecar auto-runs first)
    Base->>CV: authenticate (pod identity / service account)
    CV-->>Base: authenticated session
    Base->>CV: fetch secrets:\n  DB passwords\n  API keys\n  Service credentials
    CV-->>Base: secret values
    Base->>Base: write secrets to process env / files
    Base->>JVM: start JVM after secrets are ready
    JVM->>JVM: reads secrets from env as ${DB_PASSWORD} etc.
```

**Why Conjur over K8s Secrets?**
- Secrets in K8s Secrets are base64-encoded, accessible to any cluster admin
- Conjur enforces fine-grained ACL per application identity
- Dynamic secret rotation without pod restart (re-fetched on next start)
- Full audit trail of secret access

---

## 4.8 Environment Matrix

| Environment | Cluster | Image Registry | Deploy Trigger | values file |
|---|---|---|---|---|
| **DEV** | ECP C1 | `docker-dev-lis` | Auto on feature branch push | `values-DEV.yaml` |
| **DEVQA** | ECP | `docker-rel-lis` | Auto on release branch | `values-DEVQA.yaml` |
| **SIT C1** | ECP C1 | `docker-rel-lis` | Auto on release branch | `values-SIT.yaml` |
| **SIT C2** | ECP C2 | `docker-rel-lis` | Auto on release branch | `values-SIT.yaml` |
| **LPT** | ECP C2 | `docker-rel-lis` | Auto on release branch | `values-LPT.yaml` |
| **PROD** | ECP | `docker-rel-lis` | Manual gate | `values-PROD.yaml` |

---

## 4.9 GitHub Actions Secrets Required

| Secret | Used By | Purpose |
|---|---|---|
| `ARTIFACTORY_USER` | All repos | JFrog Artifactory pull/push auth |
| `ARTIFACTORY_PASSWORD` | All repos | JFrog Artifactory pull/push auth |
| `SONAR_TOKEN` | Release pipeline | SonarQube code quality scan |
| `ECP_KUBECONFIG_DEV` | Feature branch | kubectl/Helm access to DEV cluster |
| `ECP_KUBECONFIG_SIT` | Release pipeline | kubectl/Helm access to SIT cluster |
| `NPM_AUTH_TOKEN` | Frontend repos | JFrog NPM registry (`@lis/lis-hub-lib`, `@cmschassis/*`) |

---

## 4.10 Local Development Setup

```mermaid
graph LR
    Dev["Developer Machine"]

    subgraph "Running locally"
        Hub["lis-hub-app\n:3000\nnpm start\n(CRACO dev server)"]
        CRS["lis-crs-common-app\n:3010\nnpm start"]
        LAB["lab-crs-app\n:3001\nnpm start"]
        HubSvc["lis-hub-svc\n:5000\nSpring Boot\nDevTools"]
        SpecAck["lis-crs-spec-ack-svc\n:8118\nSpring Boot\nDevTools"]
    end

    subgraph "Remote (VPN required)"
        REMDB["Hospital DB servers\n(Oracle / Sybase / PG)"]
        REMKC["Keycloak / SAM3\n(DEV cluster)"]
        REMUAM["UAM Service\n(DEV cluster)"]
    end

    Dev --> Hub
    Hub -->|"localproxy.js:\n/api → :5000"| HubSvc
    Hub -->|"craco .env.local:\nLIS_COMMON_URL=:5000"| HubSvc
    Hub -->|"craco: CRS@:3010"| CRS
    CRS -->|"craco: LabCrsSpecimenApp@:3001"| LAB
    HubSvc --- REMDB
    HubSvc --- REMKC
    HubSvc --- REMUAM
```

**`.env.local` overrides for hub-svc proxy:**
```bash
# lis-hub-app/.env.local
REACT_APP_LIS_COMMON_URL=http://lis-chongkw-01:5000

# lis-crs-common-app/.env (local dev)
# craco.config.js: consumes LabCrsSpecimenApp@http://lis-chongkw-01:3001
```
