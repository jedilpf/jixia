// ==================== 基础类型 ====================

export type PlayerId = 'player' | 'enemy';
export type GamePhase = 'start' | 'player_turn' | 'enemy_turn' | 'combat' | 'end';
export type CardType = 'skill' | 'event' | 'field' | 'gear' | 'character' | 'counter';
export type RowType = 'front' | 'back';

export type Rarity = '常见' | '稀有' | '史诗' | '传说';
export type Faction = 
  | '礼心殿' 
  | '衡戒廷' 
  | '归真观' 
  | '玄匠盟' 
  | '九阵堂' 
  | '名相府' 
  | '司天台' 
  | '游策阁' 
  | '万农坊' 
  | '兼采楼';

// ==================== 位置类型 ====================

export interface Position {
  row: RowType;
  col: number;
}

// ==================== 卡牌类型 ====================

export interface BaseCard {
  id: string;
  name: string;
  cost: number;
  type: CardType;
  faction: Faction;
  rarity: Rarity;
  background?: string;
  skillDesc?: string;
  flavorText?: string;
}

export interface SkillCard extends BaseCard {
  type: 'skill';
  effect: Effect;
}

export interface EventCard extends BaseCard {
  type: 'event';
  effect: Effect;
}

export interface FieldCard extends BaseCard {
  type: 'field';
  effect: Effect;
}

export interface GearCard extends BaseCard {
  type: 'gear';
  effect: Effect;
  stats?: {
    atk?: number;
    hp?: number;
  };
}

export interface CharacterCard extends BaseCard {
  type: 'character';
  atk: number;
  hp: number;
  hasTaunt: boolean;
  hasCharge: boolean;
}

export interface CounterCard extends BaseCard {
  type: 'counter';
  trigger: string;
  effect: Effect;
}

export type Card = SkillCard | EventCard | FieldCard | GearCard | CharacterCard | CounterCard;

// ==================== 效果类型 ====================

export interface Effect {
  type: string;
  value?: number;
  target?: TargetType;
  condition?: Condition;
}

export type TargetType = 'self' | 'enemy' | 'all' | 'random' | 'adjacent';

export interface Condition {
  type: string;
  value?: number;
}

// ==================== 实例类型 ====================

export interface CharacterInstance {
  instanceId: string;
  cardId: string;
  name: string;
  atk: number;
  hp: number;
  maxHp: number;
  canAttack: boolean;
  hasAttacked: boolean;
  isExhausted: boolean;
  gear: GearInstance | null;
  buffs: Buffs;
  debuffs: Debuffs;
  rarity: Rarity;
  hasTaunt: boolean;
  hasCharge: boolean;
  skillDesc?: string;
}

export interface GearInstance {
  cardId: string;
  name: string;
  stats: {
    atkBonus: number;
    hpBonus: number;
  };
}

export interface Buffs {
  huchi: number;      // 护持
  qishi: number;      // 气势
  qingming: number;   // 清明
  bilei: number;      // 壁垒
}

export interface Debuffs {
  huaiyi: number;     // 怀疑
  chenmo: number;     // 沉默
}

// ==================== 英雄类型 ====================

export interface HeroPower {
  name: string;
  cost: number;
  description: string;
  usedThisTurn: boolean;
}

export interface Hero {
  name: string;
  hp: number;
  maxHp: number;
  heroPower: HeroPower;
  hasAttackedThisTurn: boolean;
  weapon: Weapon | null;
  buffs: Buffs;
}

export interface Weapon {
  cardId: string;
  name: string;
  atk: number;
  durability: number;
}

// ==================== 玩家类型 ====================

export interface Board {
  front: (CharacterInstance | null)[];
  back: (CharacterInstance | null)[];
}

export interface PlayerState {
  hero: Hero;
  deck: Card[];
  hand: Card[];
  board: Board;
  field: FieldInstance | null;
  bookArea: Card[];
  mana: number;
  maxMana: number;
  fatigue: number;
}

export interface FieldInstance {
  cardId: string;
  name: string;
  effect: Effect;
  owner: PlayerId;
}

// ==================== 游戏状态类型 ====================

export interface GameLogEntry {
  id: string;
  turn: number;
  player: PlayerId;
  action: string;
  timestamp: number;
}

export interface GameState {
  phase: GamePhase;
  currentPlayer: PlayerId;
  turnNumber: number;
  player: PlayerState;
  enemy: PlayerState;
  winner: PlayerId | null;
  log: GameLogEntry[];
}

// ==================== 选择状态类型 ====================

export type SelectionType = 'none' | 'card' | 'minion' | 'target' | 'hero_power';

export interface SelectionState {
  type: SelectionType;
  handIndex?: number;
  minionPos?: Position;
  sourcePlayer?: PlayerId;
}

// ==================== 拖拽状态类型 ====================

export interface DragState {
  isDragging: boolean;
  cardIndex?: number;
  startPos?: { x: number; y: number };
  currentPos?: { x: number; y: number };
}

// ==================== AI类型 ====================

export type AIDifficulty = 'easy' | 'normal' | 'hard';

export interface Action {
  type: 'play_card' | 'attack' | 'hero_power' | 'hero_attack' | 'end_turn';
  payload?: unknown;
}

// ==================== 类型守卫 ====================

export function isCharacterCard(card: Card): card is CharacterCard {
  return card.type === 'character';
}

export function isSkillCard(card: Card): card is SkillCard {
  return card.type === 'skill';
}

export function isCharacterInstance(obj: unknown): obj is CharacterInstance {
  return obj !== null && 
         typeof obj === 'object' && 
         'instanceId' in obj && 
         'cardId' in obj;
}
