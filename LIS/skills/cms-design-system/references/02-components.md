# 02 — Components (Full Specifications)

All components: `import { ... } from '@cmschassis/react-ui'`

---

## Alert Dialog

### Types
| Type | Extra Element |
|---|---|
| Simple Alert | Icon + Title + Message + optional action bar |
| Alert with Reference Code | + Reference Code field (not in message body) |
| Alert with Additional Information | + Additional Information section |

### Widths
| Size | Width | Use |
|---|---|---|
| SM | 550px | Default (small content) |
| MD | 700px | Content with reference code or additional info |

### Rules
- Always centered horizontally and vertically.
- Close button is **hidden** — user must interact with action buttons.
- **Error**: Appears after action; informs of failure + resolution.
- **Warning**: Appears before destructive action; warns of consequences.
- Delete confirmation: Primary = "Delete", Secondary = "Cancel".
- Unsaved Changes: Primary = "Save", Secondary = "Discard".
- For form field errors → use Inline Validation instead.

---

## Badge

### Variants
- **Count Badge**: Numeric value.
- **Dot Badge**: Status/presence indicator (no number).

### Behavior
- Cap display at defined limit (e.g., 99 → "99+").
- **Hide badge when count = 0**.
- Placement: top-right of icon/avatar, or after item label.

### Usage
- ✅ Notifications, unread counts, cart item count.
- ❌ Long text or descriptive labels → use Tag instead.

---

## Breadcrumbs

### Anatomy
- Page Links (clickable), Separator (non-interactive), Current Page (non-interactive), optional Icon, optional Tag.

### Behavior
- All items **except current page** are clickable links.
- **Max 4 visible items**; overflow collapses middle items.
- Overflow items accessible via overflow control.

### Placement
- Top-left of page, above page title.

---

## Button

### Hierarchy
| Level | Type | Use |
|---|---|---|
| High | Contained (Filled) | Primary CTA; one per screen area |
| Medium | Outlined | Cancel, Reset Filters |
| Low | Text | Tertiary actions; often in groups of 3 |
| Low | Icon Button | Table row actions only |

### States
Default, Hover, Focused, Pressed, Disabled, Loading.

### Labels
- Verb + noun, Title Case: "Add User", "Export PDF".
- Globally recognized nouns alone OK: "OK", "Cancel".

### Icon Rules
- Leading Icon: before text; aids recognition.
- Trailing Icon: after text; for forward/next navigation.
- **Do NOT** use leading icons in dialog action buttons.
- **Do NOT** use both leading and trailing icons on the same button.
- Icon buttons: show tooltip on hover when label is hidden.

### Disabled Buttons
Avoid when possible. Acceptable: after click (prevent duplicate submissions), when no changes detected.

### Placement
- Horizontal group: order by importance.
- Stacked group: most important action on top.

---

## Checkbox

### States
- Unchecked, Checked, Indeterminate (parent only — partial children selected).

### Parent-Child Nesting
- Check parent → all children checked.
- Uncheck parent → all children unchecked.
- Partial children → parent shows Indeterminate.

### Placement
- Label to the **right** of checkbox.
- Vertical preferred; 12px between options.
- Horizontal: 25px between options.
- Multi-line label: checkbox top-aligned to first line.

---

## Combo Box

### Types
- **Single Selection**: One option; typing filters list.
- **Multiselect**: Multiple options; selected appear as Tags in field.

### Anatomy
Field Label, Placeholder/Input, Container, Trailing caret icon, optional Help Text, Option List (matching chars bolded).

### Behavior
- Scroll starts at 6th option (scrollbar at 0.8 opacity).
- Opens up or down based on screen position.
- Multiselect: enlarge field if insufficient space for tags.
- Three sizes: small, medium, large.
- Use when users need to **type to filter** (especially 10+ options).

---

## Data Table

### Types
| Type | Description |
|---|---|
| Standard | Data-focused main table |
| Leading Column | Header in first column; small datasets |
| Selection | Checkboxes in first col; selected rows change background |
| Expandable | Key info in main row + expandable detail section |
| Bulk Editable | All cells editable; Add/Delete row; deleted rows shown in gray |

### Appearance
- **Striped rows**: Recommended for data-heavy tables.
- Row hover state: optional.

### Pagination (bottom-left)
1. Current range: "1–25 of 150"
2. Rows-per-page selector (can hide if fixed)
3. Page number list (ellipsis when >5 pages)
4. Navigation buttons ← → and optional ⇐ ⇒ (first/last)

### Column Rules
- Min column width: 40px.
- Max header: 5 words / 3 lines.
- Long content: wrap essential text; truncate with ellipsis (max 3 lines) for less critical.
- Fixed columns: first column and action column fixed on horizontal overflow.
- Action column always rightmost; collapse >3 actions into "..." overflow.

### Sorting
Click column header → ascending → descending → none. Shift+click for multi-sort.

### Alignment
- Left: first column, text values.
- Right: numeric values (quantities, durations).
- Vertical: top-align for multi-line.

---

## Date Time Picker

### Anatomy
- **Input**: Label, date text field, calendar icon, help text (format instructions).
- **Calendar**: Month/year selector, nav arrows, weekday labels, date states.
- **Time Picker**: Hour/Minute/Second columns; scroll to select; selected = green.

### Behavior
- Always allow manual typing in date field.
- Calendar opens **only on calendar icon click**.
- Date Range: after start date, auto-focus to end date; prior dates disabled.
- Date restrictions configurable (earliest/latest).
- Time picker scrollbar appears on hover.
- Calendar always left-aligned to input; time picker to the right of calendar.
- Calendar fixed width: **320px**.

### Required Formats
- Date: `dd-MMM-yyyy` | Time: `hh:mm:ss` (24-hour) | Combined: `dd-MMM-yyyy hh:mm:ss`

---

## Dialog

### Types
| Type | Action Bar | Close Button |
|---|---|---|
| Text / Normal | Optional | Yes |
| Alert Dialog | Required | Hidden |
| Informative | Optional | Yes |
| Graphic | Optional | Yes |

### Widths
| Size | Width |
|---|---|
| XS | 400px |
| SM | 550px (default text) |
| MD | 700px (default informative) |
| LG | 940px |
| XL | 1200px (20px margin when screen <1160px) |

### Action Bar colors
- Text / Alert: light gray background.
- Informative: green background.

### Behavior
- Scroll: content area only; header + action bar fixed.
- Closing: submit/cancel button, close button (if shown), or overlay click (detail views).
- **Never nest dialogs**.

---

## Dropdown

### Types
- **Single Selection**: Mutually exclusive; one at a time.
- **Multiselect**: Multiple selections; shown as Tags in field.

### Behavior
- Scroll at 6th option (scrollbar 0.8 opacity).
- Opens up if near screen bottom edge.
- Three sizes: small, medium, large.
- Web style on tablet for consistency.
- Use when there are **more than 5 options** with no typing needed.

---

## Dual List Selector

### Anatomy (3 parts)
- **Source List**: Available items with checkboxes.
- **Move Buttons**: Arrow buttons between lists.
- **Destination List**: Selected items with checkboxes and drag handles.
- Each list: Title, Select All checkbox, count, search field, list items.

### Variants
| Variant | Use |
|---|---|
| Basic Dual List | Few, flat options |
| Expandable Dual List | Many options in collapsible groups |
| Custom Grouping | User creates custom folders in destination |

### Behavior
- Transfer: select → click arrow → auto-scroll into view.
- Search: highlights matches; clear button resets.
- Reorder: drag handle on destination items.

---

## Editor Function Panel

### Widths: XS=400px (default), SM=550px, MD=700px.

### Anatomy
- Panel Header (draggable handle + close button)
- Panel Body (function content)
- Panel Action Bar (optional confirm/cancel)

### Behavior
- Drag anywhere within the editor (top-left corner is draggable region).
- Close: confirm/cancel button, close button, click action button again, or click outside editor.

---

## Expansion Panel

### Types
- **Normal**: Title bar fixed; content flows below.
- **Sticky Bottom**: Body fixed at page/container bottom when expanded.

### Anatomy
Header: Title, Expand/Collapse Button, optional counter, optional action button.
Body: Any component (text, cards, buttons, etc.).

### Behavior
- Click title **or** chevron to expand/collapse.
- Chevron on the **end side** of header.
- Do not put essential info in a collapsed panel unless it defaults to expanded.
- Supports infinite scroll within body.

---

## Input Validation

### Types
1. **Inline Validation**: Icon + message; triggered on **field blur** (before submit). Replaces help text.
2. **Alert Box**: Container + title + content + icon; for **server-side errors**. Place above action bar.

### Placement
- Inline: 8px below field, icon left-aligned.
- Field-specific errors: below each affected field.
- General form errors: end of form in a summary list.
- On submit scroll to topmost error.

### Cross-field validation
Triggered after both fields lose focus; message shown below the second field.

---

## Loading Spinner

### Types
- **Determinate**: 0–100% fill; shows expected duration.
- **Indeterminate**: Infinite rotation; no discrete progress.

### Sizes: Small, Medium, Large.

### Usage
- Full page loading: **full-screen** (centered with overlay).
- Partial section update (tabs, table, upload): **inline** within updating element.

---

## Low-priority Alert (Toast)

### Anatomy: Alert content + optional close button.

### Placement: Bottom-right of screen, 15px from edges.

### Behavior
- Does not block user's task.
- Success/positive actions → green color.
- Auto-dismiss: minimum **5 seconds** for info/success; user can close manually.
- Avoid multiple simultaneous alerts.

---

## Number Input

### Anatomy: optional Label, Input field, Subtract Button, Add Button, optional Unit (e.g., "kg").

### Usage
- Quick, precise value adjustment within defined parameters.
- Small incremental changes requiring few interactions.
- Inline use: vertically center with surrounding text.

---

## Radio Button

### States: Deselected / Selected. One option selected by default.
### Sizes: Small, Medium (default), Large.

### Placement
- Label to the **right** of radio button.
- Vertical preferred; 12px between options.
- Horizontal: 25px between options.
- Multi-line: radio button top-aligned to first line.

### Usage
- Mutually exclusive options (only one selectable).
- All options must be **visible simultaneously**.

---

## Record Card

### Anatomy
- **Header**: Title, optional expand/collapse, optional action button (edit, delete).
- **Body**:
  - Primary Details: main content; section label in **green**.
  - Supplementary Details (optional): collapsible; section label in **gray**.

### Rules
- Style all cards in a section consistently.
- Light grey divider between key info / buttons, and primary / supplementary.
- **Do not nest Record Cards**.
- Prioritize important info first; supplementary may default to collapsed.

---

## Rich Text Editor

### Three parts
1. **Function Bar**: Advanced functions → opens `EditorFunctionPanel`.
2. **Toolbar**: Bold, italic, lists, formatting. Overflow → "..." menu.
3. **Content Area**: Writing area.

---

## Side Menu

### Types: Basic (flat list) / Grouped (expandable groups).

### Anatomy
- Menu Header (title + expand/collapse button)
- Menu Items / Group Header / Grouped List Items
- Optional Note at bottom.

### Behavior
- Click header arrow to collapse to slim bar (title only) / expand.
- Scrollable if items exceed viewport.
- **Responsive** (<768px): defaults to collapsed; floats above content when expanded.

---

## Progress Stepper

### Step Statuses: Incomplete, Current, Complete, Success, Error, Warning.

### Label Placement
| Style | Use |
|---|---|
| Inside Labels | Short labels (word, date, few chars) |
| Below Labels | Longer descriptive labels |
| Inline Labels | Short to medium; horizontal layout |

### Rules
- Labels: **1–2 words** max; wrap if longer.
- Avoid using on short forms or multiple times per page.

---

## Tabs

### Types
| Type | Use |
|---|---|
| Horizontal | ≤10 tabs; placed below/after title |
| Vertical | >10 tabs; left side; content to the right |

### Behavior
- Default: first tab selected (most important use case).
- Scrollable when insufficient space; overflow menu at end.
- Label truncation allowed.
- Fixed height (single-line labels only — no wrapping).
- If only 2 tabs with space: can be placed after title, right-aligned.

### Rules
- **Never nest tabs** (no tabs within tabs).
- First tab = highest priority use case.

---

## Tag

### Variants
| Variant | Use |
|---|---|
| Plain Text Tag | Fixed info (version, severity, format); may have leading icon |
| Linked Tag | Hyperlink to related content |
| Removable Tag | Close icon to remove (filters, combo-box selections) |

### Usage
- Status labels (Active, Draft, Completed), category labels, filter chips.
- ❌ Numeric indicators → use Badge instead.

---

## Text Area

### Anatomy: optional Label, Placeholder/Input, Container, optional Character Counter, optional Help Text.

### Behavior
- Default min height: **3 lines** (set via `rows`).
- Fluid width — resizes with viewport on small screens.
- Content overflow → vertical scroll.
- Placeholder disappears on typing.

---

## Text Field

### Anatomy: optional Label, Placeholder/Input, Container, optional Leading Icon, optional Trailing Icon, optional Help Text.

### Rules
- Labels **above** field (not side-by-side). **No colon** after label.
- Single-line input only (multi-line → TextArea).
- Set width proportional to expected input length.
- ComboBox/Autocomplete triggers at **4 letters** typed.

### Placeholder vs Help Text
| Type | Use |
|---|---|
| Placeholder | Brief suggestion or example format (prefix "e.g."). Disappears on typing. |
| Help Text | Requirements, character limits, rules. Persists below field. |
| Neither | When field purpose is obvious from label. |

---

## Tooltip

### Behavior
- Desktop: hover to show; cursor away to dismiss.
- Touch: tooltip icon → auto-dismiss after **2000ms**.
- Touch on hover-only element (icon button): add a visible text label.
- One tooltip at a time; new tooltip immediately closes any open one.
- Fade in/out transitions.
- Placement: auto-detects edges; can be fixed to a direction.
- Text alignment: center by default; left-align if content ≥ 1 sentence.

### Rules
- No rich content or imagery.
- No interactive elements (links, buttons) inside tooltip.

---

## Tree View

### Types: Basic (text-only) / Icon (icons beside nodes).

### Anatomy
- Branch Node (parent + chevron), Leaf Node (terminal), optional Node Icon, optional Badge (child count).

### Rules
- Always show chevron for expandable nodes.
- Consistent icons: use for all nodes or none.
- Wrap long labels (don't truncate); aim ≤ 25 chars.
- Click entire node = expand/collapse + activate simultaneously.

### Tree View vs Data Table
| Use Tree View | Use Data Table |
|---|---|
| Hierarchical multi-level data | Flat data with multiple attribute columns |
| Structure is primary concern | Comparison, sorting, detailed records |
