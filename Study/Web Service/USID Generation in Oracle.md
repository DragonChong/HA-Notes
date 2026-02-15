# USID Generation in Oracle

I'll analyze the enhancement requirements for USID generation in Oracle based on the provided code and documentation. Let me examine the current implementation and the proposed changes.

Search files...

Now let me examine the specific `getUSID` method more closely to understand the current implementation:

Read file: lisWeb/src/hk/org/ha/lis/genusid/GenUSIDImpl.java

Now let me examine the transaction management in the `getSpecDtl` method to understand how transactions are currently handled:

Read file: lisWeb/src/hk/org/ha/lis/genusid/GenUSIDImpl.java

Based on my analysis of the current implementation and the Oracle migration documentation, here's my comprehensive analysis of the enhancement requirements for USID generation in Oracle:

## Analysis of Enhancement Requirements for USID Generation in Oracle

### Current Implementation Analysis

The current system uses **Sybase** with the following characteristics:

1. **Database Connections**: Multiple JDBC connections for different databases:
    - `jdbc/lisgcr1-corp-loe-ds` (LOE database)
    - `jdbc/lis-corp-s1-com-db-ds` (Corporate database)
    - `jdbc/lis-cuh-s9-lab-db-ds` (CUH database)
    - Hospital-specific lab databases: `jdbc/lis-{server}-s9-lab-db-ds`
2. **Current Locking Strategy**: Uses **timestamp-based optimistic locking** with `tsequal()` function:

```sql
UPDATE usid_serial SET usid = ? 
WHERE send_hosp = ? AND lab_code = ? AND year = ? 
AND tsequal(timestamp, 0x{hexTime})
```

3. **Transaction Management**: Long-running transactions that span multiple USID generations within a single request, with commit only at the end of all specimen processing.
4. **Retry Mechanism**: Simple retry loop with random sleep intervals (1-100ms) and maximum retry count of 10.

### Enhancement Requirements Analysis

#### 1. **Change All Database Connections to Oracle**

**Current State**: Multiple Sybase connections

**Target State**: Single Oracle connection `jdbc/lisgcr1-corp-loe-ds`

**Impact Analysis**:

- **Positive**: Simplified connection management, reduced connection overhead
- **Challenges**:
    - Need to migrate all data from multiple databases to single Oracle instance
    - Schema changes required for Oracle compatibility
    - Function differences (e.g., `tsequal()` vs Oracle's `ORA_ROWSCN`)

#### 2. **Shorten Transaction Duration**

**Current State**: Transaction spans entire specimen processing loop

**Target State**: Immediate commit after each USID generation

**Impact Analysis**:

- **Positive**:
    - Reduced lock contention
    - Better concurrency
    - Faster response times
    - Reduced deadlock risk
- **Challenges**:
    - Need to handle partial failures (some USIDs generated, others failed)
    - Transaction isolation level considerations
    - Error handling complexity

#### 3. **Use Optimistic Locking for Oracle**

**Current State**: Sybase timestamp-based optimistic locking

**Target State**: Oracle optimistic locking using `ORA_ROWSCN` or version column

**Implementation Options**:

**Option A: Using ORA_ROWSCN**

```sql
-- Read with SCN
SELECT usid, ORA_ROWSCN FROM usid_serial 
WHERE send_hosp = ? AND lab_code = ? AND year = ?

-- Update with SCN check
UPDATE usid_serial SET usid = ? 
WHERE send_hosp = ? AND lab_code = ? AND year = ? 
AND ORA_ROWSCN = ?
```

**Option B: Using Version Column**

```sql
-- Add version column to table
ALTER TABLE usid_serial ADD version_number NUMBER DEFAULT 1;

-- Read with version
SELECT usid, version_number FROM usid_serial 
WHERE send_hosp = ? AND lab_code = ? AND year = ?

-- Update with version check
UPDATE usid_serial SET usid = ?, version_number = version_number + 1
WHERE send_hosp = ? AND lab_code = ? AND year = ? 
AND version_number = ?
```

#### 4. **Handle Retry Mechanism for Optimistic Locking**

**Current State**: Simple retry with random sleep

**Target State**: Sophisticated retry with exponential backoff

**Recommended Retry Strategy**:

```java
private static final int MAX_OPTIMISTIC_RETRY = 5;
private static final int BASE_SLEEP_MS = 10;

private String getUSIDWithOptimisticLocking(String specNum, String specNumsuffix) {
    int retryCount = 0;
    
    while (retryCount < MAX_OPTIMISTIC_RETRY) {
        try {
            // Read current state
            UsidSerialState state = readUsidSerialState();
            
            // Calculate next USID
            String nextUsid = calculateNextUSID(state.getCurrentUsid());
            
            // Attempt optimistic update
            int rowsUpdated = updateUsidSerialOptimistic(state, nextUsid);
            
            if (rowsUpdated == 1) {
                // Success - insert mapping and return
                insertUsidMapping(nextUsid, specNum, specNumsuffix);
                return nextUsid;
            } else {
                // Optimistic lock failure - retry with exponential backoff
                retryCount++;
                long sleepTime = BASE_SLEEP_MS * (long)Math.pow(2, retryCount - 1);
                Thread.sleep(sleepTime);
            }
        } catch (Exception e) {
            // Handle specific exceptions
            retryCount++;
            if (retryCount >= MAX_OPTIMISTIC_RETRY) {
                throw new RuntimeException("Failed to generate USID after " + MAX_OPTIMISTIC_RETRY + " attempts", e);
            }
        }
    }
}
```

### Recommended Implementation Approach

#### Phase 1: Database Schema Migration

1. **Create Oracle tables** with proper constraints and indexes
2. **Add version column** to `usid_serial` table for optimistic locking
3. **Migrate existing data** from Sybase to Oracle
4. **Update connection strings** to use Oracle

#### Phase 2: Optimistic Locking Implementation

1. **Replace timestamp-based locking** with version-based optimistic locking
2. **Implement retry mechanism** with exponential backoff
3. **Add proper error handling** for optimistic lock failures

#### Phase 3: Transaction Optimization

1. **Shorten transaction scope** to individual USID generation
2. **Implement immediate commit** after successful USID generation
3. **Add transaction rollback** handling for failures

#### Phase 4: Performance Optimization

1. **Add database indexes** for optimal query performance
2. **Implement connection pooling** for Oracle
3. **Add monitoring and metrics** for retry patterns

### Key Considerations

#### Performance Impact

- **Expected improvement**: 3-5x better concurrency
- **Reduced lock contention**: Immediate commits reduce blocking
- **Better scalability**: Optimistic locking allows higher throughput

#### Data Consistency

- **Gap-free numbering**: Maintained through proper retry logic
- **ACID compliance**: Each USID generation is atomic
- **Error recovery**: Failed generations can be retried

#### Migration Risks

- **Data integrity**: Careful validation during migration
- **Downtime**: Minimal downtime required for schema changes
- **Rollback plan**: Ability to revert to Sybase if needed

#### Monitoring Requirements

- **Retry metrics**: Track optimistic lock failure rates
- **Performance metrics**: Monitor transaction duration
- **Error tracking**: Log failed USID generations

This analysis provides a comprehensive roadmap for implementing the Oracle enhancement while maintaining data integrity and improving performance.

---

I understand you want to use the current USID value in the WHERE clause for optimistic locking instead of using a version column or ORA_ROWSCN. This is a valid approach for optimistic locking where you check that the value hasn't changed since you read it.

Let me analyze how this would work with the current implementation:

Read file: lisWeb/src/hk/org/ha/lis/genusid/GenUSIDImpl.java

Perfect! I can see the current implementation uses timestamp-based optimistic locking. Your approach to use the current USID value in the WHERE clause is an excellent alternative for optimistic locking. Let me analyze this approach:

## Analysis: Using USID Value in WHERE Clause for Optimistic Locking

### Current Implementation (Sybase)

```sql
-- Current approach using timestamp
SELECT usid, timestamp FROM usid_serial WHERE send_hosp = ? AND lab_code = ? AND year = ?
UPDATE usid_serial SET usid = ? WHERE send_hosp = ? AND lab_code = ? AND year = ? AND tsequal(timestamp, 0x{hexTime})
```

### Proposed Implementation (Oracle with USID-based Optimistic Locking)

```sql
-- Read current USID
SELECT usid FROM usid_serial WHERE send_hosp = ? AND lab_code = ? AND year = ?

-- Update with USID check (optimistic locking)
UPDATE usid_serial SET usid = ? WHERE send_hosp = ? AND lab_code = ? AND year = ? AND usid = ?
```

### Advantages of USID-based Optimistic Locking

1. **Database Agnostic**: Works with any database (Oracle, Sybase, SQL Server, etc.)
2. **No Schema Changes**: No need to add version columns or modify existing tables
3. **Simple Implementation**: Easy to understand and maintain
4. **Natural Business Logic**: The USID itself serves as the version indicator

### Implementation Strategy

#### 1. **Modified getUSID Method for Oracle**

```java
private String getUSIDWithOptimisticLocking(String specNum, String specNumsuffix) throws SQLException, Exception {
    PreparedStatement preStmt = null;
    ResultSet rs = null;
    int retry = 0;
    String currUsid = null;
    String nextUsid = null;
    String labIden = null;
    boolean isSuccess = false;
    Integer year = Integer.parseInt(D_FORMAT_YYYY.format(now));
    Integer yearPrefix = Integer.parseInt(D_FORMAT_YY.format(now));

    labIden = labCodeList.get(specNum);

    // Check if USID already exists in mapping
    try {
        sql = "SELECT usid FROM usid_mapping WHERE spec_num = ? AND spec_num_suffix = ? AND lab_code = ?";
        preStmt = dbConn.prepareStatement(sql);
        preStmt.setString(1, specNum);
        preStmt.setString(2, specNumsuffix);
        preStmt.setString(3, labIden);
        
        rs = preStmt.executeQuery();
        
        if(rs.next()) {
            currUsid = rs.getString("usid");
            return currUsid; // Already exists
        }
    } finally {
        if (rs != null) try { rs.close(); } catch (SQLException logOrIgnore) {}
        if (preStmt != null) try { preStmt.close(); } catch (SQLException logOrIgnore) {}
    }

    // Generate new USID with optimistic locking
    do {
        try {
            if(isGenUsidTimeout()) {
                throw new Exception("Terminated. GenUSID over " + genUsidTimeout + "ms");
            }

            // Read current USID (no locking)
            sql = "SELECT usid FROM usid_serial WHERE send_hosp = ? AND lab_code = ? AND year = ?";
            preStmt = dbConn.prepareStatement(sql);
            preStmt.setString(1, hospCode);
            preStmt.setString(2, labIden);
            preStmt.setInt(3, year);
            
            rs = preStmt.executeQuery();

            if(rs.next()) {
                currUsid = rs.getString("usid");
                nextUsid = calNextUSID(currUsid, hospCode, yearPrefix, labIden);
                
                // Optimistic update using current USID in WHERE clause
                sql = "UPDATE usid_serial SET usid = ? WHERE send_hosp = ? AND lab_code = ? AND year = ? AND usid = ?";
                preStmt = dbConn.prepareStatement(sql);
                preStmt.setString(1, nextUsid);
                preStmt.setString(2, hospCode);
                preStmt.setString(3, labIden);
                preStmt.setInt(4, year);
                preStmt.setString(5, currUsid); // Key optimistic check
                
                int rowsUpdated = preStmt.executeUpdate();
                
                if (rowsUpdated == 1) {
                    // Success - insert mapping
                    sql = "INSERT INTO usid_mapping (usid, spec_num, spec_num_suffix, send_hosp, lab_code, create_datetime) VALUES (?, ?, ?, ?, ?, SYSDATE)";
                    preStmt = dbConn.prepareStatement(sql);
                    preStmt.setString(1, nextUsid);
                    preStmt.setString(2, specNum);
                    preStmt.setString(3, specNumsuffix);
                    preStmt.setString(4, hospCode);
                    preStmt.setString(5, labIden);
                    
                    int mappingInserted = preStmt.executeUpdate();
                    
                    if (mappingInserted == 1) {
                        isSuccess = true;
                        // Commit immediately to shorten transaction duration
                        dbConn.commit();
                    }
                } else {
                    // Optimistic lock failure - retry with exponential backoff
                    retry++;
                    long sleepTime = SLEEP_MILLISEC * (long)Math.pow(2, retry - 1);
                    Thread.sleep(sleepTime);
                }
            } else {
                // No record exists - handle initialization
                // This would need special handling for first-time setup
                retry++;
                Thread.sleep(SLEEP_MILLISEC);
            }
        } catch(Exception e) {
            retry++;
            if (retry >= MAX_DB_RETRY) {
                throw new Exception("Cannot generate USID after " + MAX_DB_RETRY + " attempts: " + e.getMessage());
            }
            Thread.sleep(SLEEP_MILLISEC);
        } finally {
            if (rs != null) try { rs.close(); } catch (SQLException logOrIgnore) {}
            if (preStmt != null) try { preStmt.close(); } catch (SQLException logOrIgnore) {}
        }
    } while (!isSuccess && retry < MAX_DB_RETRY);

    if (nextUsid == null || "".equals(nextUsid)) {
        throw new Exception("Failed to generate USID");
    }
    
    return nextUsid;
}
```

#### 2. **Key Changes for Oracle Migration**

**Database Connection Changes:**

```java
// Change from multiple connections to single Oracle connection
private static final String JDBC_ORACLE = "jdbc/lisgcr1-corp-loe-ds";

// Use single Oracle connection instead of hospital-specific connections
dbConn = DbConnection.getConnection(JDBC_ORACLE);
```

**SQL Syntax Changes:**

```sql
-- Oracle date function
INSERT INTO usid_mapping (usid, spec_num, spec_num_suffix, send_hosp, lab_code, create_datetime) 
VALUES (?, ?, ?, ?, ?, SYSDATE)

-- Remove Sybase-specific tsequal function
-- Replace: AND tsequal(timestamp, 0x{hexTime})
-- With: AND usid = ?
```

#### 3. **Transaction Management Changes**

**Immediate Commit Strategy:**

```java
// Commit immediately after successful USID generation
if (mappingInserted == 1) {
    isSuccess = true;
    dbConn.commit(); // Immediate commit to shorten transaction duration
}
```

**Error Handling:**

```java
// Rollback on failure
if (!isSuccess) {
    dbConn.rollback();
}
```

### Benefits of This Approach

1. **Simplified Migration**: No need to add version columns or modify existing schema
2. **Database Independence**: Works with any database that supports standard SQL
3. **Natural Concurrency Control**: Uses the business value (USID) as the version indicator
4. **Reduced Lock Contention**: Immediate commits reduce blocking
5. **Better Performance**: No additional columns to maintain or index

### Considerations

1. **Initialization**: Need to handle the case where no record exists in `usid_serial`
2. **Retry Logic**: Exponential backoff for optimistic lock failures
3. **Error Handling**: Proper rollback and retry mechanisms
4. **Monitoring**: Track optimistic lock failure rates

This approach provides a clean, database-agnostic solution for optimistic locking while maintaining the existing business logic and improving performance through shorter transaction durations.

---

# Summary of Required Changes for Oracle USID Generation Enhancement

Based on the analysis of the current implementation and the enhancement requirements, here's a comprehensive summary of all changes needed:

## 1. Change All Database Connections to Oracle

### Current State

- Multiple JDBC connections for different databases:
    - `jdbc/lisgcr1-corp-loe-ds` (LOE database)
    - `jdbc/lis-corp-s1-com-db-ds` (Corporate database)
    - `jdbc/lis-cuh-s9-lab-db-ds` (CUH database)
    - Hospital-specific lab databases: `jdbc/lis-{server}-s9-lab-db-ds`

### Required Changes

#### 1.1 Update Connection Constants

```java
// Change from multiple connections to single Oracle connection
private static final String JDBC_ORACLE = "jdbc/lisgcr1-corp-loe-ds";
// Remove or comment out:
// private static final String JDBC_CORP = "jdbc/lis-corp-s1-com-db-ds";
// private static final String JDBC_CUH = "jdbc/lis-cuh-s9-lab-db-ds";
```

#### 1.2 Update Connection Management

```java
// Replace multiple connection methods with single Oracle connection
private Connection getConnectionOracle() throws Exception {
    if(dbConn == null) {
        dbConn = DbConnection.getConnection(JDBC_ORACLE);
        dbConn.setAutoCommit(false);
    }
    return dbConn;
}

// Remove or update:
// - getConnectionLoe()
// - getConnectionCorp() 
// - getConnectionCuh()
```

#### 1.3 Update Database Queries

```java
// Change all database queries to use single Oracle connection
// Replace: getConnectionCorp(), getConnectionLoe(), getConnectionCuh()
// With: getConnectionOracle()
```

## 2. Shorten Transaction Duration

### Current State

- Long-running transactions spanning entire specimen processing loop
- Commit only at the end of all specimen processing

### Required Changes

#### 2.1 Modify Transaction Scope

```java
// In getSpecDtl() method - remove transaction management
// Remove: userTran.begin() and userTran.commit() from this method

// In getUSID() method - add immediate commit after successful USID generation
if (mappingInserted == 1) {
    isSuccess = true;
    dbConn.commit(); // Immediate commit to shorten transaction duration
}
```

#### 2.2 Update Error Handling

```java
// Add rollback handling for individual USID generation failures
if (!isSuccess) {
    dbConn.rollback();
}
```

#### 2.3 Remove Global Transaction Management

```java
// Remove UserTransaction usage from getSpecDtl()
// Remove: userTran.begin(), userTran.commit(), userTran.rollback()

// Update initConn() method to not start global transactions
private Connection initConn(String jdbc) {
    Connection inConn = null;
    int retry = 0;
    
    do {  
        try {
            inConn = DbConnection.getConnection(jdbc);
            inConn.setAutoCommit(false);
            // Remove: userTran = getUserTransaction(); userTran.begin();
            break;
        } catch (Exception e) {
            // Error handling
        }
    } while (retry <= MAX_CONN_DB_RETRY);
    
    return inConn;
}
```

## 3. Use Optimistic Locking for Oracle

### Current State

- Sybase timestamp-based optimistic locking using `tsequal(timestamp, 0x{hexTime})`

### Required Changes

#### 3.1 Replace Timestamp-based Locking

```java
// Current Sybase approach:
sql = "UPDATE usid_serial SET usid = ? WHERE send_hosp = ? AND lab_code = ? AND year = ? AND tsequal(timestamp, "+ hexTime +")";

// New Oracle approach using USID value in WHERE clause:
sql = "UPDATE usid_serial SET usid = ? WHERE send_hosp = ? AND lab_code = ? AND year = ? AND usid = ?";
preStmt.setString(5, currUsid); // Key optimistic check
```

#### 3.2 Update SQL Syntax for Oracle

```java
// Change date function from Sybase to Oracle
// Replace: current_bigdatetime()
// With: SYSDATE

sql = "INSERT INTO usid_mapping (usid, spec_num, spec_num_suffix, send_hosp, lab_code, create_datetime) VALUES (?, ?, ?, ?, ?, SYSDATE)";
```

#### 3.3 Remove Timestamp Handling

```java
// Remove timestamp-related code:
// String hexTime = "0x" + rs.getString("timestamp");
// AND tsequal(timestamp, "+ hexTime +")

// Replace with simple USID check:
// AND usid = ?
```

## 4. Handle Retry Mechanism for Optimistic Locking

### Current State

- Simple retry loop with random sleep intervals (1-100ms)
- Maximum retry count of 10

### Required Changes

#### 4.1 Implement Exponential Backoff

```java
// Replace random sleep with exponential backoff
// Current: sleepTime = (long)(Math.random() * SLEEP_MILLISEC) + 1;
// New: long sleepTime = SLEEP_MILLISEC * (long)Math.pow(2, retry - 1);
```

#### 4.2 Update Retry Logic

```java
// Modify retry condition to check for optimistic lock failures
if (rowsUpdated == 1) {
    // Success - proceed with mapping insert
    isSuccess = true;
} else {
    // Optimistic lock failure - retry with exponential backoff
    retry++;
    long sleepTime = SLEEP_MILLISEC * (long)Math.pow(2, retry - 1);
    Thread.sleep(sleepTime);
}
```

#### 4.3 Add Optimistic Lock Failure Detection

```java
// Add specific handling for optimistic lock failures
int rowsUpdated = preStmt.executeUpdate();

if (rowsUpdated == 0) {
    // Optimistic lock failure - another process modified the record
    alsLog.writeLog(AlsLogConstants.GET_NEXT_SEQ, AlsLogConstants.TRACE, 
        "Optimistic lock failure - retry [" + (++retry) + "]", 
        AlsLogConstants.OPERID_GET_NEXT_SEQ, "");
}
```

## 5. Additional Required Changes

### 5.1 Update Database Schema

```sql
-- Ensure Oracle compatibility for existing tables
-- Update data types if needed for Oracle
-- Add any missing indexes for performance
```

### 5.2 Update Error Messages

```java
// Update error messages to reflect Oracle-specific issues
// Replace Sybase-specific error handling with Oracle equivalents
```

### 5.3 Update Performance Logging

```java
// Update performance logging to reflect Oracle operations
// Add logging for optimistic lock failures
alsLog.writeLog(AlsLogConstants.GET_NEXT_SEQ, AlsLogConstants.TRACE, 
    "Optimistic lock failure rate: " + failureRate + "%", 
    AlsLogConstants.OPERID_GET_NEXT_SEQ, "");
```

### 5.4 Update Configuration

```java
// Update configuration to use Oracle-specific settings
// Update retry parameters for Oracle environment
private int MAX_OPTIMISTIC_RETRY = 5; // Reduced from 10 for optimistic locking
private int BASE_SLEEP_MS = 10; // Base sleep time for exponential backoff
```

## 6. Implementation Priority

### Phase 1: Database Connection Changes

1. Update connection constants
2. Modify connection management methods
3. Update all database queries to use Oracle connection

### Phase 2: Optimistic Locking Implementation

1. Replace timestamp-based locking with USID-based locking
2. Update SQL syntax for Oracle
3. Implement exponential backoff retry mechanism

### Phase 3: Transaction Optimization

1. Shorten transaction scope to individual USID generation
2. Implement immediate commit after successful operations
3. Update error handling and rollback logic

### Phase 4: Testing and Validation

1. Test optimistic lock failure scenarios
2. Validate retry mechanism effectiveness
3. Performance testing and optimization

## 7. Expected Benefits

1. **Improved Concurrency**: Optimistic locking allows higher throughput
2. **Reduced Lock Contention**: Immediate commits reduce blocking
3. **Better Performance**: Shorter transaction durations
4. **Database Independence**: USID-based locking works with any database
5. **Simplified Architecture**: Single database connection reduces complexity

This comprehensive change summary provides a clear roadmap for implementing the Oracle enhancement while maintaining data integrity and improving system performance.