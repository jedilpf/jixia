# 游戏核心流程 - 侠客论剑模式

## 最小闭环（完全实现 ✅）

```
1. 玩家进入PreBattleFlow
   └─ 选择论题、势力、卡牌
   ↓
2. 初始化 (BattleFrameV2启动)
   ├─ 创建双方PlayerState
   ├─ 初始资源分配（按势力）
   └─ 发初始手牌（通常5-7张）
   ↓
3. ming_bian 明辩阶段（玩家选主策）
   ├─ UI显示：可选卡牌高亮、规划区
   ├─ 玩家拖拽卡牌到主策规划区
   ├─ AI对手（延迟1-2秒）自动规划
   └─ 玩家点击"Lock主策"提交
   ↓
4. an_mou 暗谋阶段（玩家选秘策）
   ├─ 手牌更新（去掉已规划卡）
   ├─ 玩家选秘策卡牌（可选）
   ├─ AI对手自动规划秘策
   └─ 玩家点击"Lock秘策"提交
   ↓
5. reveal 翻示阶段
   ├─ 双方卡牌同时展示
   ├─ UI旋转、发光、显示效果文字
   └─ 自动进入resolve（无人工干预）
   ↓
6. resolve 结算阶段
   ├─ 处理卡牌效果
   ├─ 计算伤害
   ├─ 更新三路控制权（left, center, right）
   ├─ 刷新UI（资源条、席位状态）
   └─ 日志增加结算事件
   ↓
7. 判断游戏状态
   ├─ 若某方"大势"(daShi)资源累计达到 8 → finished（该玩家胜利）
   └─ 否则 → 回到 ming_bian（下一回合）
   ↓
8. finished 游戏完成
   └─ 显示胜者名字、战绩、返回菜单选项
```

## 数据流动（每个回合）

```
玩家的规划决策 (TurnPlan)
{
  mainCardId,      // 明辩选的卡
  responseCardId,  // 可选，暗谋选的卡  
  secretCardId,    // 秘策选的卡
  targets: { ... } // 额外目标信息（哪个席位受伤）
}
    ↓ (reveal阶段)
    ↓ 双方plan同时展示
    ↓
EffectResolver (resolve阶段)
    ├─ 应用卡牌效果 (damage, shield, draw, zhengli, shixu等)
    ├─ 消耗灵识(lingShi)
    ├─ 更新席位HP
    └─ 计算三路控制权并授予daShi奖励
    ↓
PlayerState更新
    ├─ resources: {...} 资源变化
    ├─ hand: [...] 手牌变化（抽卡、弃牌）
    ├─ seats: {...} 席位单位变化（受伤、死亡）
    └─ daShi: 累计增长（若达到8则游戏结束）
    ↓
Log日志
    └─ 事件记录到logsAndFeed[]，供UI显示
```

## 当前实现矩阵

| 步骤 | 代码位置 | 完成度 | 备注 |
|-----|---------|--------|------|
| 初始化 | engine.ts | ✅ 100% | PlayerState创建、发牌逻辑 |
| ming_bian | engine.ts + Components | ✅ 100% | UI + 玩家交互 + AI规划 |
| an_mou | engine.ts + Components | ✅ 100% | 同上 |
| reveal | BattleFrameV2.tsx | ✅ 95% | 动画较平滑，效果展示清晰 |
| resolve | engine.ts (结算函数) | ✅ 100% | 伤害、资源、控制权都算了 |
| daShi判定 | engine.ts | ✅ 100% | 每回合累加，到8即赢 |
| finished | ResultScreen/Components | ✅ 90% | 显示胜者基本完成，细节可优化 |

## 当前限制

- 一局通常10-15个回合（daShi从0→8）
- 三路控制权（left/center/right）基于"赢该路的回合数"计分
  - left胜利 → +1 daShi
  - center胜利 → +2 daShi
  - right胜利 → +1 daShi
- AI策略较简单（纯贪心评估），无深层军事考量
- 无网络同步（本地React State驱动）

## 胜利条件规则

```
daShi资源在每个resolve阶段更新：

三路各自比分：
  left_lane:   玩家A胜 → A的daShi +1
  center_lane: 玩家A胜 → A的daShi +2
  right_lane:  玩家A胜 → A的daShi +1

最多3回合，daShi最高 +6 per player per round
（取决于该回合的三路胜负）

游戏结束：先达到 daShi >= 8 的玩家获胜
```
