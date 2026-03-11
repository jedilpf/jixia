# 同步回合制对战系统 - 完整实现文档

## 系统概述

一个创新的回合制卡牌对战机制，双方玩家在同一回合内**同时进行**操作，通过时间分阶段控制信息可见性，增加策略深度和心理博弈。

---

## 核心特性

### 1. 同步对战机制 ✅
- **双方同时操作**: 在同一20秒回合内选择和打出卡牌
- **实时可见性控制**: 前10秒可见，后10秒隐藏
- **灵活调整**: 20秒内可随时修改已选择的卡牌
- **同时结算**: 回合结束时同时展示并执行所有卡牌效果

### 2. 时间控制系统 ✅
- **准备阶段**: 15秒卡组排序和预设
- **揭示阶段**: 10秒双方可见
- **隐藏阶段**: 10秒新操作不可见
- **结算阶段**: 3秒执行所有效果
- **精确计时**: 100ms精度，5秒警告

### 3. 网络同步 ✅
- **NTP时间同步**: 精确计算网络延迟和时间偏移
- **断线重连**: 自动重连，最大5次尝试
- **消息队列**: 离线消息缓存，恢复后发送
- **心跳检测**: 5秒间隔保持连接

### 4. AI托管 ✅
- **自动接管**: 断线或延迟过高时自动启动
- **智能决策**: 基于卡牌价值和进攻性评估
- **可配置**: 反应延迟、进攻性、随机性可调
- **平滑切换**: 玩家回归时无缝接管

### 5. 音效系统 ✅
- **完整音效**: 18种不同场景的音效
- **背景音乐**: 支持淡入淡出切换
- **音量控制**: 主音量、音效、音乐独立调节
- **预加载**: 游戏开始前预加载所有音效

---

## 文件结构

```
src_new/
├── types/
│   └── syncBattle.ts                    # 245行 - 完整类型定义
├── engine/
│   └── SyncBattleEngine.ts              # 657行 - 核心引擎
├── services/
│   ├── AudioService.ts                  # 290行 - 音效管理
│   └── NetworkSyncService.ts            # 279行 - 网络同步
├── ai/
│   ├── AIPlayer.ts                      # 442行 - 对战AI
│   └── SyncAIController.ts              # 204行 - 托管AI
└── features/syncBattle/components/
    ├── SyncBattleTimer/
    │   └── SyncBattleTimer.tsx          # 281行 - 计时器
    ├── SyncBattleLayout/
    │   └── SyncBattleLayout.tsx         # 354行 - 主布局
    └── PreparationPanel/
        └── PreparationPanel.tsx         # 298行 - 准备面板
docs/
├── SYNC_BATTLE_DESIGN.md                # 591行 - 设计文档
└── SYNC_BATTLE_COMPLETE.md              # 本文件 - 完整文档
```

**总计**: 约 3,600 行代码

---

## 核心组件详解

### 1. SyncBattleEngine (核心引擎)

```typescript
class SyncBattleEngine {
  // 状态管理
  - state: SyncTurnState
  - timeSync: TimeSyncService
  
  // 回合控制
  - startTurn(): 开始回合
  - transitionPhase(): 阶段切换
  - resolveTurn(): 结算回合
  
  // 玩家操作
  - selectCard(): 选择卡牌
  - deselectCard(): 取消选择
  - reorderCards(): 调整顺序
  
  // 时间管理
  - startPhaseTimer(): 启动计时器
  - 100ms精度倒计时
}
```

### 2. NetworkSyncService (网络同步)

```typescript
class NetworkSyncService {
  // 连接管理
  - connect(): 连接服务器
  - disconnect(): 断开连接
  - reconnect(): 自动重连
  
  // 消息处理
  - sendMessage(): 发送消息
  - messageQueue: 离线消息队列
  - handleMessage(): 消息处理
  
  // 时间同步
  - sendTimeSync(): NTP同步请求
  - handleTimeSyncResponse(): 同步响应
}
```

### 3. AudioService (音效管理)

```typescript
class AudioService {
  // 音效播放
  - play(type: SoundType): 播放音效
  - preloadSounds(): 预加载
  
  // 背景音乐
  - playBGM(url): 播放BGM
  - stopBGM(): 停止BGM
  
  // 音量控制
  - setMasterVolume(): 主音量
  - setSFXVolume(): 音效音量
  - setBGMVolume(): 音乐音量
  - toggleMute(): 静音切换
}
```

### 4. SyncAIController (AI托管)

```typescript
class SyncAIController {
  // 托管控制
  - activate(): 启动托管
  - deactivate(): 停止托管
  
  // 决策逻辑
  - makeDecision(): AI决策
  - evaluateCard(): 卡牌评估
  - executeAction(): 执行动作
  
  // 配置
  - reactionDelay: 反应延迟
  - aggressiveness: 进攻性
  - randomness: 随机性
}
```

---

## 使用示例

### 基础使用

```tsx
import { SyncBattleLayout } from './features/syncBattle/components/SyncBattleLayout/SyncBattleLayout';

function App() {
  return <SyncBattleLayout />;
}
```

### 带音效的完整示例

```tsx
import { useEffect } from 'react';
import { SyncBattleLayout } from './features/syncBattle/components/SyncBattleLayout/SyncBattleLayout';
import { audioService } from './services/AudioService';
import { NetworkSyncService } from './services/NetworkSyncService';

function SyncBattlePage() {
  // 预加载音效
  useEffect(() => {
    audioService.preloadSounds();
    audioService.playBGM('/bgm/battle.mp3');
  }, []);

  // 连接网络
  useEffect(() => {
    const network = new NetworkSyncService('player');
    network.connect();
    
    return () => {
      network.disconnect();
      audioService.stopBGM();
    };
  }, []);

  return <SyncBattleLayout />;
}
```

### AI托管示例

```tsx
import { SyncAIController } from './ai/SyncAIController';

const aiController = new SyncAIController('player', {
  reactionDelay: 500,
  aggressiveness: 0.7,
  randomness: 0.2,
});

// 玩家断线时启动AI
aiController.onActionCallback((action) => {
  if (action.type === 'SELECT_CARD') {
    engine.selectCard('player', action.card!, action.handIndex!);
  }
});

// 网络断开时
network.onDisconnectCallback(() => {
  aiController.activate(engine.getState(), playerHand);
});

// 网络恢复时
network.onConnectCallback(() => {
  aiController.deactivate();
});
```

---

## 配置选项

### 时间配置

```typescript
const TIME_CONFIG = {
  preparationDuration: 15,    // 准备阶段: 15秒
  revealPhaseDuration: 10,    // 揭示阶段: 10秒
  hiddenPhaseDuration: 10,    // 隐藏阶段: 10秒
  resolutionDuration: 3,      // 结算阶段: 3秒
  turnDuration: 20,           // 回合总时长: 20秒
};
```

### 网络配置

```typescript
const NETWORK_CONFIG = {
  serverUrl: 'ws://localhost:8080',
  reconnectInterval: 3000,      // 重连间隔: 3秒
  maxReconnectAttempts: 5,      // 最大重连次数: 5
  heartbeatInterval: 5000,      // 心跳间隔: 5秒
  maxLatency: 200,              // 最大延迟: 200ms
};
```

### AI配置

```typescript
const AI_CONFIG = {
  reactionDelay: 500,           // 反应延迟: 500ms
  aggressiveness: 0.7,          // 进攻性: 0.7
  randomness: 0.2,              // 随机性: 0.2
};
```

---

## 事件系统

### 引擎事件

```typescript
engine.onPhaseChange((phase) => {
  console.log('阶段切换:', phase);
});

engine.onTimeUpdate((timeRemaining) => {
  console.log('剩余时间:', timeRemaining);
});

engine.onFeedback((event) => {
  // 播放音效和显示提示
  audioService.play(event.audioCue!.sound);
  showToast(event.message);
});
```

### 网络事件

```typescript
network.onConnectCallback(() => {
  console.log('已连接');
});

network.onDisconnectCallback((reason) => {
  console.log('断开连接:', reason);
  aiController.activate(state, hand);
});

network.onReconnectingCallback((attempt) => {
  console.log(`重连中... 第${attempt}次`);
});

network.onStateUpdateCallback((state) => {
  updateGameState(state);
});
```

---

## 性能优化

### 1. 状态更新
- 使用 Immer 进行不可变更新
- 100ms 批处理时间更新
- 条件渲染避免不必要重绘

### 2. 网络优化
- 消息队列缓存离线消息
- 增量状态同步
- 预测性UI更新

### 3. 渲染优化
- React.memo 避免不必要重渲染
- requestAnimationFrame 更新计时器
- 虚拟列表显示大量卡牌

### 4. 内存管理
- 及时清理定时器
- 音频元素自动回收
- 组件卸载时断开连接

---

## 测试策略

### 单元测试

```typescript
describe('SyncBattleEngine', () => {
  it('should transition phase correctly', () => {
    const engine = new SyncBattleEngine();
    engine.startTurn();
    expect(engine.getState().currentPhase).toBe('reveal');
    
    jest.advanceTimersByTime(10000);
    expect(engine.getState().currentPhase).toBe('hidden');
  });
});
```

### 网络测试

```typescript
describe('NetworkSyncService', () => {
  it('should reconnect on disconnect', async () => {
    const network = new NetworkSyncService('player');
    await network.connect();
    
    // 模拟断开
    network.disconnect();
    
    // 验证重连
    await waitFor(() => network.isReconnecting());
  });
});
```

### AI测试

```typescript
describe('SyncAIController', () => {
  it('should select card when activated', () => {
    const ai = new SyncAIController('player');
    const mockAction = jest.fn();
    
    ai.onActionCallback(mockAction);
    ai.activate(mockState, mockHand);
    
    expect(mockAction).toHaveBeenCalled();
  });
});
```

---

## 浏览器兼容性

| 功能 | Chrome | Firefox | Safari | Edge |
|------|--------|---------|--------|------|
| WebSocket | ✅ | ✅ | ✅ | ✅ |
| Web Audio | ✅ | ✅ | ✅ | ✅ |
| Drag & Drop | ✅ | ✅ | ✅ | ✅ |
| CSS Animation | ✅ | ✅ | ✅ | ✅ |

---

## 部署建议

### 服务器要求
- WebSocket 服务器 (如 Socket.io)
- 支持 NTP 时间同步
- 低延迟网络环境 (< 50ms)

### 客户端要求
- 现代浏览器 (Chrome 80+, Firefox 75+, Safari 13+)
- 稳定的网络连接
- 启用 WebSocket

### 优化建议
1. 使用 CDN 分发静态资源
2. 启用 HTTP/2 或 HTTP/3
3. 配置适当的缓存策略
4. 使用 Service Worker 离线支持

---

## 总结

同步回合制对战系统已完成所有核心功能：

✅ **同步对战**: 双方同时操作，20秒回合制  
✅ **时间控制**: 精确计时，双阶段展示  
✅ **网络同步**: NTP同步，断线重连  
✅ **AI托管**: 智能接管，平滑切换  
✅ **音效系统**: 完整音效，背景音乐  
✅ **准备阶段**: 卡组排序，预设选择  
✅ **交互反馈**: 时间警告，阶段提示  
✅ **公平保障**: 服务器权威，延迟补偿  

系统已完全可用，可以直接集成到游戏中！🎉
