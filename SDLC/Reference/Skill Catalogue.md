---
title: Skill Catalogue
tags:
  - sdlc
  - reference
  - agent-skills
created: 2026-09-03
updated: 2026-09-10
status: blueprint
---

# Skill Catalogue

Part of [[SDLC Agentic Workflow]]. Where every skill sits in the [[Architecture|four-layer model]], and what has to be built.

## L0 — Orchestration

| Skill | Status | Notes |
|---|---|---|
| `sdlc-orchestrator` | **exists** | `LIS/skills/sdlc/sdlc-orchestrator/` — pin as Custom Mode (Alt+Enter). |

## L1 — Stage skills

| Stage | Skill | Status | Action |
|---|---|---|---|
| 01 | `requirement-confirmation` | **exists** | `LIS/skills/sdlc/requirement-confirmation/` |
| 02 | `system-design` | **exists** | Refit done — own note; `generate-design` is legacy-only |
| 03 | `design-review-pptx` | exists | After `reviewed_by`: write `03 Slide Brief.md`, humanize prose, then `deck.json`. Legacy: JIRA `## Design` |
| 04 | `lis-jira-log-creator` | exists | Dossier read/write + JIRA create after human approve |
| 05 | `project-plan` | **exists** | `LIS/skills/sdlc/project-plan/` — Gantt + milestones; human accepts estimates |
| 06 | `implement-task` | **exists** | Dossier `repos` / Open Items first; CRS Central Task List still works |
| 06 | `code-change-log` | **exists** | `LIS/skills/sdlc/code-change-log/` — log markers, DB, config |
| 07 | `code-review` | build | Absorbs `phase-review`, calls `sonar-scan-fix` |
| 08 | `sit-test-report` | build | New |
| 09 | `load-test-scenario` | build | New |
| 10 | `promotion-config` | build | New |
| 10 | `promotion-form` | build | New |
| 10 | `monitoring-plan` | build | New |
| 11 | `promotion-checklist` | build | New |
| 12 | `pilot-monitor` | build | New |
| — | `uat-support` | later | Thin; schedule + scope + record outcome |

**Remaining after Phase 2 start:** 8 new. Spine plus plan, change log, and CRS generalization are on disk. Prove Gantt + change log on a dossier after `jira` is in `gates_passed`.

## L2 — Capability skills (existing, reusable)

Format and rendering
`pptx` · `generate-pptx` · `docx` · `xlsx` · `pdf` · `mermaid-diagrams` · `diagram-design` · `json-canvas` · `obsidian-markdown` · `obsidian-bases`

LIS domain and standards
`lis-architecture` · `data-source-usage` · `lis-audit-logging` · `lis-als-logger` · `lis-dictionary-usage` · `lis-hub-lib-components` · `lis-message-box-usage` · `lis-template-lib-init` · `lis-svc-lib-release-notes` · `cms-design-system` · `react-best-practices` · `react-project-structure`

Quality and documentation
`sonar-scan-fix` · `lis-wiki-creator` · `app-wiki` · `github-wiki-generator` · `create-user-story` · `test-scaffold`

Meta
`skill-creator`

## Generalize

These live in `skills/` at the vault root. **2026-09-10:** dossier-first, CRS paths remain the fallback so CRS Revamp still works.

| Skill | Was hardcoded | Now reads |
|---|---|---|
| `load-context` | CRS knowledge-base paths, Flex mapping only | Dossier `services`/`repos` + `LIS/ECP/<service>/`; Flex table still for Registration |
| `task-plan` | `CRS/Revamp/Migration Plan/…` only | Dossier `tasks:` if set; else Central Task List |
| `task-add` / `task-update` | `CRS/Revamp/Central Task List.md` only | Dossier `tasks:` if set; else both CRS files |
| `blocker-check` | D.1–D.6 inline only | Dossier `## Open Items` first; D.1–D.6 fallback |
| `phase-review` | Architecture rules V1–V*n* inline | Still CRS — absorbed by Phase 3 `code-review` |
| `implement-task` | CRS repo table only | Dossier `repos` + `LIS/ECP/<service>/` + `lis-architecture` |

The pattern is the same every time: **the skill keeps the procedure, the dossier supplies the particulars.** A skill that names one project cannot orchestrate the next one.

## Consolidation

Skills currently live in three places: `skills/`, `LIS/skills/`, and `.claude/`. Cursor discovers `.cursor/skills/`, `.agents/skills/` and (legacy) `.claude/skills/`, recursively through subfolders.

**Proposal — one canonical tree in the vault, in a visible folder:**

```
<vault>/Skills/
  sdlc/          ← L0 + L1  (orchestrator and the 12 stage skills)
  lis/           ← L2 domain (lis-*, cms-design-system, react-*)
  format/        ← L2 rendering (pptx, docx, xlsx, mermaid, obsidian-*)
  legacy-crs/    ← the CRS-Revamp skills until they are generalized
```

`<vault>` is `D:\Github\HA-Notes` on the office workstation and `~/Application/Obsidian/HA-Notes` personally.

Vault **root** rather than `LIS/skills` because the SDLC skills are application-agnostic — CRS, LIS and Patient work all run through the same orchestrator. Visible folder rather than `.cursor/skills` because Obsidian hides dotfolders, and skills you cannot read, search or wikilink from the vault defeat the point of the vault being the brain. Discovery comes from the per-machine link, not from the folder's name — see [[Cursor Setup#The skills-location problem]].

Subfolders are organisational only: a skill's identity comes from the folder holding its `SKILL.md`, and discovery is recursive, so nesting costs nothing. Git-tracked in the vault gives you versioning and rollback of the skills themselves, which matters once a dozen people depend on them. Move with `git mv` so history survives.

This is a tidy-up, not a prerequisite. `LIS/skills` keeps working as-is; nothing else in this blueprint depends on the move.

## Description hygiene

Cursor loads every skill's `name` + `description` at session start and routes on them. With ~40 skills, overlapping descriptions are the main failure mode.

House rule — every description states **what**, **when to use**, and **when not to, naming the sibling**:

> "…Use when the user asks to prepare CP3 design review slides. For any other PowerPoint, deck, or presentation, use `generate-pptx`."

`design-review-pptx` already does this. Copy it everywhere.

Also use the `paths` frontmatter field to scope file-bound skills so they stop competing on unrelated prompts:

```yaml
paths: ["**/*.tsx", "**/*.jsx"]     # react-best-practices
paths: ["**/*.java"]                # lis-audit-logging
```

And set `disable-model-invocation: true` on anything destructive or expensive, so it only runs when you type `/name`.

## Related

- [[Architecture]] · [[Cursor Setup]] · [[Rollout Plan]] · [[Agent Skills Reference]]
