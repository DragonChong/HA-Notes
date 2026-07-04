# 04  Infrastructure & Deployment

## Dockerfiles

### Frontend (lis-hub-app, lis-crs-common-app, lab-crs-app)

| File | Use |
|---|---|
| `Dockerfile` (root) | Production CI/CD  single-stage, accepts pre-built `build/` artifact |
| `.devops/config/Dockerfile` | Dev reference  two-stage (node build + nginx) |

Both produce an ECP nginx runtime image. The nginx startup script performs `sed`
substitution to inject environment-specific URLs into the pre-built JS bundle:

```dockerfile
# nginx startup (simplified)
sed -i "s|__REACT_APP_LIS_HUB_URL__|${LIS_HUB_ROOT_URL}|g" /app/static/js/*.js
```

### Backend (lis-hub-svc, lis-crs-spec-ack-svc)

Both backend services use a **CyberArk Conjur-enabled base image**:

```dockerfile
FROM openjdk17:ecp-v25.11-openjdk17-17.0.17-conjur-13.0 AS runtime
COPY target/*.jar app.jar
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

The `conjur-13.0` base image includes a Conjur sidecar that injects secrets (DB
passwords, OAuth client secrets, PAS API keys) as environment variables at pod start,
before the JVM process launches.

## Four-Tier Config Model

```
Tier 1 (build-time)   .env / .env.local        REACT_APP_* baked into JS bundle
Tier 2 (runtime-FE)   nginx startup sed         __PLACEHOLDER__  actual URL in JS
Tier 3 (deploy-time)  K8s ConfigMap/Secret      values-{ENV}.yaml envFrom  env vars
Tier 4 (runtime-JVM)  CyberArk Conjur sidecar   secrets injected before JVM start
```

## Helm Values Structure

Each service has `values-{ENV}.yaml` files per environment:

```yaml
# values-DEV.yaml (frontend  configmap.data)
configmap:
  data:
    LIS_HUB_ROOT_URL: "https://lis-hub-dev.example.com"
    LIS_CRS_SPEC_ACK_URL: "https://lis-crs-spec-ack-dev.example.com"
    KEYCLOAK_URL: "https://keycloak-sam3-dev.example.com"
```

Backend `values-{ENV}.yaml` contains non-sensitive config only:
```yaml
# values-DEV.yaml (backend  configmap.data)
configmap:
  data:
    DB_HOST: "oracle-dev.example.com"
    DB_PORT: "1521"
    REDIS_HOST: "redis-dev.example.com"
# Sensitive values (passwords, secrets) come from Conjur  NOT in configmap
```

## CI/CD Pipelines

### Pipeline Triggers

| Trigger | Pipeline | Stages |
|---|---|---|
| Push to `feature/*` | Feature | Build  Test  ContainerBuild  DeployDEV |
| Push to `release/*` | Release | Build  Test  ScanCode  ScanOSS  ContainerBuild  DeploySIT+DEVQA+LPT |
| Manual | Hotfix deploy | Deploy only (existing image tag) |

All pipelines delegate to `CDRA/workflow-template@v1.6.1` reusable workflows.

### Image Tagging

- **Dev:** `docker-dev-lis/{service}:{branch}-{sha}` (e.g. `docker-dev-lis/lis-hub-app:feature-abc-a1b2c3d`)
- **Release:** `docker-rel-lis/{service}:{tag}`

**Frontend base image:** ECP nginx (`bitnami/nginx` variant)
**Backend base image:** `openjdk17:ecp-v25.11-openjdk17-17.0.17-conjur-13.0`

### Deploy Command

```bash
helm upgrade --install {service} ha-app \
     -f values-{ENV}.yaml \
     --set image.tag={branch-sha-or-tag}
```

## Environment Matrix

| Env | Cluster | Namespace | Trigger |
|---|---|---|---|
| DEV | C1 (tstcld61) | `lis-dev` | feature push |
| DEVQA | C2 | `lis-devqa` | release branch |
| SIT | C1 + C2 | `lis-sit` | release branch (HA pair) |
| LPT | C2 | `lis-lpt` | release branch |
| DEMO |  |  | manual |

## Code Quality / Security Scanning

| Tool | Stage | Config |
|---|---|---|
| SonarQube | Release `ScanCode` | `sonar-project.properties`; excludes generated files |
| OSSS | Release `ScanOSS` | OSS license + CVE scan |
| ESLint | Dev + CI Test | CRA built-in |
| TypeScript | Dev + CI Build | `tsconfig.json` strict mode |
| commitlint | Pre-push (husky) | `commitlint.config.js`  conventional commits |
