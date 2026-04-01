import { FRAMEWORK_FACTION_NAMES } from './factions';

export interface FactionScaleTarget {
  // Planning target for content expansion
  targetFactionCount: number;
  cardsPerFaction: number;
  genericCardCount: number;
}

export interface DeckBuildDefaults {
  // How many cards to pull from the main faction pool
  mainFactionCardCount: number;
  // How many cards to pull per guest faction
  guestFactionCardCount: number;
  // How many generic/common cards to pull
  commonCardCount: number;
  // Result deck size
  deckSize: number;
}

export interface CardPoolConfig {
  enabledFactions: string[];
  genericCardIds: string[];
}

export const DEFAULT_FACTION_SCALE_TARGET: FactionScaleTarget = {
  targetFactionCount: 16,
  cardsPerFaction: 8,
  genericCardCount: 12,
};

export const DEFAULT_DECK_BUILD_DEFAULTS: DeckBuildDefaults = {
  mainFactionCardCount: DEFAULT_FACTION_SCALE_TARGET.cardsPerFaction,
  guestFactionCardCount: 1,
  // Keep current runtime behavior by default; configurable via options.
  commonCardCount: 8,
  deckSize: 24,
};

export const DEFAULT_CARD_POOL_CONFIG: CardPoolConfig = {
  enabledFactions: [...FRAMEWORK_FACTION_NAMES, '通用'],
  genericCardIds: [
    'xinglvxuezi',
    'xiangyishuli',
    'gongyishouxi',
    'anqianzhijian',
    'liangduanhengliang',
    'gengxierlun',
    'shoushuchengwen',
    'bozaquwu',
    'pangzhengboyin',
    'gonglunchengshi',
    'shouchengzhiyi',
    'jiantingzeming',
  ],
};

export function normalizeEnabledFactions(enabled?: string[]): string[] {
  const source = enabled?.length ? enabled : DEFAULT_CARD_POOL_CONFIG.enabledFactions;
  return Array.from(new Set(source));
}
