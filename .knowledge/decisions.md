# Decisions

## Decision log

### 2026-03-27
- Decision: Enforce a repository-wide conflict arbitration workflow before implementation.
- Why: Multiple AI assistants can produce conflicting plans; direct implementation without arbitration causes drift and rework.
- Consequence: Any unresolved conflict must be recorded and arbitrated via `docs/standards/conflict-arbitration-template.md` before code/content changes proceed.
