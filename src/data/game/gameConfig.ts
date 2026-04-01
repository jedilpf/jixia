import type { GameConfig } from '@/core/types';
import { BALANCE } from '@/data/game/balance';

export const DEFAULT_GAME_CONFIG: GameConfig = {
  maxRounds: BALANCE.maxRounds,
  victoryMomentum: BALANCE.victoryMomentum,
  initialGold: BALANCE.initialGold,
  initialHandSize: BALANCE.initialHandSize,
  issueThreshold: BALANCE.issueThreshold,
  issueTriggerThreshold: BALANCE.issueThreshold,
  manaByRound: [...BALANCE.manaByRound],
  deckSize: BALANCE.deckSize,
  factionDeckCount: BALANCE.factionDeckCount,
  neutralDeckCount: BALANCE.neutralDeckCount,
  maxCardsPerTurn: BALANCE.actionLimitPerTurn,
  maxCardsPerZone: BALANCE.maxCardsPerZone,
  burstCheckEvery: BALANCE.burstCheckEvery,
  burstDirectThreshold: BALANCE.burstDirectThreshold,
  burstProbThreshold: BALANCE.burstProbThreshold,
  factionChoiceCount: BALANCE.factionChoiceCount,
  issueCandidateCount: BALANCE.issueCandidateCount,
};
