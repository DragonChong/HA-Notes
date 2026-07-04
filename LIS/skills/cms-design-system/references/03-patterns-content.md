# 03 — Patterns & Content Guidelines

---

## Pattern: Form Input

### Required vs Optional Fields

- **Required**: Mark with `*` after the label. Asterisk is sufficient — red color not required.
  - Place before the field label (leftmost) so users can scan from left.
- **Optional**: Leave unmarked (or add "Optional" if clarity needed).

### Input Component Selection

| Scenario | Component |
|---|---|
| Multiple independent selections | Checkbox |
| Instant on/off (no confirmation needed) | Switch / Toggle |
| Mutually exclusive options | Radio Button |

---

## Pattern: Data Enquiry

A structural layout for **search-based data browsing screens**.

### Page Layout Zones (in order)
1. **Menu** — Global features and top-level navigation.
2. **Patient Info** — Important patient demographics.
3. **Function Tabs** — Switch between open functions/modules.
4. **Search Section** — Interactive search input area.
5. **Data Table** — Organized rows and columns.
6. **Action Section** (optional) — Buttons below the table.

### Page Layout Rules
- **Page Width**: Full — `PageContent` fills the screen automatically.
- **Page Padding**: 12px left and right.

### Search Section Rules
- Organize fields in logical, intuitive order.
- Group related fields; most important / frequently used fields first.
- **Maximum 2 rows visible by default** — maximizes the data table area.
- Field widths proportional to expected input (not all the same width).

**Advanced Search**:
- Hidden by default; exposed via an expand panel (not a popup).
- Use when 2 rows are insufficient for all search criteria.
- Options as checkboxes; if >5, hide extras behind "Show All".
- User still clicks the **Search** button after selecting criteria.

### Data Table Section Rules
- **Default rows per page**: 10 (adjust to fully utilize display area).
- Maximize rows to improve data scanning and reduce scrolling.

### Action Section Rules
- Buttons placed **below the table, aligned to the right**.
- Stick action bar to the page bottom for consistency.

---

## Pattern: Data Maintenance

For **Add / Edit / Delete** operations on data records.

### Anatomy
1. **Title** — Describes the data type being added/edited.
2. **Input Form** — Fields for entering or modifying data.
3. **Action** — Submit and cancel buttons.

### Workflow
- All Add/Edit/Delete flows originate from the **Data Enquiry page**.
- **Add**: triggered from the Action Bar below the Data Table.
- **Edit / Delete**: triggered from action buttons within the table row.
- **All Add/Edit forms open in a Dialog** — regardless of number of fields.

### Title Rules
- Include the data type in the title.
- ✅ "Edit Equipment" | ❌ "Edit Record" (too generic)
- Use **Title Case** for dialog titles that are nouns/actions.
- Use **Sentence case** for titles that are full sentences.

---

## Platforms

### Desktop

| Resolution | Aspect | Notes |
|---|---|---|
| 1024 × 768 | 4:3 | Minimum supported |
| 1280 × 1024 | 5:4 | Common hospital workstation |
| 1920 × 1080 | 16:9 | Modern HD monitor |
| 1080 × 1920 | 9:16 | Portrait / vertical (specific LIS features) |

**Constraints:**
- **Public workstation**: Shared; avoid saving sensitive data locally.
- **No internet access**: Some workstations on HA intranet only — all assets must be hosted internally.
- **Single display**: Design for single-screen workflows predominantly.
- **Primary browser**: Chrome. Fallback: Edge.

### iPad

**Supported models:**
- iPad 9th Gen (10.2")
- iPad Mini 6th Gen (8.3")
- iPad Pro 6th Gen (12.9")

**Design rules:**
- All interactive targets must meet minimum touch target sizes.
- Avoid hover-dependent interactions (no `:hover`-only UI on touch screens).
- SideMenu defaults to collapsed on screens < 768px; floats above content when expanded.
- Web component style is kept on tablet for consistency (not a native app UI).

---

## Content: Abbreviations

- Use only when space is limited.
- Use only approved standardized abbreviations from the design system — do not invent new ones.
- Time unit abbreviations (e.g., `hr`, `min`, `sec`) must follow the documented standard.

---

## Content: Capitalization

### Title and Header
- **Title Case** for: page headers, column headers, table/grid headers, button labels, menu items.
- Headers must be concise and scannable.

### Dialog / Alert Titles
- **Sentence case** for titles that are short sentences:
  - ✅ "Save your changes before exiting?"
  - ✅ "Confirm deletion of this file"
- **Title Case / Capitalized Case** for noun/error/specific-term titles:
  - ✅ "Network Error 401"
  - ✅ "File Download"
  - ✅ "Critical Update Available"

---

## Content: Date & Time Formats

| Type | Format | Example |
|---|---|---|
| Date (default) | `dd-MMM-yyyy` | `12-Nov-2022` |
| Date (no year) | `dd-MMM` | `12-Nov` |
| Numeric date | `yyyy-mm-dd` | `2022-11-12` |
| Time (with seconds) | `hh:mm:ss` (24-hr) | `22:30:55` |
| Time (no seconds) | `hh:mm` (24-hr) | `22:30` |
| Date + Time | `dd-MMM-yyyy hh:mm:ss` | `12-Nov-2022 22:30:55` |

- Always use **24-hour clock**.
- Default timezone: **HKT (UTC+8)** — do not display timezone.
- Use `yyyy-mm-dd` only when specifically required (ISO 8601 compliance).

---

## Content: Writing Guidelines

### Button Labels
- Verb + noun, Title Case, active voice.
- ✅ "Save Changes" | ❌ "Changes are Saved"
- Globally recognized single-noun labels OK: "OK", "Cancel".

### Add / Remove vs. Create / Delete
| Pair | Use Case |
|---|---|
| Add / Remove | Adding to / taking from an existing collection; Remove does NOT permanently destroy |
| Create / Delete | Generating / permanently removing a standalone item |

### Login vs. Logon
- **Login**: System requires credentials (username + password).
- **Logon**: System accessible without credentials.

### Ampersand (&)
- Can replace "and" in headings, labels, menu items, and button text where space is limited.
- Do NOT use in body copy.

### Singular & Plural
- Avoid `record(s)` format.
- Dynamic count: singular for 1, plural for >1 ("1 record found." / "5 records found.").
- Static labels: use the contextually correct form.

### Error Messages
| Principle | Rule |
|---|---|
| Specify what went wrong | Short, meaningful messages; clear description of the problem |
| Provide a solution | Guide the user on resolution; link to more info if complex |
| Use positive language | Soothes and guides; avoids negative/hostile tone |
| Avoid technical jargon | Hide technical details behind "More Details" if needed |
