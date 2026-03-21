# 同步回合制对战系统设计文档

## 系统概述

一种创新的回合制卡牌对战机制，双方玩家在同一回合内**同时进行**卡牌选择与打出操作，通过时间分阶段控制信息可见性，增加策略深度和心理博弈。

---

## 核心机制

### 1. 对战流程

```
准备阶段 → 揭示阶段(10秒) → 隐藏阶段(10秒) → 结算阶段 → 回合结束
```

#### 准备阶段 (15秒)
- 玩家可以进行卡牌排序
- 选择预设卡组
- 确认准备就绪

#### 揭示阶段 (前10秒)
- **双方可见**对方已打出的卡牌
- 玩家可以随时调整已选择的卡牌
- 实时显示对方操作

#### 隐藏阶段 (后10秒)
- **双方不可见**对方新打出的卡牌
- 已揭示的卡牌保持可见
- 玩家仍可调整已选择的卡牌

#### 结算阶段 (3秒)
- 同时展示双方所有卡牌
- 执行卡牌效果
- 计算伤害和治疗

---

## 时间控制系统

### 时间配置

```typescript
const TIME_CONFIG = {
  preparationDuration: 15,    // 准备阶段: 15秒
  revealPhaseDuration: 10,    // 揭示阶段: 10秒
  hiddenPhaseDuration: 10,    // 隐藏阶段: 10秒
  resolutionDuration: 3,      // 结算阶段: 3秒
  totalTurnDuration: 20,      // 回合总时长: 20秒
};
```

### 计时器实现

```typescript
class SyncBattleEngine {
  private phaseTimer: NodeJS.Timeout;
  
  startPhaseTimer() {
    const tick = () => {
      // 每100ms更新一次
      this.updateTimeRemaining(100);
      
      // 检查阶段结束
      if (this.state.timeRemaining <= 0) {
        this.transitionPhase();
      }
      
      // 5秒警告
      if (this.state.timeRemaining === 5000) {
        this.emitTimeWarning();
      }
    };
    
    this.phaseTimer = setInterval(tick, 100);
  }
}
```

---

## 双阶段展示机制

### 可见性规则

| 阶段 | 己方操作 | 对方操作 |
|------|----------|----------|
| 准备阶段 | 可见 | 不可见 |
| 揭示阶段 | 可见 | **可见** |
| 隐藏阶段 | 可见 | **部分可见** |
| 结算阶段 | 可见 | **全部可见** |

### 实现逻辑

```typescript
function canSeeOpponentActions(phase: SyncPhase): boolean {
  switch (phase) {
    case 'reveal':
      // 揭示阶段：可见
      return true;
    case 'hidden':
      // 隐藏阶段：只可见揭示阶段打出的卡牌
      return false;
    case 'resolution':
    case 'end':
      // 结算阶段：全部可见
      return true;
    default:
      return false;
  }
}
```

### 卡牌状态追踪

```typescript
interface SelectedCard {
  card: Card;
  handIndex: number;
  selectedAt: number;    // 选择时间戳
  isLocked: boolean;     // 是否锁定
}

// 在隐藏阶段，只显示selectedAt < revealPhaseEndTime的卡牌
function getVisibleOpponentCards(
  allCards: SelectedCard[],
  phase: SyncPhase,
  revealPhaseEndTime: number
): SelectedCard[] {
  if (phase === 'reveal') {
    return allCards;
  }
  if (phase === 'hidden') {
    // 只返回在揭示阶段选择的卡牌
    return allCards.filter(c => c.selectedAt <= revealPhaseEndTime);
  }
  return allCards;
}
```

---

## 准备机制

### 准备阶段功能

1. **卡组排序**
   ```typescript
   reorderDeck(newOrder: number[]): void
   ```

2. **预设卡牌**
   ```typescript
   setPresetCards(cards: PresetCard[]): void
   ```

3. **确认准备**
   ```typescript
   confirmReady(): void
   ```

### 准备状态管理

```typescript
interface PreparationState {
  isActive: boolean;
  timeRemaining: number;
  deckOrder: Card[];
  presetCards: PresetCard[];
  isReady: boolean;
}
```

---

## 操作限制与调整

### 可修改条件

```typescript
function canModifyActions(phase: SyncPhase): boolean {
  // 只有在揭示阶段和隐藏阶段可以修改
  return phase === 'reveal' || phase === 'hidden';
}
```

### 调整操作

1. **选择卡牌**
   - 点击手牌选择
   - 最多3张/回合

2. **取消选择**
   - 点击已选卡牌移除

3. **调整顺序**
   - 拖拽调整出牌顺序
   - 影响结算优先级

### 最终确认

```typescript
// 回合结束时，以当前选择的卡牌为准
resolveTurn() {
  const finalPlayerCards = this.state.playerActions.selectedCards;
  const finalEnemyCards = this.state.enemyActions.selectedCards;
  
  // 执行结算
  this.executeResolution(finalPlayerCards, finalEnemyCards);
}
```

---

## 时间同步与网络延迟处理

### NTP时间同步算法

```typescript
interface TimeSyncPacket {
  clientSendTime: number;
  serverReceiveTime: number;
  serverSendTime: number;
  clientReceiveTime: number;
}

class TimeSyncService {
  syncTime(packet: TimeSyncPacket) {
    // 计算网络延迟
    const latency = (
      packet.clientReceiveTime - 
      packet.clientSendTime - 
      (packet.serverSendTime - packet.serverReceiveTime)
    ) / 2;
    
    // 计算时间偏移
    const offset = (
      packet.serverReceiveTime - 
      packet.clientSendTime + 
      (packet.serverSendTime - packet.clientReceiveTime)
    ) / 2;
    
    this.latency = latency;
    this.offset = offset;
  }
  
  getServerTime(): number {
    return Date.now() + this.offset;
  }
}
```

### 延迟补偿

```typescript
// 最大允许延迟: 200ms
const MAX_LATENCY = 200;

// 检查同步有效性
isSyncValid(): boolean {
  return this.latency <= MAX_LATENCY;
}

// 操作时间戳校正
selectCard(card: Card) {
  const serverTime = this.timeSync.getServerTime();
  // 使用服务器时间作为操作时间戳
  this.recordAction(card, serverTime);
}
```

### 定期同步

```typescript
// 每100ms同步一次
startSyncInterval() {
  setInterval(() => {
    this.sendSyncRequest();
  }, 100);
}
```

---

## 交互反馈系统

### 反馈类型

```typescript
type FeedbackType = 
  | 'time_warning'    // 时间警告
  | 'phase_change'    // 阶段切换
  | 'action_confirm'  // 操作确认
  | 'error';          // 错误提示

interface FeedbackEvent {
  type: FeedbackType;
  message: string;
  audioCue?: AudioCue;
  visualCue?: VisualCue;
}
```

### 时间警告

```typescript
// 剩余5秒时触发
if (timeRemaining === 5000) {
  this.emitFeedback({
    type: 'time_warning',
    message: '剩余5秒！',
    audioCue: { sound: 'time_warning', volume: 0.8 },
    visualCue: { 
      animation: 'pulse', 
      color: '#c41e3a', 
      duration: 1000 
    },
  });
}
```

### 阶段切换提示

```typescript
// 阶段切换时触发
emitPhaseChange(phase: SyncPhase) {
  const phaseConfig = {
    reveal: {
      message: '揭示阶段开始！双方可见',
      color: '#4a90d9',
      sound: 'phase_reveal',
    },
    hidden: {
      message: '隐藏阶段开始！对方不可见',
      color: '#c41e3a',
      sound: 'phase_hidden',
    },
    resolution: {
      message: '回合结算中...',
      color: '#d4af37',
      sound: 'resolution',
    },
  };
  
  const config = phaseConfig[phase];
  this.emitFeedback({
    type: 'phase_change',
    message: config.message,
    audioCue: { sound: config.sound, volume: 0.7 },
    visualCue: { 
      animation: 'phase_transition', 
      color: config.color, 
      duration: 1000 
    },
  });
}
```

---

## UI组件设计

### 计时器组件

```typescript
interface SyncBattleTimerProps {
  phase: SyncPhase;
  timeRemaining: number;
  totalTimeRemaining: number;
  isVisible: boolean;
}

// 功能:
// - 显示当前阶段名称
// - 显示剩余时间(大字体)
// - 进度条显示阶段进度
// - 阶段标记点
// - 时间警告动画
// - 隐藏阶段指示器
```

### 对战布局组件

```typescript
interface SyncBattleLayoutProps {
  gameState: SyncTurnState;
  onCardSelect: (card: Card, index: number) => void;
  onCardDeselect: (index: number) => void;
}

// 布局:
// - 顶部: 计时器
// - 上部: 对方操作区域
// - 中部: 玩家操作区域
// - 下部: 手牌区域
// - 底部: 阶段说明
```

---

## 网络消息协议

### 消息类型

```typescript
type SyncMessageType = 
  | 'SYNC_TIME'           // 时间同步
  | 'PHASE_CHANGE'        // 阶段切换
  | 'CARD_SELECT'         // 选择卡牌
  | 'CARD_DESELECT'       // 取消选择
  | 'CARD_REORDER'        // 调整顺序
  | 'READY_CONFIRM'       // 确认准备
  | 'ACTION_REVEAL'       // 揭示动作
  | 'TURN_RESOLVE';       // 回合结算
```

### 消息格式

```typescript
interface SyncMessage {
  type: SyncMessageType;
  timestamp: number;      // 服务器时间戳
  playerId: PlayerId;
  payload: unknown;
}

// 示例: 选择卡牌
const selectMessage: SyncMessage = {
  type: 'CARD_SELECT',
  timestamp: 1699123456789,
  playerId: 'player',
  payload: {
    handIndex: 2,
    cardId: 'card_001',
    targetPosition: { row: 'front', col: 1 },
  },
};
```

---

## 公平性保障

### 1. 服务器权威

- 所有时间计算以服务器时间为准
- 客户端只负责显示和输入
- 操作有效性由服务器验证

### 2. 延迟补偿

- 超过200ms延迟的玩家收到警告
- 极端延迟下自动使用AI托管
- 操作时间戳校正

### 3. 同步校验

```typescript
// 定期校验客户端状态
validateSync() {
  const serverState = this.getServerState();
  const clientState = this.getClientState();
  
  if (Math.abs(serverState.time - clientState.time) > 500) {
    // 时间差异过大，重新同步
    this.resync();
  }
}
```

### 4. 断线重连

```typescript
// 断线后恢复状态
reconnect() {
  // 请求当前回合状态
  const currentState = this.requestState();
  
  // 恢复游戏
  this.restoreState(currentState);
  
  // 如果处于操作阶段，继续操作
  if (canModifyActions(currentState.phase)) {
    this.enableActions();
  }
}
```

---

## 性能优化

### 1. 状态更新优化

```typescript
// 使用Immer进行不可变更新
updateState(updater: (draft: Draft<SyncTurnState>) => void) {
  this.state = produce(this.state, updater);
}
```

### 2. 网络优化

- 操作批量发送(100ms间隔)
- 增量状态同步
- 预测性UI更新

### 3. 渲染优化

- React.memo避免不必要重渲染
- 使用requestAnimationFrame更新计时器
- 虚拟列表显示大量卡牌

---

## 测试策略

### 1. 单元测试

```typescript
describe('SyncBattleEngine', () => {
  it('should transition phase correctly', () => {
    const engine = new SyncBattleEngine();
    engine.startTurn();
    
    expect(engine.getState().currentPhase).toBe('reveal');
    
    // 模拟10秒过去
    jest.advanceTimersByTime(10000);
    
    expect(engine.getState().currentPhase).toBe('hidden');
  });
  
  it('should handle card selection', () => {
    const engine = new SyncBattleEngine();
    engine.startTurn();
    
    const card = createMockCard();
    const result = engine.selectCard('player', card, 0);
    
    expect(result).toBe(true);
    expect(engine.getState().playerActions.selectedCards).toHaveLength(1);
  });
});
```

### 2. 网络延迟测试

```typescript
describe('TimeSync', () => {
  it('should calculate correct offset with 100ms latency', () => {
    const sync = new TimeSyncService();
    
    const packet: TimeSyncPacket = {
      clientSendTime: 0,
      serverReceiveTime: 50,
      serverSendTime: 50,
      clientReceiveTime: 100,
    };
    
    sync.syncTime(packet);
    
    expect(sync.getLatency()).toBe(50);
    expect(sync.getOffset()).toBe(0);
  });
});
```

### 3. 集成测试

- 完整回合流程测试
- 双客户端同步测试
- 断线重连测试
- 极端延迟场景测试

---

## 总结

本系统实现了创新的同步回合制对战机制：

✅ **同时进行**: 双方在同一回合内操作  
✅ **时间控制**: 精确的20秒回合制  
✅ **双阶段**: 前10秒可见，后10秒隐藏  
✅ **准备机制**: 支持卡组排序和预设  
✅ **灵活调整**: 20秒内可随时修改  
✅ **交互反馈**: 清晰的时间提示和音效  
✅ **公平保障**: NTP时间同步，延迟补偿  

这种设计增加了策略深度和心理博弈，让对战更加紧张刺激！
