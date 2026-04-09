# Card Art Verification Baseline

Date: 2026-04-09

## Purpose
- Keep the card codex from regressing back to blank or partially missing artwork.
- Verify that every showcase card id has a real physical file under `public/assets/cards`.
- Catch wrong-extension drift before runtime falls back to generic faction art again.

## Command
```bash
npm run audit:card-art
```

## Current baseline
- Showcase card count: 170
- Expected result: `missing=0, mismatched=0`
- Audit source: `src/data/showcaseCards.ts`
- Audit target: `public/assets/cards`

## Rule of thumb
- A runtime fallback is not considered complete delivery.
- If a card id is part of the active showcase pool, it should have a direct on-disk asset file with the extension expected by `src/utils/assets.ts`.
- Temporary faction/universal backfills may be replaced later by bespoke single-card art, but the file name and extension contract should stay stable.
