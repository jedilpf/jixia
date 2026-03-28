# Decisions

## Decision log

### 2026-03-27
- Decision: Enforce a repository-wide conflict arbitration workflow before implementation.
- Why: Multiple AI assistants can produce conflicting plans; direct implementation without arbitration causes drift and rework.
- Consequence: Any unresolved conflict must be recorded and arbitrated via `docs/standards/conflict-arbitration-template.md` before code/content changes proceed.

### 2026-03-28
- Decision: Require Codex watermark + pre-task intent log for project-wide refinement tasks.
- Why: Multi-AI collaboration produced attribution ambiguity and missing intent traces during long-running cleanup cycles.
- Consequence: Relevant tasks must create `docs/project/record/task-intent-<date>-<task-id>.md` before edits and use watermark headers in formal delivery docs.
