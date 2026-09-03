---
title: Skill Catalogue
tags:
  - sdlc
  - reference
  - agent-skills
created: 2026-09-03
updated: 2026-09-03
status: blueprint
---

# Skill Catalogue

Part of [[SDLC Agentic Workflow]]. Where every skill sits in the [[Architecture|four-layer model]], and what has to be built.

## L0 — Orchestration

| Skill | Status | Notes |
|---|---|---|
| `sdlc-orchestrator` | **build** | The whole system hinges on this one. Pin as a Cursor Custom Mode. |

## L1 — Stage skills

| Stage | Skill | Status | Action |
|---|---|---|---|
| 01 | `requirement-confirmation` | build | New |
| 02 | `system-design` | **refit** | From `LIS/skills/generate-design` — write to own note, not `## Design` |
| 03 | `design-review-pptx` | exists | Add design-source precedence resolution |
| 04 | `lis-jira-log-creator` | exists | Add dossier read/write + JIRA MCP issue creation |
| 05 | `project-plan` | build | New |
| 06 | `implement-task` | **generalize** | De-hardcode CRS Revamp |
| 06 | `code-change-log` | build | New — highest downstream leverage |
| 07 | `code-review` | build | Absorbs `phase-review`, calls `sonar-scan-fix` |
| 08 | `sit-test-report` | build | New |
| 09 | `load-test-scenario` | build | New |
| 10 | `promotion-config` | build | New |
| 10 | `promotion-form` | build | New |
| 10 | `monitoring-plan` | build | New |
| 11 | `promotion-checklist` | build | New |
| 12 | `pilot-monitor` | build | New |
| — | `uat-support` | later | Thin; schedule + scope + record outcome |

**Count: 12 new, 1 refit, 1 generalize, 2 extend.** That is the honest scope of the work.

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

These live in `skills/` at the vault root and are CRS-Revamp-specific. They are the right shape but the wrong scope.

| Skill | Hardcoded today | Move to |
|---|---|---|
| `load-context` | CRS knowledge-base paths, Flex component mapping table | Dossier `services`/`repos` + a per-service context map |
| `task-plan` | `CRS/Revamp/Migration Plan/…` output path | Dossier folder |
| `task-add` / `task-update` | `CRS/Revamp/Central Task List.md` | `tasks:` wikilink in dossier frontmatter |
| `blocker-check` | Blocker registry D.1–D.6 inline | Dossier `## Open Items` |
| `phase-review` | Architecture rules V1–V*n* inline, `src/features/registration/` | `lis-architecture` capability + dossier `repos` |
| `implement-task` | Repo → stack table inline | Dossier `repos` + `LIS/ECP/<service>/` notes |

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
