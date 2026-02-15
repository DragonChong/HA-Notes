# Dynamic Data Source for Sybase/PostgreSQL Migration

Excellent question. You've correctly identified the limitation of the Spring Profiles approach for your scenario. A restart is not feasible when you need to route requests dynamically based on a per-tenant (hospital/lab) configuration that changes over time.

This calls for a more advanced, dynamic, multi-tenant architecture. The core challenge is not just switching the `DataSource` (the connection), but switching the entire persistence context, including the Hibernate **dialect**, at runtime. A single `EntityManagerFactory` is tied to one dialect, so a simple `AbstractRoutingDataSource` is not sufficient.

The solution is to manually configure **two complete, parallel JPA persistence stacks** within the same application and create a routing mechanism at the repository or service layer to delegate calls to the correct stack based on the current tenant.

Here is a complete design and implementation guide for this dynamic, zero-downtime migration architecture.

### High-Level Architecture

1. **Central Configuration DB (Oracle):** A master database holds the mapping of each tenant (e.g., "Hospital-A") to its current database type (`SYBASE` or `POSTGRES`) and connection details.
2. **Tenant Context:** A `ThreadLocal` variable will hold the database type for the current request.
3. **Request Interceptor:** A Spring `HandlerInterceptor` will intercept every incoming request, identify the tenant (from a URL path, header, etc.), query the master Oracle DB, and populate the `ThreadLocal` Tenant Context.
4. **Dual Persistence Stacks:** We will disable Spring Boot's JPA auto-configuration and manually define two complete sets of beans:
    - **Sybase Stack:** `DataSource`, `EntityManagerFactory` (with Sybase Dialect), `TransactionManager`.
    - **PostgreSQL Stack:** `DataSource`, `EntityManagerFactory` (with PostgreSQL Dialect), `TransactionManager`.
1. **Dual Repository Beans:** We'll configure Spring Data JPA to create two sets of repository beans from your single set of repository interfaces (e.g., `productRepository` for Sybase and `productRepositoryPostgres` for PostgreSQL).
2. **Repository Router/Delegator:** This is the key component. Your services will not inject the repository directly. Instead, they will inject a custom "Router" bean that implements the repository interface. This router will check the Tenant Context and delegate the method call to the appropriate underlying repository bean (Sybase or Postgres).

---

### Step-by-Step Implementation

#### 1. Project Dependencies

Your `pom.xml` will be similar to the previous example, requiring drivers for Sybase, PostgreSQL, and Oracle (for the master config).

#### 2. Disable JPA Auto-Configuration

In your main application class, you must take full control of the persistence configuration.

```java
@SpringBootApplication
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

#### 3. Tenant Context and Interceptor

These components will determine which database to use for each request.

**`DatabaseType.java` (Enum)**

```java
public enum DatabaseType {
    SYBASE,
    POSTGRES
}
```

**`TenantContext.java` (ThreadLocal Holder)**

```java
public class TenantContext {
    private static final ThreadLocal<DatabaseType> currentTenant = new ThreadLocal<>();

    public static void set(DatabaseType type) {
        currentTenant.set(type);
    }

    public static DatabaseType get() {
        return currentTenant.get();
    }

    public static void clear() {
        currentTenant.remove();
    }
}
```

**`TenantDatabaseConfig.java` (POJO for master DB info)**

```java
@Data
public class TenantDatabaseConfig {
    private String tenantId;
    private DatabaseType dbType;
    private String url;
    private String username;
    private String password;
    private String driverClassName;
}
```

**`TenantConfigurationService.java` (Queries the master Oracle DB)**

```java
@Service
public class TenantConfigurationService {
    // This JdbcTemplate is configured to point to your MASTER Oracle DB.
    // This configuration is static and separate.
    private final JdbcTemplate masterJdbcTemplate; 
    
    // In-memory cache to avoid hitting the master DB on every request.
    private final Map<String, TenantDatabaseConfig> tenantConfigCache = new ConcurrentHashMap<>();

    @Autowired
    public TenantConfigurationService(@Qualifier("masterDataSource") DataSource masterDataSource) {
        this.masterJdbcTemplate = new JdbcTemplate(masterDataSource);
    }

    public TenantDatabaseConfig getTenantConfig(String tenantId) {
        // Production-ready code should use a proper cache (e.g., Caffeine, Redis)
        // with eviction policies.
        return tenantConfigCache.computeIfAbsent(tenantId, id -> 
            masterJdbcTemplate.queryForObject(
                "SELECT db_type, url, username, password, driver FROM tenant_configs WHERE tenant_id = ?",
                (rs, rowNum) -> new TenantDatabaseConfig(
                    id,
                    DatabaseType.valueOf(rs.getString("db_type")),
                    rs.getString("url"),
                    //... etc
                ),
                id
            )
        );
    }
}
```

**`TenantInterceptor.java`**

```java
@Component
public class TenantInterceptor implements HandlerInterceptor {

    @Autowired
    private TenantConfigurationService configService;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        // Example: Extract tenant from URL like /api/hospital-a/products
        String tenantId = extractTenantIdFromRequest(request);
        if (tenantId != null) {
            TenantDatabaseConfig config = configService.getTenantConfig(tenantId);
            TenantContext.set(config.getDbType());
        }
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        TenantContext.clear(); // CRITICAL: to prevent memory leaks and state bleeding
    }

    private String extractTenantIdFromRequest(HttpServletRequest request) {
        // Implement your logic to get the tenant ID.
        // For example, from a path variable, header, or JWT token.
        // e.g., /api/{tenantId}/...
        String[] parts = request.getRequestURI().split("/");
        if (parts.length > 2) {
            return parts[2]; // simplistic example
        }
        return null;
    }
}
```

**`WebMvcConfig.java` (Register the interceptor)**

```java
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {
    @Autowired
    private TenantInterceptor tenantInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(tenantInterceptor).addPathPatterns("/api/**");
    }
}
```

#### 4. Dual Persistence Stack Configuration

Now, we define the two complete, parallel stacks. We need a way to create DataSources dynamically, so we'll use a map-based `AbstractRoutingDataSource` for each stack.

**`DataSourceConfig.java`**
This class will be responsible for creating all `DataSource` beans from the master configuration.

```java
@Configuration
public class DataSourceConfig {

    // The static master datasource for fetching configurations
    @Bean
    @ConfigurationProperties("app.datasource.master")
    public DataSource masterDataSource() {
        return DataSourceBuilder.create().type(HikariDataSource.class).build();
    }
    
    // A router for all Sybase connections
    @Bean
    public DataSource sybaseDataSource(TenantConfigurationService configService) {
        // On startup, find all Sybase tenants and create datasources for them
        Map<Object, Object> sybaseDataSources = new HashMap<>();
        // ... Logic to query configService for all Sybase tenants and populate map ...
        // key = tenantId, value = DataSource object

        // This router will use the tenant ID to pick a specific connection
        // We will need to enhance TenantContext to hold the tenantId string as well.
        AbstractRoutingDataSource routingDataSource = new TenantAwareRoutingDataSource();
        routingDataSource.setTargetDataSources(sybaseDataSources);
        return routingDataSource;
    }

    // A router for all PostgreSQL connections
    @Bean
    public DataSource postgresDataSource(TenantConfigurationService configService) {
        // ... Similar logic to create a map of all PostgreSQL datasources ...
        AbstractRoutingDataSource routingDataSource = new TenantAwareRoutingDataSource();
        // ... set target datasources ...
        return routingDataSource;
    }
}
```

> **Note:** The above `DataSourceConfig` is conceptual. For simplicity in the next step, we'll assume a single `DataSource` bean for each type for now. A full multi-tenant implementation would use the routing approach shown.

**`SybaseJpaConfig.java` (Primary Stack)**

```java
@Configuration
@EnableTransactionManagement
@EnableJpaRepositories(
    basePackages = "com.yourapp.repository",
    entityManagerFactoryRef = "sybaseEntityManagerFactory",
    transactionManagerRef = "sybaseTransactionManager"
)
public class SybaseJpaConfig {

    @Primary // Mark this as the default stack
    @Bean(name = "sybaseDataSource")
    @ConfigurationProperties(prefix = "app.datasource.sybase") // A default fallback connection
    public DataSource dataSource() {
        return DataSourceBuilder.create().build();
    }

    @Primary
    @Bean(name = "sybaseEntityManagerFactory")
    public LocalContainerEntityManagerFactoryBean entityManagerFactory(
            EntityManagerFactoryBuilder builder, @Qualifier("sybaseDataSource") DataSource dataSource) {
        Map<String, Object> props = new HashMap<>();
        props.put("hibernate.dialect", "org.hibernate.dialect.SybaseDialect");
        
        return builder
                .dataSource(dataSource)
                .packages("com.yourapp.model") // Your @Entity classes
                .persistenceUnit("sybase")
                .properties(props)
                .build();
    }

    @Primary
    @Bean(name = "sybaseTransactionManager")
    public PlatformTransactionManager transactionManager(
            @Qualifier("sybaseEntityManagerFactory") EntityManagerFactory entityManagerFactory) {
        return new JpaTransactionManager(entityManagerFactory);
    }
}
```

**`PostgresJpaConfig.java` (Secondary Stack)**

```java
@Configuration
@EnableTransactionManagement
@EnableJpaRepositories(
    basePackages = "com.yourapp.repository",
    entityManagerFactoryRef = "postgresEntityManagerFactory",
    transactionManagerRef = "postgresTransactionManager",
    repositoryBeanNameSuffix = "Postgres" // CRITICAL: This avoids bean name collision
)
public class PostgresJpaConfig {

    @Bean(name = "postgresDataSource")
    @ConfigurationProperties(prefix = "app.datasource.postgres")
    public DataSource dataSource() {
        return DataSourceBuilder.create().build();
    }

    @Bean(name = "postgresEntityManagerFactory")
    public LocalContainerEntityManagerFactoryBean entityManagerFactory(
            EntityManagerFactoryBuilder builder, @Qualifier("postgresDataSource") DataSource dataSource) {
        Map<String, Object> props = new HashMap<>();
        props.put("hibernate.dialect", "org.hibernate.dialect.PostgreSQLDialect");

        return builder
                .dataSource(dataSource)
                .packages("com.yourapp.model")
                .persistenceUnit("postgres")
                .properties(props)
                .build();
    }

    @Bean(name = "postgresTransactionManager")
    public PlatformTransactionManager transactionManager(
            @Qualifier("postgresEntityManagerFactory") EntityManagerFactory entityManagerFactory) {
        return new JpaTransactionManager(entityManagerFactory);
    }
}
```

Because of the `repositoryBeanNameSuffix = "Postgres"`, Spring will create two beans for your `ProductRepository` interface:

1. `productRepository` (from the primary Sybase config)
2. `productRepositoryPostgres` (from the secondary Postgres config)

#### 5. The Repository Router

This is the final piece that connects your business logic to the dual persistence stacks.

```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;

// Implement your repository interface
@Component("delegatingProductRepository") // Give it a clear name
public class ProductRepositoryRouter implements ProductRepository {

    private final ProductRepository sybaseProductRepository;
    private final ProductRepository postgresProductRepository;

    @Autowired
    public ProductRepositoryRouter(
        @Qualifier("productRepository") ProductRepository sybaseProductRepository,
        @Qualifier("productRepositoryPostgres") ProductRepository postgresProductRepository
    ) {
        this.sybaseProductRepository = sybaseProductRepository;
        this.postgresProductRepository = postgresProductRepository;
    }

    // This is the core routing logic
    private ProductRepository getDelegate() {
        if (TenantContext.get() == DatabaseType.POSTGRES) {
            return postgresProductRepository;
        }
        // Default to Sybase if context is not set or is SYBASE
        return sybaseProductRepository;
    }
    
    // --- Delegate all interface methods ---

    @Override
    public List<Product> findAll() {
        return getDelegate().findAll();
    }

    @Override
    public <S extends Product> S save(S entity) {
        return getDelegate().save(entity);
    }

    // ... implement ALL other methods from JpaRepository by delegating to getDelegate()
}
```

#### 6. Using the Router in Your Service

Your business logic remains clean. It just needs to inject the router instead of a specific repository implementation.

```java
@Service
public class ProductService {

    private final ProductRepository productRepository;

    // Inject the router component
    @Autowired
    public ProductService(@Qualifier("delegatingProductRepository") ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<Product> getAllProducts() {
        // This call will be dynamically routed to Sybase or PostgreSQL
        // based on the tenant identified in the TenantInterceptor.
        return productRepository.findAll();
    }
}
```

This architecture is significantly more complex than the profiles-based approach but provides the runtime dynamism you require for a zero-downtime, tenant-by-tenant migration.



---

Excellent points. You've hit on the two most critical implementation details that turn this from a concept into a robust, maintainable solution.

1. The `TenantAwareRoutingDataSource` needs to be fleshed out.
2. Creating a manual router class for every repository is not scalable. We need a generic, factory-based approach.

Let's dive into the detailed implementation for both.

---

### 1. Detailed Implementation of `TenantAwareRoutingDataSource`

First, let's refine our `TenantContext`. For a true multi-tenant system, it's better to store the unique **tenant ID** (e.g., "hospital-a", "lab-b") in the context. The routing data source will use this ID as a key to look up the correct, fully-formed `DataSource` object from a map.

**`TenantContext.java` (Refined)**

```java
public final class TenantContext {
    private static final ThreadLocal<String> currentTenant = new ThreadLocal<>();

    public static void set(String tenantId) {
        if (tenantId == null) {
            clear();
        } else {
            currentTenant.set(tenantId);
        }
    }

    public static String get() {
        return currentTenant.get();
    }

    public static void clear() {
        currentTenant.remove();
    }
}
```

Now, the `TenantAwareRoutingDataSource` implementation becomes straightforward. Its only job is to ask the `TenantContext` for the current tenant ID.

**`TenantAwareRoutingDataSource.java`**

```java
import org.springframework.jdbc.datasource.lookup.AbstractRoutingDataSource;
import org.springframework.lang.Nullable;

public class TenantAwareRoutingDataSource extends AbstractRoutingDataSource {

    /**
     * This method is called by Spring's data access infrastructure (like JpaTransactionManager)
     * every time it needs a connection.
     *
     * @return The lookup key for the actual data source. This key MUST match one of the
     *         keys provided in the `setTargetDataSources(Map<Object, Object> targetDataSources)` map.
     */
    @Override
    @Nullable
    protected Object determineCurrentLookupKey() {
        // Get the tenant ID (e.g., "hospital-a") from our ThreadLocal context.
        return TenantContext.get();
    }
}
```

**How it's configured and used:**
You would create a bean of this type and populate its internal map with fully configured `DataSource` objects, one for each tenant.

```java
@Configuration
public class DataSourceConfig {

    @Autowired
    private TenantConfigurationService configService; // Service that reads from Oracle

    @Bean
    public DataSource routingDataSource() {
        TenantAwareRoutingDataSource routingDataSource = new TenantAwareRoutingDataSource();

        // 1. Fetch all tenant configurations from the master Oracle DB
        List<TenantDatabaseConfig> allTenants = configService.getAllTenantConfigs();

        // 2. Create a DataSource for each tenant and add it to a map
        Map<Object, Object> targetDataSources = new HashMap<>();
        for (TenantDatabaseConfig tenantConfig : allTenants) {
            DataSource dataSource = createDataSourceForTenant(tenantConfig);
            targetDataSources.put(tenantConfig.getTenantId(), dataSource);
        }

        // 3. Set the map and a default (optional)
        routingDataSource.setTargetDataSources(targetDataSources);
        // routingDataSource.setDefaultTargetDataSource(someDefaultDataSource());

        return routingDataSource;
    }

    private DataSource createDataSourceForTenant(TenantDatabaseConfig config) {
        return DataSourceBuilder.create()
                .driverClassName(config.getDriverClassName())
                .url(config.getUrl())
                .username(config.getUsername())
                .password(config.getPassword())
                .build();
    }
}
```

**Important:** The design in the previous answer used two separate `RoutingDataSource` beans (one for Sybase, one for Postgres). This approach is also valid, but using a single `RoutingDataSource` that holds connections for *all* tenants is simpler to manage at the `DataSource` level. The dialect separation will still be handled by the dual `EntityManagerFactory` configurations. The key is to ensure the correct `routingDataSource` is wired into the correct JPA stack.

---

### 2. A Generic Repository Router Factory

You are absolutely right. Creating a router class per repository is a maintenance nightmare. The solution is to create a generic **`FactoryBean`**. A `FactoryBean` in Spring is a special bean that acts as a factory for creating other beans. We will use it to dynamically create a proxy for any given repository interface. This proxy will contain the routing logic.

This approach uses **Java's Dynamic Proxies** under the hood.

**`RepositoryRouterFactoryBean.java`**

```java
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
```

*Note: You would need to slightly adjust your `TenantContext` to also hold the `DatabaseType` or derive it from the tenant ID.*

### How to Use the `RepositoryRouterFactoryBean`

Now, instead of creating dozens of router classes, you just declare beans of this factory type in a configuration class.

**`RepositoryRouterConfig.java`**

```java
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

### Finalizing the Service Layer Injection

Your service layer injection remains the same, but now it's much clearer what's happening. When you ask for `ProductRepository`, Spring sees the `FactoryBean` you've configured with the name "productRepository". Spring invokes `factory.getObject()` and injects the resulting proxy object.

```java
@Service
public class ProductService {

    private final ProductRepository productRepository;

    @Autowired
    public ProductService(ProductRepository productRepository) {
        // Spring injects the dynamic proxy created by our FactoryBean.
        // It's not injecting the Sybase or Postgres bean directly.
        this.productRepository = productRepository;
    }

    public void someBusinessLogic() {
        // When this method is called, the proxy's InvocationHandler intercepts it,
        // checks TenantContext, and forwards the call to the correct underlying
        // repository bean (sybaseProductRepository or productRepositoryPostgres).
        productRepository.findAll(); 
    }
}
```

This combination provides a powerful, highly flexible, and maintainable architecture for your zero-downtime, tenant-by-tenant migration.



---

Excellent questions. These details move us from a theoretical architecture to a practical, production-ready implementation. Let's analyze your approach and then provide a detailed solution.

### Analysis of the OpenShift `ConfigMap`/`Secret` Approach

Your proposal to use `ConfigMap`s and `Secret`s is not just a good approach; it is the **highly recommended, cloud-native best practice** for this scenario. It correctly separates configuration from your application code and leverages the strengths of the OpenShift/Kubernetes platform.

Let's break down the pros and cons:

**Pros (Major Advantages):**

- **IaC (Infrastructure as Code) Alignment:** Your datasource configurations can be defined in YAML and managed in a Git repository (GitOps). This provides versioning, auditing, and automated deployment.
- **Decoupling:** The same application container image can be deployed to any environment (dev, QA, prod) and pointed to a different set of `ConfigMap`s/`Secret`s without any code changes.
- **Enhanced Security:** Using `Secret`s is the correct way to handle database credentials. Access to them can be tightly controlled via OpenShift's Role-Based Access Control (RBAC).
- **Dynamic Reloading:** This is the killer feature. OpenShift can update the mounted files inside a running container when a `ConfigMap` is changed. A well-designed Spring Boot application can detect this change and reload its `DataSource` configuration **without a restart**, enabling true zero-downtime updates for tenant configurations.

**Cons (Operational Considerations):**

- **Management at Scale:** If you have hundreds of tenants, managing them in a single, large `ConfigMap` YAML file can become cumbersome. This is usually mitigated with automation and by structuring the configuration logically.
- **Onboarding Process:** Adding a new tenant requires a DevOps process (e.g., a pull request to update the `ConfigMap` YAML, which triggers a CI/CD pipeline). This is more controlled but less "real-time" than an admin updating a database table via a UI. For your use case, this is likely a feature, not a bug.

**Conclusion:** Stick with the `ConfigMap`/`Secret` approach. It is superior to a master database for this kind of application configuration in a containerized environment.

---

### Suggested Solution: Dynamic Reloading Architecture

Here is a complete, enhanced architecture that incorporates your composite tenant ID and the dynamic reloading of `ConfigMap` data.

#### Step 1: Structure Your `ConfigMap` and `Secret`s

Structure your data logically. Instead of separate entries for each property, use a single YAML or JSON string within your `ConfigMap`.

**`tenant-datasources-configmap.yml`**

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: tenant-datasources-config
data:
  # Use a single key with a structured YAML payload
  tenants.yml: |
    tenants:
      # The composite key is perfect
      - id: "AHN-9-LAB"
        dbType: "SYBASE"
        url: "jdbc:sybase:Tds:sybase-host-ahn:5000/labdb"
        driverClassName: "com.sybase.jdbc4.jdbc.SybDriver"
        secretName: "ahn-9-lab-credentials" # Reference to the Secret

      - id: "TKO-1-ADA"
        dbType: "SYBASE"
        url: "jdbc:sybase:Tds:sybase-host-tko:5000/adadb"
        driverClassName: "com.sybase.jdbc4.jdbc.SybDriver"
        secretName: "tko-1-ada-credentials"

      - id: "PMH-5-INT"
        dbType: "POSTGRES"
        url: "jdbc:postgresql://postgres-host:5432/intdb"
        driverClassName: "org.postgresql.Driver"
        secretName: "pmh-5-int-credentials"
```

For each tenant, create a corresponding `Secret`.

**`ahn-9-lab-secret.yml`**

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: ahn-9-lab-credentials
type: Opaque
stringData: # Use stringData for readability
  username: "sybase-user-for-ahn"
  password: "the-secret-password"
```

#### Step 2: Mount and Read in Spring Boot

In your `deployment.yml`, mount these as files.

```yaml
# In your container spec:
volumeMounts:
- name: config-volume
  mountPath: /etc/config # Mount the ConfigMap here
- name: secret-ahn-9-lab
  mountPath: /etc/secrets/ahn-9-lab-credentials
  readOnly: true
# ... more secret mounts

volumes:
- name: config-volume
  configMap:
    name: tenant-datasources-config
- name: secret-ahn-9-lab
  secret:
    secretName: ahn-9-lab-credentials
# ... more secret volumes
```

Your `TenantConfigurationService` now reads from these files instead of a database.

**`TenantConfigLoader.java`**

```java
@Component
public class TenantConfigLoader {
    private final Path configFilePath = Path.of("/etc/config/tenants.yml");

    // This method will parse the main config file and the associated secret files
    public Map<String, TenantDatabaseConfig> loadConfigurations() {
        // Use a library like SnakeYAML for YAML parsing or Jackson for JSON
        Yaml yaml = new Yaml();
        Map<String, List<Map<String, String>>> rawConfig;
        
        try (InputStream in = Files.newInputStream(configFilePath)) {
            rawConfig = yaml.load(in);
        } catch (IOException e) {
            // Handle error: log and maybe return an empty map or throw a fatal exception
            throw new IllegalStateException("Could not load tenant configuration file", e);
        }

        Map<String, TenantDatabaseConfig> configs = new ConcurrentHashMap<>();
        for (Map<String, String> tenantData : rawConfig.get("tenants")) {
            String tenantId = tenantData.get("id");
            String secretName = tenantData.get("secretName");
            
            // Read credentials from the corresponding secret file
            Map<String, String> credentials = readSecret(secretName);

            TenantDatabaseConfig config = new TenantDatabaseConfig();
            config.setTenantId(tenantId);
            config.setDbType(DatabaseType.valueOf(tenantData.get("dbType")));
            config.setUrl(tenantData.get("url"));
            config.setDriverClassName(tenantData.get("driverClassName"));
            config.setUsername(credentials.get("username"));
            config.setPassword(credentials.get("password"));
            configs.put(tenantId, config);
        }
        return configs;
    }

    private Map<String, String> readSecret(String secretName) {
        // In Kubernetes/OpenShift, each key in a secret becomes a file in the mount path.
        Path secretPath = Path.of("/etc/secrets", secretName);
        try {
            String username = Files.readString(secretPath.resolve("username"));
            String password = Files.readString(secretPath.resolve("password"));
            return Map.of("username", username, "password", password);
        } catch (IOException e) {
            throw new IllegalStateException("Could not read secret: " + secretName, e);
        }
    }
}
```

#### Step 3: Implement the Dynamic Reloading Mechanism

This is the most critical part. We need to watch for `ConfigMap` changes and update our `RoutingDataSource` without a restart.

1. Add the Spring Cloud Kubernetes dependency to enable reload features.

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-kubernetes-client-config</artifactId>
</dependency>
```

1. Enable reloading in your `application.yml`.

```yaml
spring:
  cloud:
    kubernetes:
      reload:
        enabled: true
        mode: event # 'event' is the standard, 'polling' is a fallback
        strategy: refresh
```

1. Create a `DataSourceReloader` component that listens for the refresh event.

**`DataSourceReloader.java`**

```java
import io.hikaricp.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.context.scope.refresh.RefreshScopeRefreshedEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.jdbc.datasource.lookup.AbstractRoutingDataSource;
import org.springframework.stereotype.Component;

@Component
public class DataSourceReloader implements ApplicationListener<RefreshScopeRefreshedEvent> {

    private static final Logger log = LoggerFactory.getLogger(DataSourceReloader.class);

    private final AbstractRoutingDataSource routingDataSource;
    private final TenantConfigLoader tenantConfigLoader;

    public DataSourceReloader(AbstractRoutingDataSource routingDataSource, TenantConfigLoader tenantConfigLoader) {
        this.routingDataSource = routingDataSource;
        this.tenantConfigLoader = tenantConfigLoader;
    }

    // This method is automatically called by Spring when a ConfigMap change is detected
    @Override
    public void onApplicationEvent(RefreshScopeRefreshedEvent event) {
        log.info("ConfigMap change detected. Reloading tenant datasources...");
        try {
            // 1. Load the new configuration from the updated files
            Map<String, TenantDatabaseConfig> newTenantConfigs = tenantConfigLoader.loadConfigurations();

            // 2. Create a new map of DataSource objects
            Map<Object, Object> newTargetDataSources = new HashMap<>();
            for (TenantDatabaseConfig config : newTenantConfigs.values()) {
                DataSource ds = createDataSourceForTenant(config);
                newTargetDataSources.put(config.getTenantId(), ds);
            }
            
            // 3. Atomically swap the map in the router
            // The AbstractRoutingDataSource#setTargetDataSources is designed for this.
            routingDataSource.setTargetDataSources(newTargetDataSources);

            // 4. Force the router to re-resolve datasources on next use
            routingDataSource.afterPropertiesSet();

            log.info("Successfully reloaded {} tenant datasources.", newTargetDataSources.size());

            // Note: This simple approach doesn't close old, removed connection pools.
            // A more robust implementation would track old DataSources and call close() on them.
            
        } catch (Exception e) {
            log.error("Failed to reload tenant datasources after refresh event.", e);
        }
    }

    private DataSource createDataSourceForTenant(TenantDatabaseConfig config) {
        HikariDataSource dataSource = new HikariDataSource();
        dataSource.setDriverClassName(config.getDriverClassName());
        dataSource.setJdbcUrl(config.getUrl());
        dataSource.setUsername(config.getUsername());
        dataSource.setPassword(config.getPassword());
        dataSource.setPoolName("HikariPool-" + config.getTenantId());
        //... set other pool properties
        return dataSource;
    }
}
```

Now, when you update the `tenant-datasources-configmap.yml` and apply it to OpenShift (`oc apply -f ...`), the mounted file inside your pods will update, Spring Cloud Kubernetes will detect it, fire an event, and your `DataSourceReloader` will rebuild the connections—all with zero downtime. Your migration from Sybase to PostgreSQL for any tenant is now just a one-line change in a YAML file.



---

You have hit upon a critical scalability issue in managing configuration across a microservices architecture. Your proposed approach is a significant improvement, and we can refine it into a robust, secure, and highly manageable solution.

Let's analyze your idea and then build out the best-practice implementation.

### Analysis of Your Proposed Approach

You are suggesting organizing configuration by **type** (`sybase`, `postgres`) rather than by **tenant**. This is an excellent evolution of the design.

**Pros of Your Approach:**

- **Centralized & DRY (Don't Repeat Yourself):** This is the biggest advantage. A connection string for a specific Sybase database (`AHN-9-LAB`) is defined **only once** in `sybase-configmap`. All microservices that need to connect to it will read from this single source of truth. This dramatically simplifies updates.
- **Clear Separation of Concerns:** Sybase configurations are managed separately from PostgreSQL configurations. This is clean and easy to reason about.
- **Simplified Tenant Onboarding:** Adding a new Sybase tenant involves adding a key to the `sybase-configmap` and `sybase-secret`. This is a very clear and simple operation.

**Challenges to Address:**

1. **The "Discovery" Problem:** How does the application know *which* `ConfigMap` to look in for a given tenant? If a request for `AHN-9-LAB` comes in, the code needs to know that its configuration is in the `sybase-configmap`, not the `postgresql-configmap`.
2. **The Migration Path:** When you migrate `AHN-9-LAB` from Sybase to PostgreSQL, the operation involves *deleting* keys from the Sybase files and *adding* keys to the PostgreSQL files. This works, but it's a multi-step process that could lead to inconsistent states if not handled carefully.
3. **Security of Secrets:** Storing all credentials for a database type in a single `Secret` (e.g., `sybase-secret`) can violate the **Principle of Least Privilege**. If a microservice only needs access to `AHN-9-LAB`, mounting the entire `sybase-secret` might give it credentials for all other Sybase databases, which is a security risk.

### The Recommended Hybrid Solution: "Master Index" Architecture

We can combine the best of both worlds: your idea of centralizing by type, and the previous idea of a unified tenant definition. The solution is a **Master Index `ConfigMap`** that directs traffic, while other `ConfigMap`s store the details.

This architecture is the gold standard for this problem.

**Architecture Overview:**

1. **`master-tenant-map` (ConfigMap):** The single source of truth for routing. It maps a `tenantId` to its current `dbType`. **This is the only file you edit to perform a migration.**
2. **`sybase-connection-details` (ConfigMap):** Stores the JDBC URL for every Sybase tenant, keyed by `tenantId`.
3. **`postgres-connection-details` (ConfigMap):** Stores the JDBC URL for every PostgreSQL tenant, keyed by `tenantId`.
4. **Per-Tenant Secrets:** We retain the "one secret per tenant" model for maximum security. (e.g., `ahn-9-lab-secret`, `pmh-5-int-secret`).

---

### Step-by-Step Implementation

#### Step 1: Define the OpenShift Resources

**`master-tenant-map-configmap.yml` (The Migration Control File)**

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: master-tenant-map
data:
  # Simple key-value mapping
  AHN-9-LAB: "SYBASE"
  TKO-1-ADA: "SYBASE"
  PMH-5-INT: "POSTGRES"
```

> **To migrate `AHN-9-LAB`**, you would simply change its value here to `"POSTGRES"`. That's it.

**`sybase-details-configmap.yml`**

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: sybase-connection-details
data:
  AHN-9-LAB: "jdbc:sybase:Tds:sybase-host-ahn:5000/labdb"
  TKO-1-ADA: "jdbc:sybase:Tds:sybase-host-tko:5000/adadb"
```

**`postgres-details-configmap.yml`**

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: postgres-connection-details
data:
  PMH-5-INT: "jdbc:postgresql://postgres-host:5432/intdb"
  # When AHN-9-LAB is ready to migrate, you would add its new connection string here
  # AHN-9-LAB: "jdbc:postgresql://new-postgres-host:5432/ahn_lab_migrated"
```

**`ahn-9-lab-secret.yml` (Example Secret - Remains Per-Tenant)**

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: ahn-9-lab-secret
type: Opaque
stringData:
  username: "sybase-user-for-ahn"
  password: "the-secret-password"
```

#### Step 2: Mount All Resources in the Application

Your `deployment.yml` will now mount these files into distinct directories for clarity.

```yaml
# In your container spec:
volumeMounts:
- name: master-map-vol
  mountPath: /etc/config/master-map
- name: sybase-details-vol
  mountPath: /etc/config/sybase-details
- name: postgres-details-vol
  mountPath: /etc/config/postgres-details
- name: secret-ahn-9-lab
  mountPath: /etc/secrets/AHN-9-LAB # Mount each secret into a dir named after the tenant
  readOnly: true
# ... mount other secrets similarly

volumes:
- name: master-map-vol
  configMap: { name: master-tenant-map }
- name: sybase-details-vol
  configMap: { name: sybase-connection-details }
- name: postgres-details-vol
  configMap: { name: postgres-connection-details }
- name: secret-ahn-9-lab
  secret: { secretName: ahn-9-lab-secret }
# ... other secret volumes
```

#### Step 3: Refactor the `TenantConfigLoader` to Assemble the Configuration

This service now has a more sophisticated job: it reads the master map and then pulls details from the appropriate subordinate files.

```java
@Component
public class TenantConfigLoader {

    // Paths to the mounted directories
    private final Path masterMapDir = Path.of("/etc/config/master-map");
    private final Path sybaseDetailsDir = Path.of("/etc/config/sybase-details");
    private final Path postgresDetailsDir = Path.of("/etc/config/postgres-details");
    private final Path secretsBaseDir = Path.of("/etc/secrets");

    public Map<String, TenantDatabaseConfig> loadConfigurations() throws IOException {
        Map<String, TenantDatabaseConfig> configs = new ConcurrentHashMap<>();

        // 1. Read the master map to get the list of tenants and their dbType
        // In Kubernetes, each key in a ConfigMap becomes a file in the mount directory.
        try (Stream<Path> files = Files.list(masterMapDir)) {
            for (Path tenantFile : files.toList()) {
                String tenantId = tenantFile.getFileName().toString();
                String dbTypeStr = Files.readString(tenantFile).trim();
                DatabaseType dbType = DatabaseType.valueOf(dbTypeStr);

                // 2. Assemble the full config for this tenant
                TenantDatabaseConfig config = buildConfigForTenant(tenantId, dbType);
                configs.put(tenantId, config);
            }
        }
        return configs;
    }

    private TenantDatabaseConfig buildConfigForTenant(String tenantId, DatabaseType dbType) throws IOException {
        // 3. Get connection URL from the correct details ConfigMap
        String url;
        String driverClassName;
        if (dbType == DatabaseType.SYBASE) {
            url = Files.readString(sybaseDetailsDir.resolve(tenantId)).trim();
            driverClassName = "com.sybase.jdbc4.jdbc.SybDriver"; // Or read from another map
        } else { // POSTGRES
            url = Files.readString(postgresDetailsDir.resolve(tenantId)).trim();
            driverClassName = "org.postgresql.Driver";
        }
        
        // 4. Get credentials from the tenant-specific secret
        Path secretPath = secretsBaseDir.resolve(tenantId);
        String username = Files.readString(secretPath.resolve("username")).trim();
        String password = Files.readString(secretPath.resolve("password")).trim();

        // 5. Build the final config object
        TenantDatabaseConfig config = new TenantDatabaseConfig();
        config.setTenantId(tenantId);
        config.setDbType(dbType);
        config.setUrl(url);
        config.setDriverClassName(driverClassName);
        config.setUsername(username);
        config.setPassword(password);
        return config;
    }
}
```

### Summary of Advantages of this Hybrid Architecture

- **Zero-Downtime Migration:** To migrate `AHN-9-LAB`, you only change one key-value pair in `master-tenant-map`. The application reload mechanism will trigger the `TenantConfigLoader`, which will now look for `AHN-9-LAB`'s details in the PostgreSQL files instead of the Sybase ones.
- **Highly Scalable:** Adding a new hospital/lab is a clear, automatable process:
    1. Create a new `Secret` for it.
    2. Add its connection string to the appropriate details `ConfigMap`.
    3. Add its entry to the `master-tenant-map`.
- **Maximum Security:** The per-tenant `Secret` model ensures a microservice pod only has access to the credentials it absolutely needs.
- **DRY Principle:** Connection strings are not repeated across microservice configurations.
- **Flexibility:** All other parts of the system (the routing datasources, the dual entity managers, the repository router factory) work perfectly with this configuration loading strategy. They only care about the final `TenantDatabaseConfig` object, not how it was assembled.



---

Of course. This is a very common and critical real-world constraint. Your architecture must serve both modern (OpenShift) and legacy (non-OpenShift) applications from a single source of truth.

The great news is that the **"Master Index" architecture we designed is perfectly suited for this**. We only need to change the implementation detail of *how* the `master-tenant-map` is loaded, while the rest of the dynamic, dual-stack JPA architecture remains identical.

The Oracle database simply becomes the canonical **source of truth** for the `tenantId -> dbType` mapping.

### Refined Architecture: Oracle as the Master Index

Here’s the adjusted flow, which is conceptually the same but with a different implementation for the master index.

1. **Source of Truth (Oracle DB):** A single table in an Oracle database holds the master routing information.

```sql
CREATE TABLE TENANT_ROUTING_CONFIG (
    TENANT_ID VARCHAR2(50) PRIMARY KEY,
    DB_TYPE   VARCHAR2(20) NOT NULL -- 'SYBASE' or 'POSTGRES'
);

-- Sample Data
INSERT INTO TENANT_ROUTING_CONFIG (TENANT_ID, DB_TYPE) VALUES ('AHN-9-LAB', 'SYBASE');
INSERT INTO TENANT_ROUTING_CONFIG (TENANT_ID, DB_TYPE) VALUES ('PMH-5-INT', 'POSTGRES');
```

1. **Connection Details (OpenShift `ConfigMap`s):** The JDBC URLs remain in the centralized `ConfigMap`s as before. This is still a best practice for your cloud-native services.
    - `sybase-connection-details` (ConfigMap)
    - `postgres-connection-details` (ConfigMap)
1. **Credentials (OpenShift `Secret`s):** Secrets remain per-tenant in OpenShift for maximum security.
    - `ahn-9-lab-secret`, `pmh-5-int-secret`, etc.

**The Migration Process is now an `UPDATE` statement:**

To migrate `AHN-9-LAB`, an administrator or an automated process runs a single SQL command. All applications (legacy and new) will pick up this change on their next refresh cycle.

```sql
UPDATE TENANT_ROUTING_CONFIG
SET DB_TYPE = 'POSTGRES'
WHERE TENANT_ID = 'AHN-9-LAB';
```

---

### Implementation in Spring Boot for OpenShift Services

Your OpenShift microservices will now have a **hybrid configuration loader**. It reads the master index from Oracle and then enriches that information with connection details from the mounted `ConfigMap`s and `Secret`s.

#### Step 1: Configure a Static `DataSource` for the Master Oracle DB

Your application needs a dedicated, non-routing datasource to connect to Oracle. This configuration is static and bootstrapped early.

**`application.yml`**

```yaml
app:
  datasource:
    master:
      url: jdbc:oracle:thin:@your-oracle-host:1521:yoursid
      username: master_config_reader
      # Use vault or external secret management for the password in production
      password: ${ORACLE_MASTER_PASSWORD}
      driver-class-name: oracle.jdbc.OracleDriver
```

**`DataSourceConfig.java`**

```java
@Configuration
public class DataSourceConfig {
    
    // This bean provides the connection to the Oracle master database.
    @Bean
    @Primary // Mark as primary to avoid conflicts if other datasources are defined elsewhere.
    @ConfigurationProperties("app.datasource.master")
    public DataSource masterDataSource() {
        return DataSourceBuilder.create().type(HikariDataSource.class).build();
    }
}
```

#### Step 2: Refactor `TenantConfigLoader` to Use the Master `DataSource`

This service now queries Oracle first.

```java
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
```

#### Step 3: Implement Polling or Event-Driven Refresh

Since the source of truth is now an external database, the automatic `ConfigMap` refresh mechanism won't work for the master list. You need a strategy to periodically check Oracle for updates.

**Option A: Simple Polling (Easiest)**

Use Spring's `@Scheduled` annotation to periodically clear the cache and trigger a reload.

**`DataSourceReloader.java` (Modified)**

```java
@Component
public class DataSourceReloader {
    // ... (fields for routingDataSource, tenantConfigLoader, etc.)

    // This is the key change. We now trigger reloads on a schedule.
    @Scheduled(fixedRateString = "${app.config.reload-rate-ms:60000}") // e.g., every 60 seconds
    public void scheduledReload() {
        log.info("Scheduled check for tenant configuration updates...");
        
        // Clear the cache to force a re-read from Oracle on the next call
        tenantConfigLoader.clearCache();

        // Now, trigger the actual reload logic.
        // It's good practice to wrap this in a separate, non-scheduled method.
        reloadTenantDataSources();
    }

    public void reloadTenantDataSources() {
        // ... this is the same logic as the onApplicationEvent method from before ...
        // 1. Call tenantConfigLoader.loadConfigurations() which now queries Oracle
        // 2. Create new DataSource objects
        // 3. Atomically swap the map in the routingDataSource
    }
}
```

**Option B: Event-Driven (More Advanced)**
If you need instant updates, you could use Oracle's Continuous Query Notification (CQN) or a message queue (like Kafka/JMS). When the `TENANT_ROUTING_CONFIG` table is updated, a database trigger sends a message. Your microservices listen to this queue and trigger the `reloadTenantDataSources()` method on message receipt. This is more complex but avoids polling. For most use cases, polling every 30-60 seconds is perfectly acceptable.

### Summary of this Final, Hybrid Architecture

This design elegantly meets all your requirements:

- **Single Source of Truth:** The Oracle DB serves as the master index for both legacy and new applications.
- **Cloud-Native Best Practices:** Your OpenShift services still leverage `ConfigMap`s and `Secret`s for storing connection details and credentials, which is secure and scalable.
- **Decoupled & Maintainable:** The `TenantConfigLoader` cleanly separates the logic of *discovering* the `dbType` (from Oracle) from the logic of *retrieving* the connection details (from files).
- **Zero-Downtime Migration:** A simple `UPDATE` in Oracle, followed by the next scheduled poll, transparently migrates a tenant for all consuming applications without a restart.

