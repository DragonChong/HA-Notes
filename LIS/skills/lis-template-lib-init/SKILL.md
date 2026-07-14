---
name: lis-template-lib-init
description: >
  Initiates a standalone LIS Java library from lis-template-svc-lib by renaming
  template placeholders to a user-provided library name and Java package. Use when
  the user asks to create a library from the template, initialize a library project
  from lis-template-svc-lib, rename template references, bootstrap a new
  hk.org.ha.lis.* library module, or says "init library", "create library from
  template", or "/lis-template-lib-init".
---

# LIS Template Library Init

Rename a cloned or opened `lis-template-svc-lib` project into a new standalone
library. The user **must** supply the target library name and Java package before
any file edits.

## Required Inputs

Collect both values before changing files. Ask if either is missing.

| Input | Required | Example |
|---|---|---|
| Library name (Maven `artifactId` / repo identity) | Yes | `lis-message-parser` or `lis-message-parser-lib` |
| Java package | Yes | `hk.org.ha.lis.messageparser` |

Infer derived names from the library name when the user does not override them:

| Derived | Rule | Example |
|---|---|---|
| Repo name | Prefer `lis-<feature>-lib` if user gave artifact without `-lib` | `lis-message-parser-lib` |
| Maven `artifactId` | Prefer `lis-<feature>` without `-lib` unless user insisted otherwise | `lis-message-parser` |
| Config prefix | kebab-case feature segment | `message-parser` |
| Class prefix | PascalCase feature name | `MessageParser` |
| Sonar project key/name | Same as repo name | `lis-message-parser-lib` |

Do not invent the library purpose or business logic. After rename, leave sample
classes renamed or ask whether to keep Spring auto-config samples vs delete them
for a utility-only library.

## Rename Map

Apply consistently across the whole project:

| Template value | Replace with |
|---|---|
| `lis-template-svc-lib` | New repo / Sonar name |
| `lis-template` | New Maven `artifactId` |
| `hk.org.ha.lis.template` | New Java package |
| `TemplateLib` | New class prefix |
| `template-lib` | New config prefix |
| `TemplateStringUtils` | `<ClassPrefix>StringUtils` |

Search evidence after edits:

```bash
# PowerShell
Get-ChildItem -Recurse -File |
  Select-String -Pattern 'lis-template-svc-lib|lis-template|hk\.org\.ha\.lis\.template|TemplateLib|template-lib'
```

Only intentional wiki/README mentions of the *source* template may remain.
Otherwise zero residual template identifiers.

## Files That Must Be Amended

At minimum, update every file that currently contains `lis-template`,
`lis-template-svc-lib`, `hk.org.ha.lis.template`, `TemplateLib`, or `template-lib`:

### Build / quality / docs

| File | What to change |
|---|---|
| `pom.xml` | `artifactId`, `<name>`, description |
| `sonar-project.properties` | `sonar.projectKey`, `sonar.projectName` |
| `README.md` | Title, rename checklist examples, dependency snippet, usage |
| `docs/Release Notes/lis-template-1.0.0-SNAPSHOT.md` | Rename file to `<artifactId>-1.0.0-SNAPSHOT.md` and rewrite contents |

### Java sources (move packages + rename classes)

| From | To |
|---|---|
| `src/main/java/hk/org/ha/lis/template/...` | `src/main/java/<new-package>/...` |
| `src/test/java/hk/org/ha/lis/template/...` | `src/test/java/<new-package>/...` |
| `TemplateLibAutoConfiguration.java` | `<ClassPrefix>AutoConfiguration.java` |
| `TemplateLibProperties.java` | `<ClassPrefix>Properties.java` |
| `TemplateLibService.java` | `<ClassPrefix>Service.java` |
| `TemplateStringUtils.java` | `<ClassPrefix>StringUtils.java` |
| `TemplateLibAutoConfigurationTest.java` | `<ClassPrefix>AutoConfigurationTest.java` |
| `TemplateStringUtilsTest.java` | `<ClassPrefix>StringUtilsTest.java` |

Also update:

- every `package` / `import`
- `@ConfigurationProperties(prefix = "...")`
- `@ConditionalOnProperty(prefix = "...")`
- `@ComponentScan(basePackages = "...")`
- property keys in tests (`template-lib.enabled` → `<config-prefix>.enabled`)

### Spring Boot registration

| File | What to change |
|---|---|
| `src/main/resources/META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports` | Fully qualified renamed auto-config class |

Delete the empty old package directories after the move.

## Workflow

```
Task Progress:
- [ ] Step 1: Collect library name + Java package
- [ ] Step 2: Confirm derived artifactId / repo / class prefix / config prefix
- [ ] Step 3: Rename pom.xml + sonar-project.properties
- [ ] Step 4: Move and rename Java packages/classes + AutoConfiguration.imports
- [ ] Step 5: Rewrite README + rename release note
- [ ] Step 6: Grep for leftover template strings
- [ ] Step 7: Run mvnw clean test
- [ ] Step 8: Report rename summary + remaining user actions (NODE_VERSION, publish)
```

### Step 1 — Required inputs

If the user says only "create a library from the template", ask:

1. Target library name (`artifactId` / repo)
2. Target Java package (`hk.org.ha.lis....`)

Optional: confirm Spring-enabled vs utility-only. Default keep Spring auto-config
scaffold unless user asks to remove it.

### Step 2 — Confirm naming

Show a short confirmation table before editing, e.g.:

| Item | Value |
|---|---|
| Repo | `lis-message-parser-lib` |
| artifactId | `lis-message-parser` |
| Package | `hk.org.ha.lis.messageparser` |
| Class prefix | `MessageParser` |
| Config prefix | `message-parser` |

Proceed after the values are clear (explicit confirmation if ambiguous).

### Step 3–5 — Apply renames

Prefer file moves + content updates over leaving broken package paths.
Preserve sample behaviour (`greet`, `splitTrimmed`) unless the user asks to
replace with real domain code.

### Step 6 — Residual check

Fail the task if any of these remain in tracked project files (except
intentional "created from lis-template-svc-lib" wording):

- `lis-template-svc-lib` as the current project identity
- `artifactId>lis-template`
- package `hk.org.ha.lis.template`
- class names starting with `TemplateLib`
- config prefix `template-lib`

### Step 7 — Verify

```bash
mvnw.cmd clean test
```

Expect BUILD SUCCESS.

### Step 8 — Hand off

Tell the user to still:

1. Set GitHub Actions repo variable `NODE_VERSION=20`
2. Follow wiki `Create-New-Library` for snapshot / publish Development / tag from `release`

Do not push or commit unless the user asks.

## Out of Scope

- Creating the GitHub repository itself (user creates from template in UI)
- Configuring org-level Actions secrets
- Implementing real domain logic beyond rename/scaffold
- Adding the library into the `lis-svc-lib` monorepo

## Reference

Canonical manual guide: `lis-template-svc-lib.wiki/Create-New-Library.md`
