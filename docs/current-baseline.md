# Current Baseline (2026-03-25)

## 1) Frontend Mainline

- Default entry flow: `MvpFlowShell` (MVP UI flow).
- Legacy flow is regression-only and can be opened with query param:
  - `?legacyFlow=1`
- Legacy files remain for comparison and fallback, but are not the default product path.

## 2) Battle Mainline

- Default battle experience should follow the MVP flow stack.
- `BattleFrameV2` / `src/battleV2/**` are considered legacy-compatible surfaces.
- Legacy battle changes are allowed only when explicitly requested (bugfix/regression scope).

## 3) Card Data Source of Truth

- Single source: `content/cards/*.json`
- Generated runtime source: `src/generated/cardsRuntime.ts`
- Runtime import surface: `src/data/cardsSource.ts`
- Legacy files (`src/data/showcaseCards.ts`, `src/data/cardsDB.json`) are migration inputs, not active source-of-truth.

## 4) Collection and Runtime Contract

- Runtime/deck/gameplay uses `ACTIVE_CARDS`.
- Collection ledger can use `CARDS` and should display non-active cards as locked or unopened.
- Do not delete card assets because they are temporarily out of scope; change `status` instead.

## 5) Engineering Gates (Minimum)

- Local checks:
  - `npm run typecheck`
  - `npm test`
  - `npm run gate:daily`
- PR checks:
  - `gate:daily`
  - `typecheck`
  - `lint` (blocking)

## 6) Repository Hygiene

- Cache and temporary artifacts must not be tracked:
  - `.vite/`
  - `backups/`
- Keep review and archive outputs out of the active code path and out of mandatory runtime dependencies.
