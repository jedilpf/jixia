# 更早争鸣史恢复审计（2026-04-09）

## 本次使用的更早恢复源

- `2d2135978dabfb78a91d268c5522fbf67b771a13`
- 时间：`2026-04-01 15:59:47 +0800`
- 提交说明：`feat(story): 完善争鸣史第一章剧情，修复重复节点，增加NPC对话`

## 本次直接恢复到工作区的文件

- `src/game/story/data/prolog.ts`
- `src/ui/screens/StoryScreen.tsx`
- `src/components/MainMenu.tsx`
- `docs/story/STORY_IDENTITY_FRAMEWORK_v1.md`

## 恢复前保护措施

- 已创建本地快照分支：
  - `backup/snapshot-20260409-214823-before-earlier-story-recovery`
- 已创建对应工作区快照 stash：
  - `183610e5497e6cab4d3a790f445fe34246925edf`

## 已检查但未直接覆盖的更早文件

以下 story 相关文件在更早 dangling commits 中存在差异，但当前本地保存点 `0371396` 已经包含更新或更长版本，因此本次未直接覆盖：

- `src/game/story/StoryEngine.ts`
- `src/game/story/data/chapterMoru001.ts`
- `src/game/story/data/chapterMoru001_part2.ts`
- `docs/PROJECT_MEMORY.md`
- `docs/story/STORY_BACKEND_ARCHITECTURE.md`
- `docs/story/STORY_SAVE_SYSTEM_FINAL.md`
- `docs/story/STORY_SAVE_SYSTEM_PLAN.md`
- `docs/story/STORY_SAVE_SYSTEM_V2.md`

## 额外结论

- `真名` 相关的姓名输入方案文档检查过更早提交 `8fbf03f65da38dcc1c105a8c3472ff2b41a09888`，当前仓库中对应信息并未缺失，因此这次未单独恢复该文档。
- 到目前为止，针对“争鸣史 / 真名相关”的更早 recover 点，最明确值得恢复的主文件就是 `prolog.ts` 与 `StoryScreen.tsx`。

## 第二轮继续恢复结论

- 当前本地保存点为 `0371396e627bc86085ea0c2ed79efce8ce6e6473`（`2026-04-09 21:37:47 +0800`，`save: 保存7天工作进度 (2026-04-09)`）。
- 在更早 dangling commits 中继续筛查后，没有发现除以上 4 个文件之外、还能明确补回且优于当前保存点的 story 主链文件。
- `StoryEngine.ts`、`types.ts`、`chapterMoru001_part2.ts` 等文件在当前保存点中已经等于或优于更早点版本，因此本轮未覆盖。
- `docs/PROJECT_MEMORY.md`、`docs/story/STORY_BACKEND_ARCHITECTURE.md`、`docs/story/STORY_SAVE_SYSTEM_*` 在当前保存点中已等于较新的 recover 版本，本轮未覆盖。
