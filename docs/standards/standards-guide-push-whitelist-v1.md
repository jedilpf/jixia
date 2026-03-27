# 推流准入白名单与评估规范 v1

Date: 2026-03-27  
Repo: `jedilpf/jixia`  
Branch (local): `feature/story-mode-20260327`

## 1. 目的

这份文档用于回答两个问题：

1. 什么样的文件可以进推流（提交/推送）  
2. 当前这批“未推流改动”里，哪些可以留，哪些应该先拦住

原则：**先收口主线，再推流；不把噪音和临时产物混进主线提交。**

## 2. 文件准入评估方法（固定流程）

### 2.1 三段判定

每个文件都按以下顺序判定：

1. `Scope`：是否属于当前任务范围、是否属于主线目录  
2. `Signal`：是否是实质改动（逻辑/内容），而不是 BOM/行尾/格式噪音  
3. `Safety`：是否通过最小验证，且不会拖入无关风险

### 2.2 三类结果

- `PASS`：允许进入本轮推流白名单  
- `HOLD`：改动有价值，但需先清理（如 trailing whitespace、待补验证）  
- `REJECT`：不应进入本轮推流（缓存/备份/临时/实验/无关噪音）

### 2.3 快速评估命令

```powershell
git status --porcelain=v1
git diff --numstat
git diff --cached --numstat
git diff --cached --check
npm run typecheck
```

判定要点：

- `1 1` 且首行出现不可见字符变化，通常是 BOM 噪音  
- `git diff --cached --check` 报 trailing whitespace，默认 `HOLD`  
- `typecheck` 若失败，必须标出失败是否由本轮文件引起

## 3. 当前未推流改动（2026-03-27 快照）

## 3.1 已提交但未进入 `origin/main`

| 提交哈希 | 提交说明 | 状态 | 结论 |
|---|---|---|---|
| `2b51a30` | `docs(workflow): enforce conflict arbitration protocol for all AI` | 已提交（本地分支） | 可保留，待按分支策略合并 |
| `2e6b77a` | `feat(ui): restore level/opportunity progression flow in MVP` | 已提交（本地分支） | 可保留，需按主线策略评估入 main 时机 |

## 3.2 本地已暂存（候选白名单）

| 文件路径 | 类型 | 当前状态 | 评估结果 | 原因 |
|---|---|---|---|---|
| `src/core/types.ts` | 代码 | 已暂存 | PASS | `ScreenId` 增加 `story`，主线接线必要 |
| `src/game/story/StoryEngine.ts` | 代码 | 已暂存 | PASS | Story 模块核心实现，改动实质明确 |
| `src/game/story/types.ts` | 代码 | 已暂存 | PASS | Story 类型契约，扩展性正常 |
| `src/game/story/data/prolog.ts` | 数据/脚本 | 已暂存 | PASS | Prolog 内容数据，属于同一功能链 |
| `src/game/story/index.ts` | 代码 | 已暂存 | PASS | Story 模块导出接线 |
| `src/ui/screens/StoryScreen.tsx` | 代码 | 已暂存+未暂存补丁 | PASS | 页面实现有效，且后续补丁修正了打字逻辑闭包问题 |
| `src/ui/screens/index.ts` | 代码 | 已暂存 | PASS | 导出 `StoryScreen` 的必要接线 |
| `docs/story/STORY_*.md`（6个） | 文档 | 已暂存 | HOLD | 内容可保留，但存在 trailing whitespace，需先清理 |
| `docs/DAILY_REPORT_2026-03-27.md` | 文档 | 已暂存 | HOLD | 报告可留，但建议独立文档批次提交 |

## 3.3 本地未暂存（不建议直接推）

| 文件路径 | 类型 | 当前状态 | 评估结果 | 原因 |
|---|---|---|---|---|
| `.vite/deps/_metadata.json` | 缓存 | 未暂存删除 | REJECT | 构建缓存，不应进主线功能提交 |
| `.vite/deps/package.json` | 缓存 | 未暂存删除 | REJECT | 构建缓存，不应进主线功能提交 |
| `src/components/MainMenu.tsx` | 代码 | 未暂存 | REJECT | BOM/编码噪音（非功能改动） |
| `src/components/battle/BattleBoardSync.css` | 代码 | 未暂存 | REJECT | BOM/编码噪音 |
| `src/components/battle/EnhancedCardBattleView.tsx` | 代码 | 未暂存 | REJECT | BOM/编码噪音 |
| `src/components/battle/SyncBattlePage.css` | 代码 | 未暂存 | REJECT | BOM/编码噪音 |
| `src/components/battle/SyncBattleUI.css` | 代码 | 未暂存 | REJECT | BOM/编码噪音 |
| `src/ui/components/index.ts` | 代码 | 未暂存 | REJECT | BOM/编码噪音 |
| `src/ui/screens/FactionPickScreen.tsx` | 代码 | 未暂存 | REJECT | BOM/编码噪音 |
| `src/ui/screens/HomeScreen.tsx` | 代码 | 未暂存 | REJECT | BOM/编码噪音 |
| `src/ui/screens/ResultScreen.tsx` | 代码 | 未暂存 | REJECT | BOM/编码噪音 |
| `docs/archive/**` 多文件 | 文档 | 未暂存 | REJECT | 归档文档格式噪音，不应混入主线 |

## 3.4 仅本地未跟踪（默认不推）

以下路径默认 `REJECT`，除非当前任务明确要求：

- `.tmp/**`
- `archive/**`
- `backups/**`
- `review/**`
- `src_new/**`
- `ai/out/**`（任务包产物）
- 大批新增资源与实验文件（如 `public/assets/UI/**`、零散新增卡图）  

## 4. 这轮建议的最小可推流包

仅建议先推进“主线功能最小集”：

1. `src/core/types.ts`
2. `src/game/story/StoryEngine.ts`
3. `src/game/story/types.ts`
4. `src/game/story/data/prolog.ts`
5. `src/game/story/index.ts`
6. `src/ui/screens/StoryScreen.tsx`（含未暂存逻辑修正后再纳入）
7. `src/ui/screens/index.ts`

文档类（`docs/story/**` 与 `docs/DAILY_REPORT_2026-03-27.md`）建议后置为独立提交批次。

## 5. 推流前最后检查清单

- [ ] 本次提交文件都在任务允许范围内
- [ ] 不含 `.vite`、`.tmp`、`archive`、`backups`、`review`、`src_new`
- [ ] 不含 BOM/行尾噪音文件
- [ ] `git diff --cached --check` 无告警
- [ ] `typecheck` 失败项已定位，且确认不是本次白名单引入
- [ ] 提交前向用户给出：文件列表 + diff 摘要 + 风险点
- [ ] 得到用户“OK，可以进仓”后再执行提交/推送

## 6. 一句话执行规则

**能进推流的文件 = 主线范围内的实质改动 + 可验证 + 可回滚；其余一律先拦截。**
