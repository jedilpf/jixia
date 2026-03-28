# Card Catalog Unification (2026-03-24)

## What Changed
- `content/cards/*.json` is now the single source of truth for collection/runtime card data.
- Legacy cards from:
  - `src/data/showcaseCards.ts`
  - `src/data/cardsDB.json`
  were batch-migrated into `content/cards` with `status: "planned"`.

## Runtime/Data Access Rules
- `src/data/cardsSource.ts` now reads only `src/generated/cardsRuntime.ts`.
- Exposed lists:
  - `CARDS`: full ledger (all statuses)
  - `ACTIVE_CARDS`: cards with `status === "active"`
  - `NON_ACTIVE_CARDS`: cards with non-active statuses

## UI Behavior
- Collection grid now renders all cards from the unified source.
- Non-active cards are locked/grey with status labels (for example: `未开放`).
- Detail browsing remains on `ACTIVE_CARDS` only, so current playable surface stays clean.

## Validation Alignment
- Playability/terminology/complexity checks are now enforced on `active` cards only.
- This allows planned/draft/rework/archive cards to stay in the ledger without breaking active-version gate rules.
