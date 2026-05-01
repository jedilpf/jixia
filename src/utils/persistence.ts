import { getProfileService } from '@/profile';
import { clonePlayerProfile, type PlayerProfile } from '@/profile/types';

export interface PlayerProgressState {
  level: number;
  exp: number;
  totalExp: number;
  winCount: number;
  totalGames: number;
  winStreak: number;
  totalDamage: number;
  collectedCards: number;
  totalCards: number;
  opportunity: number;
  lastSettlementKey: string | null;
  unlockedPersonages: string[];
  factionReputation: Record<string, number>;
}

export interface BattleSettlementSummary {
  settlementKey: string;
  playerMomentum: number;
  opportunityGain: number;
  expGain: number;
  goldGain: number;
  won: boolean;
}

export const DEFAULT_PLAYER_PROGRESS: PlayerProgressState = {
  level: 1,
  exp: 0,
  totalExp: 0,
  winCount: 0,
  totalGames: 0,
  winStreak: 0,
  totalDamage: 0,
  collectedCards: 12,
  totalCards: 160,
  opportunity: 0,
  lastSettlementKey: null,
  unlockedPersonages: [],
  factionReputation: {
    rujia: 0,
    fajia: 0,
    mojia: 0,
    daojia: 0,
    mingjia: 0,
    yinyang: 0,
  },
};

export function toPlayerProgressState(profile: PlayerProfile): PlayerProgressState {
  return {
    level: profile.level,
    exp: profile.exp,
    totalExp: profile.totalExp,
    winCount: profile.stats.winCount,
    totalGames: profile.stats.totalGames,
    winStreak: profile.stats.winStreak,
    totalDamage: profile.stats.totalDamage,
    collectedCards: profile.unlock.cardCollection.collected,
    totalCards: profile.unlock.cardCollection.total,
    opportunity: profile.save.opportunity,
    lastSettlementKey: profile.save.lastSettlementKey,
    unlockedPersonages: [...profile.unlock.personages],
    factionReputation: { ...profile.unlock.factionReputation },
  };
}

export function mergePlayerProgressState(
  profile: PlayerProfile,
  progress: Partial<PlayerProgressState>,
): PlayerProfile {
  const next = clonePlayerProfile(profile);

  if (typeof progress.level === 'number') next.level = Math.max(1, Math.floor(progress.level));
  if (typeof progress.exp === 'number') next.exp = Math.max(0, Math.floor(progress.exp));
  if (typeof progress.totalExp === 'number') next.totalExp = Math.max(0, Math.floor(progress.totalExp));

  if (typeof progress.winCount === 'number') next.stats.winCount = Math.max(0, Math.floor(progress.winCount));
  if (typeof progress.totalGames === 'number') next.stats.totalGames = Math.max(0, Math.floor(progress.totalGames));
  if (typeof progress.winStreak === 'number') next.stats.winStreak = Math.max(0, Math.floor(progress.winStreak));
  if (typeof progress.totalDamage === 'number') next.stats.totalDamage = Math.max(0, Math.floor(progress.totalDamage));

  if (typeof progress.collectedCards === 'number') {
    next.unlock.cardCollection.collected = Math.max(0, Math.floor(progress.collectedCards));
  }
  if (typeof progress.totalCards === 'number') {
    next.unlock.cardCollection.total = Math.max(0, Math.floor(progress.totalCards));
  }

  if (typeof progress.opportunity === 'number') next.save.opportunity = Math.max(0, Math.floor(progress.opportunity));
  if (progress.lastSettlementKey !== undefined) next.save.lastSettlementKey = progress.lastSettlementKey;

  if (Array.isArray(progress.unlockedPersonages)) {
    next.unlock.personages = [...progress.unlockedPersonages];
  }
  if (progress.factionReputation && typeof progress.factionReputation === 'object') {
    next.unlock.factionReputation = {
      ...next.unlock.factionReputation,
      ...progress.factionReputation,
    };
  }

  next.updatedAt = Date.now();
  return next;
}

export function loadPlayerProgress(): PlayerProgressState {
  const profile = getProfileService().getProfile();
  return toPlayerProgressState(profile);
}

export function savePlayerProgress(progress: PlayerProgressState): void {
  const service = getProfileService();
  service.updateProfile((current) => mergePlayerProgressState(current, progress));
}

