The root issue is clear. Here's the diagnosis and fix:

## The Problem: Missing `ThemeProvider` in `lis-request-app`

`@lis/lis-hub-lib` components (`HkidInput`, `LisLocationBox`, etc.) are styled against **`lisBaseThemeLight`** — the shared MUI theme. `@cmschassis/react-ui` components do the same. When your `lis-request-app` renders without wrapping in that theme, both component sets fall back to MUI's default theme, but they resolve tokens differently — causing the visual mismatch you're seeing in the screenshot (mismatched heights, border radii, font sizes between native inputs and the lib components).

Looking at your screenshot: the `Name`/`Chinese Name` fields are taller with a different border style than the `Hospital`/`Specialty`/`Location` dropdowns — classic symptom of theme mismatch.

## Fix: Wrap the plugin root in `lisBaseThemeLight`

In `lis-request-app`'s `renderReactComponent` (your plugin entry point):

```typescript
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { ThemeProvider } from '@mui/material/styles';
import { lisBaseThemeLight } from '@lis/lis-hub-lib';
import { ContextProvider } from './context/ContextProvider';
import { RegistrationPage } from './screens/Registration/RegistrationPage';

export function renderReactComponent(
  root: ReturnType<typeof import('react-dom/client').createRoot>,
  apiContext: LisApiContext
) {
  const cache = createCache({ key: 'request' });

  root.render(
    <CacheProvider value={cache}>
      <ThemeProvider theme={lisBaseThemeLight}>
        <ContextProvider apiContext={apiContext}>
          <RegistrationPage />
        </ContextProvider>
      </ThemeProvider>
    </CacheProvider>
  );
}
```

## Why this works (and is safe)

- `lisBaseThemeLight` is a peer dep already present in the module federation shared scope — no bundle duplication.
- The `ThemeProvider` here is **scoped** to the `request` plugin's DOM subtree via the Emotion `CacheProvider`. It does not leak to the Hub shell.
- All `@cmschassis/react-ui` and `@lis/lis-hub-lib` components consume the nearest `ThemeProvider` — once this is in place they all resolve from the same token set.

## Check: Is `lab-crs-app` doing this already?

Look at `lab-crs-app`'s `view-handler.tsx` — it should have the same pattern. If the Specimen Ack screen looks visually consistent, that's confirmation it has the `ThemeProvider` wrapping. Mirror it exactly for `lis-request-app`.

## Secondary issue: `sx` prop overrides vs theme tokens

If after adding the `ThemeProvider` some components still look off, check whether you're using hardcoded sizes anywhere (e.g. `height: 56px`, `fontSize: '14px'`). Replace those with theme token references:

```typescript
// Instead of hardcoded values:
sx={{ height: 56, fontSize: '14px' }}

// Use theme spacing/typography tokens:
sx={{ height: (theme) => theme.spacing(7), fontSize: 'body1.fontSize' }}
```

## One more thing to verify

Check your `craco.config.js` shared deps. `@mui/material` and `@lis/lis-hub-lib` must be declared as `singleton: true` singletons in your Module Federation config — otherwise you get two MUI instances and themes don't propagate correctly:

```javascript
// craco.config.js — shared section
shared: {
  '@mui/material': { singleton: true, requiredVersion: '^5' },
  '@lis/lis-hub-lib': { singleton: true },
  '@emotion/react': { singleton: true },
  '@emotion/styled': { singleton: true },
  // ...
}
```

If these aren't singletons and a second MUI instance is loaded, `ThemeProvider` from one instance won't affect components from the other — you'd see exactly the mismatched styles in the screenshot.