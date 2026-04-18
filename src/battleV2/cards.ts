/**
 * 测试卡牌数据 - 简化版（20张）
 *
 * 只有两种类型：立论（单位）、施策（法术）
 */

import { DebateCard, Side } from './types';

// === 立论牌（单位） ===
const LILUN_CARDS: DebateCard[] = [
  { id: 'l001', name: '行旅学子', type: '立论', cost: 1, power: 1, hp: 2 },
  { id: 'l002', name: '乡议书吏', type: '立论', cost: 2, power: 2, hp: 2 },
  { id: 'l003', name: '公议守席', type: '立论', cost: 2, power: 2, hp: 3 },
  { id: 'l004', name: '案前执简', type: '立论', cost: 3, power: 3, hp: 2 },
  { id: 'l005', name: '守成之议', type: '立论', cost: 3, power: 2, hp: 4 },
  { id: 'l006', name: '学堂弟子', type: '立论', cost: 1, power: 1, hp: 3 },
  { id: 'l007', name: '经史研者', type: '立论', cost: 2, power: 3, hp: 2 },
  { id: 'l008', name: '大儒之论', type: '立论', cost: 4, power: 4, hp: 3 },
  { id: 'l009', name: '百家宗师', type: '立论', cost: 5, power: 5, hp: 5 },
  { id: 'l010', name: '墨家匠人', type: '立论', cost: 2, power: 2, hp: 2 },
];

// === 施策牌（法术） ===
const SHICE_CARDS: DebateCard[] = [
  { id: 's001', name: '两端衡量', type: '施策', cost: 1, power: 0, hp: 0, effectKind: 'draw', effectValue: 1 },
  { id: 's002', name: '驳杂去芜', type: '施策', cost: 2, power: 0, hp: 0, effectKind: 'damage', effectValue: 3 },
  { id: 's003', name: '收束成文', type: '施策', cost: 2, power: 0, hp: 0, effectKind: 'draw', effectValue: 2 },
  { id: 's004', name: '旁征博引', type: '施策', cost: 3, power: 0, hp: 0, effectKind: 'heal', effectValue: 2 },
  { id: 's005', name: '公论成势', type: '施策', cost: 4, power: 0, hp: 0, effectKind: 'damage', effectValue: 5 },
  { id: 's006', name: '急辩先声', type: '施策', cost: 1, power: 0, hp: 0, effectKind: 'damage', effectValue: 2 },
  { id: 's007', name: '稳守阵地', type: '施策', cost: 2, power: 0, hp: 0, effectKind: 'heal', effectValue: 3 },
  { id: 's008', name: '连珠发问', type: '施策', cost: 3, power: 0, hp: 0, effectKind: 'damage', effectValue: 4 },
  { id: 's009', name: '深思缓行', type: '施策', cost: 1, power: 0, hp: 0, effectKind: 'draw', effectValue: 2 },
  { id: 's010', name: '一语定论', type: '施策', cost: 5, power: 0, hp: 0, effectKind: 'damage', effectValue: 8 },
];

// === 全部测试卡牌 ===
export const TEST_CARDS: DebateCard[] = [...LILUN_CARDS, ...SHICE_CARDS];

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
  // TODO: useFullCardPool 用于控制是否使用完整卡池，目前暂未实现
  // 简化版：每个玩家复制一份测试卡牌
  const deck: DebateCard[] = TEST_CARDS.map(card => ({
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