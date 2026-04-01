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

### 2026-04-01
- Decision: Card-runtime baseline is unified to full active corpus (170 cards), and battle-side library must not derive from current-match subsets.
- Why: User explicitly required removing the 48-card subset behavior and keeping runtime calculation aligned with the full corpus.
- Consequence: Default battle deck generation uses full pool mode; in-battle library reads from full card source; baseline gate threshold raised to `>=170`.

### 2026-04-01
- Decision: Backend defaults are hardened for local safety and stability, with explicit opt-in for broader exposure.
- Why: Previous defaults bound to `0.0.0.0` and lacked in-memory match lifecycle control, increasing accidental exposure and long-running memory growth risk.
- Consequence: Default host is now `127.0.0.1`, match store applies TTL expiration, socket subscription validates provided player identity, and daily gate enforces runtime baseline checks.

### 2026-04-01
- Decision: Contract and showcase-source chain are unified to runtime truth and enforced in baseline validation.
- Why: The previous contract schema (`battleId/playerA/playerB/currentTurn`) diverged from BattleV2 runtime state, and showcase entry components could bypass the adapter source.
- Consequence: `docs/data-contract.json` now matches `DebateBattleState` runtime fields (`round/maxRounds/.../player/enemy/logs/winner`), showcase entry components import from `@/data/cardsSource`, and `validate-runtime-baseline.cjs` checks both contract keys and source-chain drift.
