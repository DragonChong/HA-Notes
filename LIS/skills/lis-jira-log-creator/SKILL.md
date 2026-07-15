---
name: lis-jira-log-creator
description: >
  Prepares LIS change-request JIRA log content (Request Type, Summary, Background,
  Change Description, Justification, Target Completion Date) from user descriptions
  and technical context, then creates an Obsidian note in LIS/JIRA and updates
  LIS/JIRA/JIRA Log List. Use when the user asks to create a JIRA log, prepare a
  change request, document a LIS service change for JIRA submission, or says
  "request to create change". Also use when the user provides a JIRA ticket number
  to record on an existing log (update note `jira` property and JIRA Log List).
---

# LIS JIRA Log Creator

Prepare structured JIRA change-request content and persist it in the Obsidian vault
(`LIS/JIRA/`). Follow team email conventions (SM → SA change requests).

## Workflow

```
Task Progress:
- [ ] Step 1: Gather inputs
- [ ] Step 2: Draft all six sections
- [ ] Step 3: Confirm with user (if details are incomplete)
- [ ] Step 4: Create Obsidian note via MCP
- [ ] Step 5: Update JIRA Log List
- [ ] Step 6: When JIRA key is assigned — update note + list
```

### Step 1: Gather inputs

Collect from the user (or infer from code/wiki/conversation):

| Input | Required | Notes |
|---|---|---|
| Service name(s) | Yes | e.g. `lis-gcr-order-inf-svc` |
| What is changing | Yes | Bug fix, new service, enhancement |
| Technical details | Yes | Files, classes, APIs, DB tables, transaction types |
| Problem / current state | For fixes & revamps | Legacy behaviour, trigger names, race conditions |
| Reference JIRA tickets | No | Related history only (e.g. LIS-7291). Not the new CR key |
| JIRA log number | No at create | When known (e.g. LIS-10723), store in `jira` — see Step 6 |
| Target completion date | Yes | Ask if not provided |
| Request type | Default | `Change Request` unless user specifies otherwise |
| Priority | Default | `Medium` unless user specifies otherwise |

Explore the codebase or wiki when the user provides a service name but sparse detail.

### Step 2: Draft the six sections

Use [template.md](template.md) for structure and [examples.md](examples.md) for tone.

**Writing rules:**

1. **Request Type** — `Change Request` (default) or user-specified type; include **Priority** on the same line or immediately below.
2. **Request Summary** — One sentence. Start with a verb (`Fix`, `Develop`, `Enhance`). Name the service in backticks. Mirror email subject lines. **This string is the note title** (filename, frontmatter `title`, H1, and Request Summary body must match exactly — see Step 4).
3. **Background** — 2–4 short paragraphs: current state → problem or migration driver → scope of this change. Name legacy components (triggers, socket programs, tables) when relevant.
4. **Change Description** — Numbered list for distinct work items; use sub-bullets for file/class/API specifics. Include Mermaid diagrams only when architecture clarity helps (new services, inbound/outbound flows).
5. **Justification** — 1–2 paragraphs on business/technical impact: reliability, data integrity, DHP migration, load handling.
6. **Target Completion Date** — Format: `Dth Mon YYYY` (e.g. `29th May, 2026`, `17th Apr 2026`).

Mark unknowns as `[TBD]` and ask the user before writing to Obsidian.

### Step 3: Present draft

Show the full draft in chat before creating the Obsidian note, unless the user explicitly asks to skip review.

### Step 4: Create Obsidian note

Use the **user-obsidian** MCP server (`write_note`) when it is available in the current
environment. Read tool schemas before calling.

If no such MCP is connected — e.g. in Cowork, which mounts the vault directly as a
filesystem folder — write the note directly with the file-editing tools instead: create
`<vault-root>/LIS/JIRA/<Request Summary>.md` containing the YAML frontmatter block followed by
the Markdown body, equivalent to what `write_note` would produce.

**Note path:** `LIS/JIRA/<Request Summary>.md`

**Title = Request Summary (exact match):**

- File name (without `.md`), frontmatter `title`, `#` H1, and the **Request Summary** section body must be **identical** to the Request Summary string from Step 2
- Do **not** shorten, rephrase, or drop the leading verb for the filename
- Replace only characters illegal on the filesystem: `/` and `\` → `-`
- Example path: `LIS/JIRA/Fix Race Condition in lis-gcr-order-inf-svc.md` when that is the full Request Summary

**Frontmatter:**

```yaml
---
title: "<Request Summary — exact>"
tags:
  - jira-log
  - lis
request_type: Change Request
priority: Medium
services:
  - lis-gcr-order-inf-svc
target_completion_date: 2026-05-29
status: draft
created: 2026-07-02
jira:            # LIS-XXXXX when assigned; leave empty until then
reference_jira: []  # related tickets only — not the CR key itself
design_status: draft
---
```

| Property | Purpose |
|---|---|
| `title` | Exact Request Summary (same as note filename / H1) |
| `jira` | This change request’s JIRA log number (e.g. `LIS-10723`). Empty until assigned |
| `reference_jira` | Related / background tickets only (not `jira`) |

**Body:** Use the section headings from [template.md](template.md). Add `## Reference Logs` only when reference JIRA tickets exist.

Call `write_note` with `path`, `content`, and `frontmatter`.

### Step 5: Update JIRA Log List

1. `read_note` → `LIS/JIRA/JIRA Log List.md`
2. If empty or missing the table header, initialize using the list template below
3. If the header is missing the **JIRA** column, migrate the header and every existing row to include it (empty cell when unknown)
4. `patch_note` to prepend a new row after the table header row (newest first)

If the user-obsidian MCP is not available, use the file-editing tools directly instead:
read `LIS/JIRA/JIRA Log List.md`, initialize/migrate as above, then insert the new row
directly after the header row (newest first).

**List template** (initialize when file is empty):

```markdown
# JIRA Log List

Index of LIS change-request JIRA logs. Newest entries at the top.

| Created | JIRA | Summary | Service | Type | Priority | Target Date | Status | Note |
|---|---|---|---|---|---|---|---|---|
```

**New row format:**

```markdown
| 2026-07-02 |  | Fix Race Condition in lis-gcr-order-inf-svc | lis-gcr-order-inf-svc | Change Request | Medium | 29th May, 2026 | draft | [[Fix Race Condition in lis-gcr-order-inf-svc]] |
```

- **JIRA** column: the value of note frontmatter `jira` (e.g. `LIS-10723`), or empty if not yet assigned
- **Note** column: wikilink whose target is the **exact Request Summary** (same as note title / filename) — Obsidian resolves by title
- **Summary** column: same Request Summary text (may omit backticks for table readability if needed, but keep wording identical)

### Step 6: Record JIRA log number (when assigned)

When the user provides the JIRA ticket for an existing log (or it is known at create time):

1. Set note frontmatter `jira: LIS-XXXXX` (do not put this key in `reference_jira`)
2. Update the matching row’s **JIRA** cell in `LIS/JIRA/JIRA Log List.md`
3. If the note was created in the same run with a known key, write `jira` and the list cell in Steps 4–5 — Step 6 is then a no-op

## Obsidian MCP quick reference

| Action | Tool | Key args | Direct-file fallback (no MCP) |
|---|---|---|---|
| Read list or note | `read_note` | `path` | `Read` on the vault file path |
| Create log note | `write_note` | `path`, `content`, `frontmatter` | `Write` the file with YAML frontmatter + Markdown body |
| Add / update list row | `patch_note` | `path`, `oldString`, `newString` | `Edit` to insert or update the row |
| Update note `jira` | `patch_note` / frontmatter edit | `path` | Edit YAML `jira:` on the note |
| Search existing logs | `search_notes` | `query`, `limit` | `Grep`/`Glob` over `LIS/JIRA/` |

Paths are relative to vault root (e.g. `LIS/JIRA/...`). In Cowork, the vault root is the
mounted folder, and file tools (`Read`/`Write`/`Edit`) operate on it directly — no MCP
required.

## Quality checklist

- [ ] Summary is one clear sentence naming the service
- [ ] Note filename, `title`, H1, and Request Summary body are exactly the same string
- [ ] Frontmatter includes `jira` (value or empty) distinct from `reference_jira`
- [ ] Background explains *why*, not just *what*
- [ ] Change Description names concrete artefacts (classes, endpoints, tables)
- [ ] Justification states operational impact
- [ ] Target date uses team format (`Dth Mon YYYY`)
- [ ] Obsidian note created under `LIS/JIRA/`
- [ ] JIRA Log List row added with **JIRA** column + wikilink to exact title
- [ ] If JIRA key known: note `jira` and list **JIRA** cell both set

## Additional resources

- Section templates: [template.md](template.md)
- Full examples from team emails: [examples.md](examples.md)
- CP3 design (downstream): [generate-design](../generate-design/SKILL.md) → [design-review-pptx](../design-review-pptx/SKILL.md)
