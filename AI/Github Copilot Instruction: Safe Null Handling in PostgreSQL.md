# Github Copilot Instruction: Safe Null Handling in PostgreSQL

---

## Goal

Refactor SQL and JPQL queries in Entity and DAO classes to safely handle `NULL` parameters passed to nullable columns. This prevents PostgreSQL errors (e.g., "could not determine data type") and ensures logical correctness (`NULL` matches `NULL`).

## Trigger

These steps are triggered when the user provides a specific **Table Name** or **Entity Class Name**.

## Execution Steps

### 1. Context & File Discovery

- Locate the **Entity Class** (e.g., `TestDict.java`) matching the user's input.
- Locate the corresponding **DAO Implementation Class** (e.g., `TestDictDaoJpaImpl.java`).
- **Scope of Search:**
- **In Entity:** Look for `@NamedNativeQuery` annotations. Specifically, target queries where the name starts with `"PG."` (e.g., `PG.BbInvTransaction.searchBloodHistoryReceive`).
- **In DAO:** Look for inline JPQL strings defined in methods (e.g., `String jpql = "SELECT ..."`).

### 2. Schema Analysis (Crucial)

- For every query found, identify the columns involved in `WHERE` clauses that are bound to input parameters.
- **Action:** Use the **MCP "postgres"** tool to query the database schema.
- Check if the target column is **nullable** (`is_nullable = 'YES'`).
- **Important:** If the query joins multiple tables, analyze columns from ALL tables involved in WHERE clause parameter comparisons, not just the primary entity table.
- *Fallback:* If the MCP tool is unavailable, check the Entity's `@Column` annotation for `nullable = true` (default is true) or `optional = true`.

**Multi-Table Query Analysis:**

- When a query joins multiple tables (e.g., `FROM TestDict td, QcRange qr WHERE ... AND qr.column = :param`), you must:
1. Identify all tables referenced in WHERE clause parameter comparisons
2. Query the schema for EACH table's columns used with parameters
3. Document which table each nullable column belongs to in your analysis
4. Apply refactoring logic to nullable columns regardless of which table they belong to

### 3. Query Refactoring Logic

For every **nullable column** identified in Step 2 that is compared against a parameter, apply the following transformation:

**The Logic:**

> "If the parameter is `NULL`, match rows where the column is `NULL`. If the parameter is `NOT NULL`, match rows where the column equals the parameter."

**Transformation Rule:**

Change simple equality checks:

```sql
-- Before
WHERE column_name = :paramName
```

To the explicit null-safe check:

```sql
-- After
WHERE ( (:paramName IS NULL AND column_name IS NULL) OR column_name = :paramName )
```

### 4. Implementation Details

- **Iterate:** Loop through every identified Native Query and JPQL string.
- **Preserve:** Do not modify parts of the query unrelated to the nullable parameter.
- **Verify:** Ensure parameter names (e.g., `:snomed`) remain consistent.

---

## Example Scenario

**User Input:** "Fix null handling for `ApKeyword`"

**Copilot Action:**

1. Finds `ApKeyword.java` and `ApKeywordDaoJpaImpl.java`.
2. Identifies query: `SELECT o FROM ApKeyword o WHERE o.keySnomed = :snomed`.
3. Checks schema: `keySnomed` is nullable.
4. Refactors code:

```java
// Modified JPQL
String jpql = "SELECT o FROM ApKeyword o WHERE " +
 "((:snomed IS NULL AND o.keySnomed IS NULL) OR o.keySnomed = :snomed)";
```

---

## Output Format

After completing the analysis and refactoring, provide a summary table with the following columns:

| **Query Name/Location** | **Type**                      | **Nullable Columns in WHERE** | **Refactor** | **Remarks**                           |
| ----------------------- | ----------------------------- | ----------------------------- | ------------ | ------------------------------------- |
| Query identifier        | Named Query / Inline JPQL/SQL | Yes/No (column names)         | Yes/No       | Analysis notes and refactoring status |

**Table Column Definitions:**

- **Query Name/Location**: Named query name or method name with line numbers
- **Type**: "Named Query" or "Inline JPQL/SQL"
- **Nullable Columns in WHERE**: "Yes (table.column_name)" if nullable columns are used in WHERE with parameters, "No" otherwise, "N/A" if no WHERE clause. For multi-table queries, specify the table name with the column.
- **Refactor**: "Y" if refactoring was performed, "N" if not needed
- **Remarks**: Analysis details including:
- Column nullability from schema (specify table name for joined tables)
- Parameter types (primitive vs wrapper)
- For multi-table queries: indicate which tables were analyzed
- Reason for refactoring or no action needed
- Any potential future considerations

**Summary Statistics to Include:**

- Total Queries Analyzed
- Named Queries count
- Inline JPQL/SQL count
- Queries with Nullable Columns in WHERE
- Queries Requiring Refactoring
- Queries Refactored