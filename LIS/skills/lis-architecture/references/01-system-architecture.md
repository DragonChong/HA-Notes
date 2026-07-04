# 01  System Architecture

## Polyrepo Model

The CRS Revamp workspace contains **five co-located polyrepos**  not a Monorepo (no Nx,
Lerna, Turborepo, or Yarn workspaces). Each repo is independently versioned and deployed,
but they are co-located in the same workspace directory for cross-repo development.

```
crs-revamp/
 lis-hub-app/          # Level-0 Shell Host (MFE orchestrator)
 lis-crs-common-app/   # Level-1 CRS Shell Remote (React + CRACO)
 lab-crs-app/          # Level-2 CRS Plugin Sub-Remote (React + CRACO)
 lis-hub-svc/          # Backend: LIS Hub Spring Boot service
 lis-crs-spec-ack-svc/ # Backend: CRS Spec-Ack Spring Boot service
```

## MF Loading Chain

```
lis-hub-app (Shell Host)
   [Module Federation]  loads lis-crs-common-app (remoteEntry.js @ port 3010)
        [Module Federation]  loads lab-crs-app (remoteEntry.js @ port 3011)
```

`lis-hub-app` is the top-level host; it loads `lis-crs-common-app` as a Level-1 remote.
`lis-crs-common-app` is itself a host for `lab-crs-app` (Level-2 sub-remote).
The shell never directly loads `lab-crs-app`.

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Build / bundler | Webpack 5 via CRACO | `@craco/craco` 7.1.0 |
| Frontend framework | React | 18.x |
| MFE chassis | `@cmschassis/react-spa` | workspace pkg |
| State management | Zustand | 4.5.1 |
| HTTP client | Axios | 1.11.0 |
| UI components | `@cmschassis/react-ui` + MUI v5 |  |
| CSS-in-JS | Emotion (scoped per plugin) |  |
| Backend framework | Spring Boot | 3.3.13 |
| Backend language | Java | 17 |
| Database | Oracle + Sybase (multi-tenant routing) |  |
| Cache | Redis | Spring Data Redis |
| Auth (hub-svc) | OAuth2 Resource Server + Keycloak |  |
| Auth (spec-ack-svc) | **DISABLED**  `ha-spring-boot-starter-security` commented out |  |
| Secrets injection | CyberArk Conjur | conjur-13.0 base image |
| Observability | Micrometer + Actuator |  |
| Container orchestration | Kubernetes + Helm |  |

## Security Asymmetry 

`lis-hub-svc` is **fully secured**: OAuth2 resource server, role/scope checks via
`SecurityServiceImpl` (812 lines), `@PreAuthorize` on endpoints.

`lis-crs-spec-ack-svc` has security **DISABLED**:
- `ha-spring-boot-starter-security` is commented out in `pom.xml`
- All endpoints use `@CrossOrigin(origins = "*")`
- No authentication required for any CRS spec-ack endpoints

Always validate API origin when writing code that calls backend services.

## Environment Topology

| Env | Cluster | Namespace | Keycloak |
|---|---|---|---|
| DEV | C1 (tstcld61) | `lis-dev` | SAM3 DEV |
| DEVQA | C2 | `lis-devqa` | SAM3 DEV |
| SIT | C1 + C2 | `lis-sit` | SAM3 SIT |
| LPT | C2 | `lis-lpt` | SAM3 SIT |
| DEMO |  |  |  |
