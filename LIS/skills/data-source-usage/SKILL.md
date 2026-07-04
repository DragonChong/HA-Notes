---
name: data-source-usage
description: >
  Guides developers on using the LIS `data-source` library — a Spring Boot multi-database
  dynamic routing library that supports Sybase, PostgreSQL, and Oracle.
  Use this skill whenever a developer is:
  - Setting up the data-source library in a new or existing LIS microservice
  - Configuring multi-database connections (pom.xml, application.yml, values-ENV.yml)
  - Designing or implementing the three-tier repository folder structure (postgresql/sybase/temp)
  - Using DataSourceContextHolder for runtime database switching
  - Using the @RepositoryType annotation for automatic lab routing
  - Handling optional Oracle availability with conditional wiring
  - Asking about string trimming, case-sensitive table/column names, HikariCP tuning,
    JTA/distributed transactions, connection pool management, or troubleshooting errors
  - Asking about LabType enum constants or DatabaseConstants
  - Writing services or controllers that query multiple hospitals/labs
---

# data-source Library Usage Guide

This skill covers end-to-end usage of the `data-source` library for LIS microservices.
The library provides dynamic multi-database routing across Sybase, PostgreSQL, and Oracle
for a multi-tenant healthcare system.

---

## Key Concepts (read first)

| Concept | Short Description |
|---------|-------------------|
| `DataSourceContextHolder` | ThreadLocal holder; sets which `server + lab + database` the current request uses |
| `@RepositoryType` | Annotation on a repository interface; automatically routes to the correct lab without manual context switching |
| Repository hierarchy | PostgreSQL repo is the base; Sybase and Temp repos extend it |
| `DynamicDataSourceProperties` | Bound from `database-config.*` in `application.yml` |
| `LabType` enum | Symbolic constants for lab numbers (e.g. `LabType.CRS.getNumber()` = 9) |
| `DatabaseConstants` | Constants for database names (`LAB_DB`, `COM_DB`, `ADA_DB`, `INT_DB`) and repo types |

---

## 1. Maven Dependency

```xml
<!-- In the consumer service's pom.xml -->
<dependency>
    <groupId>hk.org.ha.lis</groupId>
    <artifactId>data-source</artifactId>
    <version>${project.version}</version>
</dependency>

<!-- Manage Oracle JDBC driver version -->
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>com.oracle.database.jdbc</groupId>
            <artifactId>ojdbc8</artifactId>
            <version>21.8.0.0</version>
        </dependency>
    </dependencies>
</dependencyManagement>
```

---

## 2. Spring Boot Main Class

Both annotations are **mandatory**:

```java
@SpringBootApplication
@EnableConfigurationProperties({DynamicDataSourceProperties.class})
@ComponentScan(basePackages = {"hk.org.ha.lis"})   // MUST be exactly this package
public class LisApplication {
    public static void main(String[] args) {
        SpringApplication.run(LisApplication.class, args);
    }
}
```

> **Why**: `@EnableConfigurationProperties` loads `database-config.*` into `DynamicDataSourceProperties`.
> `@ComponentScan` ensures the library's own `@Configuration` classes and `@Repository` beans are picked up.

---

## 3. Configuration

### 3a. Kubernetes / values-ENV.yml

Wire secrets and ConfigMaps for each database that the service needs:

```yaml
containers:
  envFrom:
    - secretRef:
        name: sybase-login
    - secretRef:
        name: postgresql-login
    - secretRef:
        name: oracle-login         # omit if Oracle is not used
    - configMapRef:
        name: sybase-jdbc
    - configMapRef:
        name: postgresql-jdbc
    - configMapRef:
        name: oracle-jdbc          # omit if Oracle is not used
```

### 3b. application[-env].yml

```yaml
database-config:
  temp-package: hk.org.ha.lis.repository.temp   # required

  # Optional filters — omit each key to allow ALL values
  hosp: PWH,QMH        # filter hospitals
  lab: 8,9             # filter labs (CORP schema is unaffected)
  schema: CORP,LAB,ADA,INT

  jta:
    enabled: false     # true = Atomikos XA for atomic cross-DB transactions

  oracle:
    entity: hk.org.ha.lis.model.entity, com.yourcompany.model.entity  # optional
    hikari:
      maximum-pool-size: 20
      minimum-idle: 0
      connection-timeout: 10000
      idle-timeout: 30000
      max-lifetime: 1800000

  sybase:
    entity: hk.org.ha.lis.model.entity
    repository:
      base-packages: hk.org.ha.lis.patient.repository.sybase
    hikari:
      maximum-pool-size: 20
      minimum-idle: 0
      connection-timeout: 10000

  postgresql:
    entity: hk.org.ha.lis.model.entity
    repository:
      base-packages: hk.org.ha.lis.patient.repository.postgresql
    hikari:
      maximum-pool-size: 20
      prepareThreshold: 0    # Disable server-side prepared statements (optional)
```

> **If your project's base package is not `hk.org.ha.lis`**, add your own entity package to all three
> `entity:` fields: `hk.org.ha.lis.model.entity, com.yourcompany.project.model.entity`

#### When to enable JTA

| Situation | JTA enabled? |
|-----------|-------------|
| Oracle message queue + Sybase/PG must commit atomically | ✅ `true` |
| Single-database operations or loose consistency is acceptable | ❌ `false` (default, faster) |

---

## 4. Repository Structure

Always create exactly this three-tier package structure:

```
hk.org.ha.lis.[service].repository
  ├── postgresql/     ← Base JPA interfaces (PostgreSQL)
  ├── sybase/         ← Interfaces prefixed "Sybase", extend postgresql ones
  └── temp/           ← Interfaces prefixed "Postgres", extend postgresql ones
```

**Naming convention:**

| Package | Class prefix | Extends |
|---------|-------------|---------|
| `postgresql` | _(no prefix)_ | `JpaRepository<Entity, ID>` |
| `sybase` | `Sybase` | the `postgresql` counterpart |
| `temp` | `Postgres` | the `postgresql` counterpart |

Example:
```java
// postgresql/PatientRepository.java
@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> { ... }

// sybase/SybasePatientRepository.java
@Repository
public interface SybasePatientRepository extends PatientRepository { ... }

// temp/PostgresPatientRepository.java
@Repository
public interface PostgresPatientRepository extends PatientRepository { ... }
```

---

## 5. DataSourceContextHolder — Runtime Switching

Always call `setCurrentDb()` at the entry point (controller or service) before any repository access.

### Full switch

```java
// Sets server + lab + database for the current thread
DataSourceContextHolder.setCurrentDb(serverName, lab, database);
```

### Partial switches (change only one dimension)

```java
DataSourceContextHolder.switchServer(newServer);     // keep lab + database
DataSourceContextHolder.switchLab(newLab);           // keep server + database
DataSourceContextHolder.switchDatabase(newDatabase); // keep server + lab
DataSourceContextHolder.switchCorp();                // switch to CORP schema
```

### Mapping hospital code → server name

```java
String serverName = DataSourceContextHolder.getServerNameByHospCode(hospCode);
DataSourceContextHolder.setCurrentDb(serverName, lab, database);
```

> **Thread safety**: `DataSourceContextHolder` is ThreadLocal — safe under concurrent requests.
> Clear context after use when running scheduled tasks or async code to avoid cross-request leakage.

---

## 6. @RepositoryType Annotation — Automatic Lab Routing

Prefer `@RepositoryType` over manual `switchLab()` calls to make routing intent explicit.

**You still need one initial `setCurrentDb()` to establish the server; the annotation handles lab routing from there.**

### Common tables (always lab 9)

```java
@RepositoryType(type = DatabaseConstants.REPOSITORY_TYPE_COMMON)
@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> { ... }

// With specific database
@RepositoryType(type = DatabaseConstants.REPOSITORY_TYPE_COMMON, database = DatabaseConstants.COM_DB)
@Repository
public interface SetupTableRepository extends JpaRepository<SetupTable, Long> { ... }
```

### Lab-specific tables (current context lab)

```java
@RepositoryType(type = DatabaseConstants.REPOSITORY_TYPE_LAB_SPECIFIC)
@Repository
public interface RequestRepository extends JpaRepository<Request, Long> { ... }

// Force to a specific lab using LabType enum
@RepositoryType(type = DatabaseConstants.REPOSITORY_TYPE_LAB_SPECIFIC, lab = LabType.APS.getNumber())
@Repository
public interface ApRequestRepository extends JpaRepository<ApRequest, Long> { ... }

// Force specific lab + database
@RepositoryType(type = DatabaseConstants.REPOSITORY_TYPE_LAB_SPECIFIC,
                lab = LabType.CRS.getNumber(), database = DatabaseConstants.INT_DB)
@Repository
public interface EdiRequestRepository extends JpaRepository<EdiRequest, Long> { ... }
```

### Manual mode (legacy, default)

```java
@RepositoryType(type = DatabaseConstants.REPOSITORY_TYPE_MANUAL)
@Repository
public interface LegacyRepository extends JpaRepository<Legacy, Long> { ... }
```

### Annotation parameter reference

| Parameter | Type | Default | Meaning |
|-----------|------|---------|---------|
| `type` | String | `MANUAL` | `COMMON`, `LAB_SPECIFIC`, or `MANUAL` |
| `lab` | int | `-1` | `-1` = auto-detect from context |
| `database` | String | `""` | `""` = auto-detect from context |

---

## 7. Optional Oracle Availability

Oracle beans are created only when Oracle is available (`@ConditionalOnOracleAvailable`).
Do not hard-wire Oracle repositories — use `required = false`:

```java
@Autowired(required = false)
private LoeControlRepository loeControlRepository;   // null when Oracle is absent

// Guard before use
if (loeControlRepository != null) {
    // Oracle path
} else {
    // Fallback to Sybase/PostgreSQL
}
```

Alternatively, use `Optional<T>` injection:

```java
public DataService(@Autowired(required = false) LoeControlRepository repo) {
    this.loeControlRepository = Optional.ofNullable(repo);
}
```

---

## 8. String Trimming

Char/bpchar columns in PostgreSQL and Sybase are padded with trailing spaces.
The library provides two automatic solutions:

| Solution | Scope | How to enable |
|----------|-------|--------------|
| `StringTrimConverter` | All regular `String` columns | Automatic — no action needed |
| `StringTrimEntityListener` | `@Id` fields and composite keys | Add `@EntityListeners(StringTrimEntityListener.class)` to the entity |

---

## 9. Case-Sensitive Table/Column Names

PostgreSQL folds unquoted identifiers to lowercase. The library automatically quotes all
identifiers via Hibernate configuration. Ensure your `@Table` and `@Column` names
**exactly match** the database definition (including mixed case):

```java
@Entity
@Table(name = "bb_BTS_product_upd")   // must match database exactly
public class BbBtsProductUpd {
    @Column(name = "BTSprod_code")     // must match database exactly
    private String btsprodCode;
}
```

---

## 10. Connection Management APIs

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/getCachedDatabaseConnection` | GET | List active cached connections and their types (SYB / PG) |
| `/api/clearCachedDBConn` | DELETE | Flush all cached connections (use when switching environments) |

---

## 11. Common Errors & Fixes

| Error | Likely Cause | Fix |
|-------|-------------|-----|
| `Data source not found for hospital: X, lab: Y` | Hospital/lab filtered out | Add to `hosp:` / `lab:` in `application.yml` |
| `Not a managed type: class ...Entity` | Entity package missing | Add package to `entity:` for all three databases |
| `HikariPool - Connection is not available` | Pool exhausted | Increase `maximum-pool-size`, check for unclosed transactions |
| `Could not create JdbcLiteralFormatter, UserType...EnhancedUserType` | Hibernate 6 breaking change | Implement `EnhancedUserType<T>` instead of `UserType<T>` |
| `BeanCreationException: required a bean of type OracleXxxRepository` | Oracle repo hard-wired when Oracle absent | Use `@Autowired(required = false)` |
| `relation "tablename" does not exist` | Mixed-case table name unquoted | Verify `@Table(name=...)` exactly matches DB schema |

---

## 12. Reference Wiki Pages

For deeper detail, refer to the project wiki:

- **Overview & Quick Start** — `Data-Source-‐-Overview.md`
- **Configuration Options** — `Data-Source-‐-Configuration.md`
- **Repository Design** — `Data-Source-‐-Repository-Design.md`
- **Usage Examples** — `Data-Source-‐-Usage-Examples.md`
- **Database Connection Management** — `Data-Source-‐-Database-Connection-Management.md`
- **Case-Sensitive Names** — `Data-Source-‐-Case-Sensitive-Names.md`
- **String Trimming** — `Data-Source-‐-String-Trim-Solutions.md`
- **Troubleshooting** — `Data-Source-‐-Troubleshooting.md`
