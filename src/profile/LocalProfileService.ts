import type { ProfileListener, ProfileService, ProfileUpdater } from './ProfileService';
import {
  clonePlayerProfile,
  createDefaultPlayerProfile,
  type PlayerProfile,
  PROFILE_STORAGE_VERSION,
} from './types';

const PROFILE_STORAGE_KEY = 'jixia.profile.service.v1';
const LEGACY_PROGRESS_STORAGE_KEY = 'jixia.mvp.playerProgress.v2';

interface LegacyPlayerProgress {
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

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function normalizeProfile(input: Partial<PlayerProfile> | null | undefined): PlayerProfile {
  const base = createDefaultPlayerProfile(input?.userId ?? 'local-player-001');
  if (!input) return base;

  return {
    ...base,
    ...input,
    level: Number.isFinite(input.level) ? Math.max(1, Math.floor(input.level as number)) : base.level,
    exp: Number.isFinite(input.exp) ? Math.max(0, Math.floor(input.exp as number)) : base.exp,
    totalExp: Number.isFinite(input.totalExp) ? Math.max(0, Math.floor(input.totalExp as number)) : base.totalExp,
    unlock: {
      ...base.unlock,
      ...(input.unlock ?? {}),
      personages: Array.isArray(input.unlock?.personages)
        ? [...input.unlock.personages]
        : base.unlock.personages,
      factionReputation: {
        ...base.unlock.factionReputation,
        ...(input.unlock?.factionReputation ?? {}),
      },
      cardCollection: {
        ...base.unlock.cardCollection,
        ...(input.unlock?.cardCollection ?? {}),
      },
    },
    save: {
      ...base.save,
      ...(input.save ?? {}),
    },
    stats: {
      ...base.stats,
      ...(input.stats ?? {}),
    },
    version: PROFILE_STORAGE_VERSION,
    updatedAt: Date.now(),
  };
}

function fromLegacyProgress(legacy: Partial<LegacyPlayerProgress>): PlayerProfile {
  return normalizeProfile({
    level: legacy.level ?? 1,
    exp: legacy.exp ?? 0,
    totalExp: legacy.totalExp ?? 0,
    unlock: {
      personages: Array.isArray(legacy.unlockedPersonages) ? legacy.unlockedPersonages : [],
      factionReputation: legacy.factionReputation ?? {},
      cardCollection: {
        collected: legacy.collectedCards ?? 0,
        total: legacy.totalCards ?? 0,
      },
    },
    save: {
      opportunity: legacy.opportunity ?? 0,
      lastSettlementKey: legacy.lastSettlementKey ?? null,
    },
    stats: {
      winCount: legacy.winCount ?? 0,
      totalGames: legacy.totalGames ?? 0,
      winStreak: legacy.winStreak ?? 0,
      totalDamage: legacy.totalDamage ?? 0,
    },
  });
}

export class LocalProfileService implements ProfileService {
  private profile: PlayerProfile;
  private listeners = new Set<ProfileListener>();

  constructor() {
    this.profile = this.loadProfile();
  }

  getProfile(): PlayerProfile {
    return clonePlayerProfile(this.profile);
  }

  setProfile(profile: PlayerProfile): PlayerProfile {
    this.profile = normalizeProfile(profile);
    this.persist();
    this.notify();
    return this.getProfile();
  }

  updateProfile(updater: ProfileUpdater): PlayerProfile {
    const current = this.getProfile();
    const updated = normalizeProfile(updater(current));
    this.profile = updated;
    this.persist();
    this.notify();
    return this.getProfile();
  }

  subscribe(listener: ProfileListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  resetProfile(userId = 'local-player-001'): PlayerProfile {
    this.profile = createDefaultPlayerProfile(userId);
    this.persist();
    this.notify();
    return this.getProfile();
  }

  private loadProfile(): PlayerProfile {
    if (!isBrowser()) return createDefaultPlayerProfile();

    try {
      const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
      if (raw) {
        return normalizeProfile(JSON.parse(raw) as Partial<PlayerProfile>);
      }

      // Backward compatibility: migrate existing player progress storage once.
      const legacyRaw = window.localStorage.getItem(LEGACY_PROGRESS_STORAGE_KEY);
      if (legacyRaw) {
        const migrated = fromLegacyProgress(JSON.parse(legacyRaw) as Partial<LegacyPlayerProgress>);
        window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(migrated));
        return migrated;
      }
    } catch {
      // Ignore parse errors and fall back to defaults.
    }

    return createDefaultPlayerProfile();
  }

  private persist(): void {
    if (!isBrowser()) return;
    try {
      window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(this.profile));
    } catch (err) {
      console.error('[profile] Failed to persist profile:', err);
    }
  }

  private notify(): void {
    const snapshot = this.getProfile();
    for (const listener of this.listeners) {
      listener(snapshot);
    }
  }
}

