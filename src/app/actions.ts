import type { PlayerId, ScreenId } from '@/core/types';

export type AppAction =
  | { type: 'RESET_GAME' }
  | { type: 'NAVIGATE'; screen: ScreenId }
  | { type: 'START_MATCH_FLOW' }
  | { type: 'OPEN_TOPIC_PREVIEW' }
  | { type: 'OPEN_FACTION_PICK' }
  | { type: 'LOCK_FACTION'; playerId: PlayerId; factionId: string }
  | { type: 'AUTO_LOCK_FACTION'; playerId: PlayerId }
  | { type: 'ENTER_LOADING' }
  | { type: 'START_BATTLE' }
  | { type: 'ADVANCE_BATTLE_PHASE' }
  | { type: 'PLAY_CARD'; playerId: PlayerId; cardUid: string; zone: 'main' | 'side' }
  | { type: 'PASS_ACTION' }
  | { type: 'RESOLVE_ROUND' };

