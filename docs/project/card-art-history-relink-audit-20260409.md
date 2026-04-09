# Card Art History Relink Audit (2026-04-09)

## What was wrong
- The restored card corpus returned to the historical `170` raw cards / `169` collection-visible baseline.
- `public/assets/cards/` already contained physical single-card artwork for all `170` card ids.
- The actual display failure was in `src/utils/assets.ts`: the helper still defaulted most ids to `.jpg`, while a large late-batch portion of the historical card art inventory had already been stored as `.png`.

## Verified asset inventory
- Card ids in `src/data/showcaseCards.ts`: `170`
- Card ids with at least one physical art file under `public/assets/cards`: `170`
- Card ids that prefer `.png` over `.jpg`: `97`
- Card ids that still use `.jpg`: `73`

## Relink strategy
- Keep the restored `showcaseCards.ts` card source unchanged.
- Recover card-art linkage by expanding the extension preference map in `src/utils/assets.ts`.
- Prefer `.png` whenever both `.png` and `.jpg` exist, because the `.png` files are the later dedicated single-card art batch for this corpus.

## Examples of recovered ids
- `pangtong -> /assets/cards/pangtong.png`
- `jianai -> /assets/cards/jianai.png`
- `tiangong10 -> /assets/cards/tiangong10.png`
- `xinglin6 -> /assets/cards/xinglin6.png`
- `mingxiang10 -> /assets/cards/mingxiang10.png`
- `youce8 -> /assets/cards/youce8.png`
- `wannong7 -> /assets/cards/wannong7.png`
- `xiangyishuli -> /assets/cards/xiangyishuli.png`

## Verification
- Helper-level relink check: `170 / 170` card ids now resolve to an existing physical file.
- `src/utils/assets.ts` lint passes.
