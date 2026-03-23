---
tags:
  - lis-hub-lib
  - theme
---
# LIS Theme

## Overview

The LIS Theme is the shared MUI theme configuration for all LIS plugin apps. It extends the CMS design system base themes (`BasicThemeLight` and `BasicThemeDark` from `@cmschassis/react-ui`) with LIS-specific overrides for typography, spacing, breakpoints, and component styles. Two theme variants are exported — light and dark — and the active theme is selected at runtime based on the user's current theme preference broadcast by the shell application.

All `lis-hub-lib` components that carry visual styles wrap themselves in a `WithTheme` provider, which subscribes to the shell's theme mode signal and applies the correct variant automatically.

---

## Exports

| Export | Type | Description |
|--------|------|-------------|
| `lisBaseThemeLight` | MUI Theme | LIS theme extending `BasicThemeLight` — for use in light mode |
| `lisBaseThemeDark` | MUI Theme | LIS theme extending `BasicThemeDark` — for use in dark mode |
| `lisBaseTheme` | MUI Theme | Alias for `lisBaseThemeLight`; provided for backwards compatibility |

Import from `@lis/lis-hub-lib`:

```tsx
import { lisBaseThemeLight, lisBaseThemeDark } from '@lis/lis-hub-lib';
```

---

## Usage in Plugin Apps

### App-level theme wrapper (preferred)

Wrap the root of a plugin app with a `ThemeProvider` using the correct theme variant, driven by the shell's theme mode:

```tsx
import { lisBaseThemeLight, lisBaseThemeDark } from '@lis/lis-hub-lib';
import { ThemeProvider } from '@mui/material';

<ThemeProvider theme={themeMode === 'dark' ? lisBaseThemeDark : lisBaseThemeLight}>
  <App />
</ThemeProvider>
```

### Automatic per-component wrapping (`WithTheme`)

All `lis-hub-lib` shared components (e.g. `LisDoctorBox`, `LisDataTable`, `SiteComboBox`) internally wrap their output with the `WithTheme` utility component, which subscribes to the shell's live theme signal and re-applies the correct variant whenever the user switches modes. No manual wiring is needed for these components.

> **Note:** `WithTheme` reads the current theme and subscribes to changes via `window.$lisHubApp.getTheme()` and `window.$lisHubApp.subscribeTheme()`. It does not function in SSR or Node.js environments.

---

## Spacing

The LIS theme overrides MUI's default spacing multiplier (8 px) with a **1 px-per-factor** scale:

```
spacing(4) → "4px"   (MUI default would be "32px")
spacing(8) → "8px"   (MUI default would be "64px")
```

All spacing values in component styles within `lis-hub-lib` must use numeric pixel values directly (e.g. `padding: "12px 8px"`) or the `spacing()` function with this 1 px scale in mind.

---

## Breakpoints

The theme uses standard MUI breakpoints (not the HA CMS design system breakpoints):

| Breakpoint | Min Width |
|------------|-----------|
| xs | 0 px |
| sm | 600 px |
| md | 900 px |
| lg | 1200 px |
| xl | 1536 px |

> The HA CMS design system recommends different breakpoints (sm: 768 px, md: 1250 px, lg: 1650 px, xl: 1920 px). The CMS values are commented out in the theme source. If the project aligns to the CMS breakpoint specification in future, the commented-out values should replace the current ones.

---

## Typography

The base font is **Roboto**, with a system font stack fallback. The base font size is **18 px**.

The theme extends the MUI typography scale with four additional custom variants:

| Variant | Font Size | Line Height | Typical Use |
|---------|-----------|-------------|-------------|
| `body3` | 0.9375 rem (≈ 16.875 px) | 1.125 rem | Compact body text |
| `body4` | 0.875 rem (≈ 15.75 px) | 1 rem | Small body text |
| `subtitle3` | 0.9375 rem (≈ 16.875 px) | 1.125 rem | Compact subtitle |
| `subtitle4` | 0.875 rem (≈ 15.75 px) | 1 rem | Small subtitle |

### Standard Heading Scale

| Variant | Font Size | Line Height | Weight |
|---------|-----------|-------------|--------|
| h1 | 1.75 rem | 1.875 rem | Bold |
| h2 | 1.625 rem | 1.75 rem | Bold |
| h3 | 1.5 rem | 1.625 rem | Bold |
| h4 | 1.375 rem | 1.5 rem | Bold |
| h5 | 1.25 rem | 1.375 rem | Bold |
| body1 | 1.125 rem | 1.25 rem | Normal |
| body2 | 1 rem | 1.125 rem | Normal |
| subtitle1 | 1.125 rem | 1.25 rem | Normal |
| subtitle2 | 1 rem | 1.125 rem | Normal |

### Chinese Font

The `HAMingLiu` font family is registered as a CSS `@font-face` entry using the local font `HA_MingLiu`. This font is used for Chinese character rendering across all LIS screens.

---

## Component Style Overrides

The theme applies LIS-specific default styles to the following MUI components. These overrides apply globally to every instance of these components within a `ThemeProvider` using `lisBaseThemeLight` or `lisBaseThemeDark`.

### Button (`MuiButton`)

- Default variant: **contained**, default colour: **primary**
- Text transform: none (labels are shown as-is, not uppercased)
- Box shadow: none on all states (default, hover, active, focus)
- Three additional inverse variants are registered: `containedInverse`, `outlinedInverse`, `textInverse`
- Size-specific padding and font sizes:

| Size | Padding | Font Size |
|------|---------|-----------|
| Small | 6px 16px | 0.984375 rem |
| Medium | 12px 16px | 1.148 rem |
| Large | 16px 24px | 1.477 rem |

- All sizes use `borderRadius: "2px"` and `fontWeight: 700`

### Table (`MuiTable`, `MuiTableCell`, `MuiTablePagination`)

- Default table size: **small**
- Cell padding: `8px 5px` (body), `9px 5px` (header and checkbox cells)
- Cell font size: 1.125 rem; white-space: nowrap
- Pagination: actions (page navigation) are hidden; record count and rows-per-page selector are shown

### Dialog (`MuiDialog`, `MuiDialogTitle`, `MuiDialogContent`, `MuiDialogActions`)

- Dialog width constraints match CMS design system sizes: XS=400, SM=550, MD=700, LG=940, XL=1200 px
- Paper border radius: 5 px; margin: 20 px
- Title padding: 15px; Content padding: 15px; Actions padding: 12px 15px

### Text Input (`MuiOutlinedInput`, `MuiTextField`)

- Input font size: 1.125 rem
- Medium padding: `12px 8px`; Small padding: `8px 8px`
- Border radius: 2 px (via `MuiFormControl`)
- Input padding within `MuiTextField` inner element: 0 (padding managed by outer `MuiOutlinedInput`)

### Autocomplete (`MuiAutocomplete`)

- Medium input padding: `12px 8px`; Small input padding: `8px`; small root padding: 0
- Chips inside autocomplete use 1.125 rem font size
- End adornment vertical position: auto (not fixed top)

### Checkbox and Radio (`MuiCheckbox`, `MuiRadio`)

- Checkbox: padding 0, right margin 8 px, left margin −2 px, border radius 2 px
- Radio: padding 0, right margin 4 px
- Both use icon sizes: Large=1.805 rem, Medium=1.641 rem, Small=1.641 rem

### Tabs (`MuiTabs`, `MuiTab`)

- Tab font size: 1.125 rem; padding: `8px 12px`; text not uppercased
- Selected tab: font weight 700
- Active indicator height: 2 px
- First/last horizontal tabs have rounded top corners (4 px); vertical tabs have no border radius
- Left-side indicator for vertical tabs

### Tooltip (`MuiTooltip`)

- Default props: arrow enabled, placement top
- Font size: 1.125 rem; padding: `4px 8px`

### Chip (`MuiChip`)

- Border radius: 2 px; height: unset (height determined by content)
- Label padding: `4px 8px`

### Alert (`MuiAlert`)

- Error alert padding: `8px 10px`; border radius 3 px
- Title: 700 weight, 1.148 rem; Message: 400 weight, 1.125 rem

---

## Configuration

No runtime configuration is required. The theme is a static object composed at module load time. The active variant (light vs. dark) is chosen by the consuming app or the `WithTheme` wrapper based on the shell's theme signal.

---

## Related Components and Workflows

- [[WithTheme]] — Utility wrapper that dynamically applies `lisBaseThemeLight` or `lisBaseThemeDark` based on the shell's live theme mode; used inside all `lis-hub-lib` components.
- [[Data Table]] — Uses `WithTheme` internally; table cell padding and font overrides originate from this theme.
- [[Doctor Input (with Hospital)]] — Uses `WithTheme` internally.
- [[Site Combo Box]] — Uses `WithTheme` via `ComboTableBox` internally.
