> A practical guide for System Analysts managing multiple application codebases with VS Code, GitHub Copilot, and Obsidian as the central knowledge hub.

---

## The Problem: Context Fragmentation

Every time you switch between VS Code workspaces, Copilot loses all context. You end up re-explaining architecture decisions, business rules, coding conventions, and implementation plans from scratch. Meanwhile, your Obsidian vault has all this knowledge — but Copilot can't see it.

The solution is a **layered context strategy** that bridges your Obsidian knowledge base with Copilot's built-in customization features.

---

## 1. Repository Custom Instructions (`copilot-instructions.md`)

### What It Does

VS Code automatically detects a `.github/copilot-instructions.md` file at the root of your workspace and injects its contents into **every** Copilot Chat request. You never have to manually reference it — Copilot just knows.

### How to Set It Up

Create the file at: `<repo-root>/.github/copilot-instructions.md`

### Recommended Template for Your Team

markdown

```markdown
# Project: [Application Name]

## Architecture
- **Frontend**: ReactJS + TypeScript (migrated from ActionScript 3 / MXML)
- **Backend**: Spring Boot (migrated from J2EE)
- **Deployment**: RedHat OpenShift
- **CI/CD**: Enterprise GitHub → JFrog Artifactory → SonarQube → SonaType → Fortify

## Key Modules
- [Module A]: Brief description + location in repo
- [Module B]: Brief description + location in repo

## Coding Conventions
- Follow existing TypeScript strict mode settings
- Use functional components with hooks (no class components)
- Spring Boot services follow [specific pattern]
- All API endpoints documented with OpenAPI annotations

## Migration Context
- This codebase is being migrated from [legacy tech]. Some files still contain
  legacy patterns. When modifying legacy files, follow the new conventions.
- Legacy mapping reference: see docs/migration-mapping.md

## Testing
- Unit tests: Jest + React Testing Library (frontend), JUnit 5 (backend)
- Run tests before suggesting changes: `npm test` / `mvn test`

## Things Copilot Should NOT Do
- Do not suggest external npm packages without checking JFrog Artifactory availability
- Do not use any external AI API calls (company policy: self-hosted only)
- Do not modify OpenShift deployment configs without explicit instruction
```

### Key Tips

- **Keep it under 500 lines.** Copilot compresses long instructions and may drop details.
- **Version control it.** This file lives in the repo, so the whole team benefits.
- **Verify it's working.** After any Copilot Chat response, expand the "References" panel — you should see `copilot-instructions.md` listed.
- **Use `/init` command.** In VS Code Copilot Chat, type `/init` and Copilot will auto-generate a starting instructions file by analyzing your codebase.

---

## 2. Path-Specific Instructions (`.instructions.md` Files)

### What It Does

These are targeted instruction files that only activate when Copilot is working on files matching a specific path pattern. They live in `.github/instructions/` and use YAML frontmatter to specify which files they apply to.

### When to Use

Use these when different parts of your codebase need different rules — for example, frontend vs. backend, test files vs. production code, or legacy modules vs. new modules.

### Examples

**`.github/instructions/react-components.instructions.md`**

markdown

```markdown
---
applyTo: "src/components/**/*.tsx"
description: "React component conventions"
---
# React Component Guidelines

- Use functional components with TypeScript interfaces for props
- Use react-hook-form for form state
- All components must have a corresponding .test.tsx file
- Use the design system components from src/components/ui/
- Follow the existing pattern in src/components/ui/Button.tsx as reference
```

**`.github/instructions/spring-services.instructions.md`**

markdown

```markdown
---
applyTo: "src/main/java/**/service/**/*.java"
description: "Spring Boot service layer conventions"
---
# Service Layer Guidelines

- All services must be annotated with @Service
- Use constructor injection (no @Autowired on fields)
- Business exceptions extend BaseBusinessException
- All public methods must have @Transactional where appropriate
- Follow the existing pattern in UserService.java
```

**`.github/instructions/legacy-migration.instructions.md`**

markdown

```markdown
---
applyTo: "src/legacy/**/*"
description: "Legacy code migration rules"
---
# Legacy Code Rules

- These files are being migrated from ActionScript 3 / MXML / J2EE
- When modifying, convert to new patterns (React + Spring Boot)
- Do NOT fix bugs in legacy patterns — migrate the entire module
- Reference the migration mapping in docs/migration-mapping.md
```

### Directory Structure

```
.github/
├── copilot-instructions.md              # Always-on, repo-wide
└── instructions/
    ├── react-components.instructions.md  # Frontend components
    ├── spring-services.instructions.md   # Backend services
    ├── legacy-migration.instructions.md  # Legacy code handling
    └── testing.instructions.md           # Test file conventions
```

---

## 3. Reusable Prompt Files (`.prompt.md`)

### What It Does

Prompt files are reusable Copilot Chat commands that you invoke manually with `/prompt-name`. Think of them as saved, parameterized prompts for tasks you do repeatedly — like creating JIRA tickets, code reviews, or scaffolding new modules.

### Where They Live

`<repo-root>/.github/prompts/`

### Examples for Your Workflow

**`.github/prompts/code-review.prompt.md`**

markdown

```markdown
---
mode: "agent"
description: "Perform a structured code review"
---

# Code Review

Review the selected code for:

1. **Correctness**: Logic errors, edge cases, null safety
2. **Security**: Input validation, SQL injection, XSS (per Fortify rules)
3. **Performance**: N+1 queries, unnecessary re-renders, memory leaks
4. **Conventions**: Adherence to project coding standards
5. **Migration**: If legacy patterns found, suggest modern equivalents

Reference our coding standards: [copilot-instructions](../.github/copilot-instructions.md)

Output format:
- **Issue**: Description
- **Severity**: Critical / High / Medium / Low
- **File:Line**: Location
- **Suggestion**: Specific fix with code example
```

**`.github/prompts/jira-ticket.prompt.md`**

markdown

```markdown
---
mode: "agent"
description: "Generate a structured JIRA ticket from a description"
---

# JIRA Ticket Generator

Based on the user's description and any referenced files, generate a JIRA ticket with:

## Fields
- **Summary**: Concise title (max 80 chars)
- **Description**: Structured with:
  - Background / Context
  - Current Behavior
  - Expected Behavior
  - Technical Approach (reference specific files/classes)
  - Acceptance Criteria (numbered list)
- **Story Points**: Estimate based on complexity
- **Labels**: Suggest relevant labels

Use the #tool:vscode/askQuestions tool to ask for missing information.
```

**`.github/prompts/scaffold-module.prompt.md`**

markdown

```markdown
---
mode: "agent"
description: "Scaffold a new feature module"
---

# Scaffold New Module

Create a new feature module with the standard structure:

## Frontend (React + TypeScript)
- src/features/{moduleName}/
  - components/
  - hooks/
  - api/
  - types/
  - index.ts (barrel export)
  - {ModuleName}.test.tsx

## Backend (Spring Boot)
- src/main/java/.../features/{moduleName}/
  - controller/{ModuleName}Controller.java
  - service/{ModuleName}Service.java
  - repository/{ModuleName}Repository.java
  - dto/{ModuleName}DTO.java

Follow conventions in: [copilot-instructions](../.github/copilot-instructions.md)
```

### How to Use

1. In Copilot Chat, type `/` and select the prompt name
2. Or type `#prompt:code-review` to reference it
3. Add additional context by selecting code or referencing files with `#file:`

---

## 4. Multi-Root Workspaces with a Knowledge Base Repo

### The Concept

Instead of opening one project at a time, create a VS Code multi-root workspace that includes:

- Your **knowledge base repo** (synced from Obsidian or as its own repo)
- The **project repo** you're currently working on

This way, Copilot can `@workspace` search across both your documentation AND your code.

### Setting It Up

**Step 1: Create a knowledge base repository**

Structure it to mirror your Obsidian vault (or sync directly):

```
knowledge-base/
├── .github/
│   └── copilot-instructions.md    # "You are a knowledge base for HA DevOps..."
├── architecture/
│   ├── app-a-overview.md
│   ├── app-b-overview.md
│   └── system-landscape.md
├── business-rules/
│   ├── domain-a-rules.md
│   └── domain-b-rules.md
├── migration/
│   ├── actionscript-to-react-mapping.md
│   └── j2ee-to-springboot-mapping.md
├── implementation-plans/
│   ├── phase-1-plan.md
│   └── phase-2-plan.md
├── runbooks/
│   └── openshift-deployment.md
└── TASKS.md                        # Centralized task list
```

**Step 2: Create a `.code-workspace` file**

Save this as `ha-devops.code-workspace`:

json

```json
{
  "folders": [
    {
      "name": "📚 Knowledge Base",
      "path": "../knowledge-base"
    },
    {
      "name": "🔧 App-A (Frontend)",
      "path": "../app-a-frontend"
    },
    {
      "name": "🔧 App-A (Backend)",
      "path": "../app-a-backend"
    }
  ],
  "settings": {
    "github.copilot.chat.codeGeneration.useInstructionFiles": true
  }
}
```

**Step 3: Use `@workspace` to query across everything**

In Copilot Chat:

```
@workspace What are the business rules for [domain X] and how are they 
implemented in app-a-backend?
```

Copilot will search across both your knowledge base docs AND the application code.

### Swapping Projects

When you switch to a different application, just edit the workspace file to swap the project folders while keeping the knowledge base folder constant. Your centralized context always stays available.

### Caveat: Multi-Root Instruction Discovery

There is a known limitation where `copilot-instructions.md` may not be auto-detected in all folders of a multi-root workspace. Workarounds:

1. Configure `chat.instructionsFilesLocations` in your `.code-workspace` settings to point to each folder's `.github/instructions/` path explicitly
2. Use `AGENTS.md` at each repo root as a fallback (Copilot also reads this)
3. Reference instruction files manually with `#file:` when needed

---

## 5. Copilot Spaces (GitHub.com Feature)

### What It Does

Copilot Spaces is a GitHub.com feature that lets you curate a collection of code, docs, notes, and custom instructions into a persistent "space." Copilot Chat within that space is grounded in all the context you've added — and it stays in sync as your repos change.

### Why It Matters for You

This is potentially the most powerful solution for your cross-project context problem:

- Add **multiple repositories** to a single space
- Add **documentation files** (architecture docs, business rules)
- Add **free-text notes** (implementation plans, meeting notes)
- Add **custom instructions** that tell Copilot how to use the context
- **Share with your team** so everyone has the same AI-augmented knowledge base

### How to Set It Up

1. Go to [github.com/copilot/spaces](https://github.com/copilot/spaces)
2. Create a space (e.g., "HA DevOps - All Applications")
3. Add sources:
    - Attach your application repositories
    - Attach your knowledge base repo
    - Upload or paste implementation plans, architecture docs
    - Add custom instructions:

```
     You are an expert in our HA DevOps environment. You understand the migration 
     from ActionScript 3/MXML/J2EE to ReactJS/TypeScript/Spring Boot. When answering 
     questions, always consider our deployment constraints (OpenShift, no external AI 
     APIs, self-hosted tooling only).
```

4. Use it in your browser at github.com, or from your IDE via the GitHub MCP server

### Using Spaces from VS Code

Spaces are accessible in your IDE through the GitHub MCP server:

1. Configure the GitHub MCP server in VS Code with the Spaces toolset enabled:

json

```json
   {
     "servers": {
       "github": {
         "type": "http",
         "url": "https://api.githubcopilot.com/mcp/",
         "headers": {
           "X-MCP-Toolsets": "default,copilot_spaces"
         }
       }
     }
   }
```

2. In Copilot Chat (Agent mode), reference your space:

```
   Using the Copilot space "HA DevOps - All Applications", explain how 
   authentication works across our frontend and backend
```

### Limitations

- Spaces work in Agent mode only when accessing from IDE
- Repository context is not fully supported in IDE mode (works best on github.com)
- Counts toward your Copilot Chat request limits

---

## 6. Obsidian as the Single Source of Truth with Export Pipelines

### The Architecture

```
┌─────────────────────────────────────┐
│           Obsidian Vault            │
│  (Master Knowledge Base)            │
│                                     │
│  architecture/ business-rules/      │
│  migration/ implementation-plans/   │
│  tasks/                             │
└──────────┬──────────────────────────┘
           │
           │  Export / Sync
           │  (ha CLI or script)
           │
    ┌──────┴──────┐
    ▼             ▼
┌────────┐   ┌────────┐
│ Repo A │   │ Repo B │
│ .github/   │ .github/
│  copilot-  │  copilot-
│  instruc.. │  instruc..
│  instruc/  │  instruc/
│  prompts/  │  prompts/
└────────┘   └────────┘
```

### How It Works

1. **Obsidian is your authoring environment.** Write and maintain all architecture docs, business rules, migration mappings, and implementation plans there.
2. **Export relevant slices to each repo.** Each repo only needs the context relevant to it — not your entire vault.
3. **Automate with a script or CLI command.** This could be a new command in your HA DevOps CLI.

### Example Export Script

bash

```bash
#!/bin/bash
# export-to-repo.sh — Run from Obsidian vault root
# Usage: ./export-to-repo.sh <app-name> <repo-path>

APP_NAME=$1
REPO_PATH=$2
GITHUB_DIR="$REPO_PATH/.github"

mkdir -p "$GITHUB_DIR/instructions"
mkdir -p "$GITHUB_DIR/prompts"

# Export app-specific architecture doc as copilot-instructions.md
echo "# Project: $APP_NAME" > "$GITHUB_DIR/copilot-instructions.md"
echo "" >> "$GITHUB_DIR/copilot-instructions.md"

# Append architecture overview
cat "architecture/${APP_NAME}-overview.md" >> "$GITHUB_DIR/copilot-instructions.md"
echo "" >> "$GITHUB_DIR/copilot-instructions.md"

# Append relevant business rules
cat "business-rules/${APP_NAME}-rules.md" >> "$GITHUB_DIR/copilot-instructions.md"
echo "" >> "$GITHUB_DIR/copilot-instructions.md"

# Append coding conventions (shared across all apps)
cat "conventions/coding-standards.md" >> "$GITHUB_DIR/copilot-instructions.md"

# Copy shared prompt files
cp prompts/*.prompt.md "$GITHUB_DIR/prompts/"

# Copy app-specific instruction files
cp "instructions/${APP_NAME}/"*.instructions.md "$GITHUB_DIR/instructions/" 2>/dev/null

echo "✅ Exported context for $APP_NAME to $REPO_PATH"
```

### Integration with HA DevOps CLI

This fits naturally as a new command in your `ha` binary:

```
ha context export --app app-a --repo /path/to/app-a
ha context export --all          # Export to all configured repos
ha context diff --app app-a      # Show what changed since last export
```

### Obsidian Vault Structure for This Workflow

```
vault/
├── architecture/
│   ├── app-a-overview.md
│   ├── app-b-overview.md
│   └── system-landscape.md
├── business-rules/
│   ├── app-a-rules.md
│   └── app-b-rules.md
├── conventions/
│   ├── coding-standards.md       # Shared across all repos
│   ├── security-guidelines.md
│   └── openshift-patterns.md
├── migration/
│   ├── as3-to-react-mapping.md
│   └── j2ee-to-springboot-mapping.md
├── instructions/                  # Path-specific .instructions.md files
│   ├── app-a/
│   │   ├── react.instructions.md
│   │   └── spring.instructions.md
│   └── shared/
│       └── testing.instructions.md
├── prompts/                       # Shared .prompt.md files
│   ├── code-review.prompt.md
│   ├── jira-ticket.prompt.md
│   └── scaffold-module.prompt.md
├── implementation-plans/
│   ├── phase-1-migration.md
│   └── phase-2-ai-tooling.md
└── tasks/
    └── TASKS.md                   # Centralized task list
```

---

## 7. Centralized Task List

### The Problem

Tasks are scattered across JIRA, Obsidian notes, multiple repo issues, and your head. You want one place to see what needs doing across all applications.

### Recommended Approach: Obsidian + JIRA Bridge

**`tasks/TASKS.md`** in your Obsidian vault:

markdown

```markdown
# Centralized Task List

## 🔴 In Progress

### App-A: Migrate UserProfile module
- **JIRA**: PROJ-1234
- **Repo**: app-a-frontend
- **Status**: React component done, API integration pending
- **Files**: src/features/UserProfile/
- **Copilot context**: When working on this, reference migration/as3-to-react-mapping.md
- **Next steps**:
  - [ ] Connect to Spring Boot endpoint
  - [ ] Add unit tests
  - [ ] Update OpenShift ConfigMap

### App-B: Fix authentication timeout
- **JIRA**: PROJ-1235
- **Repo**: app-b-backend
- **Status**: Root cause identified
- **Files**: src/main/java/.../auth/SessionManager.java
- **Next steps**:
  - [ ] Implement token refresh logic
  - [ ] Add integration test

## 🟡 Up Next

### Cross-App: Standardize error handling
- **JIRA**: PROJ-1240
- **Repos**: app-a-frontend, app-a-backend, app-b-backend
- **Plan**: See implementation-plans/error-handling-standardization.md

## 🟢 Done (This Sprint)
- [x] App-A: Migrate LoginForm component (PROJ-1230)
- [x] App-B: Update OpenShift deployment config (PROJ-1231)
```

### Linking Tasks to Copilot Context

The key insight is that each task entry should include:

1. **Which repo** the work happens in
2. **Which files** are involved
3. **Which Obsidian docs** provide context

When you start a task, you can tell Copilot:

```
I'm working on PROJ-1234 (Migrate UserProfile module). 
Reference #file:docs/migration-mapping.md and 
#file:src/features/UserProfile/
```

### HA CLI Integration

Your `ha` CLI could eventually bridge JIRA and this task list:

```
ha tasks list                    # Show tasks from TASKS.md
ha tasks sync                   # Pull latest from JIRA, update TASKS.md
ha tasks start PROJ-1234        # Open relevant workspace + set context
```

---

## Putting It All Together: The Recommended Workflow

### One-Time Setup (Per Repo)

1. Run `/init` in Copilot Chat to generate a starting `copilot-instructions.md`
2. Enhance it with content from your Obsidian vault (architecture, business rules)
3. Create path-specific `.instructions.md` files for major code areas
4. Create shared `.prompt.md` files for repeated tasks (code review, JIRA tickets)
5. Commit everything to the repo so the team benefits

### One-Time Setup (Cross-Project)

1. Create a knowledge base repo (or Git-sync your Obsidian vault)
2. Create a `.code-workspace` file with the knowledge base + your current project
3. Optionally, set up a Copilot Space on GitHub.com for browser-based access
4. Set up the export pipeline from Obsidian to repos

### Daily Workflow

1. Open your `.code-workspace` file (knowledge base is always present)
2. Check your centralized `TASKS.md` for the day's priorities
3. When switching projects, swap the project folder in the workspace — the knowledge base stays
4. Use `#file:` to point Copilot at relevant knowledge base docs
5. Use `/prompt-name` for repeated tasks (code review, ticket creation)
6. When you learn something new, update the Obsidian vault (it flows downstream)

### The Result

- **No more re-explaining context** — `copilot-instructions.md` handles it automatically
- **No more switching workspaces** — multi-root workspace keeps everything accessible
- **No more scattered tasks** — centralized `TASKS.md` with links to repos and docs
- **Knowledge compounds** — every instruction and prompt you write benefits the whole team
- **Obsidian stays the brain** — update once, export everywhere

---

## Quick Reference: File Hierarchy

|File|Location|Scope|When Applied|
|---|---|---|---|
|`copilot-instructions.md`|`.github/`|Entire repo|Every Copilot request (automatic)|
|`*.instructions.md`|`.github/instructions/`|Path-matched files|When working on matching files (automatic)|
|`*.prompt.md`|`.github/prompts/`|On-demand|When invoked with `/name` (manual)|
|`AGENTS.md`|Repo root|Entire repo|Every request (automatic, cross-tool)|
|Copilot Spaces|github.com|Curated sources|When chatting in that space|
|Multi-root workspace|`.code-workspace`|All included folders|`@workspace` queries|

---

## Further Resources

- [VS Code Custom Instructions Docs](https://code.visualstudio.com/docs/copilot/customization/custom-instructions)
- [VS Code Prompt Files Docs](https://code.visualstudio.com/docs/copilot/customization/prompt-files)
- [GitHub Copilot Spaces Docs](https://docs.github.com/en/copilot/concepts/context/spaces)
- [Awesome Copilot Repository](https://github.com/github/awesome-copilot) — community-contributed instructions, agents, and prompts
- [VS Code Best Practices for AI](https://code.visualstudio.com/docs/copilot/best-practices)
- [Multi-Root Workspaces](https://code.visualstudio.com/docs/editing/workspaces/multi-root-workspaces)