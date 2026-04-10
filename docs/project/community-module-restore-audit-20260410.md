# Community Module Restore Audit

Date: 2026-04-10
Task: `TASK-20260410-185`

## Goal
- Restore the existing community module back into the app shell.
- Preserve the current workspace and avoid destructive rollback operations.

## Preservation First
- A full local snapshot was created before restore work:
  - backup branch: `backup/snapshot-20260410-083555-before-community-restore-20260410`
  - stash hash: `2e4091c9bfd5848dea6b4133b15067f4bc83023b`
- No reset, checkout, or delete was used during this restore.

## What Was Actually Missing
- The community source files were still present under:
  - `src/community/`
  - `src/components/community/`
  - `src/hooks/useCommunityState.tsx`
- The missing layer was integration:
  - `src/App.tsx` did not mount `CommunityProvider`
  - `src/components/MainMenu.tsx` did not expose a community entry or render `CommunityModal`

## Restored Scope
- `src/App.tsx`
  - Mounted the existing `CommunityProvider` around the app content.
- `src/components/MainMenu.tsx`
  - Added a community quick-action button in the top-right menu tools.
  - Added `CommunityBadge` on that entry.
  - Rendered `CommunityModal` when the community entry is active.
- `src/components/community/CommunityModal.tsx`
  - Opens community home on entry using the specific stable action.
  - The header publish action now opens the composer.
  - Closing the modal now persists community UI state through `closeCommunity()`.

## Non-Goals
- No rewrite of the community data layer.
- No broad restore from older commits.
- No deletion of unrelated current code.
