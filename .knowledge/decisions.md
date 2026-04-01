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

### 2026-04-01
- Decision: For current branch acceptance, treat `src/App.tsx` local flow as the primary default chain and keep `MvpFlowShell` as non-default parallel flow.
- Why: User acceptance and current runnable behavior are anchored on menu -> transition -> pre-battle -> battle plus story/characters/collection routes in `src/App.tsx`.
- Consequence: Do not switch default entry to other flows without a new conflict arbitration record and explicit migration checklist.

### 2026-04-01
- Decision: Use a card-type compatibility bridge during taxonomy migration (legacy showcase labels and canonical battle labels can coexist temporarily).
- Why: Existing repository data and runtime contracts use mixed type vocabularies; forced one-shot rewrite is high risk in parallel-AI development.
- Consequence: Align at boundaries first, keep runtime stable, and migrate card data vocabulary incrementally with explicit validation.
