# Implement XA/JTA Distributed Transactions for Multi-Database Atomicity

## Overview

Add full XA/JTA distributed transaction support to the data-source library to ensure that Oracle data updates (including message queue inserts) and Sybase/PostgreSQL updates commit or rollback together atomically. This prevents the critical race condition where messages are sent before Sybase/PostgreSQL updates succeed.

## Architecture Changes

### Current State

- **Separate Transaction Managers**: Independent `JpaTransactionManager` for each database
- **No Coordination**: Each database commits independently
- **Risk**: Oracle messages can be picked up before Sybase/PostgreSQL commits

### Target State

- **Unified JTA Transaction Manager**: Single `JtaTransactionManager` coordinating all databases
- **Two-Phase Commit**: All databases prepare, then commit together
- **Atomicity**: Message queue + Oracle data + Sybase/PostgreSQL all commit atomically

## Implementation Plan

### Phase 1: Add Dependencies and JTA Manager

**1.1 Update `data-source/pom.xml`**

Add Atomikos JTA transaction manager and XA datasource dependencies (all confirmed available in corporate Artifactory):

**1.2 Create JTA Configuration Class**

New file: `data-source/src/main/java/hk/org/ha/lis/config/JtaTransactionConfig.java`

Configure Atomikos transaction manager with proper timeout and recovery settings:

- Transaction timeout: 300 seconds (5 minutes)
- Enable transaction logging for crash recovery
- Configure transaction log directory
- Set proper isolation levels

### Phase 2: Replace DataSource Configurations

**2.1 Modify `OracleDataSourceConfig.java`**

Replace `DynamicDataSource` with `AtomikosDataSourceBean` (XA-compliant):

- Change from `HikariDataSource` to `AtomikosDataSourceBean`
- Set unique resource name: `oracleXADataSource`
- Configure XA properties for Oracle driver
- Remove `@Primary` from `oracleTransactionManager` (JTA will be primary)
- Update `EntityManagerFactory` to use JTA platform

Key changes:

```java
// Lines 72-117: Replace oracleDataSource() method
// Use AtomikosDataSourceBean instead of DynamicDataSource
// Configure oracle.jdbc.xa.client.OracleXADataSource
  
// Lines 124-154: Update oracleEntityManagerFactoryBean()
// Add: jpaProperties.put("hibernate.transaction.jta.platform", AtomikosJtaPlatform.class.getName())
// Add: jpaProperties.put("jakarta.persistence.transactionType", "JTA")
  
// Lines 160-166: Remove @Primary, keep for backward compatibility
```

**2.2 Modify `SybaseDataSourceConfig.java`**

Convert Sybase datasources to XA-compliant:

- Replace HikariCP with `AtomikosDataSourceBean`
- Set unique resource name: `sybaseXADataSource`
- Configure Sybase XA properties
- Remove primary datasource beans (lines 198-228) as JTA will be primary
- Update JPA properties for JTA

**2.3 Modify `PostgreSqlDataSourceConfig.java`**

Convert PostgreSQL datasources to XA-compliant:

- Replace HikariCP with `AtomikosDataSourceBean`
- Set unique resource name: `postgresqlXADataSource`
- Configure PostgreSQL XA datasource (`org.postgresql.xa.PGXADataSource`)
- Update JPA properties for JTA

**2.4 Update `BaseDataSourceConfig.java`**

Add new method to create XA datasources:

- New method: `createAtomikosDataSource(Properties dsProp, String uniqueResourceName)`
- Keep existing `createHikariDataSource()` for backward compatibility
- Handle XA-specific properties (recovery settings, maintenance interval)

### Phase 3: Dynamic DataSource with XA Support

**3.1 Create XA-Aware Dynamic DataSource**

New file: `data-source/src/main/java/hk/org/ha/lis/config/XaDynamicDataSource.java`

Extend `AbstractRoutingDataSource` to work with XA datasources:

- Store map of `AtomikosDataSourceBean` instances
- Override `determineCurrentLookupKey()` to use `DataSourceContextHolder`
- Ensure XA resources are properly enlisted in JTA transactions

**3.2 Update `DataSourceContextHolder.java`**

Minimal changes needed:

- Current thread-local approach remains valid
- Verify compatibility with JTA transaction propagation
- Add logging for XA resource switching

### Phase 4: Configuration Properties

**4.1 Add JTA Configuration Properties**

Applications using this library need to add to their `application.yml`:

```yaml
spring:
 jta:
 enabled: true
 atomikos:
 properties:
 log-base-dir: ./atomikos-logs
 transaction-manager-unique-name: ${spring.application.name}-tm
 default-jta-timeout: 300000 # 5 minutes
 max-timeout: 600000 # 10 minutes
 enable-logging: true
database-config:
 jta:
 enabled: true # Feature flag to enable/disable JTA
```

**4.2 Backward Compatibility**

Add conditional configuration:

- `@ConditionalOnProperty(name = "database-config.jta.enabled", havingValue = "true")`
- Allow existing applications to continue using non-JTA mode
- Document migration path

### Phase 5: Update Usage Patterns

**5.1 Transaction Annotation Changes**

Applications will use:

```java
// OLD (per-database transaction)
@Transactional(transactionManager = "oracleTransactionManager")
public void updateOracle() { ... }
  
// NEW (distributed transaction across all databases)
@Transactional // Uses default JTA transaction manager
public void updateOracleAndSybase() {
 oracleRepo.update();
 sybaseRepo.update();
 messageQueue.insert();
 // All commit together or all rollback
}
```

**5.2 Create Example Service**

New file: `data-source/src/main/java/hk/org/ha/lis/service/example/DistributedTransactionExample.java`

Demonstrate proper usage pattern for updating multiple databases atomically.

### Phase 6: Testing and Validation

**6.1 Configuration Validation**

Add startup checks:

- Verify all datasources are XA-capable
- Validate transaction log directory exists and is writable
- Check unique resource names (no duplicates)

**6.2 Create Test Scenarios**

Document test cases:

1. Happy path: Both databases commit
2. Oracle fails: Both rollback
3. Sybase/PostgreSQL fails: Both rollback
4. Network timeout: Transaction rollback after timeout
5. Crash recovery: Verify in-doubt transactions are resolved

### Phase 7: Documentation

**7.1 Update [README.md](http://README.md)**

Add section on distributed transactions:

- When to enable JTA mode
- Performance implications (~2-3x slower commits)
- Configuration examples
- Migration guide from non-JTA to JTA mode

**7.2 Create Migration Guide**

Document for teams currently using the library:

- Dependency updates required
- Configuration changes needed
- Code changes (transaction annotations)
- Testing recommendations

## Key Files to Modify

1. `data-source/pom.xml` - Add Atomikos dependencies
2. `data-source/src/main/java/hk/org/ha/lis/config/JtaTransactionConfig.java` - NEW
3. `data-source/src/main/java/hk/org/ha/lis/config/OracleDataSourceConfig.java` - Convert to XA
4. `data-source/src/main/java/hk/org/ha/lis/config/SybaseDataSourceConfig.java` - Convert to XA
5. `data-source/src/main/java/hk/org/ha/lis/config/PostgreSqlDataSourceConfig.java` - Convert to XA
6. `data-source/src/main/java/hk/org/ha/lis/config/BaseDataSourceConfig.java` - Add XA datasource creation
7. `data-source/src/main/java/hk/org/ha/lis/config/XaDynamicDataSource.java` - NEW
8. `data-source/README.md` - Add JTA documentation

## Critical Considerations

### Performance Impact

- Expect 2-3x slower commit times due to 2PC overhead
- Database locks held longer during prepare phase
- More network round-trips between databases

### Operational Requirements

- Transaction logs must be backed up (Atomikos recovery logs)
- Monitor in-doubt transactions via Atomikos console
- Increase connection pool sizes (~50% more connections needed)
- Database must support XA (all three databases do support it)

### Rollout Strategy

1. Deploy to DEV environment first
2. Load test to measure performance impact
3. Verify crash recovery scenarios work
4. Deploy to STAGING with real-world data volume
5. Production rollout with feature flag (gradual enablement)

## Version Update

Update `data-source/pom.xml` version from `1.0.5` to `2.0.0` (major version due to breaking changes in transaction model).