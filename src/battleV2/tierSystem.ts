import { DebateCard } from './types';

export type CardStarTier = 1 | 2 | 3;

export interface CardTierUnlockConfig {
  1: number;
  2: number;
  3: number;
}

export interface CardTierDeckQuota {
  maxTwoStar: number;
  maxThreeStar: number;
}

export interface TierQuotaValidationResult {
  ok: boolean;
  usedTwoStar: number;
  usedThreeStar: number;
  maxTwoStar: number;
  maxThreeStar: number;
  errors: string[];
}

export interface TierQuotaEnforcementResult<T> {
  deck: T[];
  removedTwoStar: number;
  removedThreeStar: number;
  usedTwoStar: number;
  usedThreeStar: number;
  maxTwoStar: number;
  maxThreeStar: number;
}

export const DEFAULT_TIER_UNLOCK_LEVELS: CardTierUnlockConfig = {
  1: 1,
  2: 15,
  3: 30,
};

export function resolveStarTierByRarity(rarity?: string): CardStarTier {
  if (rarity === '传说') return 3;
  if (rarity === '稀有' || rarity === '史诗') return 2;
  return 1;
}

export function getRequiredLevelForTier(
  tier: CardStarTier,
  config: CardTierUnlockConfig = DEFAULT_TIER_UNLOCK_LEVELS,
): number {
  return config[tier];
}

export function resolveCardStarTier(card: Pick<DebateCard, 'starTier' | 'rarity'>): CardStarTier {
  if (card.starTier === 1 || card.starTier === 2 || card.starTier === 3) return card.starTier;
  return resolveStarTierByRarity(card.rarity);
}

export function getCardUnlockLevel(
  card: Pick<DebateCard, 'unlockLevel' | 'starTier' | 'rarity'>,
  config: CardTierUnlockConfig = DEFAULT_TIER_UNLOCK_LEVELS,
): number {
  if (typeof card.unlockLevel === 'number' && Number.isFinite(card.unlockLevel)) {
    return Math.max(1, Math.floor(card.unlockLevel));
  }
  return getRequiredLevelForTier(resolveCardStarTier(card), config);
}

export function isCardUnlockedForLevel(
  card: Pick<DebateCard, 'unlockLevel' | 'starTier' | 'rarity'>,
  playerLevel: number,
  config: CardTierUnlockConfig = DEFAULT_TIER_UNLOCK_LEVELS,
): boolean {
  return playerLevel >= getCardUnlockLevel(card, config);
}

export function getDeckTierQuotaForLevel(level: number): CardTierDeckQuota {
  if (level < 15) {
    return { maxTwoStar: 0, maxThreeStar: 0 };
  }
  if (level < 30) {
    return { maxTwoStar: 8, maxThreeStar: 0 };
  }
  return { maxTwoStar: 8, maxThreeStar: 3 };
}

export function validateDeckTierQuota(
  cards: Array<Pick<DebateCard, 'starTier' | 'rarity'>>,
  playerLevel: number,
): TierQuotaValidationResult {
  const quota = getDeckTierQuotaForLevel(playerLevel);
  const usedTwoStar = cards.reduce((count, card) => count + (resolveCardStarTier(card) === 2 ? 1 : 0), 0);
  const usedThreeStar = cards.reduce((count, card) => count + (resolveCardStarTier(card) === 3 ? 1 : 0), 0);
  const errors: string[] = [];

  if (usedTwoStar > quota.maxTwoStar) {
    errors.push(`2★ 数量超限：${usedTwoStar}/${quota.maxTwoStar}`);
  }
  if (usedThreeStar > quota.maxThreeStar) {
    errors.push(`3★ 数量超限：${usedThreeStar}/${quota.maxThreeStar}`);
  }

  return {
    ok: errors.length === 0,
    usedTwoStar,
    usedThreeStar,
    maxTwoStar: quota.maxTwoStar,
    maxThreeStar: quota.maxThreeStar,
    errors,
  };
}

export function enforceDeckTierQuota<T extends Pick<DebateCard, 'starTier' | 'rarity'>>(
  cards: T[],
  playerLevel: number,
): TierQuotaEnforcementResult<T> {
  const quota = getDeckTierQuotaForLevel(playerLevel);
  const kept: T[] = [];
  let usedTwoStar = 0;
  let usedThreeStar = 0;
  let removedTwoStar = 0;
  let removedThreeStar = 0;

  for (const card of cards) {
    const tier = resolveCardStarTier(card);
    if (tier === 3) {
      if (usedThreeStar >= quota.maxThreeStar) {
        removedThreeStar += 1;
        continue;
      }
      usedThreeStar += 1;
      kept.push(card);
      continue;
    }
    if (tier === 2) {
      if (usedTwoStar >= quota.maxTwoStar) {
        removedTwoStar += 1;
        continue;
      }
      usedTwoStar += 1;
      kept.push(card);
      continue;
    }
    kept.push(card);
  }

  return {
    deck: kept,
    removedTwoStar,
    removedThreeStar,
    usedTwoStar,
    usedThreeStar,
    maxTwoStar: quota.maxTwoStar,
    maxThreeStar: quota.maxThreeStar,
  };
}
