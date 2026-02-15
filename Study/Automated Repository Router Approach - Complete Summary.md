# Automated Repository Router Approach - Complete Summary

### Problem Statement

The original issue was that Spring Data JPA creates repository beans tied to specific database dialects. When trying to dynamically switch between Sybase and PostgreSQL, we encountered:

1. **Bean Definition Conflicts**: Same repository interface being defined in multiple configurations
2. **Dialect Mismatch**: SQL generated for one database being executed on another
3. **Manual Configuration Overhead**: Each repository requiring individual router configuration

### Solution Overview

The automated approach creates a **Factory Bean** that dynamically generates repository proxies at application startup, eliminating the need for manual configuration per repository.

## Detailed Architecture Diagram

```other
graph TB
    subgraph "Application Startup"
        A[Spring Boot Application] --> B[Scan Repository Interfaces]
        B --> C[Create Database-Specific Beans]
        C --> D[Generate Repository Proxies]
    end

    subgraph "Repository Layer Structure"
        E[Common Repository Interfaces<br/>hk.org.ha.lis.patient.repository.common]
        F[Sybase Repository Interfaces<br/>hk.org.ha.lis.patient.repository.sybase]
        G[PostgreSQL Repository Interfaces<br/>hk.org.ha.lis.patient.repository.postgresql]
        
        F -.->|extends| E
        G -.->|extends| E
    end

    subgraph "Configuration Layer"
        H[SybaseDataSourceConfig<br/>@EnableJpaRepositories<br/>basePackages: "sybase"]
        I[PostgreSQLDataSourceConfig<br/>@EnableJpaRepositories<br/>basePackages: "postgresql"]
        J[AutomatedRouterConfig<br/>@EnableRepositoryRouters<br/>basePackages: "common"]
    end

    subgraph "Runtime Bean Creation"
        K[BeanDefinitionRegistryPostProcessor]
        L[RepositoryRouterFactoryBean]
        M[Dynamic Proxy Creation]
        
        K --> L
        L --> M
    end

    subgraph "Service Layer"
        N[Service Classes<br/>@Autowired Repository]
        O[Repository Proxy Bean<br/>@Primary]
        P[DataSourceContextHolder]
        
        N --> O
        O --> P
    end

    subgraph "Database Layer"
        Q[Sybase Repository Bean<br/>Hibernate: SybaseDialect]
        R[PostgreSQL Repository Bean<br/>Hibernate: PostgreSQLDialect]
        S[Sybase Database]
        T[PostgreSQL Database]
        
        Q --> S
        R --> T
    end

    A --> H
    A --> I
    A --> J
    J --> K
    O --> Q
    O --> R
    P --> O
```

## Implementation Components

### 1. Repository Interface Structure

```java
// Common interface (what services use)
package hk.org.ha.lis.patient.repository.common;
public interface DerivedWorkRepository extends JpaRepository<DerivedWork, Long> {
    // Repository methods
}

// Sybase-specific interface
package hk.org.ha.lis.patient.repository.sybase;
public interface SybaseDerivedWorkRepository extends DerivedWorkRepository {
    // Empty - just for Spring to create Sybase-specific bean
}

// PostgreSQL-specific interface  
package hk.org.ha.lis.patient.repository.postgresql;
public interface PostgresDerivedWorkRepository extends DerivedWorkRepository {
    // Empty - just for Spring to create PostgreSQL-specific bean
}
```

### 2. DataSource Configuration

```java
@Configuration
@EnableJpaRepositories(
    entityManagerFactoryRef = "sybaseEntityManagerFactory",
    transactionManagerRef = "sybaseTransactionManager", 
    basePackages = {"hk.org.ha.lis.patient.repository.sybase"}
)
public class SybaseDataSourceConfig {
    // Sybase-specific configuration
}

@Configuration  
@EnableJpaRepositories(
    entityManagerFactoryRef = "postgreSqlEntityManagerFactoryBean",
    transactionManagerRef = "postgreSqlTransactionManager",
    basePackages = {"hk.org.ha.lis.patient.repository.postgresql"}
)
public class PostgreSQLDataSourceConfig {
    // PostgreSQL-specific configuration
}
```

### 3. Automated Router Configuration

```java
@Configuration
@EnableRepositoryRouters(basePackages = "hk.org.ha.lis.patient.repository.common")
public class AutomatedRouterConfig {
    // Automatic proxy generation happens here
}
```

## Runtime Flow Diagram

```other
sequenceDiagram
    participant Service as Service Layer
    participant Proxy as Repository Proxy
    participant Context as DataSourceContextHolder
    participant SybaseRepo as Sybase Repository
    participant PostgresRepo as PostgreSQL Repository
    participant SybaseDB as Sybase Database
    participant PostgresDB as PostgreSQL Database

    Service->>Proxy: Call repository method
    Proxy->>Context: Get current database type
    Context-->>Proxy: Return "postgresql" or "sybase"
    
    alt Database Type = "postgresql"
        Proxy->>PostgresRepo: Delegate method call
        PostgresRepo->>PostgresDB: Execute PostgreSQL SQL
        PostgresDB-->>PostgresRepo: Return results
        PostgresRepo-->>Proxy: Return results
    else Database Type = "sybase"
        Proxy->>SybaseRepo: Delegate method call
        SybaseRepo->>SybaseDB: Execute Sybase SQL
        SybaseDB-->>SybaseRepo: Return results
        SybaseRepo-->>Proxy: Return results
    end
    
    Proxy-->>Service: Return results
```

## Key Implementation Classes

### 1. RepositoryRouterFactoryBean

```java
public class RepositoryRouterFactoryBean<T> implements FactoryBean<T> {
    private final Class<T> repositoryInterface;
    private final Object sybaseRepository;
    private final Object postgresRepository;
    
    @Override
    public T getObject() {
        return (T) Proxy.newProxyInstance(
            repositoryInterface.getClassLoader(),
            new Class[]{repositoryInterface},
            (proxy, method, args) -> {
                ServerInfo serverInfo = DataSourceContextHolder.getCurrentDb();
                if (serverInfo != null && 
                    CommonConstants.DB_POSTGRESQL.equals(serverInfo.getDbType())) {
                    return method.invoke(postgresRepository, args);
                }
                return method.invoke(sybaseRepository, args);
            });
    }
}
```

### 2. RepositoryRouterBeanDefinitionRegistryPostProcessor

```java
@Component
public class RepositoryRouterBeanDefinitionRegistryPostProcessor 
    implements BeanDefinitionRegistryPostProcessor {
    
    @Override
    public void postProcessBeanDefinitionRegistry(BeanDefinitionRegistry registry) {
        // Scan common repository package
        // For each repository interface found:
        // 1. Create RepositoryRouterFactoryBean definition
        // 2. Mark as @Primary
        // 3. Register with Spring context
    }
}
```

## Advantages of This Approach

### 1. **Zero Manual Configuration**

- No need to create individual router beans for each repository
- Single annotation `@EnableRepositoryRouters` handles all repositories
- Automatic discovery and proxy generation

### 2. **Scalability**

- Works for 10 repositories or 100 repositories with same effort
- New repositories automatically get routing capability
- No code changes needed when adding new repositories

### 3. **Clean Architecture**

- Service layer remains unchanged
- Clear separation of concerns
- Database-specific configurations isolated

### 4. **Runtime Flexibility**

- Dynamic switching based on `DataSourceContextHolder`
- Correct dialect selection for each database
- No performance overhead

## Configuration Summary

| **Component**              | **Purpose**               | **Package**             |
| -------------------------- | ------------------------- | ----------------------- |
| Common Repositories        | Service layer interfaces  | `repository.common`     |
| Sybase Repositories        | Sybase-specific beans     | `repository.sybase`     |
| PostgreSQL Repositories    | PostgreSQL-specific beans | `repository.postgresql` |
| SybaseDataSourceConfig     | Sybase entity manager     | `config`                |
| PostgreSQLDataSourceConfig | PostgreSQL entity manager | `config`                |
| AutomatedRouterConfig      | Proxy generation          | `config`                |

This approach provides a robust, scalable solution that maintains clean separation between database configurations while allowing seamless runtime switching between different database types.