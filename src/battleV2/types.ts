/**
 * 战斗系统类型定义 - v2.0 两层结算版
 *
 * 核心规则：
 * - 胜利条件：大势到8获胜
 * - 议区：主议 + 旁议（每个最多3张牌）
 * - 卡牌类型：立论 / 策术
 * - 资源：费用、大势、筹、护印、辩锋、根基
 */

export type Side = 'player' | 'enemy';

// === 阶段定义（v2.0 两层结算） ===
export type DebatePhase = 'play_1' | 'resolve_1' | 'play_2' | 'resolve_2' | 'finished';

export type ArenaId = 'jixia' | 'huode' | 'cangshu' | 'guanxing';

// === 卡牌类型（v2.0 收敛为两类） ===
export type CardTypeV2 = '立论' | '策术';
export type SceneBias = 'left' | 'center' | 'right' | 'all';

// === 效果类型 ===
export type EffectKind = 'damage' | 'draw' | 'heal';
export type RuleOpcode = 'summon' | 'damage' | 'draw' | 'heal' | 'shield' | 'discard';
export type RuleTarget = 'self' | 'enemy' | 'any';

export interface RuleOp {
  op: RuleOpcode;
  value: number;
  target: RuleTarget;
}

export interface CardRuleSet {
  version: 'v1';
  ops: RuleOp[];
}

// === 卡牌定义 ===
export interface DebateCard {
  id: string;
  name: string;
  type: CardTypeV2;           // 立论 / 策术
  cost: number;               // 费用
  power: number;              // 辩锋（单位牌主要使用）
  hp: number;                 // 根基（单位牌主要使用）
  effectKind?: EffectKind;    // 策术主要使用
  effectValue?: number;       // 效果数值
  rule?: CardRuleSet;         // 结构化规则（优先）
  ruleText?: string;          // 规则文本（机器可读）
  flavorText?: string;        // 风味文本（仅展示）
  art?: string;
  description?: string;
  faction?: string;
}

// === 议区定义 ===
export type SeatId = 'zhu_yi' | 'pang_yi';

// === 议区单位 ===
export interface SeatUnit {
  id: string;
  cardId: string;
  name: string;
  power: number;              // 辩锋
  hp: number;                 // 当前根基
  maxHp: number;              // 最大根基
}

// === 议区状态（改为units数组） ===
export interface SeatState {
  units: SeatUnit[];          // 议区中的单位（最多3个）
  maxUnits: 3;                // 固定上限
}

// === 资源（v2.0 大势胜利机制） ===
export interface Resources {
  cost: number;               // 当前费用
  maxCost: number;            // 本回合费用上限
  dashi: number;              // 大势（到8获胜）
  chou: number;               // 筹（最多1个，减费用）
  guyin: number;              // 护印（护盾）
}

// === 大势胜利目标 ===
export const DASHI_TARGET = 8;

// === 筹上限 ===
export const CHOU_MAX = 1;

// === 回合计划（v2.0 两层出牌） ===
export interface TurnPlan {
  layer1CardId: string | null;    // 第一层出牌
  layer2CardId: string | null;    // 第二层出牌
  writingCardId: string | null;   // 着书卡牌
  layer1TargetSeat: SeatId;       // 第一层目标议区
  layer2TargetSeat: SeatId;       // 第二层目标议区
  usedCost: number;               // 已消耗费用
  lockedLayer1: boolean;          // 第一层锁定
  lockedLayer2: boolean;          // 第二层锁定
}

// === 门派配置 ===
export interface FactionLoadout {
  mainFaction: string;
  guestFactions: string[];
  sceneBias: SceneBias;
}

// === 战斗玩家 ===
export interface BattlePlayer {
  side: Side;
  name: string;
  resources: Resources;
  deck: DebateCard[];
  hand: DebateCard[];
  discard: DebateCard[];
  writings: DebateCard[];
  seats: Record<SeatId, SeatState>;
  plan: TurnPlan;
  loadout?: FactionLoadout;
  gold: number;
  submitAction: SubmitAction | null;
}

// === 战斗日志 ===
export interface BattleLog {
  id: string;
  round: number;
  text: string;
  timestamp?: number;
}

// === 战斗状态 ===
export interface DebateBattleState {
  round: number;
  maxRounds: number;
  phase: DebatePhase;
  secondsLeft: number;
  activeTopicId: string | null;
  activeTopic: string;
  topicSelectionPending: boolean;
  topicSelectionRound: number;
  topicSelectionSecondsLeft: number | null;
  topicOptions: string[];
  arenaId: ArenaId;
  arenaName: string;
  player: BattlePlayer;
  enemy: BattlePlayer;
  logs: BattleLog[];
  resolveFeed: string[];
  internalAudit: string[];
  winner: Side | 'draw' | null;
}

// === 操作类型（v2.0） ===
export type PlanSlot = 'layer1' | 'layer2' | 'writing';
export type TargetableSlot = 'layer1' | 'layer2';
export type Zone = 'main' | 'side' | 'prep';

// === 提交动作 ===
export interface SubmitAction {
  type: 'play_card' | 'pass';
  cardId: string | null;
  zone: Zone | null;
  useToken: boolean;
}

// === 公开提交信息 ===
export interface PublicSubmitInfo {
  submitted: boolean;
  zone: Zone | null;
  hasUsedToken: boolean;
}

// === 揭示数据（v2.0） ===
export interface RevealData {
  player: { cardId: string; zone: Zone } | null;
  enemy: { cardId: string; zone: Zone } | null;
}

// === 公开计划信息（v2.0） ===
export interface PublicPlanInfo {
  hasLayer1Card: boolean;
  hasLayer2Card: boolean;
  hasWritingCard: boolean;
  layer1TargetSeat: SeatId;
  layer2TargetSeat: SeatId;
  lockedLayer1: boolean;
  lockedLayer2: boolean;
  handCount: number;
  writingCount: number;
}

// === 揭示信息（v2.0） ===
export interface RevealInfo {
  player: {
    layer1Card: DebateCard | null;
    layer2Card: DebateCard | null;
    writingCard: DebateCard | null;
  };
  enemy: {
    layer1Card: DebateCard | null;
    layer2Card: DebateCard | null;
    writingCard: DebateCard | null;
  };
}

// === 结算结果（简化） ===
export interface SettlementResult {
  seatId: SeatId;
  winner: Side | 'draw' | null;
  playerDamage: number;
  enemyDamage: number;
}

// === 战斗动作（v2.0） ===
export type BattleAction =
  | { type: 'TICK' }
  | { type: 'SELECT_TOPIC'; topicId: string }
  | { type: 'PLAN_CARD'; slot: PlanSlot; cardId: string | null }
  | { type: 'PLAN_WRITING'; cardId: string | null }
  | { type: 'SET_TARGET_SEAT'; slot: TargetableSlot; seatId: SeatId }
  | { type: 'LOCK_LAYER1' }
  | { type: 'LOCK_LAYER2' }
  | { type: 'AI_AUTO_PLAN' }
  | { type: 'SUBMIT_CARD'; cardId: string; zone: Zone; useToken: boolean }
  | { type: 'PASS' }
  | { type: 'CONFIRM_SUBMIT' }
  | { type: 'AI_AUTO_SUBMIT' }
  | { type: 'ADVANCE_PHASE' };
