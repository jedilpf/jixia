# 项目可视化总览（Project Visualization）

> 生成时间：2026-03-23  
> 依据：当前仓库真实代码结构（`src/` 主链路）  
> 说明：当前会话未检测到可直接调用的 `super powers` MCP 接口，因此采用“代码扫描 + 可视化文档”方式输出。

## 1. 一句话理解项目

这是一个以“百家争鸣”为题材的卡牌对战项目，当前仓库采用 **单运行入口**：
- 唯一入口：`src/App.tsx -> MvpFlowShell`
- 当前战斗主线：`src/battleV2`（由 MvpFlowShell 驱动）

## 2. 入口与运行路径可视化

```mermaid
flowchart TD
  A[index.html] --> B[src/main.tsx]
  B --> C[src/App.tsx]
  C --> D[MvpFlowShell]
  D --> E[AppStoreProvider + useReducer]
  E --> F[Home -> Match -> Topic -> FactionPick]
  F --> G[Loading -> BattleScreen -> Result]
  G --> H[battleV2/useDebateBattle + battleV2/engine]
```

## 3. 架构分层图

```mermaid
graph LR
  subgraph UI层
    UI1[components/*]
    UI2[ui/screens/*]
    UI3[App.tsx]
  end

  subgraph 状态层
    ST1[app/store.tsx]
    ST2[app/reducer.ts]
  end

  subgraph 规则层A
    BA1[battleV2/useDebateBattle.ts]
    BA2[battleV2/engine.ts]
    BA3[battleV2/laneSystem.ts]
  end

  subgraph 规则层B
    CO1[core/gameEngine.ts]
    CO2[core/battleResolver.ts]
    CO3[core/issueSystem.ts]
    CO4[core/phaseMachine.ts]
  end

  subgraph 数据层
    DA1[data/game/cards.ts]
    DA2[data/game/factions.ts]
    DA3[data/game/issues.ts]
    DA4[data/game/gameConfig.ts]
  end

  subgraph 资源层
    AS1[public/assets/*]
    AS2[public/materials/*]
  end

  UI3 --> UI1
  UI3 --> UI2
  UI2 --> ST1
  ST1 --> ST2
  ST2 --> CO1
  CO1 --> CO2
  CO1 --> CO3
  CO1 --> DA1
  CO1 --> DA2
  CO1 --> DA3
  CO1 --> DA4

  UI1 --> BA1
  BA1 --> BA2
  BA2 --> BA3

  UI1 --> AS1
  UI1 --> AS2
```

## 4. 目录规模快照（代码扫描）

| 目录 | 文件数 | 说明 |
|---|---:|---|
| `src/` | 148 | 当前生效前端主代码 |
| `src/components/` | 68 | 主要 UI 与战斗展示组件 |
| `src/battleV2/` | 10 | 现行战斗机制核心（默认链路） |
| `src/app/` | 4 | 状态容器（MVP链路） |
| `src/core/` | 6 | 规则状态机（MVP链路） |
| `src/ui/` | 16 | MVP屏幕与组件 |
| `src/data/` | 9 | 游戏数据配置 |
| `src_new/` | 80 | 归档/探索代码（非当前主入口） |
| `scripts/` | 26 | 构建、门禁、流水线脚本 |
| `docs/` | 89 | 文档体系 |

## 5. 关键文件清单（建议先读）

1. `src/main.tsx`：前端启动入口。
2. `src/App.tsx`：当前唯一入口（直接进入 `MvpFlowShell`）。
3. `src/ui/screens/MvpFlowShell.tsx`：MVP流程壳层。
4. `src/battleV2/useDebateBattle.ts` + `src/battleV2/engine.ts`：当前战斗主线核心。
5. `src/components/BattleFrameV2.tsx`：战斗界面容器。
6. `src/data/cardsSource.ts` + `src/data/catalogAdapter.ts`：图鉴/战斗统一卡源读取口径。
7. `src/data/showcaseCards.ts`：当前活跃卡牌数据输入。
8. `src/data/game/*`：门派/议题/参数配置。

## 6. 给其他 AI 的推荐阅读顺序

```text
Step 1: src/main.tsx
Step 2: src/App.tsx
Step 3: src/ui/screens/MvpFlowShell.tsx + src/app/*
Step 4: src/components/BattleFrameV2.tsx
Step 5: src/battleV2/useDebateBattle.ts + src/battleV2/engine.ts
Step 6: src/data/cardsSource.ts + src/data/catalogAdapter.ts + src/data/showcaseCards.ts
Step 7: （如需）src/components/MainMenu.tsx + CardShowcase.tsx + CharactersView.tsx
Step 8: src/data/game/*
```

## 7. 当前结构审查结论（针对“可视化理解”）

- 当前项目主入口已收口为单链路：`src/App.tsx -> MvpFlowShell`。
- 当前战斗主线为 `battleV2`，图鉴与战斗卡源由 `cardsSource + catalogAdapter` 对齐。
- `src_new/` 与归档目录不属于活主线，阅读时应避免误判为当前实现范围。

## 8. 已知风险提示（不改代码，仅提示）

- 多个文件存在历史编码问题（注释/文案出现乱码），会影响团队阅读效率。
- 双链路并存导致新人容易“改错链路”。建议后续在 `App.tsx` 增加显式注释与模式说明。
- 文档较多且分散，建议把本文件作为入口索引固定在 `docs/dev/`。
