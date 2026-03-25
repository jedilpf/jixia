# Current Baseline (2026-03-25)

## 1) Frontend Mainline

- Single active app entry: `src/App.tsx -> MvpFlowShell` (MVP UI flow).
- Query-based flow splitting is not part of active entry policy.
- Legacy files remain for comparison and fallback, but are not active product entry.
- `src_new/` legacy experiment tree is archived out of tracked mainline and should not be used as an active development target.

## 2) Battle Mainline

- Single active battle mainline: MVP flow stack (`src/app/**`, `src/core/**`, `src/ui/screens/**`, `src/ui/components/**`).
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
- Test runtime note:
  - `npm test` compiles TypeScript tests to `.tmp/test-dist` and then runs `scripts/pipeline/prepare-test-dist.cjs` to normalize alias imports and generate a directory entry for Node test runner.
- PR checks:
  - `gate:daily`
  - `typecheck`
  - `lint` (blocking)

## 6) Repository Hygiene

- Legacy/archive boundary directories are out of active mainline:
  - `.vite/`
  - `backups/`
  - `review/` and `review_bundle_*/`
  - `src_new/`
- Cache and temporary artifacts must not be tracked:
  - `.vite/`
  - `backups/`
- Keep review and archive outputs out of the active code path and out of mandatory runtime dependencies.

## 7) Stable Delivery References

- Stable long-running execution guardrail:
  - `docs/standards/standards-guide-stable-delivery-v1.md`
- Omission / hidden-content audit checklist:
  - `docs/standards/standards-checklist-omission-audit-v1.md`
