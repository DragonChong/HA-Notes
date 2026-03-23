---
tags:
  - lis-hub-lib
  - component
---
# Data Table

## Overview

The Data Table (`LisDataTable`) is a shared table component that wraps the CMS design system `DataTable` with LIS-specific defaults. It handles two display states automatically: when data is present it renders a fully interactive, sortable table; when the data set is empty it displays a "No Records" illustration centred in the available space. It is the standard data table for all list and search result screens in the LIS plugin apps.

---

## Visual Layout

The component fills 100% of the height of its container. Two mutually exclusive views are rendered depending on the row count:

- **Data present:** A scrollable table with a sticky header, 36 px row height, and compact 4 px left cell padding.
- **No data:** A centred "No Records" illustration (256 px wide) displayed in the full container area.

The sticky header is rendered above all other content via an elevated z-index so it remains visible during vertical scrolling.

---

## Column Definitions

Columns are passed in via the `columns` prop using the same shape as the CMS `DataTable`. Each column object supports the following fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `field` | `string` | Yes | The key on each row object whose value is displayed in this column |
| `header` | `string` | Yes | The column header label shown to the user |
| `customSort` | `(a, b) => number` | No | Custom sort comparator; if omitted, a default locale-aware string sort is applied automatically |
| *(other DataTable column props)* | — | No | All other CMS `DataTable` column options are forwarded as-is |

### Default Sort Behaviour

If a column definition does not include a `customSort` function, the component automatically injects one. The default sort converts both values to strings (treating `null`/`undefined` as empty string) and compares them using the browser's locale-aware `localeCompare`. This means all columns are always sortable without any column-level configuration.

---

## Props Reference

`LisDataTable` accepts all props from the CMS `DataTable` component. The most commonly used are listed below.

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `columns` | `ColumnDef[]` | Yes | Column definitions (see Column Definitions above) |
| `rows` | `any[]` | Yes | The data rows to display; an empty array triggers the No Records view |
| `height` | `string \| number` | No | Height of the table container (e.g. `"100%"`, `500`) |
| `showNumOfRecords` | `boolean` | No | When `true`, displays a record count indicator below or above the table |
| `onRowClick` | `(rowIndex: number) => void` | No | Callback fired when the user clicks a row; receives the row's index |
| `onRowDoubleClick` | `(rowIndex: number) => void` | No | Callback fired when the user double-clicks a row; receives the row's index |
| `selectedRowIndexList` | `number[]` | No | Controlled list of selected row indexes; the table highlights these rows |
| `sortOrders` | `SortOrder[]` | No | Controlled sort state; an array of `{ field, direction }` objects |
| `onChangeSortOrders` | `(orders: SortOrder[]) => void` | No | Callback fired when the user changes the sort order |

All other props supported by the underlying CMS `DataTable` are accepted and forwarded without modification.

---

## Interaction Behaviours

#### User clicks a column header
The table sorts by that column. If `sortOrders` and `onChangeSortOrders` are provided, the sort is controlled externally. Without them, the table manages sort state internally. Sorting uses the column's `customSort` function, or the default locale-aware string comparator if none is supplied.

#### User clicks a row
The `onRowClick` callback fires with the zero-based index of the clicked row. Row highlighting (selection state) must be managed externally via `selectedRowIndexList`.

#### User double-clicks a row
The `onRowDoubleClick` callback fires with the zero-based index of the double-clicked row.

#### `rows` prop changes to an empty array
The table is unmounted and the No Records illustration is shown in its place.

#### `rows` prop changes from empty to non-empty
The No Records illustration is unmounted and the table is rendered with the new rows.

---

## Re-render Behaviour

The component uses React's `memo` with a strict reference-equality check. It only re-renders when the entire props object reference changes. **Avoid passing new object or array literals directly as props at the call site** — use `useMemo` or `useCallback` to stabilise `columns`, `rows`, and callback references, otherwise the table will not update when data changes.

> **Important:** The table is additionally keyed to the current UI language (`lang`). When the active language changes, the table is fully remounted to ensure column headers re-render in the new language.

---

## Configuration

No external configuration is required. The component self-contained and reads only the current application language from the `useI18NextHook` hook for locale-aware re-rendering.

---

## Data Saved

This component is read-only — it displays data but does not write to the database. Row selection and interaction are reported back to the parent via `onRowClick` / `onRowDoubleClick` callbacks.

---

## Related Workflows

- [[Generic Search Result Panel]] — `LisDataTable` is used as the result grid in all Generic Search screens.
- [[Outstanding Case Screen]] — `LisDataTable` renders the outstanding case result list with checkbox selection.
