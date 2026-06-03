
## Context

The `data-source` library routes JPA/JDBC operations across Sybase, PostgreSQL, and Oracle using a ThreadLocal-based context (`DataSourceContextHolder.setCurrentDb`) and `DynamicDataSource extends AbstractRoutingDataSource`. JTA is already configured via `JtaConfig.java` (Atomikos 6.0.0); each DB type has **one** `DynamicDataSource` bean wrapping many `AtomikosDataSourceBean` instances (one per hospital/lab/schema combination).

The reported problem: calling `setCurrentDb` multiple times within a `@Transactional` method fails to route subsequent operations to the new database — it appears `determineTargetDataSource` is not re-triggered.

---

## Root Cause Analysis

### Path 1: JdbcTemplate-based repositories

`JdbcTemplate` calls `DataSourceUtils.getConnection(dynamicDataSource)`:

1. First call inside transaction: no cached entry → `dynamicDataSource.getConnection()` routes to `AtomikosDataSourceBean_DB1` → **binds** a `ConnectionHolder` under the `dynamicDataSource` bean key in `TransactionSynchronizationManager`.
2. `setCurrentDb` (or `setEffectiveContext` for annotation-based routing) changes ThreadLocal to DB2.
3. Second call: `DataSourceUtils` finds the **stale cached `ConnectionHolder`** for the same `dynamicDataSource` key → returns the **old DB1 connection** — routing bypassed.

The fix must clear `TransactionSynchronizationManager` for the `DynamicDataSource` key whenever the context is switched.

### Path 2: JPA repository-based design (via `RepositoryRouterFactoryBean`)

`RepositoryRouterFactoryBean.invoke()` sets `effectiveContext`, then delegates to a Spring Data JPA repository backed by `LocalContainerEntityManagerFactoryBean` with `setJtaDataSource(dynamicDataSource)`.

In JTA mode, Hibernate's default `PhysicalConnectionHandlingMode` is `DELAYED_ACQUISITION_AND_RELEASE_BEFORE_TRANSACTION_COMPLETION`: the Hibernate Session acquires a JDBC connection on the **first** SQL and **holds it until the transaction ends**.

When `RepositoryRouterFactoryBean` routes the second call to the **same** `EntityManagerFactory` (same DB type, different hospital/lab), Hibernate reuses the **same Session** (Spring's JTA EntityManager proxy shares one Session per transaction) → **cached connection from first hospital/lab, wrong data written**.

Note: Cross-DB-type calls (PG ↔ Sybase ↔ Oracle) already work correctly because they use **separate** `EntityManagerFactory` beans → separate Sessions → separate connections, coordinated by Atomikos 2PC.

### Pre-existing contract bug

`ServerInfo.hashCode()` includes `dbType` but `equals()` excludes it — violating `HashMap`'s requirement that equal objects have equal hash codes. Current code works around this by always setting `dbType` correctly before lookups. Fix is straightforward: exclude `dbType` from `hashCode()` to match `equals()`.

### Oracle LOE_CTRL side-effect (pre-existing)

`setCurrentDb` always temporarily sets Oracle context (lines 98–104 in `DataSourceContextHolder`) to query the LOE_CTRL table to determine if the target should be Sybase or PG. This enrolls Oracle as an XA participant even for Sybase-only distributed transactions. This is pre-existing behavior and is not introduced by this plan.

---

## Scenario Coverage

### Scenario A: Sybase + Oracle

| Aspect | Status | Mechanism |
|---|---|---|
| JPA (Sybase repo + Oracle repo) | ✅ Already works | Separate `EntityManagerFactory` beans (`sybaseEntityManagerFactory` vs `oracleEntityManagerFactoryBean`) → separate Hibernate Sessions → separate connections → Atomikos coordinates 2PC |
| JdbcTemplate (Sybase + Oracle) | ✅ Already works | `sybaseDataSource` ≠ `oracleDataSource` beans → different TSM keys → no caching collision |
| Explicit multi-step via API | ✅ Fix 3 | `DistributedTransactionExecutor.executeOnDb` uses resolved `AtomikosDataSourceBean` directly |

### Scenario B: Sybase + PostgreSQL

| Aspect | Status | Mechanism |
|---|---|---|
| JPA (SybaseRepo + PostgresRepo via `RepositoryRouterFactoryBean`) | ✅ Already works | Separate EMF beans (`sybaseEntityManagerFactory` vs `postgreSqlEntityManagerFactoryBean`) → separate Sessions |
| JdbcTemplate (Sybase JdbcTemplate + PG JdbcTemplate) | ✅ Already works | `sybaseDataSource` ≠ `postgreSqlDataSource` → different TSM keys |
| Explicit multi-step via API | ✅ Fix 3 | `DistributedTransactionExecutor` resolves the correct `AtomikosDataSourceBean` per call |

### Scenario C: Sybase different labs (same DB engine, same DB type)

| Aspect | Status | Mechanism |
|---|---|---|
| JPA (same Sybase EMF, different labs) | ❌ Broken → ✅ Fix 2 | Same `sybaseEntityManagerFactory` → same Hibernate Session → connection caching. Fixed by `DELAYED_ACQUISITION_AND_RELEASE_AFTER_STATEMENT`: Hibernate re-acquires per statement using updated ThreadLocal |
| JdbcTemplate (same `sybaseDataSource`, different labs) | ❌ Broken → ✅ Fix 1 | Same `sybaseDataSource` bean → TSM caches connection. Fixed by clearing TSM entry in `setCurrentDb` |
| Explicit multi-step via API | ✅ Fix 3 | `executeOnDb("HOSP_A", 1, ...)` resolves `AtomikosBean_HOSP_A_1`, `executeOnDb("HOSP_B", 3, ...)` resolves `AtomikosBean_HOSP_B_3` → different TSM keys → Atomikos enlists as separate XA resources |

Same analysis applies to PostgreSQL different labs — identical structural pattern.

---

## Implementation Plan

### Fix 1 — `DataSourceContextHolder`: clear stale connection on context switch

**File:** `data-source/src/main/java/hk/org/ha/lis/config/DataSourceContextHolder.java`

Add private static helper (new import: `org.springframework.transaction.support.TransactionSynchronizationManager`):

```java
private static void clearConnectionSynchronizationIfJtaActive(String dbType) {
    if (!TransactionSynchronizationManager.isActualTransactionActive()) return;
    DynamicDataSource ds = dynamicDataSourceRegistry.get(dbType);
    if (ds == null) return;
    if (TransactionSynchronizationManager.getResource(ds) != null) {
        TransactionSynchronizationManager.unbindResourceIfPossible(ds);
        log.debug("Cleared stale ConnectionHolder for dbType={} on context switch", dbType);
    }
}
```

Call sites — add after `dbContextHolder.set(serverInfo)` in:
- `setCurrentDb(String server, Integer lab, String database)` — public routing API
- `setCurrentDbWithType(String server, Integer lab, String database, String dbType)` — explicit-type API

Also call in `setEffectiveContext()` to fix **annotation-based JdbcTemplate routing** (RepositoryRouterFactoryBean uses this path):
```java
public static void setEffectiveContext(ServerInfo effectiveContext) {
    effectiveContextHolder.set(effectiveContext);
    if (effectiveContext != null) {
        clearConnectionSynchronizationIfJtaActive(effectiveContext.getDbType());
    }
}
```

`SwitchDataSource`, `switchServer`, `switchLab`, `switchDatabase`, `switchCorp` all delegate to `setCurrentDb` → inherit the fix automatically.

**Why unbinding is safe:** `unbindResourceIfPossible` removes the `ConnectionHolder` from Spring's map but does NOT close or roll back the underlying XA connection — Atomikos continues to track and coordinate it. The next `DataSourceUtils.getConnection(dynamicDataSource)` re-invokes `dynamicDataSource.getConnection()` → reads the updated ThreadLocal → routes to the correct new target.

### Fix 2 — Hibernate connection handling mode (JPA repository path)

**File:** `data-source/src/main/java/hk/org/ha/lis/config/PostgreSqlDataSourceConfig.java` — method `postgreSqlEntityManagerFactoryBean()`  
**File:** `data-source/src/main/java/hk/org/ha/lis/config/SybaseDataSourceConfig.java` — method `entityManagerFactory()`  
**File:** `data-source/src/main/java/hk/org/ha/lis/config/OracleDataSourceConfig.java` — method `oracleEntityManagerFactoryBean()` (for consistency)

Add to `jpaProperties` in all three:
```java
jpaProperties.put("hibernate.connection.handling_mode",
    "DELAYED_ACQUISITION_AND_RELEASE_AFTER_STATEMENT");
```

This makes Hibernate release the JDBC connection back to the pool **after each SQL statement** and re-acquire for the next. When `RepositoryRouterFactoryBean` sets a new `effectiveContext` before the next repository method call, the subsequent Hibernate SQL statement calls `DynamicDataSource.getConnection()` freshly → reads updated ThreadLocal → routes to the new hospital/lab's `AtomikosDataSourceBean`.

Atomikos tracks XA enlistment via its own resource manager (not the Java `Connection` reference), so releasing the connection between statements does not break 2PC atomicity.

**⚠ Caution:** Code using session-scoped Sybase/PG features (temporary tables, connection-level `SET` options such as `SET ROWCOUNT`, `SET TRANSACTION ISOLATION LEVEL`) will break because each statement may use a different physical connection. Such patterns are incompatible with distributed transaction routing and must be refactored to use application-level alternatives.

### Fix 3 — New `DistributedTransactionExecutor` component

**File (new):** `data-source/src/main/java/hk/org/ha/lis/config/DistributedTransactionExecutor.java`

Bypasses the `DynamicDataSource` routing proxy entirely by fetching the **resolved** `AtomikosDataSourceBean` directly via `DataSourceContextHolder.getResolvedDataSource()`. Each resolved datasource is a **different key** in `TransactionSynchronizationManager`, so Atomikos correctly enlists each as an independent XA resource.

```java
package hk.org.ha.lis.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.util.function.Consumer;

/**
 * Utility for executing JDBC operations across multiple databases within a
 * single JTA (@Transactional) transaction.
 *
 * Uses DataSourceContextHolder.getResolvedDataSource() to bypass the
 * DynamicDataSource routing proxy and obtain the specific AtomikosDataSourceBean
 * for each hospital/lab. Different Atomikos beans are different keys in
 * TransactionSynchronizationManager, so Atomikos enlists each as an
 * independent XA resource in the same global transaction.
 */
@Slf4j
@Component
public class DistributedTransactionExecutor {

    @FunctionalInterface
    public interface DbCallback<T> {
        T execute(JdbcTemplate jdbcTemplate);
    }

    public <T> T executeOnDb(String server, Integer lab, String database, DbCallback<T> callback) {
        ServerInfo original = DataSourceContextHolder.getOriginalContext();
        try {
            DataSourceContextHolder.setCurrentDb(server, lab, database);
            DataSource resolvedDs = DataSourceContextHolder.getResolvedDataSource();
            log.debug("DistributedTransactionExecutor: server={} lab={} db={}", server, lab, database);
            return callback.execute(new JdbcTemplate(resolvedDs));
        } finally {
            restore(original);
        }
    }

    public void executeOnDb(String server, Integer lab, String database, Consumer<JdbcTemplate> callback) {
        executeOnDb(server, lab, database, jdbc -> { callback.accept(jdbc); return null; });
    }

    private void restore(ServerInfo original) {
        if (original != null) {
            DataSourceContextHolder.setCurrentDbWithType(
                original.getServer(), original.getLab(), original.getDatabase(), original.getDbType());
        } else {
            DataSourceContextHolder.clear();
        }
    }
}
```

**Example — Sybase different labs:**
```java
@Autowired DistributedTransactionExecutor distributedTx;

@Transactional
public void transferLabOrder(String fromHosp, int fromLab, String toHosp, int toLab, Long orderId) {
    distributedTx.executeOnDb(fromHosp, fromLab, "LAB_DB", jdbc ->
        jdbc.update("UPDATE lab_order SET status = 'TRANSFERRED' WHERE id = ?", orderId));
    distributedTx.executeOnDb(toHosp, toLab, "LAB_DB", jdbc ->
        jdbc.update("INSERT INTO received_orders VALUES (?)", orderId));
    // Atomikos 2PC: both commit or both rollback atomically
}
```

**Example — Sybase + Oracle:**
```java
@Transactional
public void auditAndUpdate(Long orderId) {
    distributedTx.executeOnDb("LOE", 1, "LOE_DB", jdbc ->
        jdbc.update("INSERT INTO audit_log VALUES (?)", orderId));        // Oracle
    distributedTx.executeOnDb("PWH", 5, "LAB_DB", jdbc ->
        jdbc.update("UPDATE lab_order SET audited = 1 WHERE id = ?", orderId)); // Sybase
}
```

### Fix 4 — Mark `RoutingTransactionManager` as deprecated

**File:** `data-source/src/main/java/hk/org/ha/lis/config/RoutingTransactionManager.java`

Add `@Deprecated` and Javadoc:
```java
/**
 * @deprecated Superseded by {@link JtaConfig} which registers the {@code @Primary}
 *             JtaTransactionManager backed by Atomikos. This class is retained for
 *             non-JTA legacy mode only. For distributed writes use
 *             {@link DistributedTransactionExecutor} or plain {@code @Transactional}
 *             with JTA routing via context-aware repositories.
 */
@Deprecated
```

### Enhancement — Fix `ServerInfo.hashCode()` contract violation

**File:** `data-source/src/main/java/hk/org/ha/lis/config/ServerInfo.java`

```java
@Override
public int hashCode() {
    return Objects.hash(server, lab, database);  // was: server, lab, database, dbType
}
```

Fixes the Java `HashMap` contract violation (`equals` ignores `dbType` but `hashCode` includes it). Current code works around this by always setting `dbType` before lookups, but the violation makes `ServerInfo` unsafe in general map operations.

---

## Documentation Files to Create

### A: Wiki user guide

**File:** `wiki/Data-Source-‐-Distributed-Transactions.md`

End-user guide: when to use distributed transactions, all three scenarios (cross-type, same-type different labs), `DistributedTransactionExecutor` usage, JPA routing limitations, connection handling mode caveat (session-scoped features), Atomikos log config, `RoutingTransactionManager` deprecation.

### B: Technical implementation reference

**File:** `data-source/docs/DISTRIBUTED-TRANSACTIONS-IMPLEMENTATION.md`

Comprehensive technical reference for future maintainers:
1. Architecture — three-tier: `DynamicDataSource` → `AtomikosDataSourceBean` → physical DB
2. Root cause deep-dive — JdbcTemplate path (TSM caching) and JPA path (Hibernate Session caching) with code traces
3. All three distributed transaction scenarios (Sybase+Oracle, Sybase+PG, same-type different labs) with status before/after each fix
4. Fix-by-fix summary — what changed, why, and risk analysis per fix
5. `ServerInfo.hashCode()` bug explanation and rationale for fix
6. Hibernate `DELAYED_ACQUISITION_AND_RELEASE_AFTER_STATEMENT` — semantics, when safe vs unsafe (session-scoped features)
7. `DistributedTransactionExecutor` design rationale — why resolved datasource bypasses TSM caching
8. Oracle LOE_CTRL side-effect — pre-existing XA enrollment behavior and implications
9. `RoutingTransactionManager` lifecycle and deprecation reasoning
10. Atomikos 2PC flow with `DynamicDataSource` — step-by-step sequence
11. Known limitations
12. Testing guidance — unit and integration test patterns

---

## Files Summary

| Action | File |
|--------|------|
| Modify | `config/DataSourceContextHolder.java` — Fix 1: add `clearConnectionSynchronizationIfJtaActive`, call in `setCurrentDb`, `setCurrentDbWithType`, `setEffectiveContext` |
| Modify | `config/PostgreSqlDataSourceConfig.java` — Fix 2: add Hibernate `connection.handling_mode` |
| Modify | `config/SybaseDataSourceConfig.java` — Fix 2: add Hibernate `connection.handling_mode` |
| Modify | `config/OracleDataSourceConfig.java` — Fix 2: add Hibernate `connection.handling_mode` (consistency) |
| Modify | `config/RoutingTransactionManager.java` — Fix 4: `@Deprecated` + Javadoc |
| Modify | `config/ServerInfo.java` — Enhancement: fix `hashCode()` to exclude `dbType` |
| Create | `config/DistributedTransactionExecutor.java` — Fix 3 |
| Create | `wiki/Data-Source-‐-Distributed-Transactions.md` — user guide |
| Create | `data-source/docs/DISTRIBUTED-TRANSACTIONS-IMPLEMENTATION.md` — technical reference |

---

## Verification

1. **Unit test** — `DataSourceContextHolderTest.testClearConnectionSynchronizationOnContextSwitch`:  
   Activate via `TransactionSynchronizationManager.initSynchronization()`, bind a mock `ConnectionHolder` under the registered `DynamicDataSource`, call `setCurrentDb(...)`, assert `TransactionSynchronizationManager.getResource(dynamicDataSource)` is null.

2. **Unit test** — `DataSourceContextHolderTest.testClearOnSetEffectiveContext`:  
   Same setup; call `setEffectiveContext(serverInfo)`, assert stale `ConnectionHolder` is removed.

3. **Integration test** — `DistributedTransactionExecutorTest.testMultiLabAtomicWrite`:  
   Two `executeOnDb` calls to different labs inside `@Transactional` → verify both rows written. Repeat with forced exception after second write → verify both rows absent (2PC rollback).

4. **Integration test** — `DistributedTransactionExecutorTest.testCrossTypeAtomicWrite`:  
   `executeOnDb` to Sybase lab + Oracle within `@Transactional` → verify both committed or both rolled back.

5. **Regression** — Run existing test suite to verify `DELAYED_ACQUISITION_AND_RELEASE_AFTER_STATEMENT` does not break existing single-database JPA operations (especially Sybase batch and Oracle audit reads).