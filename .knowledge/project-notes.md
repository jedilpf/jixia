# Project Notes

## Stable conventions
- Battle logic should remain easy to inspect and debug.
- Prefer explicit rule resolution over overly generic effect engines in early-stage prototypes.
- UI must make card placement and resolution state obvious to the player.
- Changes should support future expansion of factions, cards, and turn-phase rules.
- When integrating new rule ideas, prefer additive compatibility switches in isolated prototype layers instead of replacing stable mainline behavior.
- For prototype-only rule variants, expose a profile catalog and a single engine entry helper to reduce integration drift across AI collaborators.
- Active runtime card reads should import from `src/data/cardsSource.ts` instead of directly importing `showcaseCards.ts`.
- Card assets in `content/cards` should be lifecycle-managed by `status` transitions (`active/planned/draft/rework/archived`) instead of file deletion when cards are temporarily out of scope.
- Card catalog source-of-truth is now `content/cards/*.json` (via `src/generated/cardsRuntime.ts`); `showcaseCards.ts` and `cardsDB.json` are legacy inputs only for one-time migration.
- Gameplay/deck/runtime consumption should use `ACTIVE_CARDS`; full `CARDS` is for collection ledger views where non-active cards may be shown as locked.
- Gate checks for playability/terminology/complexity should evaluate active cards only, so planned/draft/rework/archive cards can remain in ledger without blocking active-version iteration.
- UI asset references should use shared helpers (`getAssetUrl`, `getCardImageUrl`) to avoid environment-specific path drift between list/detail/audio.
- Collection faction grouping should follow explicit `FACTION_ORDER` and per-card `catalogOrder`, not `Set` insertion order from data arrays.
- During card-source migration, image lookup should normalize migrated ids (e.g., `LEG-SC-*`, `BS01-*`) before building `/assets/cards/*` paths, and fall back to `assets/card-back.png` when no reliable mapping exists.
- UI sound initialization should not be disabled by runtime-flavor checks; initialize `uiAudio` on user gesture and keep playback path logic shared across web/electron packaging.
- Archived duplicate ledger cards should remain in `content/cards` for history, but normal collection views should exclude `status=archived` so users do not see repeated cards.
- Legacy catalog migration and duplicate validation should normalize faction aliases (e.g. `儒家/礼心殿`, `墨家/玄匠盟`) before comparing card identity, otherwise the same card can be imported twice under different naming schemes.
- Legacy cards may need an explicit `display_type` field in `content/cards` so generated collection data can preserve user-facing labels like `事件` and `反制` while keeping structured runtime `type` values constrained.
- Collection list and detail views should share the same ordered active-card source (`ACTIVE_COLLECTION_CARDS`) instead of each screen deriving its own order.
- Collection rendering should defensively de-duplicate non-archived cards by normalized identity (`display-faction + normalized-name`) with status priority (`active > planned > draft > rework`) so near-duplicate legacy entries cannot appear twice in gallery views.
- Duplicate validation should normalize card names (trim + remove spaces/punctuation + lowercase) in addition to faction alias mapping; exact-string-only checks are not enough for migration-era data.
- Main app audio/path fixes should preserve the existing `newFlow` branch gate unless the entry-mainline decision is explicitly revisited.
- Battle presentation components should resolve card art, frame art, and battle backgrounds through `getCardImageUrl` / `getAssetUrl` instead of raw `assets/...` strings or id whitelists, so migrated ids and packaged base paths stay consistent.
- Default application entry should be MVP flow (`MvpFlowShell`), while legacy flow should be opt-in via `?legacyFlow=1` for regression only.
- CI lint checks should be blocking in PR workflows to prevent style and naming drift from entering mainline.
- Cache/temporary artifacts listed in `.gitignore` (notably `.vite/` and `backups/`) should remain untracked in git.
- Node test execution should use the compiled `.tmp/test-dist` output with a preparation step that rewrites unresolved `@/` requires and generates a directory entry file, so `node --test .tmp/test-dist/tests` runs reliably on Windows shells.
- In sandboxed Windows runs where Node test subprocess spawning is restricted, run tests with `node --test --test-isolation=none` against the compiled index entry to avoid `spawn EPERM`.
- Test-specific asset path behavior should be isolated through `tests/stubs/assets.ts` rather than changing runtime asset helpers.
- `src_new/` should remain archived from tracked mainline; new implementation work should target `src/` + MVP flow modules only.
- Repo-local skill `.agents/skills/jixia-workflow-guard/` is the project-specific shortcut for task-packet discipline, mainline guardrails, verification order, and dirty-worktree-safe gating.
- The most useful installed global companion skills for this repository are `$develop-web-game`, `$playwright`, `$gh-fix-ci`, and `$security-best-practices`.
- Long-running migrations, catalog recovery, and cross-module cleanup work should reference `docs/standards/standards-guide-stable-delivery-v1.md` plus `docs/standards/standards-checklist-omission-audit-v1.md` so "stable output" and "nothing hidden/missing" are checked by process, not memory.
- Active app entry is now fixed to `src/App.tsx -> MvpFlowShell` with no query-based flow split in the active path; legacy flows remain code-level references only.
- Active-mainline boundary excludes `.vite/`, `backups/`, `review/`, `review_bundle_*/`, and `src_new/`; these should not be treated as primary implementation scope.
- Active mainline should bootstrap UI audio in `src/App.tsx` without runtime-flavor early returns, then let UI components call `uiAudio.playHover/playClick` safely.
- Asset URL building for screen-level media should use shared helpers in `src/utils/assets.ts` (`getAssetUrl`, `getAudioAssetUrl`, `getCardImageUrl`, `getCharacterImageUrl`) instead of ad-hoc local `asset()` implementations.

## Working preferences
- Favor small, reviewable diffs.
- Explain non-obvious rule assumptions near the code.
- Keep AI-collaboration-friendly structure and naming.
- For long-form planning documents, prefer append-only versioned addenda (e.g., v1.2 additions) instead of rewriting prior sections.

## Known implementation tendencies
- When uncertain, inspect existing flow before proposing new abstractions.
- Prefer data-driven card definitions where practical.
- Avoid mixing visual animation logic with authoritative rule resolution.
- When introducing data-source convergence, use compatibility bridges first, then retire legacy sources after validation.
