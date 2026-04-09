# AI对战交互规范

> 定义玩家与AI对战时的交互逻辑和行为规则

---

## 一、AI行为框架

### 1.1 决策时机

```
回合开始
    │
    ├─→ AI评估手牌价值
    │
    ├─→ AI分析当前局势
    │
    ├─→ AI选择出牌策略
    │
    └─→ AI执行出牌操作
```

### 1.2 AI出牌逻辑

```typescript
interface AIDecision {
  cardUid: string;      // 选中的卡牌
  targetZone: 'main' | 'side';  // 目标议区
  confidence: number;   // 决策置信度 (0-1)
}

function aiMakeDecision(state: GameState): AIDecision | null {
  // 1. 检查是否可以出牌
  if (state.battle.phase !== 'hidden_submit') return null;
  if (state.activePlayerId !== 'enemy') return null;

  // 2. 获取可用手牌
  const hand = state.players.enemy.hand;
  const mana = state.players.enemy.mana;

  // 3. 筛选可出的牌（费用<=当前用度）
  const playableCards = hand.filter(card => card.cost <= mana);

  // 4. 评估每张牌的价值
  const evaluations = playableCards.map(card => ({
    card,
    score: evaluateCard(card, state),
    preferredZone: getPreferredZone(card, state),
  }));

  // 5. 选择最优决策
  const best = evaluations.sort((a, b) => b.score - a.score)[0];
  if (!best) return null;

  return {
    cardUid: best.card.uid,
    targetZone: best.preferredZone,
    confidence: best.score / 10, // 归一化
  };
}
```

---

## 二、卡牌评估算法

### 2.1 价值评估

```typescript
function evaluateCard(card: CardInstance, state: GameState): number {
  let score = 0;

  // 基础价值：公共势力
  score += card.publicPower * 2;

  // 攻击力价值（门客牌）
  if (card.attack) {
    score += card.attack;
  }

  // 费用效率
  const efficiency = card.publicPower / Math.max(1, card.cost);
  score += efficiency * 3;

  // 连锁潜力
  const comboPotential = calculateComboPotential(card, state);
  score += comboPotential * 2;

  // 议题契合度
  const issueFit = checkIssueFit(card, state.issueState);
  score += issueFit * 1.5;

  return score;
}
```

### 2.2 议区偏好

```typescript
function getPreferredZone(card: CardInstance, state: GameState): 'main' | 'side' {
  const mainCount = state.players.enemy.board.mainQueue.length;
  const sideCount = state.players.enemy.board.sideQueue.length;

  // 议区已满检查
  if (mainCount >= 3) return 'side';
  if (sideCount >= 3) return 'main';

  // 高价值牌优先主议区
  if (card.publicPower >= 3) return 'main';

  // 辅助牌倾向旁议区
  if (card.type === 'support') return 'side';

  // 默认主议区
  return 'main';
}
```

---

## 三、AI策略模式

### 3.1 策略类型

| 策略 | 条件 | 行为 |
|------|------|------|
| 进攻型 | 优势局 | 高价值牌主议，快速结束 |
| 防守型 | 劣势局 | 控制牌优先，延长回合 |
| 平衡型 | 均势局 | 费用效率优先，稳健出牌 |

### 3.2 策略选择

```typescript
function selectStrategy(state: GameState): 'aggressive' | 'defensive' | 'balanced' {
  const myMomentum = state.players.enemy.momentum;
  const theirMomentum = state.players.player.momentum;
  const round = state.round;

  // 接近胜利，激进出牌
  if (myMomentum >= 6) return 'aggressive';

  // 对手接近胜利，保守防守
  if (theirMomentum >= 6) return 'defensive';

  // 回合过半，需要加速
  if (round >= 10 && myMomentum < theirMomentum) return 'aggressive';

  // 默认平衡
  return 'balanced';
}
```

---

## 四、玩家交互

### 4.1 操作流程

```
┌─────────────────────────────────────────────────┐
│                 玩家回合操作                      │
├─────────────────────────────────────────────────┤
│                                                 │
│  1. 查看手牌 → 点击选中卡牌                      │
│                    ↓                            │
│  2. 选择议区 → 点击"提交主议"或"提交旁议"        │
│                    ↓                            │
│  3. 重复操作 → 可继续出牌（每回合最多3张）       │
│                    ↓                            │
│  4. 确认结算 → 点击"落子结算"                   │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 4.2 交互反馈

| 操作 | 视觉反馈 | 音效 |
|------|----------|------|
| 选牌 | 卡牌上浮、边框高亮 | click.mp3 |
| 提交主议 | 卡牌飞向主议区、放大动画 | play_main.mp3 |
| 提交旁议 | 卡牌飞向旁议区、旋转动画 | play_side.mp3 |
| 结算 | 双方卡牌翻转、对比动画 | resolve.mp3 |

### 4.3 状态提示

```typescript
// 阶段提示文案
const PHASE_HINTS = {
  round_start: '新回合开始，获得用度并抽牌',
  hidden_submit: '暗辩阶段：选择卡牌放入议区',
  submission_lock: '已锁定，等待揭示',
  reveal: '明辩揭示：展示双方出牌',
  zone_resolve: '结算中：计算势力值',
};

// 可操作提示
const ACTION_HINTS = {
  selectCard: '点击手牌选择一张卡牌',
  playMain: '点击"提交主议"将卡牌放入主议区',
  playSide: '点击"提交旁议"将卡牌放入旁议区',
  resolve: '点击"落子结算"结束本回合',
};
```

---

## 五、结算动画序列

### 5.1 结算流程

```
点击"落子结算"
    │
    ├─→ 1. 锁定双方出牌 (0.5s)
    │
    ├─→ 2. 卡牌翻转揭示 (0.8s)
    │
    ├─→ 3. 势力值计算动画 (1.0s)
    │
    ├─→ 4. 胜负判定展示 (0.5s)
    │
    ├─→ 5. 大势更新动画 (0.5s)
    │
    └─→ 6. 进入下一回合或结束
```

### 5.2 动画参数

```typescript
const ANIMATION_CONFIG = {
  cardFlip: {
    duration: 0.8,
    easing: 'easeInOutCubic',
  },
  scoreCalc: {
    duration: 1.0,
    stagger: 0.1, // 每张牌延迟
  },
  momentumUpdate: {
    duration: 0.5,
    easing: 'easeOutBounce',
  },
  victory: {
    duration: 2.0,
    particles: true,
  },
};
```

---

## 六、错误处理

### 6.1 无效操作

| 场景 | 处理 |
|------|------|
| 用度不足 | 提示"用度不足"，按钮置灰 |
| 议区已满 | 提示"该议区已满"，禁止放入 |
| 非出牌阶段 | 提示"当前阶段无法出牌" |
| 无可用牌 | 自动跳过，进入结算 |

### 6.2 异常恢复

```typescript
// 游戏状态异常检测
function validateGameState(state: GameState): boolean {
  // 检查卡牌数量
  const totalCards = state.players.player.hand.length
    + state.players.enemy.hand.length
    + /* ... */;

  if (totalCards < 0) {
    console.error('Card count mismatch');
    return false;
  }

  // 检查大势值
  if (state.players.player.momentum < 0
    || state.players.enemy.momentum < 0) {
    console.error('Invalid momentum value');
    return false;
  }

  return true;
}
```

---

## 七、日志系统

### 7.1 战斗日志格式

```typescript
interface BattleLog {
  round: number;
  phase: BattlePhase;
  action: string;
  player: PlayerId;
  cardId?: string;
  details?: Record<string, any>;
}

// 示例日志
const sampleLogs = [
  { round: 1, phase: 'round_start', action: '回合开始', player: 'player' },
  { round: 1, phase: 'hidden_submit', action: '出牌', player: 'player', cardId: 'wenyan' },
  { round: 1, phase: 'reveal', action: '揭示', player: 'player' },
  { round: 1, phase: 'zone_resolve', action: '主议区结算', details: { winner: 'player' } },
];
```

### 7.2 日志显示

- 实时显示在战斗界面右侧
- 最多保留20条，自动滚动
- 关键事件高亮显示

---

*文档维护：开发团队*
*最后更新：2026-04-02*