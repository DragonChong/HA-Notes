---
name: test-scaffold
description: Generate a Jest + React Testing Library test scaffold for a Registration screen component in lis-request-app. Use this when creating or extending test files for any Registration component, hook, or utility. Produces a correctly wired test file with mocked apiContext and architecture rule assertions.
argument-hint: "[ComponentName or path to component file]"
---

# Test Scaffold Generator

Generate a Jest + React Testing Library test file for the specified Registration component.

---

## Step 1 — Read the component

Read the component file to understand:
- Props interface
- What it renders (structure, MUI components used)
- Any hooks or context it consumes
- Whether it wraps a `@lis/lis-hub-lib` component

---

## Step 2 — Check for existing test file

If a `.test.tsx` file already exists alongside the component, **extend it** — do not replace it. Add only the missing test cases.

---

## Step 3 — Generate the test file

Use this structure:

```tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { {ComponentName} } from './{ComponentName}';
import { RegistrationContext } from '../context/RegistrationContext';
import { mockApiContext } from '../../test-utils/mockApiContext';

// Standard context wrapper for all Registration component tests
const renderWithContext = (ui: React.ReactElement) =>
  render(
    <RegistrationContext.Provider value={{ apiContext: mockApiContext }}>
      {ui}
    </RegistrationContext.Provider>
  );

describe('{ComponentName}', () => {

  describe('rendering', () => {
    it('renders without crashing', () => {
      renderWithContext(<{ComponentName} />);
      // Assert at least one stable element is present
    });

    it('is visible by default', () => {
      const { container } = renderWithContext(<{ComponentName} />);
      expect(container.firstChild).not.toHaveStyle('display: none');
    });

    it('hides via display:none when isVisible=false — not unmounted', () => {
      // ARCHITECTURE RULE: panels must use display:none, never conditional unmount
      const { container, rerender } = renderWithContext(
        <{ComponentName} isVisible={false} />
      );
      expect(container.firstChild).toHaveStyle('display: none');
      // Component is still in the DOM (not unmounted)
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('props', () => {
    // Add one test per significant prop
    // Example:
    // it('passes disabled prop to underlying input', () => { ... });
  });

  describe('user interactions', () => {
    // Add one test per meaningful user action
    // Example:
    // it('calls onChange when input value changes', async () => { ... });
  });

  describe('shared library integration', () => {
    // If this component wraps a @lis/lis-hub-lib component, add:
    // it('renders HkidInput from lis-hub-lib', () => { ... });
  });

});
```

---

## Step 4 — mockApiContext reference

The test utility `src/test-utils/mockApiContext.ts` should follow this shape. Create it if it does not exist:

```typescript
// src/test-utils/mockApiContext.ts
export const mockApiContext = {
  request: {
    post: jest.fn().mockResolvedValue({ data: { result: null, code: 0 } }),
  },
  dictionary: {
    get: jest.fn().mockReturnValue({}),
  },
  session: {
    getHospital: jest.fn().mockReturnValue('QEH'),
    getUserKey: jest.fn().mockReturnValue('TESTUSER'),
  },
  auth: {
    hasRight: jest.fn().mockReturnValue(true),
  },
  // extend as needed per component
} as any;
```

---

## Step 5 — Run the tests

Run `npm test -- --testPathPattern={ComponentName} --watchAll=false` and report:
- Pass / fail count
- Any setup errors to fix before handing back

---

## Architecture assertions to always include

Every test file must include the display:none visibility test (Step 3, third test). This is a non-negotiable architecture rule verification — panels must never conditionally unmount.
