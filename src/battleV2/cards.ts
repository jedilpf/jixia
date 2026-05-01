/**
 * 测试卡牌数据 - v2.0 双类型版
 *
 * 仅保留两类：
 * - 立论：单位站场
 * - 策术：即时效果
 */

import { DebateCard, Side } from './types';

function withSummonRule(card: Omit<DebateCard, 'rule' | 'ruleText' | 'flavorText'> & { flavorText: string }): DebateCard {
  return {
    ...card,
    ruleText: `入场：辩锋${card.power}，学识${card.hp}`,
    rule: {
      version: 'v1',
      ops: [{ op: 'summon', target: 'self', value: 1 }],
    },
    description: `辩锋${card.power} / 学识${card.hp}`,
  };
}

function makeSpell(
  card: Omit<DebateCard, 'rule' | 'ruleText' | 'flavorText' | 'description'> & {
    op: 'draw' | 'damage' | 'heal';
    value: number;
    flavorText: string;
  },
): DebateCard {
  const ruleText =
    card.op === 'draw'
      ? `抽${card.value}张牌`
      : card.op === 'damage'
        ? `对敌方造成${card.value}点伤害`
        : `获得${card.value}点护体`;

  return {
    id: card.id,
    name: card.name,
    type: card.type,
    cost: card.cost,
    power: card.power,
    hp: card.hp,
    effectKind: card.op,
    effectValue: card.value,
    flavorText: card.flavorText,
    ruleText,
    rule: {
      version: 'v1',
      ops: [{
        op: card.op === 'heal' ? 'shield' : card.op,
        target: card.op === 'damage' ? 'enemy' : 'self',
        value: card.value,
      }],
    },
    description: ruleText,
  };
}

// === 立论牌（基础单位） ===
const LILUN_CARDS: DebateCard[] = [
  withSummonRule({ id: 'l001', name: '行旅学子', type: '立论', cost: 1, power: 1, hp: 2, flavorText: '低费试探，抢占席位。' }),
  withSummonRule({ id: 'l002', name: '乡议书吏', type: '立论', cost: 2, power: 2, hp: 2, flavorText: '标准身材，维持节奏。' }),
  withSummonRule({ id: 'l003', name: '公议守席', type: '立论', cost: 2, power: 2, hp: 3, flavorText: '前期稳场。' }),
  withSummonRule({ id: 'l004', name: '案前执简', type: '立论', cost: 3, power: 3, hp: 2, flavorText: '中费压制。' }),
  withSummonRule({ id: 'l005', name: '经史研者', type: '立论', cost: 2, power: 3, hp: 2, flavorText: '偏进攻。' }),
  withSummonRule({ id: 'l006', name: '大儒之论', type: '立论', cost: 4, power: 4, hp: 3, flavorText: '高压主战单位。' }),
];

// === 策术牌（即时节奏） ===
const CESHU_CARDS: DebateCard[] = [
  makeSpell({ id: 'c001', name: '两端衡量', type: '策术', cost: 1, power: 0, hp: 0, op: 'draw', value: 1, flavorText: '补牌修手。' }),
  makeSpell({ id: 'c002', name: '驳杂去芜', type: '策术', cost: 2, power: 0, hp: 0, op: 'damage', value: 3, flavorText: '中低费点杀。' }),
  makeSpell({ id: 'c003', name: '收束成文', type: '策术', cost: 2, power: 0, hp: 0, op: 'draw', value: 2, flavorText: '稳定抽取。' }),
  makeSpell({ id: 'c004', name: '旁征博引', type: '策术', cost: 3, power: 0, hp: 0, op: 'heal', value: 3, flavorText: '中段续航。' }),
  makeSpell({ id: 'c005', name: '急辩先声', type: '策术', cost: 1, power: 0, hp: 0, op: 'damage', value: 2, flavorText: '抢节奏。' }),
  makeSpell({ id: 'c006', name: '一语定论', type: '策术', cost: 5, power: 0, hp: 0, op: 'damage', value: 7, flavorText: '高费终结。' }),
];

// === 全部测试卡牌 ===
export const TEST_CARDS: DebateCard[] = [
  ...LILUN_CARDS,
  ...CESHU_CARDS,
];

// === 创建基础卡组 ===
export interface CreateStarterDeckOptions {
  mainFaction?: string;
  guestFactions?: string[];
  useFactionFramework?: boolean;
  useFullCardPool?: boolean;
  playerLevel?: number;
  enabledFactions?: string[];
  genericCardIds?: string[];
  mainFactionCardCount?: number;
  guestFactionCardCount?: number;
  includeCommons?: number;
  deckSize?: number;
}

export function createStarterDeck(side: Side, options?: CreateStarterDeckOptions): DebateCard[] {
  const useFullCardPool = options?.useFullCardPool ?? true;
  const cardPool = useFullCardPool ? TEST_CARDS : TEST_CARDS.slice(0, Math.min(TEST_CARDS.length, 16));

  // 简化版：每个玩家复制一份测试卡牌
  const deck: DebateCard[] = cardPool.map(card => ({
    ...card,
    id: `${side}-${card.id}`,
  }));

  // 洗牌
  return shuffleArray(deck);
}

function shuffleArray<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function getActiveCardPoolSize(): number {
  return TEST_CARDS.length;
}

export function rollGuestFactions(_main: string, _count: number): string[] {
  return [];
}

export function listAllDebateCardsForLibrary(): DebateCard[] {
  return TEST_CARDS;
}
