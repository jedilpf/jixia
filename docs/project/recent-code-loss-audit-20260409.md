# Recent Code Loss Audit (2026-04-09)

## Summary

The repository shows clear evidence that some recent tracked-file edits were overwritten by Git reset operations today, while a large amount of other recent work still exists on disk as untracked files.

This means the user's report mixes two situations:

1. Some recent tracked-file edits were likely reset back to older committed content.
2. Many recent additions are still present locally, but they are untracked and therefore not part of the branch history.

## Evidence

### 1. Two resets happened today

`git reflog --date=iso -20` shows:

- `2026-04-09 19:38:56 +0800`: `reset: moving to HEAD`
- `2026-04-09 21:12:41 +0800`: `reset: moving to fed84f9`

### 2. Tracked source files were rewritten at the same timestamps

Filesystem timestamps line up with those resets:

- `33` files under `src/server/docs/public` were rewritten around `2026-04-09 19:38:57`
- `7` files under `src/server/docs/public` were rewritten around `2026-04-09 21:12:41`

Representative `src/` files touched at `19:38:57`:

- `src/App.tsx`
- `src/battleV2/cards.ts`
- `src/battleV2/engine.ts`
- `src/components/BattleFrameV2.tsx`
- `src/components/CardShowcase.tsx`
- `src/components/showcase/CardGrid.tsx`
- `src/components/showcase/CardDetail.tsx`
- `src/utils/assets.ts`
- `src/game/story/data/chapterMoru001.ts`

Representative `src/` files touched at `21:12:41`:

- `src/components/battle/panels/CardLibraryPanel.tsx`
- `src/data/showcaseCards.ts`
- `src/game/story/types.ts`
- `src/game/story/data/chapterMoru008.ts`
- `src/ui/screens/StoryScreen.tsx`

### 3. A recent commit was created and then orphaned

`git reflog` also shows:

- `2026-04-09 21:09:35 +0800`: commit `1840c77` (`fix: 统一主菜单按钮间距，移除不一致的mb-*类`)
- `2026-04-09 21:12:41 +0800`: reset back to `fed84f9`

`git fsck --full --no-reflogs --unreachable --lost-found` confirms that `1840c77` is now an unreachable commit.

This commit is still recoverable if needed, but it only appears to contain a small set of menu/doc changes, not the full set of lost work.

### 4. Many recent files are not lost; they are still untracked

`git status --short` shows a very large set of untracked recent files, including code and assets created in the last two days.

Examples still present locally:

- `src/community/`
- `src/components/community/`
- `src/hooks/useCommunityState.tsx`
- `server/routes/auth.cjs`
- `server/routes/users.cjs`
- `server/store/user-store.cjs`
- `src/utils/performanceMonitor.ts`
- `src/utils/renderOptimization.tsx`
- `src/utils/resourceLoader.tsx`
- many `public/assets/cards/*.png|jpg`
- many `docs/project/*.md`

## Diagnosis

The current branch state suggests the following:

- The large "code loss" feeling is real for tracked files that were being edited before the resets.
- The resets likely overwrote uncommitted tracked-file changes in place.
- A separate body of recent work still exists on disk because it was created as new untracked files rather than committed changes.
- There is no evidence that all recent work disappeared; a lot of it is still recoverable directly from the current filesystem.

## Recovery Sources

### Recoverable from Git right now

- Unreachable commit `1840c77`
- Old stashes from earlier dates:
  - `stash@{0}` on `feature/story-integration-20260328`
  - older March stashes on `feature/story-mode-20260327`

These may help for specific pieces, but they do not appear to cover the full set of today's overwritten tracked-file edits.

### Likely not recoverable from current branch history alone

Tracked-file edits overwritten by the `19:38:56` and `21:12:41` resets, unless they also exist in:

- IDE local history
- editor autosave/history
- another clone or backup
- unreachable blobs that are manually matched file-by-file

## Recommended Next Steps

1. Do not run more reset/checkout commands on this worktree until recovery is done.
2. Snapshot the current worktree before recovery attempts.
3. Preserve all current untracked files first, because they still contain a lot of recent work.
4. Recover the easy Git objects first:
   - inspect unreachable commit `1840c77`
   - inspect any relevant stash content
5. For overwritten tracked files, use IDE local history or manual blob recovery if needed.

## Practical Conclusion

The repository was not "randomly deleting code".

What happened is more specific:

- recent tracked edits were likely wiped by at least two Git reset operations today
- many other recent additions are still here, but only as untracked files

So this is a mixed Git-state problem, not a total data-loss event.
