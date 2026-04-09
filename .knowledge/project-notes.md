# Project Notes

## Stable conventions
- Conflict arbitration is mandatory before implementation when AI proposals/instructions conflict.
- Arbitration records must use `docs/standards/conflict-arbitration-template.md`.
- If key information is unclear during arbitration, ask the user first and wait for clarification.
- Before destructive commands (`git clean`, `git reset --hard`, bulk delete/move, or unstage cleanup), list impacted paths first and wait for explicit user approval.
- Treat untracked/staged files as potential in-flight work from parallel AI assistants; inspect content/context before deciding whether to keep, stash, or remove.
- For repository alignment tasks, prefer a safety snapshot (`git stash -u` or equivalent backup) before destructive sync unless the user explicitly requests direct discard.
- User-required local run command uses `npx vite --host` for this repository workflow.
- Current branch-level default acceptance flow is the local `src/App.tsx` menu chain; alternate flows are treated as non-default unless re-arbitrated.
- Runtime card corpus baseline is full active pool (current 170 cards): battle deck generation and in-battle card library should use the same full-source baseline.
- When the user refers to the historical "169-card library", that maps to the validated baseline of `170` raw records in `src/data/showcaseCards.ts` with `1` intentional collection-level duplicate identity (`稗言社::舆论漩涡`, ids `baiyan5` and `baiyan10`) yielding `169` visible collection entries.
- Card showcase art lookup must follow the actual physical file inventory under `public/assets/cards`: after the 170-card baseline restore, many late-batch card arts exist as `.png`, so `src/utils/assets.ts` needs explicit extension preferences instead of assuming `.jpg`.
- Showcase entry chain (`src/components/CardShowcase.tsx`, `src/components/showcase/CardGrid.tsx`, `src/components/showcase/CardDetail.tsx`) must import cards from `@/data/cardsSource`; direct raw imports from `@/data/showcaseCards` in this chain are treated as drift.
- Daily gate now includes `scripts/pipeline/validate-runtime-baseline.cjs` to enforce runtime safety and card-corpus baseline consistency.
- `docs/data-contract.json` is expected to track actual `BattleV2` runtime state shape (not legacy `playerA/playerB/currentTurn` schema), and runtime baseline validation should fail on contract drift.
- Backend local-safe default is `BACKEND_HOST=127.0.0.1`; `0.0.0.0` should be an explicit opt-in via environment variable.
- For code-loss audits in this repo, check both `git reflog` and filesystem mtimes: recent work may split into tracked files overwritten by `git reset` and separate untracked files that still exist on disk.
- Before risky local Git operations in this repo, prefer `npm run git:snapshot -- -Label <name>` so HEAD is bookmarked to a backup branch and the full working tree is copied to a stash without clearing the current workspace.
- When restoring local snapshots, prefer the explicit stash hash shown by `npm run git:snapshots` instead of relative refs like `stash@{0}`, because new stashes will renumber relative positions.
- During recovery work in this repo, compare the current saved commit against older dangling commits before overwriting tracked files; often only a few story files are actually richer in the older object, while most other files are already newer in the latest local save.
- Card tier presentation (`一等 / 二等 / 三等`) should derive from shared helpers in `src/battleV2/tierSystem.ts`; do not hand-annotate recovered showcase source files just to restore badge copy.
