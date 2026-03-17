# 明谋暗辩机制 - 规划设计文档

**版本**: v1.0  
**日期**: 2026-03-17  
**阶段**: 规划设计阶段  
**前置**: 需求分析文档 v1.0

---

## 一、技术选型

### 1.1 现有技术栈

| 层级 | 技术 | 版本 | 说明 |
|------|------|------|------|
| 框架 | React | 18.x | UI渲染 |
| 语言 | TypeScript | 5.x | 类型安全 |
| 构建 | Vite | 5.x | 开发服务器 |
| 状态管理 | useReducer | - | React内置 |
| 样式 | CSS-in-JS | - | 内联样式 |

### 1.2 新增技术决策

| 需求 | 决策 | 原因 |
|------|------|------|
| 状态持久化 | localStorage | 本地单机版，无需服务端存储 |
| 动画效果 | CSS Transitions | 性能好，实现简单 |
| 日志系统 | 结构化数组 | 便于追溯和调试 |

---

## 二、架构设计

### 2.1 整体架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        UI层 (BattleFrameV2.tsx)                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐      │
│  │ 手牌区渲染  │  │ 战场区渲染  │  │ 状态显示/动画       │      │
│  └─────────────┘  └─────────────┘  └─────────────────────┘      │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│                    Hook层 (useDebateBattle.ts)                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐      │
│  │ 状态管理    │  │ 定时器管理  │  │ AI决策触发          │      │
│  └─────────────┘  └─────────────┘  └─────────────────────┘      │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│                      引擎层 (engine.ts)                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐      │
│  │ 回合状态机  │  │ 结算引擎    │  │ 信息过滤            │      │
│  └─────────────┘  └─────────────┘  └─────────────────────┘      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐      │
│  │ 指令校验    │  │ 胜利判定    │  │ 日志生成            │      │
│  └─────────────┘  └─────────────┘  └─────────────────────┘      │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│                      类型层 (types.ts)                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐      │
│  │ DebatePhase │  │ BattleState │  │ PlannedAction       │      │
│  └─────────────┘  └─────────────┘  └─────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 模块职责

| 模块 | 文件 | 职责 |
|------|------|------|
| 类型定义 | types.ts | 所有类型、接口、常量定义 |
| 战斗引擎 | engine.ts | 状态机、结算逻辑、信息过滤 |
| Hook | useDebateBattle.ts | React状态管理、定时器、AI触发 |
| UI组件 | BattleFrameV2.tsx | 界面渲染、用户交互 |
| 卡牌数据 | cards.ts | 卡牌定义、卡组生成 |
| 论场数据 | arena.ts | 论场定义、效果配置 |

### 2.3 状态机设计

```
┌──────────────┐
│  turn_start  │ ← 回合开始：抽牌、资源恢复
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   submit     │ ← 同步提交：20秒倒计时
└──────┬───────┘
       │ 超时或双方确认
       ▼
┌──────────────┐
│   locked     │ ← 锁定：广播简报
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   reveal     │ ← 揭示：公开卡牌
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   resolve    │ ← 结算：六层顺序执行
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  turn_end    │ ← 回合结束：胜负判定
└──────┬───────┘
       │
       ├─── 未结束 ──→ 返回 turn_start
       │
       ▼
┌──────────────┐
│  finished    │ ← 游戏结束
└──────────────┘
```

### 2.4 数据流设计

```
用户操作
    │
    ▼
┌─────────────────┐
│  UI事件处理     │
│  (onClick等)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  dispatch       │
│  (BattleAction) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  battleReducer  │
│  (状态转换)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  newState       │
│  (新状态快照)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  UI重新渲染     │
└─────────────────┘
```

---

## 三、详细设计

### 3.1 类型系统扩展

#### 3.1.1 新增阶段枚举

```typescript
type DebatePhase = 
  | 'turn_start'   // 回合开始
  | 'submit'       // 同步提交
  | 'locked'       // 锁定
  | 'reveal'       // 揭示
  | 'resolve'      // 结算
  | 'turn_end'     // 回合结束
  | 'finished';    // 游戏结束
```

#### 3.1.2 新增动作类型

```typescript
type BattleAction =
  | { type: 'TICK' }
  | { type: 'SUBMIT_CARD'; cardId: string; zone: Zone; useToken: boolean }
  | { type: 'PASS' }
  | { type: 'CONFIRM_SUBMIT' }
  | { type: 'AI_AUTO_SUBMIT' }
  | { type: 'ADVANCE_PHASE' };
```

#### 3.1.3 新增信息过滤类型

```typescript
interface PublicSubmitInfo {
  submitted: boolean;
  zone: Zone | null;
  hasUsedToken: boolean;
}

interface RevealData {
  player: { cardId: string; zone: Zone } | null;
  enemy: { cardId: string; zone: Zone } | null;
}
```

### 3.2 引擎层设计

#### 3.2.1 阶段时长配置

```typescript
const PHASE_DURATION: Record<DebatePhase, number> = {
  turn_start: 2,
  submit: 20,
  locked: 1,
  reveal: 3,
  resolve: 5,
  turn_end: 2,
  finished: 0,
};
```

#### 3.2.2 结算顺序

```typescript
function resolveRound(state: BattleState): void {
  // Layer 1: 立论进场
  resolveThesisEntry(state);
  
  // Layer 2: 施策生效
  resolveStrategyEffects(state);
  
  // Layer 3: 议位胜负结算
  resolveSeatBattles(state);
  
  // Layer 4: 根基变化/离场
  resolveUnitDeath(state);
  
  // Layer 5: 大势/筹更新
  updateDaShiAndChou(state);
  
  // Layer 6: 胜利检查
  checkVictory(state);
}
```

#### 3.2.3 信息过滤函数

```typescript
function getPublicSubmitInfo(player: PlayerState): PublicSubmitInfo {
  return {
    submitted: player.submitAction !== null,
    zone: player.submitAction?.zone ?? null,
    hasUsedToken: player.submitAction?.useToken ?? false,
  };
}
```

### 3.3 UI层设计

#### 3.3.1 提交区组件

```tsx
interface SubmitZoneProps {
  zone: Zone;
  myCard: DebateCard | null;
  enemyPublicInfo: PublicSubmitInfo;
  phase: DebatePhase;
  onDrop: (cardId: string) => void;
}
```

#### 3.3.2 状态显示组件

```tsx
interface PhaseIndicatorProps {
  phase: DebatePhase;
  secondsLeft: number;
  round: number;
}
```

---

## 四、资源分配

### 4.1 模块开发分工

| 模块 | 开发内容 | 预计工时 | 依赖 |
|------|----------|----------|------|
| types.ts | 类型扩展 | 2h | 无 |
| engine.ts | 状态机重构 | 8h | types.ts |
| engine.ts | 结算引擎重构 | 6h | types.ts |
| engine.ts | 信息过滤实现 | 4h | types.ts |
| useDebateBattle.ts | Hook适配 | 4h | engine.ts |
| BattleFrameV2.tsx | 提交区UI | 6h | useDebateBattle.ts |
| BattleFrameV2.tsx | 揭示动画 | 4h | useDebateBattle.ts |
| BattleFrameV2.tsx | 结算显示 | 4h | useDebateBattle.ts |

**总计**: 约38小时

### 4.2 开发时间节点

| 阶段 | 时间 | 交付物 |
|------|------|--------|
| Day 1 | 类型定义、状态机设计 | types.ts更新 |
| Day 2-3 | 引擎层开发 | engine.ts重构 |
| Day 4 | Hook层适配 | useDebateBattle.ts更新 |
| Day 5-6 | UI层开发 | BattleFrameV2.tsx更新 |
| Day 7 | 集成测试 | 测试报告 |
| Day 8 | 优化完善 | 最终版本 |

---

## 五、接口设计

### 5.1 Hook接口

```typescript
interface DebateBattleController {
  state: BattleState;
  
  // 提交操作
  submitCard: (cardId: string, zone: Zone, useToken: boolean) => void;
  pass: () => void;
  confirmSubmit: () => void;
  
  // 信息获取
  getEnemyPublicInfo: () => PublicSubmitInfo;
  getRevealData: () => RevealData | null;
}
```

### 5.2 引擎接口

```typescript
// 状态转换
function battleReducer(state: BattleState, action: BattleAction): BattleState;

// 信息过滤
function getPublicSubmitInfo(player: PlayerState): PublicSubmitInfo;
function getRevealData(state: BattleState): RevealData | null;

// 结算
function resolveRound(state: BattleState): void;

// 胜利判定
function checkVictory(state: BattleState): Side | null;
```

---

## 六、测试策略

### 6.1 单元测试

| 测试项 | 测试内容 |
|--------|---------|
| 阶段转换 | 各阶段正确流转 |
| 信息过滤 | 公开信息正确隐藏 |
| 结算顺序 | 六层顺序正确执行 |
| 胜利判定 | 大势胜利正确触发 |

### 6.2 集成测试

| 测试项 | 测试内容 |
|--------|---------|
| 完整回合 | 从turn_start到turn_end |
| AI对战 | AI能正确提交和结算 |
| 超时处理 | 超时自动pass |
| 边界情况 | 空手牌、满槽位等 |

---

## 七、风险与应对

| 风险 | 应对措施 |
|------|---------|
| 状态机复杂度增加 | 使用严格的类型约束 |
| UI状态同步问题 | 统一使用reducer管理状态 |
| 动画性能问题 | 使用CSS动画，避免JS计算 |
| AI决策不合理 | 增加AI决策权重配置 |

---

## 八、确认清单

在进入开发实现阶段前，需确认：

- [ ] 技术选型已确定
- [ ] 架构设计已完成
- [ ] 接口设计已明确
- [ ] 时间节点已规划
- [ ] 测试策略已制定

---

**评审确认**：规划设计阶段完成，可进入开发实现阶段。

---

*文档版本：v1.0*  
*创建日期：2026-03-17*
