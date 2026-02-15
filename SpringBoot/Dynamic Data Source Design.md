# Dynamic Data Source Design

Of course. Here is a comprehensive summary of the final, robust architecture that supports both legacy and OpenShift applications, with dynamic, zero-downtime database migration controlled by a central Oracle database.

### 1. High-Level Design Principles

- **Single Source of Truth:** An Oracle database table (`TENANT_ROUTING_CONFIG`) is the master index that maps a `tenantId` to its current database type (`SYBASE` or `POSTGRES`). This is the **only place** an administrator changes to trigger a migration.
- **Decoupled Configuration:** OpenShift services store connection details (URLs) in `ConfigMap`s and credentials in per-tenant `Secret`s. This is secure, cloud-native, and follows the Principle of Least Privilege.
- **Dual JPA Stacks:** The Spring Boot application runs two complete, parallel JPA stacks simultaneously: one configured for the Sybase dialect and one for the PostgreSQL dialect.
- **Dynamic Routing:** An incoming request's `tenantId` is used to look up its `dbType` from the Oracle index. A generic Repository Router then delegates the database call to the appropriate JPA stack (Sybase or Postgres).
- **Zero-Downtime Reload:** The application periodically polls the Oracle database for changes. If a tenant's `dbType` has changed, the application dynamically reconfigures its connection pools and routing map without requiring a restart.

---

### 2. Mermaid Diagram of the Architecture

This diagram illustrates the flow from a request to the final database query.

![Mermaid Chart - Create complex, visual diagrams with text. A smarter way of creating diagrams.-2025-08-01-153357.png](Dynamic%20Data%20Source%20Design.assets/Mermaid%20Chart%20-%20Create%20complex,%20visual%20diagrams%20with%20text.%20A%20smarter%20way%20of%20creating%20diagrams.-2025-08-01-153357.png)

```other
sequenceDiagram
    participant Client
    participant OpenShiftApp as Spring Boot App
    participant OracleDB as Master Index (Oracle)
    participant ConfigMaps as (Details & Secrets)
    participant SybaseRepo as Sybase Repository Bean
    participant PostgresRepo as PostgreSQL Repository Bean

    Client->>+OpenShiftApp: GET /api/AHN-9-LAB/products
    
    OpenShiftApp->>OpenShiftApp: 1. TenantInterceptor extracts "AHN-9-LAB"
    OpenShiftApp->>OpenShiftApp: 2. Sets TenantContext.set("AHN-9-LAB")
    
    Note over OpenShiftApp: Service layer calls ProductRepository.findAll()

    OpenShiftApp->>OpenShiftApp: 3. RepositoryRouter intercepts call
    
    alt On-demand or Cached
        OpenShiftApp->>+OracleDB: 4. Query: SELECT DB_TYPE FROM TENANT_ROUTING_CONFIG WHERE TENANT_ID = 'AHN-9-LAB'
        OracleDB-->>-OpenShiftApp: Returns 'SYBASE'
    end
    
    OpenShiftApp->>+ConfigMaps: 5. Reads URL & Credentials for "AHN-9-LAB"
    ConfigMaps-->>-OpenShiftApp: Returns Sybase connection details

    OpenShiftApp->>OpenShiftApp: 6. Router determines target is Sybase bean ('productRepository')
    
    OpenShiftApp->>+SybaseRepo: 7. Delegates findAll() call
    SybaseRepo-->>-OpenShiftApp: Returns Product List
    
    Note right of SybaseRepo: (PostgresRepo is not used for this request)
    
    OpenShiftApp-->>-Client: Returns JSON response
```

---

### 3. Core Code Components

Here is the essential code required to implement this design.

#### A. Central Configuration (External to the App)

1. **Oracle Table (`TENANT_ROUTING_CONFIG`):**

```sql
CREATE TABLE TENANT_ROUTING_CONFIG (
    TENANT_ID VARCHAR2(50) PRIMARY KEY,
    DB_TYPE   VARCHAR2(20) NOT NULL -- 'SYBASE' or 'POSTGRES'
);
INSERT INTO TENANT_ROUTING_CONFIG VALUES ('AHN-9-LAB', 'SYBASE');
INSERT INTO TENANT_ROUTING_CONFIG VALUES ('PMH-5-INT', 'POSTGRES');
```

1. **OpenShift `ConfigMap`s & `Secret`s:** (As defined previously, one for Sybase URLs, one for Postgres URLs, and one Secret per tenant for credentials).

#### B. Main Application & Disabling Auto-Configuration

```java
@SpringBootApplication
@EnableScheduling // To enable polling for config changes
@EnableCaching    // To cache tenant configurations
@EnableAutoConfiguration(exclude = {
    DataSourceAutoConfiguration.class,
    HibernateJpaAutoConfiguration.class,
    JpaRepositoriesAutoConfiguration.class
})
public class DynamicDatasourceApplication {
    public static void main(String[] args) {
        SpringApplication.run(DynamicDatasourceApplication.class, args);
    }
}
```

#### C. Tenant Context & Request Interceptor

```java
// TenantContext.java - ThreadLocal holder for tenantId and dbType
public class TenantContext {
    private static final ThreadLocal<String> currentTenantId = new ThreadLocal<>();
    private static final ThreadLocal<DatabaseType> currentDbType = new ThreadLocal<>();

    public static void set(String tenantId, DatabaseType dbType) {
        currentTenantId.set(tenantId);
        currentDbType.set(dbType);
    }
    public static String getTenantId() { return currentTenantId.get(); }
    public static DatabaseType getDbType() { return currentDbType.get(); }
    public static void clear() {
        currentTenantId.remove();
        currentDbType.remove();
    }
}

// TenantInterceptor.java - Intercepts requests to populate TenantContext
@Component
public class TenantInterceptor implements HandlerInterceptor {
    @Autowired private TenantConfigLoader configLoader;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String tenantId = extractTenantIdFromRequest(request); // Your logic here
        if (tenantId != null) {
            // Fetch the full config (which may be cached) to get the dbType
            TenantDatabaseConfig config = configLoader.loadConfigurations().get(tenantId);
            if (config != null) {
                TenantContext.set(tenantId, config.getDbType());
            }
        }
        return true;
    }
    // ... afterCompletion must call TenantContext.clear() ...
}
```

#### D. Hybrid Configuration Loading

```java
// TenantConfigLoader.java - Assembles full config from Oracle + Files
@Component
@Component
public class TenantConfigLoader {

    private final JdbcTemplate masterJdbcTemplate;
    
    // Paths to the mounted detail/secret files remain the same
    private final Path sybaseDetailsDir = Path.of("/etc/config/sybase-details");
    private final Path postgresDetailsDir = Path.of("/etc/config/postgres-details");
    private final Path secretsBaseDir = Path.of("/etc/secrets");

    @Autowired
    public TenantConfigLoader(@Qualifier("masterDataSource") DataSource masterDataSource) {
        this.masterJdbcTemplate = new JdbcTemplate(masterDataSource);
    }
    
    // The public method can be cached for performance
    @Cacheable("tenantConfigs") // Use Spring's caching mechanism
    public Map<String, TenantDatabaseConfig> loadConfigurations() throws IOException {
        Map<String, TenantDatabaseConfig> configs = new ConcurrentHashMap<>();
        
        // 1. Query the Oracle DB for the master tenant list and db types
        List<Map<String, Object>> tenantMappings = masterJdbcTemplate.queryForList(
            "SELECT TENANT_ID, DB_TYPE FROM TENANT_ROUTING_CONFIG"
        );
        
        for (Map<String, Object> row : tenantMappings) {
            String tenantId = (String) row.get("TENANT_ID");
            DatabaseType dbType = DatabaseType.valueOf((String) row.get("DB_TYPE"));

            // 2. Assemble the full config for this tenant using files
            // This reuses the exact same logic as before.
            TenantDatabaseConfig config = buildConfigForTenant(tenantId, dbType);
            configs.put(tenantId, config);
        }
        return configs;
    }

    // This method is identical to the previous implementation
    private TenantDatabaseConfig buildConfigForTenant(String tenantId, DatabaseType dbType) throws IOException {
        // ... logic to read URL from sybase/postgres details ConfigMap
        // ... logic to read credentials from the per-tenant Secret
        // ... assemble and return TenantDatabaseConfig object
        String url;
        String driverClassName;
        if (dbType == DatabaseType.SYBASE) {
            url = Files.readString(sybaseDetailsDir.resolve(tenantId)).trim();
            driverClassName = "com.sybase.jdbc4.jdbc.SybDriver";
        } else { // POSTGRES
            url = Files.readString(postgresDetailsDir.resolve(tenantId)).trim();
            driverClassName = "org.postgresql.Driver";
        }
        
        Path secretPath = secretsBaseDir.resolve(tenantId);
        String username = Files.readString(secretPath.resolve("username")).trim();
        String password = Files.readString(secretPath.resolve("password")).trim();

        TenantDatabaseConfig config = new TenantDatabaseConfig();
        // ... set all properties on the config object ...
        return config;
    }
    
    // Add a method to clear the cache when a refresh is needed
    @CacheEvict(value = "tenantConfigs", allEntries = true)
    public void clearCache() {
        // This method is called to force a reload from the Oracle DB
    }
}

// DataSourceReloader.java - Polls for changes and triggers reload
@Component
public class DataSourceReloader {
    private final TenantConfigLoader tenantConfigLoader;
    private final AbstractRoutingDataSource sybaseRoutingDataSource;
    private final AbstractRoutingDataSource postgresRoutingDataSource;
    
    // ... constructor ...

    @Scheduled(fixedRateString = "${app.config.reload-rate-ms:60000}")
    public void scheduledReload() {
        tenantConfigLoader.clearCache();
        Map<String, TenantDatabaseConfig> allConfigs = tenantConfigLoader.loadConfigurations();
        
        // Logic to update the targetDataSources maps of both routing datasources
        // and close any stale connection pools.
        updateDataSources(allConfigs);
    }
    
    private void updateDataSources(Map<String, TenantDatabaseConfig> configs) { /* ... */ }
}
```

#### E. Dual Persistence Stack Configuration

This requires two `AbstractRoutingDataSource` beans, two `EntityManagerFactory` beans, and two `TransactionManager` beans.

```java
// SybaseJpaConfig.java
@Configuration
@EnableTransactionManagement
@EnableJpaRepositories(
    basePackages = "com.yourapp.repository",
    entityManagerFactoryRef = "sybaseEntityManagerFactory",
    transactionManagerRef = "sybaseTransactionManager"
)
public class SybaseJpaConfig {
    @Primary @Bean(name = "sybaseDataSource")
    public DataSource dataSource() { /* return a routing datasource for sybase tenants */ }
    
    @Primary @Bean(name = "sybaseEntityManagerFactory")
    public LocalContainerEntityManagerFactoryBean entityManagerFactory(...) {
        // Critical: Set Sybase dialect
        props.put("hibernate.dialect", "org.hibernate.dialect.SybaseDialect");
        /* ... */
    }
    
    @Primary @Bean(name = "sybaseTransactionManager")
    public PlatformTransactionManager transactionManager(...) { /* ... */ }
}

// PostgresJpaConfig.java
@Configuration
@EnableTransactionManagement
@EnableJpaRepositories(
    basePackages = "com.yourapp.repository",
    entityManagerFactoryRef = "postgresEntityManagerFactory",
    transactionManagerRef = "postgresTransactionManager",
    repositoryBeanNameSuffix = "Postgres" // Avoids bean name collision
)
public class PostgresJpaConfig {
    @Bean(name = "postgresDataSource")
    public DataSource dataSource() { /* return a routing datasource for postgres tenants */ }
    
    @Bean(name = "postgresEntityManagerFactory")
    public LocalContainerEntityManagerFactoryBean entityManagerFactory(...) {
        // Critical: Set PostgreSQL dialect
        props.put("hibernate.dialect", "org.hibernate.dialect.PostgreSQLDialect");
        /* ... */
    }
    
    @Bean(name = "postgresTransactionManager")
    public PlatformTransactionManager transactionManager(...) { /* ... */ }
}
```

#### F. Generic Repository Router Factory

This avoids writing a router class for every single repository.

```java
// RepositoryRouterFactoryBean.java - Creates a dynamic proxy for a repository interface
import org.springframework.beans.factory.FactoryBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.util.StringUtils;
import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;

/**
 * A generic FactoryBean for creating a routing proxy for any repository interface.
 *
 * @param <T> The type of the repository interface (e.g., ProductRepository).
 */
public class RepositoryRouterFactoryBean<T> implements FactoryBean<T> {

    @Autowired
    private ApplicationContext applicationContext;

    private Class<T> repositoryInterface;
    private T repositoryProxy;

    public void setRepositoryInterface(Class<T> repositoryInterface) {
        this.repositoryInterface = repositoryInterface;
    }

    @Override
    public T getObject() {
        // Create the proxy only once and cache it
        if (repositoryProxy == null) {
            this.repositoryProxy = createProxy();
        }
        return repositoryProxy;
    }

    @Override
    public Class<?> getObjectType() {
        return this.repositoryInterface;
    }

    @Override
    public boolean isSingleton() {
        return true;
    }

    @SuppressWarnings("unchecked")
    private T createProxy() {
        // Use Java's dynamic proxy mechanism
        return (T) Proxy.newProxyInstance(
                repositoryInterface.getClassLoader(),
                new Class[]{repositoryInterface},
                new RepositoryInvocationHandler()
        );
    }

    // This is the heart of the router. It intercepts every method call on the repository.
    private class RepositoryInvocationHandler implements InvocationHandler {
        @Override
        public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
            // 1. Determine which repository bean to use (Sybase or Postgres)
            Object targetRepository = getTargetRepository();

            // 2. Invoke the actual method on the target repository
            return method.invoke(targetRepository, args);
        }

        private Object getTargetRepository() {
            // Get the simple name of the interface (e.g., "ProductRepository")
            String interfaceName = repositoryInterface.getSimpleName();
            // Convert it to camelCase for the bean name (e.g., "productRepository")
            String baseBeanName = StringUtils.uncapitalize(interfaceName);

            String targetBeanName;
            DatabaseType dbType = TenantContext.getDbType(); // A refined context might be needed here

            // Based on the tenant context, choose the correct bean name suffix.
            if (dbType == DatabaseType.POSTGRES) {
                targetBeanName = baseBeanName + "Postgres"; // Matches repositoryBeanNameSuffix
            } else {
                // Default to the primary bean (Sybase)
                targetBeanName = baseBeanName;
            }

            // Ask the Spring container for the actual bean instance.
            return applicationContext.getBean(targetBeanName, repositoryInterface);
        }
    }
}

// RepositoryRouterConfig.java - Declares a router bean for each repository
@Configuration
@Configuration
public class RepositoryRouterConfig {

    // For ProductRepository
    @Bean
    public FactoryBean<ProductRepository> productRepository() {
        RepositoryRouterFactoryBean<ProductRepository> factory = new RepositoryRouterFactoryBean<>();
        factory.setRepositoryInterface(ProductRepository.class);
        return factory;
    }

    // For UserRepository
    @Bean
    public FactoryBean<UserRepository> userRepository() {
        RepositoryRouterFactoryBean<UserRepository> factory = new RepositoryRouterFactoryBean<>();
        factory.setRepositoryInterface(UserRepository.class);
        return factory;
    }

    // For OrderRepository
    @Bean
    public FactoryBean<OrderRepository> orderRepository() {
        RepositoryRouterFactoryBean<OrderRepository> factory = new RepositoryRouterFactoryBean<>();
        factory.setRepositoryInterface(OrderRepository.class);
        return factory;
    }
    
    // ... and so on for every repository you have.
    // This is declarative, scalable, and avoids boilerplate code.
}
```

This complete design provides a powerful, secure, and maintainable system for your dynamic datasource and migration needs, bridging the gap between legacy and modern cloud-native environments.



---

Of course. Here is the complete, detailed design based on our discussion. This architecture is robust, scalable, and addresses all your requirements for a zero-downtime, dynamically routed database layer for both modern and legacy applications.

### 1. High-Level Design & Principles

- **Master Index (Oracle):** A single Oracle table is the source of truth, mapping a `tenantId` (e.g., `AHN-9-LAB`) to its `dbType` (`SYBASE` or `POSTGRES`). This is the control plane for migration.
- **Configuration Storage (OpenShift):** Connection URLs are stored in centralized `ConfigMap`s (`sybase-details`, `postgres-details`), and credentials are in per-tenant `Secret`s for maximum security.
- **Dual JPA Stacks:** The application runs two complete, parallel JPA stacks. One is configured with the Sybase dialect, and the other with the PostgreSQL dialect. They operate independently.
- **Dynamic Routing:** A request's `tenantId` determines which stack to use. A generic Repository Router intercepts all database calls and delegates them to the correct underlying repository bean.
- **Zero-Downtime Reload:** The application periodically polls the Oracle database. If a migration is detected (a `dbType` has changed), it rebuilds its connection pools and routing information on-the-fly, without a restart.

### 2. Mermaid Architecture Diagram

This sequence diagram illustrates the flow for a single API request.

```other
sequenceDiagram
    participant Client
    participant SpringApp as Spring Boot App
    participant OracleDB as Master Index DB
    participant K8sConfig as ConfigMaps/Secrets
    participant SybaseRepo as Sybase JPA Stack
    participant PostgresRepo as PostgreSQL JPA Stack

    Client->>+SpringApp: GET /api/AHN-9-LAB/products
    
    SpringApp->>SpringApp: 1. TenantInterceptor extracts "AHN-9-LAB"
    
    alt Load Tenant Config (Cached)
      SpringApp->>+OracleDB: 2. Query: SELECT DB_TYPE FROM TENANT_ROUTING_CONFIG
      OracleDB-->>-SpringApp: Returns 'SYBASE' for 'AHN-9-LAB'
      SpringApp->>+K8sConfig: 3. Read URL & Secret for 'AHN-9-LAB'
      K8sConfig-->>-SpringApp: Returns Sybase connection details
    end
    
    SpringApp->>SpringApp: 4. TenantContext is populated: {tenantId: "AHN-9-LAB", dbType: "SYBASE"}
    
    Note over SpringApp: Service layer calls ProductRepository.findAll()
    
    SpringApp->>SpringApp: 5. RepositoryRouter (Proxy) intercepts the call
    SpringApp->>SpringApp: 6. Router checks TenantContext, determines target is Sybase bean
    
    SpringApp->>+SybaseRepo: 7. Delegates findAll() call to the Sybase-configured stack
    Note right of SybaseRepo: Uses a connection from its Sybase routing pool
    SybaseRepo-->>-SpringApp: Returns List<Product>
    
    Note right of PostgresRepo: (PostgreSQL Stack is idle for this request)
    
    SpringApp-->>-Client: 8. Returns JSON response
```



---

### 3. Complete Code Implementation

Here are the necessary code components, structured by their function.

#### A. External Configuration (The "Control Plane")

**1. Oracle Database Table:**

```sql
CREATE TABLE TENANT_ROUTING_CONFIG (
    TENANT_ID VARCHAR2(50) PRIMARY KEY,
    DB_TYPE   VARCHAR2(20) NOT NULL,
    CONSTRAINT chk_db_type CHECK (DB_TYPE IN ('SYBASE', 'POSTGRES'))
);

-- To migrate a tenant, run:
-- UPDATE TENANT_ROUTING_CONFIG SET DB_TYPE = 'POSTGRES' WHERE TENANT_ID = 'AHN-9-LAB';
```

**2. OpenShift Resources (YAML):**

- `master-tenant-map` is **not** used; Oracle is the source.
- `sybase-connection-details-configmap.yml`
- `postgres-connection-details-configmap.yml`
- Per-tenant secrets like `ahn-9-lab-secret.yml`

#### B. Application Bootstrap & Main Configuration

**1. `pom.xml` Dependencies:**
Include starters for `web`, `data-jpa`, `cache`, drivers for `oracle`, `sybase`, `postgresql`, and `lombok`.

**2. `DynamicDatasourceApplication.java`:**

```java
@SpringBootApplication
@EnableScheduling
@EnableCaching
@EnableAutoConfiguration(exclude = {
    DataSourceAutoConfiguration.class,
    HibernateJpaAutoConfiguration.class,
    JpaRepositoriesAutoConfiguration.class
})
public class DynamicDatasourceApplication {
    public static void main(String[] args) {
        SpringApplication.run(DynamicDatasourceApplication.class, args);
    }
}
```

**3. `application.yml`:**

```yaml
# Polling rate for checking Oracle for config changes
app.config.reload-rate-ms: 60000

# Static datasource for connecting to the master Oracle DB
app.datasource.master:
  url: jdbc:oracle:thin:@your-oracle-host:1521:yoursid
  username: config_reader
  password: ${ORACLE_MASTER_PASSWORD} # Inject from OpenShift secret
  driver-class-name: oracle.jdbc.OracleDriver
```

#### C. Request Handling: Tenant Context

```java
// DatabaseType.java
public enum DatabaseType { SYBASE, POSTGRES }

// TenantDatabaseConfig.java (POJO to hold assembled config)
@Data public class TenantDatabaseConfig { /* tenantId, dbType, url, username, etc. */ }

// TenantContext.java
public final class TenantContext {
    private static final ThreadLocal<DatabaseType> currentDbType = new ThreadLocal<>();
    public static void set(DatabaseType dbType) { currentDbType.set(dbType); }
    public static DatabaseType get() { return currentDbType.get(); }
    public static void clear() { currentDbType.remove(); }
}

// TenantInterceptor.java
@Component
public class TenantInterceptor implements HandlerInterceptor {
    @Autowired private TenantConfigLoader configLoader;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String tenantId = extractTenantIdFromRequest(request); // Your logic here
        if (tenantId != null) {
            Map<String, TenantDatabaseConfig> allConfigs = configLoader.getConfigurations();
            TenantDatabaseConfig config = allConfigs.get(tenantId);
            if (config != null) {
                TenantContext.set(config.getDbType());
            } else {
                // Handle case where tenant is not found
            }
        }
        return true;
    }
    
    @Override
    public void afterCompletion(HttpServletRequest r, HttpServletResponse s, Object h, Exception e) {
        TenantContext.clear();
    }
    // ...
}
```

#### D. Dynamic Configuration Loading and Reloading

```java
// TenantConfigLoader.java
@Component
public class TenantConfigLoader {
    // ... (paths to mounted files) ...
    private final JdbcTemplate masterJdbcTemplate;

    @Autowired
    public TenantConfigLoader(@Qualifier("masterDataSource") DataSource masterDataSource) {
        this.masterJdbcTemplate = new JdbcTemplate(masterDataSource);
    }

    @Cacheable("tenantConfigs")
    public Map<String, TenantDatabaseConfig> getConfigurations() {
        // 1. Query Oracle for master list
        // 2. Loop through results, build full config object by reading details from files
        // 3. Return the complete map
    }

    @CacheEvict(value = "tenantConfigs", allEntries = true)
    public void clearCache() {
        log.info("Tenant configuration cache cleared.");
    }
}

// DataSourceReloader.java
@Component
public class DataSourceReloader {
    private final TenantConfigLoader tenantConfigLoader;
    private final Map<String, AbstractRoutingDataSource> routingDataSources; // Map "SYBASE" -> ds, "POSTGRES" -> ds
    
    // ... constructor ...

    @Scheduled(fixedRateString = "${app.config.reload-rate-ms:60000}")
    public void scheduledReload() {
        log.info("Scheduled check for tenant configuration updates...");
        tenantConfigLoader.clearCache();
        Map<String, TenantDatabaseConfig> allConfigs = tenantConfigLoader.getConfigurations();
        updateDataSources(allConfigs);
    }

    private void updateDataSources(Map<String, TenantDatabaseConfig> configs) {
        // Complex logic to:
        // 1. Group tenants by dbType.
        // 2. For each group, create a map of {tenantId -> DataSource}.
        // 3. Call `setTargetDataSources` on the appropriate routing data source.
        // 4. Track old DataSource objects that are no longer in use and call `close()` on them.
    }
}
```

#### E. Dual JPA Persistence Stacks & DataSources

```java
// MasterDataSourceConfig.java
@Configuration
public class MasterDataSourceConfig {
    @Bean @Primary
    @ConfigurationProperties("app.datasource.master")
    public DataSource masterDataSource() {
        return DataSourceBuilder.create().type(HikariDataSource.class).build();
    }
}

// SybaseJpaConfig.java
@Configuration
@EnableTransactionManagement
@EnableJpaRepositories(
    basePackages = "com.yourapp.repository",
    entityManagerFactoryRef = "sybaseEntityManagerFactory",
    transactionManagerRef = "sybaseTransactionManager"
)
public class SybaseJpaConfig { /* ... as described before ... */ }

// PostgresJpaConfig.java
@Configuration
@EnableTransactionManagement
@EnableJpaRepositories(
    basePackages = "com.yourapp.repository",
    entityManagerFactoryRef = "postgresEntityManagerFactory",
    transactionManagerRef = "postgresTransactionManager",
    repositoryBeanNameSuffix = "Postgres"
)
public class PostgresJpaConfig { /* ... as described before ... */ }
```

#### F. Generic Repository Router Factory

```java
// RepositoryRouterFactoryBean.java
public class RepositoryRouterFactoryBean<T> implements FactoryBean<T>, InvocationHandler {
    // ... (full code from previous answer using Proxy and InvocationHandler) ...
    // The invoke method checks TenantContext.get() to decide the target bean name.
}

// RepositoryRouterConfig.java
@Configuration
public class RepositoryRouterConfig {
    @Bean
    public FactoryBean<ProductRepository> productRepository() {
        // ... (return a configured RepositoryRouterFactoryBean) ...
    }
    // ... one bean for each of your JpaRepository interfaces ...
}
```

#### G. Service Layer Usage (The Clean Result)

```java
@Service
public class ProductService {
    private final ProductRepository productRepository;

    @Autowired
    public ProductService(ProductRepository productRepository) {
        // Spring injects the dynamic proxy created by our FactoryBean.
        this.productRepository = productRepository;
    }

    public List<Product> getProductsForCurrentTenant() {
        // This single line transparently calls either the Sybase or PostgreSQL stack.
        return productRepository.findAll();
    }
}
```

