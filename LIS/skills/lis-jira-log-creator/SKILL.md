---
name: lis-jira-log-creator
description: >
  Prepares LIS change-request JIRA log content (Request Type, Summary, Background,
  Change Description, Justification, Target Completion Date) from user descriptions
  and technical context, then creates an Obsidian note in LIS/JIRA. The index
  LIS/JIRA/JIRA Log List.base picks up new notes automatically from frontmatter.
  Use when the user asks to create a JIRA log, prepare a change request, document
  a LIS service change for JIRA submission, or says "request to create change".
  Also use when the user provides a JIRA ticket number to set on an existing note
  (`jira` property).
---

# LIS JIRA Log Creator

Prepare structured JIRA change-request content and persist it in the Obsidian vault
(`LIS/JIRA/`). Follow team email conventions (SM → SA change requests).

The index is an Obsidian Base: `LIS/JIRA/JIRA Log List.base`. It lists notes under
`LIS/JIRA/` tagged `jira-log` (excluding `index`). **Do not maintain a Markdown table** —
correct frontmatter on the note is enough for the Base to show the row.

## Workflow

```
Task Progress:
- [ ] Step 1: Gather inputs
- [ ] Step 2: Draft all six sections
- [ ] Step 3: Confirm with user (if details are incomplete)
- [ ] Step 4: Create Obsidian note via MCP
- [ ] Step 5: Confirm note appears in JIRA Log List.base (frontmatter only)
- [ ] Step 6: When JIRA key is assigned — set note `jira` property
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
2. **Request Summary** — One sentence. Start with a verb (`Fix`, `Develop`, `Enhance`). Name the service in backticks. Mirror email subject lines. **This string is the note title** (frontmatter `title`, H1, and Request Summary body must match exactly; filename uses the same string with `/` `\` sanitized — see Step 4).
3. **Background** — Prefer **one focused paragraph** (two only if needed). Follow this style so the reason for the ticket is unmistakable:
   - Start with the **operational context** in the named service (what runs today — e.g. message processing, scheduler, table).
   - Name **concrete artefacts** with expansions in parentheses: message types (`A40 (Merge HKID)`), statuses (`FAILED`, `RETRY`, `PROCESSING`), columns/tables.
   - State the **current gap or risk** in the same flow (what is stored / checked today vs what is missing).
   - End with an **explicit why-this-ticket sentence** — what must be done and the outcome it ensures  
     (e.g. “New column has to be added in order to ensure A40 / A45 / A47 messages are processed sequentially.”).
   - **Do not** lead with parent JIRA keys (“Under LIS-XXXX…”) or abstract migration prose; put related tickets in Reference Logs.
   - Avoid burying the ask in architecture overview; the last sentence should make the request purpose clear without reading Change Description.
4. **Change Description** — Numbered list for distinct work items; use sub-bullets for file/class/API specifics. Include Mermaid diagrams only when architecture clarity helps (new services, inbound/outbound flows). For Service Requests (DDL), a short bullet naming table/column/index is enough.
5. **Justification** — 1 short paragraph on the **operational outcome** enabled by the change (sequential processing, data integrity, performance). Reuse the same named artefacts as Background; avoid vague “modernize architecture” when a concrete outcome exists.
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

- Frontmatter `title`, `#` H1, and the **Request Summary** section body must be **identical** to the Request Summary string from Step 2 (do not shorten or rephrase)
- **Filename** is that same string, with only filesystem-illegal characters replaced: `/` and `\` → `-` (e.g. `A40/A45/A47` → `A40-A45-A47`, `Sybase/PostgreSQL` → `Sybase-PostgreSQL`). Do not otherwise shorten or drop the leading verb
- Content `title` / H1 keep the original Request Summary text (with `/` if present)
- Example path: `LIS/JIRA/Fix Race Condition in lis-gcr-order-inf-svc.md` when that is the full Request Summary

**Frontmatter** (these properties are the Base columns):

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

| Property | Purpose | Base column |
|---|---|---|
| `created` | Log creation date | Created |
| `jira` | This CR’s JIRA key (e.g. `LIS-10723`) | JIRA |
| `title` | Exact Request Summary | Summary |
| `services` | Service name(s) | Service |
| `request_type` | e.g. Change Request | Type |
| `priority` | e.g. Medium | Priority |
| `target_completion_date` | ISO date in YAML | Target Date |
| `status` | e.g. draft | Status |
| `file.name` | Note filename (auto) | Note |
| `reference_jira` | Related tickets only — not shown as JIRA column | — |

**Do not** add the `index` tag to log notes (reserved for archived Markdown indexes).

**Body:** Use the section headings from [template.md](template.md). Add `## Reference Logs` only when reference JIRA tickets exist.

Call `write_note` with `path`, `content`, and `frontmatter`.

### Step 5: Confirm JIRA Log List.base

The Base at `LIS/JIRA/JIRA Log List.base` auto-includes notes that:

- live in `LIS/JIRA/`
- have tag `jira-log`
- are Markdown (`file.ext == "md"`)
- do not have tag `index`

After creating the note, **no list-file edit is required**. Optionally open the Base to confirm the new row (views: **All logs**, **With JIRA key**).

If the Base file is missing, recreate it from the schema below (do not revive `JIRA Log List (old).md` as the live index).

**Base schema** (`LIS/JIRA/JIRA Log List.base`):

```yaml
filters:
  and:
    - file.inFolder("LIS/JIRA")
    - file.hasTag("jira-log")
    - 'file.ext == "md"'
    - '!file.hasTag("index")'

properties:
  created:
    displayName: Created
  jira:
    displayName: JIRA
  title:
    displayName: Summary
  services:
    displayName: Service
  request_type:
    displayName: Type
  priority:
    displayName: Priority
  target_completion_date:
    displayName: Target Date
  status:
    displayName: Status
  file.name:
    displayName: Note

views:
  - type: table
    name: All logs
    order:
      - created
      - jira
      - title
      - services
      - request_type
      - priority
      - target_completion_date
      - status
      - file.name
    sort:
      - property: created
        direction: DESC

  - type: table
    name: With JIRA key
    filters:
      and:
        - "!jira.isEmpty()"
    order:
      - created
      - jira
      - title
      - services
      - request_type
      - priority
      - target_completion_date
      - status
      - file.name
    sort:
      - property: created
        direction: DESC
```

### Step 6: Record JIRA log number (when assigned)

When the user provides the JIRA ticket for an existing log (or it is known at create time):

1. Set note frontmatter `jira: LIS-XXXXX` (do not put this key in `reference_jira`)
2. The Base **JIRA** column updates automatically — do not edit `JIRA Log List.base` or any Markdown index table
3. If the note was created in the same run with a known key, set `jira` in Step 4 — Step 6 is then a no-op

## Obsidian MCP quick reference

| Action | Tool | Key args | Direct-file fallback (no MCP) |
|---|---|---|---|
| Read note / Base | `read_note` | `path` | `Read` on the vault file path |
| Create log note | `write_note` | `path`, `content`, `frontmatter` | `Write` the file with YAML frontmatter + Markdown body |
| Update note `jira` | `patch_note` / frontmatter edit | `path` | Edit YAML `jira:` on the note |
| Search existing logs | `search_notes` | `query`, `limit` | `Grep`/`Glob` over `LIS/JIRA/` |
| Index | — | — | Open `LIS/JIRA/JIRA Log List.base` (auto from note properties) |

Paths are relative to vault root (e.g. `LIS/JIRA/...`). In Cowork, the vault root is the
mounted folder, and file tools (`Read`/`Write`/`Edit`) operate on it directly — no MCP
required.

## Quality checklist

- [ ] Summary is one clear sentence naming the service
- [ ] `title`, H1, and Request Summary body are the exact same Request Summary string
- [ ] Filename matches Request Summary except `/` `\` → `-`
- [ ] Frontmatter includes all Base columns (`created`, `jira`, `title`, `services`, `request_type`, `priority`, `target_completion_date`, `status`)
- [ ] Tags include `jira-log` (and not `index`)
- [ ] Background names concrete artefacts and ends with an explicit why-this-ticket sentence
- [ ] Background does not lead with parent JIRA keys or bury the ask
- [ ] Change Description names concrete artefacts (classes, endpoints, tables)
- [ ] Justification states operational impact in the same concrete terms as Background
- [ ] Target date uses team format (`Dth Mon YYYY`) in the body; ISO date in frontmatter
- [ ] Obsidian note created under `LIS/JIRA/`
- [ ] No Markdown table edit to the old index — Base picks up the note
- [ ] If JIRA key known: note `jira` set

## Additional resources

- Section templates: [template.md](template.md)
- Full examples from team emails: [examples.md](examples.md)
- CP3 design (downstream): [generate-design](../generate-design/SKILL.md) → [design-review-pptx](../design-review-pptx/SKILL.md)
