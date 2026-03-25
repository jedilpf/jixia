# Decisions

## Decision log

### 2026-03-24
- Decision: Use `AGENTS.md` + repository `.knowledge/` files as the primary persistent instruction and memory layer for Codex.
- Why: This is simpler, repo-local, versionable, and works without requiring a custom external memory service.
- Consequence: Durable project knowledge must be written back into `.knowledge/` files rather than left only in chat.

### 2026-03-24
- Decision: Keep gameplay rules, data definitions, and UI feedback logic separable.
- Why: The project is still evolving, and clean separation reduces AI-generated coupling mistakes.
- Consequence: Refactors should avoid blending authoritative battle rules into view-only components.

### 2026-03-24
- Decision: Integrate experimental tri-lane settings via additive harmony config in `src/prototypes/tri-lane` while preserving `battleV2` behavior.
- Why: The project needs rule iteration speed without destabilizing the current playable mainline.
- Consequence: New rule variants should be added as optional profile switches first, and only promoted to mainline after validation.

### 2026-03-24
- Decision: Standardize prototype harmony switching through a profile catalog (`profiles.ts`) and a single engine entry helper (`entry.ts`).
- Why: Multiple assistants and scripts need one stable integration point instead of ad-hoc per-call harmony wiring.
- Consequence: Future prototype integrations should prefer `harmonyProfileId + overrides` at entry level.

### 2026-03-24
- Decision: Establish `content/cards/*.json -> src/generated/cardsRuntime.ts` generation, and route active runtime imports through `src/data/cardsSource.ts` with legacy fallback.
- Why: We need single-source convergence without breaking current playable flow that still depends on legacy ids/structures.
- Consequence: New runtime card updates should be generated from `content/cards`; direct new imports from `showcaseCards.ts` should be avoided.

### 2026-03-24
- Decision: Standardize card lifecycle management with status enum `active/planned/draft/rework/archived`, and treat the current 12-card `content/cards` set as `active` baseline.
- Why: Temporarily out-of-version cards are project assets and should be downgraded by status, not deleted, to avoid asset loss and forgotten design history.
- Consequence: Default runtime and catalog flows should use `active` cards only; non-active cards remain in source as ledger inventory for future activation/rework.

### 2026-03-24
- Decision: Upgrade card source convergence from "generated + showcase fallback" to strict single-source `content/cards -> src/generated/cardsRuntime.ts`.
- Why: Keeping fallback reads from `showcaseCards.ts` left legacy card content drifting outside the ledger and weakened source-of-truth guarantees.
- Consequence: `src/data/cardsSource.ts` now serves `CARDS/ACTIVE_CARDS/NON_ACTIVE_CARDS` from generated data only; legacy files are no longer active catalog sources.

### 2026-03-24
- Decision: Enforce playability/terminology/complexity validations on active cards only.
- Why: Planned/draft/rework/archive cards must stay in the repository ledger without blocking active-version gate checks.
- Consequence: Large legacy planned-card migrations can coexist with strict active-card quality gates.

### 2026-03-24
- Decision: Keep gallery image resolution on shared helper with migrated-id compatibility (`LEG-SC-*` / `BS01-*`), and use `assets/card-back.png` as fallback.
- Why: After legacy migration, many card ids no longer matched historical image filenames directly, causing visual "missing cards" despite assets still existing.
- Consequence: Collection list/detail can remain on unified catalog ids without breaking image visibility during migration.

### 2026-03-24
- Decision: Remove Electron-only skip path for UI audio initialization in main app flow.
- Why: Skipping `uiAudio.init()` by runtime caused hover/click SFX to fail entirely in packaged runtime.
- Consequence: Audio initialization now follows user gesture rather than runtime flavor, making behavior consistent between browser and electron packaging.

### 2026-03-25
- Decision: Resolve catalog duplicates by archiving duplicate legacy entries instead of deleting files, and exclude `archived` cards from normal collection views.
- Why: The project wants a complete historical card ledger, but repeated user-facing cards in the collection are confusing and break the intended "active first, legacy traceable" UX.
- Consequence: Duplicate legacy cards remain inspectable in source, while collection pages and duplicate validation operate on non-archived cards only.

### 2026-03-25
- Decision: Canonicalize faction aliases during legacy migration/duplicate validation using card name + normalized faction identity.
- Why: Legacy sources use mixed naming (`儒家/礼心殿`, `墨家/玄匠盟`), and raw string comparison allowed the same card to be imported twice.
- Consequence: Re-running legacy migration now skips already represented cards, and structure validation catches future user-visible duplicates before runtime generation.

### 2026-03-25
- Decision: Preserve legacy user-facing card categories through optional `display_type` metadata in `content/cards`, and let runtime generation prefer it over raw structured `type` when building collection-facing card data.
- Why: Legacy `事件` and `反制` cards were being flattened into `技能`, which made the catalog lose intended design semantics even though the structured source still needed constrained runtime types.
- Consequence: Legacy/source-migrated cards can stay structurally valid for tooling while the collection UI and other readers still see the intended visible type labels.

### 2026-03-25
- Decision: Share collection ordering through `cardsSource.ts` exports instead of letting grid/detail views each derive their own active-card order.
- Why: Grid grouping by explicit faction order and detail paging by raw `ACTIVE_CARDS` order produced inconsistent navigation and made the collection feel unstable.
- Consequence: Collection screens should use shared ordered exports (`COLLECTION_CARDS`, `ACTIVE_COLLECTION_CARDS`) whenever navigation or grouping order matters.

## Format
For future entries, use:
- Decision:
- Why:
- Consequence:
