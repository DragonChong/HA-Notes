# 03  Backend Microservices

> Backend source code IS present in this workspace (`lis-hub-svc/` and `lis-crs-spec-ack-svc/`).
> All analysis below is from source code, not inferred.

## Service Comparison

| Aspect | `lis-hub-svc` | `lis-crs-spec-ack-svc` |
|---|---|---|
| Framework | Spring Boot 3.3.13 / Java 17 | Spring Boot 3.x / Java 17 |
| Security | ENABLED  OAuth2 RS + Keycloak | DISABLED  security starter commented out |
| CORS | Restricted | `@CrossOrigin(origins = "*")` on all controllers |
| Database | Oracle + Sybase (multi-tenant routing) | Oracle + Sybase (+ active SybasePG migration) |
| Cache | Redis (`RedisConfig`, Jackson serializer) | None |
| Auth source | Keycloak + UAM | None |

## lis-hub-svc Architecture

### Multi-Tenant Database Routing

`DataSourceContextHolder` (ThreadLocal) + `RoutingDataSource` (extends `AbstractRoutingDataSource`)
routes each request to the correct data source.

`COMMON_USED_LAB` constant lists all lab codes that share a common Oracle schema.
Labs outside `COMMON_USED_LAB` get their own `DataSource` bean.

`DataSourceAspect` (@Around AOP) inspects incoming request lab codes and sets the
ThreadLocal before the service layer executes.

```java
// Pattern
DataSourceContextHolder.setDataSourceKey(labCode);
try { return joinPoint.proceed(); }
finally { DataSourceContextHolder.clearDataSourceKey(); }
```

### Security Layer

`SecurityServiceImpl` (~812 lines) provides ACL enforcement:
- Validates OAuth2 JWT scopes and roles
- Checks UAM (User Access Management) permissions via `UamProperties` YAML binding
- `@PreAuthorize` annotations on all protected endpoints

`CustomOAuthClientService` manages OAuth2 client credentials flow for service-to-service calls.

`PasApiServiceImpl` integrates with the PAS (Patient Administration System) external API.

### Redis Configuration

`RedisConfig` configures a Spring Data Redis `RedisTemplate<String, Object>` with a
Jackson2JsonRedisSerializer using a custom ObjectMapper (date handling, type inclusion).
Used for caching frequently accessed reference data.

### UamProperties

YAML-bound configuration (`@ConfigurationProperties`) for UAM LDAP/group mappings.
Controls which AD groups map to which application roles.

## lis-crs-spec-ack-svc Architecture

### Security Status 
```xml
<!-- pom.xml  security starter is commented out -->
<!-- <dependency>
       <groupId>com.hk.ha</groupId>
       <artifactId>ha-spring-boot-starter-security</artifactId>
     </dependency> -->
```
All 7 controllers expose endpoints without authentication.

### Controller Catalogue

| Controller | Responsibility |
|---|---|
| `SpecAckController` | CRS spec acknowledgement CRUD |
| `SpecAckItemController` | Line-item operations for spec-ack |
| `OrderController` | Order lookup and status |
| `PatientController` | Patient demographic retrieval |
| `ReferenceDataController` | Lab reference data (test codes, categories) |
| `ReportController` | Spec-ack report generation |
| `StatusController` | Health / readiness probe |

### Active Database Migration

`src/main/resources/repository/temp/` contains active SybasePostgreSQL migration scripts.
This indicates `lis-crs-spec-ack-svc` is mid-migration; PostgreSQL support is in progress.

### API Structure

All endpoints return `ResultDataResponse<T>` wrapper:
```json
{ "success": true, "data": { ... }, "traceId": "...", "spanId": "..." }
```
