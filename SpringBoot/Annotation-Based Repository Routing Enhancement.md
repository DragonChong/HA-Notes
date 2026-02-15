# Annotation-Based Repository Routing Enhancement

## Overview

Enhance the data-source library to support annotation-based repository routing that automatically determines the correct lab number based on repository type, reducing the need for manual `SwitchDataSource()` calls.

## Requirements Summary

- **Common tables (lab 9)**: Auto-route to current server + lab 9
- **Request tables (labs 1-8)**: Use current context lab automatically (LAB_SPECIFIC without labNo)
- **Lab-specific tables**: Force specific lab number (e.g., lab 5 for APS)
- **Backward compatibility**: Existing unannotated repositories continue working
- **Annotation priority**: Annotation settings are immutable and override manual switches

## Implementation Steps

### 1. Create Custom Annotation

**File**: `data-source/src/main/java/hk/org/ha/lis/config/RepositoryType.java` (new)

Create a custom annotation with:

- `type` parameter: "COMMON", "LAB_SPECIFIC", "MANUAL" (default)
- `labNo` parameter: specific lab number (default -1 for auto-detection from context)
- `database` parameter: database name (default empty for auto-detection)

Example usage:

```java
@RepositoryType(type = "COMMON", labNo = 9)
public interface PatientRepository extends JpaRepository<Patient, Long> {}
  
@RepositoryType(type = "LAB_SPECIFIC") // labNo = -1, uses current context lab
public interface RequestRepository extends JpaRepository<Request, Long> {}
  
@RepositoryType(type = "LAB_SPECIFIC", labNo = 5) // Forces lab 5
public interface ApsSpecificRepository extends JpaRepository<ApsData, Long> {}
```

### 2. Enhance RepositoryRouterFactoryBean

**File**: `data-source/src/main/java/hk/org/ha/lis/config/RepositoryRouterFactoryBean.java`

Modify the `getTargetRepository()` method to:

1. Check if repository interface has `@RepositoryType` annotation
2. If annotation exists:
- Extract type and labNo from annotation
- Build appropriate `ServerInfo` based on annotation type:
- **COMMON**: Use current server + labNo from annotation (9) + current database
- **LAB_SPECIFIC**: If labNo specified, use current server + labNo from annotation + current database; if labNo = -1, use current context as-is
- **MANUAL**: Fall back to current ThreadLocal context (backward compatible)
3. Temporarily set the computed `ServerInfo` in a separate ThreadLocal for routing decision
4. Route to Sybase/PostgreSQL based on the computed context's dbType
5. Restore original context after routing

Key changes in `RepositoryInvocationHandler.invoke()`:

```java
@Override
public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
 // Check for annotation
 RepositoryType annotation = repositoryInterface.getAnnotation(RepositoryType.class);
 ServerInfo effectiveContext = computeEffectiveContext(annotation);
 // Route based on effective context
 Object targetRepository = getTargetRepository(effectiveContext);
 return method.invoke(targetRepository, args);
}
```

### 3. Add Context Resolution Logic

**File**: `data-source/src/main/java/hk/org/ha/lis/config/DataSourceContextHolder.java`

Add helper method:

```java
public static ServerInfo computeContextFromAnnotation(
 RepositoryType annotation,
 ServerInfo currentContext
) {
 // Logic to build ServerInfo based on annotation type
}
```

This method will:

- Handle COMMON type: keep server, override lab to annotation's labNo
- Handle LAB_SPECIFIC type: if labNo >= 0, keep server and override lab to annotation's labNo; if labNo = -1, return current context unchanged
- Handle MANUAL type: return current context unchanged

### 4. Update RepositoryRouterBeanDefinitionRegistryPostProcessor

**File**: `data-source/src/main/java/hk/org/ha/lis/config/RepositoryRouterBeanDefinitionRegistryPostProcessor.java`

No changes needed - annotation scanning will happen at runtime in the FactoryBean.

### 5. Add Constants

**File**: `data-source/src/main/java/hk/org/ha/lis/constants/DatabaseConstants.java`

Add constants for repository types:

```java
public static final String REPOSITORY_TYPE_COMMON = "COMMON";
public static final String REPOSITORY_TYPE_LAB_SPECIFIC = "LAB_SPECIFIC";
public static final String REPOSITORY_TYPE_MANUAL = "MANUAL";
public static final int COMMON_LAB_NUMBER = 9;
```

### 6. Testing Considerations

After implementation, test scenarios:

1. **Common repository**: Verify it always routes to lab 9 regardless of current context
2. **LAB_SPECIFIC repository without labNo**: Verify it uses current lab from context (1-8)
3. **LAB_SPECIFIC repository with labNo**: Verify it forces specific lab (e.g., 5 for APS)
4. **Unannotated repository**: Verify backward compatibility with manual switching
5. **Cross-lab operations**: Verify annotation overrides manual `SwitchDataSource()` calls

## Benefits

1. **Reduced boilerplate**: No need to call `SwitchDataSource()` for common/lab-specific tables
2. **Type safety**: Repository routing is declarative and compile-time visible
3. **Maintainability**: Clear intent - annotation shows which lab a repository targets
4. **Backward compatible**: Existing code continues working without changes
5. **Simplified service code**: Example transformation:

**Before**:

```java
// Must manually switch for each lab
DataSourceContextHolder.SwitchDataSource("PWH", 9, "LAB_DB");
patientRepository.findById(id);
  
DataSourceContextHolder.SwitchDataSource("PWH", 3, "LAB_DB");
requestRepository.findById(id);
```

**After**:

```java
// Automatic routing based on annotation
patientRepository.findById(id); // Auto-routes to lab 9
requestRepository.findById(id); // Auto-uses current lab
```

## Files to Modify/Create

1. **Create**: `data-source/src/main/java/hk/org/ha/lis/config/RepositoryType.java`
2. **Modify**: `data-source/src/main/java/hk/org/ha/lis/config/RepositoryRouterFactoryBean.java`
3. **Modify**: `data-source/src/main/java/hk/org/ha/lis/config/DataSourceContextHolder.java`
4. **Modify**: `data-source/src/main/java/hk/org/ha/lis/constants/DatabaseConstants.java`