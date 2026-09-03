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

## The skills-location problem

Skills discovered at project level come from *the open workspace*. Your work spans the vault plus several repos, so a skill tree that lives only in the vault is invisible when you open `lis-common-scheduler-svc` alone.

**Recommended:** canonical source in the vault, symlinked to global.

```bash
# canonical, git-tracked, versioned with the vault
~/Application/Obsidian/HA-Notes/.cursor/skills/

# make it globally available to every Cursor project
ln -s ~/Application/Obsidian/HA-Notes/.cursor/skills ~/.cursor/skills
```

One tree, one git history, available in every repo window. If your setup disallows symlinks, use a small `sync-skills` script run from a git hook instead — but the symlink is better because it cannot drift.

**Alternative:** keep the multi-root workspace you already documented in [[Copilot Workflow Optimization]] — vault + repos in one Cursor window — so project-level discovery sees the vault. This also gives the agent the vault and the code in one `@workspace`, which the design and code-review stages both want. Doing both is fine and is what I would do.

## AGENTS.md in every repo

Short, always-loaded, points at the system rather than restating it:

```markdown
# AGENTS.md — lis-common-scheduler-svc

This repo is developed under the SDLC agentic workflow.
The knowledge base is the Obsidian vault at ~/Application/Obsidian/HA-Notes.

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

- [ ] A skill in `~/.cursor/skills/test-ping/SKILL.md` is discovered from a repo window
- [ ] `/test-ping` invokes it explicitly
- [ ] A Custom Mode keeps it loaded across turns
- [ ] The agent can read `SDLC/Projects/…/_Dossier.md` from a repo window
- [ ] The agent can write a note back into the vault
- [ ] JIRA MCP can read an issue, then create one in a test project
- [ ] `nested/category/skill/SKILL.md` is still discovered

Half a day here saves a fortnight later.

## Related

- [[Skill Catalogue]] · [[Rollout Plan]] · [[Open Questions]] · [[Copilot Workflow Optimization]]

## Sources

- [Agent Skills — Cursor Docs](https://cursor.com/docs/skills)
