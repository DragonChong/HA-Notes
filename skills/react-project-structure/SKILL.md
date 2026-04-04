---
name: react-project-structure
description: >
  Opinionated guide for scaffolding and organizing modern ReactJS/TypeScript applications
  using a feature-based (domain-driven) folder hierarchy. Use this skill whenever the user
  asks to create a new React app, scaffold a project, set up a folder structure, reorganize
  an existing React codebase, or asks about React project architecture or best practices
  for file organization. Also trigger when the user says things like "set up a new React project",
  "create the folder structure for my app", "how should I organize my React code",
  "bootstrap a React app", "init a frontend project", or discusses separating features,
  shared components, layouts, or pages. This skill applies to both Vite + React and
  Next.js projects, and to any React + TypeScript codebase regardless of meta-framework.
---

# React Project Structure Skill

This skill defines a standard, feature-based project hierarchy for modern React/TypeScript applications. It prioritizes clarity, scalability, and team onboarding — every top-level folder has a single, obvious purpose.

## When to Apply

- Creating a new React/TypeScript project from scratch
- Scaffolding folder structure for an existing or greenfield app
- Reviewing or refactoring a project's file organization
- Advising on where new code should live
- Setting up a monorepo's frontend package structure

## The Standard Structure

Always use this hierarchy as the starting point. Adapt as needed, but preserve the philosophy: **features own their domain; top-level folders are explicit and flat.**

```
src/
├── assets/            # Global images, fonts, and icons
├── components/        # Global, reusable UI components (Buttons, Inputs, Modals)
├── config/            # Environment variables and global constants
├── features/          # The core of the app — one folder per domain
│   └── <feature>/     # e.g., auth, dashboard, tickets
│       ├── api/       # Feature-specific API calls
│       ├── components/# Feature-specific UI components
│       ├── hooks/     # Feature-specific custom hooks
│       ├── types/     # Feature-specific TypeScript interfaces
│       └── index.ts   # Public API barrel export for the feature
├── hooks/             # Global, reusable hooks (useDebounce, useLocalStorage)
├── layouts/           # Page wrappers (MainLayout, AuthLayout)
├── lib/               # Third-party library configurations (axios, react-query)
├── pages/             # Route components that compose features together
├── services/          # Global API / external service logic
├── stores/            # Global state management (Zustand, Redux, etc.)
├── types/             # Global TypeScript definitions
└── utils/             # Global helper functions (formatDate, validation)
```

## Folder Responsibilities

### `assets/`
Static files consumed by the app: images, fonts, SVGs, icons. Not for data files or configs.

### `components/`
Truly reusable, cross-feature UI primitives. Think design-system level: Button, Input, Modal, Table, Badge, Tooltip. A component belongs here only if it is used (or will be used) by two or more features. One-off UI stays inside its feature.

### `config/`
App-wide configuration: environment variable accessors, feature flags, API base URLs, theme constants. Keep this thin — it's a lookup layer, not a logic layer.

### `features/`
The heart of the application. Each sub-folder represents a self-contained business domain.

**Internal structure of a feature:**

| Folder       | Purpose |
|-------------|---------|
| `api/`       | Functions that call backend endpoints for this feature |
| `components/`| UI components used only within this feature |
| `hooks/`     | Custom hooks encapsulating feature-specific logic |
| `types/`     | TypeScript interfaces and type aliases scoped to the feature |
| `index.ts`   | Barrel file — the only thing other features import from |

**Rules for features:**
- Other features import ONLY through `index.ts`, never reach into internal files.
- A feature may import from `components/`, `hooks/`, `utils/`, `lib/`, `services/`, `stores/`, and `types/` at the top level (shared code).
- A feature should NOT import directly from another feature's internals. If two features need the same logic, promote it to a shared top-level folder.
- Feature-specific state (e.g., a Zustand slice) lives inside the feature folder in a `store/` sub-folder, not in the top-level `stores/`.

### `hooks/`
Global custom hooks reusable across features: `useDebounce`, `useLocalStorage`, `useMediaQuery`, `useClickOutside`. If a hook is specific to one feature, it belongs in that feature's `hooks/` folder.

### `layouts/`
Page-level wrappers that define the structural shell: `MainLayout` (sidebar + header + content area), `AuthLayout` (centered card), `DashboardLayout`, etc. Layouts are composed by `pages/` — they don't contain business logic.

### `lib/`
Configuration and initialization of third-party libraries. Examples: Axios instance with interceptors, React Query client setup, i18n initialization, Sentry config. This is where you set up the tools; `services/` is where you use them.

### `pages/`
Route-level components that wire features together. Each page composes one or more feature components inside a layout. Pages are thin — they import from features, apply a layout, and handle route params. If using Next.js App Router, this maps to the `app/` directory convention.

### `services/`
Cross-feature API logic and external service integrations. Examples: a generic HTTP client wrapper, WebSocket manager, analytics service, notification service. The distinction from `lib/`: `lib/` configures a tool, `services/` provides an abstraction layer that features consume.

### `stores/`
Global state that spans multiple features: auth session, theme, user preferences, global notifications. Feature-specific state does NOT go here — it stays inside `features/<name>/store/`.

### `types/`
Global TypeScript types shared across the app: API response wrappers, utility types (`Nullable<T>`, `AsyncState<T>`), shared entity interfaces. Feature-specific types stay in their feature's `types/` folder.

### `utils/`
Pure utility functions with no side effects: `formatDate`, `cn()` (classname merger), `slugify`, validation helpers, math utilities. If a utility is feature-specific, keep it in the feature folder.

## Decision Guide: "Where does this code go?"

Use this flowchart when deciding file placement:

1. **Is it specific to one feature?** → Put it inside `features/<name>/`
2. **Is it a reusable UI primitive (Button, Modal, Table)?** → `components/`
3. **Is it a reusable hook?** → `hooks/`
4. **Is it a pure helper function?** → `utils/`
5. **Is it third-party library setup?** → `lib/`
6. **Is it a cross-feature API/service abstraction?** → `services/`
7. **Is it global app state?** → `stores/`
8. **Is it a page-level structural wrapper?** → `layouts/`
9. **Is it a route entry point?** → `pages/`
10. **Is it a global TypeScript type?** → `types/`
11. **Is it a static file (image, font)?** → `assets/`

## Conventions

### Absolute Imports
Configure a path alias in `tsconfig.json` so imports are clean and stable:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

Usage:
```ts
import { Button } from '@/components/Button';
import { useAuth } from '@/features/auth';
import { formatDate } from '@/utils/formatDate';
```

### Naming
- Components: `PascalCase.tsx` (e.g., `LoginForm.tsx`)
- Hooks: `camelCase.ts` prefixed with `use` (e.g., `useAuth.ts`)
- Utils/helpers: `camelCase.ts` (e.g., `formatDate.ts`)
- Types: `PascalCase` for interfaces/types, `camelCase.ts` for files
- Constants: `UPPER_SNAKE_CASE` for values, `camelCase.ts` for files

### Test Colocation
Place test files next to the code they test:
```
features/auth/hooks/useAuth.ts
features/auth/hooks/useAuth.test.ts
```

### Barrel Export Pattern
Each feature exposes a clean public API:

```ts
// features/auth/index.ts
export { LoginForm } from './components/LoginForm';
export { useAuth } from './hooks/useAuth';
export type { User, AuthState } from './types';
```

## Scaffolding a New Feature

When adding a new feature (e.g., `tickets`), create this structure:

```
features/tickets/
├── api/
│   └── ticketApi.ts
├── components/
│   └── TicketList.tsx
├── hooks/
│   └── useTickets.ts
├── types/
│   └── index.ts
└── index.ts
```

Start minimal. Not every feature needs every sub-folder from day one — add `store/` only when local state management is needed, add `utils/` only when feature-specific helpers emerge.

## Anti-Patterns to Avoid

- **Dumping everything in `components/`** — If a component is used by only one feature, it belongs in that feature's `components/` folder, not the global one.
- **Deep nesting** — Keep features to one level of sub-folders. If a feature is getting deeply nested, split it into two features.
- **Cross-feature internal imports** — Never import from `features/auth/hooks/useAuth.ts` directly. Always go through `features/auth/index.ts`.
- **Feature-specific state in global `stores/`** — Zustand slices or Redux slices for a specific feature stay inside that feature folder.
- **Barrel chains** — Avoid re-exporting barrels from other barrels. One level of barrel per feature is enough; deeper chains hurt tree-shaking and bundle size.
- **Mixing concerns in `lib/`** — `lib/` is for configuration only. Business logic that uses a library goes in `services/` or within a feature.
