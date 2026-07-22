---
name: sonar-scan-fix
description: >
  Runs sonar-scanner for the current LIS project, checks SonarQube issues via MCP
  (new code / changed files only), and fixes those issues until the subset is clean.
  Use when the user asks to run a SonarQube scan, fix Sonar issues, clean new-code
  findings, invoke /sonar-scan-fix, or manually verify quality after code changes.
disable-model-invocation: true
---

# SonarQube scan and fix (new code only)

Manual workflow: scan the project, inspect **new-code** issues with SonarQube MCP, fix only that subset, re-check until clean.

## Scope rules (hard)

- Fix **only** issues in Sonar’s **new code period** (`in_new_code_period=true`).
- Prefer intersecting with **git-changed source files** in the project that has `sonar-project.properties`.
- Do **not** fix the whole-project backlog.
- “Clean” = zero open issues in that new-code / changed-file subset.

## Prerequisites

- Workspace (or a workspace root) contains `sonar-project.properties` with `sonar.projectKey`
- `sonar-scanner` on PATH
- MCP server `user-sonarqube` available (`issues`, optionally `quality_gate_status`, `show_rule` if present)
- Java binaries built when analyzing Java (`sonar.java.binaries`, often `**/target/classes`)

## Workflow

Copy and track:

```
Sonar scan-fix:
- [ ] 1. Resolve project root + project key
- [ ] 2. Collect git changed source files
- [ ] 3. Run sonar-scanner
- [ ] 4. Wait for server processing if needed
- [ ] 5. Fetch new-code open issues via MCP
- [ ] 6. Intersect with changed files (when non-empty)
- [ ] 7. Fix listed issues only
- [ ] 8. Re-scan + re-check until subset is clean (max 5 cycles)
```

### 1. Resolve project

1. Find `sonar-project.properties` under the active workspace roots (prefer the root the user is working in if multiple).
2. Read `sonar.projectKey` (e.g. `lis-svc-lib`, `lis-template-svc`).
3. If missing, stop and tell the user to add `sonar.projectKey`.

### 2. Collect changed files

From the project root:

```powershell
git diff --name-only
git diff --cached --name-only
git diff --name-only origin/<default-branch>...HEAD
```

If those are empty, use `git status --porcelain`.

Exclude `.scannerwork/`, `target/`, `.git/`, `node_modules/`. Prefer source extensions (`.java`, `.xml`, `.yml`, `.yaml`, `.properties`, etc.).

If there are **no** source changes, report that and **stop** (no scan needed) unless the user explicitly asks to scan anyway.

### 3. Run scanner

In the project root:

```powershell
sonar-scanner
```

Prefer `SONAR_TOKEN` / `SONAR_HOST_URL` if set. Do not print tokens. On failure, show the scanner error and stop.

Typical host: `https://hatool-sonarqube.home`.

### 4. Fetch issues via MCP

Call MCP server `user-sonarqube`, tool `issues`:

```json
{
  "project_key": "<sonar.projectKey>",
  "resolved": false,
  "in_new_code_period": true,
  "page_size": "100"
}
```

When changed files exist, also pass them in `files` (or filter client-side to those paths).

Optional: `quality_gate_status` for context — do **not** expand fix scope from gate noise alone.

### 5. Present findings

If none: report **new-code subset clean** and stop.

If any: show a table sorted by severity then file/line:

| File | Line | Severity | Rule | Message |
| --- | --- | --- | --- | --- |

### 6. Fix

For each listed issue:

1. If a rule key is available and MCP exposes rule lookup, fetch remediation guidance first.
2. Apply a **minimal** fix; do not refactor unrelated code.
3. Do not “clean up” other Sonar debt outside the list.

### 7. Verify loop

After fixes:

1. Re-run `sonar-scanner`
2. Re-query MCP `issues` with the same new-code filters
3. Repeat fix → scan → check until the subset is empty, or after **5** cycles explain what remains (false positive / needs product decision)

## Multi-root workspaces

If several roots have `sonar-project.properties`, scan the one matching the user’s recent edits / stated project. If unclear, ask which project key to use.

## Out of scope

- Enabling/debugging the Cursor `stop` hook automation
- Mass-fixing historical Sonar debt outside new code
- Changing SonarQube server quality profiles or new-code period settings
