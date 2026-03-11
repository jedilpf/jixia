export type Side = 'player' | 'enemy';

export type DebatePhase = 'ming_bian' | 'an_mou' | 'reveal' | 'resolve' | 'finished';

export type ArenaId = 'jixia' | 'huode' | 'cangshu' | 'guanxing';

export type CardTypeV2 = '立论' | '策术' | '反诘' | '门客' | '玄章';
export type SceneBias = 'left' | 'center' | 'right' | 'all';

export type EffectKind =
  | 'damage'
  | 'shield'
  | 'draw'
  | 'zhengli'
  | 'shixu'
  | 'summon_front'
  | 'summon_back';

export interface DebateCard {
  id: string;
  name: string;
  type: CardTypeV2;
  cost: number;
  effectKind: EffectKind;
  effectValue: number;
  power?: number;      // 单位辩锋
  hp?: number;         // 单位根基
  art?: string;
  prologue?: string;
  description?: string;
  lanePreference?: 'left' | 'center' | 'right';  // 三路偏好
  faction?: string;
  factionCore?: boolean;
  guestEligible?: boolean;
  signatureSlot?: number;
  sceneBias?: SceneBias;
}

export type SeatId = 'xian_sheng' | 'zhu_bian' | 'yu_lun';
export type LayerId = 'front' | 'back';

export interface SeatUnit {
  id: string;
  name: string;
  power: number;
  hp: number;
  maxHp: number;
}

export interface SeatState {
  front: SeatUnit | null;
  back: SeatUnit | null;
}

export interface Resources {
  xinZheng: number;
  lingShi: number;
  maxLingShi: number;
  huYin: number;
  zhengLi: number;
  shiXu: number;
  wenMai: number;
  jiBian: number;      // 机变（右路奖励）
}

export interface TurnPlan {
  mainCardId: string | null;
  responseCardId: string | null;
  secretCardId: string | null;
  writingCardId: string | null;
  mainTargetSeat: SeatId;
  secretTargetSeat: SeatId;
  usedLingShi: number;
  lockedPublic: boolean;
  lockedSecret: boolean;
}

export interface FactionLoadout {
  mainFaction: string;
  guestFactions: string[];
  sceneBias: SceneBias;
}

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
}

export interface BattleLog {
  id: string;
  round: number;
  text: string;
}

export interface DebateBattleState {
  round: number;
  maxRounds: number;
  phase: DebatePhase;
  secondsLeft: number;
  activeTopic: string;
  arenaId: ArenaId;
  arenaName: string;
  player: BattlePlayer;
  enemy: BattlePlayer;
  logs: BattleLog[];
  resolveFeed: string[];
  internalAudit: string[];
}

export type PlanSlot = 'main' | 'response' | 'secret';
export type TargetableSlot = 'main' | 'secret';

export type BattleAction =
  | { type: 'TICK' }
  | { type: 'PLAN_CARD'; slot: PlanSlot; cardId: string | null }
  | { type: 'PLAN_WRITING'; cardId: string | null }
  | { type: 'SET_TARGET_SEAT'; slot: TargetableSlot; seatId: SeatId }
  | { type: 'LOCK_PUBLIC' }
  | { type: 'LOCK_SECRET' }
  | { type: 'AI_AUTO_PLAN' };
