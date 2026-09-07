# AGENTS.md — HA-Notes vault

This vault is the knowledge base for the LIS/HA SDLC agentic workflow
(repo: DragonChong/HA-Notes).

Office: `D:\Github\HA-Notes`  
Personal: `~/Application/Obsidian/HA-Notes`

All paths below are vault-relative.

## Before any non-trivial change

1. Identify the dossier: `SDLC/Projects/<JIRA key> — <name>/_Dossier.md`
2. Do not skip a stage gate. If work is requested out of order, say so
   and offer to close the current gate or record an exception.
3. When the SDLC Custom Mode exists, start project sessions in it.

See [[SDLC Agentic Workflow]] for the stage list and [[Dossier Schema]]
for the frontmatter contract.

## Domain skills

Architecture: `lis-architecture`  
Data access: `data-source-usage`  
Logging/audit: `lis-audit-logging`, `lis-als-logger`

## Guardrails

1. **No patient-identifiable data** in prompts, notes, commits, log
   examples or test data. Sample data is synthetic. Screenshots are
   redacted before they enter the vault.
2. **No real secret values** in the vault. ConfigMap keys and Secret
   names are fine; values never.
3. **No production write access** from the agent. Read-only queries
   only, and only once DB access is agreed.
4. **No auto-submission** into JIRA workflow transitions that represent
   approval, or into change control.
5. **Agent-generated artifacts are drafts** until `reviewed_by` is set.
   `agent_assisted: true` with an empty `reviewed_by` must not be
   attached to a promotion form or a CP3 submission.
