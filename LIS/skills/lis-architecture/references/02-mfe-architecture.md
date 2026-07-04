# 02  Micro-Frontend Architecture

## Orchestration Framework

The system uses **Webpack 5 Module Federation** configured via **CRACO** (`@craco/craco` 7.1.0).
There is no Single-SPA, iframes, or alternative MFE framework. The `@cmschassis/react-spa`
chassis library wraps the low-level federation mechanics into a plugin lifecycle
(`PluginHost`, `declare`, `activate`).

## Host / Remote Hierarchy

| Repo | Federation Name | Role | Port |
|---|---|---|---|
| `lis-hub-app` | `lisHubApp` | Level-0 Shell Host | 3000 |
| `lis-crs-common-app` | `lisCrsCommonApp` | Level-1 CRS Shell Remote | 3010 |
| `lab-crs-app` | `labCrsApp` | Level-2 CRS Plugin Sub-Remote | 3011 |

`lis-hub-app` fetches `remoteEntry.js` from `lis-crs-common-app`.
`lis-crs-common-app` fetches `remoteEntry.js` from `lab-crs-app`.

## lis-crs-common-app Plugin Lifecycle

`lis-crs-common-app` registers itself with the chassis shell using `cms-manifest.js`:

```js
// cms-manifest.js
export default {
  pluginId: "LIS_CRS",
  declare: () => { /* register routes, views, commands */ },
  activate: (context) => { /* mount UI into provided context */ }
};
```

The `declare()` phase registers metadata (routes, view IDs, command handlers).
The `activate()` phase mounts React components into DOM nodes provided by the shell.

## Scoped Emotion (CSS-in-JS Isolation)

Each plugin creates its own Emotion cache to prevent style bleed between MFEs:

```js
// in renderReactComponent (lis-crs-common-app)
const cache = createCache({ key: pluginId.toLowerCase(), container: shadowRoot });
<CacheProvider value={cache}>
  <App />
</CacheProvider>
```

`key: "lis_crs"` ensures all Emotion-generated class selectors are namespaced to the CRS plugin.

## Module Federation Config Pattern

Key CRACO / webpack config snippet:

```js
// craco.config.js (lis-hub-app)
new ModuleFederationPlugin({
  name: "lisHubApp",
  remotes: {
    lisCrsCommonApp: "lisCrsCommonApp@[__CRS_REMOTE_URL__]/remoteEntry.js",
  },
  shared: { react: { singleton: true }, "react-dom": { singleton: true } }
})
```

`__CRS_REMOTE_URL__` is a `__PLACEHOLDER__` substituted by nginx at container start.

## Cross-MFE Communication

The shell provides a `context` object to each plugin with three channels:

| Channel | API | Purpose |
|---|---|---|
| Commands | `context.command.execute("open.{viewId}", payload)` | Trigger navigation or actions |
| Events | `context.event.emit / .listen` | Broadcast/subscribe to cross-plugin events |
| Views | `context.ui.openView(viewId, label)` | Open a view panel in the shell tabs |

## Zustand Store Catalog

| Store | Location | Purpose |
|---|---|---|
| `useViewStore` | `lis-hub-app` | Open views / tabs lifecycle |
| `useAuthStore` | `lis-hub-app` | User identity, token, permissions |
| `useCommandStore` | `lis-hub-app` | Command bus registry |
| `useEventStore` | `lis-hub-app` | Cross-MFE event bus |
| `useThemeStore` | `lis-hub-app` | Light/dark theme |
| `useLabStore` | `lis-crs-common-app` | Current lab context |
| `usePatientStore` | `lis-crs-common-app` | Active patient context |
| `useOrderStore` | `lis-crs-common-app` | Active order state |
| `usePreferenceStore` | `lis-crs-common-app` | User UI preferences |
| `useCorrelationStore` | `lis-crs-common-app` | Correlation ID tracking |

## Shared Singleton Packages

Version mismatches on singleton packages cause runtime errors:

- `react` / `react-dom`  must match across all three frontend repos
- `@cmschassis/react-spa`  chassis plugin lifecycle
- `@cmschassis/react-ui`  MUI component library
- `@lis/lis-hub-lib`  LIS shared utilities
- `@mui/material` v5
- `zustand` 4.5.1
- `axios` 1.11.0

Always verify that remote app versions match the shell`s `package.json`.
