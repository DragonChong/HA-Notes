---
name: lis-svc-lib-release-notes
description: >
  Creates release note documents and updates README.md for libraries in lis-svc-lib
  (data-source, audit-logging, lis-common, core-api). Use this skill whenever the
  user asks to "create a release note", "write release notes", "document a new version",
  or "update the README" for any library in lis-svc-lib — even if the request is phrased
  casually like "write up the changes for 1.1.8" or "document this fix". Also triggers
  when the user provides a diff, describes code changes, or shows a completed implementation
  and wants it documented as a versioned release.
---

# LIS Svc Lib — Release Notes & README Skill

This skill covers two tightly linked tasks that always go together when a library version ships:

1. **Create the release note file** — a structured Markdown document in the library's `docs/Release Notes/` directory
2. **Update `README.md`** — bump the version in the Latest Versions table, Release History section, and Getting Started pom.xml snippet

---

## Workspace Layout

```
lis-svc-lib/
├── README.md                          ← three places to update per release
├── data-source/
│   └── docs/Release Notes/
│       └── data-source-<version>.md
├── audit-logging/
│   └── docs/Release Notes/
│       └── audit-logging-<version>.md
├── lis-common/
│   └── docs/Release Notes/
│       └── lis-common-<version>.md
└── core-api/
    └── docs/Release Notes/
        └── core-api-<version>.md
```

---

## Step 1 — Gather Context

Before writing anything, collect:

- **Library name** — one of `data-source`, `audit-logging`, `lis-common`, `core-api`
- **New version number** — e.g. `1.1.8`
- **Previous version** — read from `README.md` Latest Versions table (or ask)
- **What changed** — from a diff, code attachment, description, or conversation history

If the user provides a code diff or attaches files, read them before writing. The release note quality depends on understanding the actual change, not just its label.

Also read the previous version's release note (if it exists) to understand the document style and any relevant context that carries forward.

---

## Step 2 — Create the Release Note File

**File path:** `<library>/docs/Release Notes/<library>-<version>.md`

**Template:**

```markdown
# Release Notes - <Library Display Name> v<version>

**Release Date:** <today's date, e.g. June 2, 2026>
**Version:** <version>
**Status:** Production Ready ✅

---

## Overview

<One paragraph: what problem this version solves and why it matters.>

### Key Highlights

- ✅ **<Feature/Fix Name>** — <one-line summary>
- ✅ **Zero Breaking Changes** — Fully backward compatible   ← include only if true

---

## What's Changed

### <Section per significant change>

**Affected Method/Class/File:** ...

**Root Cause / Problem Solved:** ...

**Solution:** ...

**Before / After** (use a table when the contrast is clear):

| Scenario | v<old> | v<new> |
|---|---|---|
| <case> | <old behaviour> | <new behaviour> |

---

## Files Modified / Created

| File | Change |
|---|---|
| `<package.ClassName>` | <what changed> |

**Diff (key line):**
\```diff
- old line
+ new line
\```

---

## Existing APIs — No Change   ← omit if not relevant

| Endpoint | Description |
|---|---|
| ... | ... |

---

## Breaking Changes

**None.** Version <version> is fully backward compatible with all previous versions.
<OR describe what broke and migration steps.>

---

## Known Issues

None.  ← or list them

---

## Upgrade Instructions

### Step 1: Update Dependency

\```xml
<dependency>
    <groupId>hk.org.ha.lis</groupId>
    <artifactId><library></artifactId>
    <version><version></version>
</dependency>
\```

<Add any additional migration steps if there are breaking changes.>

---

## Contributors

- LIS Development Team
- GitHub Copilot (Implementation and Documentation)

---

**Version:** <version>
**Release Date:** <today's date>
**Status:** Production Ready ✅
```

### Writing guidance

- **Overview paragraph** — state the concrete problem first, then the solution. Avoid vague openers like "This version improves..."
- **Root cause sections** — when fixing a bug, explain *why* it was wrong (the key insight), not just what the fix was. A reader unfamiliar with the code should be able to follow.
- **Before/After tables** — use them whenever the behaviour change is per-scenario. They make regressions obvious.
- **Diff blocks** — for small fixes (1–5 lines), include the actual diff. It anchors the change precisely.
- **Omit sections with nothing to say** — e.g. skip "Existing APIs" if there are no relevant APIs, skip "Files Created" if only existing files were modified.

---

## Step 3 — Update README.md

The root `README.md` has **three places** to update. Always update all three in a single edit operation.

### Place 1 — Latest Versions table

```markdown
| **<library>** | <new-version> | [Release Notes](./<library>/docs/Release%20Notes/<library>-<new-version>.md) | <one-line key feature summary> |
```

Replace the entire row for that library.

### Place 2 — Release History section

Add a new bullet **above** the previous latest entry and remove `(Latest)` from the old one:

```markdown
- **<new-version>** (Latest) - <same summary as table>
  - [Release Notes](./<library>/docs/Release%20Notes/<library>-<new-version>.md)
- **<old-version>** - <old summary, unchanged>
  - [Release Notes](./<library>/docs/Release%20Notes/<library>-<old-version>.md)
```

### Place 3 — Getting Started pom.xml snippet

```xml
<!-- For <library> -->
<dependency>
    <groupId>hk.org.ha.lis</groupId>
    <artifactId><library></artifactId>
    <version><new-version></version>
</dependency>
```

Replace just the `<version>` line for that library's block.

---

## Quality Check

Before finishing, verify:

- [ ] Release note file exists at the correct path with the correct filename
- [ ] Release date matches today
- [ ] All three README locations updated to the new version
- [ ] Release note links in README use `%20` encoding for the space in `Release%20Notes`
- [ ] Previous version entry in Release History no longer has `(Latest)`
- [ ] Version in pom.xml snippet matches the new version
