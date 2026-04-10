# Weekly Record Comparison 2026-04-10

## Scope

Compare the major repository records from the past week (`2026-04-03` to `2026-04-10`) across:

- Git commits
- AI task files
- recovery and audit artifacts

## Record Layers

### Layer 1: commit-level record

Highest precision for concrete file diffs.

Key commits in this window:

- `a19eee3` — `fix: 统一主菜单按钮间距`
- `0371396` — `save: 保存7天工作进度 (2026-04-09)`
- `10c2d2a` — `feat: 建立AI团队架构和记忆系统`

### Layer 2: task-level record

Best for understanding work themes and intended deliverables.

Representative task ranges:

- `TASK-20260407-145` to `TASK-20260407-148`
- `TASK-20260408-149` to `TASK-20260408-156`
- `TASK-20260409-156` to `TASK-20260409-180`
- `TASK-20260410-181` to `TASK-20260410-182`

### Layer 3: audit and recovery record

Best for understanding why things changed or were restored.

Representative docs:

- `docs/project/recent-code-loss-audit-20260409.md`
- `docs/project/earlier-story-recovery-audit-20260409.md`
- `docs/project/card-library-recovery-audit-20260409.md`
- `docs/project/card-art-history-relink-audit-20260409.md`

### Layer 4: operational trace

Best for reconstructing resets and restore workflow.

- `git reflog`
- `backup/*` branches

## Commit Comparison

### `a19eee3`

Scope:

- only `src/components/MainMenu.tsx`

Meaning:

- a small focused UI fix
- not a weekly archive
- useful only if the target question is specifically about main-menu spacing

### `0371396`

Scope:

- massive weekly save point
- `116` files under `public`
- `58` files under `ai`
- `37` files under `src`
- `26` files under `docs`
- also includes `scripts`, `server`, `test`, `.knowledge`, `package.json`

Meaning:

- the broadest single save point for the week
- includes large mixed work: assets, tasks, docs, runtime code, backend, community module, battleV2 support files
- best candidate when the question is “what did we have before the later recovery turbulence?”

Limits:

- this is a snapshot save, not a curated clean release
- many files were added in bulk, so it is wide but noisy

### `10c2d2a`

Scope:

- much narrower than `0371396`
- `11` files under `ai`
- `9` files under `src`
- `6` files under `docs`
- `5` files under `public`
- `5` files under `memory`

Meaning:

- not a full weekly save
- a curated post-recovery layer on top of `0371396`
- focused on:
  - story recovery
  - 169-card library restore
  - card art relinking
  - tier label restore
  - AI team / memory system setup

Direct delta versus `0371396`:

- modifies `MainMenu`, `StoryScreen`, `prolog`, `tierSystem`, `CardGrid`, `CardDetail`, `CardLibraryPanel`, `assets.ts`, `showcaseCards.ts`
- adds recovery-task files `174-179`
- adds memory-system docs and AI workflow docs
- modifies `public/assets/btn-story.png`
- modifies `public/assets/cards/wannong7-10.png`

## Practical Difference Gradient

### Strongest “everything from the week” anchor

- `0371396`

Why:

- widest file coverage
- closest thing to a one-shot archive of mixed progress

### Strongest “post-recovery curated state” anchor

- `10c2d2a`

Why:

- smaller, more intentional
- captures the recovery-era decisions and relinking work

### Strongest “single-topic fix” anchor

- `a19eee3`

Why:

- one-file UI adjustment only

## Task Cluster Comparison

Approximate grouping for the visible task set in this week:

- `数值与三阶`: `7`
- `社区`: `7`
- `卡图与图鉴`: `8`
- `BP与文案`: `3`
- `恢复与Git`: `7`
- `其他`: `6`

Interpretation:

- the week was not dominated by one single line of work
- the heaviest concentration was split across:
  - card art / collection recovery
  - balance / tier work
  - community module work
  - restore / snapshot / audit work

## Recovery Signal

`git reflog` confirms multiple resets and later restore actions on `2026-04-09`.

Interpretation:

- commit chronology alone is not enough
- when reconstructing “what existed,” combine:
  - `0371396`
  - `10c2d2a`
  - task files
  - recovery audit docs

## Best Use of Each Record

If the question is “which point is the fullest weekly archive?”

- use `0371396`

If the question is “which point best reflects the recovered state after code-loss handling?”

- use `10c2d2a`

If the question is “which point contains the tiny menu spacing fix?”

- use `a19eee3`

If the question is “what work themes happened this week?”

- use the `ai/tasks` directory first

If the question is “why did files move or disappear?”

- use the audit docs and reflog together

## Unknowns

- Exact per-task code completeness before `0371396` cannot be proven only from commit titles; some tasks have a file record but may not map cleanly to a finalized runtime state.
- Some restored content may exist in backup branches or stash history beyond what is visible from these three commits alone.
