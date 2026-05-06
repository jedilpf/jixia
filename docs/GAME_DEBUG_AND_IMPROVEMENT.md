# 《思筹之录》游戏体验问题诊断与改进方案

## 一、核心问题诊断

### 问题1：用户看不到手牌（或不知道看到了什么）

**可能原因：**
- 卡牌没有图片（`card.art` 为空），只显示深色背景 + 卡片名称
- 卡牌框架图片 `assets/frames/frame-lilun.png` 可能不存在，导致卡牌几乎全黑
- BottomControls 的手牌区域没有文字说明"这是你的手牌"

**验证方法：**
- 打开浏览器 DevTools → Elements，检查 `.flex-1.px-2.py-3` 下是否有子元素
- 或者直接 `console.log(state.player.hand)` 打印状态

---

### 问题2：用户不知道如何出牌（最关键）

**根本原因：**
- 没有操作提示告诉用户"拖拽卡牌到议区"或"点击卡牌选中，再点击议区"
- 议区（zhu_yi / pang_yi）没有明确标注"把卡牌拖到这里"

**当前 UI 反馈：**
- `OperationHints` 组件存在但可能内容不够清晰
- `SeatArea` 的座位枢纽只显示"议"/"旁"图标，没有"放置卡牌"引导

---

### 问题3：AI 对手行为不透明

**可能情况：**
- AI 静默自动出牌，用户不知道 AI 在干什么
- AI 出牌后，对方的 CardSlot 显示背面问号，用户不知道里面是什么

---

## 二、必须立即修复的（阻塞体验）

### 2.1 手牌区域加标题

**位置：** BottomControls 左上角手牌数量旁边
**当前：** 只显示卡牌，没有标签
**修改：** 显示"手牌（5张）"或类似文字

### 2.2 议区加放置引导文字

**位置：** BattleArena 中央论道坛场
**当前：** 只显示座位枢纽图标
**修改：** 在座位上方或下方加文字提示"→ 拖拽卡牌到此处"
**拖拽激活时：** 座位边框发光 + 文字变为"松开放置"

### 2.3 确认出牌按钮行为

**当前流程：** 点击卡牌 → 点击座位 → 点击确认 → 出牌

**问题：** 步骤太多，且"确认出牌"按钮在哪个阶段可用不清晰

**建议简化：** 拖拽到座位 → 松开直接出牌（不需要确认按钮）
**当前实现情况：** engine.ts 的 `handlePlanCard` 在 drop 时被调用，理论上直接拖拽应该可以直接出牌

### 2.4 锁定按钮显示问题

**需要确认：** "锁定第一手"/"锁定第二手"按钮是否显示？位置在哪？

---

## 三、完整游戏流程说明（供验证参考）

以下是目前 engine.ts 实现的完整游戏流程：

### 开局
```
createInitialBattleState()
  → createPlayer() 创建玩家和AI，各自有12张牌组
  → drawCards(player, 5)  → 手牌5张
  → drawCards(enemy, 5)  → AI手牌5张
  → phase = 'play_1', secondsLeft = 40
```

### 每回合（play_1）
```
40秒倒计时开始
玩家：选牌（点击或拖拽）→ 选座位（点击或拖拽）→ 出牌
AI：  aiAutoPlan() 自动选最佳牌 → layer1CardId 设置 → 锁定

双方都锁定（或倒计时归零）→ 推进到 resolve_1
```

### resolve_1（立即）
```
立论 → summonUnit 进议区
策术 → applySpellEffect 立即触发
主议/旁议 各自结算
```

### play_2（40秒）
同 play_1，但 layer2

### resolve_2（立即）
同 resolve_1

### 回合结算
```
consumeChouIfNeeded()  消耗筹
resolveCombat()         议区对比，+1大势/+1筹/平局各-1根基
checkVictory()          检查是否有人达到8大势
drawCards()            补手牌到5张
进入下一回合
```

---

## 四、UI 组件清单与当前状态

| 组件 | 文件 | 功能 | 状态 |
|------|------|------|------|
| TopStatusBar | layers/TopStatusBar.tsx | 回合/阶段/计时器/大势/势/筹 | ✅ 已显示 |
| BattleArena | layers/BattleArena.tsx | 议区 + CardSlot | 🔶 座位枢纽可见，但缺少放置引导 |
| BottomControls | layers/BottomControls.tsx | 手牌区 + 结束回合 | 🔶 手牌可见但缺标题 |
| OperationHints | controls/OperationHints.tsx | 操作提示 | 🔶 可能不够清晰 |
| LockButton | controls/EndTurnButton.tsx | 结束回合/锁定 | ✅ "结束回合"按钮已显示 |

---

## 五、当前已实现的交互

### 玩家操作（代码已支持）

| 操作 | 实现方式 |
|------|---------|
| 点击选卡 | `onClick={() => onSelectCard(card.id)}` in BottomControls |
| 点击选座位 | `onClick={() => isSelectable && onSelect(seatId)}` in SeatArea |
| 确认出牌 | `handleConfirm → planCard(slot, cardId)` |
| 拖拽出牌 | react-dnd `useDrag` + `useDrop`（我今天加的） |
| 取消已出卡牌 | CardSlot onClick → `cancelLayer1/cancelLayer2` |
| 锁定 | "结束回合"按钮 → `lockLayer1()` / `lockLayer2()` |

### AI 自动操作

- `aiAutoPlan()` 在 `useDebateBattle` 中被调用
- `phase === 'play_1'` 且 `!enemy.plan.lockedLayer1` 时，AI 自动出牌
- AI 出牌后立即锁定 `enemy.plan.lockedLayer1 = true`

---

## 六、用户实际操作流程（应该是这样的）

```
第1回合开始
├── play_1 阶段（40秒倒计时）
│   ├── 玩家：点击手牌中一张牌 → 牌被选中（高亮）
│   ├── 玩家：点击"主议"或"旁议"座位 → 座位被选中
│   ├── 玩家：点击"确认出牌" → 牌从手牌消失，出现在CardSlot
│   │           （策术立即触发效果，立论进入议区）
│   └── 玩家：点击"结束回合" → 锁定，进入resolve_1
│
├── resolve_1 阶段（自动）
│   ├── 双方出牌揭晓
│   ├── 立论进议区，策术触发
│   └── 主议/旁议各自判胜负
│
├── play_2 阶段（40秒倒计时）
│   └── 同play_1，可出第二张牌
│
└── resolve_2 + 回合结算
    ├── 双方出牌揭晓
    ├── 议区结算：主议赢+1大势，旁议赢+1筹
    └── 补手牌到5张，进入第2回合
```

---

## 七、待确认的具体问题（需要你告诉我答案）

1. **手牌到底有没有？** 打开浏览器 DevTools，在 Elements 面板里找 `<div class="flex-1 px-2 py-3..."`，看看里面有没有子元素（卡牌按钮）

2. **卡牌是全黑的吗？** 如果是，说明框架图片 `assets/frames/frame-lilun.png` 不存在

3. **点击"结束回合"有反应吗？** 这可以验证 game loop 到底跑没跑

4. **左上角的计时器在走吗？** 看40s倒计时是否在减少

5. **座位枢纽（"议"/"旁"方块）可以点击吗？** 点击有高亮反应吗

---

## 八、行动计划

### 立即修复（我知道该修的）
1. BottomControls 手牌区加"手牌"标题文字
2. BattleArena 座位枢纽加"放置引导"文字（拖拽时显示）
3. DragGhostLayer 确保在拖拽时渲染

### 需要你验证后才能修的
4. 卡牌图片/框架是否缺失 → 需要你确认浏览器实际情况
5. OperationHints 操作提示是否清晰 → 需要你告诉我看不看得懂

### 需要你做决策的
6. "确认出牌"按钮是否保留？（拖拽能否直接出牌？）
7. AI 出牌时是否要显示 AI 正在出牌？（还是静默自动）

---

*本策划目的是：诊断问题 + 提供修复方向 + 让你判断优先级*
