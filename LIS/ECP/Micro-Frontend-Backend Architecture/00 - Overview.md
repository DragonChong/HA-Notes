---
tags:
  - architecture
  - LIS
  - ECP
  - micro-frontend
  - microservice
created: '2026-03-06'
status: final
---
# LIS ECP — Micro-Frontend / Micro-Backend Architecture Overview

This document set provides a comprehensive architectural reference for the **LIS Hub Application** (`lis-hub-app`) and its surrounding ecosystem, covering:

| Section | Topic |
|---|---|
| [[01 - System Architecture]] | High-level system topology, repository structure, components |
| [[02 - Micro-Frontend Architecture]] | Module Federation, plugin system, routing, state sharing |
| [[03 - Backend Microservices]] | Service catalogue, communication patterns, auth/authz |
| [[04 - Infrastructure and Deployment]] | Containerisation, CI/CD pipeline, environment management |

---

## System at a Glance

```mermaid
graph TB
    subgraph Browser["Browser (Clinician / Lab User)"]
        Shell["lis-hub-app\n(React Shell / MFE Host)"]
        P1["CRS Plugin\n(Remote MFE)"]
        P2["APS Plugin\n(Remote MFE)"]
        Pn["...other Lab Plugins\n(Remote MFE)"]
    end

    subgraph Platform["HA ECP (OpenShift)"]
        Nginx["nginx:5000\n(SPA + Reverse Proxy)"]
        Hub["lis-hub-svc\n(BFF / Common API)"]
        Ref["lis-reference-svc"]
        Order["lis-lab-order-svc"]
        Result["lis-lab-result-svc"]
        Patient["lis-patient-svc"]
        Test["lis-lab-test-svc"]
        Print["lis-lab-print-svc"]
        Aux["lis-aux-adaptor-svc"]
        Mock["lis-mock-svc"]
        Keycloak["Keycloak / SAM3\n(OIDC / OAuth2)"]
    end

    Shell -->|"loads remoteEntry.js\nat runtime"| P1
    Shell -->|"loads remoteEntry.js\nat runtime"| P2
    Shell -->|"loads remoteEntry.js\nat runtime"| Pn
    Browser -->|HTTPS| Nginx
    Nginx -->|"/api/*"| Hub
    Nginx -->|"/lis-reference-svc-api/*"| Ref
    Nginx -->|"/lis-lab-order-svc-api/*"| Order
    Nginx -->|"/lis-lab-result-svc-api/*"| Result
    Nginx -->|"/lis-patient-svc-api/*"| Patient
    Nginx -->|"/lis-lab-test-svc-api/*"| Test
    Nginx -->|"/lis-lab-print-svc-api/*"| Print
    Nginx -->|"/lis-aux-adaptor-svc-api/*"| Aux
    Shell -->|"OIDC Auth Code Flow"| Keycloak
```

---

## Key Architectural Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Frontend pattern | **Webpack 5 Module Federation** | Runtime plugin loading without full-page reload |
| Shell framework | **React 18 + React Router v6** | SPA with nested routing per plugin |
| State management | **Zustand** | Lightweight, no-boilerplate, selector-based subscriptions |
| API communication | **REST (HTTP POST) via Axios** | Synchronous, uniform contract across all services |
| Identity provider | **Keycloak (SAM3) — OIDC** | Per-lab scoped tokens; silent re-auth on lab switch |
| Container runtime | **OpenShift ECP** | HA enterprise platform; two-cluster (C1/C2) HA topology |
| Build/deploy | **GitHub Actions + Helm** | Centralised `CDRA/workflow-template`; immutable Helm chart |
| Config injection | **nginx startup `sed` + K8s ConfigMap** | Single image, environment-specific behaviour at runtime |
| Private registry | **JFrog Artifactory (air-gapped)** | HA internal; separate dev/rel repos with separate credentials |
