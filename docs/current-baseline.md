# Current Baseline (2026-03-26)

## 1. 唯一前端主线

- 唯一默认入口：`src/App.tsx -> MvpFlowShell`
- 已去除 active entry 的 `newFlow=1` 分流。
- `src/App_legacy.tsx` 仅保留为历史回归参考，不作为主线入口。

## 2. 唯一战斗主线

- 当前战斗主线：`src/battleV2/**`（由 `MvpFlowShell` 驱动）。
- 主线验收默认以 battleV2 行为为准。
- 历史链路只用于回归对照，不参与新改动验收口径。

## 3. 唯一活跃卡牌数据源（当前阶段）

- 当前 battleV2 与图鉴统一读取链路：
  - `src/data/showcaseCards.ts`（活跃卡源）
  - `src/data/catalogAdapter.ts`（统一适配层）
  - `src/data/cardsSource.ts`（业务读取出口）
- 目标是先保证图鉴与 battleV2 数据口径一致，避免“图鉴只剩 content/cards 12 张”的误收口。
- `content/cards/*.json` 继续保留为资产台账与后续迁移基础，不在本轮收口中直接替代展示/战斗活源。

## 4. Legacy / Archive 目录边界

以下目录不属于活开发主线：

- `src_new/`
- `.vite/`
- `backups/`
- `review/`
- `review_bundle_*/`

## 5. 处理建议（不破坏现有内容）

1. `src_new/`：保持归档，不新增改动；需要历史对照时只读。
2. `.vite/`：确保持续忽略并停止跟踪缓存产物。
3. `backups/`：只作为离线备份，不进入主线 PR 变更范围。
4. `review/` 与 `review_bundle_*/`：保留审查记录，但与运行时代码解耦。

### 建议执行命令（仅停止跟踪，不删除本地文件）

```bash
git rm -r --cached --ignore-unmatch src_new .vite backups review review_bundle_*
git add .gitignore docs/current-baseline.md
```

说明：
- `--cached` 只从版本控制中剥离，不会删除本地目录内容。
- 以上目录后续只作为归档/审查产物，不进入活主线开发与验收范围。

## 6. 当前收口验收最小项

- `npm run typecheck`
- `npm test`
- `npm run lint:ci`
- PR Workflow 中 lint 采用 blocking，不再作为提醒项。
