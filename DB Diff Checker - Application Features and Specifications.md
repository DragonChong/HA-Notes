# DB Diff Checker - Application Features and Specifications

## 📋 Application Overview

**DB Diff Checker** is a sophisticated web-based SQL execution and data reconciliation tool built with ReactJS and Spring Boot. It allows users to execute SQL queries against multiple database types (PostgreSQL, Sybase, Oracle) and compare result sets to identify differences.

**Purpose**: Database comparison and validation tool for healthcare laboratory systems
**Tech Stack**: React 19, TypeScript, Ant Design, AG Grid, Zustand, Spring Boot
**Primary Use Case**: Comparing data across different database environments and servers for data migration, testing, and reconciliation

---

## 🎯 Core Features

### 1. Multi-Database Support
- **PostgreSQL** (PG)
- **Sybase** (SYB)
- **Oracle** (ORACLE)
- Dynamic connection management without storing credentials in frontend
- Connection parameters: Environment, Database Type, Database/Schema, Server, Lab Number

### 2. Dual-Source SQL Execution
- **Side-by-side query workspace** with two independent sources (Source A and Source B)
- Execute identical or different queries on different database configurations
- Real-time SQL syntax highlighting using Monaco Editor (VS Code engine)
- Independent execution and result viewing for each source

### 3. Advanced Result Comparison (Diff Engine)
**Two Comparison Modes:**

#### Key-Based Comparison
- Compares rows based on user-defined key columns (composite keys supported)
- Identifies matching rows across datasets
- Suitable for comparing tables with stable primary keys

#### Positional Comparison
- Compares rows by their position in result sets
- Useful for comparing records with different keys (e.g., different patient IDs)
- Row-by-row comparison regardless of key values

**Diff Status Categories:**
- **MATCH** - Identical rows (can be hidden)
- **ADDED** - Rows only in Source B (green highlight)
- **REMOVED** - Rows only in Source A (red highlight)
- **MODIFIED** - Rows in both but with different values (yellow highlight)
- Cell-level change detection for modified rows

### 4. SQL Variable Substitution
- Define reusable variables with names and values
- Two data types: String and Integer
- Syntax: `{{variableName}}` in SQL queries
- Automatic value substitution before execution
- String variables automatically quoted, integers used as-is

### 5. Multi-Query Set Management
- Create and manage multiple query sets simultaneously
- Each query set contains:
  - Two source configurations (A and B)
  - SQL queries for both sources
  - Comparison settings (key columns, ignore columns, diff mode)
  - Independent results and diff results
- Duplicate query sets for variations
- Rename and organize query sets

### 6. Advanced Grid Features (AG Grid)
- High-performance rendering for large datasets
- Column sorting and filtering
- Column pinning
- Virtualization for efficient memory usage
- Export capabilities
- Responsive resizing

### 7. Result Filtering
- **Show Only Differences** toggle
- Hides all MATCH rows to focus on discrepancies
- Real-time filtering without re-executing queries

### 8. Column Management
- **Key Columns**: Define columns used for row matching
- **Ignore Columns**: Exclude columns from comparison (e.g., timestamps, auto-generated IDs)
- Multiple column selection support

### 9. Export/Import Configuration
**Three Export Types:**
- **Setup Only** - Query configurations and settings (no results)
- **Results Only** - Execution results for later review
- **Both** - Complete snapshot including setup and results

**Features:**
- JSON-based export format
- Preserves all query sets, variables, and configurations
- Supports sharing and version control
- Import validation with error reporting

### 10. State Persistence
- Automatic local storage persistence
- Preserves query configurations between sessions
- Excludes large result data to optimize storage
- Dark mode and developer mode preferences saved

### 11. Developer Mode
- Additional debugging information
- API request/response inspection
- Performance metrics
- Error stack traces

### 12. Dark Mode Support
- Full theme switching
- Ant Design dark algorithm integration
- Persisted preference

---

## 🏗️ Technical Architecture

### Frontend Architecture

```
┌─────────────────────────────────────────────────┐
│                   App.tsx                        │
│              (Main Layout)                       │
└──────────────┬──────────────────────────────────┘
               │
    ┌──────────┴──────────┬───────────────┬────────────┐
    │                     │               │            │
┌───▼────┐    ┌──────────▼────────┐  ┌──▼─────┐  ┌──▼────────┐
│Sidebar │    │QuerySetManager    │  │Variable│  │Result     │
│        │    │                   │  │Panel   │  │Viewer     │
└────────┘    └──────────┬────────┘  └────────┘  └─────┬─────┘
                         │                              │
              ┌──────────▼────────────┐        ┌────────▼──────┐
              │  QueryWorkspace       │        │  DiffGrid     │
              │  ┌────────┬─────────┐ │        │  ResultGrid   │
              │  │Source A│Source B │ │        └───────────────┘
              │  │Panel   │Panel    │ │
              │  └────────┴─────────┘ │
              └───────────────────────┘
```

### Component Hierarchy

```typescript
App
├── Sidebar
│   └── Navigation & Theme Toggle
├── QuerySetManager
│   └── Tab Management for Query Sets
├── VariablePanel
│   └── Variable Definition & Management
├── QueryWorkspace
│   ├── SourcePanel (A)
│   │   ├── ConfigForm
│   │   │   └── Environment, DB Type, Database, Server, Lab
│   │   └── SqlEditor (Monaco Editor)
│   ├── SourcePanel (B)
│   │   ├── ConfigForm
│   │   └── SqlEditor
│   └── Action Buttons (Execute, Compare, Copy)
└── ResultViewer
    ├── Tabs (Diff, Source A, Source B)
    ├── DiffGrid (Comparison View)
    └── ResultGrid (Raw Results)
```

### State Management (Zustand)

**Core State Structure:**
```typescript
interface AppState {
  querySets: QuerySet[]           // Multiple query sets
  activeQuerySetId: string         // Currently selected set
  variables: Variable[]            // Global variables
  isDarkMode: boolean             // Theme preference
  isDeveloperMode: boolean        // Debug mode
}

interface QuerySet {
  id: string
  name: string
  sourceA: SourceState
  sourceB: SourceState
  keyColumns: string[]
  ignoreColumns: string[]
  diffMode: 'key' | 'positional'
  diffResult: DiffResult | null
  showOnlyDifferences: boolean
  activeResultTab: string
}

interface SourceState {
  config: ConnectionParams
  sqlQuery: string
  resultData: Record<string, unknown>[] | null
  headers: string[] | null
  loading: boolean
  error: string | null
  executedAt: string | null
}
```

### Data Flow

```
User Input → ConfigForm/SqlEditor
     ↓
Update Zustand Store
     ↓
Execute Button Clicked
     ↓
QueryWorkspace.handleExecute()
     ↓
Variable Substitution (variableUtils.ts)
     ↓
API Call (api.ts)
     ↓
POST /api/dbdiff/execute-sql
     ↓
Backend Processing
     ↓
Response with Rows
     ↓
Update Store (setSourceResult)
     ↓
ResultViewer Renders Grid
     ↓
Compare Button Clicked
     ↓
diffUtils.compareResults()
     ↓
Generate DiffResult
     ↓
Display in DiffGrid with Color Coding
```

---

## 🔌 Backend API Integration

### API Endpoints

#### 1. Execute SQL
```
POST /api/dbdiff/execute-sql
Content-Type: application/json
```

**Request:**
```json
{
  "databaseType": "PG",
  "server": "TKO",
  "lab": 1,
  "database": "LAB",
  "sql": "SELECT * FROM patient LIMIT 10",
  "queryType": "SELECT"
}
```

**Response:**
```json
{
  "data": {
    "databaseType": "PG",
    "server": "TKO",
    "lab": 1,
    "database": "LAB",
    "sql": "SELECT * FROM patient LIMIT 10",
    "queryType": "SELECT",
    "rows": [
      { "id": 1, "name": "Patient A", "status": "Active" },
      { "id": 2, "name": "Patient B", "status": "Pending" }
    ],
    "success": true,
    "executionTimeMs": 125
  }
}
```

#### 2. Health Check
```
GET /api/dbdiff/health
```

**Response:**
```json
{
  "data": "OK"
}
```

### Database Name Mapping

Frontend selections are mapped to actual database names:

| UI Selection | Actual Database |
|--------------|----------------|
| LAB          | LAB_DB         |
| ADA          | ADA_DB         |
| INF          | INT_DB         |
| COM          | COM_DB         |

### Connection Parameters

The application uses a secure connection model where credentials are NOT passed from frontend:

**Frontend Parameters:**
- Environment: DEV, SIT, LPT, DEVQA (UI only, not sent to backend)
- Database Type: PG, SYB, ORACLE
- Database: LAB, ADA, INF, COM
- Server: AHN, BTH, BTS, CLS, CMC, CUH, DHC, DHL, DHX, GHX, H1A, HCH, KWH, NBS, NDH, NLT, OLM, PMH, PWH, PYN, QEH, QMH, RHT, TIS, TKO, TMH, TRL, UCH, YCH, CORP
- Lab: 1-9

**Backend Handling:**
- Backend reads actual connection details from OpenShift ConfigMaps/Secrets
- Dynamic data source creation based on parameters
- JdbcTemplate-based execution

---

## 💡 Key Algorithms

### 1. Diff Algorithm (Key-Based)

```typescript
compareResults(dataA, dataB, keyColumns, ignoreColumns)
  ↓
Create Maps with key → row mapping
  ↓
For each unique key:
  - If in both: 
    → Hash comparison
    → If different: MODIFIED + identify changed fields
    → If same: MATCH
  - If only in A: REMOVED
  - If only in B: ADDED
  ↓
Sort by status (REMOVED, MODIFIED, ADDED, MATCH)
  ↓
Return DiffResult with summary
```

### 2. Positional Diff Algorithm

```typescript
compareResultsPositional(dataA, dataB, ignoreColumns)
  ↓
Loop through max(dataA.length, dataB.length)
  ↓
For each position i:
  - If both exist:
    → Hash comparison
    → Mark as MATCH or MODIFIED with _rowIndex
  - If only A[i]: REMOVED
  - If only B[i]: ADDED
  ↓
Return DiffResult with position tracking
```

### 3. Variable Substitution

```typescript
substituteVariables(sql, variables)
  ↓
Find all {{variableName}} patterns
  ↓
For each match:
  - Lookup variable by name
  - If string type: wrap in 'quotes'
  - If integer type: use raw value
  - If not found: keep original placeholder
  ↓
Return processed SQL
```

---

## 🎨 User Interface Design

### Layout Structure

**Split-Pane Dashboard:**
```
┌─────────────────────────────────────────────────────────┐
│  [Sidebar]  │  DB Diff Checker                         │
│             │  [Query Set Tabs] [+ Add] [Export] [Vars]│
├─────────────┼──────────────────────────────────────────┤
│             │  ┌──────────────┬──────────────┐         │
│  • Query    │  │  Source A    │  Source B    │         │
│    Sets     │  │ [Config Form]│ [Config Form]│         │
│             │  │              │              │         │
│  • Vars     │  │ [SQL Editor] │ [SQL Editor] │         │
│             │  │              │              │         │
│  • Theme    │  └──────────────┴──────────────┘         │
│             │  [Execute A] [Execute B] [Compare]       │
│             │  [Copy A→B]  [Copy B→A]                  │
│             ├──────────────────────────────────────────┤
│             │  [Diff] [Source A] [Source B]            │
│             │  ✓ Show Only Differences                 │
│             │  Diff Mode: ⦿ Key-based ○ Positional     │
│             │  Key Columns: [Select...]                │
│             │  ┌────────────────────────────────────┐ │
│             │  │  [AG Grid - Results/Diff Display] │ │
│             │  │                                    │ │
│             │  └────────────────────────────────────┘ │
└─────────────┴──────────────────────────────────────────┘
```

### Color Scheme (Diff View)

- **REMOVED**: Light Red (#ffccc7) - Rows only in Source A
- **MODIFIED**: Light Yellow (#fff1b8) - Rows in both with differences
- **ADDED**: Light Green (#d9f7be) - Rows only in Source B
- **MATCH**: White/Default - Identical rows

### Visual Indicators

- **Execution Status**: ✓ with row count and timestamp
- **Loading State**: Spinning indicator during query execution
- **Error State**: Red error message with details
- **Cell Changes**: Bold/highlighted cells in modified rows

---

## 📦 Technology Stack Details

### Frontend Dependencies

```json
{
  "dependencies": {
    "@ant-design/icons": "^6.1.0",          // Icon library
    "@monaco-editor/react": "^4.7.0",       // SQL editor
    "ag-grid-community": "^35.0.1",         // Data grid
    "ag-grid-react": "^35.0.1",            // React wrapper
    "allotment": "^1.20.5",                // Split panes
    "antd": "^6.2.2",                      // UI components
    "react": "^19.2.0",                    // Framework
    "react-dom": "^19.2.0",                // DOM renderer
    "zustand": "^5.0.10"                   // State management
  }
}
```

### Build Tools

- **Vite**: Fast build tool and dev server
- **TypeScript**: Static typing and code quality
- **ESLint**: Code linting and standards enforcement

### Backend Technologies

- **Spring Boot**: REST API framework
- **JDBC/JdbcTemplate**: Database connectivity
- **Dynamic DataSource Library**: Multi-database connection management
- **OpenShift ConfigMaps/Secrets**: Credential management

---

## 🔐 Security Features

### Frontend Security
- No credential storage in client-side code
- No direct database connection strings
- Connection parameters only (abstract identifiers)
- Environment variable for API base URL

### Backend Security
- Read-only database permissions recommended
- SQL validation and parsing (JSqlParser)
- SELECT query enforcement
- Statement terminator prevention (no `;` chaining)
- Credential management via OpenShift secrets
- Row limit enforcement to prevent memory issues

### Data Protection
- Results not persisted in localStorage (only configs)
- Session-based result storage
- Export data controlled by user

---

## ⚡ Performance Optimizations

### Frontend Optimizations
1. **AG Grid Virtualization**: Only renders visible rows
2. **Zustand Selective Updates**: Component re-render only on relevant state changes
3. **Partial State Persistence**: Excludes large result data from localStorage
4. **Lazy Loading**: Monaco Editor loaded on demand
5. **Memoization**: React component memoization for expensive renders

### Backend Optimizations
1. **Row Limit**: Hard-coded maximum rows (e.g., 1000) to prevent memory overflow
2. **Stateless Execution**: No session state stored on server
3. **Connection Pooling**: Reuse of database connections
4. **ResultSet Streaming**: Efficient data reading

### Comparison Optimizations
1. **Hash-Based Comparison**: O(n) time complexity using Map lookups
2. **Selective Field Comparison**: Ignore columns excluded from comparison
3. **Client-Side Diffing**: For small datasets (<5000 rows)
4. **Lazy Diff Calculation**: Only when "Compare" button clicked

---

## 📊 Use Cases

### 1. Database Migration Validation
**Scenario**: Validating data after migration from Sybase to PostgreSQL
- Configure Source A: Sybase (source system)
- Configure Source B: PostgreSQL (target system)
- Execute identical queries on both
- Compare results to verify data integrity
- Identify missing or modified records

### 2. Multi-Environment Testing
**Scenario**: Comparing DEV vs SIT environments
- Set Environment: DEV vs SIT
- Execute same query on both environments
- Verify configuration changes haven't affected data
- Track differences between environments

### 3. Lab Data Reconciliation
**Scenario**: Comparing data across different hospital labs
- Source A: TKO Hospital Lab 1
- Source B: PMH Hospital Lab 2
- Compare patient test results
- Identify discrepancies for investigation

### 4. Schema Comparison
**Scenario**: Comparing LAB vs ADA databases
- Query table structures or data
- Compare schemas for consistency
- Identify structural differences

### 5. Query Optimization Testing
**Scenario**: Testing query performance and result consistency
- Source A: Original query
- Source B: Optimized query
- Verify both return identical results
- Track execution time differences

---

## 🚀 Future Enhancement Possibilities

### Potential Features
1. **Server-Side Comparison**: For large datasets (>5000 rows)
2. **Scheduled Comparisons**: Automated periodic checks
3. **Email Notifications**: Alert on differences found
4. **Query History**: Track previously executed queries
5. **Comparison Reports**: PDF/Excel export of diff results
6. **Advanced Filters**: Custom filtering in result grids
7. **Column Mapping**: Map different column names between sources
8. **Visual Diff Highlight**: Side-by-side cell comparison
9. **Batch Execution**: Run multiple query sets sequentially
10. **Webhooks**: Trigger external systems on diff detection
11. **Audit Logging**: Track all query executions
12. **User Authentication**: Multi-user support with permissions

### Technical Improvements
1. **WebSocket Support**: Real-time query status updates
2. **Caching Layer**: Redis-based result caching
3. **GraphQL API**: More flexible data fetching
4. **Progressive Web App**: Offline support
5. **Mobile Responsiveness**: Tablet/phone optimization

---

## 📈 Application Metrics

### Supported Scale
- **Maximum Query Sets**: Unlimited (limited by browser memory)
- **Maximum Variables**: Unlimited
- **Maximum Result Rows**: 1000 (backend enforced)
- **Comparison Performance**: <1 second for 5000 rows (client-side)
- **Database Types**: 3 (PostgreSQL, Sybase, Oracle)
- **Supported Servers**: 30+ hospital servers
- **Supported Labs**: 9 lab numbers per server

### Browser Support
- Chrome/Edge (recommended): Full support
- Firefox: Full support
- Safari: Full support (Monaco Editor may have minor issues)

---

## 🛠️ Development Workflow

### Setup
```bash
# Frontend setup
npm install
npm run dev

# Backend setup
cd backend
./mvnw spring-boot:run
```

### Testing
```bash
# Frontend linting
npm run lint

# Frontend build
npm run build

# Preview production build
npm run preview
```

### API Testing
```typescript
// Use built-in test utilities
import { runAllTests } from './utils/apiTests';
runAllTests();
```

---

## 📝 Configuration

### Environment Variables

```env
# .env.development
VITE_API_BASE_URL=http://localhost:5000

# .env.production
VITE_API_BASE_URL=https://api.production.com
```

### API Configuration
File: `src/utils/api.ts`
```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
```

### Default Settings
- **Default Environment**: DEV
- **Default Database Type**: PG
- **Default Database**: LAB
- **Default Server**: AHN
- **Default Lab**: 1
- **Default Diff Mode**: Key-based
- **Default Theme**: Light mode

---

## 🎓 Technical Highlights

### Why These Technologies?

**Ant Design**
- Enterprise-grade UI components
- Dense, data-centric forms perfect for configuration
- Consistent design language
- Excellent TypeScript support

**AG Grid**
- Industry-leading data grid
- Handles large datasets efficiently
- Virtual scrolling and lazy loading
- Rich feature set (sorting, filtering, pinning)

**Monaco Editor**
- VS Code editing experience
- SQL syntax highlighting
- IntelliSense and auto-completion
- Familiar keyboard shortcuts

**Zustand**
- Lighter than Redux
- Simpler API
- Better TypeScript integration
- No boilerplate required
- Built-in persistence middleware

**Vite**
- Extremely fast HMR (Hot Module Replacement)
- Optimized production builds
- Native ES modules support
- Better developer experience

---

## 🏁 Conclusion

DB Diff Checker is a production-ready, enterprise-grade database comparison tool designed specifically for healthcare laboratory systems. It combines powerful SQL execution capabilities with intelligent data comparison algorithms to provide developers and QA teams with a reliable tool for database validation, migration testing, and data reconciliation.

The application demonstrates modern web development best practices:
- Clean architecture with separation of concerns
- Type-safe TypeScript implementation
- Performant state management
- Secure API integration
- Professional UI/UX design
- Comprehensive error handling
- Extensible and maintainable codebase

---

**Document Version**: 1.0
**Last Updated**: February 15, 2026
**Application Version**: 0.0.0 (Development)
