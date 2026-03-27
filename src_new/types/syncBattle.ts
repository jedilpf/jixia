/**
 * 同步回合制对战类型定义
 * 
 * 双方玩家在同一回合内同时进行操作
 */

import type { Card, PlayerId } from './domain';

// ==================== 回合阶段 ====================

export type SyncPhase = 
  | 'preparation'   // 准备阶段
  | 'reveal'        // 揭示阶段 (前10秒，可见)
  | 'hidden'        // 隐藏阶段 (后10秒，不可见)
  | 'resolution'    // 结算阶段
  | 'end';          // 回合结束

export interface PhaseConfig {
  phase: SyncPhase;
  duration: number;      // 阶段持续时间(秒)
  isVisible: boolean;    // 是否可见对方操作
}

// ==================== 同步回合状态 ====================

export interface SyncTurnState {
  turnNumber: number;
  currentPhase: SyncPhase;
  timeRemaining: number;      // 当前阶段剩余时间(毫秒)
  totalTimeRemaining: number; // 回合总剩余时间(毫秒)
  
  // 玩家操作
  playerActions: PlayerSyncActions;
  enemyActions: PlayerSyncActions;
  
  // 时间同步
  serverTimestamp: number;
  clientOffset: number;       // 客户端时间偏移(用于同步)
  
  // 回合结果
  isResolved: boolean;
  winner: PlayerId | null;
}

export interface PlayerSyncActions {
  playerId: PlayerId;
  selectedCards: SelectedCard[];  // 已选择的卡牌
  isReady: boolean;               // 是否准备就绪
  lastUpdateTime: number;         // 最后更新时间
}

export interface SelectedCard {
  card: Card;
  handIndex: number;
  targetPosition?: Position;
  selectedAt: number;             // 选择时间戳
  isLocked: boolean;              // 是否锁定(不可更改)
}

export interface Position {
  row: 'front' | 'back';
  col: number;
}

// ==================== 准备阶段 ====================

export interface PreparationState {
  isActive: boolean;
  timeRemaining: number;
  
  // 玩家准备操作
  deckOrder: Card[];              // 卡组排序
  presetCards: PresetCard[];      // 预设卡牌
  isReady: boolean;
}

export interface PresetCard {
  card: Card;
  presetSlot: number;
}

// ==================== 时间同步 ====================

export interface TimeSyncState {
  serverTime: number;
  localTime: number;
  offset: number;                 // 服务器时间 - 本地时间
  latency: number;                // 网络延迟
  lastSyncTime: number;
}

export interface TimeSyncPacket {
  clientSendTime: number;
  serverReceiveTime: number;
  serverSendTime: number;
  clientReceiveTime: number;
}

// ==================== 网络消息 ====================

export type SyncMessageType = 
  | 'SYNC_TIME'           // 时间同步
  | 'PHASE_CHANGE'        // 阶段切换
  | 'CARD_SELECT'         // 选择卡牌
  | 'CARD_DESELECT'       // 取消选择
  | 'CARD_REORDER'        // 调整顺序
  | 'READY_CONFIRM'       // 确认准备
  | 'ACTION_REVEAL'       // 揭示动作
  | 'TURN_RESOLVE';       // 回合结算

export interface SyncMessage {
  type: SyncMessageType;
  timestamp: number;
  playerId: PlayerId;
  payload: unknown;
}

export interface CardSelectMessage {
  handIndex: number;
  cardId: string;
  targetPosition?: Position;
}

export interface CardDeselectMessage {
  handIndex: number;
}

export interface PhaseChangeMessage {
  newPhase: SyncPhase;
  timeRemaining: number;
  serverTimestamp: number;
}

// ==================== 游戏配置 ====================

export interface SyncBattleConfig {
  // 时间配置
  turnDuration: number;           // 回合总时长(秒) = 20
  revealPhaseDuration: number;    // 揭示阶段(秒) = 10
  hiddenPhaseDuration: number;    // 隐藏阶段(秒) = 10
  preparationDuration: number;    // 准备阶段(秒)
  
  // 同步配置
  syncInterval: number;           // 同步间隔(毫秒)
  maxLatency: number;             // 最大允许延迟(毫秒)
  
  // 游戏配置
  maxCardsPerTurn: number;        // 每回合最大出牌数
  allowReorder: boolean;          // 是否允许调整顺序
}

export const DEFAULT_SYNC_CONFIG: SyncBattleConfig = {
  turnDuration: 20,
  revealPhaseDuration: 10,
  hiddenPhaseDuration: 10,
  preparationDuration: 15,
  syncInterval: 100,
  maxLatency: 200,
  maxCardsPerTurn: 3,
  allowReorder: true,
};

// ==================== 反馈系统 ====================

export interface FeedbackEvent {
  type: 'time_warning' | 'phase_change' | 'action_confirm' | 'error';
  message: string;
  audioCue?: AudioCue;
  visualCue?: VisualCue;
}

export interface AudioCue {
  sound: string;
  volume: number;
}

export interface VisualCue {
  animation: string;
  color: string;
  duration: number;
}

// ==================== 结算结果 ====================

export interface TurnResolution {
  turnNumber: number;
  playerActions: ResolvedAction[];
  enemyActions: ResolvedAction[];
  outcome: TurnOutcome;
}

export interface ResolvedAction {
  card: Card;
  targetPosition?: Position;
  resolvedOrder: number;
  effects: ResolvedEffect[];
}

export interface ResolvedEffect {
  type: string;
  value: number;
  target: PlayerId | 'self' | 'all';
}

export interface TurnOutcome {
  playerDamage: number;
  enemyDamage: number;
  playerHealing: number;
  enemyHealing: number;
  nextPhase: SyncPhase;
}

// ==================== 类型守卫 ====================

export function isRevealPhase(phase: SyncPhase): boolean {
  return phase === 'reveal';
}

export function isHiddenPhase(phase: SyncPhase): boolean {
  return phase === 'hidden';
}

export function canSeeOpponentActions(
  phase: SyncPhase, 
  opponentActions: PlayerSyncActions
): boolean {
  // 揭示阶段可以看到对方已打出的卡牌
  if (phase === 'reveal') {
    return true;
  }
  // 结算阶段和回合结束可以看到全部
  if (phase === 'resolution' || phase === 'end') {
    return true;
  }
  return false;
}

export function canModifyActions(
  phase: SyncPhase, 
  timeRemaining: number
): boolean {
  // 只有在揭示阶段和隐藏阶段可以修改
  return phase === 'reveal' || phase === 'hidden';
}
