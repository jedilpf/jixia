# 论辩大会剧情整合策划案

## 一、目标

在争鸣史第一章的"明德殿论辩"场景（n034节点）中，复用现有的battleV2论辩系统，以文字对话+卡牌选择的形式呈现论辩战斗。

---

## 二、现有系统分析

### 2.1 卡牌数据来源

**数据文件**：`src/data/showcaseCards.ts`

卡牌类型（showcaseCards.ts中定义）：

| type值 | 说明 |
|--------|------|
| 技能 | 技能牌 |
| 事件 | 事件牌 |
| 场地 | 场地牌 |
| 角色 | 角色牌（带hp/atk） |

> 注：装备类型在battleV2中使用`策术`代替。

### 2.2 battleV2辩论系统

**核心文件**：
- `src/battleV2/types.ts` - 类型定义
- `src/battleV2/useDebateBattle.ts` - 辩论状态管理
- `src/battleV2/cards.ts` - 卡牌生成逻辑
- `src/battleV2/topics.ts` - 辩题配置
- `src/battleV2/arena.ts` - 辩论场地

**辩论卡牌类型**（CardTypeV2）：

| CardTypeV2 | 说明 | 复用来源 |
|------------|------|---------|
| 立论 | 攻击性论点 | 技能 |
| 策术 | 策略性论点 | 事件、装备 |
| 反诘 | 反驳类论点 | 反制 |
| 门客 | 援护类论点 | 角色 |
| 玄章 | 场地增益 | 场地 |

**辩论资源**：

| 资源 | 作用 |
|------|------|
| 心证 | 血量 |
| 令史 | 法力 |
| 护印 | 护盾 |
| 证立 | 增益 |
| 失序 | 负面 |
| **大势** | **胜利条件：先到8获胜** |
| 筹 | 旁议获胜获得，可用于减费 |

**辩论阶段**：

```
ming_bian(明辨) → an_mou(暗谋) → reveal(揭露) → resolve(结算) → finished
```

**辩论场地**：

| 场地 | 特点 |
|------|------|
| 稷下学宫 | 标准环境 |
| 火德论坛 | 进攻环境 |
| 藏书秘阁 | 成长环境 |
| 玄机观星台 | 暗策环境 |

### 2.3 争鸣史剧情系统

**文件**：`src/game/story/`

**现有节点类型**：

```typescript
export type StoryNodeType = 'narration' | 'dialogue' | 'choice' | 'scene' | 'transition' | 'ending' | 'qte';
```

> 注：文档第6.2节中的`type: 'battle'`需新增或使用现有类型扩展。

**现有玩家属性**：

```typescript
export type PlayerStats = {
  fame: number;      // 名望
  wisdom: number;     // 智慧
  charm: number;      // 魅力
  courage: number;    // 勇气
  insight: number;    // 洞察
};
```

---

## 三、整合方案

### 3.1 方案选择

**不新增节点类型**，在现有 `dialogue` + `choice` 机制上扩展，通过 `flag` 追踪辩论状态。

### 3.2 实现方式

在StoryEngine中添加辩论状态管理，当遇到辩论相关flag时：
1. 调用battleV2的useDebateBattle
2. 根据辩论结果设置对应的flag
3. 根据flag跳转到对应剧情节点

### 3.3 数据流

```
剧情节点(n034)
    ↓
设置flag: debate_start=true, debate_topic="墨家兼爱之说"
    ↓
触发StoryEngine.debateMode()
    ↓
启动battleV2辩论系统
    ↓
辩论结束 → 设置flag: debate_result="win/lose/draw"
    ↓
根据result跳转到对应节点
```

---

## 四、辩题设计

### 4.1 第一章辩题

**辩题**：墨家兼爱之说，是否可行于乱世？

**预置话题**（在topics.ts中配置）：

```typescript
{
  id: 'topic_mozi_jianai',
  title: '墨家兼爱之说，是否可行于乱世？',
  summary: '墨家主张兼爱非攻，与法家严刑峻法形成对立。',
  weights: {
    base: 1,
    byEffectKind: {
      damage: 1.1,      // 攻击性论点
      shield: 1.05,    // 防守性论点
      zhengli: 1.15,   // 整理类论点
      shixu: 1.2,      // 反驳类论点强化
    },
  },
}
```

---

## 五、剧情节点设计

### 5.1 辩论前铺垫（n033选择后）

```typescript
{
  id: 'ch_moru_001_n034_intro',
  type: 'dialogue',
  speaker: '荀况',
  emotion: 'normal',
  content: `荀况宣布：「论辩开始！」

「辩题：墨家兼爱之说，是否可行于乱世？」

「墨家方，先请。」`,
  background: 'mingde_hall',
  effects: {
    flags: {
      debate_start: true,
      debate_topic: 'topic_mozi_jianai',
      debate_player_side: 'mozi',
    },
  },
  nextNode: 'debate_battle_entry',
}
```

### 5.2 辩论后节点（胜/负/平）

```typescript
{
  id: 'ch_moru_001_n034_win',
  type: 'dialogue',
  speaker: '荀况',
  emotion: 'happy',
  content: `荀况微微颔首：

「论点清晰，辩才出众。」

「墨家兼爱之说，虽有可议之处，然亦有其理。」

禽滑厘望向汝，目光中满是感激。

法家那边面色阴沉，显然不甘。

汝立于殿中，心中却波澜不惊——

这只是开始。`,
  background: 'mingde_hall',
  effects: {
    flags: { debate_result: 'win' },
    relationships: { mozi: { affection: 10, trust: 5 } },
  },
  nextNode: 'ch_moru_001_n036',
},
```

---

## 六、技术实现

### 6.1 StoryEngine扩展

```typescript
// 在StoryEngine中添加
private debateState: DebateState | null = null;

public startDebate(topicId: string, playerSide: string) {
  // 调用battleV2的辩论系统
  // 监听辩论结束事件
}

private handleDebateEnd(result: 'win' | 'lose' | 'draw') {
  this.flags.debate_result = result;
  // 根据结果跳转到对应节点
  this.goToNode(`ch_moru_001_n034_${result}`);
}
```

### 6.2 辩论入口节点

在chapterMoru001_part2.ts中添加：

```typescript
{
  id: 'debate_battle_entry',
  type: 'battle',
  content: '辩论战斗中...',
  debateConfig: {
    topicId: 'topic_mozi_jianai',
    arenaId: 'jixia',
    playerFaction: 'mozi',
    opponentId: 'shangyang',
  },
}
```

### 6.3 驳论配置

使用topics.ts中的话题加权系统：

```typescript
{
  id: 'topic_mozi_jianai',
  title: '墨家兼爱之说，是否可行于乱世？',
  weights: {
    base: 1,
    byEffectKind: {
      damage: 1.1,    // 攻击性
      shield: 1.05,  // 防守性
      zhengli: 1.15, // 整理类
      shixu: 1.2,    // 反驳类
    },
  },
}
```

---

## 七、工作量评估

| 步骤 | 内容 | 工作量 |
|-----|------|-------|
| 1 | StoryEngine添加辩论状态管理 | 0.5天 |
| 2 | 创建辩论入口节点类型 | 0.5天 |
| 3 | 配置辩题和驳论 | 0.5天 |
| 4 | 剧情节点整合（胜/负/平三种结果） | 0.5天 |
| 5 | 测试调优 | 0.5天 |
| **合计** | | **2.5天** |

---

## 八、风险控制

| 风险 | 等级 | 应对 |
|-----|------|------|
| battleV2与StoryEngine集成复杂度 | 中 | 先做简单版本MVP |
| 辩论UI与剧情UI风格统一 | 低 | 复用battleV2现有UI |
| 辩题配置不够丰富 | 低 | 后续可扩展topics.ts |

---

## 九、文件清单

### 新增/修改文件

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/game/story/StoryEngine.ts` | 修改 | 添加辩论状态管理 |
| `src/game/story/data/chapterMoru001_part2.ts` | 修改 | 添加辩论入口和结果节点 |
| `src/battleV2/topics.ts` | 修改 | 添加辩题配置 |

---

## 十、待确认事项

1. 是否需要新增 `battle` 节点类型？还是用现有类型扩展？
2. 辩论场次是否有数量限制？
3. 辩论结果是否影响后续所有剧情？

---

*文档版本：v1.0*
*创建时间：2026-04-01*
*最后更新：2026-04-01*
