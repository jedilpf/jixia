---
title: "游戏策划约束文档"
description: "《思筹之录》所有 AI 协作必须遵守的核心约束"
date: 2026-05-03
version: "1.0"
status: "active"
---

# 游戏策划约束文档

本文档是《思筹之录》所有游戏机制、交互流程、代码实现的**唯一权威依据**。
所有 AI 代理在修改相关代码前必须先阅读本文档，并以本文档为准。

---

## 一、资源体系（强制，不可修改）

游戏中**只有以下 6 种资源**，不得新增：

| 资源名 | 用途 | 代码字段 |
|--------|------|---------|
| 势 | 出牌费用 | `player.resources.cost` |
| 辩锋 | 攻击力 | `unit.power` |
| 学识 | 生命值 | `unit.hp` / `unit.maxHp` |
| 大势 | 胜利积分，先到 8 赢 | `player.resources.dashi` |
| 筹 | 费用折扣（-1），最多 1 个，自动使用 | `player.resources.chou` |
| 护体 | 护盾值 | `player.resources.guyin` |

**禁止出现的废弃名称**：用度、根基、护印、心证、灵势、证立、失序、文脉、机变

---

## 二、卡牌类型（强制，只有 2 种）

| 类型 | 行为 | 结算时机 |
|------|------|---------|
| 立论 | 放置到议区，持续在场形成场面 | 结算阶段 resolve |
| 策术 | 放置时**立即触发效果**，不驻场 | 放置时立即执行 |

**禁止出现的废弃类型**：反诘、门客、玄章、驳论、设问

---

## 三、议区规则（强制）

- 每位玩家有 **2 个议区**：`zhu_yi`（主议）、`pang_yi`（旁议）
- 每个议区最多 **3 张卡**
- 议区容量在**出牌规划时**验证（`handlePlanCard`），不在结算时才报错
- **不是**三席双层，**不是**6 个格子，就是 2 个议区

---

## 四、两层出牌阶段（强制）

每回合分为 4 个阶段：

```
play_1 → resolve_1 → play_2 → resolve_2 → lane 结算 → 下一回合
```

| 阶段 | 时长 | 可操作 | 锁定条件 |
|------|------|--------|---------|
| play_1 | 40s | 最多出 1 张牌到主议/旁议 | 玩家主动锁定 or 倒计时归零 |
| resolve_1 | — | 不可操作 | — |
| play_2 | 40s | 最多出 1 张牌 | 同上 |
| resolve_2 | — | 不可操作 | — |

**倒计时归零时的行为**（engine.ts TICK handler）：
1. 检查 `canAdvanceFromCurrentPlayPhase(state)` — 双方是否都已锁定
2. 若有一方未锁定，先强制锁定该方（不等待）
3. 双方都锁定后，推进到下一阶段

---

## 五、出牌交互约束（强制）

### 5.1 拖拽出牌

- 手牌区（BottomControls 的 HandCard）提供**拖拽源**
- 议区（BattleArena 的 SeatArea）提供**drop 目标**
- 拖拽进入议区时：**可放置**显示绿色边框高亮，**已满**显示红色遮罩
- 拖拽离开时高亮消失

### 5.2 取消已出卡牌

- 点击已出卡牌（CardSlot）→ 调用 `CANCEL_LAYER1` 或 `CANCEL_LAYER2`
- **已锁定的 layer 不可取消**
- 取消后：该 layer 的 `layer1CardId`/`layer2CardId` 设为 null，`usedCost` 重算
- 取消时**势自动返还**（通过重新调用 `evaluatePlanCost` 重算）

### 5.3 锁定按钮

- 显示当前 layer 的锁定状态
- 点击后设置 `lockedLayer1`/`lockedLayer2` = true
- 锁定后立即检查 `canAdvanceFromCurrentPlayPhase`，双方都锁定则推进阶段

### 5.4 费用验证

- `handlePlanCard` 中调用 `evaluatePlanCost` 验证：`rawCost <= player.resources.cost` 或 `rawCost - 1 <= player.resources.cost`（有筹时）
- 费用不足时**拒绝出牌**
- 策术扣势：在 `handlePlanCard` 成功出牌后，势立即扣除

---

## 六、策术立即触发（强制）

- 策术卡在 `handlePlanCard` 中检测 `card.type === '策术'`
- 立即调用 `applySpellEffect`，效果立即生效
- 日志写入 `next.logs`
- 不等待 resolve 阶段

---

## 七、结算约束（强制）

### 7.1 consumePlannedCard 行为

- **立论**：从手牌移除，**不进入弃牌堆**（以 SeatUnit 形式存在于议区）
- **策术**：从手牌移除，进入弃牌堆
- 不得让同一张卡牌对象同时出现在议区和弃牌堆

### 7.2 胜利判定

- **每次 resolveLayer 后立即检查** `checkVictory`
- 大势达到 8（`DASHI_TARGET`）立即进入 `finished` 阶段
- **不得延迟到回合末才检查**

### 7.3 筹（Chou）消耗

- 筹在 `finalizeRound` 的 `consumeChouIfNeeded` 中消耗
- 每个回合最多消耗 **1 个**筹
- 筹对 total rawCost 减 1，而非每层分别减 1

---

## 八、AI 评估函数约束

`evaluateAICard` 函数中：
- `state.enemy` = AI 自己，`state.player` = 人类对手
- 变量名必须反映这个语义（用 `ai` / `opponent`，不用 `enemy` / `player`）
- 策术伤害评估中威胁度应看**对手场上的单位**，而非对手手牌

---

## 九、Zone / Seat / SeatId 术语（强制）

- 统一使用 `SeatId = 'zhu_yi' | 'pang_yi'`
- `types.ts` 中的 `Zone = 'main' | 'side' | 'prep'` 为废弃类型，**不得在新代码中使用**
- `SUBMIT_CARD` action 中的 `zone` 参数待清理

---

## 十、组件架构约束

- `BattleFrameV2` 是 battleV2 的唯一入口组件
- 所有 battle 状态通过 `useDebateBattle` hook 访问
- `DragManager` 的 RAF 平滑拖拽引擎保留，复用不重写
- 拖拽实现使用 `react-dnd`

---

## 十一、文档与代码关系

1. **文档是唯一方向**：本文档是最高权威，代码实现必须服从本文档
2. **代码与文档冲突时**：以本文档为准修改代码，不修改本文档
3. **发现文档错误时**：提出到 `open_questions.md`，不经确认不得自行修改本文档
4. **每次实现前**：必须先读本文档，再读对应模块的设计文档

---

## 十二、相关文档索引

- `docs/game-rules/card-playing-mechanics.md` — 出牌交互设计（拖拽/取消/锁定）
- `docs/game-rules/drag-drop-mechanics.md` — 拖拽技术实现方案
- `docs/game-rules/card-system-core-design.md` — 卡牌系统核心设计
- `docs/game-rules/card-terminology-standard.md` — 术语规范
- `src/battleV2/engine.ts` — 战斗引擎 reducer
- `src/battleV2/types.ts` — 类型定义

---

**文档版本**：v1.0
**最后更新**：2026-05-03
**状态**：active，所有 AI 必须遵守
