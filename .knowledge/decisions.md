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

### 2026-03-25
- Decision: Replace remaining battle presentation asset literals with shared asset helpers, including battleV2 card art lookup.
- Why: Raw `assets/...` strings and whitelist-based jpg guesses drifted from migrated card ids and from packaged/electron base-path behavior, causing battle visuals to lag behind the collection fixes.
- Consequence: Battle presentation surfaces should consume helper-generated URLs, while existing card/content files remain untouched.

### 2026-03-25
- Decision: Converge app entry to MVP-by-default and keep legacy flow behind explicit query `?legacyFlow=1`.
- Why: Dual-entry defaults caused collaboration drift and made "current mainline" ambiguous during implementation and review.
- Consequence: Normal runs and acceptance should target MVP flow first; legacy route remains available only for explicit regression checks.

### 2026-03-25
- Decision: Make PR lint checks blocking and remove tracked cache/backup artifacts covered by `.gitignore`.
- Why: Non-blocking lint and tracked generated caches increased mainline entropy and made repository hygiene rules ineffective.
- Consequence: Lint failures now stop PR validation, and `.vite/` / `backups/` artifacts are kept out of tracked source history.

### 2026-03-25
- Decision: Keep `npm test` on CommonJS-compiled test output and normalize compiled imports via `scripts/pipeline/prepare-test-dist.cjs`.
- Why: ESM test output introduced extension/alias runtime issues in Node test runner (`import.meta` compile constraints, unresolved `@/` aliases, and directory target execution mismatch on Windows).
- Consequence: Test compilation uses `tsconfig.test.json` with CJS settings, and preparation script handles alias rewrite plus `tests/index.js` bootstrap so `node --test .tmp/test-dist/tests` remains stable.

### 2026-03-25
- Decision: Complete `src_new/` archive convergence by removing tracked `src_new/**` files from active git history on mainline branch.
- Why: Keeping a second unmaintained source tree tracked in parallel keeps entry ownership ambiguous and increases accidental edit risk.
- Consequence: Active implementation scope is `src/` mainline only; legacy `src_new` content remains accessible through history when needed.

### 2026-03-25
- Decision: Enforce gallery identity de-duplication using normalized keys (`display-faction + normalized-name`) with status-preference selection.
- Why: During legacy/source convergence, exact-string duplicate checks can miss near-identical card identities and cause perceived repeat cards across gallery visibility states.
- Consequence: Collection views keep one preferred non-archived representative per visible identity (favoring active cards), while source files remain untouched.

### 2026-03-25
- Decision: Run Node tests with `--test-isolation=none` in the default `npm test` script for this repository.
- Why: The current Windows sandbox environment blocks test-runner subprocess spawning (`spawn EPERM`) under default isolation.
- Consequence: Test execution remains deterministic and CI/local verification can run from the compiled test index without subprocess isolation.

### 2026-03-25
- Decision: Formalize long-running delivery guardrails and omission audits as repository standards documents.
- Why: Stable output in this project depends on preventing hidden content, drifting data ownership, and unverifiable handoffs; keeping that rule only in chat is too fragile.
- Consequence: Future migrations, catalog work, and cross-module cleanup tasks should follow `docs/standards/standards-guide-stable-delivery-v1.md` and `docs/standards/standards-checklist-omission-audit-v1.md`, and reviewers can use the checklist as a repeatable acceptance aid.

### 2026-03-25
- Decision: Converge to a single active app entry (`src/App.tsx -> MvpFlowShell`) and remove query-parameter flow splitting from active entry behavior.
- Why: Dual-entry runtime branching keeps ownership ambiguous and causes collaborators to patch the wrong flow.
- Consequence: Legacy UI/battle stacks stay as archive/regression code only; active implementation and acceptance target the MVP entry path.

### 2026-03-25
- Decision: Explicitly classify `.vite/`, `backups/`, `review/`, `review_bundle_*/`, and `src_new/` as non-mainline boundary directories.
- Why: These directories create cognitive noise and increase accidental edits when treated as active project scope.
- Consequence: Mainline work, review, and AI task scopes should avoid these directories unless a task explicitly targets cleanup/archive operations.

### 2026-03-25
- Decision: Move audio bootstrap responsibility to active `App` flow and remove runtime-flavor dependency from initialization behavior.
- Why: UI feedback should not disappear in Electron-like runtimes due to early-return branches; audio init and base volume belong to active entry infrastructure.
- Consequence: `src/App.tsx` now initializes `uiAudio`, applies baseline volume, and preloads hover SFX through shared asset helpers without runtime checks.

### 2026-03-25
- Decision: Standardize screen-level media URL generation on `src/utils/assets.ts` helper functions.
- Why: Repeated local `asset()` path builders drift over time and make audio/image behavior inconsistent across screens and packaging targets.
- Consequence: Transition and pre-battle visual asset modules now resolve media via shared helpers, reducing path strategy fragmentation.

## Format
For future entries, use:
- Decision:
- Why:
- Consequence:
