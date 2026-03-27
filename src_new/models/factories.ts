import type { 
  PlayerState, 
  Hero, 
  HeroPower, 
  Board,
  Card,
  Buffs,
  Debuffs
} from '../types/domain';
import { buildDeck } from '../../src/data/cards';

// ==================== 英雄技能工厂 ====================

export function createHeroPower(name: string, cost: number, description: string): HeroPower {
  return {
    name,
    cost,
    description,
    usedThisTurn: false,
  };
}

// ==================== 英雄工厂 ====================

export function createHero(name: string): Hero {
  return {
    name,
    hp: 30,
    maxHp: 30,
    heroPower: createHeroPower('辩才无碍', 2, '抽一张牌'),
    hasAttackedThisTurn: false,
    weapon: null,
    buffs: createEmptyBuffs(),
  };
}

// ==================== Buff/Debuff工厂 ====================

export function createEmptyBuffs(): Buffs {
  return {
    huchi: 0,
    qishi: 0,
    qingming: 0,
    bilei: 0,
  };
}

export function createEmptyDebuffs(): Debuffs {
  return {
    huaiyi: 0,
    chenmo: 0,
  };
}

// ==================== 战场工厂 ====================

export function createEmptyBoard(): Board {
  return {
    front: [null, null, null],
    back: [null, null, null],
  };
}

// ==================== 玩家状态工厂 ====================

export function createInitialPlayerState(): PlayerState {
  const deck = buildDeck();
  
  return {
    hero: createHero('稷下学子'),
    deck,
    hand: [],
    board: createEmptyBoard(),
    field: null,
    bookArea: [],
    mana: 0,
    maxMana: 0,
    fatigue: 0,
  };
}

// ==================== 卡牌实例工厂 ====================

export function createCardInstanceId(cardId: string): string {
  return `${cardId}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
}

// ==================== 测试数据工厂 ====================

export interface TestGameOptions {
  playerMana?: number;
  playerMaxMana?: number;
  playerHeroHp?: number;
  enemyHeroHp?: number;
  playerHand?: Card[];
  playerBoard?: Board;
  enemyBoard?: Board;
}

export function createTestPlayerState(options: Partial<PlayerState> = {}): PlayerState {
  const defaultState = createInitialPlayerState();
  
  return {
    ...defaultState,
    ...options,
    hero: {
      ...defaultState.hero,
      ...options.hero,
    },
    board: options.board || defaultState.board,
  };
}
