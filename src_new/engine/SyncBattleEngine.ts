/**
 * 同步回合制对战引擎
 *
 * 实现双方玩家在同一回合内同时进行操作的机制
 */

import { produce, Draft } from 'immer';
import type {
  SyncTurnState,
  SyncPhase,
  PlayerSyncActions,
  SelectedCard,
  TimeSyncState,
  TimeSyncPacket,
  SyncBattleConfig,
  DEFAULT_SYNC_CONFIG,
  FeedbackEvent,
  TurnResolution,
  CardSelectMessage,
  CardDeselectMessage,
  Position,
} from '../types/syncBattle';
import type { Card, PlayerId, GameState } from '../types/domain';

// ==================== 时间同步服务 ====================

export class TimeSyncService {
  private syncState: TimeSyncState;
  private config: SyncBattleConfig;

  constructor(config: SyncBattleConfig = DEFAULT_SYNC_CONFIG) {
    this.config = config;
    this.syncState = {
      serverTime: Date.now(),
      localTime: Date.now(),
      offset: 0,
      latency: 0,
      lastSyncTime: Date.now(),
    };
  }

  /**
   * 执行时间同步 (NTP算法)
   */
  syncTime(packet: TimeSyncPacket): void {
    const now = Date.now();

    // 计算网络延迟
    const latency =
      (packet.clientReceiveTime -
        packet.clientSendTime -
        (packet.serverSendTime - packet.serverReceiveTime)) /
      2;

    // 计算时间偏移
    const offset =
      (packet.serverReceiveTime -
        packet.clientSendTime +
        (packet.serverSendTime - packet.clientReceiveTime)) /
      2;

    this.syncState = {
      serverTime: now + offset,
      localTime: now,
      offset,
      latency,
      lastSyncTime: now,
    };
  }

  /**
   * 获取同步后的服务器时间
   */
  getServerTime(): number {
    return Date.now() + this.syncState.offset;
  }

  /**
   * 获取网络延迟
   */
  getLatency(): number {
    return this.syncState.latency;
  }

  /**
   * 检查时间同步是否有效
   */
  isSyncValid(): boolean {
    return (
      this.syncState.latency <= this.config.maxLatency &&
      Date.now() - this.syncState.lastSyncTime < 5000
    );
  }

  /**
   * 生成同步数据包
   */
  createSyncPacket(): Omit<TimeSyncPacket, 'serverReceiveTime' | 'serverSendTime'> {
    return {
      clientSendTime: Date.now(),
      clientReceiveTime: 0, // 将在接收时填充
    };
  }
}

// ==================== 同步回合引擎 ====================

export class SyncBattleEngine {
  private state: SyncTurnState;
  private config: SyncBattleConfig;
  private timeSync: TimeSyncService;
  private phaseTimer: NodeJS.Timeout | null = null;
  private syncInterval: NodeJS.Timeout | null = null;
  private onPhaseChange: ((phase: SyncPhase) => void) | null = null;
  private onTimeUpdate: ((timeRemaining: number) => void) | null = null;
  private onFeedback: ((event: FeedbackEvent) => void) | null = null;

  constructor(config: Partial<SyncBattleConfig> = {}) {
    this.config = { ...DEFAULT_SYNC_CONFIG, ...config };
    this.timeSync = new TimeSyncService(this.config);
    this.state = this.createInitialState();
  }

  // ==================== 状态管理 ====================

  private createInitialState(): SyncTurnState {
    return {
      turnNumber: 1,
      currentPhase: 'preparation',
      timeRemaining: this.config.preparationDuration * 1000,
      totalTimeRemaining: this.config.preparationDuration * 1000,
      playerActions: this.createEmptyPlayerActions('player'),
      enemyActions: this.createEmptyPlayerActions('enemy'),
      serverTimestamp: this.timeSync.getServerTime(),
      clientOffset: 0,
      isResolved: false,
      winner: null,
    };
  }

  private createEmptyPlayerActions(playerId: PlayerId): PlayerSyncActions {
    return {
      playerId,
      selectedCards: [],
      isReady: false,
      lastUpdateTime: 0,
    };
  }

  /**
   * 获取当前状态
   */
  getState(): SyncTurnState {
    return this.state;
  }

  /**
   * 更新状态 (使用Immer)
   */
  private updateState(updater: (draft: Draft<SyncTurnState>) => void): void {
    this.state = produce(this.state, updater);
  }

  // ==================== 回合控制 ====================

  /**
   * 开始回合
   */
  startTurn(): void {
    this.updateState((draft) => {
      draft.currentPhase = 'reveal';
      draft.timeRemaining = this.config.revealPhaseDuration * 1000;
      draft.totalTimeRemaining = this.config.turnDuration * 1000;
      draft.playerActions = this.createEmptyPlayerActions('player');
      draft.enemyActions = this.createEmptyPlayerActions('enemy');
      draft.isResolved = false;
    });

    this.startPhaseTimer();
    this.startSyncInterval();

    this.emitFeedback({
      type: 'phase_change',
      message: '回合开始！揭示阶段',
      audioCue: { sound: 'phase_start', volume: 0.7 },
      visualCue: { animation: 'phase_reveal', color: '#4a90d9', duration: 1000 },
    });
  }

  /**
   * 开始准备阶段
   */
  startPreparation(): void {
    this.updateState((draft) => {
      draft.currentPhase = 'preparation';
      draft.timeRemaining = this.config.preparationDuration * 1000;
      draft.totalTimeRemaining = this.config.preparationDuration * 1000;
    });

    this.startPhaseTimer();

    this.emitFeedback({
      type: 'phase_change',
      message: '准备阶段',
      audioCue: { sound: 'preparation', volume: 0.5 },
      visualCue: { animation: 'preparation', color: '#d4af37', duration: 500 },
    });
  }

  /**
   * 阶段切换
   */
  private transitionPhase(): void {
    const { currentPhase } = this.state;

    switch (currentPhase) {
      case 'preparation':
        this.startTurn();
        break;

      case 'reveal':
        // 从揭示阶段切换到隐藏阶段
        this.updateState((draft) => {
          draft.currentPhase = 'hidden';
          draft.timeRemaining = this.config.hiddenPhaseDuration * 1000;
        });

        this.emitFeedback({
          type: 'phase_change',
          message: '隐藏阶段开始！对方操作不可见',
          audioCue: { sound: 'phase_hidden', volume: 0.7 },
          visualCue: {
            animation: 'phase_hidden',
            color: '#c41e3a',
            duration: 1000,
          },
        });
        break;

      case 'hidden':
        // 进入结算阶段
        this.resolveTurn();
        break;

      case 'resolution':
        // 回合结束
        this.endTurn();
        break;

      default:
        break;
    }

    if (this.onPhaseChange) {
      this.onPhaseChange(this.state.currentPhase);
    }
  }

  /**
   * 结算回合
   */
  private resolveTurn(): void {
    this.updateState((draft) => {
      draft.currentPhase = 'resolution';
      draft.timeRemaining = 3000; // 3秒结算时间
      draft.isResolved = true;
    });

    // 执行结算逻辑
    const resolution = this.calculateResolution();

    this.emitFeedback({
      type: 'phase_change',
      message: '回合结算中...',
      audioCue: { sound: 'resolution', volume: 0.8 },
      visualCue: { animation: 'resolution', color: '#d4af37', duration: 3000 },
    });

    // 3秒后结束回合
    setTimeout(() => {
      this.transitionPhase();
    }, 3000);
  }

  /**
   * 结束回合
   */
  private endTurn(): void {
    this.updateState((draft) => {
      draft.currentPhase = 'end';
      draft.timeRemaining = 0;
      draft.totalTimeRemaining = 0;
      draft.turnNumber += 1;
    });

    this.stopPhaseTimer();
    this.stopSyncInterval();

    this.emitFeedback({
      type: 'phase_change',
      message: '回合结束',
      audioCue: { sound: 'turn_end', volume: 0.6 },
      visualCue: { animation: 'turn_end', color: '#888', duration: 500 },
    });
  }

  // ==================== 计时器控制 ====================

  /**
   * 启动阶段计时器
   */
  private startPhaseTimer(): void {
    this.stopPhaseTimer();

    const tick = () => {
      this.updateState((draft) => {
        const decrement = 100; // 100ms
        draft.timeRemaining = Math.max(0, draft.timeRemaining - decrement);
        draft.totalTimeRemaining = Math.max(0, draft.totalTimeRemaining - decrement);
      });

      // 时间警告
      if (this.state.timeRemaining === 5000) {
        this.emitFeedback({
          type: 'time_warning',
          message: '剩余5秒！',
          audioCue: { sound: 'time_warning', volume: 0.8 },
          visualCue: { animation: 'time_warning', color: '#c41e3a', duration: 1000 },
        });
      }

      // 阶段结束
      if (this.state.timeRemaining <= 0) {
        this.transitionPhase();
      }

      // 通知时间更新
      if (this.onTimeUpdate) {
        this.onTimeUpdate(this.state.timeRemaining);
      }
    };

    this.phaseTimer = setInterval(tick, 100);
  }

  /**
   * 停止阶段计时器
   */
  private stopPhaseTimer(): void {
    if (this.phaseTimer) {
      clearInterval(this.phaseTimer);
      this.phaseTimer = null;
    }
  }

  /**
   * 启动同步间隔
   */
  private startSyncInterval(): void {
    this.stopSyncInterval();

    this.syncInterval = setInterval(() => {
      // 定期同步时间
      // 实际实现中这里会发送同步请求到服务器
    }, this.config.syncInterval);
  }

  /**
   * 停止同步间隔
   */
  private stopSyncInterval(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  // ==================== 玩家操作 ====================

  /**
   * 选择卡牌
   */
  selectCard(
    playerId: PlayerId,
    card: Card,
    handIndex: number,
    targetPosition?: Position
  ): boolean {
    // 检查是否可修改
    if (!this.canModifyActions()) {
      this.emitFeedback({
        type: 'error',
        message: '当前阶段无法选择卡牌',
      });
      return false;
    }

    // 检查是否超过最大出牌数
    const actions =
      playerId === 'player' ? this.state.playerActions : this.state.enemyActions;

    if (actions.selectedCards.length >= this.config.maxCardsPerTurn) {
      this.emitFeedback({
        type: 'error',
        message: `每回合最多选择${this.config.maxCardsPerTurn}张卡牌`,
      });
      return false;
    }

    this.updateState((draft) => {
      const playerActions =
        playerId === 'player' ? draft.playerActions : draft.enemyActions;

      // 检查是否已选择
      const existingIndex = playerActions.selectedCards.findIndex(
        (c) => c.handIndex === handIndex
      );

      if (existingIndex >= 0) {
        // 更新选择
        playerActions.selectedCards[existingIndex] = {
          card,
          handIndex,
          targetPosition,
          selectedAt: this.timeSync.getServerTime(),
          isLocked: false,
        };
      } else {
        // 添加新选择
        playerActions.selectedCards.push({
          card,
          handIndex,
          targetPosition,
          selectedAt: this.timeSync.getServerTime(),
          isLocked: false,
        });
      }

      playerActions.lastUpdateTime = this.timeSync.getServerTime();
    });

    this.emitFeedback({
      type: 'action_confirm',
      message: `选择了 ${card.name}`,
      audioCue: { sound: 'card_select', volume: 0.5 },
    });

    return true;
  }

  /**
   * 取消选择卡牌
   */
  deselectCard(playerId: PlayerId, handIndex: number): boolean {
    if (!this.canModifyActions()) {
      return false;
    }

    this.updateState((draft) => {
      const playerActions =
        playerId === 'player' ? draft.playerActions : draft.enemyActions;

      playerActions.selectedCards = playerActions.selectedCards.filter(
        (c) => c.handIndex !== handIndex
      );

      playerActions.lastUpdateTime = this.timeSync.getServerTime();
    });

    this.emitFeedback({
      type: 'action_confirm',
      message: '取消选择',
      audioCue: { sound: 'card_deselect', volume: 0.3 },
    });

    return true;
  }

  /**
   * 调整卡牌顺序
   */
  reorderCards(playerId: PlayerId, newOrder: number[]): boolean {
    if (!this.canModifyActions() || !this.config.allowReorder) {
      return false;
    }

    this.updateState((draft) => {
      const playerActions =
        playerId === 'player' ? draft.playerActions : draft.enemyActions;

      const reordered = newOrder
        .map((index) => playerActions.selectedCards[index])
        .filter(Boolean);

      playerActions.selectedCards = reordered;
      playerActions.lastUpdateTime = this.timeSync.getServerTime();
    });

    return true;
  }

  /**
   * 确认准备
   */
  confirmReady(playerId: PlayerId): void {
    this.updateState((draft) => {
      const playerActions =
        playerId === 'player' ? draft.playerActions : draft.enemyActions;
      playerActions.isReady = true;
    });

    this.emitFeedback({
      type: 'action_confirm',
      message: '准备就绪',
      audioCue: { sound: 'ready', volume: 0.6 },
    });
  }

  // ==================== 查询方法 ====================

  /**
   * 是否可以修改操作
   */
  canModifyActions(): boolean {
    return (
      this.state.currentPhase === 'reveal' || this.state.currentPhase === 'hidden'
    );
  }

  /**
   * 是否可以看到对方操作
   */
  canSeeOpponentActions(): boolean {
    const { currentPhase } = this.state;

    // 揭示阶段可以看到
    if (currentPhase === 'reveal') {
      return true;
    }

    // 结算阶段和结束阶段可以看到全部
    if (currentPhase === 'resolution' || currentPhase === 'end') {
      return true;
    }

    return false;
  }

  /**
   * 获取可见的对方操作
   */
  getVisibleOpponentActions(): SelectedCard[] {
    if (!this.canSeeOpponentActions()) {
      return [];
    }

    return this.state.enemyActions.selectedCards;
  }

  // ==================== 结算计算 ====================

  /**
   * 计算回合结算
   */
  private calculateResolution(): TurnResolution {
    const { playerActions, enemyActions } = this.state;

    // 按选择时间排序
    const sortedPlayerCards = [...playerActions.selectedCards].sort(
      (a, b) => a.selectedAt - b.selectedAt
    );

    const sortedEnemyCards = [...enemyActions.selectedCards].sort(
      (a, b) => a.selectedAt - b.selectedAt
    );

    // 简化的结算逻辑 (实际游戏中会更复杂)
    const playerDamage = sortedPlayerCards.reduce(
      (sum, card) => sum + (card.card.type === 'character' ? 3 : 2),
      0
    );

    const enemyDamage = sortedEnemyCards.reduce(
      (sum, card) => sum + (card.card.type === 'character' ? 3 : 2),
      0
    );

    return {
      turnNumber: this.state.turnNumber,
      playerActions: sortedPlayerCards.map((card, index) => ({
        card: card.card,
        targetPosition: card.targetPosition,
        resolvedOrder: index,
        effects: [{ type: 'damage', value: 3, target: 'enemy' }],
      })),
      enemyActions: sortedEnemyCards.map((card, index) => ({
        card: card.card,
        targetPosition: card.targetPosition,
        resolvedOrder: index,
        effects: [{ type: 'damage', value: 3, target: 'player' }],
      })),
      outcome: {
        playerDamage: enemyDamage, // 敌方对玩家造成的伤害
        enemyDamage: playerDamage, // 玩家对敌方造成的伤害
        playerHealing: 0,
        enemyHealing: 0,
        nextPhase: 'end',
      },
    };
  }

  // ==================== 事件回调 ====================

  onPhaseChange(callback: (phase: SyncPhase) => void): void {
    this.onPhaseChange = callback;
  }

  onTimeUpdate(callback: (timeRemaining: number) => void): void {
    this.onTimeUpdate = callback;
  }

  onFeedback(callback: (event: FeedbackEvent) => void): void {
    this.onFeedback = callback;
  }

  private emitFeedback(event: FeedbackEvent): void {
    if (this.onFeedback) {
      this.onFeedback(event);
    }
  }

  // ==================== 清理 ====================

  dispose(): void {
    this.stopPhaseTimer();
    this.stopSyncInterval();
  }
}

// ==================== 便捷函数 ====================

export function formatTimeRemaining(ms: number): string {
  const seconds = Math.ceil(ms / 1000);
  return `${seconds}`;
}

export function getPhaseDisplayName(phase: SyncPhase): string {
  const names: Record<SyncPhase, string> = {
    preparation: '准备阶段',
    reveal: '揭示阶段',
    hidden: '隐藏阶段',
    resolution: '结算阶段',
    end: '回合结束',
  };
  return names[phase] || phase;
}
