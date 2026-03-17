# 百家争鸣 Web 重构执行单（MVP）

## 目标
- 规则逻辑与 React 展示解耦。
- 规则可调（通过 `src/data/game` 配置）。
- UI 可迭代（通过 `src/ui/screens`、`src/ui/components` 迭代）。
- 保留旧流程可用，逐步迁移，避免一次性推翻。

## 当前已落地
- 新规则层：`src/core/*`
- 新配置层：`src/data/game/*`
- 新状态层：`src/app/*`
- 新页面壳：`src/ui/screens/*` + `src/ui/components/*`
- 新入口开关：`?newFlow=1`
  - 默认：仍走旧版流程
  - `?newFlow=1`：进入新 MVP 流程

## 新架构目录
```txt
src/
  core/
    gameEngine.ts
    phaseMachine.ts
    battleResolver.ts
    issueSystem.ts
    selectors.ts
    types.ts

  data/game/
    cards.ts
    factions.ts
    issues.ts
    balance.ts
    gameConfig.ts

  app/
    store.tsx
    actions.ts
    reducer.ts
    selectors.ts

  ui/
    screens/
      HomeScreen.tsx
      MatchScreen.tsx
      TopicScreen.tsx
      FactionPickScreen.tsx
      LoadingScreen.tsx
      BattleScreen.tsx
      ResultScreen.tsx
      MvpFlowShell.tsx
    components/
      CardView.tsx
      SlotView.tsx
      IssueBar.tsx
      HandBar.tsx
```

## AI 禁改边界
1. 不得修改 `src/core` 的公共函数签名（新增函数允许，破坏性变更不允许）。
2. 不得删除 `src/data/game` 的字段，只能增量扩展。
3. 不得在 `src/ui` 中写规则计算（仅渲染 + 派发 action）。
4. 旧流程文件改动需最小化，默认只通过 `?newFlow=1` 测试新流程。
5. 每次改动前先列出将修改的文件清单。
6. 禁止整文件重写，优先增量 patch。

## 下一步执行顺序
1. 在 `main_action` 增加“每回合最多 2 张、最多 1 张施策”的 UI 提示与可交互反馈。
2. 将“锁定议题效果”接入 `resolveRound`（目前只做了进度与锁定判定）。
3. 补门派特性（先做 4 个门派被动）。
4. 把新战斗页的槽位从 `main/side` 扩展成 `left/mid/right` 三路结构。
5. 补最小动画（回合切换、结算高亮、议题锁定提示）。

## 本地启动
- 旧流程：`npm run dev`
- 新流程：访问 `http://127.0.0.1:4174/?newFlow=1`（端口按本地 dev 端口调整）

