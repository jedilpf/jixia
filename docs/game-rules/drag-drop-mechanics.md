---
title: "拖拽出牌交互实现方案"
description: "基于 DragManager 的卡牌拖拽实现规格"
date: 2026-05-03
version: "1.0"
status: "implementing"
---

# 拖拽出牌交互实现方案

## 1. 现状分析

### 1.1 现有基础设施

| 组件 | 状态 | 说明 |
|------|------|------|
| `DragManager.ts` | ✅ 可用 | RAF平滑拖拽引擎，支持 pointer 事件，payload 传递卡牌数据 |
| `DragGhost.tsx` | ✅ 可用 | 跟随鼠标的卡牌幽灵层，通过 DragManager 订阅 |
| `BattleFrameV2.tsx` | 🔶 需改造 | 当前使用点击选卡流程 |
| `BottomControls.tsx` | 🔶 需改造 | 手牌区，需要接 pointer down 事件 |
| `BattleArena.tsx` | 🔶 需改造 | 议区，需要接 drop 事件 + 显示已出卡牌 |

### 1.2 当前交互流程（点击模式）

```
点击手牌 → selectedCardId 状态 → 点击议区座位 → setTargetSeat
→ 点击确认按钮 → planCard(slot, cardId)
```

### 1.3 目标交互流程（拖拽模式）

```
PointerDown 手牌 → DragManager.startDrag → DragGhost 显示卡牌
→ 拖拽到议区座位 → 高亮目标座位
→ Drop → planCard(slot, cardId) + setTargetSeat
→ 已出卡牌显示在 CardSlot（layer1/layer2）
→ 点击已出卡牌 → cancelLayer1/cancelLayer2
```

---

## 2. 技术方案

### 2.1 依赖

```bash
npm install react-dnd react-dnd-html5-backend
```

**说明**：DragManager 已有完整的 RAF 平滑拖拽，但缺少 DnD 核心框架的 drop 目标检测和 drag overlay 机制。react-dnd 提供：
- `useDrag` / `useDrop` Hook
- `DndProvider` 上下文
- HTML5 Backend（标准的 drag & drop 感知）

DragManager 的价值在于帧时间补偿 Lerp（帧率无关平滑）和旋转阻尼，这个保留，只用 react-dnd 做 drop 目标检测和 DragSource。

### 2.2 架构决策

**方案选择**：react-dnd 整合 DragManager

- `DragManager` 的 RAF 平滑引擎保留，只改造事件绑定方式
- react-dnd 提供 `useDrag` / `useDrop` API 替代手写 pointer event
- `DragGhost` 通过 `useDragLayer` 自定义实现（基于 DragManager）

**关键约束**：
- 保持向后兼容：点击选卡流程仍然可用（用于无法拖拽的场景）
- drag payload 携带完整卡牌数据 `{ card, sourceSlot: 'layer1'|'layer2' }`
- `BattleArena` 的 `SeatArea` 作为 drop 目标，通过 `useDrop` 注册

---

## 3. 组件改造规格

### 3.1 BattleFrameV2.tsx 改造

```
变更点：
1. 引入 DndProvider（包裹整个 BattleFrameV2）
2. 引入并渲染 DragGhostLayer（DragManager 驱动的幽灵卡）
3. 将 planCard/setTargetSeat/cancelLayer1/cancelLayer2 透传给子组件
```

```tsx
// 新增导入
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DragGhostLayer } from './battle/DragGhostLayer';

// 新增 props 透传
const { state, planCard, setTargetSeat, lockLayer1, lockLayer2, cancelLayer1, cancelLayer2 } = useDebateBattle(...);

// 渲染 DndProvider + DragGhostLayer
<BattleFrameV2Wrapper>
  <DndProvider backend={HTML5Backend}>
    <DragGhostLayer />
    {children}
  </DndProvider>
</BattleFrameV2Wrapper>
```

### 3.2 BottomControls.tsx 改造（HandCard 拖拽源）

```
变更点：
1. HandCard 组件添加 drag source 行为（useDrag）
2. card.collect: monitor = dragSourceManager
3. isDragging 时卡牌半透明 + 不可点击
4. 不再依赖外部 onPointerDown，由 react-dnd 接管
```

```tsx
import { useDrag } from 'react-dnd';
import { DRAG_CARD_TYPE } from './battle/dndTypes';

const [{ isDragging }, dragRef] = useDrag({
  type: DRAG_CARD_TYPE,
  item: (monitor) => ({
    card,
    sourceSlot: phase === 'play_1' ? 'layer1' : 'layer2',
  }),
  canDrag: (monitor) => isPlayable && !locked,
  collect: (monitor) => ({
    isDragging: monitor.isDragging(),
  }),
});

// 在卡牌按钮上绑定 dragRef
<button
  ref={dragRef}
  style={{ opacity: isDragging ? 0.4 : 1 }}
  ...
/>
```

### 3.3 BattleArena.tsx 改造（议区 drop 目标）

```
变更点：
1. 每个 SeatArea 组件添加 drop target 行为（useDrop）
2. drop 时调用 planCard + setTargetSeat
3. drag over 时高亮座位边框（绿色/金色）
4. CardSlot（已出卡牌）点击触发 cancel
```

```tsx
import { useDrop } from 'react-dnd';
import { DRAG_CARD_TYPE } from './battle/dndTypes';

// SeatArea 组件内
const [{ isOver, canDrop }, dropRef] = useDrop({
  accept: DRAG_CARD_TYPE,
  canDrop: (item) => {
    // 容量检查
    return playerSeat.units.length < playerSeat.maxUnits;
  },
  drop: (item) => {
    const { card, sourceSlot } = item;
    // 自动推断 targetSeat（高亮的是哪个座位）
    // planCard(sourceSlot, card.id)
    // setTargetSeat(sourceSlot, seatId)
    onDropCard({ card, sourceSlot, targetSeat: seatId });
  },
  collect: (monitor) => ({
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop(),
  }),
});
```

### 3.4 DragGhostLayer 组件（新建）

```
目的：在 react-dnd 体系中复用 DragManager 的 RAF 平滑引擎
```

```tsx
// DragGhostLayer.tsx
// 订阅 DragManager，在 DragManager 激活时渲染卡牌预览
// 不直接依赖 react-dnd，作为视觉层叠加在 BattleFrameV2 上
// 使用 useDragLayer 手动实现（参考 DragGhost.tsx 的逻辑）
```

### 3.5 dndTypes.ts（新建）

```tsx
// 统一所有 drag 类型定义
export const DRAG_CARD_TYPE = 'card';
export const DRAG_ATTACK_TYPE = 'attack';

export interface CardDragItem {
  type: typeof DRAG_CARD_TYPE;
  card: DebateCard;
  sourceSlot: 'layer1' | 'layer2';
}

export interface AttackDragItem {
  type: typeof DRAG_ATTACK_TYPE;
  unitId: string;
}
```

---

## 4. 座位自动推断逻辑

拖拽时，`BattleArena` 需要知道鼠标当前悬停在哪个座位上，以便在 drop 时正确调用 `setTargetSeat`。

```
拖拽开始（BottomControls）：
  → DragManager 记录 card 数据
  → DragGhost 显示卡牌预览

拖拽中（BattleArena）：
  → 两个 SeatArea（zhu_yi / pang_yi）各自判断 isOver
  → 高亮 isOver=true 的座位

拖拽结束（BattleArena onDrop）：
  → 识别哪个座位 isOver → targetSeat
  → sourceSlot 由 card.item.sourceSlot 传入（layer1 或 layer2）
  → dispatch planCard(sourceSlot, card.id)
  → dispatch setTargetSeat(sourceSlot, targetSeat)
```

---

## 5. 已出卡牌的取消交互

`CardSlot`（BattleArena 中显示 layer1/layer2 已规划卡牌）添加点击取消：

```
CardSlot onClick:
  → 调用 cancelLayer1 / cancelLayer2
  → UI 上卡牌消失
  → 手牌重新显示该卡
```

条件：
- 未锁定（`!lockedLayer1` / `!lockedLayer2`）
- 有已出卡牌（`layer1CardId` / `layer2CardId` 非 null）

---

## 6. 高亮视觉反馈

```
拖拽进入议区：
  → isOver && canDrop → 绿色边框 + 发光效果
  → isOver && !canDrop → 红色遮罩 + 禁止图标

点击已出卡牌（未锁定）：
  → 显示"取消"确认
  → 点击确认 → cancelLayer → 卡牌消失回手牌

点击已出卡牌（已锁定）：
  → 无反应 / 显示锁定图标
```

---

## 7. 阶段与可用性约束

| 阶段 | 可拖拽 | 可取消 | 可放置座位 |
|------|--------|--------|-----------|
| play_1 | ✅ layer1 | ✅ layer1（未锁定） | 主议/旁议 |
| play_2 | ✅ layer2 | ✅ layer2（未锁定） | 主议/旁议 |
| resolve_1 | ❌ | ❌ | — |
| resolve_2 | ❌ | ❌ | — |
| finished | ❌ | ❌ | — |

---

## 8. 改动文件清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/components/battle/dndTypes.ts` | 新建 | drag 类型定义 |
| `src/components/battle/DragGhostLayer.tsx` | 新建 | DragManager 驱动的 ghost 层 |
| `src/components/battle/layers/BottomControls.tsx` | 修改 | HandCard 接 useDrag |
| `src/components/battle/layers/BattleArena.tsx` | 修改 | SeatArea 接 useDrop + CardSlot 点击取消 |
| `src/components/BattleFrameV2.tsx` | 修改 | DndProvider + DragGhostLayer + cancelLayer 透传 |
| `package.json` | 修改 | 添加 react-dnd react-dnd-html5-backend |

---

## 9. 实施顺序

```
Step 1: 安装依赖
  npm install react-dnd react-dnd-html5-backend

Step 2: 新建 dndTypes.ts
  定义 DRAG_CARD_TYPE 和 CardDragItem 类型

Step 3: 新建 DragGhostLayer.tsx
  复用 DragManager RAF 引擎，作为视觉层

Step 4: BottomControls.tsx
  给 HandCard 加上 useDrag，保留 onClick 兼容

Step 5: BattleArena.tsx
  SeatArea 加 useDrop + 高亮
  CardSlot 加点击取消

Step 6: BattleFrameV2.tsx
  DndProvider 包裹 + DragGhostLayer 渲染 + cancelLayer 透传

Step 7: 本地验证
  npm run dev → 拖拽出牌 + 点击取消 + 高亮反馈
```

---

## 10. 约束（强制遵守）

1. **不破坏点击流程**：react-dnd 的 `canDrag` 允许回退到点击
2. **Engine 不变**：所有逻辑改动在 UI 层，engine.ts 无需改动
3. **容量检查在 drop 前**：react-dnd 的 `canDrop` 返回 false 时不触发 drop handler
4. **锁定后不可取消**：cancel handler 检查 `lockedLayer1/LockedLayer2`
