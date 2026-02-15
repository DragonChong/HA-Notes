# Export/Import SQL and Connection Configurations

## Overview

Add Export and Import functionality to save and load all query sets (SQLs and connection configs) and variables as JSON files. This allows users to backup, share, and restore their SQL diff configurations.

## Implementation Details

### 1. Store Actions (`src/store/store.ts`)

Add two new actions to the `AppState` interface and implement them:

- `exportToJson(): string` - Serializes all querySets and variables to JSON (excluding results, loading states, errors)
- `importFromJson(jsonString: string): void` - Validates and loads querySets and variables from JSON, replacing all existing data

The export should include:

- All querySets with: `id`, `name`, `sourceA.config`, `sourceA.sqlQuery`, `sourceB.config`, `sourceB.sqlQuery`, `keyColumns`, `ignoreColumns`
- All variables: `id`, `name`, `value`, `dataType`
- Metadata: export timestamp, version identifier

The import should:

- Validate JSON structure
- Ensure at least one querySet exists
- Generate new IDs for imported querySets to avoid conflicts
- Set the first imported querySet as active
- Show success/error messages

### 2. UI Components (`src/components/Header.tsx`)

Add Export and Import buttons to the header's right section:

- **Export Button**: Downloads a JSON file with all current querySets and variables
- **Import Button**: Opens a file input dialog to select and import a JSON file

Use Ant Design icons: `ExportOutlined` and `ImportOutlined` from `@ant-design/icons`

### 3. File Handling Utilities

Create helper functions for:

- **Export**: Trigger browser download with proper filename (e.g., `db-diff-export-YYYY-MM-DD.json`)
- **Import**: Read file content, validate JSON, call store's `importFromJson` method
- **Validation**: Check that imported JSON has required structure (querySets array, variables array)

### 4. Error Handling

- Show Ant Design `message` notifications for success/error states
- Validate JSON structure before importing
- Handle file read errors gracefully
- Ensure at least one querySet remains after import (fallback to default if import fails)

## Files to Modify

1. **[src/store/store.ts](vscode-file://vscode-app/Applications/Cursor.app/Contents/Resources/app/out/vs/code/electron-sandbox/workbench/src/store/store.ts)**: Add `exportToJson` and `importFromJson` actions
2. **[src/components/Header.tsx](vscode-file://vscode-app/Applications/Cursor.app/Contents/Resources/app/out/vs/code/electron-sandbox/workbench/src/components/Header.tsx)**: Add Export and Import buttons with file handling logic
3. **[src/types/types.ts](vscode-file://vscode-app/Applications/Cursor.app/Contents/Resources/app/out/vs/code/electron-sandbox/workbench/src/types/types.ts)**: Optionally add export/import data structure types for type safety

## Data Structure

The exported JSON will have this structure:

```bash
{
  "version": "1.0",
  "exportedAt": "2024-01-01T00:00:00.000Z",
  "querySets": [
    {
      "id": "qs_...",
      "name": "Query Set 1",
      "sourceA": {
        "config": { "environment": "DEV", "databaseType": "PG", ... },
        "sqlQuery": "SELECT * FROM ..."
      },
      "sourceB": { ... },
      "keyColumns": [],
      "ignoreColumns": []
    }
  ],
  "variables": [
    { "id": "var_...", "name": "var1", "value": "test", "dataType": "string" }
  ]
}
```

## User Flow

1. **Export**: User clicks Export → JSON file downloads automatically
2. **Import**: User clicks Import → File picker opens → U