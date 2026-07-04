---
name: cms-design-system
description: >
  Comprehensive front-end UI/UX guideline for Hospital Authority CMS (Clinical Management System)
  applications. Covers all @cmschassis/react-ui components, layout foundations, design patterns,
  content writing rules, and platform requirements (desktop + iPad).
  Use this skill whenever working on any CMS front-end task: creating or modifying UI components,
  building forms, data tables, dialogs, date pickers, navigation, or any layout work.
  Also use it for content decisions: date/time formatting, button labels, error messages,
  capitalization, and abbreviations. Triggers on any question about which component to use,
  how a component behaves, accessibility rules, dark mode, breakpoints, or touch/iPad design.
  Even when the user doesn't ask explicitly about design, apply these guidelines whenever
  writing or reviewing React JSX that uses @cmschassis/react-ui components.
---

# CMS Design System — Front-End Reference

All UI components are imported from **`@cmschassis/react-ui`**.
Full interactive demos are in Storybook at `uiux-doc-cmschassis-dev-st.tstcld61.server.ha.org.hk`.

## Table of Contents

| Section | Topic |
|---|---|
| [1. Quick Component Lookup](#1-quick-component-lookup) | All 27 components at a glance |
| [2. Layout Fundamentals](#2-layout-fundamentals) | Grid, spacing, breakpoints |
| [3. Component Decision Guide](#3-component-decision-guide) | Which component to use when |
| [4. Key Component Rules](#4-key-component-rules) | Critical rules for common components |
| [5. Content & Writing Rules](#5-content--writing-rules) | Date formats, capitalization, labels |
| [6. Platform Requirements](#6-platform-requirements) | Desktop resolutions, iPad touch rules |
| [Reference Files](#reference-files) | Full component specs |

---

## 1. Quick Component Lookup

All components available from `@cmschassis/react-ui`:

| Component | Purpose | Key Note |
|---|---|---|
| `AlertDialog` | Critical errors / warnings / confirmations | Centered; SM=550px, MD=700px |
| `Badge` | Numeric count or status dot | Hide when count = 0; use Tag for text |
| `Breadcrumbs` | Hierarchical navigation aid | Max 4 visible; all except current are links |
| `Button` | Primary actions | Contained → Outlined → Text (priority order) |
| `Checkbox` | Multi-select from a list | Indeterminate state for partial parent selection |
| `ComboBox` | Filterable dropdown (type to search) | Use for 10+ options requiring text filter |
| `DataTable` | Tabular data display | 5 types: Standard, Leading Col, Selection, Expandable, Bulk Editable |
| `DateTimePicker` | Date / date range / time selection | Always allow manual typing; calendar = 320px fixed |
| `Dialog` | Overlaying content panels | XS=400, SM=550, MD=700, LG=940, XL=1200px |
| `Dropdown` | Single/multi select list | Use for 5+ options without text filtering |
| `DualListSelector` | Transfer items between two lists | 3 variants: Basic, Expandable, Custom Grouping |
| `EditorFunctionPanel` | Floating RTE function panel | Draggable; XS=400, SM=550, MD=700px |
| `ExpansionPanel` | Collapsible content section | Normal or Sticky Bottom type |
| `InputValidation` / `AlertBox` | Form/server-side errors | Inline below field; AlertBox for server errors |
| `LoadingSpinner` | Loading state indicator | Full-screen (overlay) or Inline within section |
| `LowPriorityAlert` | Success/info toast | Bottom-right; auto-dismiss ≥ 5 seconds |
| `NumberInput` | Numeric field with +/− buttons | Use for small incremental adjustments |
| `RadioButton` | Single selection (mutually exclusive) | All options must be visible simultaneously |
| `RecordCard` | Shadowed content card | Do not nest; primary=green label, supplementary=gray |
| `RichTextEditor` | Full WYSIWYG text editing | Toolbar + Function Bar + Content Area |
| `SideMenu` | Page-level navigation menu | Basic or Grouped; collapses on mobile (<768px) |
| `ProgressStepper` | Workflow step indicator | 1-2 word labels; avoid on short forms |
| `Tabs` | Section navigation within a page | Horizontal (≤10 tabs), Vertical (>10 tabs) |
| `Tag` | Status / category label | Use for text labels; use Badge for numbers |
| `TextArea` | Multi-line text input | Min 3 rows default |
| `TextField` | Single-line text input | Labels above field; no colons after labels |
| `Tooltip` | Hover/tap supplementary info | No rich content; no interactive elements inside |
| `TreeView` | Hierarchical collapsible data | Basic or Icon type; always show chevron |

---

## 2. Layout Fundamentals

- **Spacing grid**: 4px or 8px baseline grid for all spacing decisions.
- **Column system**: 12-column grid; columns measured in percentages for responsiveness.
- **Gutters**: Padding between columns; vary per breakpoint.
- **Grid types**: Fluid (complex screens, 100% width) vs. Fixed (simple/landing pages).
- **Page padding**: 12px left and right (Data Enquiry pattern).

### Breakpoints

Always test at each standard desktop resolution (see [Platform Requirements](#6-platform-requirements)).
Responsive zones: Main Nav Bar, Main Menu, Journey Panel, Patient Panel, Main Panel.

### Color palettes

| Palette | Purpose |
|---|---|
| Primary | Brand + interactive elements |
| Neutral | Backgrounds, borders, text |
| Status | Success (green), Warning, Error, Info |
| Patient | Patient-related data visualization |

### Dark Mode rule

Swatches mirror symmetrically: swatch 100 (light) ↔ swatch 900 (dark). Avoid pure black/white — use off tones.

### Icons

- Library: **Phosphor Icons** (1px stroke, 16px size).
- Inactive state = Outline; Active/toggled state = Filled (solid).
- Use outline for all other states.

---

## 3. Component Decision Guide

### Input selection

| Scenario | Use |
|---|---|
| Multiple independent selections | `Checkbox` |
| Mutually exclusive single selection | `RadioButton` |
| Instant on/off toggle (no confirmation) | Switch/Toggle |
| Dropdown, no typing needed, 5+ options | `Dropdown` |
| Dropdown with type-to-filter, 10+ options | `ComboBox` |
| Long-form text | `TextArea` |
| Short free-form text | `TextField` |
| Numeric adjustment with steps | `NumberInput` |

### Feedback / notification

| Scenario | Use |
|---|---|
| Critical blocking error / confirmation | `AlertDialog` |
| Form field validation error | `InputValidation` (inline, below field) |
| Server-side / API error | `AlertBox` above action bar + inline on field |
| Non-blocking success / info | `LowPriorityAlert` (toast, bottom-right) |

### Navigation / hierarchy

| Scenario | Use |
|---|---|
| Page location trail | `Breadcrumbs` |
| Section navigation within page | `Tabs` |
| Feature page sub-navigation | `SideMenu` |
| Nested hierarchical data | `TreeView` |
| Multi-step workflow | `ProgressStepper` |

### Data display

| Scenario | Use |
|---|---|
| Tabular/flat data with multiple attributes | `DataTable` |
| Hierarchical data + collapsible | `TreeView` |
| Content grouped on a single topic | `RecordCard` |
| Collapsible section with title | `ExpansionPanel` |

---

## 4. Key Component Rules

### Button hierarchy (one high-emphasis per screen area)
```
Contained (filled)   → High-emphasis: primary CTA
Outlined             → Medium-emphasis: Cancel, Reset
Text                 → Low-emphasis: tertiary actions
Icon Button          → Table row actions only (universally understood icons)
```
- Labels: **verb + noun**, Title Case, e.g., "Add User", "Export PDF".
- Do NOT use leading icons in dialog action buttons.
- Icon buttons: show tooltip on hover when label is hidden.

### DataTable rules
- Striped rows recommended for data-heavy tables.
- Pagination at bottom-left: range display + rows-per-page + page list + nav buttons.
- Action column always rightmost; collapse >3 actions under "..." overflow.
- Sorting: click column header → ascending → descending → none; Shift+click for multi-sort.
- Numeric columns: right-aligned. Text columns: left-aligned.

### Dialog rules
- Provide a descriptive title. Do NOT nest dialogs.
- Only content area scrolls; header and action bar are fixed.
- All Add/Edit forms open in a Dialog (Data Maintenance pattern).

### AlertDialog rules
- For flow/system-level errors only — NOT for form field validation.
- Always centered. Close button hidden; user must interact with action buttons.
- Delete confirmation: Primary = "Delete", Secondary = "Cancel".
- Unsaved changes: Primary = "Save", Secondary = "Discard".

### Form validation rules
- Show inline validation **on field blur** (not on submit).
- On submit with errors: **scroll to the topmost error**.
- Validation message 8px below the field, icon left-aligned.
- Required fields: mark with `*` after label. Optional fields: leave unmarked.

### DateTimePicker
- Always allow manual keyboard entry in the date field.
- Calendar fixed at 320px width; opens on calendar icon click only.
- Format: `dd-MMM-yyyy` (e.g., `12-Nov-2022`); time: `hh:mm:ss` 24-hour.

---

## 5. Content & Writing Rules

### Date & Time Formats

| Type | Format | Example |
|---|---|---|
| Date (default) | `dd-MMM-yyyy` | `12-Nov-2022` |
| Date without year | `dd-MMM` | `12-Nov` |
| Numeric date | `yyyy-mm-dd` | `2022-11-12` |
| Time with seconds | `hh:mm:ss` (24-hr) | `22:30:55` |
| Time without seconds | `hh:mm` (24-hr) | `22:30` |
| Date + Time | `dd-MMM-yyyy hh:mm:ss` | `12-Nov-2022 22:30:55` |

Always use **24-hour clock**. Default timezone: **HKT (UTC+8)** — do not display timezone.

### Capitalization

- **Title Case**: Page headers, column headers, button labels, menu items.
- **Sentence case**: Dialog/alert titles that are full sentences.
- **Noun/code style**: Dialog titles that are error codes or specific terminology (e.g., "Network Error 401").

### Button labels
- Verb + noun in Title Case: "Save Changes", "Add User", "Export PDF".
- Active voice only: ✅ "Save Changes" not ❌ "Changes are Saved".
- "Add"/"Remove" = collection actions. "Create"/"Delete" = standalone item actions.

### Singular / plural
- Dynamic content: singular when count = 1; plural when count > 1.
- Avoid `record(s)` format — write the correct form.

### Error message writing
- Specify what went wrong + provide a solution.
- Avoid technical jargon; hide detail behind "More Details" if needed.
- Use positive language.

### Abbreviations & symbols
- Use `&` in headers/labels/buttons where space is limited; not in body copy.
- Use only approved UI abbreviations from the design system (no inventing new ones).

---

## 6. Platform Requirements

### Desktop

| Resolution | Aspect | Notes |
|---|---|---|
| 1024 × 768 | 4:3 | Minimum supported |
| 1280 × 1024 | 5:4 | Common hospital workstation |
| 1920 × 1080 | 16:9 | Modern HD |
| 1080 × 1920 | 9:16 | Portrait (specific LIS features) |

- Primary browser: **Chrome**. Fallback: **Edge**.
- All assets must be hosted **internally** (no CDN / internet dependencies).
- Avoid saving sensitive data locally (shared public workstations).

### iPad

- Supported: iPad 9th Gen (10.2"), iPad Mini 6th Gen (8.3"), iPad Pro 6th Gen (12.9").
- All interactive targets must meet minimum touch target sizes.
- **No hover-dependent interactions** on touch screens.
- SideMenu defaults to collapsed on screens < 768px.

---

## Reference Files

Read these only when you need full specification for a specific area:

| File | Contents |
|---|---|
| [references/01-foundations.md](references/01-foundations.md) | Layout grid detail, color tokens, breakpoint zones, dark mode swatch mapping, icon usage rules |
| [references/02-components.md](references/02-components.md) | Full anatomy, variants, behavior, and placement rules for all 27 components |
| [references/03-patterns-content.md](references/03-patterns-content.md) | Form Input, Data Enquiry, Data Maintenance patterns; full writing guidelines; platform detail |
