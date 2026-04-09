# Card Library Recovery Audit (2026-04-09)

## Summary
- Current local `src/data/showcaseCards.ts` had regressed to `65` raw card records.
- The last trusted baseline matching the user's "169-card library" expectation is commit `7b5d2de`.
- That baseline contains `170` raw showcase records and `169` collection-visible entries.

## Recovery basis
- Restored file: `src/data/showcaseCards.ts`
- Restore source: `git show 7b5d2de:src/data/showcaseCards.ts`
- Restore reason: `7b5d2de` is the last validated card-source version before later local expansions to `176` and `190`, and it matches the historical 170-card runtime baseline already documented in the project.

## Count verification
- Raw showcase records after restore: `170`
- Collection-visible count after name/faction dedupe: `169`
- Duplicate identity pair causing `170 -> 169`:
  - `稗言社::舆论漩涡`
  - IDs: `baiyan5`, `baiyan10`

## Notes
- `cardsSource.ts` and `catalogAdapter.ts` were left unchanged.
- The recovery intentionally restores the historical 169-card collection experience without reintroducing later 176/190-card expansions.
