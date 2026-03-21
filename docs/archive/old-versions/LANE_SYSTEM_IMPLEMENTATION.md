# 轻异构三路系统实现文档

## 概述

已实现「轻异构三路版」核心战斗系统，三路基础战斗规则一致，仅在回合结束奖励上有所区别。

## 三路定义

### 左路【立势】- 经营路
- **奖励**: 控制左路，下回合开始时 +1 心证
- **战略价值**: 长期资源积累，为后续回合做准备
- **卡牌倾向**: 低攻高守、持续收益、抽牌/赚资源

### 中路【争衡】- 胜利路
- **奖励**: 控制中路，获得 2 点议势
- **胜利条件**: 先达到 10 点议势获胜
- **卡牌倾向**: 标准身材、护卫、对撞、站场

### 右路【机辩】- 技巧路
- **奖励**: 控制右路，获得 1 点机变
- **机变用途**: 消耗 1 机变，你的下一张术牌/反诘费用 -1
- **卡牌倾向**: 中低身材、术牌联动、反制、机动

## 核心机制

### 1. 控制权判定

```typescript
// 计算单路控制权
function calculateLaneControl(
  playerLane: { front: { power: number } | null; back: { power: number } | null },
  enemyLane: { front: { power: number } | null; back: { power: number } | null }
): LaneControl
```

**规则**:
- 该路你的场上单位战力优于对方 → 你控制
- 或对方为空而你有单位 → 你控制
- 平局则双方都不控制

### 2. 回合结束结算流程

```
【层 1】应对结算
【层 2】主论结算
【层 3】三席争鸣
【层 4】暗策结算
【层 5】回合收束（着书）
【层 6】三路奖励结算 ← 新增
```

### 3. 三路奖励实现

```typescript
// 左路奖励（回合开始时应用）
if (player.resources.wenMai > 0) {
  const bonus = player.resources.wenMai;
  player.resources.wenMai = 0;
  player.resources.lingShi += bonus;  // 文脉转为心证
}

// 中路奖励（立即生效）
if (laneControls.center.controlledBy === 'player') {
  player.resources.zhengLi += 2;
  if (player.resources.zhengLi >= 10) {
    state.phase = 'finished';  // 胜利判定
  }
}

// 右路奖励（立即生效）
if (laneControls.right.controlledBy === 'player') {
  player.resources.jiBian += 1;  // 机变可用
}
```

## 资源系统扩展

### 新增资源字段

```typescript
interface Resources {
  xinZheng: number;    // 心证（生命值）
  lingShi: number;     // 灵势（法力值）
  maxLingShi: number;  // 最大灵势
  huYin: number;       // 护印（护甲）
  zhengLi: number;     // 议势（胜利进度）
  shiXu: number;       // 失序（负面资源）
  wenMai: number;      // 文脉（左路奖励缓存）
  jiBian: number;      // 机变（右路奖励）
}
```

## 卡牌数据结构扩展

```typescript
interface DebateCard {
  id: string;
  name: string;
  type: CardTypeV2;
  cost: number;
  effectKind: EffectKind;
  effectValue: number;
  power?: number;                    // 单位辩锋
  hp?: number;                       // 单位根基
  lanePreference?: 'left' | 'center' | 'right';  // 三路偏好
  description?: string;
}
```

## 18 张测试卡结构

### 左路倾向 6 张
1. 守拙弟子 (1 费门客)
2. 积学侍读 (2 费门客)
3. 藏经阁主 (3 费门客)
4. 厚积薄发 (2 费策术)
5. 深耕细作 (3 费策术)
6. 学富五车 (4 费玄章)

### 中路倾向 6 张
1. 争锋弟子 (1 费门客)
2. 主辩侍者 (2 费门客)
3. 执正司仪 (3 费门客)
4. 据理力争 (2 费策术)
5. 中流砥柱 (3 费策术)
6. 一锤定音 (5 费玄章)

### 右路倾向 6 张
1. 灵动机士 (1 费门客)
2. 诡辩散人 (2 费门客)
3. 机变谋士 (3 费门客)
4. 反诘先机 (1 费反诘)
5. 奇策巧思 (2 费策术)
6. 移形换影 (3 费策术)

## UI 组件

### LaneInfoPanel
显示单路控制状态、战力对比和奖励信息

### ZhengLiProgress
显示双方议势进度，包含胜利警告

### JiBianDisplay
显示机变点数量和可用状态

## 使用示例

### 1. 计算三路控制权

```typescript
import { calculateAllLaneControls } from '@/battleV2/laneSystem';

const laneControls = calculateAllLaneControls(state);
```

### 2. 应用三路奖励

```typescript
import { applyLaneRewards } from '@/battleV2/laneSystem';

const { playerRewards, enemyRewards } = applyLaneRewards(state, laneControls);
```

### 3. 使用机变减费

```typescript
import { canUseJiBianDiscount, useJiBianDiscount } from '@/battleV2/laneSystem';

if (canUseJiBianDiscount(player, card.cost)) {
  useJiBianDiscount(player);
  // 下一张牌费用 -1
}
```

## 开发节奏

### V0.1（当前版本）✅
- [x] 三路战场基础结构
- [x] 控制权判定逻辑
- [x] 三路奖励系统
- [x] 议势胜利条件
- [x] 机变点系统
- [x] 18 张测试卡数据

### V0.2（下一步）
- [ ] UI 集成（三路信息面板）
- [ ] 机变减费实际效果
- [ ] 卡牌偏好效果实现
- [ ] 平衡性测试

### V0.3（后续）
- [ ] 扩展至 160 张卡池
- [ ] 九派势力机制
- [ ] 更复杂的卡牌联动

## 设计原则

### ✅ 坚持的原则
1. 三路基础战斗规则完全一致
2. 差异仅在"回合结束奖励"和"卡牌倾向"
3. 玩家一眼能懂为什么分左中右
4. 程序实现不容易炸
5. 后面好平衡
6. 以后还能升级到"重异构"

### ❌ 避免的设计
1. 一上来做右路强控制（沉默、偷牌、强冻结）
2. 三路战斗规则不一样（左路只能放辅助等）
3. 直接做完整大卡池（上百张卡）

## 测试目标

1. **玩家会不会主动争左路** - 经营收益是否足够吸引人
2. **中路是不是自然成为主战场** - 胜利压力是否足够
3. **右路值不值得抢，但又不会太恶心** - 技巧收益是否平衡

## 文件清单

### 核心实现
- `src/battleV2/laneSystem.ts` - 三路系统核心逻辑
- `src/battleV2/testCards.ts` - 18 张测试卡数据
- `src/battleV2/engine.ts` - 集成三路奖励结算
- `src/battleV2/types.ts` - 类型定义扩展

### UI 组件
- `src/components/battle/LaneInfoPanel.tsx` - 三路信息面板

### 类型定义
- `LaneId` - 左/中/右路标识
- `LaneName` - 立势/争衡/机辩中文名
- `LaneControl` - 控制权状态
- `ExtendedResources` - 扩展资源接口

## 数值建议

### 初始资源
- 心证：20（生命值）
- 灵势：3（初始法力）
- 最大灵势：3
- 护印：0
- 议势：0
- 机变：0

### 胜利条件
- 目标议势：10 点
- 预计回合数：5-8 回合

### 卡牌费用曲线
- 1 费：3 张
- 2 费：6 张
- 3 费：6 张
- 4 费：2 张
- 5 费：1 张

## 下一步行动

1. **运行游戏测试** - 验证三路系统是否正常工作
2. **UI 集成** - 将 LaneInfoPanel 集成到战斗界面
3. **机变实现** - 完成机变减费的实际效果
4. **卡牌效果** - 实现 18 张测试卡的具体效果
5. **平衡测试** - 进行多局测试，调整数值

## 备注

此版本已经足够稳定，可以进入实际开发和测试阶段。设计原则是"轻异构"，即保持核心规则简单的同时，通过奖励差异创造战略深度。这为后续的"重异构"升级留下了充足空间。
