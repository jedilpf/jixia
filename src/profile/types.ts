export interface PlayerUnlockState {
  personages: string[];
  factionReputation: Record<string, number>;
  cardCollection: {
    collected: number;
    total: number;
  };
}

export interface PlayerSaveState {
  opportunity: number;
  lastSettlementKey: string | null;
}

export interface PlayerBattleStats {
  winCount: number;
  totalGames: number;
  winStreak: number;
  totalDamage: number;
}

export interface PlayerProfile {
  userId: string;
  level: number;
  exp: number;
  totalExp: number;
  unlock: PlayerUnlockState;
  save: PlayerSaveState;
  stats: PlayerBattleStats;
  version: number;
  updatedAt: number;
}

export const PROFILE_STORAGE_VERSION = 1;

export function createDefaultPlayerProfile(userId = 'local-player-001'): PlayerProfile {
  return {
    userId,
    level: 1,
    exp: 0,
    totalExp: 0,
    unlock: {
      personages: [],
      factionReputation: {
        rujia: 0,
        fajia: 0,
        mojia: 0,
        daojia: 0,
        mingjia: 0,
        yinyang: 0,
      },
      cardCollection: {
        collected: 12,
        total: 160,
      },
    },
    save: {
      opportunity: 0,
      lastSettlementKey: null,
    },
    stats: {
      winCount: 0,
      totalGames: 0,
      winStreak: 0,
      totalDamage: 0,
    },
    version: PROFILE_STORAGE_VERSION,
    updatedAt: Date.now(),
  };
}

export function clonePlayerProfile(profile: PlayerProfile): PlayerProfile {
  return {
    ...profile,
    unlock: {
      ...profile.unlock,
      personages: [...profile.unlock.personages],
      factionReputation: { ...profile.unlock.factionReputation },
      cardCollection: { ...profile.unlock.cardCollection },
    },
    save: { ...profile.save },
    stats: { ...profile.stats },
  };
}

