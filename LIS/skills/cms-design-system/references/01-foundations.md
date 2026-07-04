# 01 — Foundations

## Layout

### Baseline Grid

- Use a **4px or 8px baseline grid** for all spacing decisions.
- Grid systems provide a flexible framework for organizing content and visual hierarchy.

### Basic Page Layout Zones

| Element | Behavior |
|---|---|
| Main Menu Bar | Fixed width |
| Journey Panel | Fixed width |
| Content Area | Fills remaining available space |

### 12-Column Grid

- Content placed within column areas; columns measured in **percentages**.
- Columns combine freely: two 6-col, three 4-col, four 3-col, etc.
- **Gutters**: Padding between columns; width varies per breakpoint.
- **Margins**: White space beyond content area; wider margins preferred for larger screens.

### Grid Types

| Type | Description | Use Case |
|---|---|---|
| **Fluid** | Calculated relative to viewport; stretches on resize | Complex screens requiring 100% width |
| **Fixed** | Remains at fixed pixel width | Simple screens, landing/lead pages |

### Usage Rules

- Place all elements inside column sets.
- Wrap elements in parent containers (visible = bordered/colored; invisible = transparent).
- Parent containers span full column edges; inner content positioned independently.

---

## Color System

### Four Main Palettes

| Palette | Purpose |
|---|---|
| **Primary** | Brand and primary interactive elements |
| **Neutral** | Backgrounds, borders, text |
| **Status** | Semantic feedback: success (green), warning, error, info |
| **Patient** | Patient-related data visualization |

- Color tokens available in Storybook under the `color` section.
- Full swatches in Figma Components (internal).

---

## Breakpoints

- Always test designs and code at each standard breakpoint.
- Responsive zones that adapt at breakpoints:

| Zone | Behavior at Breakpoints |
|---|---|
| Main Nav Bar | Adjusts layout/visibility |
| Main Menu | Collapses or adapts |
| Journey Panel | Adjusts width |
| Patient Panel | Adjusts width |
| Main Panel | Fills remaining space |

---

## Dark Mode

### Background

- Neutral color ramp converts light to dark; off-white on off-black (avoid pure white/black).
- Light mode ramp is paired with a corresponding dark mode ramp.

### Primary Color Mapping (Symmetry Rule)

- Colors mirror within the 10-swatch palette.
- **Example**: Swatch 100 (light) → Swatch 900 (dark); Swatch 200 → Swatch 800, etc.

### Status Colors

- Success, warning, error, info each have defined dark mode variants.

---

## Icons

### Icon Library

- **Phosphor Icons** — customized with **1px stroke**; filled and outlined variants.
- Icons are inline SVG bundled within the component system.

### Visual Style

| Property | Value |
|---|---|
| Default type | Outline |
| Active/toggle type | Fill (solid) — only for active toggle state |
| Weight | Regular |
| Stroke | 1px at 16px render size |
| Design grid | 32×32px canvas with 2px stroke |

### Toggle Behavior

- **Inactive** → Outline icon
- **Active** → Solid (filled) icon

### Icon Mapping

For approved action-to-icon mappings, refer to the Icon Mapping Table in the design system at:
`uiux-doc-cmschassis-dev-st.tstcld61.server.ha.org.hk/docs/guideline/foundations/icons/`
