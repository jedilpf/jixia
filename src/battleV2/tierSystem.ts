/**
 * 卡牌分级系统 - 三档星级体系
 * 根据 docs/project/card-tier-3star-system-plan-20260402.md 实现
 *
 * 星级定义：
 * - 1★ 基础卡：常见稀有度，规则直观、强度稳定
 * - 2★ 进阶卡：稀有/史诗稀有度，有联动/节奏变化
 * - 3★ 核心卡：传说稀有度，局势改写能力强
 */

import { DebateCard } from './types';

export type CardStarTier = 1 | 2 | 3;

/**
 * 根据稀有度解析星级
 * 常见 -> 1★
 * 稀有/史诗 -> 2★
 * 传说 -> 3★
 */
export function resolveStarTierByRarity(rarity?: string): CardStarTier {
  switch (rarity) {
    case '常见':
      return 1;
    case '稀有':
    case '史诗':
      return 2;
    case '传说':
      return 3;
    default:
      return 1;
  }
}

/**
 * 获取卡牌星级标签（用于UI显示）
 * 返回：一等/二等/三等
 */
export function getCardTierLabel(card: DebateCard | { id: string; name: string; rarity?: string }): string {
  const rarity = 'rarity' in card ? card.rarity : undefined;
  const tier = resolveStarTierByRarity(rarity);

  // 使用中文数字表示等级
  const tierLabels: Record<CardStarTier, string> = {
    1: '一等',
    2: '二等',
    3: '三等',
  };

  return tierLabels[tier];
}

/**
 * 获取卡牌等级杠数显示（用于卡牌UI）
 * 常见 -> |
 * 稀有 -> ||
 * 史诗 -> |||
 * 传说 -> ||||
 */
export function getCardTierBars(rarity?: string): string {
  switch (rarity) {
    case '常见':
      return '|';
    case '稀有':
      return '||';
    case '史诗':
      return '|||';
    case '传说':
      return '||||';
    default:
      return '|';
  }
}

/**
 * 获取卡牌星级数字
 */
export function getCardStarTier(card: { rarity?: string }): CardStarTier {
  return resolveStarTierByRarity(card.rarity);
}

// === 牌组配额校验（预留接口）===

export function validateDeckTierQuota(_deck: DebateCard[], _level: number): { ok: boolean; errors: string[] } {
  return { ok: true, errors: [] };
}

export function enforceDeckTierQuota(deck: DebateCard[]): DebateCard[] {
  return deck;
}

export function getCardUnlockLevel(_card: DebateCard): number {
  return 1;
}

export function isCardUnlockedForLevel(_card: DebateCard, _level: number): boolean {
  return true;
}

export function getDeckTierQuotaForLevel(_level: number): { maxTwoStar: number; maxThreeStar: number } {
  return { maxTwoStar: 99, maxThreeStar: 99 };
}