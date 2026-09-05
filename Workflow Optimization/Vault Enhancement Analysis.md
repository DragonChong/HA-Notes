---
title: Vault Enhancement Analysis
tags:
  - vault
  - knowledge-management
  - llm-wiki
created: 2026-09-05
updated: 2026-09-05
status: analysis
---

# Vault Enhancement Analysis

Audit of `HA-Notes` against the **LLM Wiki** pattern (persistent, LLM-maintained
knowledge base: *raw sources → wiki → schema*, with *ingest / query / lint*
operations). Measured on 533 markdown notes, 2026-09-05.

> [!summary] The one-line finding
> Your skill layer is entirely **forward-producing** — generate design, generate
> pptx, create JIRA logs, implement task. Nothing **maintains** the knowledge.
> That is why 41% of notes are orphans and 60% are six months stale. The pattern's
> real contribution here is not new folders; it is the *maintainer* role.

## Baseline

| Measure | Value |
|---|---|
| Markdown notes | 533 |
| With YAML frontmatter | 248 (47%) |
| Orphans — zero inbound wikilinks | 217 (41%) |
| Notes with zero outbound links | 173 (32%) |
| Broken wikilink targets | 414 unique / 735 occurrences |
| Notes last modified 2026-03 or earlier | ~322 (60%) |
| Empty / stub notes | 8 |
| Skills | 29 (10 root, 19 under `LIS/skills`) |
| Vault-level `CLAUDE.md` | **none** |
| Vault-level `index.md` / `log.md` | **none** |

## What already matches the pattern

- **[[SDLC Agentic Workflow|SDLC/]] is a working schema layer.** Twelve stage
  contracts, a dossier state machine, templates, a `Dossiers.base` portfolio
  view, 25/25 notes with clean frontmatter. This is the mature corner of the
  vault and the right model to generalise upward.
- **`Knowledge Base/` is a genuine wiki**, 302 notes decomposed to
  screen → component → workflow → validation, with real hub pages
  (`Retrieve Request` carries 73 inbound links).
- **Git-versioned** with automatic backup commits — version history for free.
- **Bases core plugin is on**, so frontmatter queries need no third-party plugin.

## Gaps

### 1. No schema at the root — the biggest gap

Schema exists only *inside* `SDLC/` and inside individual `SKILL.md` files.
Nothing at vault root tells an agent what the top-level folders mean, where a new
note belongs, what frontmatter is required, when to update an index, or what to
never touch. Every session re-derives the vault's shape from scratch.

There is also a full duplicate tree at `.claude/worktrees/bold-liskov/` that an
agent will happily wander into and edit.

### 2. No index, no log

`Knowledge Base/00_Index/System_Overview.md` is **empty (0 bytes)** — the index
slot exists but was never filled. With no catalog, retrieval is glob-and-hope;
with no log, there is no record of what was ingested, decided, or superseded.

### 3. Frontmatter is bimodal

285 of 533 notes have none at all. Coverage by folder:

| Folder | Missing frontmatter |
|---|---|
| `SDLC/` | 0 of 25 |
| `Workflow Optimization/` | 0 of 3 |
| `skills/` | 0 of 10 |
| `Knowledge Base/` | 141 of 302 |
| `LIS/` | 56 of 96 |
| `CRS/` | 14 of 23 |
| `Patient/` | 20 of 20 |
| `Study/` | 18 of 18 |
| `AI/` | 11 of 11 |
| `Notes/` | 10 of 10 |
| `SpringBoot/` | 8 of 8 |

Vocabulary is split too — `status` 209, `epic` 160, `tags` 77, `title` 67,
`created` 48, `updated` 26. Without `updated`, staleness is invisible. Without a
`type`, Bases can only ever see SDLC dossiers.

### 4. 735 broken wikilinks

Two distinct causes, two different fixes:

- **JIRA keys as wikilinks with no note behind them** — `[[CRST-797]]` ×21,
  `CRST-778` ×9, `CRST-779` ×9, `CRST-537`, `CRST-121`, `CRST-162`, and ~40 more.
  These are your unit of work and the dossier schema already tracks them; they
  deserve real entity pages.
- **Concepts referenced but never written** — `CRS Registration Workflow` ×9,
  `CRS Request Retrieval Workflow` ×6, `Pre-Register Save Sequence` ×5,
  `BBNK - Ask for Confirmation` ×5, `CRS Spec-Ack Workflow` ×4. This is precisely
  the pattern's *lint* signal: important concept mentioned repeatedly, no page.

### 5. Duplication where transclusion belongs

| Note | Copies |
|---|---|
| `Clear Button` | 5 |
| `Retrieve Request` | 4 |
| `Object Enablement After Retrieval` | 4 |
| `Laboratory Selection` | 4 |
| `Tab Sequence` | 4 |
| `Default Focus - Initial` | 4 |
| `Request Not Found Message` | 4 |
| `Not Supported Lab Message` | 4 |
| `USID Input Dialogue` | 3 |

One copy per screen, each drifting independently — and each `Retrieve Request`
copy carries 73 inbound links, so the drift is load-bearing. Meanwhile
`Knowledge Base/02_Common_Components/` exists and is nearly empty.

### 6. Staleness is real and invisible

322 notes were last touched in 2026-03; only 29 this month. Nothing flags a note
whose claims predate the CRS Revamp decisions recorded elsewhere in the vault.

### 7. No raw-source layer

The pattern's immutable layer 1 does not exist here. Requirement documents, JIRA
exports, meeting notes, vendor specs are either pasted into notes — losing
provenance — or live outside the vault. No note records where its claim came
from. For design reviews and promotion submissions, provenance is exactly what
gets challenged.

### 8. Minor

- Two orphan notes at vault root (`DB Diff Checker…`, `Optimizing Your VS Code…`)
  — an inbox with no inbox.
- `.obsidian/` is gitignored, so Bases views, graph config and hotkeys are not
  versioned; a new machine loses the setup.
- 8 empty stubs, mostly a fully-scaffolded-never-written
  `Specimen Acknowledgement` screen.

## Recommendations

### Phase 1 — Give the vault a schema (one session)

1. **Root `CLAUDE.md`**: folder contract (what each top-level folder holds),
   frontmatter contract, routing rules ("a note about X goes to Y"), the three
   operations (ingest / query / lint), and forbidden paths
   (`.claude/worktrees/`, `node_modules/`, `*.assets/`).
2. **Root `index.md`**: catalog by domain, one line and one link per hub page.
   Either fill `System_Overview.md` or retire it into this.
3. **Root `log.md`**: append-only, entries prefixed
   `## [YYYY-MM-DD] ingest | Title` so `grep "^## \[" log.md | tail -5` works.

### Phase 2 — Make it queryable

Standard frontmatter on every note:

```yaml
title:     # human name
type:      # reference | workflow | decision | runbook | source-summary | dossier | skill-spec
domain:    # LIS | CRS | Patient | Printing | SpringBoot | SDLC | AI | Study
status:    # draft | current | superseded
created:   # from git first-commit date
updated:   # from mtime, maintained thereafter
source:    # [[Sources/...]] when derived from a raw document
tags:      []
```

Backfill the 285 missing in one scripted agent pass. Then the Bases views that
matter: **stale** (`updated` older than six months), **orphans**,
**by domain**, **open questions**.

### Phase 3 — De-duplicate and heal the graph

- Promote the nine duplicated component notes into `02_Common_Components/` as
  canonical pages; replace each copy with `![[Canonical Page]]` plus a
  screen-specific delta section.
- Pick the JIRA convention and apply it everywhere: real `LIS/JIRA/CRST-797.md`
  entity notes (recommended — they are the unit of work the dossier already
  tracks) or plain external links. Target: zero broken links.
- Write the five or six concept pages that keep getting linked.

### Phase 4 — Sources and maintenance operations

- Add `Sources/` (immutable) with `Sources/assets/`; point Obsidian's attachment
  folder there and bind *Download attachments for current file* to a hotkey for
  Web Clipper captures.
- **`vault-lint` skill** — orphans, broken links, stale notes, missing
  frontmatter, concepts without pages, contradictions between notes. Run monthly,
  append the result to `log.md`.
- **`vault-ingest` skill** — read source → discuss takeaways → write summary page
  → update `index.md` → update every affected page → append to `log.md`.

These two are the gap: all 29 existing skills produce artifacts; none maintain
the corpus.

### Also worth doing

- Un-ignore `.obsidian/` (keep `workspace.json` ignored) so views and hotkeys
  travel with the repo.
- Delete or fill the 8 stubs.
- Move the two root notes into `Workflow Optimization/` and `Study/`.

## Sequencing

Phase 1 is cheap and unblocks everything — an agent with a root `CLAUDE.md` and
an index stops guessing. Phase 2 is scriptable and mostly unsupervised. Phase 3
is the one that needs your judgement, screen by screen. Phase 4 is what keeps the
vault from decaying again.

Related: [[SDLC Agentic Workflow]], [[Agent Skills Reference]],
[[Copilot Workflow Optimization]].
