---
title: Cursor Setup
tags:
  - sdlc
  - reference
  - cursor
created: 2026-09-03
updated: 2026-09-03
status: blueprint
---

# Cursor Setup

Part of [[SDLC Agentic Workflow]]. How Cursor is wired to the vault, the repos and the tools.

## How Cursor finds skills

Cursor discovers `SKILL.md` files from, in order of scope:

| Location | Scope |
|---|---|
| `.cursor/skills/` and `.agents/skills/` | Project (the open workspace folder) |
| `~/.cursor/skills/` and `~/.agents/skills/` | Global — every project |
| `.claude/skills/`, `.codex/skills/` and home equivalents | Legacy, still supported |

Discovery is **recursive**, so category subfolders are free. Frontmatter fields that matter here:

| Field | Use |
|---|---|
| `name` | lowercase, hyphens, numbers |
| `description` | what the router matches on — see [[Skill Catalogue#Description hygiene]] |
| `paths` | glob restriction, e.g. `["**/*.java"]` |
| `disable-model-invocation` | `true` = only runs on explicit `/name` |
| `icon`, `color` | Custom Mode badge |

Invocation: automatic (model judges relevance) or explicit `/skill-name`. To keep a skill loaded for a whole session, activate it as a **Custom Mode** with `Option+Enter`.

## The orchestrator is a Custom Mode

This is the key mechanical detail. `sdlc-orchestrator` must not depend on the router re-matching it every turn — it needs to be present for the whole session so it can hold the dossier state and enforce gates.

Create a Custom Mode named **SDLC**, bound to `sdlc-orchestrator`, and start every project session in it.

## Machines and vault paths

The vault is a git repo (`DragonChong/HA-Notes`), cloned to a different path on each machine. Nothing in the workflow may hardcode a vault path — everything is vault-relative, and only the link created once per machine knows the absolute path.

| Machine | OS | Vault path |
|---|---|---|
| Office workstation | Windows | `D:\Github\HA-Notes` |
| Personal | macOS | `~/Application/Obsidian/HA-Notes` |

Skills are versioned inside the vault, so `git pull` on either machine updates them. The link is per-machine, made once, and never committed.

## The skills-location problem

Skills discovered at project level come from *the open workspace*. Your work spans the vault plus several repos, so a skill tree that lives only in the vault is invisible when you open `lis-common-scheduler-svc` alone. The link you already run for `LIS/skills` solves this.

### Keep the canonical tree in a visible vault folder

> [!important] Do not put the canonical tree in `.cursor/skills/` inside the vault
> Obsidian hides any folder whose name starts with a dot. A skill tree under `<vault>/.cursor/` would vanish from the file explorer, from search, from the graph, and from wikilinks — in a system whose whole premise is that the vault is the centralized brain, that is a bad trade. You would no longer be able to read a `SKILL.md` in Obsidian, link a stage note to the skill that owns it, or search skill bodies alongside your notes.
>
> **The link target's folder name is arbitrary.** Discovery comes from the link sitting at `%USERPROFILE%\.cursor\skills`, not from the source folder being called `.cursor`. So point it at a normal, visible folder.

**Recommended:** promote the tree to `Skills/` at the vault root and keep the existing link pattern.

```
<vault>/Skills/
  sdlc/          ← L0 + L1  (orchestrator and the 12 stage skills)
  lis/           ← L2 domain (lis-*, cms-design-system, react-*)
  format/        ← L2 rendering (pptx, docx, xlsx, mermaid, obsidian-*)
  legacy-crs/    ← the CRS-Revamp skills until they are generalized
```

Root rather than `LIS/skills` because the SDLC skills are application-agnostic — CRS, LIS and Patient work all runs through the same orchestrator, and a cross-application skill filed under `LIS/` will confuse the next person who reads the vault. The LIS-specific ones stay together under `Skills/lis/`.

If you would rather not restructure at all, `LIS/skills` keeps working exactly as it does today. The gain from moving is naming honesty and one link instead of two; the cost is one afternoon of `git mv` plus repointing the junction. It is a tidy-up, not a prerequisite — none of the rest of this blueprint depends on it.

### Windows — office workstation

Canonical source: `D:\Github\HA-Notes\Skills\`

**Preferred — directory junction.** No admin rights, no Developer Mode, works on any local drive:

```cmd
mklink /J "%USERPROFILE%\.cursor\skills" "D:\Github\HA-Notes\Skills"
```

**Alternative — symbolic link.** Needs either an elevated prompt or Windows Developer Mode enabled:

```cmd
mklink /D "%USERPROFILE%\.cursor\skills" "D:\Github\HA-Notes\Skills"
```

```powershell
New-Item -ItemType SymbolicLink -Path "$env:USERPROFILE\.cursor\skills" -Target "D:\Github\HA-Notes\Skills"
```

Remove with `rmdir "%USERPROFILE%\.cursor\skills"` — **not** `rmdir /S`, and not `del`. `rmdir` on a junction removes the link only; `/S` would walk through it and delete the real skill tree in the vault.

> [!tip] Junction over symlink on a corporate build
> A junction (`/J`) is the pragmatic choice: it needs no privilege at all, and for a local-drive directory it behaves identically for Cursor's purposes. Reserve `/D` for the case where the target is on a network share, where junctions do not work.

### macOS — personal machine

```bash
ln -s ~/Application/Obsidian/HA-Notes/Skills ~/.cursor/skills
```

### Why the link direction matters

The link lives in `%USERPROFILE%\.cursor\` (or `~/.cursor/`), **outside** the repo, pointing *into* the vault. That is deliberate:

- Git never sees it, so `core.symlinks` on Windows is irrelevant and no `.gitattributes` handling is needed.
- Each machine makes its own link once; the vault stays platform-neutral.
- A `git pull` updates every skill on every machine at once, with real version history and rollback.
- The vault folder stays visible to Obsidian, so skills are notes you can read, search and link like anything else.

If your setup ever disallows both junctions and symlinks, fall back to a `sync-skills` script run from a git `post-merge` hook — but the link is better because it cannot drift.

> [!warning] Git on Windows and `SKILL.md`
> Set `core.autocrlf` consistently across both machines (`input` on macOS, `true` on Windows is the usual pairing). Mixed line endings in `SKILL.md` files show up as whole-file diffs on every pull and make the skills' git history useless for spotting what actually changed.

### Migration from today's layout

Skills are currently spread across `LIS/skills/`, `skills/` at the root, and `.claude/`. To consolidate:

1. Create `Skills/` at the vault root with the four category subfolders.
2. `git mv` the existing skills into place — preserves history, which matters when a skill starts misbehaving and you need to see what changed. Root `skills/*` (the CRS-Revamp set) goes to `Skills/legacy-crs/`.
3. Repoint the link: `rmdir "%USERPROFILE%\.cursor\skills"`, then re-run `mklink /J` against `D:\Github\HA-Notes\Skills`.
4. Confirm discovery still works — a skill that was previously found should still respond to `/name`.

Do step 4 before deleting anything. Discovery is recursive through subfolders, so the category nesting is free, but confirm it on your Cursor build rather than assuming.

**Alternative to all of the above:** keep the multi-root workspace you already documented in [[Copilot Workflow Optimization]] — vault + repos in one Cursor window. Note that this path *does* want a `.cursor/skills` at the workspace root for project-level discovery; if you go this way, make it a second junction pointing at `Skills/` and gitignore it, rather than moving the canonical tree into a hidden folder.

## AGENTS.md in every repo

Short, always-loaded, points at the system rather than restating it:

```markdown
# AGENTS.md — lis-common-scheduler-svc

This repo is developed under the SDLC agentic workflow.
The knowledge base is the Obsidian vault (repo: DragonChong/HA-Notes).
Office: D:\Github\HA-Notes   Personal: ~/Application/Obsidian/HA-Notes
All paths below are vault-relative.

Before any non-trivial change:
1. Activate the SDLC Custom Mode (sdlc-orchestrator).
2. Identify the dossier: SDLC/Projects/<JIRA key> — <name>/_Dossier.md
3. Do not skip a stage gate. If work is requested out of order, say so.

Architecture rules: see the `lis-architecture` skill.
Data access: see `data-source-usage`. Logging/audit: see `lis-audit-logging`, `lis-als-logger`.

Never place patient-identifiable data in prompts, notes, commits, or logs.
```

## MCP servers

| Server | Purpose | Status |
|---|---|---|
| Filesystem / Obsidian | Read and write vault notes | Available — the vault is on disk |
| JIRA (Atlassian) | Create issues, update checklists, read tickets | **Available** — confirm write scope |
| Git / GitHub Enterprise | Diffs, PRs, branches | Available via local clones + terminal |
| Database (app DB) | Run monitoring and verification SQL | **Unconfirmed** — see [[Open Questions]] |
| Database (log DB) | Log-table queries for monitoring | **Unconfirmed, separate instance** |
| SonarQube | Pull scan results into the SIT report | Worth adding; today via exported report |

> [!warning] Corporate proxy and SSL inspection
> Your existing notes already flag SSL inspection as the silent failure point for tooling behind the corporate proxy. Every MCP server that makes an outbound HTTPS call (JIRA, SonarQube) will hit it. Budget time for `NODE_EXTRA_CA_CERTS` / proxy env configuration before assuming a server is unavailable — see [[Corporate Network Diagnosis]].

## Guardrails

Put these in `AGENTS.md` at every repo root **and** at the vault root, because they are the rules that must never be missed:

1. **No patient-identifiable data** in prompts, notes, commits, log examples or test data. Sample data is synthetic. Screenshots are redacted before they enter the vault.
2. **No real secret values** in the vault. ConfigMap keys and Secret *names* yes; values never.
3. **No production write access** from the agent. Read-only queries only, and only once DB access is agreed.
4. **No auto-submission** into JIRA workflow transitions that represent approval, or into change control.
5. **Agent-generated artifacts are drafts** until `reviewed_by` is set — see [[Dossier Schema#Provenance on every generated artifact]].

## Verify before you scale

Before building all twelve skills, prove the plumbing with one throwaway skill:

- [ ] A skill at `%USERPROFILE%\.cursor\skills\test-ping\SKILL.md` (via the junction) is discovered from a repo window
- [ ] `/test-ping` invokes it explicitly
- [ ] A Custom Mode keeps it loaded across turns
- [ ] The agent can read `SDLC/Projects/…/_Dossier.md` from a repo window, through the junction
- [ ] The agent can write a note back into the vault
- [ ] JIRA MCP can read an issue, then create one in a test project
- [ ] `nested/category/skill/SKILL.md` is still discovered

Half a day here saves a fortnight later.

## Related

- [[Skill Catalogue]] · [[Rollout Plan]] · [[Open Questions]] · [[Copilot Workflow Optimization]]

## Sources

- [Agent Skills — Cursor Docs](https://cursor.com/docs/skills)
