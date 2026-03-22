## Styling Best Practices for Plugin Apps (MUI + `@cmschassis/react-ui` + `@lis/lis-hub-lib`)

### The Core Problem

Your plugin (`lis-request-app`) renders into an isolated React root with its own Emotion cache (`key: "request"`). It has no `ThemeProvider` from the Hub — it starts naked. Without explicit setup you get:

- MUI components rendering with MUI's default theme (blue/purple) instead of the LIS look
- `@cmschassis/react-ui` and `@lis/lis-hub-lib` components potentially using a different theme instance than your raw MUI components
- Light/dark mode changes in the Hub not propagating into your plugin

---

### The Correct Provider Stack

The `renderReactComponent` entrypoint in `lis-request-app` must compose all three concerns in the right order:

typescript

```typescript
// src/cms-plugin/view-handler.tsx  (lis-request-app)
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { ThemeProvider } from '@mui/material/styles';
import { lisBaseThemeLight, lisBaseThemeDark } from '@lis/lis-hub-lib';

function renderReactComponent(container: HTMLElement, apiContext: LisApiContext) {
  const cache = createCache({ key: 'request' }); // Rule 4: must be 'request'
  const root = createRoot(container);

  root.render(
    <CacheProvider value={cache}>
      <ThemeAwareRoot apiContext={apiContext} />
    </CacheProvider>
  );
}

// Separate component so the hook can subscribe to theme changes
function ThemeAwareRoot({ apiContext }: { apiContext: LisApiContext }) {
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(
    () => apiContext.preference.getTheme() ?? 'light'
  );

  useEffect(() => {
    // Subscribe to Hub theme changes via apiContext.preference
    const unsub = apiContext.preference.subscribeTheme((mode) => {
      setThemeMode(mode);
    });
    return () => unsub?.();
  }, [apiContext]);

  const theme = themeMode === 'dark' ? lisBaseThemeDark : lisBaseThemeLight;

  return (
    <ThemeProvider theme={theme}>
      <ContextProvider apiContext={apiContext}>
        <RegistrationPage />
      </ContextProvider>
    </ThemeProvider>
  );
}
```

**Why this order matters:**

|Layer|Why|
|---|---|
|`CacheProvider` (outermost)|Must wrap `ThemeProvider` — Emotion cache needs to be set before any `sx` prop or `styled()` call resolves|
|`ThemeProvider`|Provides `lisBaseTheme*` to all MUI components, `@cmschassis/react-ui` components, and `@lis/lis-hub-lib` components in the tree|
|`ContextProvider` (innermost)|Your app context — sits inside the theme so its components inherit it|

---

### How `@cmschassis/react-ui` and `@lis/lis-hub-lib` Components Pick Up the Theme

Both libraries use MUI's `useTheme()` / `styled()` internally — they do **not** bundle their own theme. As long as your `ThemeProvider` wraps them with `lisBaseThemeLight/Dark`, they will render consistently. The key requirement is that:

1. All three component sets share the **same MUI instance** (guaranteed by Webpack Module Federation `singleton: true` for `@mui/material`)
2. The `ThemeProvider` renders **above** all of them in the tree (your `view-handler.tsx` ensures this)

---

### Handling the "Dense / Compact" Look

Looking at your screenshot, the Patient Demographics panel uses compact field sizing — small labels, tight spacing, dense inputs. This comes from MUI theme `components` overrides in `lisBaseThemeLight`. If a field looks too large/loose, it means the theme isn't applied. The check:

typescript

```typescript
// Quick diagnostic — run in browser console on the view's DOM node
window.__MUI_USE_NEXT_TYPOGRAPHY_VARIANTS__ // should be undefined or true
// More reliable: inspect an MUI TextField's class names
// With theme: class will start with "request-" (your Emotion cache key prefix)
// Without theme: class will start with "css-" (MUI default)
```

---

### Inline Styling Rules

|Situation|Use|
|---|---|
|Layout, spacing, positioning|MUI `sx` prop — uses theme tokens (`spacing`, `palette`, etc.)|
|Component-level custom styles|`styled()` from `@mui/material/styles` (not from `@emotion/styled` directly)|
|One-off overrides on `@lis/lis-hub-lib` components|`sx` prop if supported; otherwise `className` with emotion `css()`|
|Global resets scoped to this plugin|`GlobalStyles` from `@mui/material` inside the `ThemeProvider`|

**Never use:** inline `style={{}}` for anything theme-related — it bypasses both Emotion and MUI theme tokens and will break in dark mode.

---

### Subscribing to Theme Changes

The Hub exposes theme changes via two paths — use `apiContext.preference` (the MFE-safe boundary):

typescript

````typescript
// Inside a component
const apiContext = useApiContext(); // your app's context hook

useEffect(() => {
  const unsub = apiContext.preference.subscribeTheme((mode) => {
    // If you've hoisted ThemeProvider to renderReactComponent as above,
    // this is already handled. Only needed for deeper dynamic overrides.
  });
  return () => unsub?.();
}, []);
```

If you follow the `ThemeAwareRoot` pattern above, you don't need per-component subscriptions — the single subscription at the root re-renders the whole tree with the correct theme object.

---

### Summary Checklist for `lis-request-app`
```
✅  CacheProvider with key: "request" — outermost wrapper
✅  ThemeProvider with lisBaseThemeLight/Dark — wraps entire plugin tree
✅  Theme mode driven by apiContext.preference.subscribeTheme()
✅  All MUI sx/styled calls use theme tokens (palette, spacing) — no hardcoded hex
✅  @lis/lis-hub-lib components (HkidInput, LisLocationBox, etc.) sit inside ThemeProvider
✅  @cmschassis/react-ui components sit inside ThemeProvider
✅  No separate ThemeProvider inside individual components — one at root only
✅  No direct Emotion cache creation inside component bodies
````

The screenshot you shared shows the panel without theme applied (default MUI sizing). Once `lisBaseThemeLight` is wired via `ThemeProvider` inside the `CacheProvider`, the compact styling, font, and palette will align automatically with the rest of the LIS shell.

Does the above handle the following: * height of input component * Font size of label * Font size of input

晚上10:44

Searched project for “lisBaseThemeLight MUI theme components override TextField input height font size”

Searched project for “lisBaseThemeLight MUI theme components override TextField input height font size”

Short answer: **no, not fully.** `ThemeProvider` + `lisBaseTheme*` gets you palette and typography tokens, but input height and the specific label/input font sizes used in the Registration screen require additional explicit handling. Here's the complete picture:

---

## What `lisBaseThemeLight` Does and Doesn't Cover

|Concern|Covered by theme?|Reality|
|---|---|---|
|Palette colours|✅ Yes||
|Font family|✅ Yes|Shared fonts in `@lis/lis-hub-lib`|
|Default MUI typography scale|✅ Yes|But MUI defaults are `body1` = 16px|
|**Input height**|❌ Not automatically|Depends on `size` prop + theme `components` overrides|
|**Label font size**|❌ Not automatically|MUI default shrunk label ≠ your target 14px/18px|
|**Input text font size**|❌ Not automatically|MUI default TextField input = 16px|
|Normal vs. Large font variant|❌ Not in theme|Driven by menu config → your screen must handle|

The Registration screen has a specific requirement from knowledge base: **Normal = font size 14, Large = font size 18**, applied uniformly to labels, values, and button text.

---

## What You Need to Add

### 1. Font Size: Drive it from a screen-level prop/context

The font size variant is determined at screen open time (from `top_menu.object_class` — Normal vs. Large Registration). Wire it into a context so every component in the tree can respond:

typescript

```typescript
// src/context/FontSizeContext.tsx
import { createContext, useContext } from 'react';

export type FontSizeVariant = 'normal' | 'large';

// normal = 14px, large = 18px (per Screen Font Size Configuration spec)
export const FONT_SIZE: Record<FontSizeVariant, number> = {
  normal: 14,
  large: 18,
};

export const FontSizeContext = createContext<FontSizeVariant>('normal');
export const useFontSize = () => useContext(FontSizeContext);
export const useFontSizePx = () => FONT_SIZE[useContext(FontSizeContext)];
```

### 2. Inject Font Size into the MUI Theme

Override the MUI theme's `components` section dynamically based on the font size variant. This is the only way to consistently control label size, input text size, and input height across raw MUI, `@cmschassis/react-ui`, and `@lis/lis-hub-lib` components — all of which respect theme overrides.

typescript

```typescript
// src/cms-plugin/view-handler.tsx
import { createTheme } from '@mui/material/styles';
import { lisBaseThemeLight, lisBaseThemeDark } from '@lis/lis-hub-lib';

function buildRegistrationTheme(
  base: typeof lisBaseThemeLight,
  fontSize: 14 | 18
) {
  return createTheme(base, {
    components: {
      MuiInputBase: {
        styleOverrides: {
          root: {
            fontSize: fontSize,     // input text
          },
          input: {
            // height is controlled via padding + line-height, not explicit height
            // this matches MUI's own dense pattern
            paddingTop: fontSize === 14 ? 6 : 8,
            paddingBottom: fontSize === 14 ? 6 : 8,
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            fontSize: fontSize,     // floating label (resting state)
          },
          shrunk: {
            // shrunk label is typically 75% scale — keep that ratio
            // MUI applies scale() transform, so set the base and let transform handle it
            fontSize: fontSize,
          },
        },
      },
      MuiFormLabel: {
        styleOverrides: {
          root: {
            fontSize: fontSize,
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            fontSize: fontSize,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            fontSize: fontSize,
          },
        },
      },
    },
  });
}
```

Then in `ThemeAwareRoot`:

typescript

```typescript
function ThemeAwareRoot({
  apiContext,
  fontSizeVariant,
}: {
  apiContext: LisApiContext;
  fontSizeVariant: FontSizeVariant;   // passed in from onWillDisplayView params
}) {
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(
    () => apiContext.preference.getTheme() ?? 'light'
  );

  useEffect(() => {
    const unsub = apiContext.preference.subscribeTheme(setThemeMode);
    return () => unsub?.();
  }, [apiContext]);

  const baseTheme = themeMode === 'dark' ? lisBaseThemeDark : lisBaseThemeLight;
  const fontSize = fontSizeVariant === 'large' ? 18 : 14;
  const theme = useMemo(
    () => buildRegistrationTheme(baseTheme, fontSize),
    [baseTheme, fontSize]
  );

  return (
    <ThemeProvider theme={theme}>
      <FontSizeContext.Provider value={fontSizeVariant}>
        <ContextProvider apiContext={apiContext}>
          <RegistrationPage />
        </ContextProvider>
      </FontSizeContext.Provider>
    </ThemeProvider>
  );
}
```

### 3. Input Height — Don't Set `height` Directly

MUI `TextField` height is controlled by **padding + line-height**, not a `height` property. Setting `height` explicitly on `MuiInputBase` breaks multiline fields and causes layout issues. The correct approach:

|Goal|How|
|---|---|
|Compact single-line fields (your screenshot)|Use `size="small"` on all `TextField` components — this is the MUI-correct way|
|Further height adjustment|Override `MuiInputBase.input` `paddingTop`/`paddingBottom` in theme (as above)|
|`@lis/lis-hub-lib` composite components (HkidInput, etc.)|They accept a `size` prop that forwards to the underlying TextField — pass `size="small"`|

If you look at your screenshot, those fields are already at the compact height — that's MUI `size="small"`. Default is `size="medium"` which is taller. Ensure all `TextField`, `HkidInput`, `EncounterNumber`, `LisLocationBox`, etc. are given `size="small"` explicitly, or set it as the theme default:

typescript

````typescript
// Inside buildRegistrationTheme components overrides
MuiTextField: {
  defaultProps: {
    size: 'small',
  },
},
MuiAutocomplete: {
  defaultProps: {
    size: 'small',
  },
},
```

Setting `defaultProps` in the theme means you don't have to pass `size="small"` on every individual component instance.

---

## Complete Checklist
```
ThemeProvider with lisBaseTheme* ............. palette, font family ✅
buildRegistrationTheme() overrides ........... input text font size ✅
                                             label font size ✅  
                                             shrunk label size ✅
MuiTextField defaultProps size="small" ....... input height (compact) ✅
MuiAutocomplete defaultProps size="small" .... dropdowns height ✅
FontSizeContext (14 vs 18) ................... Normal vs Large variant ✅
No explicit height: on input elements ........ avoids multiline breakage ✅
````

The `size="small"` as `defaultProps` in theme is the most important practical fix for what you're seeing in the screenshot — those fields look default-medium height without it.