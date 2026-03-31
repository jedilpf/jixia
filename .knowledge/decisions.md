# Decisions

## Decision log

### 2026-03-27
- Decision: Enforce a repository-wide conflict arbitration workflow before implementation.
- Why: Multiple AI assistants can produce conflicting plans; direct implementation without arbitration causes drift and rework.
- Consequence: Any unresolved conflict must be recorded and arbitrated via `docs/standards/conflict-arbitration-template.md` before code/content changes proceed.

### 2026-03-31
- Decision: Enforce "preview + explicit approval" and "parallel-AI protection" before any destructive repository action.
- Why: The repository is often modified by multiple AI assistants in parallel, and untracked/staged files may represent unfinished work rather than disposable noise.
- Consequence: Agents must inspect suspected in-flight files before deletion and should default to safe-preserve workflows (preview, user approval, and optional stash/backup) during sync/cleanup operations.
